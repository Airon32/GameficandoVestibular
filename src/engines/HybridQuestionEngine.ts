import {
  EducationalQuestion,
  MultipleChoiceQuestion,
  SubjectId,
  UserState,
  KnowledgeConcept,
  ConceptQuestionTemplate,
} from '../types';
import { KNOWLEDGE_BASE_CONCEPTS, getKnowledgeConceptsBySubject } from '../data/knowledgeBase';
import { QUESTION_BANK } from '../data/questionBank';
import { QuestionGenerator } from './QuestionGenerator';
import { QuestionValidator } from './QuestionValidator';
import { ALL_SUBJECT_IDS } from '../config/subjectsConfig';
import { ProceduralQuestionEngine } from './ProceduralQuestionEngine';
import { AcademicProgressionEngine } from './AcademicProgressionEngine';

export interface NextQuestionOptions {
  subjectId?: SubjectId | 'mixed';
  topicId?: string;
  targetDifficulty?: number; // 1 to 100
  difficultyMode?: 'adaptive' | 'easy' | 'medium' | 'hard' | 'extreme';
  userState?: UserState;
  excludeIds?: string[];
  allowSpacedRepetition?: boolean;
}

export class HybridQuestionEngine {
  private static recentQuestionIds: string[] = [];
  private static recentConceptIds: string[] = [];
  private static recentTopicIds: string[] = [];
  private static flaggedOrReportedIds: Set<string> = new Set();

  // In-memory pools for preloading
  private static questionPools: Map<string, EducationalQuestion[]> = new Map();

  /**
   * Flags a question to remove it temporarily from normal sessions
   */
  public static flagQuestion(questionId: string): void {
    this.flaggedOrReportedIds.add(questionId);
  }

  /**
   * Cleans recent memory history
   */
  public static clearRecentHistory(): void {
    this.recentQuestionIds = [];
    this.recentConceptIds = [];
    this.recentTopicIds = [];
  }

