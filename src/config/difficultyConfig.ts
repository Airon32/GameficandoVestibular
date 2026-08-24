/**
 * Central configuration for the Adaptive Mathematical Difficulty Engine.
 * All thresholds, ceilings, scaling constants, and structural limits are defined here.
 */

export interface StreakDifficultyThreshold {
  streak: number;
  bonusPercent: number; // e.g. 0.5 for +0.5%
  label: string;
  badgeEmoji: string;
}

export const DIFFICULTY_CONFIG = {
  // STRICT STRUCTURAL CEILINGS
  MAX_OPERATORS_PER_EXPRESSION: 4,
  MAX_OPERANDS_PER_EXPRESSION: 5,

  // Base difficulty initialization
  BASE_DIFFICULTY: 1.0,

  // Streak Multiplier Threshold Table (Explicit milestones)
  STREAK_THRESHOLDS: [
    { streak: 10, bonusPercent: 0.5, label: 'Ritmo Aquecido', badgeEmoji: '🔥' },
    { streak: 20, bonusPercent: 1.5, label: 'Foco Absoluto', badgeEmoji: '⚡' },
    { streak: 40, bonusPercent: 2.5, label: 'Mestre do Cálculo', badgeEmoji: '🧠' },
    { streak: 80, bonusPercent: 3.5, label: 'Domínio Supremo', badgeEmoji: '👑' },
    { streak: 160, bonusPercent: 4.5, label: 'Transcendência', badgeEmoji: '🌌' },
    { streak: 320, bonusPercent: 5.5, label: 'Poder Matemático', badgeEmoji: '🪐' },
    { streak: 640, bonusPercent: 6.5, label: 'Hiperfoco Cósmico', badgeEmoji: '💎' },
    { streak: 1280, bonusPercent: 7.5, label: 'Infinito Real', badgeEmoji: '✨' },
  ] as StreakDifficultyThreshold[],

  // Speed-based dynamic adjustment
  SPEED_RULES: {
    FAST_THRESHOLD_MS: 4500, // < 4.5s -> fast bonus
    FAST_BONUS_SCORE: 1.2,
    NORMAL_THRESHOLD_MS: 12000,
    SLOW_THRESHOLD_MS: 24000, // > 24s -> dampens increase
    SLOW_DAMPENER_FACTOR: 0.3,
  },

  // Mistake degradation (gentle fall, not reset)
  MISTAKE_PENALTY: {
    SINGLE_MISTAKE_REDUCTION_PCT: 6.0, // Drop difficulty by ~6% on a single mistake
    CONSECUTIVE_MISTAKE_EXTRA_PCT: 4.0, // Additional drop per consecutive mistake
    MIN_DIFFICULTY_FLOOR: 1.0,
  },

  // Structural Operator Thresholds based on Difficulty Score & Streak
  STRUCTURAL_LEVELS: {
    ONE_OP: { minScore: 1, maxScore: 25, minStreakForChance: 0 },
    TWO_OPS: { minScore: 22, maxScore: 65, minStreakForChance: 10 },
    THREE_OPS: { minScore: 55, maxScore: 130, minStreakForChance: 20 },
    FOUR_OPS: { minScore: 110, maxScore: Infinity, minStreakForChance: 40 }, // Peak structure (4 operators)
  },

  // Parentheses introduction
  PARENTHESES: {
    MIN_SCORE_FOR_PARENTHESES: 70,
    MIN_STREAK_FOR_PARENTHESES: 25,
    CHANCE_AT_HIGH_DIFFICULTY: 0.35, // 35% chance to format with parentheses when eligible
  },

  // Breathing Room: after a series of peak-complexity questions, give a brief 1-step lighter question
  BREATHING_INTERVAL: 6, // Every 6 questions at high tier, give a lighter pacing question

  // Jitter range (±8% to keep questions naturally varied and prevent rigid repetition)
  VARIANCE_JITTER_PCT: 8,

  // Sliding window size of recent answers
  RECENT_WINDOW_SIZE: 20,
};

/**
 * Computes the cumulative streak bonus percent for any streak >= 0 using threshold lookup + logarithmic smooth continuation.
 */
export function getStreakBonusPercent(streak: number): number {
  if (streak < 10) return 0;

  // Exact matching or upper bound in table
  const thresholdList = DIFFICULTY_CONFIG.STREAK_THRESHOLDS;
  let bonus = 0;

  for (const item of thresholdList) {
    if (streak >= item.streak) {
      bonus = item.bonusPercent;
    } else {
      break;
    }
  }

  // If streak exceeds the highest defined threshold (1280), scale continuously with smooth log step
  const lastThreshold = thresholdList[thresholdList.length - 1];
  if (streak > lastThreshold.streak) {
    const extraSteps = Math.log2(streak / lastThreshold.streak);
    bonus = lastThreshold.bonusPercent + Math.min(5.0, extraSteps * 1.0);
  }

  return bonus;
}

/**
 * Returns streak threshold milestone if exactly reached or triggered
 */
export function checkStreakMilestone(streak: number): StreakDifficultyThreshold | null {
  return DIFFICULTY_CONFIG.STREAK_THRESHOLDS.find((t) => t.streak === streak) || null;
}
