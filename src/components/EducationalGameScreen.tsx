import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  EducationalQuestion,
  MultipleChoiceQuestion,
  TrueFalseQuestion,
  MatchingQuestion,
  OrderingQuestion,
  FlashcardQuestion,
  SubjectId,
  GameMode,
} from '../types';
import { ScientificRenderer } from './ScientificRenderer';
import { SUBJECTS_CONFIG } from '../config/subjectsConfig';
import { soundService } from '../services/soundService';
import { XPManager } from '../engines/XPManager';
import { EnglishLearningEngine } from '../engines/EnglishLearningEngine';
import { EnglishExerciseRenderer } from './english/EnglishExerciseRenderer';
import {
  Sparkles,
  Flame,
  Clock,
  ArrowRight,
  RotateCcw,
  CheckCircle2,
  XCircle,
  HelpCircle,
  Award,
  ChevronDown,
  ChevronUp,
  BrainCircuit,
  Eye,
  Check,
  X,
  Zap,
} from 'lucide-react';

interface EducationalGameScreenProps {
  questions: EducationalQuestion[];
  gameMode: GameMode;
  subjectId?: SubjectId;
  onCompleteSession: (results: {
    totalQuestions: number;
    correctCount: number;
    wrongCount?: number;
    totalTimeMs: number;
    xpEarned: number;
    totalXP?: number;
    answers: Array<{
      question: EducationalQuestion;
      userAnswer: any;
      isCorrect: boolean;
      timeTakenMs: number;
    }>;
    questionsAnswered?: Array<{
      question: EducationalQuestion;
      userAnswer: any;
      isCorrect: boolean;
      timeTakenMs: number;
    }>;
  }) => void;
  onExit: () => void;
  currentStreak?: number;
  combo?: number;
  userState?: any;
}

