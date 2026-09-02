import type { EnglishSkill, EnglishSkillProgress } from '../types';
import { EnglishCEFRManager, createEmptySkillProgress } from './EnglishCEFRManager';

export class EnglishSkillMasteryEngine {
  public static recordActivity(
    current: EnglishSkillProgress | undefined,
    skill: EnglishSkill,
    params: { isCorrect: boolean; difficulty: number; timeTakenMs: number }
  ): EnglishSkillProgress {
    const prev = current || createEmptySkillProgress(skill);
    const activities = prev.activities + 1;
    const correctBoost = params.isCorrect ? 1 : 0;
    const accuracy = ((prev.accuracy * prev.activities) + (correctBoost * 100)) / activities;
    const difficultyFactor = Math.max(0.6, Math.min(1.4, params.difficulty / 50));
    const recency = 1;
    const samplePenalty = activities < 8 ? 0.55 + activities * 0.05 : 1;
    const outcome = params.isCorrect ? 8 * difficultyFactor : -5;
    const nextScore = Math.max(0, Math.min(100, prev.score + outcome * recency));
    const confidence = Math.min(1, activities / 15) * samplePenalty;
    const mastery = Number((nextScore * (0.45 + 0.55 * confidence) * (accuracy / 100 || 0.01) ** 0.15).toFixed(1));
    const trend = Number((nextScore - prev.score).toFixed(1));

    return {
      skill,
      score: Number(nextScore.toFixed(1)),
      confidence: Number(confidence.toFixed(3)),
      estimatedCefr: EnglishCEFRManager.fromScore(nextScore, confidence),
      accuracy: Number(accuracy.toFixed(1)),
      activities,
      lastPracticedAt: Date.now(),
      trend,
      mastery: Math.max(0, Math.min(100, mastery)),
    };
  }

  public static weakestSkill(skills: Record<EnglishSkill, EnglishSkillProgress>): EnglishSkillProgress | null {
    const evaluated = Object.values(skills).filter((skill) => skill.activities > 0);
    if (evaluated.length === 0) return null;
    return [...evaluated].sort((a, b) => a.score - b.score)[0];
  }
}
