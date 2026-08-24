import type { InfiniteSessionConfig, SubjectId, UserState } from '../types';

export interface AcademicPhase {
  id: string;
  name: string;
  subtitle: string;
  minLevel: number;
  maxLevel: number;
  minDifficulty: number;
  maxDifficulty: number;
  accent: string;
  unlock: string;
}

export interface AcademicProgressionSnapshot {
  phase: AcademicPhase;
  level: number;
  levelProgressPercent: number;
  currentLevelXP: number;
  xpForNextLevel: number;
  targetDifficulty: number;
  nextMilestoneLevel: number;
  nextUnlock: string;
  studyMessage: string;
}

export const ACADEMIC_PHASES: AcademicPhase[] = [
  { id: 'base', name: 'Fundamentos', subtitle: 'Construção da base', minLevel: 1, maxLevel: 10, minDifficulty: 12, maxDifficulty: 32, accent: '#38bdf8', unlock: 'Treinos mistos' },
  { id: 'consolidacao', name: 'Consolidação', subtitle: 'Precisão e repertório', minLevel: 11, maxLevel: 25, minDifficulty: 24, maxDifficulty: 48, accent: '#34d399', unlock: 'Simulados completos' },
  { id: 'aplicacao', name: 'Aplicação', subtitle: 'Problemas contextualizados', minLevel: 26, maxLevel: 45, minDifficulty: 38, maxDifficulty: 64, accent: '#a78bfa', unlock: 'Desafios avançados' },
  { id: 'estrategia', name: 'Estratégia de Prova', subtitle: 'Tempo, seleção e consistência', minLevel: 46, maxLevel: 70, minDifficulty: 52, maxDifficulty: 80, accent: '#f59e0b', unlock: 'Questões de elite' },
  { id: 'elite', name: 'Elite Vestibular', subtitle: 'Alta complexidade', minLevel: 71, maxLevel: 100, minDifficulty: 66, maxDifficulty: 94, accent: '#fb7185', unlock: 'Maestria por matéria' },
  { id: 'maestria', name: 'Maestria', subtitle: 'Progressão sem teto', minLevel: 101, maxLevel: Number.POSITIVE_INFINITY, minDifficulty: 76, maxDifficulty: 100, accent: '#fbbf24', unlock: 'Ascensão infinita' },
];

export class AcademicProgressionEngine {
  public static getPhase(level: number): AcademicPhase {
    return ACADEMIC_PHASES.find((phase) => level >= phase.minLevel && level <= phase.maxLevel)
      || ACADEMIC_PHASES[ACADEMIC_PHASES.length - 1];
  }

  public static getTargetDifficulty(
    userState?: UserState,
    subjectId?: SubjectId | 'mixed',
    difficultyMode: InfiniteSessionConfig['difficultyMode'] = 'adaptive'
  ): number {
    const level = Math.max(1, userState?.level || 1);
    const phase = this.getPhase(level);
    const fixedTargets: Record<string, number> = { easy: 22, medium: 46, hard: 72, extreme: 92 };
    if (difficultyMode && difficultyMode !== 'adaptive') return fixedTargets[difficultyMode] || 46;

    const levelSpan = Number.isFinite(phase.maxLevel) ? Math.max(1, phase.maxLevel - phase.minLevel) : 30;
    const phasePosition = Math.min(1, Math.max(0, (level - phase.minLevel) / levelSpan));
    let target = phase.minDifficulty + (phase.maxDifficulty - phase.minDifficulty) * phasePosition;

    if (userState && subjectId && subjectId !== 'mixed') {
      const mastery = userState.subjectsMastery?.[subjectId]?.masteryPercent || 0;
      target += mastery >= 80 ? 8 : mastery >= 60 ? 4 : mastery < 25 ? -5 : 0;
    }

    const recent = userState?.recentHistory?.slice(-8) || [];
    if (recent.length >= 4) {
      const recentAccuracy = recent.filter((answer) => answer.isCorrect).length / recent.length;
      target += recentAccuracy >= 0.85 ? 6 : recentAccuracy <= 0.45 ? -8 : 0;
    }

    return Math.round(Math.min(100, Math.max(8, target)));
  }

  public static getSnapshot(userState: UserState, subjectId?: SubjectId | 'mixed'): AcademicProgressionSnapshot {
    const level = Math.max(1, userState.level || 1);
    const phase = this.getPhase(level);
    const nextPhase = ACADEMIC_PHASES.find((candidate) => candidate.minLevel > level);
    const nextMilestoneLevel = nextPhase?.minLevel || level + 5;
    const targetDifficulty = this.getTargetDifficulty(userState, subjectId);
    const accuracy = userState.stats?.accuracy || 0;
    const studyMessage = accuracy < 55
      ? 'Prioridade: consolidar a base e revisar cada erro antes de acelerar.'
      : accuracy < 75
        ? 'Prioridade: alternar teoria curta com blocos de 10 questões.'
        : 'Prioridade: aumentar dificuldade e treinar gestão de tempo de prova.';

    return {
      phase,
      level,
      levelProgressPercent: Math.max(0, Math.min(100, userState.levelProgressPercent || 0)),
      currentLevelXP: Math.max(0, userState.currentLevelXP || 0),
      xpForNextLevel: Math.max(1, userState.xpForNextLevel || 1),
      targetDifficulty,
      nextMilestoneLevel,
      nextUnlock: nextPhase?.unlock || phase.unlock,
      studyMessage,
    };
  }
}