export const EducationalGameScreen: React.FC<EducationalGameScreenProps> = ({
  questions = [],
  gameMode,
  subjectId,
  onCompleteSession,
  onExit,
  currentStreak = 0,
  combo = 0,
  userState,
}) => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedOption, setSelectedOption] = useState<string | null>(null);
  const [isAnswerSubmitted, setIsAnswerSubmitted] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [showFullExplanation, setShowFullExplanation] = useState(false);

  // For Matching game
  const [selectedLeftPair, setSelectedLeftPair] = useState<string | null>(null);
  const [matchedPairs, setMatchedPairs] = useState<Record<string, string>>({}); // leftId -> rightText

  // For Ordering game
  const [orderedItems, setOrderedItems] = useState<Array<{ id: string; text: string; correctOrder: number }>>([]);

  // For Flashcard game
  const [isFlipped, setIsFlipped] = useState(false);

  // Session stats tracking
  const [answersHistory, setAnswersHistory] = useState<
    Array<{
      question: EducationalQuestion;
      userAnswer: any;
      isCorrect: boolean;
      timeTakenMs: number;
    }>
  >([]);
  const [totalXPEarned, setTotalXPEarned] = useState(0);
  const [isSessionFinished, setIsSessionFinished] = useState(false);

  // Timing
  const [timeRemaining, setTimeRemaining] = useState(45);
  const questionStartTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex];
  const subjectDef = currentQuestion ? SUBJECTS_CONFIG[currentQuestion.subjectId] : null;

  // Initialize state when question changes
  useEffect(() => {
    if (!currentQuestion) {
      if (answersHistory.length > 0 && !isSessionFinished) {
        finishSession();
      }
      return;
    }

    setSelectedOption(null);
    setIsAnswerSubmitted(false);
    setIsCorrect(false);
    setShowFullExplanation(false);
    setIsFlipped(false);
    setSelectedLeftPair(null);
    setMatchedPairs({});
    questionStartTimeRef.current = Date.now();
    setTimeRemaining(45);

    if (currentQuestion.questionType === 'ordering') {
      const q = currentQuestion as OrderingQuestion;
      const shuffled = [...q.items].sort(() => 0.5 - Math.random());
      setOrderedItems(shuffled);
    }

    // Timer countdown
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = setInterval(() => {
      setTimeRemaining((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentIndex, currentQuestion]);

  const handleTimeout = () => {
    if (isAnswerSubmitted) return;
    handleAnswerSubmission('TIMEOUT_NO_ANSWER', false);
  };

  const handleAnswerSubmission = (userAnswer: any, correct: boolean) => {
    if (isAnswerSubmitted) return;
    if (timerRef.current) clearInterval(timerRef.current);

    const timeTakenMs = Date.now() - questionStartTimeRef.current;
    setIsAnswerSubmitted(true);
    setIsCorrect(correct);

    if (correct) {
      soundService.playCorrect();
    } else {
      soundService.playWrong();
    }

    const xp = XPManager.calculateQuestionXP({
      difficulty: currentQuestion.difficulty || 30,
      timeTakenMs,
      currentStreak: combo,
      isCorrect: correct,
      gameMode,
      userMastery: userState?.subjectsMastery?.[currentQuestion.subjectId]?.masteryPercent || 0,
    });
    const earnedXP = xp.finalXP;
    setTotalXPEarned((prev) => prev + earnedXP);

    setAnswersHistory((prev) => [
      ...prev,
      {
        question: currentQuestion,
        userAnswer,
        isCorrect: correct,
        timeTakenMs,
      },
    ]);
  };

  // Multiple Choice Handler
  const handleSelectMultipleChoice = (optionId: string) => {
    if (isAnswerSubmitted) return;
    const q = currentQuestion as MultipleChoiceQuestion;
    setSelectedOption(optionId);
    const correct = optionId === q.correctOptionId;
    handleAnswerSubmission(optionId, correct);
  };

  // True/False Handler
  const handleSelectTrueFalse = (userChoice: boolean) => {
    if (isAnswerSubmitted) return;
    const q = currentQuestion as TrueFalseQuestion;
    setSelectedOption(userChoice ? 'V' : 'F');
    const correct = userChoice === q.isTrue;
    handleAnswerSubmission(userChoice, correct);
  };

  // Flashcard SRS Handler
  const handleFlashcardRating = (rating: 'easy' | 'medium' | 'hard' | 'failed') => {
    const correct = rating !== 'failed';
    handleAnswerSubmission(rating, correct);
    setTimeout(() => goToNextQuestion(), 300);
  };

  // Matching Handler
  const handleSelectLeftPair = (pairId: string) => {
    if (isAnswerSubmitted) return;
    setSelectedLeftPair(pairId);
  };

  const handleSelectRightPair = (rightText: string) => {
    if (isAnswerSubmitted || !selectedLeftPair) return;
    const q = currentQuestion as MatchingQuestion;
    const newMatched = { ...matchedPairs, [selectedLeftPair]: rightText };
    setMatchedPairs(newMatched);
    setSelectedLeftPair(null);

    // If all matched, evaluate
    const qPairs = (q?.pairs || []).filter((p) => p && p.id);
    if (Object.keys(newMatched).length === qPairs.length) {
      const allCorrect = qPairs.every((p) => p && p.id && newMatched[p.id] === p.right);
      handleAnswerSubmission(newMatched, allCorrect);
    }
  };

  // Ordering Handler (Move item up/down)
  const handleMoveOrder = (index: number, direction: 'up' | 'down') => {
    if (isAnswerSubmitted) return;
    const newIndex = direction === 'up' ? index - 1 : index + 1;
    if (newIndex < 0 || newIndex >= orderedItems.length) return;

    const updated = [...orderedItems];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    setOrderedItems(updated);
  };

  const handleSubmitOrder = () => {
    if (isAnswerSubmitted) return;
    const allCorrect = orderedItems.every((item, idx) => item.correctOrder === idx);
    handleAnswerSubmission(orderedItems, allCorrect);
  };

  const goToNextQuestion = () => {
    if (currentIndex + 1 < questions.length) {
      setCurrentIndex((prev) => prev + 1);
    } else {
      finishSession();
    }
  };

  const finishSession = () => {
    setIsSessionFinished(true);
    const correctCount = answersHistory.filter((a) => a.isCorrect).length;
    const totalTimeMs = answersHistory.reduce((acc, a) => acc + a.timeTakenMs, 0);

    onCompleteSession({
      totalQuestions: questions.length,
      correctCount,
      wrongCount: answersHistory.length - correctCount,
      totalTimeMs,
      xpEarned: totalXPEarned,
      totalXP: totalXPEarned,
      answers: answersHistory,
      questionsAnswered: answersHistory,
    });
  };

  if (!currentQuestion || isSessionFinished) {
    const correctCount = answersHistory.filter((a) => a.isCorrect).length;
    const accuracy = answersHistory.length > 0 ? Math.round((correctCount / answersHistory.length) * 100) : 0;

    return (
      <div className="max-w-2xl mx-auto p-4 sm:p-6 text-neutral-100 flex flex-col items-center justify-center min-h-[70vh]">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          className="w-full bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 text-center space-y-6 shadow-2xl"
        >
          <div className="w-20 h-20 mx-auto rounded-3xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400">
            <Award size={40} />
          </div>

          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">Treino Concluído!</h2>
            <p className="text-sm text-neutral-400 mt-1">Excelente dedicação aos estudos para o vestibular.</p>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <div className="p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800/80">
              <span className="text-xs text-neutral-400 block font-medium">Acertos</span>
              <span className="text-lg sm:text-xl font-bold text-emerald-400">
                {correctCount} / {answersHistory.length}
              </span>
            </div>
            <div className="p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800/80">
              <span className="text-xs text-neutral-400 block font-medium">Precisão</span>
              <span className="text-lg sm:text-xl font-bold text-amber-400">{accuracy}%</span>
            </div>
            <div className="p-3 bg-neutral-950/80 rounded-2xl border border-neutral-800/80">
              <span className="text-xs text-neutral-400 block font-medium">XP Ganho</span>
              <span className="text-lg sm:text-xl font-bold text-purple-400">+{totalXPEarned} XP</span>
            </div>
          </div>

          <button
            onClick={onExit}
            className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-base transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
          >
            Continuar para o Hub
          </button>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto p-4 sm:p-6 text-neutral-100 flex flex-col min-h-[85vh] justify-between">
      {/* Top Header Bar: Subject Badge, Question Progress, Streak and Timer */}
      <div>
        <div className="flex items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            {subjectDef && (
              <span
                className={`px-3 py-1 rounded-xl text-xs font-bold border ${subjectDef.badgeBg} ${subjectDef.badgeBorder} ${subjectDef.badgeText}`}
              >
                {subjectDef.name}
              </span>
            )}
            <span className="text-xs font-semibold text-neutral-400">
              Questão {currentIndex + 1} de {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-xl bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-bold">
              <Flame size={14} className="fill-orange-400" />
              <span>{currentStreak}</span>
            </div>

            <div
              className={`flex items-center gap-1.5 px-3 py-1 rounded-xl text-xs font-bold border ${
                timeRemaining <= 10
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-300'
              }`}
            >
              <Clock size={14} />
              <span>{timeRemaining}s</span>
            </div>

            <button
              onClick={onExit}
              className="p-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Sair do treino"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden mb-6">
          <div
            className="h-full bg-gradient-to-r from-amber-500 to-orange-500 transition-all duration-300 rounded-full"
            style={{ width: `${((currentIndex + 1) / questions.length) * 100}%` }}
          />
        </div>

        {/* Question Card */}
        <div className="bg-neutral-900/90 border border-neutral-800 rounded-3xl p-5 sm:p-7 shadow-xl space-y-4">
          {currentQuestion.source && (
            <div className="flex items-center justify-between text-xs text-neutral-400">
              <span className="px-2 py-0.5 rounded-lg bg-neutral-800/80 font-medium">
                Fonte: {currentQuestion.source}
              </span>
              <span className="text-neutral-500">Dificuldade: {currentQuestion.difficulty}/100</span>
            </div>
          )}

          <ScientificRenderer
            content={currentQuestion.prompt}
            latex={currentQuestion.latexPrompt}
            imageUrl={currentQuestion.imageUrl}
            imageAlt={currentQuestion.imageAlt}
            className="text-base sm:text-lg font-medium text-neutral-100"
          />

          {/* ========================================================
              GAME MODE 1: MULTIPLE CHOICE
             ======================================================== */}
          {currentQuestion.questionType === 'multiple_choice' && (
            <div className="grid grid-cols-1 gap-2.5 pt-2">
              {((currentQuestion as MultipleChoiceQuestion).options || []).map((opt) => {
                if (!opt || !opt.id) return null;
                const isSelected = selectedOption === opt.id;
                const isCorrectOption = opt.id === (currentQuestion as MultipleChoiceQuestion).correctOptionId;

                let btnStyle = 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 text-neutral-200';

                if (isAnswerSubmitted) {
                  if (isCorrectOption) {
                    btnStyle = 'bg-emerald-500/20 border-emerald-500 text-emerald-300 font-semibold';
                  } else if (isSelected && !isCorrectOption) {
                    btnStyle = 'bg-rose-500/20 border-rose-500 text-rose-300';
                  } else {
                    btnStyle = 'bg-neutral-950/40 border-neutral-800/40 text-neutral-500 opacity-60';
                  }
                }

                return (
                  <button
                    key={opt.id}
                    onClick={() => handleSelectMultipleChoice(opt.id)}
                    disabled={isAnswerSubmitted}
                    className={`w-full p-4 rounded-2xl border text-left flex items-center justify-between gap-3 transition-all duration-200 ${btnStyle} ${
                      !isAnswerSubmitted ? 'active:scale-[0.99] cursor-pointer' : ''
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-7 h-7 rounded-xl bg-neutral-800/80 border border-neutral-700/60 flex items-center justify-center text-xs font-bold text-neutral-300">
                        {opt.id}
                      </span>
                      <span className="text-sm sm:text-base leading-relaxed">{opt.text}</span>
                    </div>

                    {isAnswerSubmitted && isCorrectOption && <CheckCircle2 className="text-emerald-400 shrink-0" size={20} />}
                    {isAnswerSubmitted && isSelected && !isCorrectOption && (
                      <XCircle className="text-rose-400 shrink-0" size={20} />
                    )}
                  </button>
                );
              })}
            </div>
          )}

          {/* ========================================================
              GAME MODE 2: TRUE / FALSE
             ======================================================== */}
          {currentQuestion.questionType === 'true_false' && (
            <div className="space-y-4 pt-2">
              <div className="p-4 bg-neutral-950/80 border border-neutral-800 rounded-2xl text-neutral-200 text-sm sm:text-base italic">
                "{(currentQuestion as TrueFalseQuestion).statement}"
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => handleSelectTrueFalse(true)}
                  disabled={isAnswerSubmitted}
                  className={`py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 border transition-all ${
                    isAnswerSubmitted
                      ? (currentQuestion as TrueFalseQuestion).isTrue
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : selectedOption === 'V'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-600 opacity-50'
                      : 'bg-emerald-500/10 hover:bg-emerald-500/20 border-emerald-500/30 text-emerald-400 active:scale-95'
                  }`}
                >
                  <Check size={20} /> Verdadeiro
                </button>

                <button
                  onClick={() => handleSelectTrueFalse(false)}
                  disabled={isAnswerSubmitted}
                  className={`py-4 rounded-2xl font-bold text-base flex items-center justify-center gap-2 border transition-all ${
                    isAnswerSubmitted
                      ? !(currentQuestion as TrueFalseQuestion).isTrue
                        ? 'bg-emerald-500/20 border-emerald-500 text-emerald-300'
                        : selectedOption === 'F'
                        ? 'bg-rose-500/20 border-rose-500 text-rose-300'
                        : 'bg-neutral-950 border-neutral-800 text-neutral-600 opacity-50'
                      : 'bg-rose-500/10 hover:bg-rose-500/20 border-rose-500/30 text-rose-400 active:scale-95'
                  }`}
                >
                  <X size={20} /> Falso
                </button>
              </div>
            </div>
          )}

          {/* ========================================================
              GAME MODE 3: MATCHING / ASSOCIAÇÃO
             ======================================================== */}
          {currentQuestion.questionType === 'matching' && (
            <div className="space-y-4 pt-2">
              <p className="text-xs text-neutral-400 font-medium">
                Selecione um item da coluna da esquerda e depois seu par correspondente à direita:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Conceitos</span>
                  {((currentQuestion as MatchingQuestion).pairs || []).map((pair, pIdx) => {
                    if (!pair || !pair.id) return null;
                    const isMatched = !!matchedPairs[pair.id];
                    const isSelected = selectedLeftPair === pair.id;

                    return (
                      <button
                        key={pair.id || `left_pair_${pIdx}`}
                        onClick={() => handleSelectLeftPair(pair.id)}
                        disabled={isAnswerSubmitted || isMatched}
                        className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${
                          isMatched
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                            : isSelected
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-md'
                            : 'bg-neutral-950/80 border-neutral-800 hover:border-neutral-700 text-neutral-200'
                        }`}
                      >
                        {pair.left} {isMatched && '✓'}
                      </button>
                    );
                  })}
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-neutral-400 uppercase tracking-wider block">Definições</span>
                  {((currentQuestion as MatchingQuestion).pairs || []).map((pair, pIdx) => {
                    if (!pair || !pair.right) return null;
                    const isUsed = Object.values(matchedPairs).includes(pair.right);

                    return (
                      <button
                        key={pair.right || `right_pair_${pIdx}`}
                        onClick={() => handleSelectRightPair(pair.right)}
                        disabled={isAnswerSubmitted || isUsed || !selectedLeftPair}
                        className={`w-full p-3 rounded-xl border text-left text-sm transition-all ${
                          isUsed
                            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400 opacity-80'
                            : selectedLeftPair
                            ? 'bg-neutral-950/90 border-amber-500/40 hover:border-amber-500 text-neutral-200'
                            : 'bg-neutral-950/40 border-neutral-800/40 text-neutral-500 opacity-60'
                        }`}
                      >
                        {pair.right}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* ========================================================
              GAME MODE 4: ORDERING / SEQUÊNCIA
             ======================================================== */}
          {currentQuestion.questionType === 'ordering' && (
            <div className="space-y-3 pt-2">
              <p className="text-xs text-neutral-400 font-medium">
                Organize os itens na ordem correta usando os botões de subir e descer:
              </p>

              <div className="space-y-2">
                {orderedItems.map((item, index) => (
                  <div
                    key={item?.id || `ord_${index}`}
                    className="p-3 bg-neutral-950/80 border border-neutral-800 rounded-2xl flex items-center justify-between gap-3 text-sm text-neutral-200"
                  >
                    <div className="flex items-center gap-3">
                      <span className="w-6 h-6 rounded-lg bg-neutral-800 flex items-center justify-center text-xs font-bold text-neutral-400">
                        {index + 1}
                      </span>
                      <span>{item.text}</span>
                    </div>

                    {!isAnswerSubmitted && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => handleMoveOrder(index, 'up')}
                          disabled={index === 0}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300"
                        >
                          <ChevronUp size={16} />
                        </button>
                        <button
                          onClick={() => handleMoveOrder(index, 'down')}
                          disabled={index === orderedItems.length - 1}
                          className="p-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-700 disabled:opacity-30 text-neutral-300"
                        >
                          <ChevronDown size={16} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>

              {!isAnswerSubmitted && (
                <button
                  onClick={handleSubmitOrder}
                  className="w-full mt-3 py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm transition-all shadow-md shadow-amber-500/20"
                >
                  Confirmar Ordem
                </button>
              )}
            </div>
          )}

          {/* ========================================================
              GAME MODE 5: FLASHCARD (SRS)
             ======================================================== */}
          {currentQuestion.questionType === 'flashcard' && (
            <div className="space-y-4 pt-2">
              <div
                onClick={() => setIsFlipped(!isFlipped)}
                className="min-h-[160px] p-6 bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 rounded-3xl cursor-pointer hover:border-neutral-700 transition-all flex flex-col items-center justify-center text-center relative group"
              >
                <div className="text-xs text-neutral-400 uppercase tracking-wider font-bold mb-2 flex items-center gap-1.5">
                  <BrainCircuit size={14} className="text-purple-400" />
                  {isFlipped ? 'Resposta / Definição' : 'Frente do Cartão'}
                </div>

                <div className="text-base sm:text-lg text-neutral-100 font-medium">
                  {isFlipped
                    ? (currentQuestion as FlashcardQuestion).backResponse
                    : (currentQuestion as FlashcardQuestion).frontPrompt}
                </div>

                <div className="mt-4 text-xs text-neutral-500 flex items-center gap-1 group-hover:text-neutral-400 transition-colors">
                  <Eye size={14} /> Toque para virar o cartão
                </div>
              </div>

              {isFlipped && !isAnswerSubmitted && (
                <div className="grid grid-cols-4 gap-2 pt-2">
                  <button
                    onClick={() => handleFlashcardRating('failed')}
                    className="py-3 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 text-rose-400 text-xs font-bold"
                  >
                    Errei
                  </button>
                  <button
                    onClick={() => handleFlashcardRating('hard')}
                    className="py-3 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold"
                  >
                    Difícil
                  </button>
                  <button
                    onClick={() => handleFlashcardRating('medium')}
                    className="py-3 rounded-xl bg-blue-500/10 hover:bg-blue-500/20 border border-blue-500/30 text-blue-400 text-xs font-bold"
                  >
                    Médio
                  </button>
                  <button
                    onClick={() => handleFlashcardRating('easy')}
                    className="py-3 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 text-emerald-400 text-xs font-bold"
                  >
                    Fácil
                  </button>
                </div>
              )}
            </div>
          )}

          {(currentQuestion.questionType === 'fill_blank' ||
            currentQuestion.questionType === 'translation' ||
            currentQuestion.questionType === 'listening' ||
            currentQuestion.questionType === 'speaking' ||
            currentQuestion.questionType === 'writing') &&
            !isAnswerSubmitted && (
              <EnglishExerciseRenderer
                question={currentQuestion}
                onSubmit={(answer) => {
                  handleAnswerSubmission(answer, EnglishLearningEngine.evaluateQuestion(currentQuestion, answer));
                }}
              />
            )}
        </div>

        {/* Feedback and Explanation Box */}
        <AnimatePresence>
          {isAnswerSubmitted && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 10 }}
              className={`mt-4 p-5 rounded-2xl border ${
                isCorrect ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-rose-500/10 border-rose-500/30'
              }`}
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  {isCorrect ? (
                    <CheckCircle2 className="text-emerald-400" size={20} />
                  ) : (
                    <XCircle className="text-rose-400" size={20} />
                  )}
                  <span className={`font-bold text-sm ${isCorrect ? 'text-emerald-400' : 'text-rose-400'}`}>
                    {isCorrect ? 'Resposta Correta!' : 'Resposta Incorreta'}
                  </span>
                </div>

                {currentQuestion.keyConcept && (
                  <span className="text-xs px-2.5 py-0.5 rounded-lg bg-neutral-900 border border-neutral-800 text-neutral-300 font-medium">
                    {currentQuestion.keyConcept}
                  </span>
                )}
              </div>

              <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed">
                {currentQuestion.explanation}
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Bottom Next Button */}
      {isAnswerSubmitted && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <button
            onClick={goToNextQuestion}
            className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-base transition-all flex items-center justify-center gap-2 shadow-lg shadow-amber-500/20 active:scale-[0.98]"
          >
            <span>{currentIndex + 1 < questions.length ? 'Próxima Questão' : 'Finalizar Treino'}</span>
            <ArrowRight size={18} />
          </button>
        </motion.div>
      )}
    </div>
  );
};
