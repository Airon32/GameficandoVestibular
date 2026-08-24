import { UserState, EducationalQuestion, SpacedRepetitionCard, SubjectId } from '../types';

export class SpacedRepetitionEngine {
  private static readonly BOX_INTERVALS_DAYS = [1, 2, 4, 7, 15]; // Box 1 to 5

  public static addOrUpdateCard(
    currentState: UserState,
    question: EducationalQuestion,
    rating: 'easy' | 'medium' | 'hard' | 'failed'
  ): Record<string, SpacedRepetitionCard> {
    const cards = { ...(currentState.spacedRepetitionCards || {}) };
    if (!question || !question.id) return cards;
    const existing = cards[question.id];
    const now = Date.now();

    let box = existing ? existing.box : 1;
    let consecutiveSuccesses = existing ? existing.consecutiveSuccesses : 0;
    let easeFactor = existing ? existing.easeFactor : 2.5;

    if (rating === 'failed') {
      box = 1;
      consecutiveSuccesses = 0;
      easeFactor = Math.max(1.3, easeFactor - 0.2);
    } else if (rating === 'hard') {
      consecutiveSuccesses += 1;
      easeFactor = Math.max(1.3, easeFactor - 0.15);
      box = Math.max(1, box);
    } else if (rating === 'medium') {
      consecutiveSuccesses += 1;
      box = Math.min(5, box + 1);
    } else if (rating === 'easy') {
      consecutiveSuccesses += 1;
      easeFactor = Math.min(3.0, easeFactor + 0.15);
      box = Math.min(5, box + 2);
    }

    const intervalDays = SpacedRepetitionEngine.BOX_INTERVALS_DAYS[box - 1] || 1;
    const nextReviewDate = now + intervalDays * 24 * 60 * 60 * 1000;

    cards[question.id] = {
      id: question.id,
      subjectId: question.subjectId,
      topicId: question.topicId,
      question,
      box,
      easeFactor,
      intervalDays,
      consecutiveSuccesses,
      nextReviewDate,
      lastReviewedAt: now,
    };

    return cards;
  }

  public static recordCardAnswer(
    currentState: UserState,
    question: EducationalQuestion,
    ratingScore: number
  ): Record<string, SpacedRepetitionCard> {
    const rating: 'easy' | 'medium' | 'hard' | 'failed' =
      ratingScore <= 1 ? 'failed' : ratingScore === 2 ? 'hard' : ratingScore === 3 ? 'medium' : 'easy';
    return this.addOrUpdateCard(currentState, question, rating);
  }

  public static getDueCards(state: UserState, maxCount: number = 20): SpacedRepetitionCard[] {
    const cards = Object.values(state?.spacedRepetitionCards || {});
    const now = Date.now();

    const due = cards.filter((c) => c && typeof c.nextReviewDate === 'number' && c.nextReviewDate <= now);
    due.sort((a, b) => (a.nextReviewDate || 0) - (b.nextReviewDate || 0));
    return due.slice(0, maxCount);
  }

  public static getStats(state: UserState): {
    totalCards: number;
    dueTodayCount: number;
    byBox: Record<number, number>;
  } {
    const cards = Object.values(state?.spacedRepetitionCards || {});
    const now = Date.now();
    let dueTodayCount = 0;
    const byBox: Record<number, number> = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

    for (const card of cards) {
      if (!card) continue;
      if (typeof card.nextReviewDate === 'number' && card.nextReviewDate <= now) dueTodayCount++;
      if (card.box) {
        byBox[card.box] = (byBox[card.box] || 0) + 1;
      }
    }

    return {
      totalCards: cards.length,
      dueTodayCount,
      byBox,
    };
  }
}
