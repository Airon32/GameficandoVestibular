import {
  EducationalQuestion,
  InfiniteSessionConfig,
  InfiniteSessionState,
  InfiniteSessionAnswerRecord,
  QuestionReport,
  QuestionReportReason,
  UserState,
  SubjectId,
} from '../types';
import { HybridQuestionEngine } from './HybridQuestionEngine';
import { XPManager } from './XPManager';
import { ErrorNotebookEngine } from './ErrorNotebookEngine';
import { SubjectMasteryEngine } from './SubjectMasteryEngine';
import { LevelManager } from './LevelManager';
import { RankManager } from './RankManager';

export class QuestionSessionManager {
  private static activeSession: InfiniteSessionState | null = null;
  private static sessionConfig: InfiniteSessionConfig = {
    sessionType: 'infinite',
    difficultyMode: 'adaptive',
  };
  private static questionBuffer: EducationalQuestion[] = [];
  private static isGenerating: boolean = false;

  /**
   * Initializes and starts a new Infinite or Finite Training Session
   */
  public static startSession(
    config: InfiniteSessionConfig,
    userState?: UserState
  ): { session: InfiniteSessionState; firstQuestion: EducationalQuestion } {
    this.sessionConfig = config;
    const sessionId = `session_${Date.now()}_${Math.floor(Math.random() * 10000)}`;

    this.activeSession = {
      sessionId,
      sessionType: config.sessionType,
      subjectId: config.subjectId || 'mixed',
      topicId: config.topicId,
      questionsAnswered: 0,
      correctAnswers: 0,
      wrongAnswers: 0,
      currentStreak: 0,
      maxStreak: 0,
      sessionXP: 0,
      averageDifficulty: 0,
      averageResponseTimeMs: 0,
      startedAt: Date.now(),
      pausedAt: null,
      isPaused: false,
      endedAt: null,
      answers: [],
    };

    // Preload initial buffer of 10 questions
    this.questionBuffer = HybridQuestionEngine.preloadBatch(
      {
        subjectId: config.subjectId,
        topicId: config.topicId,
        userState,
        difficultyMode: config.difficultyMode,
      },
      8
    );

    const firstQuestion =
      this.questionBuffer.shift() ||
      HybridQuestionEngine.getNextQuestion({
        subjectId: config.subjectId,
        topicId: config.topicId,
        userState,
        difficultyMode: config.difficultyMode,
      });

    return { session: this.activeSession, firstQuestion };
  }

  /**
   * Returns the current session state
   */
  public static getActiveSession(): InfiniteSessionState | null {
    return this.activeSession;
  }

  /**
   * Pauses the active session
   */
  public static pauseSession(): void {
    if (this.activeSession && !this.activeSession.isPaused) {
      this.activeSession.isPaused = true;
      this.activeSession.pausedAt = Date.now();
    }
  }

  /**
   * Resumes the paused session
   */
  public static resumeSession(): void {
    if (this.activeSession && this.activeSession.isPaused) {
      this.activeSession.isPaused = false;
      this.activeSession.pausedAt = null;
    }
  }

