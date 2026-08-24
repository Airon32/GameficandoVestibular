/**
 * PROGRESSION & RANK ECONOMY ENGINE CONFIGURATION
 *
 * Core Philosophy: "O jogador chega quando merece chegar" (The player arrives when they deserve to arrive).
 * - Progression is designed to be long, challenging, deeply rewarding, and permanent across years.
 * - No artificial monthly timeline constraints or caps.
 * - 30 Distinct Tiers with 5 Progressive Divisions each (Levels 1 to 150), culminating at ~2,100,000 XP (Infinito V).
 * - Beyond Level 150: Multi-degree Ascension (Infinito ∞1, ∞2...).
 * - Division weights within each tier: 15% (I), 17% (II), 19% (III), 22% (IV), 27% (V), making the final step
 *   of every tier the steepest and most memorable.
 * - Permanent Rank Safeguard: Balance changes can never demote a player's highest unlocked rank.
 * - Central Max Effective Multiplier Guardrail to prevent XP inflation during event + streak stacking.
 */

export const PROGRESSION_VERSION = 2;

/**
 * Maximum combined multiplier stacking ceiling across streaks, difficulty modifiers, and events.
 * Prevents unintended XP explosions and preserves the long-term economy.
 */
export const MAX_EFFECTIVE_XP_MULTIPLIER = 3.5;

/**
 * Progressive division weights within each rank tier (sum = 1.00 / 100%)
 * Division I  -> II:  15%
 * Division II -> III: 17%
 * Division III-> IV:  19%
 * Division IV -> V:   22%
 * Division V  -> Next: 27% (The ultimate hurdle of each rank)
 */
export const DIVISION_PERCENT_WEIGHTS = [0.15, 0.17, 0.19, 0.22, 0.27] as const;

export interface TierProgressionThreshold {
  tierIndex: number;
  rankId: string;
  rankName: string;
  minTotalXP: number;
  maxTotalXP: number;
  xpSpan: number;
  startLevel: number;
  endLevel: number;
}

/**
 * Master 30-Tier Progressive Block Curve Table
 */
