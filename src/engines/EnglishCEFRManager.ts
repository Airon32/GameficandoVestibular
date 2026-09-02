import type { CEFRLevel, EnglishProgress, EnglishSkill, EnglishSkillProgress } from '../types';

export const CEFR_ORDER: CEFRLevel[] = ['a0', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'];

const SKILL_WEIGHT: Record<EnglishSkill, number> = {
  vocabulary: 1,
  grammar: 1.1,
  reading: 1.15,
  listening: 1.1,
  writing: 0.85,
  speaking: 0.85,
};

export class EnglishCEFRManager {
  public static indexOf(level: CEFRLevel): number {
    return Math.max(0, CEFR_ORDER.indexOf(level));
  }

  public static fromIndex(index: number): CEFRLevel {
    const bounded = Math.max(0, Math.min(CEFR_ORDER.length - 1, Math.round(index)));
    return CEFR_ORDER[bounded];
  }

  public static fromScore(score: number, confidence: number): CEFRLevel | 'unevaluated' {
    if (confidence < 0.18) return 'unevaluated';
    if (score < 12) return 'a0';
    if (score < 28) return 'a1';
    if (score < 46) return 'a2';
    if (score < 64) return 'b1';
    if (score < 80) return 'b2';
    if (score < 92) return 'c1';
    return 'c2';
  }

  public static label(level: CEFRLevel | 'unevaluated'): string {
    if (level === 'unevaluated') return 'Não avaliado';
    return level.toUpperCase();
  }

  public static estimatedLabel(level: CEFRLevel): string {
    return `Nível estimado ${level.toUpperCase()}`;
  }

  public static recomputeOverall(progress: EnglishProgress): Pick<EnglishProgress, 'estimatedCefr' | 'cefrConfidence'> {
    const skills = Object.values(progress.skills);
    const weighted = skills.reduce(
      (acc, skill) => {
        const weight = SKILL_WEIGHT[skill.skill] * Math.max(0.15, skill.confidence);
        acc.score += skill.score * weight;
        acc.weight += weight;
        acc.confidence += skill.confidence;
        return acc;
      },
      { score: 0, weight: 0, confidence: 0 }
    );

    const confidence = skills.length > 0 ? weighted.confidence / skills.length : 0;
    const score = weighted.weight > 0 ? weighted.score / weighted.weight : 0;
    const fromSkills = this.fromScore(score, confidence);
    const estimatedCefr = fromSkills === 'unevaluated' ? progress.estimatedCefr || 'a0' : fromSkills;
    return { estimatedCefr, cefrConfidence: Number(confidence.toFixed(3)) };
  }

  public static applyPlacement(
    progress: EnglishProgress,
    overall: CEFRLevel,
    skillEstimates: Partial<Record<EnglishSkill, CEFRLevel | 'unevaluated'>>
  ): EnglishProgress {
    const nextSkills = { ...progress.skills };
    for (const [skill, estimate] of Object.entries(skillEstimates) as Array<[EnglishSkill, CEFRLevel | 'unevaluated']>) {
      if (!nextSkills[skill] || estimate === 'unevaluated') continue;
      const index = this.indexOf(estimate);
      nextSkills[skill] = {
        ...nextSkills[skill],
        estimatedCefr: estimate,
        score: Math.max(nextSkills[skill].score, 12 + index * 14),
        confidence: Math.max(nextSkills[skill].confidence, 0.35),
      };
    }

    return {
      ...progress,
      skills: nextSkills,
      estimatedCefr: overall,
      cefrConfidence: Math.max(progress.cefrConfidence, 0.4),
      placementCompleted: true,
      course: {
        ...progress.course,
        currentLevelId: overall === 'a0' ? 'a0' : overall,
      },
    };
  }
}

export function createEmptySkillProgress(skill: EnglishSkill): EnglishSkillProgress {
  return {
    skill,
    score: 0,
    confidence: 0,
    estimatedCefr: 'unevaluated',
    accuracy: 0,
    activities: 0,
    lastPracticedAt: null,
    trend: 0,
    mastery: 0,
  };
}
