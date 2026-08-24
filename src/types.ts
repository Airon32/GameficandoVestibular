export type OperationType = 'addition' | 'subtraction' | 'multiplication' | 'division';

export type GameMode =
  | 'mixed'
  | 'addition'
  | 'subtraction'
  | 'multiplication'
  | 'division'
  | 'time_attack'
  | 'survival'
  | 'calculo_rapido'
  | 'quiz_rapido'
  | 'verdadeiro_falso'
  | 'complete_frase'
  | 'associacao'
  | 'ordenacao'
  | 'flashcards'
  | 'treino_misto'
  | 'vestibular_rush'
  | 'maratona'
  | 'sem_erros'
  | 'recuperacao'
  | 'boss_challenge'
  | 'simulado';

export type SubjectCategory = 'all' | 'exatas' | 'humanas' | 'biologicas' | 'linguagens';

export type SubjectId =
  | 'matematica'
  | 'portugues'
  | 'literatura'
  | 'historia'
  | 'geografia'
  | 'biologia'
  | 'quimica'
  | 'fisica'
  | 'ingles'
  | 'filosofia'
  | 'sociologia'
  | 'interpretacao'
  | 'redacao'
  | 'atualidades'
  | 'raciocinio_logico';

// Discriminated Union for Question Types
export type EducationalQuestionType =
  | 'numeric_input'
  | 'multiple_choice'
  | 'true_false'
  | 'fill_blank'
  | 'matching'
  | 'ordering'
  | 'flashcard'
  | 'essay_structure';

export interface MatchingPair {
  id: string;
  left: string;
  right: string;
}

export interface OrderingItem {
  id: string;
  text: string;
  correctOrder: number; // 0, 1, 2, ...
}

export interface MultipleChoiceOption {
  id: string; // "A", "B", "C", "D", "E"
  text: string;
  latex?: string;
  isCorrect?: boolean;
}

export interface BaseEducationalQuestion {
  id: string;
  subjectId: SubjectId;
  topicId: string;
  subtopicId?: string;
  difficulty: number; // 1 to 100
  calibratedDifficulty?: number;
  questionType: EducationalQuestionType;
  prompt: string;
  latexPrompt?: string;
  explanation: string;
  keyConcept?: string;
  source?: string; // e.g. "FATEC 2024", "ENEM 2023", "Template Knowledge Base", "Autoral"
  tags?: string[];
  imageUrl?: string;
  imageAlt?: string;
  examProfiles?: string[]; // e.g. ['FATEC', 'ENEM', 'FUVEST']
  generationSource?: 'curated' | 'template' | 'algorithmic' | 'generative_validated';
  qualityScore?: number; // 0 to 100
  validationStatus?: 'validated' | 'provisional' | 'flagged' | 'rejected';
  timesAnswered?: number;
  accuracyRate?: number;
  reportCount?: number;
  createdAt?: number;
  updatedAt?: number;
}

export interface NumericQuestion extends BaseEducationalQuestion {
  questionType: 'numeric_input';
  correctAnswer: number;
  tolerance?: number;
  unit?: string;
}

export interface MultipleChoiceQuestion extends BaseEducationalQuestion {
  questionType: 'multiple_choice';
  options: MultipleChoiceOption[];
  correctOptionId: string; // e.g. "B"
}

export interface TrueFalseQuestion extends BaseEducationalQuestion {
  questionType: 'true_false';
  statement: string;
  isTrue: boolean;
}

export interface FillBlankQuestion extends BaseEducationalQuestion {
  questionType: 'fill_blank';
  template: string; // e.g. "A mitocôndria é responsável pela produção de {blank}."
  correctAnswers: string[]; // lowercase accepted answers
  options?: string[]; // If choice-assisted
}

export interface MatchingQuestion extends BaseEducationalQuestion {
  questionType: 'matching';
  pairs: MatchingPair[];
}

export interface OrderingQuestion extends BaseEducationalQuestion {
  questionType: 'ordering';
  items: OrderingItem[];
}

export interface FlashcardQuestion extends BaseEducationalQuestion {
  questionType: 'flashcard';
  frontPrompt: string;
  backResponse: string;
  additionalNotes?: string;
}

