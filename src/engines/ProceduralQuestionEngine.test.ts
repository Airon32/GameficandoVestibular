import { describe, expect, it } from 'vitest';
import { ALL_SUBJECT_IDS, SUBJECTS_CONFIG } from '../config/subjectsConfig';
import { EXAM_PROFILES } from '../config/examProfilesConfig';
import { ProceduralQuestionEngine } from './ProceduralQuestionEngine';
import { SimuladoEngine } from './SimuladoEngine';

describe('ProceduralQuestionEngine', () => {
  it('gera uma questão válida para todos os tópicos das 15 disciplinas', () => {
    for (const subjectId of ALL_SUBJECT_IDS) {
      for (const topic of SUBJECTS_CONFIG[subjectId].topics) {
        const question = ProceduralQuestionEngine.generate(subjectId, 52, topic.id);
        expect(question.subjectId).toBe(subjectId);
        expect(question.topicId).toBe(topic.id);
        expect(question.options.length).toBeGreaterThanOrEqual(4);
        expect(question.options.filter((option) => option.id === question.correctOptionId)).toHaveLength(1);
        expect(question.explanation.length).toBeGreaterThan(20);
      }
    }
  });

  it('produz instâncias únicas para permitir sessões contínuas', () => {
    const ids = new Set(
      Array.from({ length: 40 }, () => ProceduralQuestionEngine.generate('historia', 55).id)
    );
    expect(ids.size).toBe(40);
  });
});

describe('SimuladoEngine', () => {
  it('entrega a quantidade exata e a distribuição de cada prova', () => {
    for (const profile of Object.values(EXAM_PROFILES)) {
      const session = SimuladoEngine.generateExamSession(profile);
      expect(session.questions).toHaveLength(profile.totalQuestions);
      for (const spec of profile.subjects) {
        expect(session.questions.filter((question) => question.subjectId === spec.subjectId)).toHaveLength(
          spec.questionCount
        );
      }
      expect(new Set(session.questions.map((question) => question.id)).size).toBe(session.questions.length);
      for (const question of session.questions) {
        expect(SimuladoEngine.isExamCompatibleQuestion(question)).toBe(true);

        if (question.questionType === 'multiple_choice') {
          expect(question.options.length).toBeGreaterThanOrEqual(2);
          expect(question.options.some((option) => option.id === question.correctOptionId)).toBe(true);
        } else if (question.questionType === 'true_false') {
          expect(question.statement.trim().length).toBeGreaterThan(0);
          expect(typeof question.isTrue).toBe('boolean');
        }
      }
    }
  });

  it('mantém todas as questões respondíveis em sessões aleatórias repetidas', () => {
    for (let round = 0; round < 12; round++) {
      for (const profile of Object.values(EXAM_PROFILES)) {
        const session = SimuladoEngine.generateExamSession(profile);
        expect(session.questions.every(SimuladoEngine.isExamCompatibleQuestion)).toBe(true);
      }
    }
  });
});
