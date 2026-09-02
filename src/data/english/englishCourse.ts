import type { CEFRLevel, EducationalQuestion, EnglishSkill, EnglishTrack, EnglishUnitStatus } from '../../types';
import { buildCoreEnglishQuestions } from './englishQuestions';

export interface EnglishLessonDefinition {
  id: string;
  title: string;
  minutes: number;
  skill: EnglishSkill;
  topicId: string;
}

export interface EnglishUnitDefinition {
  id: string;
  title: string;
  subtitle: string;
  cefr: CEFRLevel;
  track: EnglishTrack;
  isBoss?: boolean;
  lessons: EnglishLessonDefinition[];
  topicId: string;
}

export interface EnglishSectionDefinition {
  id: string;
  title: string;
  island: string;
}

export interface EnglishLevelDefinition {
  id: CEFRLevel;
  title: string;
  island: string;
  sections: EnglishSectionDefinition[];
  units: EnglishUnitDefinition[];
}

function unit(
  id: string,
  title: string,
  subtitle: string,
  cefr: CEFRLevel,
  topicId: string,
  lessons: EnglishLessonDefinition[],
  track: EnglishTrack = 'life',
  isBoss = false
): EnglishUnitDefinition {
  return { id, title, subtitle, cefr, track, isBoss, lessons, topicId };
}

function lesson(id: string, title: string, skill: EnglishSkill, topicId: string, minutes = 6): EnglishLessonDefinition {
  return { id, title, minutes, skill, topicId };
}

export const ENGLISH_COURSE: EnglishLevelDefinition[] = [
  {
    id: 'a0',
    title: 'Foundation',
    island: 'Foundation Island',
    sections: [{ id: 'a0s1', title: 'First Sounds', island: 'Foundation Island' }],
    units: [
      unit('a0_u1', 'Sounds & Letters', 'Alphabet and basic sounds', 'a0', 'greetings_introductions', [
        lesson('a0_u1_l1', 'Hello & goodbye', 'vocabulary', 'greetings_introductions'),
        lesson('a0_u1_l2', 'My name is', 'speaking', 'greetings_introductions'),
      ]),
      unit('a0_u2', 'Classroom Words', 'Useful words to start', 'a0', 'places', [
        lesson('a0_u2_l1', 'School objects', 'vocabulary', 'places'),
      ]),
    ],
  },
  {
    id: 'a1',
    title: 'A1 Beginner',
    island: 'Beginner Village',
    sections: [{ id: 'a1s1', title: 'First Contact', island: 'Beginner Village' }],
    units: [
      unit('a1_u1', 'Greetings & Introductions', 'Say who you are', 'a1', 'greetings_introductions', [
        lesson('a1_u1_l1', 'Greetings', 'vocabulary', 'greetings_introductions'),
        lesson('a1_u1_l2', 'I am / My name', 'grammar', 'greetings_introductions'),
        lesson('a1_u1_l3', 'Listen and speak', 'listening', 'greetings_introductions'),
      ]),
      unit('a1_u2', 'Numbers & Age', 'Count and say your age', 'a1', 'numbers_age', [
        lesson('a1_u2_l1', 'Numbers 1–20', 'vocabulary', 'numbers_age'),
        lesson('a1_u2_l2', 'I am 18', 'grammar', 'numbers_age'),
      ]),
      unit('a1_u3', 'Family', 'Talk about relatives', 'a1', 'family', [
        lesson('a1_u3_l1', 'Family words', 'vocabulary', 'family'),
      ]),
      unit('a1_u4', 'Daily Routine', 'Habits in Simple Present', 'a1', 'daily_routine', [
        lesson('a1_u4_l1', 'My day', 'grammar', 'daily_routine'),
        lesson('a1_u4_l2', 'Write your day', 'writing', 'daily_routine'),
      ]),
      unit('a1_u5', 'Food', 'Order and describe food', 'a1', 'food', [
        lesson('a1_u5_l1', 'Food words', 'vocabulary', 'food'),
      ]),
      unit('a1_u6', 'Places', 'Where things happen', 'a1', 'places', [
        lesson('a1_u6_l1', 'In the city', 'vocabulary', 'places'),
      ]),
      unit('a1_u7', 'Present Simple', 'Habits and facts', 'a1', 'present_simple', [
        lesson('a1_u7_l1', 'I am / He goes', 'grammar', 'present_simple'),
      ]),
      unit('a1_u8', 'Questions', 'Ask for information', 'a1', 'questions_english', [
        lesson('a1_u8_l1', 'Yes/No and Wh-', 'grammar', 'questions_english'),
      ]),
      unit('a1_u9', 'Basic Listening', 'Catch short questions', 'a1', 'basic_listening', [
        lesson('a1_u9_l1', 'What did you hear?', 'listening', 'basic_listening'),
      ]),
      unit('a1_u10', 'Basic Conversation', 'Coffee shop phrases', 'a1', 'basic_conversation', [
        lesson('a1_u10_l1', 'Polite requests', 'speaking', 'basic_conversation'),
      ], 'life', true),
    ],
  },
  {
    id: 'a2',
    title: 'A2 Elementary',
    island: 'Daily Life Town',
    sections: [{ id: 'a2s1', title: 'Daily Life', island: 'Daily Life Town' }],
    units: [
      unit('a2_u1', 'Present Continuous', 'Actions now', 'a2', 'present_simple', [
        lesson('a2_u1_l1', 'I am studying', 'grammar', 'present_simple'),
      ]),
      unit('a2_u2', 'False Friends (intro)', 'Cognatos perigosos', 'a2', 'false_friends_vocab', [
        lesson('a2_u2_l1', 'Actually vs currently', 'vocabulary', 'false_friends_vocab'),
      ], 'vestibular'),
      unit('a2_u3', 'Linking Words (basic)', 'However, because, so', 'a2', 'linking_words', [
        lesson('a2_u3_l1', 'Contrast and reason', 'reading', 'linking_words'),
      ], 'vestibular'),
    ],
  },
  {
    id: 'b1',
    title: 'B1 Intermediate',
    island: 'Grammar Academy',
    sections: [{ id: 'b1s1', title: 'Texts & Exams', island: 'Grammar Academy' }],
    units: [
      unit('b1_u1', 'Skimming & Scanning', 'Estratégias de prova', 'b1', 'skimming_scanning', [
        lesson('b1_u1_l1', 'Skimming', 'reading', 'skimming_scanning'),
        lesson('b1_u1_l2', 'Scanning', 'reading', 'skimming_scanning'),
      ], 'vestibular'),
      unit('b1_u2', 'False Friends', 'Vocabulário de vestibular', 'b1', 'false_friends_vocab', [
        lesson('b1_u2_l1', 'Pretend, actually, notice', 'vocabulary', 'false_friends_vocab'),
      ], 'vestibular'),
      unit('b1_u3', 'Verb Tenses & Modals', 'Present Perfect e modais', 'b1', 'verb_tenses_modals', [
        lesson('b1_u3_l1', 'Has already', 'grammar', 'verb_tenses_modals'),
      ], 'vestibular'),
      unit('b1_u4', 'Textual Reference', 'It, they, which', 'b1', 'textual_reference', [
        lesson('b1_u4_l1', 'Pronoun reference', 'reading', 'textual_reference'),
      ], 'vestibular'),
    ],
  },
  {
    id: 'b2',
    title: 'B2 Upper',
    island: 'Conversation City',
    sections: [{ id: 'b2s1', title: 'Academic English', island: 'Conversation City' }],
    units: [
      unit('b2_u1', 'Advanced Linking Words', 'Therefore, despite, furthermore', 'b2', 'linking_words', [
        lesson('b2_u1_l1', 'Academic connectors', 'reading', 'linking_words'),
      ], 'vestibular'),
      unit('b2_u2', 'Modals of obligation', 'Must, should, might', 'b2', 'verb_tenses_modals', [
        lesson('b2_u2_l1', 'Rules and advice', 'grammar', 'verb_tenses_modals'),
      ], 'vestibular'),
      unit('b2_u3', 'Exam strategies', 'ENEM / FATEC / FUVEST patterns', 'b2', 'skimming_scanning', [
        lesson('b2_u3_l1', 'Question patterns', 'reading', 'skimming_scanning'),
      ], 'vestibular', true),
    ],
  },
  {
    id: 'c1',
    title: 'C1 Advanced',
    island: 'Professional District',
    sections: [{ id: 'c1s1', title: 'Complex Texts', island: 'Professional District' }],
    units: [
      unit('c1_u1', 'Dense argumentation', 'Opinion and scientific tone', 'c1', 'skimming_scanning', [
        lesson('c1_u1_l1', 'Author intent', 'reading', 'skimming_scanning'),
      ], 'vestibular'),
    ],
  },
];

