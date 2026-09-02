import type { CEFRLevel, EducationalQuestion, EnglishSkill } from '../../types';
import { englishFill, englishListen, englishMC } from './englishQuestions';

export interface PlacementItem {
  skill: EnglishSkill;
  cefr: CEFRLevel;
  question: EducationalQuestion;
}

export const ENGLISH_PLACEMENT_ITEMS: PlacementItem[] = [
  { skill: 'vocabulary', cefr: 'a1', question: englishMC('greetings_introductions', 'vocabulary', 'a1', 18, 'Choose the greeting for 9 a.m.', [['A', 'Good morning', true], ['B', 'Good night', false], ['C', 'See you yesterday', false], ['D', 'Good evening', false]], 'Morning = manhã.') },
  { skill: 'grammar', cefr: 'a1', question: englishFill('present_simple', 'grammar', 'a1', 22, 'Complete: She ___ a student.', 'She {blank} a student.', ['is'], 'She + is.') },
  { skill: 'listening', cefr: 'a1', question: englishListen('basic_listening', 'a1', 24, 'My name is Ana.', 'What did you hear?', [['A', 'My name is Ana.', true], ['B', 'His name is André.', false], ['C', 'I am nine.', false], ['D', 'Good night, Ana.', false]], 'Nome próprio após “my name is”.') },
  { skill: 'grammar', cefr: 'a2', question: englishMC('present_simple', 'grammar', 'a2', 36, 'He ____ to school every day.', [['A', 'go', false], ['B', 'goes', true], ['C', 'going', false], ['D', 'gone', false]], '3ª pessoa: goes.') },
  { skill: 'reading', cefr: 'a2', question: englishMC('linking_words', 'reading', 'a2', 40, '“I was tired, so I slept.” So shows:', [['A', 'contrast', false], ['B', 'result', true], ['C', 'addition', false], ['D', 'time only', false]], 'So = resultado.') },
  { skill: 'vocabulary', cefr: 'b1', question: englishMC('false_friends_vocab', 'vocabulary', 'b1', 50, '“Actually” means:', [['A', 'atualmente', false], ['B', 'na verdade', true], ['C', 'ativamente', false], ['D', 'quase', false]], 'False friend.') },
  { skill: 'reading', cefr: 'b1', question: englishMC('skimming_scanning', 'reading', 'b1', 54, 'Skimming is for:', [['A', 'one exact date', false], ['B', 'the general idea', true], ['C', 'word-by-word translation', false], ['D', 'oral exam only', false]], 'Skimming = visão geral.') },
  { skill: 'grammar', cefr: 'b1', question: englishMC('verb_tenses_modals', 'grammar', 'b1', 56, 'They ____ already left.', [['A', 'has', false], ['B', 'have', true], ['C', 'having', false], ['D', 'is', false]], 'They have + participle.') },
  { skill: 'reading', cefr: 'b2', question: englishMC('linking_words', 'reading', 'b2', 64, '“Despite the difficulty, she passed.” Despite introduces:', [['A', 'a concession/contrast', true], ['B', 'a definition', false], ['C', 'a question', false], ['D', 'a tense', false]], 'Despite + noun phrase.') },
  { skill: 'grammar', cefr: 'b2', question: englishMC('verb_tenses_modals', 'grammar', 'b2', 66, 'Candidates ____ read the instructions carefully.', [['A', 'must', true], ['B', 'maybe', false], ['C', 'mustn maybe', false], ['D', 'have', false]], 'Must = obrigação.') },
];

export function placementToCefr(correctByCefr: Record<string, { correct: number; total: number }>): CEFRLevel {
  const order: CEFRLevel[] = ['a1', 'a2', 'b1', 'b2'];
  let best: CEFRLevel = 'a0';
  for (const level of order) {
    const row = correctByCefr[level];
    if (row && row.total > 0 && row.correct / row.total >= 0.6) best = level;
    else break;
  }
  return best;
}
