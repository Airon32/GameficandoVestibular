import type {
  CEFRLevel,
  DailyMission,
  EducationalQuestion,
  EnglishProgress,
  EnglishSkill,
  EnglishUnitStatus,
  UserState,
} from '../types';
import { EnglishCEFRManager, createEmptySkillProgress } from './EnglishCEFRManager';
import { EnglishSkillMasteryEngine } from './EnglishSkillMasteryEngine';
import { EnglishVocabularyEngine } from './EnglishVocabularyEngine';
import { XPManager } from './XPManager';
import { LevelManager } from './LevelManager';
import { RankManager } from './RankManager';
import { StreakManager } from './StreakManager';
import { AchievementEngine } from './AchievementEngine';
import { ErrorNotebookEngine } from './ErrorNotebookEngine';
import { SubjectMasteryEngine } from './SubjectMasteryEngine';
import { ENGLISH_VOCABULARY_SEED } from '../data/english/englishVocabularySeed';
import { ENGLISH_COURSE, getAllUnits, getLessonById, getLessonQuestions, getUnitById } from '../data/english/englishCourse';
import { answersMatch, writingHeuristicScore } from '../utils/englishAnswers';
import { getCurrentWeekId } from '../utils/progressPeriod';

const SKILLS: EnglishSkill[] = ['vocabulary', 'grammar', 'reading', 'listening', 'writing', 'speaking'];

export class EnglishLearningEngine {
  public static createDefaultProgress(): EnglishProgress {
    const vocabulary = Object.fromEntries(
      ENGLISH_VOCABULARY_SEED.map((entry) => [entry.word, { ...entry }])
    );
    return {
      version: 1,
      estimatedCefr: 'a0',
      cefrConfidence: 0,
      placementCompleted: false,
      startedFromBeginning: false,
      skills: Object.fromEntries(SKILLS.map((skill) => [skill, createEmptySkillProgress(skill)])) as EnglishProgress['skills'],
      vocabulary,
      course: {
        currentLevelId: 'a0',
        currentUnitId: 'a0_u1',
        currentLessonId: 'a0_u1_l1',
        unitProgress: {},
        lessonProgress: {},
        completedPercent: 0,
      },
      stats: {
        questionsAnswered: 0,
        correct: 0,
        accuracy: 0,
        studyTimeMs: 0,
        wordsLearned: 0,
        wordsMastered: 0,
        reviewsCompleted: 0,
        lessonsCompleted: 0,
        listeningCount: 0,
        speakingCount: 0,
        writingCount: 0,
      },
      conversationSummaries: [],
      lastPracticedAt: null,
    };
  }

  public static ensureProgress(state: UserState): UserState {
    if (state.englishProgress?.version === 1 && state.englishProgress.skills) {
      return { ...state, englishProgress: this.mergeSeedVocabulary(state.englishProgress) };
    }
    return { ...state, englishProgress: this.createDefaultProgress() };
  }

