import { describe, expect, it } from 'vitest';
import { EnglishCEFRManager, createEmptySkillProgress } from './EnglishCEFRManager';
import { EnglishSkillMasteryEngine } from './EnglishSkillMasteryEngine';
import { EnglishVocabularyEngine } from './EnglishVocabularyEngine';
import { EnglishLearningEngine } from './EnglishLearningEngine';
import { answersMatch } from '../utils/englishAnswers';
import { createDefaultUserState } from '../services/storageService';
import { StorageService } from '../services/storageService';
import { getLessonQuestions } from '../data/english/englishCourse';
import { CORE_ENGLISH_QUESTION_LIST } from '../data/english/englishQuestions';

describe('English CEFR and mastery', () => {
  it('never derives CEFR from XP and keeps low confidence unevaluated', () => {
    expect(EnglishCEFRManager.fromScore(90, 0.1)).toBe('unevaluated');
    expect(EnglishCEFRManager.fromScore(50, 0.4)).toBe('b1');
    expect(EnglishCEFRManager.estimatedLabel('b1')).toContain('estimado');
  });

  it('updates skill score from observable answers and separates confidence', () => {
    let skill = createEmptySkillProgress('listening');
    skill = EnglishSkillMasteryEngine.recordActivity(skill, 'listening', { isCorrect: true, difficulty: 40, timeTakenMs: 4000 });
    expect(skill.activities).toBe(1);
    expect(skill.confidence).toBeLessThan(0.7);
    skill = EnglishSkillMasteryEngine.recordActivity(skill, 'listening', { isCorrect: false, difficulty: 40, timeTakenMs: 8000 });
    expect(skill.score).toBeLessThan(20);
  });
});

describe('English vocabulary and answers', () => {
  it('accepts translation variants after normalization', () => {
    expect(answersMatch("I'm studying", ['i am studying'])).toBe(true);
    expect(answersMatch('na verdade', ['na verdade'])).toBe(true);
  });

  it('schedules weaker words sooner', () => {
    const seed = EnglishVocabularyEngine.seedEntry({
      word: 'although',
      translation: 'embora',
      definition: 'contrast',
      cefr: 'b1',
      partOfSpeech: 'conjunction',
      exampleSentences: ['Although it rained, we went out.'],
      topic: 'linking_words',
      tags: ['b1'],
    });
    const wrong = EnglishVocabularyEngine.recordSight(undefined, seed, false);
    const right = EnglishVocabularyEngine.recordSight(wrong, seed, true);
    expect(wrong.nextReviewAt || 0).toBeLessThanOrEqual(right.nextReviewAt || 0);
    expect(EnglishVocabularyEngine.dueEntries({ although: { ...wrong, nextReviewAt: Date.now() - 1000 } }, 5).length).toBe(1);
  });
});

describe('English course, XP and migration', () => {
  it('loads lesson questions from the existing ingles topics', () => {
    const questions = getLessonQuestions('a1_u1_l1');
    expect(questions.length).toBeGreaterThan(0);
    expect(questions.every((question) => question.subjectId === 'ingles')).toBe(true);
    expect(CORE_ENGLISH_QUESTION_LIST.some((question) => question.topicId === 'skimming_scanning')).toBe(true);
  });

  it('awards global XP and preserves old user fields', () => {
    const oldUser = createDefaultUserState('Airon', 'user_old');
    oldUser.totalXP = 1200;
    oldUser.englishProgress = undefined;
    const migrated = EnglishLearningEngine.ensureProgress(oldUser);
    expect(migrated.totalXP).toBe(1200);
    expect(migrated.englishProgress?.version).toBe(1);

    const question = getLessonQuestions('a1_u7_l1').find((item) => item.questionType === 'multiple_choice');
    if (!question || question.questionType !== 'multiple_choice') {
      throw new Error('expected a multiple choice English item');
    }
    const answered = EnglishLearningEngine.applyAnswer(migrated, question, question.correctOptionId, 5000);
    expect(answered.state.totalXP).toBeGreaterThanOrEqual(1200);
    expect(answered.state.englishProgress?.stats.questionsAnswered).toBe(1);
  });

  it('keeps guest defaults and merges english without wiping XP', () => {
    const local = createDefaultUserState('Guest', 'guest_1');
    local.totalXP = 50;
    const remote = createDefaultUserState('Guest', 'guest_1');
    remote.totalXP = 80;
    remote.englishProgress = EnglishLearningEngine.createDefaultProgress();
    remote.englishProgress.stats.wordsMastered = 3;
    const merged = StorageService.mergeUserStates(local, remote);
    expect(merged.totalXP).toBe(80);
    expect(merged.englishProgress?.stats.wordsMastered).toBeGreaterThanOrEqual(0);
  });

  it('evaluates placement without forcing existing users', () => {
    const state = EnglishLearningEngine.startFromBeginning(createDefaultUserState());
    expect(state.englishProgress?.placementCompleted).toBe(true);
    expect(state.englishProgress?.placement?.skipped).toBe(true);
  });
});
