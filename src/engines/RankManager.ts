import { BASE_RANKS, ROMAN_NUMERALS } from '../config/constants';
import { RankInfo } from '../types';
import { getRankVisualConfig, getAscensionVisualConfig } from '../config/rankVisualConfig';

export class RankManager {
  private static DIVISIONS_PER_TIER = 5;

  /**
   * Computes RankInfo based on player level and optional highestUnlockedRank safeguard.
   * Permanent safeguard: Once unlocked, a rank tier is permanently preserved.
   */
  public static getRankForLevel(level: number, highestUnlockedRank?: number): RankInfo {
    const safeLevel = Math.max(1, level);
    // 0-indexed total division index
    const totalDivIndex = safeLevel - 1;

    let tierIndex = Math.floor(totalDivIndex / this.DIVISIONS_PER_TIER);
    let divisionIndex = totalDivIndex % this.DIVISIONS_PER_TIER; // 0 to 4

    // Apply highest unlocked rank safeguard
    if (highestUnlockedRank !== undefined && highestUnlockedRank > tierIndex) {
      tierIndex = highestUnlockedRank;
      divisionIndex = 0; // Division I of highest unlocked rank
    }

    if (tierIndex < BASE_RANKS.length) {
      const base = BASE_RANKS[tierIndex];
      const divisionRoman = ROMAN_NUMERALS[divisionIndex] || `${divisionIndex + 1}`;
      const visualConfig = getRankVisualConfig(tierIndex);

      return {
        tierName: base.name,
        tierIndex,
        division: divisionIndex + 1,
        fullName: `${base.name} ${divisionRoman}`,
        minXP: visualConfig.minTotalXP,
        badgeColor: base.color,
        badgeBorder: base.border,
        iconName: base.icon,
        rankId: visualConfig.rankId,
        visualConfig,
      };
    } else {
      // Ascension tiers beyond the 30 base tiers (Level 151+)
      const ascensionLevel = Math.floor((safeLevel - 151) / this.DIVISIONS_PER_TIER) + 1;
      const divisionRoman = ROMAN_NUMERALS[divisionIndex] || `${divisionIndex + 1}`;
      const visualConfig = getAscensionVisualConfig(ascensionLevel, divisionIndex + 1);

      return {
        tierName: `Infinito ∞${ascensionLevel}`,
        tierIndex,
        division: divisionIndex + 1,
        fullName: `Infinito ∞${ascensionLevel} (${divisionRoman})`,
        minXP: visualConfig.minTotalXP,
        badgeColor: 'from-amber-300 via-rose-500 to-cyan-400',
        badgeBorder: 'border-amber-300',
        iconName: 'Infinity',
        rankId: visualConfig.rankId,
        visualConfig,
        ascensionLevel,
      };
    }
  }
}