  public static mergeEnglishProgress(local?: EnglishProgress, remote?: EnglishProgress): EnglishProgress {
    const base = this.createDefaultProgress();
    const a = local || base;
    const b = remote || base;
    const vocabulary = { ...b.vocabulary, ...a.vocabulary };
    for (const [word, entry] of Object.entries(b.vocabulary || {})) {
      const other = vocabulary[word];
      if (!other) {
        vocabulary[word] = entry;
        continue;
      }
      vocabulary[word] = {
        ...other,
        timesSeen: Math.max(other.timesSeen, entry.timesSeen),
        timesCorrect: Math.max(other.timesCorrect, entry.timesCorrect),
        timesWrong: Math.max(other.timesWrong, entry.timesWrong),
        mastery: Math.max(other.mastery, entry.mastery),
      };
    }
    return {
      ...base,
      ...b,
      ...a,
      vocabulary,
      skills: SKILLS.reduce((acc, skill) => {
        const left = a.skills?.[skill] || createEmptySkillProgress(skill);
        const right = b.skills?.[skill] || createEmptySkillProgress(skill);
        acc[skill] = left.activities >= right.activities ? left : right;
        return acc;
      }, {} as EnglishProgress['skills']),
      stats: {
        questionsAnswered: Math.max(a.stats?.questionsAnswered || 0, b.stats?.questionsAnswered || 0),
        correct: Math.max(a.stats?.correct || 0, b.stats?.correct || 0),
        accuracy: Math.max(a.stats?.accuracy || 0, b.stats?.accuracy || 0),
        studyTimeMs: Math.max(a.stats?.studyTimeMs || 0, b.stats?.studyTimeMs || 0),
        wordsLearned: Math.max(a.stats?.wordsLearned || 0, b.stats?.wordsLearned || 0),
        wordsMastered: Math.max(a.stats?.wordsMastered || 0, b.stats?.wordsMastered || 0),
        reviewsCompleted: Math.max(a.stats?.reviewsCompleted || 0, b.stats?.reviewsCompleted || 0),
        lessonsCompleted: Math.max(a.stats?.lessonsCompleted || 0, b.stats?.lessonsCompleted || 0),
        listeningCount: Math.max(a.stats?.listeningCount || 0, b.stats?.listeningCount || 0),
        speakingCount: Math.max(a.stats?.speakingCount || 0, b.stats?.speakingCount || 0),
        writingCount: Math.max(a.stats?.writingCount || 0, b.stats?.writingCount || 0),
      },
      course: {
        ...b.course,
        ...a.course,
        lessonProgress: { ...(b.course?.lessonProgress || {}), ...(a.course?.lessonProgress || {}) },
        unitProgress: { ...(b.course?.unitProgress || {}), ...(a.course?.unitProgress || {}) },
      },
      conversationSummaries: [...(b.conversationSummaries || []), ...(a.conversationSummaries || [])].slice(-12),
    };
  }

  public static evaluateQuestion(question: EducationalQuestion, userAnswer: unknown): boolean {
    if (question.questionType === 'multiple_choice' || question.questionType === 'listening') {
      return String(userAnswer) === question.correctOptionId;
    }
    if (question.questionType === 'true_false') {
      return Boolean(userAnswer) === question.isTrue;
    }
    if (question.questionType === 'fill_blank') {
      return answersMatch(String(userAnswer || ''), question.correctAnswers);
    }
    if (question.questionType === 'translation' || question.questionType === 'speaking') {
      return answersMatch(String(userAnswer || ''), question.acceptedAnswers);
    }
    if (question.questionType === 'ordering') {
      const order = Array.isArray(userAnswer) ? userAnswer.map(String) : [];
      const expected = [...question.items].sort((a, b) => a.correctOrder - b.correctOrder).map((item) => item.id);
      return expected.join('|') === order.join('|');
    }
    if (question.questionType === 'matching') {
      const map = (userAnswer || {}) as Record<string, string>;
      return question.pairs.every((pair) => map[pair.id] === pair.right);
    }
    if (question.questionType === 'flashcard') {
      return Boolean(userAnswer);
    }
    if (question.questionType === 'writing') {
      return writingHeuristicScore(String(userAnswer || ''), question.minWords || 8).score >= 55;
    }
    return false;
  }