export type EducationalQuestion =
  | NumericQuestion
  | MultipleChoiceQuestion
  | TrueFalseQuestion
  | FillBlankQuestion
  | MatchingQuestion
  | OrderingQuestion
  | FlashcardQuestion;

// ==========================================
// KNOWLEDGE BASE & TEMPLATE GENERATION
// ==========================================

export interface ConceptQuestionTemplate {
  id: string;
  templateType: 'multiple_choice' | 'true_false' | 'fill_blank';
  promptTemplate: string; // e.g. "Em uma célula com alta demanda energética, qual organela..."
  correctTemplate: string;
  distractorTemplates: string[];
  explanationTemplate: string;
  baseDifficulty: number; // 1 to 100
  tags: string[];
}

export interface KnowledgeConcept {
  id: string;
  subjectId: SubjectId;
  topicId: string;
  name: string;
  fact: string;
  definition: string;
  relationships: string[]; // e.g. ["ATP", "Respiração Celular", "Cristas Mitocondriais"]
  examples: string[];
  counterExamples: string[];
  commonMistakes: string[];
  difficultyVariants: {
    easy: { promptAngle: string; difficulty: number };
    medium: { promptAngle: string; difficulty: number };
    hard: { promptAngle: string; difficulty: number };
    extreme?: { promptAngle: string; difficulty: number };
  };
  questionTemplates: ConceptQuestionTemplate[];
}

// ==========================================
// QUESTION QUALITY & REPORTING
// ==========================================

export type QuestionReportReason =
  | 'wrong_answer'
  | 'ambiguous'
  | 'prompt_error'
  | 'image_error'
  | 'explanation_error'
  | 'other';

export interface QuestionReport {
  id: string;
  questionId: string;
  subjectId: SubjectId;
  topicId: string;
  reason: QuestionReportReason;
  userComment?: string;
  reportedByUserId: string;
  reportedAt: number;
  questionPrompt?: string;
}

// ==========================================
// MINI APOSTILAS / GUIAS RÁPIDOS (STUDY GUIDES)
// ==========================================

export interface StudyGuideSection {
  title: string;
  type: 'concept' | 'formulas' | 'step_by_step' | 'example' | 'common_mistakes' | 'summary' | 'table';
  content: string;
  latex?: string;
  items?: string[];
  tableData?: { headers: string[]; rows: string[][] };
}

export interface StudyGuide {
  id: string; // e.g. "bio_mitocondria" or "mat_porcentagem"
  subjectId: SubjectId;
  topicId: string;
  title: string;
  subtitle: string;
  estimatedReadMinutes: number; // 2 to 8 mins
  sections: StudyGuideSection[];
  quickSummary: string[]; // 3 to 5 key points
  commonMistakes: Array<{ title: string; mistake: string; correction: string }>;
  sampleQuestion?: {
    prompt: string;
    latexPrompt?: string;
    solutionSteps: string[];
    answer: string;
  };
  quizQuestionIds?: string[]; // IDs for quick mini-quiz (5 questions)
  tags: string[];
}

export interface UserStudyGuideProgress {
  guideId: string;
  subjectId: SubjectId;
  topicId: string;
  lastReviewedAt: number;
  reviewCount: number;
  isFavorite: boolean;
  masteryBeforeReview?: number;
  masteryAfterReview?: number;
  quizScore?: { correct: number; total: number; timestamp: number };
}

// ==========================================
// INFINITE TRAINING SESSION
// ==========================================

export interface InfiniteSessionConfig {
  subjectId?: SubjectId | 'mixed';
  topicId?: string;
  sessionType: 'infinite' | 'fixed_count' | 'timed';
  targetCount?: number; // 5, 10, 25
  timeLimitSeconds?: number; // 300 (5m), 600 (10m), 1200 (20m)
  difficultyMode?: 'adaptive' | 'easy' | 'medium' | 'hard' | 'extreme';
  isCompetitive?: boolean;
  allowTimerPerQuestion?: boolean;
}

export interface InfiniteSessionAnswerRecord {
  questionId: string;
  subjectId: SubjectId;
  topicId: string;
  prompt: string;
  userAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  timeTakenMs: number;
  xpEarned: number;
  baseXP: number;
  difficulty: number;
  speedModifier?: number;
  streakMultiplier?: number;
}