export const TIER_PROGRESSION_TABLE: TierProgressionThreshold[] = [
  // 1-4: Iniciação (+20.000 XP por Rank)
  { tierIndex: 0, rankId: 'madeira', rankName: 'Madeira', minTotalXP: 0, maxTotalXP: 20000, xpSpan: 20000, startLevel: 1, endLevel: 5 },
  { tierIndex: 1, rankId: 'pedregulho', rankName: 'Pedregulho', minTotalXP: 20000, maxTotalXP: 40000, xpSpan: 20000, startLevel: 6, endLevel: 10 },
  { tierIndex: 2, rankId: 'pedra', rankName: 'Pedra', minTotalXP: 40000, maxTotalXP: 60000, xpSpan: 20000, startLevel: 11, endLevel: 15 },
  { tierIndex: 3, rankId: 'cobre', rankName: 'Cobre', minTotalXP: 60000, maxTotalXP: 80000, xpSpan: 20000, startLevel: 16, endLevel: 20 },

  // 5-8: Metais & Nobreza Inicial (+30.000 XP por Rank)
  { tierIndex: 4, rankId: 'ferro', rankName: 'Ferro', minTotalXP: 80000, maxTotalXP: 110000, xpSpan: 30000, startLevel: 21, endLevel: 25 },
  { tierIndex: 5, rankId: 'bronze', rankName: 'Bronze', minTotalXP: 110000, maxTotalXP: 140000, xpSpan: 30000, startLevel: 26, endLevel: 30 },
  { tierIndex: 6, rankId: 'aco', rankName: 'Aço', minTotalXP: 140000, maxTotalXP: 170000, xpSpan: 30000, startLevel: 31, endLevel: 35 },
  { tierIndex: 7, rankId: 'prata', rankName: 'Prata', minTotalXP: 170000, maxTotalXP: 200000, xpSpan: 30000, startLevel: 36, endLevel: 40 },

  // 9-12: Nobreza & Gemas (+40.000 XP por Rank)
  { tierIndex: 8, rankId: 'ouro', rankName: 'Ouro', minTotalXP: 200000, maxTotalXP: 240000, xpSpan: 40000, startLevel: 41, endLevel: 45 },
  { tierIndex: 9, rankId: 'platina', rankName: 'Platina', minTotalXP: 240000, maxTotalXP: 280000, xpSpan: 40000, startLevel: 46, endLevel: 50 },
  { tierIndex: 10, rankId: 'esmeralda', rankName: 'Esmeralda', minTotalXP: 280000, maxTotalXP: 320000, xpSpan: 40000, startLevel: 51, endLevel: 55 },
  { tierIndex: 11, rankId: 'safira', rankName: 'Safira', minTotalXP: 320000, maxTotalXP: 360000, xpSpan: 40000, startLevel: 56, endLevel: 60 },

  // 13-14: Gemas Raras (+50.000 XP por Rank)
  { tierIndex: 12, rankId: 'rubi', rankName: 'Rubi', minTotalXP: 360000, maxTotalXP: 410000, xpSpan: 50000, startLevel: 61, endLevel: 65 },
  { tierIndex: 13, rankId: 'ametista', rankName: 'Ametista', minTotalXP: 410000, maxTotalXP: 460000, xpSpan: 50000, startLevel: 66, endLevel: 70 },

  // 15-16: Diamante & Obsidiana (+60.000 XP por Rank)
  { tierIndex: 14, rankId: 'diamante', rankName: 'Diamante', minTotalXP: 460000, maxTotalXP: 520000, xpSpan: 60000, startLevel: 71, endLevel: 75 },
  { tierIndex: 15, rankId: 'obsidiana', rankName: 'Obsidiana', minTotalXP: 520000, maxTotalXP: 580000, xpSpan: 60000, startLevel: 76, endLevel: 80 },

  // 17-18: Titânio & Mestre (+70.000 XP por Rank)
  { tierIndex: 16, rankId: 'titanio', rankName: 'Titânio', minTotalXP: 580000, maxTotalXP: 650000, xpSpan: 70000, startLevel: 81, endLevel: 85 },
  { tierIndex: 17, rankId: 'mestre', rankName: 'Mestre', minTotalXP: 650000, maxTotalXP: 720000, xpSpan: 70000, startLevel: 86, endLevel: 90 },

  // 19-20: Grão-Mestre & Lendário (+80.000 XP por Rank)
  { tierIndex: 18, rankId: 'grao_mestre', rankName: 'Grão-Mestre', minTotalXP: 720000, maxTotalXP: 800000, xpSpan: 80000, startLevel: 91, endLevel: 95 },
  { tierIndex: 19, rankId: 'lendario', rankName: 'Lendário', minTotalXP: 800000, maxTotalXP: 880000, xpSpan: 80000, startLevel: 96, endLevel: 100 },

  // 21-22: Mítico & Arcano (+90.000 XP por Rank)
  { tierIndex: 20, rankId: 'mitico', rankName: 'Mítico', minTotalXP: 880000, maxTotalXP: 970000, xpSpan: 90000, startLevel: 101, endLevel: 105 },
  { tierIndex: 21, rankId: 'arcano', rankName: 'Arcano', minTotalXP: 970000, maxTotalXP: 1060000, xpSpan: 90000, startLevel: 106, endLevel: 110 },

  // 23-24: Celestial & Estelar (+100.000 XP por Rank)
  { tierIndex: 22, rankId: 'celestial', rankName: 'Celestial', minTotalXP: 1060000, maxTotalXP: 1160000, xpSpan: 100000, startLevel: 111, endLevel: 115 },
  { tierIndex: 23, rankId: 'estelar', rankName: 'Estelar', minTotalXP: 1160000, maxTotalXP: 1260000, xpSpan: 100000, startLevel: 116, endLevel: 120 },

  // 25-26: Cósmico & Galáctico (+120.000 XP por Rank)
  { tierIndex: 24, rankId: 'cosmico', rankName: 'Cósmico', minTotalXP: 1260000, maxTotalXP: 1380000, xpSpan: 120000, startLevel: 121, endLevel: 125 },
  { tierIndex: 25, rankId: 'galactico', rankName: 'Galáctico', minTotalXP: 1380000, maxTotalXP: 1500000, xpSpan: 120000, startLevel: 126, endLevel: 130 },

  // 27: Universal (+130.000 XP)
  { tierIndex: 26, rankId: 'universal', rankName: 'Universal', minTotalXP: 1500000, maxTotalXP: 1630000, xpSpan: 130000, startLevel: 131, endLevel: 135 },

  // 28: Transcendente (+150.000 XP)
  { tierIndex: 27, rankId: 'transcendente', rankName: 'Transcendente', minTotalXP: 1630000, maxTotalXP: 1780000, xpSpan: 150000, startLevel: 136, endLevel: 140 },

  // 29: Absoluto (+160.000 XP)
  { tierIndex: 28, rankId: 'absoluto', rankName: 'Absoluto', minTotalXP: 1780000, maxTotalXP: 1940000, xpSpan: 160000, startLevel: 141, endLevel: 145 },

  // 30: Infinito (+160.000 XP -> Conclusão Suprema em 2.100.000 XP)
  { tierIndex: 29, rankId: 'infinito', rankName: 'Infinito', minTotalXP: 1940000, maxTotalXP: 2100000, xpSpan: 160000, startLevel: 146, endLevel: 150 },
];

/**
 * Returns the tier threshold info for a given tierIndex (0 to 29).
 */
export function getTierThreshold(tierIndex: number): TierProgressionThreshold {
  const safeIndex = Math.max(0, Math.min(TIER_PROGRESSION_TABLE.length - 1, tierIndex));
  return TIER_PROGRESSION_TABLE[safeIndex];
}

/**
 * Calculates the combined stacking multiplier respecting the MAX_EFFECTIVE_XP_MULTIPLIER cap.
 */
export function calculateEffectiveMultiplier(
  streakMultiplier: number = 1.0,
  difficultyModifier: number = 1.0,
  eventModifier: number = 1.0
): { effectiveMultiplier: number; isCapped: boolean } {
  const raw = streakMultiplier * difficultyModifier * eventModifier;
  const effective = Math.min(MAX_EFFECTIVE_XP_MULTIPLIER, Math.max(0.5, raw));
  return {
    effectiveMultiplier: Math.round(effective * 100) / 100,
    isCapped: raw > MAX_EFFECTIVE_XP_MULTIPLIER,
  };
}