  public static applyAnswer(
    state: UserState,
    question: EducationalQuestion,
    userAnswer: unknown,
    timeTakenMs: number
  ): { state: UserState; isCorrect: boolean; xpEarned: number; why: string } {
    const withEnglish = this.ensureProgress(state);
    const isCorrect = this.evaluateQuestion(question, userAnswer);
    const skill = question.englishSkill || 'grammar';
    const skillScore = withEnglish.englishProgress?.skills[skill].score || 0;
    const xp = XPManager.calculateQuestionXP({
      difficulty: question.difficulty || 30,
      timeTakenMs,
      currentStreak: withEnglish.combo || 0,
      isCorrect,
      gameMode: 'quiz_rapido',
      userMastery: skillScore,
      isManuallySelectedLowDifficulty: (question.difficulty || 30) <= 25 && skillScore >= 75,
    });

    let next: UserState = {
      ...withEnglish,
      totalXP: withEnglish.totalXP + xp.finalXP,
      weeklyXP: (withEnglish.currentWeekId === getCurrentWeekId() ? withEnglish.weeklyXP || 0 : 0) + xp.finalXP,
      currentWeekId: getCurrentWeekId(),
      combo: isCorrect ? (withEnglish.combo || 0) + 1 : 0,
      maxCombo: Math.max(withEnglish.maxCombo || 0, isCorrect ? (withEnglish.combo || 0) + 1 : withEnglish.maxCombo || 0),
    };

    const levelData = LevelManager.getLevelDataFromTotalXP(next.totalXP, next.highestUnlockedRank);
    next.level = levelData.level;
    next.currentLevelXP = levelData.currentLevelXP;
    next.xpForNextLevel = levelData.xpForNextLevel;
    next.levelProgressPercent = levelData.levelProgressPercent;
    next.rank = RankManager.getRankForLevel(levelData.level, next.highestUnlockedRank);
    next.stats = {
      ...next.stats,
      totalQuestions: next.stats.totalQuestions + 1,
      totalCorrect: next.stats.totalCorrect + (isCorrect ? 1 : 0),
      totalWrong: next.stats.totalWrong + (isCorrect ? 0 : 1),
      accuracy: Math.round(((next.stats.totalCorrect + (isCorrect ? 1 : 0)) / (next.stats.totalQuestions + 1)) * 100),
      questionsToday: (next.stats.questionsToday || 0) + 1,
      lifetimeQuestionsCount: (next.stats.lifetimeQuestionsCount || 0) + 1,
    };

    const mastery = SubjectMasteryEngine.recordQuestionResult(next, {
      subjectId: 'ingles',
      topicId: question.topicId,
      isCorrect,
      questionDifficulty: question.difficulty || 30,
      timeTakenMs,
    });
    next.subjectsMastery = mastery.newSubjectsMap;

    if (!isCorrect) {
      next.errorNotebook = ErrorNotebookEngine.recordMistake(
        next,
        question,
        String(userAnswer ?? ''),
        this.correctAnswerLabel(question)
      );
      const entry = next.errorNotebook[question.id];
      if (entry) next.errorNotebook[question.id] = { ...entry, englishSkill: skill };
    } else {
      next.errorNotebook = ErrorNotebookEngine.recordCorrection(next, question.id);
    }

    const progress = { ...next.englishProgress! };
    progress.skills = {
      ...progress.skills,
      [skill]: EnglishSkillMasteryEngine.recordActivity(progress.skills[skill], skill, {
        isCorrect,
        difficulty: question.difficulty || 30,
        timeTakenMs,
      }),
    };
    progress.stats = {
      ...progress.stats,
      questionsAnswered: progress.stats.questionsAnswered + 1,
      correct: progress.stats.correct + (isCorrect ? 1 : 0),
      studyTimeMs: progress.stats.studyTimeMs + timeTakenMs,
      listeningCount: progress.stats.listeningCount + (skill === 'listening' ? 1 : 0),
      speakingCount: progress.stats.speakingCount + (skill === 'speaking' ? 1 : 0),
      writingCount: progress.stats.writingCount + (skill === 'writing' ? 1 : 0),
    };
    progress.stats.accuracy = Math.round((progress.stats.correct / Math.max(1, progress.stats.questionsAnswered)) * 100);
    const overall = EnglishCEFRManager.recomputeOverall(progress);
    progress.estimatedCefr = overall.estimatedCefr;
    progress.cefrConfidence = overall.cefrConfidence;
    progress.lastPracticedAt = Date.now();

    const vocabKey = this.vocabFromQuestion(question, progress);
    if (vocabKey) {
      const seed = progress.vocabulary[vocabKey] || ENGLISH_VOCABULARY_SEED.find((item) => item.word === vocabKey);
      if (seed) {
        progress.vocabulary = {
          ...progress.vocabulary,
          [vocabKey]: EnglishVocabularyEngine.recordSight(progress.vocabulary[vocabKey], seed, isCorrect),
        };
        next = EnglishVocabularyEngine.syncSpacedRepetition({ ...next, englishProgress: progress }, progress.vocabulary[vocabKey], isCorrect);
      }
    }

    const vocabStats = EnglishVocabularyEngine.stats(progress.vocabulary);
    progress.stats.wordsLearned = vocabStats.total;
    progress.stats.wordsMastered = vocabStats.mastered;
    next.englishProgress = progress;

    const streak = StreakManager.processActivity(next, isCorrect, xp.finalXP, timeTakenMs);
    next.streak = streak.updatedStreak;
    next.stats.dailyActivity = streak.updatedDailyActivity;

    const achievements = AchievementEngine.checkNewAchievements(next, isCorrect ? timeTakenMs : undefined);
    next.achievements = achievements.updatedAchievementsMap;
    next.unlockedTitles = achievements.updatedUnlockedTitles;
    if (achievements.bonusXP > 0) {
      next.totalXP += achievements.bonusXP;
      const recal = LevelManager.getLevelDataFromTotalXP(next.totalXP, next.highestUnlockedRank);
      next.level = recal.level;
      next.currentLevelXP = recal.currentLevelXP;
      next.xpForNextLevel = recal.xpForNextLevel;
      next.levelProgressPercent = recal.levelProgressPercent;
      next.rank = RankManager.getRankForLevel(recal.level, next.highestUnlockedRank);
    }

    next.dailyMissions = this.touchMissions(next, { skill, isCorrect });
    next.updatedAt = Date.now();

    return { state: next, isCorrect, xpEarned: xp.finalXP, why: question.explanation };
  }

