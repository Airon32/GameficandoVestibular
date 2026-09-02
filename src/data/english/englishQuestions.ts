import type {
  CEFRLevel,
  EducationalQuestion,
  EnglishSkill,
  EnglishTrack,
  FillBlankQuestion,
  ListeningQuestion,
  MatchingQuestion,
  MultipleChoiceQuestion,
  OrderingQuestion,
  SpeakingQuestion,
  TranslationQuestion,
  WritingQuestion,
} from '../../types';

let seq = 0;
function id(prefix: string): string {
  seq += 1;
  return `${prefix}_${seq}`;
}

function base(
  topicId: string,
  skill: EnglishSkill,
  cefr: CEFRLevel,
  difficulty: number,
  prompt: string,
  explanation: string
) {
  return {
    id: id('en'),
    subjectId: 'ingles' as const,
    topicId,
    difficulty,
    prompt,
    explanation,
    englishSkill: skill,
    cefrLevel: cefr,
    source: 'English Course',
    tags: ['ingles', skill, cefr, topicId],
    generationSource: 'curated' as const,
    validationStatus: 'validated' as const,
    qualityScore: 92,
  };
}

export function englishMC(
  topicId: string,
  skill: EnglishSkill,
  cefr: CEFRLevel,
  difficulty: number,
  prompt: string,
  options: Array<[string, string, boolean]>,
  explanation: string
): MultipleChoiceQuestion {
  const mapped = options.map(([optId, text, isCorrect]) => ({ id: optId, text, isCorrect }));
  return {
    ...base(topicId, skill, cefr, difficulty, prompt, explanation),
    questionType: 'multiple_choice',
    options: mapped,
    correctOptionId: mapped.find((option) => option.isCorrect)?.id || 'A',
  };
}

export function englishFill(
  topicId: string,
  skill: EnglishSkill,
  cefr: CEFRLevel,
  difficulty: number,
  prompt: string,
  template: string,
  answers: string[],
  explanation: string,
  options?: string[]
): FillBlankQuestion {
  return {
    ...base(topicId, skill, cefr, difficulty, prompt, explanation),
    questionType: 'fill_blank',
    template,
    correctAnswers: answers,
    options,
  };
}

export function englishTranslate(
  topicId: string,
  cefr: CEFRLevel,
  difficulty: number,
  sourceText: string,
  accepted: string[],
  explanation: string,
  sourceLang: 'en' | 'pt' = 'en'
): TranslationQuestion {
  return {
    ...base(topicId, 'writing', cefr, difficulty, `Translate: “${sourceText}”`, explanation),
    questionType: 'translation',
    sourceText,
    sourceLang,
    acceptedAnswers: accepted,
  };
}

export function englishOrder(
  topicId: string,
  cefr: CEFRLevel,
  difficulty: number,
  prompt: string,
  words: string[],
  explanation: string
): OrderingQuestion {
  return {
    ...base(topicId, 'grammar', cefr, difficulty, prompt, explanation),
    questionType: 'ordering',
    items: words.map((text, index) => ({ id: `w${index}`, text, correctOrder: index })),
  };
}

export function englishMatch(
  topicId: string,
  cefr: CEFRLevel,
  difficulty: number,
  prompt: string,
  pairs: Array<[string, string]>,
  explanation: string
): MatchingQuestion {
  return {
    ...base(topicId, 'vocabulary', cefr, difficulty, prompt, explanation),
    questionType: 'matching',
    pairs: pairs.map(([left, right], index) => ({ id: `p${index}`, left, right })),
  };
}

export function englishListen(
  topicId: string,
  cefr: CEFRLevel,
  difficulty: number,
  audioText: string,
  prompt: string,
  options: Array<[string, string, boolean]>,
  explanation: string
): ListeningQuestion {
  const mapped = options.map(([optId, text, isCorrect]) => ({ id: optId, text, isCorrect }));
  return {
    ...base(topicId, 'listening', cefr, difficulty, prompt, explanation),
    questionType: 'listening',
    audioText,
    options: mapped,
    correctOptionId: mapped.find((option) => option.isCorrect)?.id || 'A',
  };
}

