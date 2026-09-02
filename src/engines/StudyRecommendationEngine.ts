import { UserState, SubjectId, SubjectMastery, TopicMastery, ErrorNotebookEntry } from '../types';
import { SUBJECTS_CONFIG } from '../config/subjectsConfig';

export interface StudyRecommendation {
  id: string;
  type: 'weakness' | 'recency' | 'spaced_repetition' | 'exam_boost' | 'streak_keep';
  title: string;
  subtitle: string;
  subjectId: SubjectId;
  topicId?: string;
  masteryPercent?: number;
  priority: 'high' | 'medium' | 'low';
  actionLabel: string;
  gameMode?: string;
}

export class StudyRecommendationEngine {
  public static generateRecommendations(state: UserState): StudyRecommendation[] {
    const recommendations: StudyRecommendation[] = [];
    const subjectsMap: Record<string, SubjectMastery> = (state.subjectsMastery as Record<string, SubjectMastery>) || {};
    const now = Date.now();
    const FOUR_DAYS_MS = 4 * 24 * 60 * 60 * 1000;

    // 1. Check Error Notebook (Pending errors)
    const errorList = Object.values(state?.errorNotebook || {} as Record<string, ErrorNotebookEntry>).filter((e: ErrorNotebookEntry) => e && e.status !== 'recovered');
    if (errorList.length >= 3 && errorList[0]) {
      recommendations.push({
        id: 'rec_error_notebook',
        type: 'weakness',
        title: 'Caderno de Erros Ativo',
        subtitle: `Você tem ${errorList.length} questões com erros para superar e consolidar.`,
        subjectId: errorList[0].subjectId || 'matematica',
        topicId: errorList[0].topicId,
        priority: 'high',
        actionLabel: 'Revisar Meus Erros',
        gameMode: 'recuperacao',
      });
    }

    // 2. Identify Weakest Topics ("Você precisa melhorar")
    const allTopics: Array<{
      subjectId: SubjectId;
      topicId: string;
      topicName: string;
      masteryPercent: number;
      accuracy: number;
      questionsSolved: number;
    }> = [];

    for (const [sId, subject] of Object.entries(subjectsMap)) {
      const subjectId = sId as SubjectId;
      if (subject && subject.topicMastery) {
        for (const topic of Object.values(subject.topicMastery) as TopicMastery[]) {
          if (topic && topic.topicId && topic.questionsSolved > 0 && topic.masteryPercent < 60) {
            allTopics.push({
              subjectId,
              topicId: topic.topicId,
              topicName: topic.name || topic.topicId,
              masteryPercent: topic.masteryPercent || 0,
              accuracy: topic.accuracy || 0,
              questionsSolved: topic.questionsSolved || 0,
            });
          }
        }
      }
    }

    // Sort by lowest mastery
    allTopics.sort((a, b) => a.masteryPercent - b.masteryPercent);

    for (const topic of allTopics.slice(0, 3)) {
      if (!topic || !topic.subjectId) continue;
      const subjectDef = SUBJECTS_CONFIG[topic.subjectId];
      recommendations.push({
        id: `rec_weak_${topic.subjectId}_${topic.topicId || 'top'}`,
        type: 'weakness',
        title: `${topic.topicName} — ${topic.masteryPercent}%`,
        subtitle: `Precisão de ${topic.accuracy}% em ${subjectDef?.name || topic.subjectId}. Pratique para consolidar este conceito.`,
        subjectId: topic.subjectId,
        topicId: topic.topicId,
        masteryPercent: topic.masteryPercent,
        priority: 'high',
        actionLabel: 'Treinar Tópico',
        gameMode: 'quiz_rapido',
      });
    }

    // 2b. English skill weakness (never inferred from XP)
    const english = state.englishProgress;
    if (english?.skills) {
      const weakest = Object.values(english.skills)
        .filter((skill) => skill.activities >= 3)
        .sort((a, b) => a.score - b.score)[0];
      const average = Object.values(english.skills).reduce((acc, skill) => acc + skill.score, 0) / 6;
      if (weakest && weakest.score + 12 <= average) {
        recommendations.unshift({
          id: `rec_en_skill_${weakest.skill}`,
          type: 'weakness',
          title: `${weakest.skill === 'listening' ? 'Listening' : weakest.skill} Practice`,
          subtitle: `${weakest.skill === 'listening' ? 'Listening' : weakest.skill} está atualmente ${Math.round(average - weakest.score)} pontos abaixo da sua média de inglês.`,
          subjectId: 'ingles',
          masteryPercent: Math.round(weakest.score),
          priority: 'high',
          actionLabel: 'Praticar habilidade',
          gameMode: 'quiz_rapido',
        });
      }
    }
    for (const [sId, subject] of Object.entries(subjectsMap)) {
      const subjectId = sId as SubjectId;
      if (!subjectId) continue;
      if (subject && subject.questionsSolved > 0 && subject.lastTrainedAt > 0 && now - subject.lastTrainedAt > FOUR_DAYS_MS) {
        const days = Math.floor((now - subject.lastTrainedAt) / (24 * 60 * 60 * 1000));
        const subjectDef = SUBJECTS_CONFIG[subjectId];
        recommendations.push({
          id: `rec_recency_${subjectId}`,
          type: 'recency',
          title: `Revisitar ${subjectDef?.name || subjectId}`,
          subtitle: `Você está há ${days} dias sem praticar esta matéria. Mantenha os conceitos frescos.`,
          subjectId,
          priority: 'medium',
          actionLabel: 'Praticar Matéria',
          gameMode: 'quiz_rapido',
        });
      }
    }

    // 4. If few recommendations, recommend high-yield mixed or quick practice
    if (recommendations.length < 2) {
      recommendations.push({
        id: 'rec_mixed_workout',
        type: 'exam_boost',
        title: 'Treino Misto Vestibular',
        subtitle: 'Sessão rápida de 10 minutos mesclando exatas, biológicas e humanas.',
        subjectId: 'matematica',
        priority: 'medium',
        actionLabel: 'Iniciar Treino Misto',
        gameMode: 'treino_misto',
      });
      recommendations.push({
        id: 'rec_math_speed',
        type: 'streak_keep',
        title: 'Cálculo Rápido & Agilidade',
        subtitle: 'Exercite sua velocidade mental e garanta tempo extra para as questões teóricas.',
        subjectId: 'matematica',
        priority: 'medium',
        actionLabel: 'Jogar Cálculo Rápido',
        gameMode: 'calculo_rapido',
      });
    }

    return recommendations;
  }
}
