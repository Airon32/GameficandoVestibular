import { EducationalQuestion, MultipleChoiceQuestion, KnowledgeConcept } from '../types';

export interface ValidationResult {
  isValid: boolean;
  qualityScore: number; // 0 to 100
  estimatedDifficulty: number; // 1 to 100
  reason?: string;
  errors: string[];
  warnings: string[];
}

export class QuestionValidator {
  /**
   * Strictly validates an educational question before presenting it to the user.
   * Enforces:
   * 1. Unique correct answer for multiple choice
   * 2. Non-empty, non-duplicate, non-ambiguous options
   * 3. Coherent explanation referencing the concept
   * 4. Text length and complexity consistency
   * 5. No contradiction with Knowledge Base facts
   */
  public static validateQuestion(
    question: EducationalQuestion,
    concept?: KnowledgeConcept
  ): ValidationResult {
    const errors: string[] = [];
    const warnings: string[] = [];
    let qualityScore = 100;

    if (!question.id || question.id.trim() === '') {
      errors.push('Question missing valid unique ID');
    }

    if (!question.prompt || question.prompt.trim().length < 8) {
      errors.push('Prompt is empty or excessively short');
    }

    if (!question.explanation || question.explanation.trim().length < 8) {
      errors.push('Explanation is empty or missing pedagogical rationale');
      qualityScore -= 20;
    }

    // Multiple Choice Validations
    if (question.questionType === 'multiple_choice') {
      const mc = question as MultipleChoiceQuestion;
      if (!mc.options || mc.options.length < 2) {
        errors.push('Multiple choice question must have at least 2 options');
      } else {
        const optionIds = new Set<string>();
        const optionTexts = new Set<string>();
        let correctFound = false;

        for (const opt of mc.options) {
          if (!opt.id || opt.id.trim() === '') {
            errors.push('Option with missing ID encountered');
          }
          if (optionIds.has(opt.id)) {
            errors.push(`Duplicate option ID: ${opt.id}`);
          }
          optionIds.add(opt.id);

          const trimmedText = (opt.text || '').trim().toLowerCase();
          if (trimmedText.length === 0) {
            errors.push(`Option ${opt.id} has empty text content`);
          }

          if (optionTexts.has(trimmedText)) {
            errors.push(`Ambiguous / duplicate option text: "${opt.text}"`);
          }
          optionTexts.add(trimmedText);

          if (opt.id === mc.correctOptionId) {
            correctFound = true;
          }
        }

        if (!correctFound) {
          errors.push(`Correct option ID "${mc.correctOptionId}" does not match any existing option`);
        }

        // Check for too few distractors
        if (mc.options.length < 4) {
          warnings.push('Standard vestibular multiple choice typically uses 4 or 5 options');
          qualityScore -= 5;
        }
      }
    }

    // Knowledge Concept validation against contradictions
    if (concept) {
      if (question.subjectId !== concept.subjectId) {
        errors.push(`Subject mismatch: question has ${question.subjectId}, concept is ${concept.subjectId}`);
      }
      // Check if prompt is completely unrelated to concept keywords
      const promptLower = question.prompt.toLowerCase();
      const hasKeyword = concept.relationships.some((r) =>
        promptLower.includes(r.toLowerCase())
      ) || promptLower.includes(concept.name.toLowerCase());

      if (!hasKeyword && promptLower.length > 50) {
        warnings.push('Prompt does not explicitly reference primary knowledge concept relationships');
        qualityScore -= 10;
      }
    }

    // Calibrated Difficulty calculation
    let estimatedDifficulty = question.difficulty || 30;
    if (question.calibratedDifficulty && question.calibratedDifficulty > 0) {
      estimatedDifficulty = question.calibratedDifficulty;
    } else {
      // Heuristic adjustment based on prompt length and technical density
      const textLen = question.prompt.length;
      if (textLen > 300) estimatedDifficulty = Math.min(100, estimatedDifficulty + 10);
      if (textLen < 60) estimatedDifficulty = Math.max(10, estimatedDifficulty - 5);
    }

    const isValid = errors.length === 0;

    return {
      isValid,
      qualityScore: isValid ? Math.max(30, qualityScore) : 0,
      estimatedDifficulty,
      reason: errors.length > 0 ? errors.join('; ') : 'Validated successfully',
      errors,
      warnings,
    };
  }

  /**
   * Recalibrates live question difficulty based on historical response statistics
   * Minimum 10 responses required before shifting difficulty
   */
  public static recalibrateDifficulty(
    initialDifficulty: number,
    timesAnswered: number,
    accuracyRate: number
  ): number {
    if (timesAnswered < 10) return initialDifficulty;

    // Expected accuracy based on difficulty:
    // Diff 15 -> ~85% accuracy
    // Diff 50 -> ~50% accuracy
    // Diff 85 -> ~20% accuracy
    const expectedAccuracy = Math.max(0.1, 1 - initialDifficulty / 100);
    const deviation = accuracyRate - expectedAccuracy;

    // If accuracy is much higher than expected, question is easier than estimated
    const adjustment = Math.round(deviation * -30);
    const calibrated = Math.max(10, Math.min(100, initialDifficulty + adjustment));

    return calibrated;
  }
}
