import type { CEFRLevel, EducationalQuestion, UserState, VocabularyEntry } from '../types';
import { SpacedRepetitionEngine } from './SpacedRepetitionEngine';

const BOX_DAYS = [1, 2, 4, 7, 15];

export class EnglishVocabularyEngine {
  public static normalize(word: string): string {
    return word.trim().toLowerCase().replace(/[^\p{L}\p{N}' -]/gu, '');
  }

  public static seedEntry(partial: Omit<VocabularyEntry, 'timesSeen' | 'timesCorrect' | 'timesWrong' | 'mastery' | 'lastReviewedAt' | 'nextReviewAt' | 'ease' | 'interval'> & Partial<VocabularyEntry>): VocabularyEntry {
    return {
      pronunciation: partial.pronunciation,
      phonetic: partial.phonetic,
      timesSeen: 0,
      timesCorrect: 0,
      timesWrong: 0,
      mastery: 0,
      lastReviewedAt: null,
      nextReviewAt: Date.now(),
      ease: 2.5,
      interval: 1,
      ...partial,
      word: this.normalize(partial.word),
    };
  }

  public static recordSight(entry: VocabularyEntry | undefined, seed: VocabularyEntry, isCorrect: boolean): VocabularyEntry {
    const current = entry || seed;
    const timesSeen = current.timesSeen + 1;
    const timesCorrect = current.timesCorrect + (isCorrect ? 1 : 0);
    const timesWrong = current.timesWrong + (isCorrect ? 0 : 1);
    let ease = current.ease;
    let interval = current.interval || 1;
    if (!isCorrect) {
      ease = Math.max(1.3, ease - 0.2);
      interval = 1;
    } else if (timesCorrect >= 3) {
      ease = Math.min(3, ease + 0.05);
      interval = Math.min(15, interval + 1);
    }
    const box = Math.max(1, Math.min(5, interval));
    const mastery = Math.max(0, Math.min(100, Math.round((timesCorrect / Math.max(1, timesSeen)) * 100 * (0.5 + Math.min(0.5, timesSeen / 8)))));
    return {
      ...current,
      timesSeen,
      timesCorrect,
      timesWrong,
      ease,
      interval,
      mastery,
      lastReviewedAt: Date.now(),
      nextReviewAt: Date.now() + (BOX_DAYS[box - 1] || 1) * 24 * 60 * 60 * 1000,
    };
  }

  public static dueEntries(vocab: Record<string, VocabularyEntry>, limit = 14): VocabularyEntry[] {
    const now = Date.now();
    return Object.values(vocab)
      .filter((entry) => (entry.nextReviewAt || 0) <= now)
      .sort((a, b) => (a.nextReviewAt || 0) - (b.nextReviewAt || 0))
      .slice(0, limit);
  }

  public static stats(vocab: Record<string, VocabularyEntry>) {
    const entries = Object.values(vocab);
    return {
      total: entries.length,
      new: entries.filter((entry) => entry.timesSeen === 0).length,
      learning: entries.filter((entry) => entry.timesSeen > 0 && entry.mastery < 50).length,
      weak: entries.filter((entry) => entry.mastery > 0 && entry.mastery < 40).length,
      strong: entries.filter((entry) => entry.mastery >= 50 && entry.mastery < 85).length,
      mastered: entries.filter((entry) => entry.mastery >= 85).length,
      due: this.dueEntries(vocab, 99).length,
    };
  }

  public static toFlashcard(entry: VocabularyEntry): EducationalQuestion {
    return {
      id: `vocab_${entry.word}`,
      subjectId: 'ingles',
      topicId: entry.topic || 'false_friends_vocab',
      difficulty: this.difficultyForCefr(entry.cefr),
      questionType: 'flashcard',
      prompt: entry.word,
      explanation: `${entry.definition} Ex.: ${entry.exampleSentences[0] || ''}`,
      frontPrompt: entry.word,
      backResponse: `${entry.translation} — ${entry.definition}`,
      englishSkill: 'vocabulary',
      cefrLevel: entry.cefr,
      tags: ['ingles', 'vocabulary', entry.word],
      generationSource: 'curated',
      validationStatus: 'validated',
      qualityScore: 90,
    };
  }

  public static syncSpacedRepetition(state: UserState, entry: VocabularyEntry, isCorrect: boolean): UserState {
    const question = this.toFlashcard(entry);
    const ratingScore = isCorrect ? (entry.mastery >= 70 ? 4 : 3) : 1;
    return {
      ...state,
      spacedRepetitionCards: SpacedRepetitionEngine.recordCardAnswer(state, question, ratingScore),
    };
  }

  private static difficultyForCefr(level: CEFRLevel): number {
    const map: Record<CEFRLevel, number> = { a0: 12, a1: 22, a2: 36, b1: 52, b2: 68, c1: 82, c2: 94 };
    return map[level];
  }
}