const QUESTION_BANK = buildCoreEnglishQuestions();

export function getAllUnits(): EnglishUnitDefinition[] {
  return ENGLISH_COURSE.flatMap((level) => level.units);
}

export function getUnitById(unitId: string): EnglishUnitDefinition | undefined {
  return getAllUnits().find((unitItem) => unitItem.id === unitId);
}

export function getLessonById(lessonId: string): { unit: EnglishUnitDefinition; lesson: EnglishLessonDefinition } | undefined {
  for (const unitItem of getAllUnits()) {
    const found = unitItem.lessons.find((item) => item.id === lessonId);
    if (found) return { unit: unitItem, lesson: found };
  }
  return undefined;
}

export function getLessonQuestions(lessonId: string): EducationalQuestion[] {
  const found = getLessonById(lessonId);
  if (!found) return [];
  const pool = QUESTION_BANK[found.lesson.topicId] || QUESTION_BANK[found.unit.topicId] || [];
  const skillFiltered = pool.filter((question) => !question.englishSkill || question.englishSkill === found.lesson.skill);
  const chosen = (skillFiltered.length >= 3 ? skillFiltered : pool).slice(0, 8);
  return chosen.map((question, index) => ({ ...question, id: `${lessonId}_${question.id}_${index}` }));
}

export function getQuestionsByTopic(topicId: string, count = 10): EducationalQuestion[] {
  const pool = QUESTION_BANK[topicId] || [];
  return pool.slice(0, count);
}

export function listTopicIds(): string[] {
  return Object.keys(QUESTION_BANK);
}

export function unitStatus(
  unitItem: EnglishUnitDefinition,
  completedLessons: Set<string>,
  previousMastered: boolean
): EnglishUnitStatus {
  const done = unitItem.lessons.every((lessonItem) => completedLessons.has(lessonItem.id));
  if (done) return unitItem.isBoss ? 'boss' : 'completed';
  if (!previousMastered && unitItem.cefr !== 'a0' && unitItem.id !== 'a0_u1' && unitItem.id !== 'a1_u1') {
    const firstOfLevel = ENGLISH_COURSE.find((level) => level.id === unitItem.cefr)?.units[0]?.id;
    if (firstOfLevel !== unitItem.id && completedLessons.size === 0) return 'locked';
  }
  const current = unitItem.lessons.some((lessonItem) => !completedLessons.has(lessonItem.id));
  return current ? 'available' : 'locked';
}
