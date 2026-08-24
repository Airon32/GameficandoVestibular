import {
  TIER_PROGRESSION_TABLE,
  DIVISION_PERCENT_WEIGHTS,
  getTierThreshold,
} from '../config/progressionConfig';

export interface PlayerArchetypeSimulation {
  name: string;
  minutesPerDay: number;
  accuracy: number;
  averageSpeedSeconds: number;
  averageStreak: number;
  estimatedDailyXP: number;
  estimatedDaysToInfinite: number;
  estimatedMonthsToInfinite: number;
}

export interface RankDistributionMetric {
  tierIndex: number;
  rankName: string;
  minTotalXP: number;
  maxTotalXP: number;
  estimatedDaysToPass: number;
  estimatedHoursToPass: number;
  cumulativeDaysFromStart: number;
}

export class LevelManager {
  /**
   * Calculates the XP needed to advance from level `level` to `level + 1`.
   * Follows the authentic 30-Tier progressive block curve with 5 divisions per tier.
   * "O jogador chega quando merece chegar" — No artificial time constraints.
   *
   * Division weights within each tier:
   * Division 1 (I): 15%
   * Division 2 (II): 17%
   * Division 3 (III): 19%
   * Division 4 (IV): 22%
   * Division 5 (V): 27% (The ultimate hurdle of each rank)
   */
  public static getXPForLevel(level: number): number {
    if (level <= 0) return 3000;

    // Standard 30 Tiers (Levels 1 to 150)
    if (level >= 1 && level <= 150) {
      const tierIndex = Math.floor((level - 1) / 5);
      const divisionIndex = (level - 1) % 5; // 0 to 4
      const tier = TIER_PROGRESSION_TABLE[tierIndex] || TIER_PROGRESSION_TABLE[0];
      const weight = DIVISION_PERCENT_WEIGHTS[divisionIndex] ?? 0.2;
      return Math.round(tier.xpSpan * weight);
    }

    // Ascension Tiers beyond Level 150 (Infinito ∞1, ∞2, etc.)
    const ascensionDegree = Math.floor((level - 151) / 5) + 1;
    const divisionIndex = (level - 151) % 5;
    const ascensionSpan = 180000 + (ascensionDegree - 1) * 20000;
    const weight = DIVISION_PERCENT_WEIGHTS[divisionIndex] ?? 0.2;
    return Math.round(ascensionSpan * weight);
  }

  /**
   * Given total accumulated lifetime XP, computes the current level,
   * the XP within the current level, and XP needed to complete the current level.
   * Also respects highestUnlockedRank as a permanent safeguard against demotion.
   */
  public static getLevelDataFromTotalXP(
    totalXP: number,
    highestUnlockedRank?: number
  ): {
    level: number;
    currentLevelXP: number;
    xpForNextLevel: number;
    levelProgressPercent: number;
  } {
    let level = 1;
    let accumulatedXP = 0;

    // Determine level from raw XP
    while (true) {
      const xpNeeded = this.getXPForLevel(level);
      if (accumulatedXP + xpNeeded > totalXP) {
        const currentLevelXP = Math.max(0, totalXP - accumulatedXP);
        const levelProgressPercent = Math.min(100, Math.max(0, (currentLevelXP / xpNeeded) * 100));

        // Safeguard: if a player's highestUnlockedRank is higher than the computed tier,
        // prevent demoting their rank tier level below highestUnlockedRank * 5 + 1.
        if (highestUnlockedRank !== undefined && highestUnlockedRank > 0) {
          const minSafeLevel = highestUnlockedRank * 5 + 1;
          if (level < minSafeLevel) {
            const safeXpNeeded = this.getXPForLevel(minSafeLevel);
            return {
              level: minSafeLevel,
              currentLevelXP: 0,
              xpForNextLevel: safeXpNeeded,
              levelProgressPercent: 0,
            };
          }
        }

        return {
          level,
          currentLevelXP,
          xpForNextLevel: xpNeeded,
          levelProgressPercent: Math.round(levelProgressPercent * 10) / 10,
        };
      }
      accumulatedXP += xpNeeded;
      level++;

      // Prevent potential runaway loop in edge conditions
      if (level > 1000) {
        break;
      }
    }

    return {
      level,
      currentLevelXP: 0,
      xpForNextLevel: this.getXPForLevel(level),
      levelProgressPercent: 0,
    };
  }

  /**
   * Computes cumulative XP required to reach the start of a given level.
   */
  public static getTotalXPToReachLevel(targetLevel: number): number {
    let sum = 0;
    for (let l = 1; l < targetLevel; l++) {
      sum += this.getXPForLevel(l);
    }
    return sum;
  }

  /**
   * Simulates progression for game economy validation across player archetypes.
   * Telemetry and analytics only — not a system constraint.
   */
  public static simulateArchetype(
    name: string,
    minutesPerDay: number,
    accuracy: number, // 0 to 1
    averageSpeedSeconds: number, // e.g. 5.5s
    averageStreakMultiplier: number // e.g. 1.20
  ): PlayerArchetypeSimulation {
    const totalXPTo150 = this.getTotalXPToReachLevel(150); // Total XP to reach Level 150 (Infinito V)
    
    // Cycle time per question including brief UI transition
    const totalCycleSeconds = averageSpeedSeconds + 1.2;
    const questionsPerDay = Math.floor((minutesPerDay * 60) / totalCycleSeconds);

    // Speed XP base
    let baseXP = 30;
    if (averageSpeedSeconds > 20) baseXP = 10;
    else if (averageSpeedSeconds > 10) baseXP = 20;

    // Expected daily XP = questions * accuracy * baseXP * streakMultiplier
    const dailyXP = Math.floor(questionsPerDay * accuracy * baseXP * averageStreakMultiplier);
    const estimatedDays = Math.ceil(totalXPTo150 / Math.max(1, dailyXP));
    const estimatedMonths = Math.round((estimatedDays / 30.4) * 10) / 10;

    return {
      name,
      minutesPerDay,
      accuracy,
      averageSpeedSeconds,
      averageStreak: averageStreakMultiplier,
      estimatedDailyXP: dailyXP,
      estimatedDaysToInfinite: estimatedDays,
      estimatedMonthsToInfinite: estimatedMonths,
    };
  }

  /**
   * Generates administrative metrics for rank distribution analysis across the 30 tiers.
   */
  public static getRankDistributionAnalytics(
    estimatedDailyXP: number = 3500
  ): RankDistributionMetric[] {
    let cumulativeXP = 0;
    let cumulativeDays = 0;

    return TIER_PROGRESSION_TABLE.map((tier) => {
      const tierDays = Math.ceil(tier.xpSpan / estimatedDailyXP);
      const tierHours = Math.round((tierDays * 0.5) * 10) / 10;
      cumulativeDays += tierDays;
      cumulativeXP = tier.maxTotalXP;

      return {
        tierIndex: tier.tierIndex,
        rankName: tier.rankName,
        minTotalXP: tier.minTotalXP,
        maxTotalXP: tier.maxTotalXP,
        estimatedDaysToPass: tierDays,
        estimatedHoursToPass: tierHours,
        cumulativeDaysFromStart: cumulativeDays,
      };
    });
  }
}
