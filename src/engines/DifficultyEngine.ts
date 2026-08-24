import { DIFFICULTY_CONFIG, getStreakBonusPercent, checkStreakMilestone } from '../config/difficultyConfig.js';
import type { StreakDifficultyThreshold } from '../config/difficultyConfig.js';
import type { OperationType, UserState, RecentAnswerRecord } from '../types.js';

export interface DifficultyProfile {
  targetDifficultyScore: number;
  structuralOperatorCount: number; // 1 to 4 (strictly <= 4)
  allowedOperations: OperationType[];
  allowParentheses: boolean;
  numericalScale: 'single' | 'double' | 'triple' | 'thousands' | 'unlimited';
  isBreathingQuestion: boolean;
  streakMilestoneTriggered: StreakDifficultyThreshold | null;
  streakBonusPercent: number;
  speedBonus: number;
  explanation: string;
}

export class DifficultyEngine {
  private static recentQuestionsCount = 0;

  /**
   * Primary pipeline method:
   * Translates player state, recent history, streak momentum, and speed into a rich Target Difficulty Profile.
   */
  public static computeTargetDifficulty(
    userState: UserState,
    forcedOperations?: OperationType[]
  ): DifficultyProfile {
    this.recentQuestionsCount++;

    // 1. Base Score from User Level & Overall Accuracy
    const baseFromLevel = Math.max(1.0, userState.level * 1.5);
    const accuracyMultiplier = userState.stats.accuracy > 0 ? (userState.stats.accuracy / 100) : 0.8;

    // 2. Per-operation baseline average
    const ops = forcedOperations && forcedOperations.length > 0
      ? forcedOperations
      : (['addition', 'subtraction', 'multiplication', 'division'] as OperationType[]);

    let opScoreSum = 0;
    for (const op of ops) {
      const opStat = userState.stats.byOperation[op];
      const opScore = opStat ? (opStat.difficultyScore || 1.0) : 1.0;
      opScoreSum += opScore;
    }
    const avgOpScore = ops.length > 0 ? opScoreSum / ops.length : 1.0;

    // 3. Streak Multiplier & Threshold Table (+0.5% at 10, +1.5% at 20, +2.5% at 40, +3.5% at 80...)
    const currentStreak = userState.combo || 0;
    const streakBonusPct = getStreakBonusPercent(currentStreak);
    const streakMultiplier = 1.0 + (streakBonusPct / 100.0);
    const streakMilestone = checkStreakMilestone(currentStreak);

    // 4. Speed Bonus & Recent Sliding Window Analysis
    let speedBonus = 0;
    const recentHistory = userState.recentHistory || [];
    if (recentHistory.length >= 3) {
      const lastN = recentHistory.slice(-5);
      const avgRecentTime = lastN.reduce((acc, r) => acc + r.timeTakenMs, 0) / lastN.length;
      const recentAccuracy = lastN.filter((r) => r.isCorrect).length / lastN.length;

      if (avgRecentTime < DIFFICULTY_CONFIG.SPEED_RULES.FAST_THRESHOLD_MS && recentAccuracy >= 0.8) {
        speedBonus = DIFFICULTY_CONFIG.SPEED_RULES.FAST_BONUS_SCORE * (1 + currentStreak * 0.05);
      } else if (avgRecentTime > DIFFICULTY_CONFIG.SPEED_RULES.SLOW_THRESHOLD_MS) {
        speedBonus = -1.5;
      }
    }

    // 5. Raw Target Difficulty Score Calculation
    let rawScore = ((baseFromLevel * 0.4 + avgOpScore * 0.6) * accuracyMultiplier) * streakMultiplier + speedBonus;
    rawScore = Math.max(1.0, rawScore);

    // 6. Controlled Jitter (±8%) for organic, non-rigid progression
    const jitterFactor = 1.0 + ((Math.random() * 2 - 1) * (DIFFICULTY_CONFIG.VARIANCE_JITTER_PCT / 100));
    let targetScore = Math.round(rawScore * jitterFactor * 10) / 10;

    // 7. Breathing Room Mechanic:
    // Every few questions at high difficulty, insert a slightly lighter question to prevent cognitive exhaustion
    const isBreathingQuestion = targetScore > 50 && this.recentQuestionsCount % DIFFICULTY_CONFIG.BREATHING_INTERVAL === 0;
    if (isBreathingQuestion) {
      targetScore = Math.max(15, targetScore * 0.7);
    }

    // 8. Structural Difficulty Scaling (Operators 1 to 4)
    // Strictly capped at MAX_OPERATORS_PER_EXPRESSION = 4
    let structuralOperatorCount = 1;
    if (targetScore >= 110 && currentStreak >= 35 && !isBreathingQuestion) {
      structuralOperatorCount = 4; // Peak structural ceiling (4 operators, 5 operands)
    } else if (targetScore >= 55 && currentStreak >= 18 && !isBreathingQuestion) {
      // High tier: mix of 3 or occasionally 4 operators
      structuralOperatorCount = Math.random() < 0.65 ? 3 : 2;
    } else if (targetScore >= 22 && currentStreak >= 8) {
      // Intermediate tier: mix of 2 or 1 operator
      structuralOperatorCount = Math.random() < 0.75 ? 2 : 1;
    } else {
      structuralOperatorCount = 1;
    }

    // Hard guarantee: never exceed MAX_OPERATORS_PER_EXPRESSION = 4
    structuralOperatorCount = Math.min(DIFFICULTY_CONFIG.MAX_OPERATORS_PER_EXPRESSION, Math.max(1, structuralOperatorCount));

    // 9. Numerical Scale Determination
    let numericalScale: 'single' | 'double' | 'triple' | 'thousands' | 'unlimited' = 'single';
    if (targetScore <= 10) {
      numericalScale = 'single';
    } else if (targetScore <= 35) {
      numericalScale = 'double';
    } else if (targetScore <= 80) {
      numericalScale = 'triple';
    } else if (targetScore <= 180) {
      numericalScale = 'thousands';
    } else {
      numericalScale = 'unlimited';
    }

    // 10. Parentheses Allowance
    const allowParentheses =
      !isBreathingQuestion &&
      structuralOperatorCount >= 2 &&
      targetScore >= DIFFICULTY_CONFIG.PARENTHESES.MIN_SCORE_FOR_PARENTHESES &&
      currentStreak >= DIFFICULTY_CONFIG.PARENTHESES.MIN_STREAK_FOR_PARENTHESES &&
      Math.random() < DIFFICULTY_CONFIG.PARENTHESES.CHANCE_AT_HIGH_DIFFICULTY;

    return {
      targetDifficultyScore: targetScore,
      structuralOperatorCount,
      allowedOperations: ops,
      allowParentheses,
      numericalScale,
      isBreathingQuestion,
      streakMilestoneTriggered: streakMilestone,
      streakBonusPercent: streakBonusPct,
      speedBonus,
      explanation: `Dificuldade: ${targetScore.toFixed(1)} (${structuralOperatorCount} ops, escala: ${numericalScale})`,
    };
  }