export interface InfiniteSessionState {
  sessionId: string;
  sessionType: 'infinite' | 'fixed_count' | 'timed';
  subjectId: SubjectId | 'mixed';
  topicId?: string;
  questionsAnswered: number;
  correctAnswers: number;
  wrongAnswers: number;
  currentStreak: number;
  maxStreak: number;
  sessionXP: number;
  averageDifficulty: number;
  averageResponseTimeMs: number;
  startedAt: number;
  pausedAt?: number | null;
  isPaused: boolean;
  endedAt?: number | null;
  answers: InfiniteSessionAnswerRecord[];
}

// ==========================================
// CENTRALIZED QUESTION XP TYPES
// ==========================================

export interface QuestionXPParams {
  difficulty: number; // 1 to 100+
  timeTakenMs: number;
  currentStreak: number;
  isCorrect: boolean;
  gameMode?: GameMode | string;
  userMastery?: number; // 0 to 100 (for anti-farming guard)
  isManuallySelectedLowDifficulty?: boolean;
  eventMultiplier?: number;
}

export interface QuestionXPCalculationResult {
  finalXP: number;
  baseXP: number; // 10 to 50
  speedModifier: number; // e.g. 1.20, 1.10, 1.00
  speedBonusXP: number;
  streakMultiplier: number; // e.g. 1.00 to 2.00+
  streakBonusXP: number;
  modeModifier: number;
  eventMultiplier: number;
  isAntiFarmed: boolean;
  antiFarmEfficiency?: number;
  timeTakenSeconds: number;
  difficultyTier: 'very_easy' | 'easy' | 'medium' | 'medium_hard' | 'hard' | 'very_hard' | 'extreme';
  breakdown: {
    baseXP: number;
    speedBonusXP: number;
    streakBonusXP: number;
    finalXP: number;
    explanation: string;
  };
}

// Mastery & Skill Types
export type MasteryTier = 'not_started' | 'basic' | 'developing' | 'good' | 'advanced' | 'mastered';

export interface TopicMastery {
  topicId: string;
  name: string;
  subjectId: SubjectId;
  masteryPercent: number; // 0 to 100
  questionsSolved: number;
  questionsCorrect: number;
  accuracy: number;
  difficultyScore: number; // 1 to 100
  tier: MasteryTier;
  lastTrainedAt: number;
}

export interface SubjectMastery {
  subjectId: SubjectId;
  name: string;
  masteryPercent: number; // 0 to 100
  skillLevel: number; // 1 to 100
  questionsSolved: number;
  questionsCorrect: number;
  accuracy: number;
  avgTimeMs: number;
  lastTrainedAt: number;
  topicMastery: Record<string, TopicMastery>;
}

// Error Notebook & Spaced Repetition
export interface ErrorNotebookEntry {
  questionId: string;
  subjectId: SubjectId;
  topicId: string;
  questionPrompt: string;
  questionType: EducationalQuestionType;
  userLastWrongAnswer: string | number;
  correctAnswer: string | number;
  explanation: string;
  timesWrong: number;
  timesReviewed: number;
  status: 'pending' | 'in_review' | 'recovered';
  firstFailedAt: number;
  lastReviewedAt: number;
  recoveredAt?: number;
}

export interface SpacedRepetitionCard {
  id: string; // questionId
  subjectId: SubjectId;
  topicId: string;
  question: EducationalQuestion;
  box: number; // 1 to 5 (Leitner system)
  easeFactor: number; // default 2.5
  intervalDays: number;
  consecutiveSuccesses: number;
  nextReviewDate: number; // timestamp
  lastReviewedAt: number;
}

// Simulados & Exam Profiles
export interface ExamSubjectWeight {
  subjectId: SubjectId;
  questionCount: number;
  weight: number;
}

export interface ExamProfile {
  id: string; // 'FATEC' | 'ENEM' | 'FUVEST' | 'UNICAMP' | 'UNESP' | 'CUSTOM'
  name: string;
  shortName: string;
  description: string;
  totalQuestions: number;
  durationMinutes: number;
  subjects: ExamSubjectWeight[];
  badgeColor: string;
  accentGradient: string;
}