export function englishSpeak(
  topicId: string,
  cefr: CEFRLevel,
  difficulty: number,
  promptToSpeak: string,
  accepted: string[],
  explanation: string
): SpeakingQuestion {
  return {
    ...base(topicId, 'speaking', cefr, difficulty, `Repeat: “${promptToSpeak}”`, explanation),
    questionType: 'speaking',
    promptToSpeak,
    acceptedAnswers: accepted,
  };
}

export function englishWrite(
  topicId: string,
  cefr: CEFRLevel,
  difficulty: number,
  prompt: string,
  sampleAnswer: string,
  explanation: string,
  minWords = 8
): WritingQuestion {
  return {
    ...base(topicId, 'writing', cefr, difficulty, prompt, explanation),
    questionType: 'writing',
    sampleAnswer,
    minWords,
  };
}

export interface EnglishLessonSpec {
  id: string;
  unitId: string;
  title: string;
  minutes: number;
  skill: EnglishSkill;
  cefr: CEFRLevel;
  track: EnglishTrack;
  vocab: string[];
  questions: EducationalQuestion[];
}

export function buildCoreEnglishQuestions(): Record<string, EducationalQuestion[]> {
  const greetings: EducationalQuestion[] = [
    englishMC('greetings_introductions', 'vocabulary', 'a1', 18, 'How do you greet someone in the morning?', [
      ['A', 'Good night', false],
      ['B', 'Good morning', true],
      ['C', 'See you', false],
      ['D', 'Good evening', false],
    ], 'Use “Good morning” until about noon.'),
    englishFill('greetings_introductions', 'grammar', 'a1', 20, 'Complete: I ___ Ana.', 'I {blank} Ana.', ['am'], 'Com “I” usamos “am”: I am Ana.'),
    englishOrder('greetings_introductions', 'a1', 22, 'Monte: My name is Pedro.', ['My', 'name', 'is', 'Pedro'], 'Ordem: sujeito + name + is + nome.'),
    englishTranslate('greetings_introductions', 'a1', 24, 'Nice to meet you.', ['prazer em conhecê-lo', 'prazer em conhece-lo', 'prazer em te conhecer', 'muito prazer'], 'Saudação formal ao conhecer alguém.'),
    englishSpeak('greetings_introductions', 'a1', 20, 'Hello, my name is Ana.', ['hello my name is ana', 'hello my name is anna'], 'Fale devagar e claro.'),
    englishListen('greetings_introductions', 'a1', 22, 'How are you?', 'O que você ouviu?', [
      ['A', 'Who are you?', false],
      ['B', 'How are you?', true],
      ['C', 'Where are you?', false],
      ['D', 'How old are you?', false],
    ], '“How are you?” pergunta como a pessoa está.'),
  ];

  const numbers: EducationalQuestion[] = [
    englishMC('numbers_age', 'vocabulary', 'a1', 18, 'What number is “fifteen”?', [
      ['A', '13', false],
      ['B', '14', false],
      ['C', '15', true],
      ['D', '50', false],
    ], 'Fifteen = 15. Fifty = 50.'),
    englishFill('numbers_age', 'grammar', 'a1', 22, 'Complete: I ___ 18 years old.', 'I {blank} 18 years old.', ['am'], 'Idade usa to be: I am 18 years old.'),
    englishMatch('numbers_age', 'a1', 20, 'Combine número e palavra.', [['12', 'twelve'], ['20', 'twenty'], ['30', 'thirty'], ['100', 'one hundred']], 'Memorize os números-base primeiro.'),
  ];

  const family: EducationalQuestion[] = [
    englishMC('family', 'vocabulary', 'a1', 20, '“Sibling” means:', [
      ['A', 'only brother', false],
      ['B', 'brother or sister', true],
      ['C', 'cousin', false],
      ['D', 'parent', false],
    ], 'Sibling cobre irmão e irmã.'),
    englishFill('family', 'grammar', 'a1', 22, 'Complete: She ___ my sister.', 'She {blank} my sister.', ['is'], 'He/She/It + is.'),
  ];

  const routine: EducationalQuestion[] = [
    englishMC('daily_routine', 'grammar', 'a1', 28, 'Choose the correct sentence.', [
      ['A', 'He go to school every day.', false],
      ['B', 'He goes to school every day.', true],
      ['C', 'He going to school every day.', false],
      ['D', 'He gone to school every day.', false],
    ], 'Na 3ª pessoa do singular, Simple Present recebe -s/-es.'),
    englishOrder('daily_routine', 'a1', 26, 'Monte: I wake up at seven.', ['I', 'wake', 'up', 'at', 'seven'], 'Sujeito + verbo + complemento.'),
    englishWrite('daily_routine', 'a1', 30, 'Write three sentences about your day.', 'I wake up at 7. I study English. I go to bed at 11.', 'Use Simple Present para hábitos.', 8),
  ];

  const food: EducationalQuestion[] = [
    englishMC('food', 'vocabulary', 'a1', 18, 'Which word is a drink?', [
      ['A', 'apple', false],
      ['B', 'bread', false],
      ['C', 'water', true],
      ['D', 'rice', false],
    ], 'Water é bebida.'),
    englishFill('food', 'grammar', 'a1', 24, 'Complete: I would like ___ cup of coffee.', 'I would like {blank} cup of coffee.', ['a'], 'Usamos “a” antes de som consonantal: a cup.'),
  ];

  const present: EducationalQuestion[] = [
    englishMC('present_simple', 'grammar', 'a1', 32, 'I ___ studying English.', [
      ['A', 'am', true],
      ['B', 'is', false],
      ['C', 'are', false],
      ['D', 'be', false],
    ], 'I am. You/we/they are. He/she/it is.'),
    englishMC('present_simple', 'grammar', 'a2', 38, 'They ___ football on Sundays.', [
      ['A', 'plays', false],
      ['B', 'play', true],
      ['C', 'playing', false],
      ['D', 'is play', false],
    ], 'They (plural) não recebe -s.'),
    englishTranslate('present_simple', 'a2', 36, 'I have been studying since morning.', ['eu estudo desde de manhã', 'eu tenho estudado desde de manhã', 'eu venho estudando desde de manhã', 'eu estou estudando desde de manhã'], 'Present Perfect Continuous descreve duração até agora.'),
  ];

  const questions: EducationalQuestion[] = [
    englishMC('questions_english', 'grammar', 'a1', 30, 'Make a question: You are Brazilian.', [
      ['A', 'Are you Brazilian?', true],
      ['B', 'You are Brazilian?', false],
      ['C', 'Do you are Brazilian?', false],
      ['D', 'Is you Brazilian?', false],
    ], 'Com to be, invertemos verbo e sujeito.'),
    englishOrder('questions_english', 'a2', 34, 'Monte: Where do you live?', ['Where', 'do', 'you', 'live'], 'Wh- word + auxiliar + sujeito + verbo.'),
  ];

  const falseFriends: EducationalQuestion[] = [
    englishMC('false_friends_vocab', 'vocabulary', 'b1', 48, '“Actually” means:', [
      ['A', 'atualmente', false],
      ['B', 'na verdade / de fato', true],
      ['C', 'ativamente', false],
      ['D', 'eventualmente', false],
    ], 'Falso cognato clássico de vestibular. “Atualmente” = currently / nowadays.'),
    englishMC('false_friends_vocab', 'vocabulary', 'b1', 50, '“Pretend” is closest to:', [
      ['A', 'pretender / ter a intenção', false],
      ['B', 'fingir', true],
      ['C', 'prestar atenção', false],
      ['D', 'prevenir', false],
    ], 'Intend = pretender. Pretend = fingir.'),
  ];

  const linking: EducationalQuestion[] = [
    englishMC('linking_words', 'reading', 'b1', 52, '“Although it was raining, we went out.” Although expresses:', [
      ['A', 'cause', false],
      ['B', 'contrast', true],
      ['C', 'addition', false],
      ['D', 'conclusion', false],
    ], 'Although/even though marcam oposição.'),
    englishFill('linking_words', 'grammar', 'b2', 58, 'Complete: She studied a lot; ____, she passed.', 'She studied a lot; {blank}, she passed.', ['therefore', 'so', 'consequently'], 'Therefore introduz conclusão.'),
  ];

  const skimming: EducationalQuestion[] = [
    englishMC('skimming_scanning', 'reading', 'b1', 54, 'Skimming is used to:', [
      ['A', 'find one specific number', false],
      ['B', 'get the general idea quickly', true],
      ['C', 'translate every word', false],
      ['D', 'memorize the text', false],
    ], 'Skimming = ideia geral. Scanning = dado específico.'),
    englishMC('skimming_scanning', 'reading', 'b2', 60, 'Scanning is best for:', [
      ['A', 'author intention in an essay', false],
      ['B', 'locating a date, name or statistic', true],
      ['C', 'summarizing the whole article', false],
      ['D', 'checking grammar', false],
    ], 'Scanning busca informação pontual.'),
  ];

  const tenses: EducationalQuestion[] = [
    englishMC('verb_tenses_modals', 'grammar', 'b1', 56, 'She ____ already finished the report.', [
      ['A', 'have', false],
      ['B', 'has', true],
      ['C', 'having', false],
      ['D', 'had been', false],
    ], 'Present Perfect: has/have + past participle.'),
    englishMC('verb_tenses_modals', 'grammar', 'b2', 62, 'You ____ wear a helmet. It is a rule.', [
      ['A', 'might', false],
      ['B', 'must', true],
      ['C', 'could', false],
      ['D', 'may not', false],
    ], 'Must expressa obrigação forte.'),
  ];

  const reference: EducationalQuestion[] = [
    englishMC('textual_reference', 'reading', 'b1', 55, 'In “The device is new. It is expensive.”, “It” refers to:', [
      ['A', 'an unknown person', false],
      ['B', 'the device', true],
      ['C', 'the price only', false],
      ['D', 'the reader', false],
    ], 'Pronomes retomam o antecedente mais próximo e coerente.'),
  ];

  const listeningA2: EducationalQuestion[] = [
    englishListen('basic_listening', 'a2', 34, 'Where are you going?', 'What did you hear?', [
      ['A', 'Where are you going?', true],
      ['B', 'What are you doing?', false],
      ['C', 'When are you coming?', false],
      ['D', 'Why are you leaving?', false],
    ], 'Ouça a palavra interrogativa: where.'),
  ];

  const conversation: EducationalQuestion[] = [
    englishSpeak('basic_conversation', 'a2', 32, 'I would like a cup of coffee.', ['i would like a cup of coffee'], 'Frase útil em cafeteria.'),
    englishMC('basic_conversation', 'vocabulary', 'a2', 30, 'At a coffee shop, a polite request is:', [
      ['A', 'Give me coffee now.', false],
      ['B', 'I would like a coffee, please.', true],
      ['C', 'Coffee you have?', false],
      ['D', 'Want coffee me.', false],
    ], 'Would like + please é o padrão educado.'),
  ];

  const places: EducationalQuestion[] = [
    englishMC('places', 'vocabulary', 'a1', 20, 'You catch a plane at the:', [
      ['A', 'hospital', false],
      ['B', 'airport', true],
      ['C', 'library', false],
      ['D', 'bakery', false],
    ], 'Airport = aeroporto.'),
    englishFill('places', 'grammar', 'a1', 22, 'Complete: I am ___ the library.', 'I am {blank} the library.', ['at', 'in'], 'At the library é o mais natural para localização pontual.'),
  ];

  return {
    greetings_introductions: greetings,
    numbers_age: numbers,
    family,
    daily_routine: routine,
    food,
    places,
    present_simple: present,
    questions_english: questions,
    basic_listening: listeningA2,
    basic_conversation: conversation,
    false_friends_vocab: falseFriends,
    linking_words: linking,
    skimming_scanning: skimming,
    verb_tenses_modals: tenses,
    textual_reference: reference,
  };
}

export const CORE_ENGLISH_QUESTION_LIST: EducationalQuestion[] = Object.values(buildCoreEnglishQuestions()).flat();
