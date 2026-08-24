import { ExamProfile, SubjectId } from '../types';

export const EXAM_PROFILES: Record<string, ExamProfile> = {
  FATEC: {
    id: 'FATEC',
    name: 'Vestibular FATEC (São Paulo)',
    shortName: 'FATEC',
    description: 'Prova com foco multidisciplinar, ciências exatas, raciocínio lógico, tecnologia, interpretação e atualidades.',
    totalQuestions: 20, // Prova adaptada para simulado dinâmico
    durationMinutes: 45,
    badgeColor: 'border-red-500/40 text-red-400 bg-red-500/10',
    accentGradient: 'from-red-600/30 via-orange-600/20 to-transparent',
    subjects: [
      { subjectId: 'matematica', questionCount: 4, weight: 5 },
      { subjectId: 'portugues', questionCount: 3, weight: 5 },
      { subjectId: 'fisica', questionCount: 2, weight: 4 },
      { subjectId: 'quimica', questionCount: 2, weight: 4 },
      { subjectId: 'biologia', questionCount: 2, weight: 4 },
      { subjectId: 'historia', questionCount: 2, weight: 3 },
      { subjectId: 'geografia', questionCount: 2, weight: 3 },
      { subjectId: 'ingles', questionCount: 1, weight: 3 },
      { subjectId: 'raciocinio_logico', questionCount: 2, weight: 5 },
    ],
  },
  ENEM: {
    id: 'ENEM',
    name: 'Exame Nacional do Ensino Médio (ENEM)',
    shortName: 'ENEM',
    description: 'Matrizes de referência do MEC: Ciências da Natureza, Humanas, Linguagens e Matemática.',
    totalQuestions: 25,
    durationMinutes: 60,
    badgeColor: 'border-blue-500/40 text-blue-400 bg-blue-500/10',
    accentGradient: 'from-blue-600/30 via-cyan-600/20 to-transparent',
    subjects: [
      { subjectId: 'matematica', questionCount: 6, weight: 5 },
      { subjectId: 'interpretacao', questionCount: 4, weight: 5 },
      { subjectId: 'biologia', questionCount: 3, weight: 4 },
      { subjectId: 'fisica', questionCount: 3, weight: 4 },
      { subjectId: 'quimica', questionCount: 3, weight: 4 },
      { subjectId: 'historia', questionCount: 2, weight: 3 },
      { subjectId: 'geografia', questionCount: 2, weight: 3 },
      { subjectId: 'filosofia', questionCount: 1, weight: 3 },
      { subjectId: 'sociologia', questionCount: 1, weight: 3 },
    ],
  },
  FUVEST: {
    id: 'FUVEST',
    name: 'Vestibular USP (FUVEST - 1ª Fase)',
    shortName: 'FUVEST',
    description: 'Alto rigor conceitual em todas as disciplinas do Ensino Médio e obras de literatura obrigatórias.',
    totalQuestions: 24,
    durationMinutes: 60,
    badgeColor: 'border-amber-500/40 text-amber-400 bg-amber-500/10',
    accentGradient: 'from-amber-600/30 via-yellow-600/20 to-transparent',
    subjects: [
      { subjectId: 'matematica', questionCount: 4, weight: 5 },
      { subjectId: 'literatura', questionCount: 3, weight: 5 },
      { subjectId: 'portugues', questionCount: 3, weight: 4 },
      { subjectId: 'fisica', questionCount: 3, weight: 5 },
      { subjectId: 'quimica', questionCount: 3, weight: 5 },
      { subjectId: 'biologia', questionCount: 3, weight: 5 },
      { subjectId: 'historia', questionCount: 2, weight: 4 },
      { subjectId: 'geografia', questionCount: 2, weight: 4 },
      { subjectId: 'ingles', questionCount: 1, weight: 3 },
    ],
  },
  UNICAMP: {
    id: 'UNICAMP',
    name: 'Vestibular UNICAMP (1ª Fase)',
    shortName: 'UNICAMP',
    description: 'Forte ênfase em interdisciplinaridade, leitura crítica, contextualização histórica e raciocínio científico.',
    totalQuestions: 20,
    durationMinutes: 50,
    badgeColor: 'border-purple-500/40 text-purple-400 bg-purple-500/10',
    accentGradient: 'from-purple-600/30 via-fuchsia-600/20 to-transparent',
    subjects: [
      { subjectId: 'portugues', questionCount: 4, weight: 5 },
      { subjectId: 'matematica', questionCount: 4, weight: 5 },
      { subjectId: 'biologia', questionCount: 3, weight: 4 },
      { subjectId: 'quimica', questionCount: 2, weight: 4 },
      { subjectId: 'fisica', questionCount: 2, weight: 4 },
      { subjectId: 'historia', questionCount: 2, weight: 4 },
      { subjectId: 'geografia', questionCount: 2, weight: 4 },
      { subjectId: 'filosofia', questionCount: 1, weight: 3 },
    ],
  },
};

export function getExamProfile(id: string): ExamProfile {
  return EXAM_PROFILES[id] || EXAM_PROFILES.FATEC;
}

export function getAllExamProfilesList(): ExamProfile[] {
  return Object.values(EXAM_PROFILES);
}