  public static completeLesson(state: UserState, lessonId: string, accuracy: number, xpEarned: number): UserState {
    const next = this.ensureProgress(state);
    const progress = { ...next.englishProgress! };
    const found = getLessonById(lessonId);
    progress.course = {
      ...progress.course,
      currentLessonId: lessonId,
      currentUnitId: found?.unit.id || progress.course.currentUnitId,
      currentLevelId: found?.unit.cefr || progress.course.currentLevelId,
      lessonProgress: {
        ...progress.course.lessonProgress,
        [lessonId]: {
          lessonId,
          completedAt: Date.now(),
          accuracy,
          xpEarned,
          attempts: (progress.course.lessonProgress[lessonId]?.attempts || 0) + 1,
        },
      },
    };
    const completed = Object.values(progress.course.lessonProgress).filter((item) => item.completedAt).length;
    const total = getAllUnits().reduce((acc, unit) => acc + unit.lessons.length, 0);
    progress.course.completedPercent = Math.round((completed / Math.max(1, total)) * 100);
    progress.stats.lessonsCompleted = completed;
    if (found) {
      const unitLessons = found.unit.lessons;
      const unitDone = unitLessons.every((lesson) => progress.course.lessonProgress[lesson.id]?.completedAt);
      progress.course.unitProgress = {
        ...progress.course.unitProgress,
        [found.unit.id]: {
          unitId: found.unit.id,
          status: unitDone ? (accuracy >= 80 ? 'mastered' : 'completed') : 'current',
          bestAccuracy: Math.max(progress.course.unitProgress[found.unit.id]?.bestAccuracy || 0, accuracy),
          attempts: (progress.course.unitProgress[found.unit.id]?.attempts || 0) + 1,
          masteredAt: unitDone && accuracy >= 80 ? Date.now() : progress.course.unitProgress[found.unit.id]?.masteredAt,
        },
      };
    }
    return { ...next, englishProgress: progress, updatedAt: Date.now() };
  }

