import type { MultipleChoiceQuestion, SubjectId } from '../types';
import { SUBJECTS_CONFIG } from '../config/subjectsConfig';
import { PROCEDURAL_CONCEPTS, type ProceduralConcept } from '../data/proceduralConcepts';

function shuffle<T>(values: T[]): T[] {
  return [...values].sort(() => Math.random() - 0.5);
}

function closestConcepts(subjectId: SubjectId, targetDifficulty: number, topicId?: string): ProceduralConcept[] {
  const exact = PROCEDURAL_CONCEPTS.filter((concept) => concept.subjectId === subjectId && (!topicId || concept.topicId === topicId));
  const pool = exact.length > 0 ? exact : PROCEDURAL_CONCEPTS.filter((concept) => concept.subjectId === subjectId);
  return [...pool].sort((a, b) => Math.abs(a.difficulty - targetDifficulty) - Math.abs(b.difficulty - targetDifficulty));
}

export class ProceduralQuestionEngine {
  public static generate(subjectId: SubjectId, targetDifficulty = 40, topicId?: string): MultipleChoiceQuestion {
    const subject = SUBJECTS_CONFIG[subjectId];
    const concepts = closestConcepts(subjectId, targetDifficulty, topicId);
    const concept = concepts[Math.floor(Math.random() * Math.min(3, Math.max(1, concepts.length)))];

    if (!concept) return this.generateCurriculumQuestion(subjectId, targetDifficulty, topicId);

    const sameSubjectDistractors = shuffle(
      PROCEDURAL_CONCEPTS.filter((item) => item.subjectId === subjectId && item.term !== concept.term)
    ).slice(0, 4);
    if (sameSubjectDistractors.length < 3) return this.generateCurriculumQuestion(subjectId, targetDifficulty, topicId);

    const askByDefinition = Math.random() < 0.5;
    const correctText = askByDefinition ? concept.term : concept.definition;
    const distractorTexts = sameSubjectDistractors.map((item) => askByDefinition ? item.term : item.definition);
    const optionTexts = shuffle([correctText, ...distractorTexts]).slice(0, 5);
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const options = optionTexts.map((text, index) => ({ id: letters[index], text, isCorrect: text === correctText }));
    const correctOptionId = options.find((option) => option.isCorrect)?.id || 'A';
    const prompt = askByDefinition
      ? `Em ${subject.name}, qual conceito corresponde à definição: “${concept.definition}”?`
      : `Em uma situação que exige ${concept.application}, qual alternativa define corretamente “${concept.term}”?`;

    return {
      id: `proc_${subjectId}_${concept.topicId}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      subjectId,
      topicId: topicId || concept.topicId,
      difficulty: Math.max(8, Math.min(100, Math.round((concept.difficulty + targetDifficulty) / 2))),
      calibratedDifficulty: targetDifficulty,
      questionType: 'multiple_choice',
      prompt,
      options,
      correctOptionId,
      explanation: `${concept.explanation} Aplicação típica: ${concept.application}.`,
      keyConcept: concept.term,
      source: 'Gerador Curricular Procedural',
      tags: [subjectId, concept.topicId, 'procedural', 'vestibular'],
      generationSource: 'algorithmic',
      qualityScore: 94,
      validationStatus: 'validated',
      createdAt: Date.now(),
    };
  }

  private static generateCurriculumQuestion(subjectId: SubjectId, targetDifficulty: number, requestedTopicId?: string): MultipleChoiceQuestion {
    const subject = SUBJECTS_CONFIG[subjectId];
    const targetTopic = subject.topics.find((topic) => topic.id === requestedTopicId)
      || subject.topics[Math.floor(Math.random() * subject.topics.length)];
    const distractors = shuffle(subject.topics.filter((topic) => topic.id !== targetTopic.id)).slice(0, 4);
    const correctText = targetTopic.description;
    const optionTexts = shuffle([correctText, ...distractors.map((topic) => topic.description)]);
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const options = optionTexts.map((text, index) => ({ id: letters[index], text, isCorrect: text === correctText }));

    return {
      id: `curr_${subjectId}_${targetTopic.id}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      subjectId,
      topicId: targetTopic.id,
      difficulty: Math.max(10, Math.min(100, targetDifficulty)),
      calibratedDifficulty: targetDifficulty,
      questionType: 'multiple_choice',
      prompt: `Qual alternativa apresenta corretamente o núcleo de estudo de “${targetTopic.name}”?`,
      options,
      correctOptionId: options.find((option) => option.isCorrect)?.id || 'A',
      explanation: `${targetTopic.name}: ${targetTopic.description}. Este tópico tem relevância ${targetTopic.weight}/5 nos vestibulares mapeados.`,
      keyConcept: targetTopic.name,
      source: 'Matriz Curricular Procedural',
      tags: [subjectId, targetTopic.id, 'curriculo', 'vestibular'],
      generationSource: 'algorithmic',
      qualityScore: 90,
      validationStatus: 'validated',
      createdAt: Date.now(),
    };
  }
}
