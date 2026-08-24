import {
  ExamProfile,
  SimuladoSession,
  SimuladoAnswer,
  SimuladoSubjectResult,
  EducationalQuestion,
  SubjectId,
} from '../types';
import { QuestionBankService } from '../data/questionBank';
import { SUBJECTS_CONFIG } from '../config/subjectsConfig';

export class SimuladoEngine {
  public static generateExamSession(profile: ExamProfile): {
    sessionId: string;
    questions: EducationalQuestion[];
  } {
    const profileId = profile?.id || 'sim';
    const sessionId = `sim_${profileId}_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`;
    const questions: EducationalQuestion[] = [];

    for (const spec of (profile?.subjects || [])) {
      const subjectQuestions = QuestionBankService.getRandomQuestions({
        subjectId: spec.subjectId,
        count: spec.questionCount,
        examProfileId: profile?.id,
      });
      questions.push(...subjectQuestions);
    }

    // Fallback if needed to reach total count
    if (profile && questions.length < profile.totalQuestions) {
      const remainingNeeded = profile.totalQuestions - questions.length;
      const extraQuestions = QuestionBankService.getRandomQuestions({
        count: remainingNeeded,
        excludeIds: questions.filter((q) => q && q.id).map((q) => q.id),
      });
      questions.push(...extraQuestions);
    }

    return {
      sessionId,
      questions,
    };
  }

  public static evaluateExam(
    profile: ExamProfile,
    answers: SimuladoAnswer[],
    startTimeMs: number,
    endTimeMs: number
  ): SimuladoSession {
    const totalTimeMs = endTimeMs - startTimeMs;
    const totalQuestions = answers.length;
    const correctCount = answers.filter((a) => a.isCorrect).length;
    const scorePercent = totalQuestions > 0 ? Math.round((correctCount / totalQuestions) * 100) : 0;

    const subjectMap: Partial<Record<SubjectId, { total: number; correct: number; totalTimeMs: number }>> = {};

    for (const answer of answers) {
      if (!subjectMap[answer.subjectId]) {
        subjectMap[answer.subjectId] = { total: 0, correct: 0, totalTimeMs: 0 };
      }
      const data = subjectMap[answer.subjectId]!;
      data.total += 1;
      if (answer.isCorrect) data.correct += 1;
      data.totalTimeMs += answer.timeTakenMs;
    }

    const subjectResults: Record<SubjectId, SimuladoSubjectResult> = {} as any;
    const subjectPerformanceList: Array<{ subjectId: SubjectId; accuracy: number }> = [];

    for (const [sId, data] of Object.entries(subjectMap)) {
      const subjectId = sId as SubjectId;
      const subDef = SUBJECTS_CONFIG[subjectId];
      const accuracy = data.total > 0 ? Math.round((data.correct / data.total) * 100) : 0;
      const avgTimeMs = data.total > 0 ? Math.round(data.totalTimeMs / data.total) : 0;

      subjectResults[subjectId] = {
        subjectId,
        name: subDef?.name || subjectId,
        totalQuestions: data.total,
        correctCount: data.correct,
        accuracy,
        avgTimeMs,
      };

      subjectPerformanceList.push({ subjectId, accuracy });
    }

    subjectPerformanceList.sort((a, b) => b.accuracy - a.accuracy);

    const strongestSubjects = subjectPerformanceList
      .filter((s) => s.accuracy >= 70)
      .slice(0, 2)
      .map((s) => SUBJECTS_CONFIG[s.subjectId]?.name || s.subjectId);

    const weakestSubjects = [...subjectPerformanceList]
      .reverse()
      .filter((s) => s.accuracy < 70)
      .slice(0, 2)
      .map((s) => SUBJECTS_CONFIG[s.subjectId]?.name || s.subjectId);

    const recommendations: string[] = [];
    if (weakestSubjects.length > 0) {
      recommendations.push(`Reforçar treinos direcionados em: ${weakestSubjects.join(' e ')}.`);
    }
    if (scorePercent >= 80) {
      recommendations.push('Excelente pontuação! Continue mantendo a consistência e o ritmo de resolução.');
    } else if (scorePercent >= 60) {
      recommendations.push('Bom desempenho. Revise o caderno de erros das questões que você errou neste simulado.');
    } else {
      recommendations.push('Concentre-se nos tópicos de base antes de realizar novos simulados completos.');
    }

    return {
      id: `sim_res_${Date.now()}`,
      examProfileId: profile?.id || 'simulado',
      examName: profile?.name || 'Simulado',
      startedAt: startTimeMs,
      completedAt: endTimeMs,
      totalTimeMs,
      totalQuestions,
      correctCount,
      scorePercent,
      subjectResults,
      strongestSubjects,
      weakestSubjects,
      recommendations,
      answers,
    };
  }

  public static calculateSimuladoXP(session: SimuladoSession): number {
    // Base XP per correct question: ~25 XP
    // Completion bonus: 100 XP
    // Performance tier bonus:
    // >= 90%: +250 XP
    // >= 75%: +150 XP
    // >= 50%: +80 XP
    const baseXP = session.correctCount * 25;
    const completionBonus = 100;
    let performanceBonus = 0;

    if (session.scorePercent >= 90) performanceBonus = 250;
    else if (session.scorePercent >= 75) performanceBonus = 150;
    else if (session.scorePercent >= 50) performanceBonus = 80;

    return baseXP + completionBonus + performanceBonus;
  }

  public static saveSimuladoSession(currentState: any, session: SimuladoSession): any {
    const simuladosHistory = [session, ...(currentState.simuladosHistory || [])].slice(0, 50);
    return {
      ...currentState,
      simuladosHistory,
    };
  }
}