export interface SimuladoAnswer {
  questionId: string;
  subjectId: SubjectId;
  topicId: string;
  userAnswer: any;
  correctAnswer: any;
  isCorrect: boolean;
  timeTakenMs: number;
  markedForReview?: boolean;
}

export interface SimuladoSubjectResult {
  subjectId: SubjectId;
  name: string;
  totalQuestions: number;
  correctCount: number;
  accuracy: number;
  avgTimeMs: number;
}

export interface SimuladoSession {
  id: string;
  examProfileId: string;
  examName: string;
  startedAt: number;
  completedAt: number;
  totalTimeMs: number;
  totalQuestions: number;
  correctCount: number;
  scorePercent: number;
  subjectResults: Record<SubjectId, SimuladoSubjectResult>;
  strongestSubjects: string[];
  weakestSubjects: string[];
  recommendations: string[];
  answers: SimuladoAnswer[];
}

export interface TargetExamGoal {
  targetExam: string; // e.g. "FATEC", "ENEM"
  examDate?: string; // YYYY-MM-DD
  targetScorePercent?: number; // e.g. 85
  estimatedReadinessPercent: number; // calculated 0 to 100
}

export interface DailyGoalConfig {
  type: 'xp' | 'questions' | 'time';
  target: number; // e.g. 1000 for normal XP goal
  tier: 'light' | 'normal' | 'intense';
}

export interface DailyMission {
  id: string;
  title: string;
  description: string;
  category: 'xp' | 'subject' | 'accuracy' | 'streak' | 'simulado' | 'review';
  targetSubject?: SubjectId;
  currentProgress: number;
  targetValue: number;
  rewardXP: number;
  isCompleted: boolean;
  isClaimed: boolean;
}

export type ASTNodeType = 'number' | 'binary_op' | 'parentheses';

export interface ASTNode {
  type: ASTNodeType;
  value?: number;
  op?: '+' | '-' | '×' | '÷';
  left?: ASTNode;
  right?: ASTNode;
  inner?: ASTNode;
}

export interface Question {
  id: string;
  // Legacy 2-operand fields for backward compatibility
  num1?: number;
  num2?: number;
  symbol?: string;
  // Advanced Mathematical Expression representation
  expressionString: string; // e.g. "34 + 617 - 200 × 5 ÷ 100" or "345 + 413 × 10" or "7 + 4"
  operation: OperationType | 'mixed_expression';
  correctAnswer: number;
  difficultyScore: number;
  expressionComplexityScore: number;
  structuralDifficulty: number; // 1 to 4 (number of operators)
  operatorCount: number; // Strictly <= 4 (MAX_OPERATORS_PER_EXPRESSION = 4)
  operandCount: number; // Strictly <= 5 (MAX_OPERANDS_PER_EXPRESSION = 5)
  hasParentheses?: boolean;
  startedAt: number; // timestamp in ms
}

export interface AnswerSubmission {
  questionId: string;
  userAnswer: number;
  startedAt: number;
  answeredAt: number;
  timeTakenMs: number;
  gameMode: GameMode;
}

export interface OperationStat {
  totalQuestions: number;
  correct: number;
  wrong: number;
  accuracy: number;
  avgTimeMs: number;
  difficultyScore: number; // Adaptive difficulty tracking per operation
}

export interface DailyActivityRecord {
  date: string; // YYYY-MM-DD
  questionsCount: number;
  correctCount: number;
  xpGained: number;
  goalReached: boolean;
  timeSpentMs: number;
}

export interface StreakData {
  currentStreak: number;
  maxStreak: number;
  lastActiveDate: string | null; // YYYY-MM-DD
  streakFreezes: number;
}

export interface RankColorTokens {
  primary: string; // e.g. hex #D97706 or rgb
  secondary: string;
  accent: string;
  glow: string;
  border: string;
  frameBorder: string;
  backgroundGradient: string;
  cardGlow: string;
  textLight: string;
  textDark: string;
}

export interface RankDivisionVariant {
  division: number; // 1 to 5
  roman: string; // I, II, III, IV, V
  titleModifier?: string;
  addedDetailsDescription: string;
  xpThresholdPercent: number; // 15%, 17%, 19%, 22%, 27%
}

