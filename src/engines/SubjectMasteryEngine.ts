import { SubjectId, SubjectMastery, TopicMastery, MasteryTier, UserState } from '../types';
import { SUBJECTS_CONFIG, ALL_SUBJECT_IDS } from '../config/subjectsConfig';

export class SubjectMasteryEngine {
  public static calculateTier(masteryPercent: number): MasteryTier {
    if (masteryPercent < 20) return 'not_started';
    if (masteryPercent < 40) return 'basic';
    if (masteryPercent < 60) return 'developing';
    if (masteryPercent < 80) return 'good';
    if (masteryPercent < 95) return 'advanced';
    return 'mastered';
  }

  public static getTierLabel(tier: MasteryTier): string {
    switch (tier) {
      case 'not_started':
        return 'Não iniciado';
      case 'basic':
        return 'Básico';
      case 'developing':
        return 'Em desenvolvimento';
      case 'good':
        return 'Bom';
      case 'advanced':
        return 'Avançado';
      case 'mastered':
        return 'Dominado 🌟';
    }
  }

  public static initializeSubjectsMastery(): Record<SubjectId, SubjectMastery> {
    const result = {} as Record<SubjectId, SubjectMastery>;

    for (const subjectId of ALL_SUBJECT_IDS) {
      const subjectDef = SUBJECTS_CONFIG[subjectId];
      if (!subjectDef) continue;
      const topicMastery: Record<string, TopicMastery> = {};

      for (const topic of subjectDef.topics || []) {
        if (!topic || !topic.id) continue;
        topicMastery[topic.id] = {
          topicId: topic.id,
          name: topic.name || topic.id,
          subjectId,
          masteryPercent: 0,
          questionsSolved: 0,
          questionsCorrect: 0,
          accuracy: 0,
          difficultyScore: 30,
          tier: 'not_started',
          lastTrainedAt: 0,
        };
      }

      result[subjectId] = {
        subjectId,
        name: subjectDef.name || subjectId,
        masteryPercent: 0,
        skillLevel: 1,
        questionsSolved: 0,
        questionsCorrect: 0,
        accuracy: 0,
        avgTimeMs: 0,
        lastTrainedAt: 0,
        topicMastery,
      };
    }

    return result;
  }

  public static recordQuestionResult(
    currentState: UserState,
    params: {
      subjectId: SubjectId;
      topicId: string;
      isCorrect: boolean;
      questionDifficulty: number; // 1 to 100
      timeTakenMs: number;
    }
  ): {
    updatedSubjectMastery: SubjectMastery;
    newSubjectsMap: Record<SubjectId, SubjectMastery>;
  } {
    const subjectsMap = {
      ...(currentState.subjectsMastery || SubjectMasteryEngine.initializeSubjectsMastery()),
    };

    const subject = { ...(subjectsMap[params.subjectId] || SubjectMasteryEngine.initializeSingleSubject(params.subjectId)) };
    const topics = { ...subject.topicMastery };

    let topic = topics[params.topicId];
    if (!topic) {
      const subjectDef = SUBJECTS_CONFIG[params.subjectId];
      const topicDef = subjectDef?.topics ? subjectDef.topics.find((t) => t && t.id === params.topicId) : undefined;
      topic = {
        topicId: params.topicId,
        name: topicDef?.name || params.topicId,
        subjectId: params.subjectId,
        masteryPercent: 0,
        questionsSolved: 0,
        questionsCorrect: 0,
        accuracy: 0,
        difficultyScore: 30,
        tier: 'not_started',
        lastTrainedAt: 0,
      };
    } else {
      topic = { ...topic };
    }

    // 1. Update Topic Stats
    topic.questionsSolved += 1;
    if (params.isCorrect) {
      topic.questionsCorrect += 1;
    }
    topic.accuracy = Math.round((topic.questionsCorrect / topic.questionsSolved) * 100);
    topic.lastTrainedAt = Date.now();

    // Adaptive topic difficulty delta
    if (params.isCorrect) {
      topic.difficultyScore = Math.min(100, Math.round(topic.difficultyScore + Math.max(1, (params.questionDifficulty - topic.difficultyScore) * 0.15)));
    } else {
      topic.difficultyScore = Math.max(10, Math.round(topic.difficultyScore - 4));
    }

    // Dynamic Topic Mastery calculation
    // Factors: accuracy (50%), question volume factor (30%), difficulty factor (20%)
    const volumeFactor = Math.min(1, topic.questionsSolved / 15);
    const difficultyFactor = topic.difficultyScore / 100;
    const accuracyFactor = topic.accuracy / 100;

    const rawTopicMastery = (accuracyFactor * 0.5 + volumeFactor * 0.3 + difficultyFactor * 0.2) * 100;
    topic.masteryPercent = Math.min(100, Math.max(0, Math.round(rawTopicMastery)));
    topic.tier = SubjectMasteryEngine.calculateTier(topic.masteryPercent);

    topics[params.topicId] = topic;

    // 2. Aggregate Subject Stats
    subject.questionsSolved += 1;
    if (params.isCorrect) {
      subject.questionsCorrect += 1;
    }
    subject.accuracy = Math.round((subject.questionsCorrect / subject.questionsSolved) * 100);
    subject.lastTrainedAt = Date.now();
    subject.topicMastery = topics;

    // Calculate overall subject mastery as weighted average of topics
    const topicList = Object.values(topics);
    if (topicList.length > 0) {
      const sumMastery = topicList.reduce((acc, t) => acc + t.masteryPercent, 0);
      subject.masteryPercent = Math.round(sumMastery / topicList.length);
    } else {
      subject.masteryPercent = topic.masteryPercent;
    }

    // Skill level scales with mastery and questions solved (1 to 100)
    const baseSkillFromMastery = Math.round(subject.masteryPercent * 0.8);
    const volumeBonus = Math.min(20, Math.floor(subject.questionsSolved / 10));
    subject.skillLevel = Math.min(100, Math.max(1, baseSkillFromMastery + volumeBonus));

    subjectsMap[params.subjectId] = subject;

    return {
      updatedSubjectMastery: subject,
      newSubjectsMap: subjectsMap,
    };
  }

  public static recordQuestionResultForState(
    currentState: UserState,
    params: {
      subjectId: SubjectId;
      topicId: string;
      isCorrect: boolean;
      questionDifficulty: number;
      timeTakenMs: number;
    }
  ): UserState {
    const { newSubjectsMap } = this.recordQuestionResult(currentState, params);
    return {
      ...currentState,
      subjectsMastery: newSubjectsMap,
    };
  }

  private static initializeSingleSubject(subjectId: SubjectId): SubjectMastery {
    const subjectDef = SUBJECTS_CONFIG[subjectId];
    const topicMastery: Record<string, TopicMastery> = {};

    if (subjectDef && subjectDef.topics) {
      for (const topic of subjectDef.topics) {
        if (!topic || !topic.id) continue;
        topicMastery[topic.id] = {
          topicId: topic.id,
          name: topic.name || topic.id,
          subjectId,
          masteryPercent: 0,
          questionsSolved: 0,
          questionsCorrect: 0,
          accuracy: 0,
          difficultyScore: 30,
          tier: 'not_started',
          lastTrainedAt: 0,
        };
      }
    }

    return {
      subjectId,
      name: subjectDef?.name || subjectId,
      masteryPercent: 0,
      skillLevel: 1,
      questionsSolved: 0,
      questionsCorrect: 0,
      accuracy: 0,
      avgTimeMs: 0,
      lastTrainedAt: 0,
      topicMastery,
    };
  }
}
