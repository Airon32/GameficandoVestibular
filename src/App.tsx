import React, { useState, useEffect, useRef, useCallback, lazy, Suspense } from 'react';
import { Header } from './components/Header';
import { HomeScreen } from './components/HomeScreen';
import { CalculatorScreen } from './components/CalculatorScreen';
import { StatsDashboard } from './components/StatsDashboard';
import { CalendarView } from './components/CalendarView';
import { AchievementsView } from './components/AchievementsView';
import { GameModeSelector } from './components/GameModeSelector';
import { SettingsModal } from './components/SettingsModal';
import { PlayerProfileModal } from './components/PlayerProfileModal';
import { AuthModal } from './components/AuthModal';
import { OnboardingModal } from './components/OnboardingModal';
import { LevelUpModal } from './components/LevelUpModal';
import { RankUpModal } from './components/RankUpModal';
import { InfiniteCelebrationModal } from './components/InfiniteCelebrationModal';
import { TestRunnerModal } from './components/TestRunnerModal';
import { AndroidInstallModal } from './components/AndroidInstallModal';
import { AccountRecoveryModal } from './components/AccountRecoveryModal';
import { EducationalGameScreen } from './components/EducationalGameScreen';
import { SimuladoScreen } from './components/SimuladoScreen';
import { SubjectDetailScreen } from './components/SubjectDetailScreen';
import { ErrorNotebookScreen } from './components/ErrorNotebookScreen';
import { SpacedRepetitionScreen } from './components/SpacedRepetitionScreen';
import { InfiniteTrainingScreen } from './components/InfiniteTrainingScreen';
import { StudyGuidesScreen } from './components/StudyGuidesScreen';
import { EnglishLearningEngine } from './engines/EnglishLearningEngine';

const EnglishHubScreen = lazy(() =>
  import('./components/english/EnglishHubScreen').then((mod) => ({ default: mod.EnglishHubScreen }))
);

import {
  Achievement,
  GameMode,
  InfiniteStats,
  OperationType,
  Question,
  RecentAnswerRecord,
  SyncEvent,
  UserSettings,
  UserState,
  EducationalQuestion,
  SubjectId,
  ExamProfile,
  SimuladoSession,
  InfiniteSessionConfig,
} from './types';
import { QuestionGenerator } from './engines/QuestionGenerator';
import { DifficultyEngine } from './engines/DifficultyEngine';
import { XPManager } from './engines/XPManager';
import { LevelManager } from './engines/LevelManager';
import { RankManager } from './engines/RankManager';
import { StreakManager } from './engines/StreakManager';
import { AchievementEngine } from './engines/AchievementEngine';
import { SubjectMasteryEngine } from './engines/SubjectMasteryEngine';
import { ErrorNotebookEngine } from './engines/ErrorNotebookEngine';
import { SpacedRepetitionEngine } from './engines/SpacedRepetitionEngine';
import { SimuladoEngine } from './engines/SimuladoEngine';
import { QuestionBankService } from './data/questionBank';
import { EXAM_PROFILES } from './config/examProfilesConfig';
import { StorageService, createDefaultUserState, setActiveUserId, getActiveUserId } from './services/storageService';
import { AuthService } from './services/authService';
import { CloudStorageService } from './services/firebase';
import { soundService } from './services/soundService';
import { ApiClient } from './services/apiClient';
import { DIFFICULTY_CONFIG } from './config/difficultyConfig';
import { getCurrentWeekId } from './utils/progressPeriod';