export type RankVisualTier =
  | 'rustic'
  | 'metallic'
  | 'noble'
  | 'gemstone'
  | 'mastery'
  | 'mythical'
  | 'cosmic'
  | 'transcendent'
  | 'infinite';

export interface RankVisualConfig {
  rankId: string; // e.g. "ouro", "diamante", "infinito"
  tierIndex: number; // 0 to 29 (30 ranks)
  rankName: string; // "Ouro", "Diamante", etc.
  rankSymbol: string; // "Estrela Coroada com Asas"
  rankBadge: string; // Key / SVG structure
  rankBadgeSmall: string;
  rankBadgeLarge: string;
  rankProfileFrame: string; // Frame key
  rankProfileBackground: string; // Background style
  rankTexture: string; // Texture pattern
  rankParticleEffect: 'none' | 'subtle_sparks' | 'golden_shimmer' | 'crystal_float' | 'arcane_orbits' | 'cosmic_nebula' | 'infinite_energy';
  rankGlowEffect: 'none' | 'low' | 'medium' | 'high' | 'ultra' | 'cosmic_pulsar';
  rankAnimation: 'none' | 'pulse_subtle' | 'orbit_spin' | 'nebula_flow' | 'infinite_flux';
  rankLevelUpAnimation: 'material' | 'gem' | 'master' | 'mythic' | 'cosmic' | 'infinite';
  rankSoundId?: string;
  rankVisualTier: RankVisualTier;
  rankRarity: 'Comum' | 'Incomum' | 'Raro' | 'Épico' | 'Místico' | 'Lendário' | 'Ancestral' | 'Celestial' | 'Transcendente' | 'Infinito';
  rankDescription: string;
  rankColorTokens: RankColorTokens;
  rankIconography: string; // SVG path descriptor
  rankDivisionVariants: RankDivisionVariant[];
  rankLockedPreview: {
    silhouetteColor: string;
    teaserText: string;
  };
  rankUnlockedPreview: {
    unlockedBadgeTitle: string;
    unlockedFrameTitle: string;
    unlockedThemeTitle: string;
  };
  minTotalXP: number; // Rebalanced total XP required to enter this rank
  maxTotalXP: number;
}

export interface RankInfo {
  tierName: string;
  tierIndex: number;
  division: number; // 1 to 5
  fullName: string; // e.g. "Ferro III"
  minXP: number;
  badgeColor: string;
  badgeBorder: string;
  iconName: string;
  rankId?: string;
  visualConfig?: RankVisualConfig;
  ascensionLevel?: number;
}

export interface Achievement {
  id: string;
  title: string;
  description: string;
  category: 'progression' | 'speed' | 'accuracy' | 'streak' | 'volume' | 'operations' | 'special';
  icon: string;
  rewardTitle?: string;
  rewardXP?: number;
  targetMetric: string;
  targetValue: number;
  unlockedAt?: number | null;
}

export interface UserSettings {
  soundEnabled: boolean;
  soundVolume: number; // 0 to 1
  vibrationEnabled: boolean;
  theme: 'dark' | 'light';
  reduceMotion: boolean;
  dailyGoal: number; // e.g. 10 questions
  timerDurationSeconds: number; // 30 seconds default
  enabledOperations: OperationType[];
}

export interface RecentAnswerRecord {
  isCorrect: boolean;
  timeTakenMs: number;
  difficultyScore: number;
  operatorCount: number;
  timestamp: number;
}

export interface StreakStats {
  xpFromStreaksTotal: number;
  highestMultiplierReached: number;
  milestoneHits: Record<number, number>; // Milestone count e.g. { 10: 5, 20: 3, 40: 1, 80: 0 }
}

export interface InfiniteStats {
  accountCreatedAt: number;
  firstPlayedAt: number;
  reachedInfiniteAt: number;
  daysFromFirstPlay: number;
  activeDaysCount: number;
  totalHoursTrained: number;
  totalQuestionsSolved: number;
  averageAccuracy: number;
  maxStreak: number;
  totalXPEarned: number;
}

export interface ChallengeStats {
  totalWins: number;
  totalLosses: number;
  totalDraws: number;
  matchesPlayed: number;
}

export type ProfilePrivacy = 'public' | 'friends_only' | 'private';

