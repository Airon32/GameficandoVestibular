/**
 * Central configuration and calculation engine for progressive Streak & Speed XP.
 * Defines all streak multiplier thresholds, diminishing returns formulas, speed tiers,
 * and anti-farming guards.
 */

export interface StreakMilestone {
  streak: number;
  multiplier: number;
  bonusPercentText: string;
  label: string;
  badgeEmoji: string;
}

export const STREAK_XP_THRESHOLDS: { minStreak: number; maxStreak: number; multiplier: number; label: string }[] = [
  { minStreak: 0, maxStreak: 4, multiplier: 1.00, label: 'Sem bônus' },
  { minStreak: 5, maxStreak: 9, multiplier: 1.05, label: '+5% Bônus' },
  { minStreak: 10, maxStreak: 19, multiplier: 1.10, label: '+10% Bônus' },
  { minStreak: 20, maxStreak: 39, multiplier: 1.20, label: '+20% Bônus' },
  { minStreak: 40, maxStreak: 79, multiplier: 1.35, label: '+35% Bônus' },
  { minStreak: 80, maxStreak: 159, multiplier: 1.50, label: '+50% Bônus' },
  { minStreak: 160, maxStreak: 319, multiplier: 1.75, label: '+75% Bônus' },
  { minStreak: 320, maxStreak: Infinity, multiplier: 2.00, label: '2.00x+ Bônus Cósmico' },
];

export const STREAK_MILESTONES: StreakMilestone[] = [
  { streak: 5, multiplier: 1.05, bonusPercentText: '+5%', label: 'Ritmo Inicial', badgeEmoji: '🔥' },
  { streak: 10, multiplier: 1.10, bonusPercentText: '+10%', label: 'Esquentando', badgeEmoji: '🔥' },
  { streak: 20, multiplier: 1.20, bonusPercentText: '+20%', label: 'Embalado', badgeEmoji: '⚡' },
  { streak: 40, multiplier: 1.35, bonusPercentText: '+35%', label: 'Foco Total', badgeEmoji: '🧠' },
  { streak: 80, multiplier: 1.50, bonusPercentText: '+50%', label: 'Imparável', badgeEmoji: '👑' },
  { streak: 160, multiplier: 1.75, bonusPercentText: '+75%', label: 'Máquina', badgeEmoji: '🌌' },
  { streak: 320, multiplier: 2.00, bonusPercentText: '+100%', label: 'Calculadora Humana', badgeEmoji: '🪐' },
  { streak: 640, multiplier: 2.15, bonusPercentText: '+115%', label: 'Além dos Limites', badgeEmoji: '💎' },
  { streak: 1280, multiplier: 2.30, bonusPercentText: '+130%', label: 'Infinito Real', badgeEmoji: '✨' },
  { streak: 2560, multiplier: 2.45, bonusPercentText: '+145%', label: 'Transcendental', badgeEmoji: '🔮' },
  { streak: 5120, multiplier: 2.60, bonusPercentText: '+160%', label: 'Precisão Absoluta', badgeEmoji: '🌟' },
];

/**
 * Returns the exact streak XP multiplier for any given number of consecutive correct answers.
 * Implements explicit thresholds up to 320, and diminishing log2 step returns above 320.
 */
export function getStreakXpMultiplier(streak: number): number {
  if (streak <= 0) return 1.00;
  if (streak < 5) return 1.00;
  if (streak < 10) return 1.05;
  if (streak < 20) return 1.10;
  if (streak < 40) return 1.20;
  if (streak < 80) return 1.35;
  if (streak < 160) return 1.50;
  if (streak < 320) return 1.75;
  if (streak === 320) return 2.00;

  // Beyond 320: Progressive diminishing returns
  // 320  -> 2.00x
  // 640  -> 2.15x
  // 1280 -> 2.30x
  // 2560 -> 2.45x
  // 5120 -> 2.60x
  const doublings = Math.log2(streak / 320);
  const raw = 2.00 + doublings * 0.15;
  // Round to 2 decimal places cleanly
  return Math.round(raw * 100) / 100;
}

/**
 * Checks if reaching this exact streak triggers a new milestone notification banner.
 */
export function checkStreakXpMilestone(streak: number): StreakMilestone | null {
  return STREAK_MILESTONES.find((m) => m.streak === streak) || null;
}

/**
 * Returns the milestone tier info for display in the UI (e.g. badge, color, next milestone)
 */
export function getStreakTierDisplay(streak: number): {
  multiplier: number;
  multiplierText: string;
  nextMilestone: number | null;
  currentMilestone: StreakMilestone | null;
  progressToNextMilestone: number;
  intensityLevel: 'none' | 'low' | 'medium' | 'high' | 'epic' | 'legendary' | 'cosmic';
} {
  const multiplier = getStreakXpMultiplier(streak);
  const multiplierText = `×${multiplier.toFixed(2)}`;

  let currentMilestone: StreakMilestone | null = null;
  let nextMilestone: number | null = null;

  for (let i = 0; i < STREAK_MILESTONES.length; i++) {
    if (streak >= STREAK_MILESTONES[i].streak) {
      currentMilestone = STREAK_MILESTONES[i];
    } else {
      nextMilestone = STREAK_MILESTONES[i].streak;
      break;
    }
  }

  let progressToNextMilestone = 100;
  if (nextMilestone !== null) {
    const prevThreshold = currentMilestone ? currentMilestone.streak : 0;
    const range = nextMilestone - prevThreshold;
    const current = streak - prevThreshold;
    progressToNextMilestone = Math.min(100, Math.max(0, Math.round((current / range) * 100)));
  }

  let intensityLevel: 'none' | 'low' | 'medium' | 'high' | 'epic' | 'legendary' | 'cosmic' = 'none';
  if (streak >= 320) intensityLevel = 'cosmic';
  else if (streak >= 160) intensityLevel = 'legendary';
  else if (streak >= 80) intensityLevel = 'epic';
  else if (streak >= 40) intensityLevel = 'high';
  else if (streak >= 20) intensityLevel = 'medium';
  else if (streak >= 5) intensityLevel = 'low';

  return {
    multiplier,
    multiplierText,
    nextMilestone,
    currentMilestone,
    progressToNextMilestone,
    intensityLevel,
  };
}