  public static mapNodes(state: UserState): Array<{
    unitId: string;
    title: string;
    cefr: CEFRLevel;
    island: string;
    status: EnglishUnitStatus;
    track: string;
  }> {
    const progress = this.ensureProgress(state).englishProgress!;
    const completed = new Set(
      Object.values(progress.course.lessonProgress)
        .filter((item) => item.completedAt)
        .map((item) => item.lessonId)
    );
    const placedIndex = EnglishCEFRManager.indexOf(progress.estimatedCefr || 'a0');
    let previousUnlocked = true;
    const nodes: Array<{ unitId: string; title: string; cefr: CEFRLevel; island: string; status: EnglishUnitStatus; track: string }> = [];
    for (const level of ENGLISH_COURSE) {
      for (const unit of level.units) {
        const done = unit.lessons.every((lesson) => completed.has(lesson.id));
        const started = unit.lessons.some((lesson) => completed.has(lesson.id) || progress.course.currentLessonId === lesson.id);
        const placementOpen = EnglishCEFRManager.indexOf(unit.cefr) <= placedIndex;
        let status: EnglishUnitStatus = 'locked';
        if (done) status = progress.course.unitProgress[unit.id]?.status === 'mastered' ? 'mastered' : unit.isBoss ? 'boss' : 'completed';
        else if (previousUnlocked || placementOpen) status = started ? 'current' : 'available';
        nodes.push({ unitId: unit.id, title: unit.title, cefr: unit.cefr, island: level.island, status, track: unit.track });
        if (done || placementOpen) previousUnlocked = true;
        else if (status === 'available' || status === 'current') previousUnlocked = false;
        else previousUnlocked = false;
      }
    }
    return nodes;
  }

  public static continuePointer(state: UserState) {
    const nodes = this.mapNodes(state);
    const current = nodes.find((node) => node.status === 'current' || node.status === 'available');
    const unit = current ? getUnitById(current.unitId) : getAllUnits()[0];
    const progress = this.ensureProgress(state).englishProgress!;
    const lesson = unit?.lessons.find((item) => !progress.course.lessonProgress[item.id]?.completedAt) || unit?.lessons[0];
    return {
      unit,
      lesson,
      cefr: unit?.cefr || 'a0',
      island: nodes.find((node) => node.unitId === unit?.id)?.island || 'Foundation Island',
    };
  }

  public static buildSession(kind: 'lesson' | 'review' | 'skill' | 'survival' | 'boss' | 'weakness', state: UserState, options?: { lessonId?: string; skill?: EnglishSkill; unitId?: string }): EducationalQuestion[] {
    const ready = this.ensureProgress(state);
    if (kind === 'lesson' && options?.lessonId) return getLessonQuestions(options.lessonId);
    if (kind === 'boss' && options?.unitId) {
      const unit = getUnitById(options.unitId);
      return (unit?.lessons || []).flatMap((lesson) => getLessonQuestions(lesson.id)).slice(0, 8);
    }
    if (kind === 'review') {
      const due = EnglishVocabularyEngine.dueEntries(ready.englishProgress!.vocabulary, 8);
      return due.map((entry) => EnglishVocabularyEngine.toFlashcard(entry));
    }
    if (kind === 'skill' && options?.skill) {
      const all = getAllUnits().flatMap((unit) => unit.lessons.flatMap((lesson) => getLessonQuestions(lesson.id)));
      return all.filter((question) => question.englishSkill === options.skill).slice(0, 8);
    }
    const pointer = this.continuePointer(ready);
    const current = pointer.lesson ? getLessonQuestions(pointer.lesson.id) : [];
    const review = EnglishVocabularyEngine.dueEntries(ready.englishProgress!.vocabulary, 2).map((entry) => EnglishVocabularyEngine.toFlashcard(entry));
    const weak = EnglishSkillMasteryEngine.weakestSkill(ready.englishProgress!.skills);
    const weakPool = weak ? this.buildSession('skill', ready, { skill: weak.skill }).slice(0, 2) : [];
    return [...current.slice(0, 4), ...review, ...weakPool].slice(0, kind === 'survival' ? 20 : 10);
  }