export interface UserState {
  id: string; // Firebase Auth UID
  username?: string; // e.g. "@aironcavalcante"
  displayName?: string; // e.g. "Airon"
  name: string; // fallback
  email?: string;
  avatar: string;
  bio?: string;
  selectedTitle: string;
  privacy?: ProfilePrivacy;
  level: number;
  totalXP: number;
  weeklyXP?: number; // Weekly league points
  currentWeekId?: string; // e.g. "2026-W34"
  leagueTier?: string; // e.g. "Elite"
  currentLevelXP: number;
  xpForNextLevel: number;
  levelProgressPercent: number;
  rank: RankInfo;
  streak: StreakData;
  combo: number;
  maxCombo: number;
  challengeStats?: ChallengeStats;
  streakStats?: StreakStats;
  infiniteStats?: InfiniteStats;
  stats: {
    totalQuestions: number;
    totalCorrect: number;
    totalWrong: number;
    accuracy: number;
    avgTimeMs: number;
    totalTrainingTimeMs: number;
    lifetimeQuestionsCount?: number;
    questionsToday?: number;
    questionsThisWeek?: number;
    bySubjectStats?: Record<string, { solved: number; correct: number; totalXP: number; maxStreak: number }>;
    byOperation: Record<OperationType, OperationStat>;
    dailyActivity: Record<string, DailyActivityRecord>;
  };
  // Mini Apostilas / Study Guides Progress
  studyGuidesProgress?: Record<string, UserStudyGuideProgress>;
  // Question Quality Reports submitted
  questionReports?: QuestionReport[];
  // Subject & Topic Mastery Matrix
  subjectsMastery?: Record<SubjectId, SubjectMastery>;
  // Error Notebook (Caderno de Erros)
  errorNotebook?: Record<string, ErrorNotebookEntry>;
  // Spaced Repetition Flashcard/Deck System
  spacedRepetitionCards?: Record<string, SpacedRepetitionCard>;
  // Saved questions (Favoritos)
  savedQuestions?: string[];
  // Simulados History
  simuladosHistory?: SimuladoSession[];
  // Target Exam Goal (e.g. FATEC / ENEM / FUVEST)
  targetExamGoal?: TargetExamGoal;
  // Daily Goal Configuration (XP, questions, time)
  dailyGoalConfig?: DailyGoalConfig;
  // Missions
  dailyMissions?: DailyMission[];
  achievements: Record<string, number>; // id -> unlocked timestamp
  unlockedTitles: string[];
  unlockedRankFrames?: string[]; // e.g. ["madeira", "pedregulho", "pedra", "ouro", "diamante"]
  equippedProfileFrame?: string; // e.g. "ouro" or "diamante"
  equippedProfileBackground?: string; // e.g. "ouro" or "cosmico"
  highestUnlockedRank?: number; // 0 to 29 (30 ranks, permanent safeguard)
  progressionVersion?: number; // e.g. 2
  ascensionLevel?: number; // 0 if not reached Lv 150, 1, 2, 3...
  settings: UserSettings;
  // Recent performance window for adaptive difficulty
  recentHistory?: RecentAnswerRecord[];
  createdAt: number;
  updatedAt: number;
}

export interface FriendRequest {
  id: string;
  fromUserId: string;
  fromUsername: string;
  fromDisplayName: string;
  fromAvatar: string;
  toUserId: string;
  toUsername: string;
  status: 'pending' | 'accepted' | 'declined';
  createdAt: number;
  updatedAt?: number;
}

export interface Friendship {
  id: string;
  userAId: string;
  userBId: string;
  requestId?: string;
  acceptedBy?: string;
  createdAt: number;
}

export interface BlockedUser {
  id: string;
  blockerId: string;
  blockedId: string;
  createdAt: number;
}

export interface FriendProfileSummary {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  bio?: string;
  selectedTitle: string;
  level: number;
  totalXP: number;
  weeklyXP: number;
  rankFullName: string;
  currentStreak: number;
  maxStreak: number;
  maxCombo: number;
  accuracy: number;
  totalQuestions: number;
  avgTimeMs: number;
  achievementsCount: number;
  privacy: ProfilePrivacy;
  bestOperation?: OperationType;
  worstOperation?: OperationType;
  bestSubject?: SubjectId;
  subjectMasterySummary?: Record<string, number>; // subjectId -> masteryPercent
  headToHead?: {
    wins: number;
    losses: number;
    draws: number;
    totalMatches: number;
    lastMatchResult?: 'win' | 'loss' | 'draw';
  };
}