  /**
   * Updates an operation's individual difficulty score after an answer.
   * On mistake: applies gentle decay rather than resetting to 1.
   */
  public static updateOperationDifficulty(
    currentDifficulty: number,
    isCorrect: boolean,
    timeTakenMs: number,
    consecutiveMistakes: number = 0
  ): number {
    let newScore = currentDifficulty;

    if (isCorrect) {
      // Speed-based progression
      if (timeTakenMs <= DIFFICULTY_CONFIG.SPEED_RULES.FAST_THRESHOLD_MS) {
        newScore += 1.8;
      } else if (timeTakenMs <= DIFFICULTY_CONFIG.SPEED_RULES.NORMAL_THRESHOLD_MS) {
        newScore += 0.9;
      } else if (timeTakenMs <= DIFFICULTY_CONFIG.SPEED_RULES.SLOW_THRESHOLD_MS) {
        newScore += 0.4;
      } else {
        // Slow response: gentle minimal gain
        newScore += 0.1;
      }
    } else {
      // Gentle decay: drops by configured single mistake percentage
      const dropPct =
        DIFFICULTY_CONFIG.MISTAKE_PENALTY.SINGLE_MISTAKE_REDUCTION_PCT +
        consecutiveMistakes * DIFFICULTY_CONFIG.MISTAKE_PENALTY.CONSECUTIVE_MISTAKE_EXTRA_PCT;
      
      const reduction = Math.max(1.5, (currentDifficulty * dropPct) / 100.0);
      newScore = Math.max(DIFFICULTY_CONFIG.MISTAKE_PENALTY.MIN_DIFFICULTY_FLOOR, currentDifficulty - reduction);
    }

    return Math.round(newScore * 10) / 10;
  }

  /**
   * Evaluates overall difficulty for backward compatibility
   */
  public static calculateDifficulty(userState: UserState, targetOp?: OperationType): number {
    const profile = this.computeTargetDifficulty(userState, targetOp ? [targetOp] : undefined);
    return profile.targetDifficultyScore;
  }
}
