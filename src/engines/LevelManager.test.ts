import { describe, expect, it } from 'vitest';
import { LevelManager } from './LevelManager';

describe('LevelManager', () => {
  it('starts every player at level one', () => {
    expect(LevelManager.getLevelDataFromTotalXP(0).level).toBe(1);
  });

  it('advances exactly at a level threshold', () => {
    const threshold = LevelManager.getXPForLevel(1);
    const data = LevelManager.getLevelDataFromTotalXP(threshold);
    expect(data.level).toBe(2);
    expect(data.currentLevelXP).toBe(0);
  });

  it('keeps progress percentages bounded', () => {
    const samples = [0, 1, 10_000, 250_000, 2_100_000];
    for (const xp of samples) {
      const data = LevelManager.getLevelDataFromTotalXP(xp);
      expect(data.levelProgressPercent).toBeGreaterThanOrEqual(0);
      expect(data.levelProgressPercent).toBeLessThanOrEqual(100);
    }
  });

  it('honors the permanent rank safeguard', () => {
    expect(LevelManager.getLevelDataFromTotalXP(0, 4).level).toBe(21);
  });
});