export default function App() {
  const [userState, setUserState] = useState<UserState>(() => StorageService.loadState());
  const [activeTab, setActiveTab] = useState<'home' | 'game' | 'stats' | 'calendar' | 'achievements'>('home');
  const [gameMode, setGameMode] = useState<GameMode>('mixed');

  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<number>(30);
  const [survivalLives, setSurvivalLives] = useState<number>(3);
  const [consecutiveMistakes, setConsecutiveMistakes] = useState<number>(0);

  const [isCloudSyncing, setIsCloudSyncing] = useState<boolean>(false);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | undefined>(undefined);

  // Account and single-player profile modals
  const [authUser, setAuthUser] = useState<any>(null);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [showRecoveryModal, setShowRecoveryModal] = useState<boolean>(false);
  const [showOnboardingModal, setShowOnboardingModal] = useState<boolean>(false);
  const [showPlayerProfileModal, setShowPlayerProfileModal] = useState<boolean>(false);

  const [feedback, setFeedback] = useState<{
    visible: boolean;
    isCorrect: boolean;
    correctAnswer?: number;
    xpEarned?: number;
    baseXP?: number;
    streakMultiplier?: number;
    streakBonusXP?: number;
    message?: string;
  } | null>(null);

  // System Modals
  const [showModeSelector, setShowModeSelector] = useState<boolean>(false);
  const [showSettings, setShowSettings] = useState<boolean>(false);
  const [showTests, setShowTests] = useState<boolean>(false);
  const [showAndroidInstall, setShowAndroidInstall] = useState<boolean>(false);
  const [levelUpData, setLevelUpData] = useState<{ prev: number; next: number } | null>(null);
  const [rankUpData, setRankUpData] = useState<{ prev: string; next: string } | null>(null);
  const [infiniteCelebrationData, setInfiniteCelebrationData] = useState<InfiniteStats | null>(null);

  // Vestibular Hub Sub-screens & Sessions
  const [activeEducationalSession, setActiveEducationalSession] = useState<{
    questions: EducationalQuestion[];
    gameMode: GameMode;
    subjectId?: SubjectId;
    topicId?: string;
  } | null>(null);
  const [activeSimuladoProfile, setActiveSimuladoProfile] = useState<ExamProfile | null>(null);
  const [selectedSubjectDetail, setSelectedSubjectDetail] = useState<SubjectId | null>(null);
  const [showErrorNotebook, setShowErrorNotebook] = useState<boolean>(false);
  const [showSpacedRepetition, setShowSpacedRepetition] = useState<boolean>(false);
  const [activeInfiniteConfig, setActiveInfiniteConfig] = useState<InfiniteSessionConfig | null>(null);
  const [showStudyGuides, setShowStudyGuides] = useState<boolean>(false);
  const [activeStudyGuideId, setActiveStudyGuideId] = useState<string | null>(null);
  const [showEnglishHub, setShowEnglishHub] = useState<boolean>(false);
  const [englishImmersive, setEnglishImmersive] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const questionStartTimeRef = useRef<number>(Date.now());
  const answerSubmissionPendingRef = useRef<boolean>(false);
  const serverIssuedQuestionRef = useRef<boolean>(false);
  const userStateRef = useRef<UserState>(userState);
  userStateRef.current = userState;

  // Listen to Firebase Auth state
  useEffect(() => {
    const unsubAuth = AuthService.onAuthStateChanged(async (firebaseUser) => {
      setAuthUser(firebaseUser);
      if (firebaseUser) {
        const previousState = userStateRef.current;
        setActiveUserId(firebaseUser.uid);
        let loaded = StorageService.loadState(firebaseUser.uid);

        // 1. If previous local state (e.g. before login) had progress, preserve and merge it
        if (
          previousState &&
          (previousState.totalXP > loaded.totalXP ||
            (previousState.stats?.totalQuestions || 0) > (loaded.stats?.totalQuestions || 0) ||
            Object.keys(previousState.achievements || {}).length > Object.keys(loaded.achievements || {}).length)
        ) {
          loaded = StorageService.mergeUserStates(loaded, previousState);
        }

        // 2. Automatically look up any pre-existing cloud profile matching email or name
        try {
          const searchIdentifier = firebaseUser.email || firebaseUser.displayName || '';
          if (searchIdentifier) {
            const matched = await CloudStorageService.findUserByEmailOrCode(searchIdentifier);
            if (
              matched &&
              (matched.totalXP > loaded.totalXP ||
                (matched.stats?.totalQuestions || 0) > (loaded.stats?.totalQuestions || 0))
            ) {
              loaded = StorageService.mergeUserStates(loaded, matched);
              if (matched.displayName && matched.displayName !== 'Matemático') {
                loaded.displayName = matched.displayName;
                loaded.name = matched.displayName;
              }
              if (matched.username && !matched.username.startsWith('@user_')) {
                loaded.username = matched.username;
              }
              if (matched.avatar) loaded.avatar = matched.avatar;
              if (matched.selectedTitle) loaded.selectedTitle = matched.selectedTitle;
            }
          }
        } catch {
          // Non-blocking lookup
        }

        loaded.id = firebaseUser.uid;
        loaded.email = firebaseUser.email || loaded.email;
        if (firebaseUser.displayName && (!loaded.displayName || loaded.displayName === 'Matemático')) {
          loaded.displayName = firebaseUser.displayName;
          loaded.name = firebaseUser.displayName;
        }

        setUserState(loaded);
        StorageService.saveState(loaded);

        // Sync with Firestore Cloud Database for this specific account
        await StorageService.syncWithCloud(loaded, (merged) => {
          setUserState(merged);
          // Check if onboarding is needed
          if (!merged.username || merged.username.startsWith('@user_') || merged.username.length < 4) {
            setShowOnboardingModal(true);
          }
        });

      }
    });

    return () => unsubAuth();
  }, []);

  // Cloud Sync subscription
  useEffect(() => {
    const unsubscribe = StorageService.subscribeSync((syncing, lastSync) => {
      setIsCloudSyncing(syncing);
      if (lastSync) setLastSyncedAt(lastSync);
    });

    // Initial sync
    StorageService.syncWithCloud(userStateRef.current, (mergedState) => {
      setUserState(mergedState);
    });

    // Background sync with express server if running
    ApiClient.syncWithServer(userStateRef.current).then((res) => {
      if (res.success && res.serverState) {
        if (res.serverState.totalXP > userStateRef.current.totalXP) {
          setUserState(res.serverState);
          StorageService.saveState(res.serverState);
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  // Save state on change
  useEffect(() => {
    StorageService.saveState(userState);
  }, [userState]);

  // Determine enabled operations for current mode
  const getActiveOperations = useCallback((): OperationType[] => {
    if (gameMode === 'addition') return ['addition'];
    if (gameMode === 'subtraction') return ['subtraction'];
    if (gameMode === 'multiplication') return ['multiplication'];
    if (gameMode === 'division') return ['division'];
    return userState.settings.enabledOperations && userState.settings.enabledOperations.length > 0
      ? userState.settings.enabledOperations
      : ['addition', 'subtraction', 'multiplication', 'division'];
  }, [gameMode, userState.settings.enabledOperations]);

  // Generate next question with target difficulty profile
  const spawnNextQuestion = useCallback(async () => {
    const ops = getActiveOperations();
    const difficultyProfile = DifficultyEngine.computeTargetDifficulty(userStateRef.current, ops);
    let newQ: Question;
    if (authUser) {
      const issued = await ApiClient.issueSoloQuestion({
        operations: ops,
        difficultyScore: difficultyProfile.targetDifficultyScore,
      });
      if (issued.success && issued.question) {
        newQ = { ...issued.question, correctAnswer: Number.NaN } as Question;
        serverIssuedQuestionRef.current = true;
      } else {
        newQ = QuestionGenerator.generateQuestion(ops, difficultyProfile);
        serverIssuedQuestionRef.current = false;
      }
    } else {
      newQ = QuestionGenerator.generateQuestion(ops, difficultyProfile);
      serverIssuedQuestionRef.current = false;
    }
    setCurrentQuestion(newQ);
    const timerDuration = userStateRef.current.settings.timerDurationSeconds || 30;
    setTimeRemaining(timerDuration);
    questionStartTimeRef.current = Date.now();
    setFeedback(null);
  }, [authUser, getActiveOperations]);

  // Start question on mount or mode change
  useEffect(() => {
    spawnNextQuestion();
  }, [gameMode, spawnNextQuestion]);

  // High precision timer loop
  useEffect(() => {
    if (!currentQuestion || feedback?.visible) {
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    const timerTotal = userState?.settings?.timerDurationSeconds || 30;

    timerRef.current = setInterval(() => {
      const elapsedSeconds = (Date.now() - questionStartTimeRef.current) / 1000;
      const remaining = Math.max(0, timerTotal - elapsedSeconds);

      setTimeRemaining(remaining);

      if (remaining <= 0) {
        if (timerRef.current) clearInterval(timerRef.current);
        handleTimeout();
      }
    }, 100);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion?.id, feedback?.visible, userState?.settings?.timerDurationSeconds]);

  // Timeout handler
  const handleTimeout = () => {
    if (!currentQuestion || feedback?.visible) return;
    processAnswerSubmission(null, true);
  };

  // Main Answer Processing
  const processAnswerSubmission = async (userAnswer: number | null, isTimeout: boolean = false) => {
    if (!currentQuestion || feedback?.visible || answerSubmissionPendingRef.current) return;
    answerSubmissionPendingRef.current = true;

    const now = Date.now();
    const timeTakenMs = isTimeout ? (userState.settings.timerDurationSeconds || 30) * 1000 : now - questionStartTimeRef.current;
    let isCorrect = !isTimeout && userAnswer === currentQuestion.correctAnswer;
    let serverXP: number | null = null;
    let validatedCorrectAnswer = currentQuestion.correctAnswer;

    // Signed-in private-session answers may be validated by the server. It derives the
    // correct answer from the expression and never accepts correctAnswer from the browser.
    if (authUser && serverIssuedQuestionRef.current) {
      const verification = await ApiClient.verifyAnswerOnServer({
        questionId: currentQuestion.id,
        submissionId: `answer_${crypto.randomUUID()}`,
        userAnswer,
        startedAt: questionStartTimeRef.current,
        answeredAt: now,
        timedOut: isTimeout,
      });
      if (!verification.valid) {
        setFeedback({
          visible: true,
          isCorrect: false,
          correctAnswer: currentQuestion.correctAnswer,
          xpEarned: 0,
          baseXP: 0,
          streakMultiplier: 1,
          streakBonusXP: 0,
          message: verification.reason || 'Não foi possível validar a resposta.',
        });
        setTimeout(() => {
          answerSubmissionPendingRef.current = false;
          spawnNextQuestion();
        }, 1300);
        return;
      }
      isCorrect = verification.isCorrect;
      serverXP = verification.xpEarned;
      validatedCorrectAnswer = verification.correctAnswer ?? validatedCorrectAnswer;
    } else if (authUser) {
      // Offline signed-in play remains available, but does not affect verified XP.
      serverXP = 0;
    }

    // Update consecutive mistakes counter
    const currentMistakes = isCorrect ? 0 : consecutiveMistakes + 1;
    setConsecutiveMistakes(currentMistakes);

    // 1. Calculate Progressive XP
    const currentStreakBeforeAnswer = userState.combo;
    const xpCalc = XPManager.calculateXP(isCorrect, timeTakenMs, currentStreakBeforeAnswer);
    const xpEarned = serverXP ?? xpCalc.xp;

    // 2. Sound & Haptic
    if (userState.settings.soundEnabled) {
      if (isCorrect) {
        soundService.playCorrect(userState.combo + 1, userState.settings.soundVolume);
      } else {
        soundService.playWrong(userState.settings.soundVolume);
      }
    }
    if (userState.settings.vibrationEnabled) {
      soundService.triggerHaptic(isCorrect ? 'success' : 'error');
    }

    // 3. Update Combo & Streak Stats
    const newCombo = isCorrect ? userState.combo + 1 : 0;
    const newMaxCombo = Math.max(userState.maxCombo, newCombo);

    const prevStreakStats = userState.streakStats || {
      xpFromStreaksTotal: 0,
      highestMultiplierReached: 1.0,
      milestoneHits: { 5: 0, 10: 0, 20: 0, 40: 0, 80: 0, 160: 0, 320: 0, 640: 0, 1000: 0 },
    };

    const newMilestoneHits = { ...(prevStreakStats.milestoneHits || {}) };
    if (isCorrect && [5, 10, 20, 40, 80, 160, 320, 640, 1000].includes(newCombo)) {
      newMilestoneHits[newCombo] = (newMilestoneHits[newCombo] || 0) + 1;
    }

    const updatedStreakStats = {
      xpFromStreaksTotal: prevStreakStats.xpFromStreaksTotal + (isCorrect ? xpCalc.streakBonusXP : 0),
      highestMultiplierReached: Math.max(
        prevStreakStats.highestMultiplierReached,
        isCorrect ? xpCalc.streakMultiplier : 1.0
      ),
      milestoneHits: newMilestoneHits,
    };

    if (gameMode === 'survival' && !isCorrect) {
      const nextLives = survivalLives - 1;
      setSurvivalLives(nextLives);
      if (nextLives <= 0) {
        setTimeout(() => setSurvivalLives(3), 2000);
      }
    }

    // 4. Update Operation Stats
    const currentOp = currentQuestion.operation === 'mixed_expression' ? 'addition' : currentQuestion.operation;
    const prevOpStat = userState.stats.byOperation[currentOp] || {
      totalQuestions: 0,
      correct: 0,
      wrong: 0,
      accuracy: 0,
      avgTimeMs: 0,
      difficultyScore: 1,
    };

    const newOpTotal = prevOpStat.totalQuestions + 1;
    const newOpCorrect = prevOpStat.correct + (isCorrect ? 1 : 0);
    const newOpWrong = prevOpStat.wrong + (isCorrect ? 0 : 1);
    const newOpAccuracy = Math.round((newOpCorrect / newOpTotal) * 100);
    const newOpAvgTime = Math.round((prevOpStat.avgTimeMs * prevOpStat.totalQuestions + timeTakenMs) / newOpTotal);
    const newOpDifficulty = DifficultyEngine.updateOperationDifficulty(
      prevOpStat.difficultyScore,
      isCorrect,
      timeTakenMs,
      currentMistakes
    );

    const updatedByOp = {
      ...userState.stats.byOperation,
      [currentOp]: {
        totalQuestions: newOpTotal,
        correct: newOpCorrect,
        wrong: newOpWrong,
        accuracy: newOpAccuracy,
        avgTimeMs: newOpAvgTime,
        difficultyScore: newOpDifficulty,
      },
    };

    // 5. Update Global Stats
    const newTotalQuestions = userState.stats.totalQuestions + 1;
    const newTotalCorrect = userState.stats.totalCorrect + (isCorrect ? 1 : 0);
    const newTotalWrong = userState.stats.totalWrong + (isCorrect ? 0 : 1);
    const newGlobalAccuracy = Math.round((newTotalCorrect / newTotalQuestions) * 100);
    const newGlobalAvgTime = Math.round(
      (userState.stats.avgTimeMs * userState.stats.totalQuestions + timeTakenMs) / newTotalQuestions
    );
    const newTrainingTime = userState.stats.totalTrainingTimeMs + timeTakenMs;

    // 6. Update Streak & Daily Goal
    const streakResult = StreakManager.processActivity(userState, isCorrect, xpEarned, timeTakenMs);
    if (streakResult.goalReachedNow && userState.settings.soundEnabled) {
      soundService.playStreakGoal(userState.settings.soundVolume);
    }

    // 7. Update Level & XP Progression + Weekly XP
    const currentWeekId = getCurrentWeekId();
    const newTotalXP = userState.totalXP + xpEarned;
    const currentWeeklyXP = userState.currentWeekId === currentWeekId ? (userState.weeklyXP || 0) : 0;
    const newWeeklyXP = currentWeeklyXP + xpEarned;

    const levelData = LevelManager.getLevelDataFromTotalXP(newTotalXP);
    const previousLevel = userState.level;
    const newLevel = levelData.level;

    if (newLevel > previousLevel) {
      setLevelUpData({ prev: previousLevel, next: newLevel });
      if (userState.settings.soundEnabled) soundService.playLevelUp(userState.settings.soundVolume);
    }

    // 8. Update Rank
    const previousRank = userState.rank.fullName;
    const newRankInfo = RankManager.getRankForLevel(newLevel);
    if (newRankInfo.fullName !== previousRank) {
      setRankUpData({ prev: previousRank, next: newRankInfo.fullName });
      if (userState.settings.soundEnabled) soundService.playRankUp(userState.settings.soundVolume);
    }

    // Check Level 150 Infinite celebration
    let updatedInfiniteStats = userState.infiniteStats;
    if (newLevel >= 150 && (!userState.infiniteStats || previousLevel < 150)) {
      const firstPlay = userState.createdAt || (now - 1000 * 60 * 60 * 24);
      const daysCount = Math.max(1, Math.ceil((now - firstPlay) / (1000 * 60 * 60 * 24)));
      const activeDays = Object.keys(streakResult.updatedDailyActivity || {}).length || 1;
      const hoursTrained = Math.round((newTrainingTime / (1000 * 60 * 60)) * 10) / 10;

      updatedInfiniteStats = {
        accountCreatedAt: userState.createdAt,
        firstPlayedAt: firstPlay,
        reachedInfiniteAt: now,
        daysFromFirstPlay: daysCount,
        activeDaysCount: activeDays,
        totalHoursTrained: hoursTrained,
        totalQuestionsSolved: newTotalQuestions,
        averageAccuracy: newGlobalAccuracy,
        maxStreak: newMaxCombo,
        totalXPEarned: newTotalXP,
      };
      setInfiniteCelebrationData(updatedInfiniteStats);
    }

    // Append to Recent Window
    const recentRecord: RecentAnswerRecord = {
      isCorrect,
      timeTakenMs,
      difficultyScore: currentQuestion.difficultyScore,
      operatorCount: currentQuestion.operatorCount,
      timestamp: now,
    };
    const prevHistory = userState.recentHistory || [];
    const updatedHistory = [...prevHistory, recentRecord].slice(-DIFFICULTY_CONFIG.RECENT_WINDOW_SIZE);

    const stateForAchievements: UserState = {
      ...userState,
      level: newLevel,
      totalXP: newTotalXP,
      weeklyXP: newWeeklyXP,
      currentWeekId,
      currentLevelXP: levelData.currentLevelXP,
      xpForNextLevel: levelData.xpForNextLevel,
      levelProgressPercent: levelData.levelProgressPercent,
      rank: newRankInfo,
      combo: newCombo,
      maxCombo: newMaxCombo,
      streakStats: updatedStreakStats,
      infiniteStats: updatedInfiniteStats,
      streak: streakResult.updatedStreak,
      recentHistory: updatedHistory,
      stats: {
        totalQuestions: newTotalQuestions,
        totalCorrect: newTotalCorrect,
        totalWrong: newTotalWrong,
        accuracy: newGlobalAccuracy,
        avgTimeMs: newGlobalAvgTime,
        totalTrainingTimeMs: newTrainingTime,
        byOperation: updatedByOp,
        dailyActivity: streakResult.updatedDailyActivity,
      },
    };

    // 9. Check Achievements
    const achCheck = AchievementEngine.checkNewAchievements(stateForAchievements, isCorrect ? timeTakenMs : undefined);

    const finalState: UserState = {
      ...stateForAchievements,
      totalXP: stateForAchievements.totalXP + achCheck.bonusXP,
      achievements: achCheck.updatedAchievementsMap,
      unlockedTitles: achCheck.updatedUnlockedTitles,
      updatedAt: Date.now(),
    };

    setUserState(finalState);

    // 10. Show Feedback Banner
    setFeedback({
      visible: true,
      isCorrect,
      correctAnswer: validatedCorrectAnswer ?? 0,
      xpEarned,
      baseXP: xpCalc.baseXP,
      streakMultiplier: xpCalc.streakMultiplier,
      streakBonusXP: xpCalc.streakBonusXP,
      message: isTimeout ? 'Tempo Esgotado!' : isCorrect ? 'Correto!' : 'Incorreto!',
    });

    // Enqueue Sync Event
    const syncEvent: SyncEvent = {
      eventId: `ev_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      userId: finalState.id || 'user_local',
      type: 'ANSWER_SUBMISSION',
      timestamp: Date.now(),
      payload: {
        questionId: currentQuestion?.id || 'q_answer',
        userAnswer,
        correctAnswer: validatedCorrectAnswer ?? 0,
        isCorrect,
        baseXP: xpCalc.baseXP,
        streakMultiplier: xpCalc.streakMultiplier,
        streakBonusXP: xpCalc.streakBonusXP,
        previousStreak: currentStreakBeforeAnswer,
        nextStreak: newCombo,
        xpEarned,
        timeTakenMs,
        difficultyScore: currentQuestion?.difficultyScore || 1,
        expressionComplexityScore: currentQuestion?.expressionComplexityScore || 1,
        operatorCount: currentQuestion?.operatorCount || 1,
      },
    };
    StorageService.enqueueSyncEvent(syncEvent);
    ApiClient.syncWithServer(finalState);

    const delay = isCorrect ? 600 : 1300;
    setTimeout(() => {
      answerSubmissionPendingRef.current = false;
      spawnNextQuestion();
    }, delay);
  };

  const handleUpdateProfile = (updated: UserState) => {
    setUserState(updated);
    StorageService.saveState(updated);
  };

  const handleLogout = async () => {
    await AuthService.logout();
    setAuthUser(null);
    setShowPlayerProfileModal(false);
    const guestState = createDefaultUserState();
    setUserState(guestState);
    StorageService.saveState(guestState);
  };

  const handleDeleteAccount = async () => {
    await AuthService.deleteAccount();
    setAuthUser(null);
    setShowPlayerProfileModal(false);
    const guestState = createDefaultUserState();
    setUserState(guestState);
    StorageService.saveState(guestState);
  };

  const handleUpdateSettings = (newSettings: UserSettings) => {
    setUserState((prev) => {
      const next = { ...prev, settings: newSettings };
      StorageService.saveState(next);
      return next;
    });
  };

  // Start Educational Game (Quiz, Flashcards, Topics, etc.)
  const handleStartEducationalGame = ({
    subjectId,
    topicId,
    gameMode = 'quiz_rapido',
    count = 10,
    customQuestions,
  }: {
    subjectId?: SubjectId;
    topicId?: string;
    gameMode?: GameMode;
    count?: number;
    customQuestions?: EducationalQuestion[];
  }) => {
    let questions = customQuestions;
    if (!questions || questions.length === 0) {
      questions = QuestionBankService.getFilteredQuestions({
        subjectId,
        topicId,
        count,
      });
    }
    if (!questions || questions.length === 0) {
      questions = QuestionBankService.getAllQuestions().slice(0, 10);
    }
    setActiveEducationalSession({
      questions,
      gameMode,
      subjectId,
      topicId,
    });
  };

  // Complete Educational Game Session
  const handleCompleteEducationalGame = (sessionStats: {
    totalQuestions: number;
    correctCount: number;
    wrongCount?: number;
    totalTimeMs?: number;
    xpEarned?: number;
    totalXP?: number;
    answers?: Array<{ question: EducationalQuestion; isCorrect: boolean; timeTakenMs: number }>;
    questionsAnswered?: Array<{ question: EducationalQuestion; isCorrect: boolean; timeTakenMs: number }>;
  }) => {
    let currentState = userStateRef.current;
    const answersList = sessionStats.questionsAnswered || sessionStats.answers || [];

    // 1. Process questions through SubjectMastery, ErrorNotebook, SpacedRepetition
    answersList.forEach(({ question, isCorrect, timeTakenMs }) => {
      if (!question || !question.id) return;
      currentState = SubjectMasteryEngine.recordQuestionResultForState(
        currentState,
        {
          subjectId: question.subjectId,
          topicId: question.topicId,
          isCorrect,
          questionDifficulty: question.difficulty || 50,
          timeTakenMs: timeTakenMs || 10000,
        }
      );

      if (!isCorrect) {
        const wrongAns = 'Resposta incorreta';
        const correctAns = question.questionType === 'multiple_choice' ? (question as any).correctOptionId : (question as any).isTrue ? 'Verdadeiro' : 'Falso';
        currentState = {
          ...currentState,
          errorNotebook: ErrorNotebookEngine.recordMistake(currentState, question, wrongAns, correctAns),
        };
      } else {
        currentState = {
          ...currentState,
          errorNotebook: ErrorNotebookEngine.recordCorrection(currentState, question.id),
        };
      }

      // SRS initial schedule
      currentState = {
        ...currentState,
        spacedRepetitionCards: SpacedRepetitionEngine.recordCardAnswer(currentState, question, isCorrect ? 4 : 1),
      };
    });

    currentState = EnglishLearningEngine.syncPracticeFromSession(currentState, answersList);

    // 2. Grant Global XP and advance level/ranks
    const earnedXP = sessionStats.totalXP || sessionStats.xpEarned || (sessionStats.correctCount * 15);
    const now = Date.now();
    const currentWeekId = getCurrentWeekId();
    const newTotalXP = currentState.totalXP + earnedXP;
    const currentWeeklyXP = currentState.currentWeekId === currentWeekId ? (currentState.weeklyXP || 0) : 0;
    const newWeeklyXP = currentWeeklyXP + earnedXP;

    const levelData = LevelManager.getLevelDataFromTotalXP(newTotalXP);
    const previousLevel = currentState.level;
    const newLevel = levelData.level;

    if (newLevel > previousLevel) {
      setLevelUpData({ prev: previousLevel, next: newLevel });
      if (currentState.settings.soundEnabled) soundService.playLevelUp(currentState.settings.soundVolume);
    }

    const previousRank = currentState.rank.fullName;
    const newRankInfo = RankManager.getRankForLevel(newLevel);
    if (newRankInfo.fullName !== previousRank) {
      setRankUpData({ prev: previousRank, next: newRankInfo.fullName });
      if (currentState.settings.soundEnabled) soundService.playRankUp(currentState.settings.soundVolume);
    }

    // 3. Update Streaks & Daily Activity
    const totalTimeMs = sessionStats.totalTimeMs || answersList.reduce((acc, q) => acc + (q.timeTakenMs || 0), 0);
    const streakResult = StreakManager.processActivity(
      currentState,
      sessionStats.correctCount > 0,
      earnedXP,
      totalTimeMs
    );

    const safeWrongCount = typeof sessionStats.wrongCount === 'number' ? sessionStats.wrongCount : (sessionStats.totalQuestions - sessionStats.correctCount);

    const finalState: UserState = {
      ...currentState,
      level: newLevel,
      totalXP: newTotalXP,
      weeklyXP: newWeeklyXP,
      currentWeekId,
      currentLevelXP: levelData.currentLevelXP,
      xpForNextLevel: levelData.xpForNextLevel,
      levelProgressPercent: levelData.levelProgressPercent,
      rank: newRankInfo,
      streak: streakResult.updatedStreak,
      stats: {
        ...currentState.stats,
        totalQuestions: currentState.stats.totalQuestions + sessionStats.totalQuestions,
        totalCorrect: currentState.stats.totalCorrect + sessionStats.correctCount,
        totalWrong: currentState.stats.totalWrong + safeWrongCount,
        dailyActivity: streakResult.updatedDailyActivity,
      },
      updatedAt: now,
    };

    setUserState(finalState);
    StorageService.saveState(finalState);
    ApiClient.syncWithServer(finalState);
    setActiveEducationalSession(null);
  };

  // Start & Complete Simulado
  const handleStartSimulado = (profile: ExamProfile) => {
    setActiveSimuladoProfile(profile);
  };

  const handleCompleteSimulado = (session: SimuladoSession) => {
    let currentState = userStateRef.current;
    currentState = SimuladoEngine.saveSimuladoSession(currentState, session);

    // Grant XP from Simulado
    const earnedXP = SimuladoEngine.calculateSimuladoXP(session);
    const now = Date.now();
    const newTotalXP = currentState.totalXP + earnedXP;
    const levelData = LevelManager.getLevelDataFromTotalXP(newTotalXP);
    const newRankInfo = RankManager.getRankForLevel(levelData.level);

    const finalState: UserState = {
      ...currentState,
      level: levelData.level,
      totalXP: newTotalXP,
      currentLevelXP: levelData.currentLevelXP,
      xpForNextLevel: levelData.xpForNextLevel,
      levelProgressPercent: levelData.levelProgressPercent,
      rank: newRankInfo,
      updatedAt: now,
    };

    setUserState(finalState);
    StorageService.saveState(finalState);
    ApiClient.syncWithServer(finalState);
    setActiveSimuladoProfile(null);
  };

  // Start Infinite Continuous Training
  const handleStartInfiniteTraining = (options?: { subjectId?: SubjectId; topicId?: string }) => {
    setActiveInfiniteConfig({
      sessionType: 'infinite',
      subjectId: options?.subjectId,
      topicId: options?.topicId,
      allowAdaptiveDifficulty: true,
      maxStreakMultiplier: 2.0,
    });
  };

  // Open Mini Apostilas & Study Guides
  const handleOpenStudyGuides = (guideId?: string) => {
    setActiveStudyGuideId(guideId || null);
    setShowStudyGuides(true);
  };

  const handleResetProgress = () => {
    const fresh = createDefaultUserState(userState?.name, userState?.id, userState?.email, userState?.username, userState?.displayName);
    setUserState(fresh);
    StorageService.saveState(fresh);
    setShowSettings(false);
    spawnNextQuestion();
  };

  const handleEquipTitle = (title: string) => {
    setUserState((prev) => {
      const next = { ...prev, selectedTitle: title };
      StorageService.saveState(next);
      return next;
    });
  };

  const handleManualCloudSync = () => {
    StorageService.syncWithCloud(userState, (merged) => {
      setUserState(merged);
    });
  };

  // Check if user is in an active immersive session (Quiz, Simulado, Infinite, Study Guide)
  const isImmersiveSession = Boolean(
    activeInfiniteConfig ||
    showStudyGuides ||
    activeEducationalSession ||
    activeSimuladoProfile ||
    englishImmersive
  );

  return (
    <div className="min-h-screen min-h-[100dvh] bg-[#0a0a0a] text-[#f5f5f5] flex flex-col font-sans selection:bg-orange-500 selection:text-white">
      {/* Persistent Top Header - Only shown when not in an active exercise/exam/guide session */}
      {!isImmersiveSession && (
        <Header
          userState={userState}
          activeTab={activeTab}
          onSelectTab={(tab) => {
            // Clear any sub-screens when switching main tabs
            setActiveEducationalSession(null);
            setActiveSimuladoProfile(null);
            setSelectedSubjectDetail(null);
            setShowErrorNotebook(false);
            setShowSpacedRepetition(false);
            setActiveInfiniteConfig(null);
            setShowStudyGuides(false);
            setShowEnglishHub(false);
            setEnglishImmersive(false);
            setActiveTab(tab);
          }}
          onOpenSettings={() => setShowSettings(true)}
          onOpenProfile={() => {
            setShowPlayerProfileModal(true);
          }}
          onOpenAndroidInstall={() => setShowAndroidInstall(true)}
          onOpenAuth={() => setShowAuthModal(true)}
          isLoggedIn={!!authUser}
          onOpenRecovery={() => setShowRecoveryModal(true)}
        />
      )}

      {/* Main Content Area */}
      <main
        className={
          isImmersiveSession
            ? 'flex-1 flex flex-col w-full p-0 m-0'
            : activeTab === 'game'
              ? 'flex-1 flex flex-col items-stretch justify-start px-2 py-0 sm:p-4 max-w-6xl w-full mx-auto overflow-x-hidden'
              : 'flex-1 flex flex-col items-stretch justify-start p-2 sm:p-4 max-w-6xl w-full mx-auto overflow-x-hidden'
        }
      >
        {/* Active Sub-screens */}
        {activeInfiniteConfig ? (
          <InfiniteTrainingScreen
            config={activeInfiniteConfig}
            userState={userState}
            onExit={() => setActiveInfiniteConfig(null)}
            onOpenStudyGuide={(guideIdOrTopic) => {
              setActiveStudyGuideId(guideIdOrTopic);
              setShowStudyGuides(true);
            }}
            onUpdateUserState={(updater) => {
              setUserState((prev) => {
                const next = updater(prev);
                StorageService.saveState(next);
                return next;
              });
            }}
          />
        ) : showStudyGuides ? (
          <StudyGuidesScreen
            initialGuideId={activeStudyGuideId || undefined}
            userState={userState}
            onBack={() => setShowStudyGuides(false)}
            onStartPractice={(subjectId, topicId) => {
              setShowStudyGuides(false);
              handleStartInfiniteTraining({ subjectId, topicId });
            }}
            onCompleteMiniQuiz={(guideId, xpEarned) => {
              setUserState((prev) => {
                const now = Date.now();
                const newXP = prev.totalXP + xpEarned;
                const levelData = LevelManager.getLevelDataFromTotalXP(newXP);
                const next: UserState = {
                  ...prev,
                  totalXP: newXP,
                  level: levelData.level,
                  currentLevelXP: levelData.currentLevelXP,
                  xpForNextLevel: levelData.xpForNextLevel,
                  levelProgressPercent: levelData.levelProgressPercent,
                  updatedAt: now,
                };
                StorageService.saveState(next);
                return next;
              });
            }}
          />
        ) : activeEducationalSession ? (
          <EducationalGameScreen
            questions={activeEducationalSession.questions}
            gameMode={activeEducationalSession.gameMode}
            userState={userState}
            onCompleteSession={handleCompleteEducationalGame}
            onExit={() => setActiveEducationalSession(null)}
          />
        ) : activeSimuladoProfile ? (
          <SimuladoScreen
            profile={activeSimuladoProfile}
            userState={userState}
            onCompleteSimulado={handleCompleteSimulado}
            onExit={() => setActiveSimuladoProfile(null)}
          />
        ) : showEnglishHub ? (
          <Suspense fallback={<div className="p-6 text-sm text-neutral-400">Carregando Língua Inglesa…</div>}>
            <EnglishHubScreen
              userState={userState}
              onUpdate={(state) => {
                setUserState(state);
                StorageService.saveState(state);
              }}
              onBack={() => {
                setShowEnglishHub(false);
                setEnglishImmersive(false);
              }}
              onOpenVestibular={() => {
                setShowEnglishHub(false);
                setEnglishImmersive(false);
                setSelectedSubjectDetail('ingles');
              }}
              onOpenNotebook={() => {
                setShowEnglishHub(false);
                setEnglishImmersive(false);
                setShowErrorNotebook(true);
              }}
              onImmersiveChange={setEnglishImmersive}
            />
          </Suspense>
        ) : selectedSubjectDetail ? (
          <SubjectDetailScreen
            subjectId={selectedSubjectDetail}
            userState={userState}
            onBack={() => setSelectedSubjectDetail(null)}
            onStartInfiniteTraining={(subjectId, topicId) => {
              setSelectedSubjectDetail(null);
              handleStartInfiniteTraining({ subjectId, topicId });
            }}
            onOpenStudyGuide={(guideIdOrTopic) => {
              setActiveStudyGuideId(guideIdOrTopic);
              setShowStudyGuides(true);
            }}
            onStartTopicGame={(params: any) => {
              const topicId = typeof params === 'string' ? params : params?.topicId;
              const mode = typeof params === 'object' ? params?.gameMode : 'quiz_rapido';
              const count = typeof params === 'object' && params?.count ? params.count : 10;
              const questions = QuestionBankService.getFilteredQuestions({
                subjectId: selectedSubjectDetail,
                topicId,
                count,
              });
              handleStartEducationalGame({
                subjectId: selectedSubjectDetail,
                topicId,
                gameMode: mode || 'quiz_rapido',
                customQuestions: questions.length > 0 ? questions : QuestionBankService.getRandomQuestions({ subjectId: selectedSubjectDetail, count }),
              });
            }}
          />
        ) : showErrorNotebook ? (
          <ErrorNotebookScreen
            userState={userState}
            onBack={() => setShowErrorNotebook(false)}
            onStartRecoveryMode={(errorQuestions) => {
              setShowErrorNotebook(false);
              handleStartEducationalGame({
                gameMode: 'quiz_rapido',
                customQuestions: errorQuestions,
              });
            }}
            onMarkErrorRecovered={(qId) => {
              const updated = {
                ...userState,
                errorNotebook: ErrorNotebookEngine.recordCorrection(userState, qId),
              };
              setUserState(updated);
              StorageService.saveState(updated);
            }}
          />
        ) : showSpacedRepetition ? (
          <SpacedRepetitionScreen
            userState={userState}
            onBack={() => setShowSpacedRepetition(false)}
            onStartReviewSession={(dueQuestions) => {
              setShowSpacedRepetition(false);
              handleStartEducationalGame({
                gameMode: 'flashcards',
                customQuestions: dueQuestions,
              });
            }}
          />
        ) : (
          <>
            {activeTab === 'home' && (
              <HomeScreen
                userState={userState}
                onStartTraining={(selectedMode) => {
                  if (selectedMode) {
                    setGameMode(selectedMode);
                  }
                  setActiveTab('game');
                }}
                onStartEducationalGame={handleStartEducationalGame}
                onStartInfiniteTraining={handleStartInfiniteTraining}
                onOpenStudyGuides={handleOpenStudyGuides}
                onStartSimulado={handleStartSimulado}
                onOpenErrorNotebook={() => setShowErrorNotebook(true)}
                onOpenSpacedRepetition={() => setShowSpacedRepetition(true)}
                onSelectSubjectDetail={(sId) => {
                  if (sId === 'ingles') {
                    setShowEnglishHub(true);
                    return;
                  }
                  setSelectedSubjectDetail(sId);
                }}
                onNavigateTab={(tab) => setActiveTab(tab)}
                onOpenProfile={() => {
                  setShowPlayerProfileModal(true);
                }}
                onOpenRecovery={() => setShowRecoveryModal(true)}
              />
            )}

            {activeTab === 'game' && (
              <CalculatorScreen
                currentQuestion={currentQuestion}
                userState={userState}
                gameMode={gameMode}
                onAnswerSubmit={(val) => processAnswerSubmission(val, false)}
                feedback={feedback}
                timeRemainingSeconds={timeRemaining}
                totalTimeSeconds={userState.settings.timerDurationSeconds || 30}
                survivalLives={survivalLives}
                onChangeGameMode={() => setShowModeSelector(true)}
                onGoHome={() => setActiveTab('home')}
              />
            )}

            {activeTab === 'stats' && <StatsDashboard userState={userState} />}

            {activeTab === 'calendar' && <CalendarView userState={userState} />}

            {activeTab === 'achievements' && (
              <AchievementsView userState={userState} onEquipTitle={handleEquipTitle} />
            )}
          </>
        )}
      </main>

      {/* Modals & Dialogs */}
      {showAuthModal && (
        <AuthModal
          isOpen={showAuthModal}
          onClose={() => setShowAuthModal(false)}
          onSuccess={(loggedUser) => {
            setAuthUser(loggedUser);
            setShowAuthModal(false);
          }}
          onOpenRecovery={() => {
            setShowAuthModal(false);
            setShowRecoveryModal(true);
          }}
        />
      )}

      {showRecoveryModal && (
        <AccountRecoveryModal
          isOpen={showRecoveryModal}
          onClose={() => setShowRecoveryModal(false)}
          currentUserState={userState}
          onProfileRestored={(restoredState) => {
            setUserState(restoredState);
            StorageService.saveState(restoredState);
          }}
        />
      )}

      {showOnboardingModal && (
        <OnboardingModal
          isOpen={showOnboardingModal}
          userId={userState?.id || ''}
          initialEmail={userState?.email}
          existingState={userState}
          onComplete={(updated) => {
            handleUpdateProfile(updated);
            setShowOnboardingModal(false);
          }}
        />
      )}

      {showPlayerProfileModal && (
        <PlayerProfileModal
          isOpen={showPlayerProfileModal}
          onClose={() => setShowPlayerProfileModal(false)}
          userState={userState}
          onUpdateUser={handleUpdateProfile}
          onLogout={handleLogout}
          onDeleteAccount={authUser ? handleDeleteAccount : undefined}
          onOpenRecovery={() => {
            setShowPlayerProfileModal(false);
            setShowRecoveryModal(true);
          }}
        />
      )}

      {showModeSelector && (
        <GameModeSelector
          currentMode={gameMode}
          onSelectMode={(mode) => setGameMode(mode)}
          onClose={() => setShowModeSelector(false)}
        />
      )}

      {showSettings && (
        <SettingsModal
          userState={userState}
          onUpdateSettings={handleUpdateSettings}
          onResetProgress={handleResetProgress}
          onClose={() => setShowSettings(false)}
          onOpenAndroidInstall={() => setShowAndroidInstall(true)}
        />
      )}

      {showTests && <TestRunnerModal onClose={() => setShowTests(false)} />}

      {showAndroidInstall && (
        <AndroidInstallModal onClose={() => setShowAndroidInstall(false)} />
      )}

      {levelUpData && (
        <LevelUpModal
          previousLevel={levelUpData.prev}
          newLevel={levelUpData.next}
          userState={userState}
          onClose={() => setLevelUpData(null)}
        />
      )}

      {rankUpData && (
        <RankUpModal
          previousRank={rankUpData.prev}
          newRank={rankUpData.next}
          userState={userState}
          onClose={() => setRankUpData(null)}
        />
      )}

      {infiniteCelebrationData && (
        <InfiniteCelebrationModal
          userState={userState}
          infiniteStats={infiniteCelebrationData}
          onClose={() => setInfiniteCelebrationData(null)}
        />
      )}
    </div>
  );
}
