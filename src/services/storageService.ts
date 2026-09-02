import { DEFAULT_USER_SETTINGS } from '../config/constants';
import { RankManager } from '../engines/RankManager';
import { LevelManager } from '../engines/LevelManager';
import { PROGRESSION_VERSION } from '../config/progressionConfig';
import { AchievementEngine } from '../engines/AchievementEngine';
import { EnglishLearningEngine } from '../engines/EnglishLearningEngine';
import { SyncEvent, UserState, OperationType } from '../types';
import { CloudStorageService } from './firebase';
import { getCurrentWeekId } from '../utils/progressPeriod';

const BASE_STORAGE_KEY = 'mathcore_user_state_v2';
const ACTIVE_USER_ID_KEY = 'mathcore_active_uid_v2';
const QUEUE_KEY = 'mathcore_sync_queue_v2';

let cloudSyncTimeout: any = null;
let syncListeners: Array<(isSyncing: boolean, lastSyncedAt?: number) => void> = [];
let lastSuccessfulSyncAt: number = 0;

export function getActiveUserId(): string {
  if (typeof window === 'undefined') return 'user_local_demo';
  let uid = localStorage.getItem(ACTIVE_USER_ID_KEY);
  if (!uid) {
    uid = `user_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    localStorage.setItem(ACTIVE_USER_ID_KEY, uid);
  }
  return uid;
}

export function setActiveUserId(uid: string): void {
  if (typeof window === 'undefined' || !uid) return;
  localStorage.setItem(ACTIVE_USER_ID_KEY, uid.trim());
}

export function createDefaultUserState(
  name: string = 'Matemático',
  customUid?: string,
  email?: string,
  username?: string,
  displayName?: string
): UserState {
  const initialRank = RankManager.getRankForLevel(1);
  const initialLevelData = LevelManager.getLevelDataFromTotalXP(0);
  const uid = customUid || getActiveUserId();
  const weekId = getCurrentWeekId();

  return {
    id: uid,
    username: username || `@user_${uid.substring(0, 6)}`,
    displayName: displayName || name,
    name: displayName || name,
    email: email || '',
    selectedTitle: 'Aprendiz Matemático',
    avatar: '🦊',
    level: initialLevelData.level,
    totalXP: 0,
    weeklyXP: 0,
    currentWeekId: weekId,
    currentLevelXP: initialLevelData.currentLevelXP,
    xpForNextLevel: initialLevelData.xpForNextLevel,
    levelProgressPercent: initialLevelData.levelProgressPercent,
    rank: initialRank,
    streak: {
      currentStreak: 0,
      maxStreak: 0,
      lastActiveDate: null,
      streakFreezes: 1,
    },
    combo: 0,
    maxCombo: 0,
    streakStats: {
      xpFromStreaksTotal: 0,
      highestMultiplierReached: 1.0,
      milestoneHits: { 5: 0, 10: 0, 20: 0, 40: 0, 80: 0, 160: 0, 320: 0, 640: 0, 1000: 0 },
    },
    stats: {
      totalQuestions: 0,
      totalCorrect: 0,
      totalWrong: 0,
      accuracy: 0,
      avgTimeMs: 0,
      totalTrainingTimeMs: 0,
      byOperation: {
        addition: { totalQuestions: 0, correct: 0, wrong: 0, accuracy: 0, avgTimeMs: 0, difficultyScore: 1 },
        subtraction: { totalQuestions: 0, correct: 0, wrong: 0, accuracy: 0, avgTimeMs: 0, difficultyScore: 1 },
        multiplication: { totalQuestions: 0, correct: 0, wrong: 0, accuracy: 0, avgTimeMs: 0, difficultyScore: 1 },
        division: { totalQuestions: 0, correct: 0, wrong: 0, accuracy: 0, avgTimeMs: 0, difficultyScore: 1 },
      },
      dailyActivity: {},
    },
    achievements: {},
    unlockedTitles: ['Aprendiz Matemático', 'Iniciante dos Números'],
    highestUnlockedRank: 0,
    progressionVersion: PROGRESSION_VERSION,
    ascensionLevel: 0,
    settings: { ...DEFAULT_USER_SETTINGS },
    englishProgress: EnglishLearningEngine.createDefaultProgress(),
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
}

export class StorageService {
  public static subscribeSync(listener: (isSyncing: boolean, lastSyncedAt?: number) => void): () => void {
    syncListeners.push(listener);
    listener(false, lastSuccessfulSyncAt);
    return () => {
      syncListeners = syncListeners.filter((l) => l !== listener);
    };
  }

  private static notifySync(isSyncing: boolean): void {
    syncListeners.forEach((l) => l(isSyncing, lastSuccessfulSyncAt));
  }

  private static getUserStorageKey(userId: string): string {
    return `${BASE_STORAGE_KEY}_${userId}`;
  }

  /**
   * Safely merges two UserStates, ensuring NO achievements, titles, XP, or stats are ever lost.
   */
  public static mergeUserStates(local: UserState, remote: UserState): UserState {
    const currentWeekId = getCurrentWeekId();

    // 1. Merge achievements (union of all unlocked timestamps)
    const mergedAchievements: Record<string, number> = {
      ...(remote.achievements || {}),
      ...(local.achievements || {}),
    };

    // 2. Merge unlocked titles (union)
    const titlesSet = new Set<string>([
      'Aprendiz Matemático',
      'Iniciante dos Números',
      ...(local.unlockedTitles || []),
      ...(remote.unlockedTitles || []),
    ]);

    // 3. Take highest XP and calculate level & rank with permanent highestUnlockedRank safeguard
    const highestUnlockedRank = Math.max(
      local.highestUnlockedRank || 0,
      remote.highestUnlockedRank || 0,
      Math.floor(((local.level || 1) - 1) / 5),
      Math.floor(((remote.level || 1) - 1) / 5)
    );

    const mergedXP = Math.max(local.totalXP || 0, remote.totalXP || 0);
    const levelData = LevelManager.getLevelDataFromTotalXP(mergedXP, highestUnlockedRank);
    const effectiveHighestRank = Math.max(highestUnlockedRank, Math.floor((levelData.level - 1) / 5));

    // Weekly XP computation
    let mergedWeeklyXP = 0;
    if (local.currentWeekId === currentWeekId && remote.currentWeekId === currentWeekId) {
      mergedWeeklyXP = Math.max(local.weeklyXP || 0, remote.weeklyXP || 0);
    } else if (local.currentWeekId === currentWeekId) {
      mergedWeeklyXP = local.weeklyXP || 0;
    } else if (remote.currentWeekId === currentWeekId) {
      mergedWeeklyXP = remote.weeklyXP || 0;
    }

    // 4. Merge stats safely
    const localStats = local.stats || createDefaultUserState().stats;
    const remoteStats = remote.stats || createDefaultUserState().stats;

    const mergedTotalQuestions = Math.max(localStats.totalQuestions || 0, remoteStats.totalQuestions || 0);
    const mergedTotalCorrect = Math.max(localStats.totalCorrect || 0, remoteStats.totalCorrect || 0);
    const mergedTotalWrong = Math.max(localStats.totalWrong || 0, remoteStats.totalWrong || 0);
    const mergedTrainingTime = Math.max(localStats.totalTrainingTimeMs || 0, remoteStats.totalTrainingTimeMs || 0);

    const ops: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'];
    const mergedByOp: any = {};
    for (const op of ops) {
      const lOp = localStats.byOperation?.[op] || { totalQuestions: 0, correct: 0, wrong: 0, accuracy: 0, avgTimeMs: 0, difficultyScore: 1 };
      const rOp = remoteStats.byOperation?.[op] || { totalQuestions: 0, correct: 0, wrong: 0, accuracy: 0, avgTimeMs: 0, difficultyScore: 1 };
      const tot = Math.max(lOp.totalQuestions, rOp.totalQuestions);
      const cor = Math.max(lOp.correct, rOp.correct);
      const wrg = Math.max(lOp.wrong, rOp.wrong);
      mergedByOp[op] = {
        totalQuestions: tot,
        correct: cor,
        wrong: wrg,
        accuracy: tot > 0 ? Math.round((cor / tot) * 100) : 0,
        avgTimeMs: Math.min(lOp.avgTimeMs || 99999, rOp.avgTimeMs || 99999) === 99999 ? 0 : Math.min(lOp.avgTimeMs || 99999, rOp.avgTimeMs || 99999),
        difficultyScore: Math.max(lOp.difficultyScore || 1, rOp.difficultyScore || 1),
      };
    }

    // Merge daily activities
    const mergedDaily = {
      ...(remoteStats.dailyActivity || {}),
      ...(localStats.dailyActivity || {}),
    };

    // 5. Merge streak and combo records
    const maxCombo = Math.max(local.maxCombo || 0, remote.maxCombo || 0, local.combo || 0, remote.combo || 0);
    const maxStreak = Math.max(local.streak?.maxStreak || 0, remote.streak?.maxStreak || 0, local.streak?.currentStreak || 0, remote.streak?.currentStreak || 0);
    const currentStreak = Math.max(local.streak?.currentStreak || 0, remote.streak?.currentStreak || 0);

    const mergedState: UserState = {
      id: remote.id || local.id || getActiveUserId(),
      username: remote.username || local.username,
      displayName: remote.displayName || local.displayName || remote.name || local.name || 'Matemático',
      name: remote.displayName || local.displayName || remote.name || local.name || 'Matemático',
      email: remote.email || local.email || '',
      selectedTitle: remote.selectedTitle || local.selectedTitle || 'Aprendiz Matemático',
      avatar: remote.avatar || local.avatar || '🦊',
      bio: remote.bio || local.bio || '',
      level: levelData.level,
      totalXP: mergedXP,
      weeklyXP: mergedWeeklyXP,
      currentWeekId,
      currentLevelXP: levelData.currentLevelXP,
      xpForNextLevel: levelData.xpForNextLevel,
      levelProgressPercent: levelData.levelProgressPercent,
      rank: RankManager.getRankForLevel(levelData.level, effectiveHighestRank),
      highestUnlockedRank: effectiveHighestRank,
      progressionVersion: PROGRESSION_VERSION,
      streak: {
        currentStreak,
        maxStreak,
        lastActiveDate: local.streak?.lastActiveDate || remote.streak?.lastActiveDate || null,
        streakFreezes: Math.max(local.streak?.streakFreezes || 0, remote.streak?.streakFreezes || 0, 1),
      },
      combo: Math.max(local.combo || 0, remote.combo || 0),
      maxCombo,
      streakStats: {
        xpFromStreaksTotal: Math.max(
          local.streakStats?.xpFromStreaksTotal || 0,
          remote.streakStats?.xpFromStreaksTotal || 0
        ),
        highestMultiplierReached: Math.max(
          local.streakStats?.highestMultiplierReached || 1.0,
          remote.streakStats?.highestMultiplierReached || 1.0
        ),
        milestoneHits: {
          5: Math.max(local.streakStats?.milestoneHits?.[5] || 0, remote.streakStats?.milestoneHits?.[5] || 0),
          10: Math.max(local.streakStats?.milestoneHits?.[10] || 0, remote.streakStats?.milestoneHits?.[10] || 0),
          20: Math.max(local.streakStats?.milestoneHits?.[20] || 0, remote.streakStats?.milestoneHits?.[20] || 0),
          40: Math.max(local.streakStats?.milestoneHits?.[40] || 0, remote.streakStats?.milestoneHits?.[40] || 0),
          80: Math.max(local.streakStats?.milestoneHits?.[80] || 0, remote.streakStats?.milestoneHits?.[80] || 0),
          160: Math.max(local.streakStats?.milestoneHits?.[160] || 0, remote.streakStats?.milestoneHits?.[160] || 0),
          320: Math.max(local.streakStats?.milestoneHits?.[320] || 0, remote.streakStats?.milestoneHits?.[320] || 0),
          640: Math.max(local.streakStats?.milestoneHits?.[640] || 0, remote.streakStats?.milestoneHits?.[640] || 0),
          1000: Math.max(local.streakStats?.milestoneHits?.[1000] || 0, remote.streakStats?.milestoneHits?.[1000] || 0),
        },
      },
      stats: {
        totalQuestions: mergedTotalQuestions,
        totalCorrect: mergedTotalCorrect,
        totalWrong: mergedTotalWrong,
        accuracy: mergedTotalQuestions > 0 ? Math.round((mergedTotalCorrect / mergedTotalQuestions) * 100) : 0,
        avgTimeMs: Math.min(localStats.avgTimeMs || 99999, remoteStats.avgTimeMs || 99999) === 99999 ? 0 : Math.min(localStats.avgTimeMs || 99999, remoteStats.avgTimeMs || 99999),
        totalTrainingTimeMs: mergedTrainingTime,
        byOperation: mergedByOp,
        dailyActivity: mergedDaily,
      },
      achievements: mergedAchievements,
      unlockedTitles: Array.from(titlesSet),
      settings: { ...DEFAULT_USER_SETTINGS, ...(remote.settings || {}), ...(local.settings || {}) },
      createdAt: Math.min(local.createdAt || Date.now(), remote.createdAt || Date.now()),
      updatedAt: Date.now(),
    };

    // Retroactively check any achievements that should be unlocked based on merged stats
    const retroactive = AchievementEngine.checkNewAchievements(mergedState);
    mergedState.achievements = retroactive.updatedAchievementsMap;
    mergedState.unlockedTitles = retroactive.updatedUnlockedTitles;
    if (retroactive.bonusXP > 0) {
      mergedState.totalXP += retroactive.bonusXP;
      const recal = LevelManager.getLevelDataFromTotalXP(mergedState.totalXP, mergedState.highestUnlockedRank);
      mergedState.level = recal.level;
      mergedState.currentLevelXP = recal.currentLevelXP;
      mergedState.xpForNextLevel = recal.xpForNextLevel;
      mergedState.levelProgressPercent = recal.levelProgressPercent;
      mergedState.rank = RankManager.getRankForLevel(recal.level, mergedState.highestUnlockedRank);
    }

    mergedState.subjectsMastery = local.updatedAt >= remote.updatedAt
      ? (local.subjectsMastery || remote.subjectsMastery)
      : (remote.subjectsMastery || local.subjectsMastery);
    mergedState.errorNotebook = { ...(remote.errorNotebook || {}), ...(local.errorNotebook || {}) };
    mergedState.spacedRepetitionCards = { ...(remote.spacedRepetitionCards || {}), ...(local.spacedRepetitionCards || {}) };
    mergedState.studyGuidesProgress = { ...(remote.studyGuidesProgress || {}), ...(local.studyGuidesProgress || {}) };
    mergedState.dailyMissions = EnglishLearningEngine.ensureDailyMissions({
      dailyMissions: (local.dailyMissions?.length || 0) >= (remote.dailyMissions?.length || 0)
        ? local.dailyMissions
        : remote.dailyMissions,
    } as UserState);
    mergedState.savedQuestions = Array.from(new Set([...(remote.savedQuestions || []), ...(local.savedQuestions || [])]));
    mergedState.simuladosHistory = [...(remote.simuladosHistory || []), ...(local.simuladosHistory || [])].slice(-24);
    mergedState.dailyGoalConfig = local.dailyGoalConfig || remote.dailyGoalConfig;
    mergedState.targetExamGoal = local.targetExamGoal || remote.targetExamGoal;
    mergedState.englishProgress = EnglishLearningEngine.mergeEnglishProgress(local.englishProgress, remote.englishProgress);

    return mergedState;
  }

  public static loadState(targetUserId?: string): UserState {
    if (typeof window === 'undefined') {
      return createDefaultUserState();
    }

    const uid = targetUserId || getActiveUserId();
    const userKey = this.getUserStorageKey(uid);

    try {
      const serialized = localStorage.getItem(userKey);
      if (serialized) {
        const parsed = JSON.parse(serialized) as UserState;
        parsed.id = uid;
        if (!parsed.settings) parsed.settings = { ...DEFAULT_USER_SETTINGS };
        if (!parsed.unlockedTitles) parsed.unlockedTitles = ['Aprendiz Matemático'];
        if (!parsed.stats) parsed.stats = createDefaultUserState().stats;
        if (!parsed.achievements) parsed.achievements = {};

        // Safely determine highestUnlockedRank
        const currentTier = Math.floor(((parsed.level || 1) - 1) / 5);
        const highestUnlockedRank = Math.max(parsed.highestUnlockedRank ?? currentTier, currentTier);
        parsed.highestUnlockedRank = highestUnlockedRank;
        parsed.progressionVersion = PROGRESSION_VERSION;

        // Recalibrate level and rank based on totalXP while respecting highestUnlockedRank
        const levelData = LevelManager.getLevelDataFromTotalXP(parsed.totalXP || 0, highestUnlockedRank);
        parsed.level = levelData.level;
        parsed.currentLevelXP = levelData.currentLevelXP;
        parsed.xpForNextLevel = levelData.xpForNextLevel;
        parsed.levelProgressPercent = levelData.levelProgressPercent;
        const effectiveHighest = Math.max(highestUnlockedRank, Math.floor((levelData.level - 1) / 5));
        parsed.highestUnlockedRank = effectiveHighest;
        parsed.rank = RankManager.getRankForLevel(levelData.level, effectiveHighest);

        // Check weekly XP freshness
        const currentWeekId = getCurrentWeekId();
        if (parsed.currentWeekId !== currentWeekId) {
          parsed.currentWeekId = currentWeekId;
          parsed.weeklyXP = 0;
        }

        // Retroactively guarantee no achievements are missed
        const withEnglish = EnglishLearningEngine.ensureProgress(parsed);
        withEnglish.dailyMissions = EnglishLearningEngine.ensureDailyMissions(withEnglish);
        const check = AchievementEngine.checkNewAchievements(withEnglish);
        withEnglish.achievements = check.updatedAchievementsMap;
        withEnglish.unlockedTitles = check.updatedUnlockedTitles;

        return withEnglish;
      }
    } catch {
      // Fallback
    }

    const defaultState = createDefaultUserState('Matemático', uid);
    this.saveState(defaultState);
    return defaultState;
  }

  public static saveState(state: UserState): void {
    if (typeof window === 'undefined' || !state) return;
    try {
      const uid = state.id || getActiveUserId();
      const userKey = this.getUserStorageKey(uid);
      const stateToSave: UserState = {
        ...state,
        updatedAt: Date.now(),
      };
      localStorage.setItem(userKey, JSON.stringify(stateToSave));
      setActiveUserId(uid);

      // Asynchronous debounced cloud sync to Firestore
      if (cloudSyncTimeout) {
        clearTimeout(cloudSyncTimeout);
      }

      this.notifySync(true);
      cloudSyncTimeout = setTimeout(async () => {
        try {
          const success = await CloudStorageService.saveToCloud(stateToSave);
          if (success) {
            lastSuccessfulSyncAt = Date.now();
          }
        } catch {
          // Cloud sync will retry on next action
        } finally {
          this.notifySync(false);
        }
      }, 600);
    } catch {
      // LocalStorage quota or access error
    }
  }

  /**
   * Initializes cloud sync for the active user: loads cloud state and merges.
   */
  public static async syncWithCloud(currentState: UserState, onMerged: (merged: UserState) => void): Promise<void> {
    try {
      this.notifySync(true);
      const uid = currentState.id || getActiveUserId();
      const cloudData = await CloudStorageService.loadFromCloud(uid);

      if (cloudData) {
        const merged = this.mergeUserStates(currentState, cloudData);
        this.saveState(merged);
        await CloudStorageService.saveToCloud(merged);
        lastSuccessfulSyncAt = Date.now();
        onMerged(merged);
      } else {
        // First cloud save for this account
        await CloudStorageService.saveToCloud(currentState);
        lastSuccessfulSyncAt = Date.now();
      }
    } catch (e) {
      console.warn('Cloud sync notice:', e);
    } finally {
      this.notifySync(false);
    }
  }

  public static async restoreFromCloud(
    identifier: string,
    currentState: UserState
  ): Promise<{ success: boolean; state?: UserState; message: string }> {
    try {
      this.notifySync(true);
      const cleanId = identifier.trim();

      // 1. Try finding in cloud via universal lookup (email, username, name, id)
      let cloudData = await CloudStorageService.findUserByEmailOrCode(cleanId);
      if (!cloudData) {
        cloudData = await CloudStorageService.loadFromCloud(cleanId);
      }

      // 2. Local recovery is limited to the active profile on this device.
      if (!cloudData && typeof window !== 'undefined') {
        try {
          const activeId = currentState.id || getActiveUserId();
          const raw = localStorage.getItem(this.getUserStorageKey(activeId));
          const parsed = raw ? (JSON.parse(raw) as UserState) : null;
          const identifiers = [parsed?.id, parsed?.username, parsed?.email]
            .filter(Boolean)
            .map((value) => String(value).toLowerCase());
          if (parsed && parsed.id === activeId && identifiers.includes(cleanId.toLowerCase())) cloudData = parsed;
        } catch {}
      }

      if (cloudData) {
        const merged = this.mergeUserStates(currentState, cloudData);
        // Preserve target user ID if merging into active account
        merged.id = currentState.id || cloudData.id || getActiveUserId();
        if (cloudData.displayName && cloudData.displayName !== 'Matemático') {
          merged.displayName = cloudData.displayName;
          merged.name = cloudData.displayName;
        }
        if (cloudData.username && !cloudData.username.startsWith('@user_')) {
          merged.username = cloudData.username;
        }
        if (cloudData.avatar) merged.avatar = cloudData.avatar;
        if (cloudData.selectedTitle) merged.selectedTitle = cloudData.selectedTitle;

        this.saveState(merged);
        await CloudStorageService.saveToCloud(merged);
        lastSuccessfulSyncAt = Date.now();
        return {
          success: true,
          state: merged,
          message: `Perfil "${merged.displayName || merged.name}" (${merged.username || ''}) restaurado com sucesso! Nível ${merged.level}, ${merged.totalXP.toLocaleString()} XP.`,
        };
      } else {
        return {
          success: false,
          message: 'Nenhum registro encontrado para este usuário ou e-mail.',
        };
      }
    } catch (e) {
      return {
        success: false,
        message: 'Erro ao conectar ao banco de dados. Verifique sua conexão.',
      };
    } finally {
      this.notifySync(false);
    }
  }

  /**
   * Scans all local storage records and cloud database for recoverable profiles.
   */
  public static async scanAllLocalAndCloudProfiles(currentUid?: string): Promise<UserState[]> {
    const list: UserState[] = [];
    const seenIds = new Set<string>();

    // 1. Scan LocalStorage
    if (typeof window !== 'undefined') {
      const activeId = currentUid || getActiveUserId();
      const keys = [this.getUserStorageKey(activeId)];
      for (const k of keys) {
        try {
          const raw = localStorage.getItem(k);
          if (raw) {
            const u = JSON.parse(raw) as UserState;
            if (u && u.id === activeId && typeof u.level === 'number' && (u.totalXP > 0 || (u.stats && u.stats.totalQuestions > 0))) {
              if (!seenIds.has(u.id)) {
                seenIds.add(u.id);
                list.push(u);
              }
            }
          }
        } catch {}
      }
    }

    // 2. Scan Cloud Profiles
    try {
      const cloudProfiles = await CloudStorageService.searchProfiles();
      for (const u of cloudProfiles) {
        if (u && u.id && !seenIds.has(u.id)) {
          seenIds.add(u.id);
          list.push(u);
        }
      }
    } catch {}

    // Sort by highest XP first
    list.sort((a, b) => (b.totalXP || 0) - (a.totalXP || 0));
    return list;
  }

  public static enqueueSyncEvent(event: SyncEvent): void {
    if (typeof window === 'undefined') return;
    try {
      const queue = this.getSyncQueue();
      queue.push(event);
      localStorage.setItem(QUEUE_KEY, JSON.stringify(queue));
    } catch {
      // Ignore
    }
  }

  public static getSyncQueue(): SyncEvent[] {
    if (typeof window === 'undefined') return [];
    try {
      const item = localStorage.getItem(QUEUE_KEY);
      return item ? JSON.parse(item) : [];
    } catch {
      return [];
    }
  }

  public static clearSyncQueue(): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.removeItem(QUEUE_KEY);
    } catch {
      // Ignore
    }
  }
}
