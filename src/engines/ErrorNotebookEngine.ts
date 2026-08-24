import { UserState, EducationalQuestion, ErrorNotebookEntry, SubjectId } from '../types';

export class ErrorNotebookEngine {
  public static recordMistake(
    currentState: UserState,
    question: EducationalQuestion,
    userWrongAnswer: string | number,
    correctAnswer: string | number
  ): Record<string, ErrorNotebookEntry> {
    const errorNotebook = { ...(currentState.errorNotebook || {}) };
    if (!question || !question.id) return errorNotebook;
    const existing = errorNotebook[question.id];

    if (existing) {
      errorNotebook[question.id] = {
        ...existing,
        timesWrong: existing.timesWrong + 1,
        userLastWrongAnswer: userWrongAnswer,
        status: existing.status === 'recovered' ? 'in_review' : existing.status,
        lastReviewedAt: Date.now(),
      };
    } else {
      errorNotebook[question.id] = {
        questionId: question.id,
        subjectId: question.subjectId,
        topicId: question.topicId,
        questionPrompt: question.prompt,
        questionType: question.questionType,
        userLastWrongAnswer: userWrongAnswer,
        correctAnswer,
        explanation: question.explanation,
        timesWrong: 1,
        timesReviewed: 0,
        status: 'pending',
        firstFailedAt: Date.now(),
        lastReviewedAt: Date.now(),
      };
    }

    return errorNotebook;
  }

  public static recordSuccessOnReview(
    currentState: UserState,
    questionId: string
  ): Record<string, ErrorNotebookEntry> {
    const errorNotebook = { ...(currentState.errorNotebook || {}) };
    const existing = errorNotebook[questionId];

    if (existing) {
      errorNotebook[questionId] = {
        ...existing,
        timesReviewed: existing.timesReviewed + 1,
        status: 'recovered',
        recoveredAt: Date.now(),
        lastReviewedAt: Date.now(),
      };
    }

    return errorNotebook;
  }

  public static recordCorrection(
    currentState: UserState,
    questionId: string
  ): Record<string, ErrorNotebookEntry> {
    return this.recordSuccessOnReview(currentState, questionId);
  }

  public static removeErrorRecord(
    currentState: UserState,
    questionId: string
  ): UserState {
    const errorNotebook = { ...(currentState.errorNotebook || {}) };
    delete errorNotebook[questionId];
    return {
      ...currentState,
      errorNotebook,
    };
  }

  public static getStats(state: UserState): {
    totalErrors: number;
    pendingCount: number;
    inReviewCount: number;
    recoveredCount: number;
    recoveryRatePercent: number;
    bySubject: Record<SubjectId, number>;
  } {
    const notebook = state.errorNotebook || {};
    const entries = Object.values(notebook);
    const totalErrors = entries.length;

    let pendingCount = 0;
    let inReviewCount = 0;
    let recoveredCount = 0;
    const bySubject: Record<string, number> = {};

    for (const entry of entries) {
      if (!entry) continue;
      if (entry.status === 'pending') pendingCount++;
      else if (entry.status === 'in_review') inReviewCount++;
      else if (entry.status === 'recovered') recoveredCount++;

      if (entry.subjectId) {
        bySubject[entry.subjectId] = (bySubject[entry.subjectId] || 0) + 1;
      }
    }

    const reviewedOrRecovered = inReviewCount + recoveredCount;
    const recoveryRatePercent =
      reviewedOrRecovered > 0 ? Math.round((recoveredCount / (pendingCount + reviewedOrRecovered)) * 100) : 0;

    return {
      totalErrors,
      pendingCount,
      inReviewCount,
      recoveredCount,
      recoveryRatePercent,
      bySubject: bySubject as Record<SubjectId, number>,
    };
  }
}