export interface LeagueMember {
  userId: string;
  username: string;
  displayName: string;
  avatar: string;
  weeklyXP: number;
  tierName: string;
  isCurrentUser?: boolean;
}

export interface WeeklyLeagueInfo {
  weekId: string;
  tierName: string; // Iniciante, Competidor, Elite, Campeão, Mestre, Lenda, Suprema
  tierLevel: number; // 1 to 7
  userRankInCohort: number;
  totalMembers: number;
  promotionThreshold: number; // Top 5
  relegationThreshold: number; // Bottom 5
  members: LeagueMember[];
  timeRemainingStr: string;
}

export interface ChallengePlayerResult {
  userId: string;
  username: string;
  displayName: string;
  correctCount: number;
  totalQuestions: number;
  totalTimeMs: number;
  avgTimeMs: number;
  accuracy: number;
  answers: Array<{
    questionId: string;
    expressionString: string;
    userAnswer: number;
    correctAnswer?: number;
    isCorrect?: boolean;
    timeTakenMs: number;
  }>;
  completedAt: number;
}

export interface Challenge {
  id: string;
  challengerId: string;
  challengerUsername: string;
  challengerDisplayName: string;
  challengerAvatar: string;
  opponentId: string;
  opponentUsername: string;
  opponentDisplayName: string;
  opponentAvatar: string;
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'declined' | 'expired';
  subjectId?: SubjectId;
  gameMode?: GameMode;
  questionCount: number;
  questions: Array<Omit<Question, 'correctAnswer'> & { correctAnswer?: never }>; // Identical, without exposing the answer key
  educationalQuestions?: EducationalQuestion[];
  challengerResult?: ChallengePlayerResult;
  opponentResult?: ChallengePlayerResult;
  winnerId?: string | 'draw';
  createdAt: number;
  expiresAt: number;
}

export interface AppNotification {
  id: string;
  userId: string;
  type: 'friend_request' | 'friend_accepted' | 'challenge_received' | 'challenge_completed' | 'league_promotion' | 'streak_milestone';
  title: string;
  message: string;
  data?: any;
  isRead: boolean;
  createdAt: number;
}

export interface XPAuditEvent {
  questionId: string;
  sessionId?: string;
  userId: string;
  isCorrect: boolean;
  timeTakenMs: number;
  baseXP: number;
  previousStreak: number;
  nextStreak: number;
  streakMultiplier: number;
  streakBonusXP: number;
  difficultyModifier?: number;
  eventModifier?: number;
  finalXP: number;
  difficultyScore: number;
  timestamp: number;
}

export interface XPCalculationBreakdown {
  baseXP: number;
  speedTier: 'gold' | 'silver' | 'bronze' | 'none';
  timeTakenSeconds: number;
  streak: number;
  streakMultiplier: number;
  streakBonusXP: number;
  difficultyModifier: number;
  eventModifier: number;
  finalXP: number;
  isEligible: boolean;
}

export interface AnswerEvaluationResult {
  isCorrect: boolean;
  userAnswer: number;
  correctAnswer: number;
  timeTakenMs: number;
  xpEarned: number;
  speedTier: 'gold' | 'silver' | 'bronze' | 'none'; // <=10s, <=20s, <=30s, >30s/wrong
  newCombo: number;
  isMaxCombo: boolean;
  levelUp: {
    occurred: boolean;
    previousLevel: number;
    newLevel: number;
  };
  rankUp: {
    occurred: boolean;
    previousRank: string;
    newRank: string;
  };
  dailyGoalReachedNow: boolean;
  streakIncremented: boolean;
  unlockedAchievements: Achievement[];
  question: Question;
}

export interface SyncEvent {
  eventId: string;
  userId: string;
  type: 'ANSWER_SUBMISSION' | 'STREAK_UPDATE' | 'LEVEL_UP' | 'SETTINGS_UPDATE';
  timestamp: number;
  payload: any;
}