  public static insights(state: UserState): string[] {
    const progress = this.ensureProgress(state).englishProgress!;
    const lines: string[] = [];
    const weak = EnglishSkillMasteryEngine.weakestSkill(progress.skills);
    if (weak && weak.activities >= 3) {
      lines.push(`${this.skillLabel(weak.skill)} está ${Math.round(weak.score)} pontos — sua habilidade mais fraca agora.`);
    }
    if (progress.stats.listeningCount > 0 && progress.skills.listening.trend > 0) {
      lines.push(`Listening melhorou ${progress.skills.listening.trend} ponto(s) na prática recente.`);
    }
    const notebook = Object.values(state.errorNotebook || {}).filter((entry) => entry.subjectId === 'ingles' && entry.status !== 'recovered');
    const byTopic = notebook.reduce<Record<string, number>>((acc, entry) => {
      acc[entry.topicId] = (acc[entry.topicId] || 0) + entry.timesWrong;
      return acc;
    }, {});
    const topTopic = Object.entries(byTopic).sort((a, b) => b[1] - a[1])[0];
    if (topTopic) lines.push(`${topTopic[0].replace(/_/g, ' ')} concentra ${topTopic[1]} erro(s) repetido(s).`);
    if (progress.stats.wordsMastered > 0) lines.push(`Você já consolidou ${progress.stats.wordsMastered} palavra(s).`);
    return lines.slice(0, 4);
  }

  public static skillLabel(skill: EnglishSkill): string {
    const labels: Record<EnglishSkill, string> = {
      vocabulary: 'Vocabulary',
      grammar: 'Grammar',
      reading: 'Reading',
      listening: 'Listening',
      writing: 'Writing',
      speaking: 'Speaking',
    };
    return labels[skill];
  }

  public static applyPlacement(
    state: UserState,
    overall: CEFRLevel,
    skills: Partial<Record<EnglishSkill, CEFRLevel | 'unevaluated'>>,
    skipped = false
  ): UserState {
    const next = this.ensureProgress(state);
    const progress = EnglishCEFRManager.applyPlacement(next.englishProgress!, overall, skills);
    const firstUnit = ENGLISH_COURSE.find((level) => level.id === overall)?.units[0];
    progress.placement = { overall, skills, completedAt: Date.now(), skipped };
    progress.course = {
      ...progress.course,
      currentLevelId: overall,
      currentUnitId: firstUnit?.id || progress.course.currentUnitId,
      currentLessonId: firstUnit?.lessons[0]?.id || progress.course.currentLessonId,
    };
    return { ...next, englishProgress: progress, updatedAt: Date.now() };
  }

  public static startFromBeginning(state: UserState): UserState {
    const next = this.ensureProgress(state);
    return {
      ...next,
      englishProgress: {
        ...next.englishProgress!,
        startedFromBeginning: true,
        placementCompleted: true,
        placement: {
          overall: 'a0',
          skills: {},
          completedAt: Date.now(),
          skipped: true,
        },
      },
      updatedAt: Date.now(),
    };
  }

  public static syncPracticeFromSession(
    state: UserState,
    answers: Array<{ question: EducationalQuestion; isCorrect: boolean; timeTakenMs: number }>
  ): UserState {
    let next = this.ensureProgress(state);
    for (const answer of answers) {
      if (answer.question.subjectId !== 'ingles') continue;
      const skill = answer.question.englishSkill || 'grammar';
      const progress = { ...next.englishProgress! };
      progress.skills = {
        ...progress.skills,
        [skill]: EnglishSkillMasteryEngine.recordActivity(progress.skills[skill], skill, {
          isCorrect: answer.isCorrect,
          difficulty: answer.question.difficulty || 30,
          timeTakenMs: answer.timeTakenMs,
        }),
      };
      progress.stats = {
        ...progress.stats,
        questionsAnswered: progress.stats.questionsAnswered + 1,
        correct: progress.stats.correct + (answer.isCorrect ? 1 : 0),
        studyTimeMs: progress.stats.studyTimeMs + answer.timeTakenMs,
        listeningCount: progress.stats.listeningCount + (skill === 'listening' ? 1 : 0),
        speakingCount: progress.stats.speakingCount + (skill === 'speaking' ? 1 : 0),
        writingCount: progress.stats.writingCount + (skill === 'writing' ? 1 : 0),
      };
      progress.stats.accuracy = Math.round((progress.stats.correct / Math.max(1, progress.stats.questionsAnswered)) * 100);
      const overall = EnglishCEFRManager.recomputeOverall(progress);
      progress.estimatedCefr = overall.estimatedCefr;
      progress.cefrConfidence = overall.cefrConfidence;
      progress.lastPracticedAt = Date.now();
      next = { ...next, englishProgress: progress };
    }
    return next;
  }