  /**
   * Generates a template-based educational question from a knowledge concept
   * with guaranteed mathematical/logical consistency and randomized distractor permutation
   */
  public static generateFromTemplate(
    concept: KnowledgeConcept,
    targetTemplate?: ConceptQuestionTemplate
  ): EducationalQuestion | null {
    if (!concept.questionTemplates || concept.questionTemplates.length === 0) {
      return null;
    }

    const template =
      targetTemplate ||
      concept.questionTemplates[Math.floor(Math.random() * concept.questionTemplates.length)];

    // Shuffle and pick 3 or 4 distractors
    const shuffledDistractors = [...template.distractorTemplates].sort(() => 0.5 - Math.random());
    const pickedDistractors = shuffledDistractors.slice(0, 4);

    // Combine with correct template
    const allOptionTexts = [template.correctTemplate, ...pickedDistractors];
    // Shuffle options
    const shuffledOptions = allOptionTexts.sort(() => 0.5 - Math.random());

    const optionLetters = ['A', 'B', 'C', 'D', 'E'];
    const options = shuffledOptions.map((text, idx) => ({
      id: optionLetters[idx] || `${idx + 1}`,
      text,
      isCorrect: text === template.correctTemplate,
    }));

    const correctOption = options.find((o) => o.isCorrect);
    const correctOptionId = correctOption ? correctOption.id : 'A';

    // Unique timestamp-based dynamic instance ID
    const instanceId = `tpl_${concept.id}_${template.id}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

    const question: MultipleChoiceQuestion = {
      id: instanceId,
      subjectId: concept.subjectId,
      topicId: concept.topicId,
      difficulty: template.baseDifficulty,
      calibratedDifficulty: template.baseDifficulty,
      questionType: 'multiple_choice',
      prompt: template.promptTemplate,
      explanation: template.explanationTemplate,
      options,
      correctOptionId,
      keyConcept: concept.name,
      source: 'Template Knowledge Base',
      tags: template.tags,
      generationSource: 'template',
      qualityScore: 95,
      validationStatus: 'validated',
      timesAnswered: 0,
      accuracyRate: 0,
      reportCount: 0,
      createdAt: Date.now(),
    };

    // STRICT VALIDATOR PIPELINE
    const validation = QuestionValidator.validateQuestion(question, concept);
    if (!validation.isValid) {
      console.warn('Template question failed strict validation:', validation.reason);
      return null;
    }

    return question;
  }

  /**
   * Generates an algorithmic math question wrapped into EducationalQuestion format
   */
  public static generateAlgorithmicMathQuestion(targetDifficulty: number = 30): EducationalQuestion {
    const mathQ = QuestionGenerator.generateQuestion(['addition', 'subtraction', 'multiplication', 'division'], targetDifficulty);

    // Generate 4 plausible mathematical distractors around the answer
    const correctAns = mathQ.correctAnswer;
    const offsets = [-10, -2, -1, 1, 2, 5, 10, 20].sort(() => 0.5 - Math.random());
    const distractors: number[] = [];

    for (const off of offsets) {
      const candidate = correctAns + off;
      if (candidate !== correctAns && !distractors.includes(candidate)) {
        distractors.push(candidate);
      }
      if (distractors.length === 4) break;
    }

    const allValues = [correctAns, ...distractors].sort(() => 0.5 - Math.random());
    const letters = ['A', 'B', 'C', 'D', 'E'];
    const options = allValues.map((val, idx) => ({
      id: letters[idx],
      text: `${val}`,
      isCorrect: val === correctAns,
    }));

    const correctOption = options.find((o) => o.isCorrect);

    const question: MultipleChoiceQuestion = {
      id: `math_algo_${mathQ.id}_${Date.now()}`,
      subjectId: 'matematica',
      topicId: 'mat_aritmetica',
      difficulty: mathQ.difficultyScore,
      calibratedDifficulty: mathQ.difficultyScore,
      questionType: 'multiple_choice',
      prompt: `Calcule o valor exato da expressão matemática:`,
      latexPrompt: mathQ.expressionString.replace(/×/g, '\\times ').replace(/÷/g, '\\div '),
      explanation: `Resolvendo passo a passo respeitando a ordem de precedência das operações: ${mathQ.expressionString} = ${correctAns}.`,
      options,
      correctOptionId: correctOption ? correctOption.id : 'A',
      keyConcept: 'Operações Fundamentais e Precedência',
      source: 'Gerador Algorítmico Matemático',
      tags: ['matematica', 'calculo', 'aritmetica'],
      generationSource: 'algorithmic',
      qualityScore: 100,
      validationStatus: 'validated',
      timesAnswered: 0,
      accuracyRate: 0,
      reportCount: 0,
      createdAt: Date.now(),
    };

    return question;
  }

  /**
   * Intelligently selects the NEXT question considering anti-repetition,
   * spaced repetition, curated banks, templates, and mathematical algorithms.
   */
  public static getNextQuestion(options: NextQuestionOptions = {}): EducationalQuestion {
    const {
      subjectId = 'mixed',
      topicId,
      targetDifficulty,
      difficultyMode = 'adaptive',
      userState,
      excludeIds = [],
      allowSpacedRepetition = true,
    } = options;

    const allExcluded = new Set([
      ...this.recentQuestionIds,
      ...excludeIds,
      ...Array.from(this.flaggedOrReportedIds),
    ]);

    // 1. Check Pedagogical Spaced Repetition (Review errors with a fresh angle)
    if (allowSpacedRepetition && userState?.errorNotebook) {
      const errorEntries = Object.values(userState.errorNotebook).filter(
        (e) => e.status === 'pending' || e.status === 'in_review'
      );

      if (errorEntries.length > 0 && Math.random() < 0.25) {
        // Pick an error concept
        const randomError = errorEntries[Math.floor(Math.random() * errorEntries.length)];
        const matchedConcept = KNOWLEDGE_BASE_CONCEPTS.find(
          (c) => c.topicId === randomError.topicId || c.id === randomError.questionId
        );

        if (matchedConcept && !this.recentConceptIds.includes(matchedConcept.id)) {
          const srsQuestion = this.generateFromTemplate(matchedConcept);
          if (srsQuestion && !allExcluded.has(srsQuestion.id)) {
            this.recordSelected(srsQuestion);
            return srsQuestion;
          }
        }
      }
    }

    // 2. Select target subject
    let activeSubjectId: SubjectId;
    if (subjectId === 'mixed') {
      // Pick subject intelligently or uniformly
      const candidates = ALL_SUBJECT_IDS.filter((s) => s !== 'redacao');
      activeSubjectId = candidates[Math.floor(Math.random() * candidates.length)];
    } else {
      activeSubjectId = subjectId;
    }

    const resolvedDifficulty = targetDifficulty
      ?? AcademicProgressionEngine.getTargetDifficulty(userState, activeSubjectId, difficultyMode);

    // 3. If Math, occasionally produce algorithmic procedural questions
    if (activeSubjectId === 'matematica' && Math.random() < 0.5 && !topicId) {
      const mathQ = this.generateAlgorithmicMathQuestion(resolvedDifficulty);
      this.recordSelected(mathQ);
      return mathQ;
    }

    // 4. Every non-math discipline has a procedural generator. It always
    // respects the selected subject/topic and prevents exhausted pools from
    // leaking questions from another discipline.
    if (activeSubjectId !== 'matematica' && Math.random() < 0.68) {
      const procedural = ProceduralQuestionEngine.generate(activeSubjectId, resolvedDifficulty, topicId);
      this.recordSelected(procedural);
      return procedural;
    }

    // 5. Candidate Pool: Curated Questions + Template Concepts
    let candidateQuestions: EducationalQuestion[] = [];

    if (topicId) {
      candidateQuestions = QUESTION_BANK.filter(
        (q) => q.topicId === topicId && !allExcluded.has(q.id)
      );
    } else {
      candidateQuestions = QUESTION_BANK.filter(
        (q) => q.subjectId === activeSubjectId && !allExcluded.has(q.id)
      );
    }

    // Fetch Knowledge Base Concepts for this subject
    const subjectConcepts = getKnowledgeConceptsBySubject(activeSubjectId);

    // If we have unused curated questions, combine them with potential template questions
    const poolChoices: Array<() => EducationalQuestion | null> = [];

    for (const q of candidateQuestions) {
      poolChoices.push(() => q);
    }

    for (const concept of subjectConcepts) {
      if (!this.recentConceptIds.includes(concept.id)) {
        poolChoices.push(() => this.generateFromTemplate(concept));
      }
    }

    // Shuffle and pick
    const shuffledChoices = poolChoices.sort(() => 0.5 - Math.random());

    for (const choiceFn of shuffledChoices) {
      const question = choiceFn();
      if (question && !allExcluded.has(question.id)) {
        const validation = QuestionValidator.validateQuestion(question);
        if (validation.isValid) {
          this.recordSelected(question);
          return question;
        }
      }
    }

    // Fallback: never cross subject boundaries.
    if (activeSubjectId === 'matematica') {
      const fallbackMath = this.generateAlgorithmicMathQuestion(resolvedDifficulty);
      this.recordSelected(fallbackMath);
      return fallbackMath;
    }

    const fallback = ProceduralQuestionEngine.generate(activeSubjectId, resolvedDifficulty, topicId);
    this.recordSelected(fallback);
    return fallback;
  }

  /**
   * Preloads a batch of questions to fill the buffer for zero-latency transitions
   */
  public static preloadBatch(
    options: NextQuestionOptions,
    count: number = 10
  ): EducationalQuestion[] {
    const batch: EducationalQuestion[] = [];
    const localExcludes = new Set<string>();

    for (let i = 0; i < count; i++) {
      const q = this.getNextQuestion({
        ...options,
        excludeIds: Array.from(localExcludes),
      });
      localExcludes.add(q.id);
      batch.push(q);
    }

    return batch;
  }

  /**
   * Internal recorder to manage anti-repetition memory rings
   */
  private static recordSelected(q: EducationalQuestion): void {
    this.recentQuestionIds.push(q.id);
    if (this.recentQuestionIds.length > 30) {
      this.recentQuestionIds.shift();
    }

    if (q.topicId) {
      this.recentTopicIds.push(q.topicId);
      if (this.recentTopicIds.length > 10) {
        this.recentTopicIds.shift();
      }
    }

    if (q.keyConcept) {
      this.recentConceptIds.push(q.keyConcept);
      if (this.recentConceptIds.length > 8) {
        this.recentConceptIds.shift();
      }
    }
  }
}
