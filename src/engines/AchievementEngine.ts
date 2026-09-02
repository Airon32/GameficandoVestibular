import { ACHIEVEMENTS_LIST } from '../config/constants';
import { Achievement, UserState } from '../types';

export class AchievementEngine {
  /**
   * Checks all achievements against current user state and returns newly unlocked ones
   */
  public static checkNewAchievements(
    userState: UserState,
    lastCorrectTimeMs?: number
  ): {
    newlyUnlocked: Achievement[];
    updatedAchievementsMap: Record<string, number>;
    updatedUnlockedTitles: string[];
    bonusXP: number;
  } {
    const newlyUnlocked: Achievement[] = [];
    const updatedAchievementsMap = { ...userState.achievements };
    const updatedUnlockedTitles = [...userState.unlockedTitles];
    let bonusXP = 0;

    const multCorrect = userState.stats.byOperation['multiplication']?.correct || 0;
    const divCorrect = userState.stats.byOperation['division']?.correct || 0;

    const metricValues: Record<string, number> = {
      totalCorrect: userState.stats.totalCorrect,
      totalQuestions: userState.stats.totalQuestions,
      maxCombo: userState.maxCombo,
      currentStreak: userState.streak.currentStreak,
      level: userState.level,
      rankTierIndex: userState.rank.tierIndex,
      multCorrect,
      divCorrect,
      fastestCorrectTime: lastCorrectTimeMs !== undefined ? lastCorrectTimeMs : 999999,
      englishWordsMastered: userState.englishProgress?.stats.wordsMastered || 0,
      englishWordsSeen: Object.values(userState.englishProgress?.vocabulary || {}).filter((entry: { timesSeen: number }) => entry.timesSeen > 0).length,
      englishListeningCount: userState.englishProgress?.stats.listeningCount || 0,
      englishSpeakingCount: userState.englishProgress?.stats.speakingCount || 0,
      englishCefrIndex: userState.englishProgress
        ? ['a0', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'].indexOf(userState.englishProgress.estimatedCefr)
        : 0,
      englishQuestions: userState.englishProgress?.stats.questionsAnswered || 0,
    };

    for (const achievement of (ACHIEVEMENTS_LIST || [])) {
      if (!achievement || !achievement.id) continue;
      // If already unlocked, skip
      if (updatedAchievementsMap[achievement.id]) {
        continue;
      }

      let isUnlocked = false;
      const currentVal = metricValues[achievement.targetMetric];

      if (achievement.targetMetric === 'fastestCorrectTime') {
        if (lastCorrectTimeMs !== undefined && lastCorrectTimeMs <= achievement.targetValue) {
          isUnlocked = true;
        }
      } else {
        if (currentVal !== undefined && currentVal >= achievement.targetValue) {
          isUnlocked = true;
        }
      }

      if (isUnlocked) {
        const now = Date.now();
        updatedAchievementsMap[achievement.id] = now;
        newlyUnlocked.push({
          ...achievement,
          unlockedAt: now,
        });

        if (achievement.rewardXP) {
          bonusXP += achievement.rewardXP;
        }

        if (achievement.rewardTitle && !updatedUnlockedTitles.includes(achievement.rewardTitle)) {
          updatedUnlockedTitles.push(achievement.rewardTitle);
        }
      }
    }

    return {
      newlyUnlocked,
      updatedAchievementsMap,
      updatedUnlockedTitles,
      bonusXP,
    };
  }
}