  public static recordConversationSummary(state: UserState, summary: EnglishProgress['conversationSummaries'][number]): UserState {
    const next = this.ensureProgress(state);
    return {
      ...next,
      englishProgress: {
        ...next.englishProgress!,
        conversationSummaries: [...(next.englishProgress!.conversationSummaries || []), summary].slice(-12),
      },
      updatedAt: Date.now(),
    };
  }

  public static ensureDailyMissions(state: UserState): DailyMission[] {
    const current = state.dailyMissions || [];
    if (current.some((mission) => mission.id.startsWith('en_'))) return current;
    const englishMissions: DailyMission[] = [
      { id: 'en_ex_2', title: '2 exercícios de Inglês', description: 'Complete 2 English exercises.', category: 'subject', targetSubject: 'ingles', currentProgress: 0, targetValue: 2, rewardXP: 40, isCompleted: false, isClaimed: false },
      { id: 'en_listen', title: 'Listening', description: 'Practice Listening twice.', category: 'subject', targetSubject: 'ingles', currentProgress: 0, targetValue: 2, rewardXP: 50, isCompleted: false, isClaimed: false },
      { id: 'en_words', title: '10 palavras', description: 'See 10 English words.', category: 'subject', targetSubject: 'ingles', currentProgress: 0, targetValue: 10, rewardXP: 40, isCompleted: false, isClaimed: false },
      { id: 'en_review', title: 'Revisão de Inglês', description: 'Complete one English review.', category: 'review', targetSubject: 'ingles', currentProgress: 0, targetValue: 1, rewardXP: 45, isCompleted: false, isClaimed: false },
    ];
    return [...current, ...englishMissions];
  }

  private static touchMissions(state: UserState, event: { skill: EnglishSkill; isCorrect: boolean }): DailyMission[] {
    return this.ensureDailyMissions(state).map((mission) => {
      if (mission.targetSubject !== 'ingles' && !mission.id.startsWith('en_')) return mission;
      let progress = mission.currentProgress;
      if (mission.id === 'en_ex_2') progress += 1;
      if (mission.id === 'en_listen' && event.skill === 'listening') progress += 1;
      if (mission.id === 'en_words' && event.skill === 'vocabulary') progress += 1;
      if (mission.id === 'en_review' && event.skill === 'vocabulary') progress += 1;
      const isCompleted = progress >= mission.targetValue;
      return { ...mission, currentProgress: Math.min(mission.targetValue, progress), isCompleted };
    });
  }

  private static correctAnswerLabel(question: EducationalQuestion): string {
    if (question.questionType === 'multiple_choice' || question.questionType === 'listening') {
      return question.options.find((option) => option.id === question.correctOptionId)?.text || question.correctOptionId;
    }
    if (question.questionType === 'fill_blank') return question.correctAnswers[0];
    if (question.questionType === 'translation' || question.questionType === 'speaking') return question.acceptedAnswers[0];
    if (question.questionType === 'ordering') {
      return [...question.items].sort((a, b) => a.correctOrder - b.correctOrder).map((item) => item.text).join(' ');
    }
    if (question.questionType === 'writing') return question.sampleAnswer || '';
    return '';
  }

  private static vocabFromQuestion(question: EducationalQuestion, progress: EnglishProgress): string | null {
    const tagged = (question.tags || []).map((tag) => EnglishVocabularyEngine.normalize(tag));
    const hit = tagged.find((tag) => progress.vocabulary[tag]);
    if (hit) return hit;
    if (question.questionType === 'flashcard') return EnglishVocabularyEngine.normalize(question.frontPrompt);
    return null;
  }

  private static mergeSeedVocabulary(progress: EnglishProgress): EnglishProgress {
    const vocabulary = { ...progress.vocabulary };
    for (const seed of ENGLISH_VOCABULARY_SEED) {
      if (!vocabulary[seed.word]) vocabulary[seed.word] = seed;
    }
    return { ...progress, vocabulary };
  }
}