  /**
   * Submits an answer to the current question, updates XP, streaks, mastery, and error notebook
   */
  public static submitAnswer(
    question: EducationalQuestion,
    userAnswer: any,
    isCorrect: boolean,
    timeTakenMs: number,
    currentUserState: UserState
  ): {
    session: InfiniteSessionState;
    updatedUserState: UserState;
    xpResult: ReturnType<typeof XPManager.calculateQuestionXP>;
    nextQuestion: EducationalQuestion;
  } {
    if (!this.activeSession) {
      // Auto-recover session if lost
      this.startSession(this.sessionConfig, currentUserState);
    }

    const session = this.activeSession!;

    // 1. Calculate Central Question XP
    const prevStreak = session.currentStreak;
    const newStreak = isCorrect ? prevStreak + 1 : 0;

    const userTopicMastery =
      currentUserState.subjectsMastery?.[question.subjectId]?.topicMastery?.[question.topicId]
        ?.masteryPercent || 0;

    const xpResult = XPManager.calculateQuestionXP({
      difficulty: question.calibratedDifficulty || question.difficulty,
      timeTakenMs,
      currentStreak: prevStreak,
      isCorrect,
      gameMode: session.sessionType,
      userMastery: userTopicMastery,
      isManuallySelectedLowDifficulty: this.sessionConfig.difficultyMode === 'easy',
    });

    // 2. Update Session State
    session.questionsAnswered += 1;
    if (isCorrect) {
      session.correctAnswers += 1;
      session.currentStreak = newStreak;
      session.maxStreak = Math.max(session.maxStreak, newStreak);
      session.sessionXP += xpResult.finalXP;
    } else {
      session.wrongAnswers += 1;
      session.currentStreak = 0;
    }

    const totalTime =
      session.averageResponseTimeMs * (session.questionsAnswered - 1) + timeTakenMs;
    session.averageResponseTimeMs = Math.round(totalTime / session.questionsAnswered);

    const prevDiffTotal =
      session.averageDifficulty * (session.questionsAnswered - 1) + (question.difficulty || 30);
    session.averageDifficulty = Math.round(prevDiffTotal / session.questionsAnswered);

    const record: InfiniteSessionAnswerRecord = {
      questionId: question.id,
      subjectId: question.subjectId,
      topicId: question.topicId,
      prompt: question.prompt,
      userAnswer,
      correctAnswer: (question as any).correctOptionId || (question as any).correctAnswer,
      isCorrect,
      timeTakenMs,
      xpEarned: xpResult.finalXP,
      baseXP: xpResult.baseXP,
      difficulty: question.difficulty || 30,
      speedModifier: xpResult.speedModifier,
      streakMultiplier: xpResult.streakMultiplier,
    };
    session.answers.push(record);

    // 3. Update UserState Mastery, Error Notebook, Stats
    let updatedUserState = { ...currentUserState };

    // Update Global XP
    if (xpResult.finalXP > 0) {
      updatedUserState.totalXP = (updatedUserState.totalXP || 0) + xpResult.finalXP;
      updatedUserState.weeklyXP = (updatedUserState.weeklyXP || 0) + xpResult.finalXP;
    }

    const levelData = LevelManager.getLevelDataFromTotalXP(updatedUserState.totalXP || 0);
    updatedUserState.level = levelData.level;
    updatedUserState.currentLevelXP = levelData.currentLevelXP;
    updatedUserState.xpForNextLevel = levelData.xpForNextLevel;
    updatedUserState.levelProgressPercent = levelData.levelProgressPercent;
    updatedUserState.rank = RankManager.getRankForLevel(levelData.level);
    updatedUserState.combo = newStreak;
    updatedUserState.maxCombo = Math.max(updatedUserState.maxCombo || 0, newStreak);
    updatedUserState.updatedAt = Date.now();

    // Update Overall Stats
    const prevStats: UserState['stats'] = updatedUserState.stats || {
      totalQuestions: 0,
      totalCorrect: 0,
      totalWrong: 0,
      accuracy: 0,
      avgTimeMs: 0,
      totalTrainingTimeMs: 0,
      byOperation: {} as any,
      dailyActivity: {},
    };

    const newTotalQ = prevStats.totalQuestions + 1;
    const newTotalCorrect = prevStats.totalCorrect + (isCorrect ? 1 : 0);
    const newTotalWrong = prevStats.totalWrong + (isCorrect ? 0 : 1);
    const newAccuracy = Math.round((newTotalCorrect / newTotalQ) * 100);

    // Update By Subject stats
    const bySub = { ...(prevStats.bySubjectStats || {}) };
    const subStat = { ...(bySub[question.subjectId] || { solved: 0, correct: 0, totalXP: 0, maxStreak: 0 }) };
    subStat.solved += 1;
    if (isCorrect) subStat.correct += 1;
    subStat.totalXP += xpResult.finalXP;
    subStat.maxStreak = Math.max(subStat.maxStreak, newStreak);
    bySub[question.subjectId] = subStat;

    updatedUserState.stats = {
      ...prevStats,
      totalQuestions: newTotalQ,
      totalCorrect: newTotalCorrect,
      totalWrong: newTotalWrong,
      accuracy: newAccuracy,
      lifetimeQuestionsCount: (prevStats.lifetimeQuestionsCount || 0) + 1,
      questionsToday: (prevStats.questionsToday || 0) + 1,
      questionsThisWeek: (prevStats.questionsThisWeek || 0) + 1,
      totalTrainingTimeMs: prevStats.totalTrainingTimeMs + timeTakenMs,
      bySubjectStats: bySub,
    };

    // Update Topic Mastery
    const masteryResult = SubjectMasteryEngine.recordQuestionResult(
      updatedUserState,
      {
        subjectId: question.subjectId,
        topicId: question.topicId,
        isCorrect,
        questionDifficulty: question.difficulty || 30,
        timeTakenMs,
      }
    );
    updatedUserState.subjectsMastery = masteryResult.newSubjectsMap;

    // Update Error Notebook if wrong
    if (!isCorrect) {
      const correctAns = (question as any).correctOptionId || (question as any).correctAnswer || '';
      updatedUserState.errorNotebook = ErrorNotebookEngine.recordMistake(
        updatedUserState,
        question,
        userAnswer,
        correctAns
      );
    }

    // 4. Fetch Next Question from buffer with auto-replenishment
    if (this.questionBuffer.length < 3 && !this.isGenerating) {
      this.isGenerating = true;
      setTimeout(() => {
        const moreQuestions = HybridQuestionEngine.preloadBatch(
          {
            subjectId: this.sessionConfig.subjectId,
            topicId: this.sessionConfig.topicId,
            userState: updatedUserState,
            difficultyMode: this.sessionConfig.difficultyMode,
          },
          5
        );
        this.questionBuffer.push(...moreQuestions);
        this.isGenerating = false;
      }, 0);
    }

    const nextQuestion =
      this.questionBuffer.shift() ||
      HybridQuestionEngine.getNextQuestion({
        subjectId: this.sessionConfig.subjectId,
        topicId: this.sessionConfig.topicId,
        userState: updatedUserState,
        difficultyMode: this.sessionConfig.difficultyMode,
      });

    return {
      session,
      updatedUserState,
      xpResult,
      nextQuestion,
    };
  }

  /**
   * Reports a question and triggers automatic quarantine
   */
  public static reportQuestion(
    question: EducationalQuestion,
    reason: QuestionReportReason,
    userId: string,
    userComment?: string
  ): QuestionReport {
    // Flag in question engine immediately
    HybridQuestionEngine.flagQuestion(question.id);

    const report: QuestionReport = {
      id: `report_${Date.now()}_${Math.floor(Math.random() * 1000)}`,
      questionId: question.id,
      subjectId: question.subjectId,
      topicId: question.topicId,
      reason,
      userComment,
      reportedByUserId: userId,
      reportedAt: Date.now(),
      questionPrompt: question.prompt,
    };

    return report;
  }

  /**
   * Ends and finalizes the active session, returning detailed summary
   */
  public static endSession(): InfiniteSessionState | null {
    if (!this.activeSession) return null;

    this.activeSession.endedAt = Date.now();
    this.activeSession.isPaused = false;
    const finishedSession = { ...this.activeSession };

    this.activeSession = null;
    this.questionBuffer = [];

    return finishedSession;
  }
}
