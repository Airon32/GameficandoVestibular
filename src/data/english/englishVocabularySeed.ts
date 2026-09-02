import type { CEFRLevel, VocabularyEntry } from '../../types';
import { EnglishVocabularyEngine } from '../../engines/EnglishVocabularyEngine';

function v(
  word: string,
  translation: string,
  definition: string,
  cefr: CEFRLevel,
  partOfSpeech: string,
  topic: string,
  example: string,
  extra: Partial<VocabularyEntry> = {}
): VocabularyEntry {
  return EnglishVocabularyEngine.seedEntry({
    word,
    translation,
    definition,
    cefr,
    partOfSpeech,
    topic,
    tags: [cefr, topic],
    exampleSentences: [example],
    ...extra,
  });
}

export const ENGLISH_VOCABULARY_SEED: VocabularyEntry[] = [
  v('hello', 'olá', 'a greeting used when meeting someone', 'a0', 'exclamation', 'greetings_introductions', 'Hello, my name is Ana.'),
  v('name', 'nome', 'what a person is called', 'a0', 'noun', 'greetings_introductions', 'My name is Pedro.'),
  v('morning', 'manhã', 'the early part of the day', 'a1', 'noun', 'greetings_introductions', 'Good morning, class.'),
  v('fifteen', 'quinze', 'the number 15', 'a1', 'number', 'numbers_age', 'She is fifteen years old.'),
  v('sister', 'irmã', 'a female sibling', 'a1', 'noun', 'family', 'This is my sister.'),
  v('breakfast', 'café da manhã', 'the first meal of the day', 'a1', 'noun', 'daily_routine', 'I eat breakfast at 7.'),
  v('coffee', 'café', 'a hot brown drink', 'a1', 'noun', 'food', 'I would like a cup of coffee.'),
  v('airport', 'aeroporto', 'a place where planes take off and land', 'a1', 'noun', 'places', 'We arrived at the airport early.'),
  v('always', 'sempre', 'at all times; on every occasion', 'a2', 'adverb', 'daily_routine', 'She always studies at night.'),
  v('although', 'embora / apesar de', 'used to introduce a contrast', 'b1', 'conjunction', 'linking_words', 'Although it was raining, we went out.'),
  v('actually', 'na verdade', 'in fact; contrary to what was thought', 'b1', 'adverb', 'false_friends_vocab', 'I thought it was easy. Actually, it was hard.'),
  v('currently', 'atualmente', 'at the present time', 'b1', 'adverb', 'false_friends_vocab', 'She is currently studying for the ENEM.'),
  v('pretend', 'fingir', 'to act as if something is true when it is not', 'b1', 'verb', 'false_friends_vocab', 'Do not pretend you understand the text.'),
  v('however', 'entretanto', 'used to introduce a contrasting idea', 'b1', 'adverb', 'linking_words', 'The text is short; however, it is dense.'),
  v('therefore', 'portanto', 'for that reason', 'b2', 'adverb', 'linking_words', 'He trained every day; therefore, he improved.'),
  v('device', 'dispositivo', 'a machine or tool made for a purpose', 'b1', 'noun', 'textual_reference', 'The device is new. It is expensive.'),
  v('skimming', 'leitura rápida geral', 'reading quickly for the main idea', 'b1', 'noun', 'skimming_scanning', 'Use skimming before answering ENEM items.'),
  v('scanning', 'busca de dado específico', 'looking quickly for a specific piece of information', 'b1', 'noun', 'skimming_scanning', 'Scan the chart for the year 2019.'),
  v('must', 'deve (obrigação)', 'used for strong obligation or a rule', 'b1', 'modal', 'verb_tenses_modals', 'You must wear a helmet.'),
  v('already', 'já', 'before now; sooner than expected', 'b1', 'adverb', 'verb_tenses_modals', 'She has already finished the report.'),
];
