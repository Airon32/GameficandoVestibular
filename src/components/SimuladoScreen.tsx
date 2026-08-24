import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { EXAM_PROFILES } from '../config/examProfilesConfig';
import {
  ExamProfile,
  SimuladoSession,
  SimuladoAnswer,
  SimuladoSubjectResult,
  EducationalQuestion,
  MultipleChoiceQuestion,
  SubjectId,
  UserState,
} from '../types';
import { SimuladoEngine } from '../engines/SimuladoEngine';
import { ScientificRenderer } from './ScientificRenderer';
import { SUBJECTS_CONFIG } from '../config/subjectsConfig';
import { soundService } from '../services/soundService';
import {
  Clock,
  Bookmark,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  AlertTriangle,
  Award,
  BarChart3,
  TrendingUp,
  ArrowRight,
  RotateCcw,
  Sparkles,
  Zap,
  BookOpen,
} from 'lucide-react';

interface SimuladoScreenProps {
  examProfile?: ExamProfile;
  profile?: ExamProfile;
  userState?: UserState;
  onCompleteExam?: (session: SimuladoSession) => void;
  onCompleteSimulado?: (session: SimuladoSession) => void;
  onExit: () => void;
}

export const SimuladoScreen: React.FC<SimuladoScreenProps> = ({
  examProfile: examProfileProp,
  profile: profileProp,
  userState,
  onCompleteExam,
  onCompleteSimulado,
  onExit,
}) => {
  const examProfile: ExamProfile = examProfileProp || profileProp || EXAM_PROFILES.FATEC || {
    id: 'simulado_geral',
    name: 'Simulado Geral',
    shortName: 'Simulado',
    description: 'Simulado preparatório multidisciplinar.',
    totalQuestions: 20,
    durationMinutes: 45,
    subjects: [],
  };

  const [sessionData] = useState(() => SimuladoEngine.generateExamSession(examProfile));
  const questions = sessionData.questions;

  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, any>>({});
  const [markedForReview, setMarkedForReview] = useState<Record<string, boolean>>({});
  const [questionTimes, setQuestionTimes] = useState<Record<string, number>>({});
  const [timeRemainingSeconds, setTimeRemainingSeconds] = useState(
    (examProfile?.durationMinutes || 45) * 60
  );

  const [showConfirmFinish, setShowConfirmFinish] = useState(false);
  const [completedSession, setCompletedSession] = useState<SimuladoSession | null>(null);

  const examStartTimeRef = useRef(Date.now());
  const questionStartTimeRef = useRef(Date.now());
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const currentQuestion = questions[currentIndex];
  const subjectDef = currentQuestion ? SUBJECTS_CONFIG[currentQuestion.subjectId] : null;

  // Track overall exam countdown
  useEffect(() => {
    timerRef.current = setInterval(() => {
      setTimeRemainingSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current!);
          handleFinishExam();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // Track question time on switch
  const handleSwitchQuestion = (newIndex: number) => {
    const elapsed = Date.now() - questionStartTimeRef.current;
    if (currentQuestion?.id) {
      setQuestionTimes((prev) => ({
        ...prev,
        [currentQuestion.id]: (prev[currentQuestion.id] || 0) + elapsed,
      }));
    }
    questionStartTimeRef.current = Date.now();
    setCurrentIndex(newIndex);
  };

  const handleSelectOption = (optionId: string) => {
    if (!currentQuestion?.id) return;
    setUserAnswers((prev) => ({
      ...prev,
      [currentQuestion.id]: optionId,
    }));
  };

  const toggleBookmark = () => {
    if (!currentQuestion?.id) return;
    setMarkedForReview((prev) => ({
      ...prev,
      [currentQuestion.id]: !prev[currentQuestion.id],
    }));
  };

  const handleFinishExam = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    const now = Date.now();
    const finalAnswers: SimuladoAnswer[] = (questions || []).filter((q) => q && q.id).map((q) => {
      const uAns = userAnswers[q.id];
      let isCorrect = false;

      if (q.questionType === 'multiple_choice') {
        isCorrect = uAns === (q as MultipleChoiceQuestion).correctOptionId;
      } else if (q.questionType === 'true_false') {
        isCorrect = uAns === (q as any).isTrue;
      }

      return {
        questionId: q.id,
        subjectId: q.subjectId,
        topicId: q.topicId,
        userAnswer: uAns ?? 'SKIPPED',
        correctAnswer: (q as any).correctOptionId || (q as any).isTrue,
        isCorrect,
        timeTakenMs: questionTimes[q.id] || 10000,
        markedForReview: !!markedForReview[q.id],
      };
    });

    const evaluated = SimuladoEngine.evaluateExam(
      examProfile,
      finalAnswers,
      examStartTimeRef.current,
      now
    );

    setCompletedSession(evaluated);
    if (onCompleteSimulado) onCompleteSimulado(evaluated);
    if (onCompleteExam) onCompleteExam(evaluated);
  };

  // Format time remaining MM:SS
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ==========================================
  // FINAL DIAGNOSTIC RESULT SCREEN
  // ==========================================
  if (completedSession) {
    const xpReward = SimuladoEngine.calculateSimuladoXP(completedSession);

    return (
      <div className="max-w-4xl mx-auto p-4 sm:p-6 text-neutral-100 space-y-6">
        {/* Header Banner */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 sm:p-8 relative overflow-hidden shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <span className="px-3 py-1 rounded-xl text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                Resultado Oficial do Simulado
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white mt-2">{examProfile.name}</h2>
              <p className="text-xs sm:text-sm text-neutral-400">
                Diagnóstico de desempenho e mapeamento por competência
              </p>
            </div>

            <div className="flex items-center gap-3">
              <div className="p-4 bg-neutral-950/80 rounded-2xl border border-neutral-800 text-center">
                <span className="text-xs text-neutral-400 block font-medium">Nota Geral</span>
                <span className="text-2xl sm:text-3xl font-black text-amber-400">
                  {completedSession.scorePercent}%
                </span>
              </div>
              <div className="p-4 bg-neutral-950/80 rounded-2xl border border-neutral-800 text-center">
                <span className="text-xs text-neutral-400 block font-medium">XP Concedido</span>
                <span className="text-2xl sm:text-3xl font-black text-purple-400">
                  +{xpReward}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-6">
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
              <span className="text-xs text-neutral-500 block">Acertos</span>
              <span className="text-base font-bold text-emerald-400">
                {completedSession.correctCount} / {completedSession.totalQuestions}
              </span>
            </div>
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
              <span className="text-xs text-neutral-500 block">Tempo Total</span>
              <span className="text-base font-bold text-neutral-300">
                {Math.round(completedSession.totalTimeMs / 60000)} min
              </span>
            </div>
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
              <span className="text-xs text-neutral-500 block">Pontos Fortes</span>
              <span className="text-base font-bold text-emerald-400 truncate block">
                {completedSession.strongestSubjects.length > 0
                  ? completedSession.strongestSubjects.join(', ')
                  : 'Em desenvolvimento'}
              </span>
            </div>
            <div className="p-3 bg-neutral-950/60 rounded-xl border border-neutral-800/80">
              <span className="text-xs text-neutral-500 block">Atenção Necessária</span>
              <span className="text-base font-bold text-rose-400 truncate block">
                {completedSession.weakestSubjects.length > 0
                  ? completedSession.weakestSubjects.join(', ')
                  : 'Nenhum ponto crítico'}
              </span>
            </div>
          </div>
        </div>

        {/* Subject Breakdown Cards */}
        <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 shadow-xl space-y-4">
          <h3 className="text-base sm:text-lg font-bold text-white flex items-center gap-2">
            <BarChart3 size={18} className="text-amber-400" />
            Desempenho por Matéria
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {(Object.values(completedSession.subjectResults || {}) as SimuladoSubjectResult[]).map((sub: SimuladoSubjectResult) => {
              const subDef = SUBJECTS_CONFIG[sub.subjectId];
              return (
                <div
                  key={sub.subjectId}
                  className="p-4 bg-neutral-950/70 border border-neutral-800/80 rounded-2xl space-y-2"
                >
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-neutral-200">{sub.name}</span>
                    <span
                      className={`text-xs font-bold px-2 py-0.5 rounded-lg ${
                        sub.accuracy >= 75
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                          : sub.accuracy >= 50
                          ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                          : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                      }`}
                    >
                      {sub.accuracy}%
                    </span>
                  </div>

                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${
                        sub.accuracy >= 75 ? 'bg-emerald-400' : sub.accuracy >= 50 ? 'bg-amber-400' : 'bg-rose-400'
                      }`}
                      style={{ width: `${sub.accuracy}%` }}
                    />
                  </div>

                  <div className="flex justify-between text-xs text-neutral-400 pt-1">
                    <span>
                      {sub.correctCount} de {sub.totalQuestions} certas
                    </span>
                    <span>{Math.round(sub.avgTimeMs / 1000)}s / questão</span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={onExit}
          className="w-full py-4 rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-base transition-all shadow-lg shadow-amber-500/20 active:scale-[0.98]"
        >
          Voltar ao Hub de Estudos
        </button>
      </div>
    );
  }

  // ==========================================
  // ACTIVE EXAM ENVIRONMENT
  // ==========================================
  const answeredCount = Object.keys(userAnswers).length;

  return (
    <div className="w-full max-w-4xl mx-auto px-2 sm:px-6 py-2 sm:py-5 text-neutral-100 flex flex-col min-h-[82vh] justify-between box-border">
      {/* Top Header: Exam Title, Countdown clock, Actions */}
      <div className="w-full">
        <div className="flex flex-wrap items-center justify-between gap-2 mb-3 sm:mb-4 w-full">
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-xl text-xs font-black bg-neutral-900 border border-neutral-800 text-amber-400">
              {examProfile.shortName}
            </span>
            <span className="text-xs font-semibold text-neutral-400">
              {currentIndex + 1} de {questions.length}
            </span>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2.5 ml-auto">
            <button
              onClick={toggleBookmark}
              className={`p-1.5 sm:p-2 rounded-xl border text-xs font-bold flex items-center gap-1 transition-colors ${
                markedForReview[currentQuestion?.id]
                  ? 'bg-amber-500/20 border-amber-500 text-amber-400'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
              title="Marcar para revisar depois"
            >
              <Bookmark size={14} className={markedForReview[currentQuestion?.id] ? 'fill-amber-400' : ''} />
              <span className="hidden sm:inline">Marcar</span>
            </button>

            <div
              className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl text-xs font-bold border font-mono whitespace-nowrap ${
                timeRemainingSeconds <= 300
                  ? 'bg-rose-500/20 border-rose-500 text-rose-400 animate-pulse'
                  : 'bg-neutral-900 border-neutral-800 text-neutral-200'
              }`}
            >
              <Clock size={13} className="shrink-0" />
              <span>{formatTime(timeRemainingSeconds)}</span>
            </div>

            <button
              onClick={() => setShowConfirmFinish(true)}
              className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 text-amber-400 text-xs font-bold transition-all whitespace-nowrap"
            >
              Entregar
            </button>
          </div>
        </div>

        {/* Question Palette Matrix */}
        <div className="p-2 sm:p-3 bg-neutral-900/60 border border-neutral-800 rounded-2xl mb-4 w-full overflow-x-auto">
          <div className="flex items-center gap-1.5 min-w-max pb-0.5">
            {questions.map((q, idx) => {
              if (!q || !q.id) return null;
              const isCurrent = idx === currentIndex;
              const isAnswered = userAnswers[q.id] !== undefined;
              const isMarked = markedForReview[q.id];

              let cellStyle = 'bg-neutral-950 border-neutral-800 text-neutral-400';
              if (isCurrent) cellStyle = 'bg-amber-500 text-neutral-950 font-black border-amber-400 scale-105';
              else if (isMarked) cellStyle = 'bg-amber-500/20 border-amber-500/50 text-amber-400';
              else if (isAnswered) cellStyle = 'bg-neutral-800 border-neutral-700 text-neutral-200';

              return (
                <button
                  key={q.id}
                  onClick={() => handleSwitchQuestion(idx)}
                  className={`w-7 h-7 rounded-lg border text-xs font-bold flex items-center justify-center transition-all ${cellStyle}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>
        </div>

        {/* Question Card */}
        {currentQuestion && (
          <div className="bg-neutral-900 border border-neutral-800 rounded-2xl sm:rounded-3xl p-4 sm:p-6 shadow-xl space-y-4 w-full box-border">
            <div className="flex items-center justify-between text-xs text-neutral-400">
              {subjectDef && (
                <span
                  className={`px-2.5 py-1 rounded-lg font-bold border ${subjectDef.badgeBg} ${subjectDef.badgeBorder} ${subjectDef.badgeText}`}
                >
                  {subjectDef.name}
                </span>
              )}
              {currentQuestion.source && (
                <span className="text-[11px] text-neutral-400 truncate max-w-[150px] sm:max-w-none">
                  Fonte: {currentQuestion.source}
                </span>
              )}
            </div>

            <ScientificRenderer
              content={currentQuestion.prompt}
              latex={currentQuestion.latexPrompt}
              imageUrl={currentQuestion.imageUrl}
              imageAlt={currentQuestion.imageAlt}
              className="text-sm sm:text-base md:text-lg font-medium text-neutral-100 break-words"
            />

            {/* Multiple Choice Options */}
            {currentQuestion.questionType === 'multiple_choice' && (
              <div className="grid grid-cols-1 gap-2 sm:gap-2.5 pt-1">
                {((currentQuestion as MultipleChoiceQuestion).options || []).map((opt) => {
                  if (!opt || !opt.id) return null;
                  const isSelected = Boolean(currentQuestion?.id && userAnswers[currentQuestion.id] === opt.id);

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      className={`w-full p-3 sm:p-4 rounded-xl sm:rounded-2xl border text-left flex items-start sm:items-center gap-3 transition-all ${
                        isSelected
                          ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-semibold shadow-md'
                          : 'bg-neutral-950/70 border-neutral-800 hover:border-neutral-700 text-neutral-200'
                      }`}
                    >
                      <span
                        className={`shrink-0 w-7 h-7 rounded-lg sm:rounded-xl flex items-center justify-center text-xs font-bold border mt-0.5 sm:mt-0 ${
                          isSelected
                            ? 'bg-amber-500 text-neutral-950 border-amber-400'
                            : 'bg-neutral-800 border-neutral-700 text-neutral-400'
                        }`}
                      >
                        {opt.id}
                      </span>
                      <span className="text-xs sm:text-sm md:text-base leading-relaxed break-words flex-1">
                        {opt.text}
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Bottom Nav Bar */}
      <div className="flex items-center justify-between gap-2 sm:gap-3 pt-4 pb-2 w-full mt-3">
        <button
          onClick={() => handleSwitchQuestion(currentIndex - 1)}
          disabled={currentIndex === 0}
          className="px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 disabled:opacity-30 text-xs sm:text-sm font-bold text-neutral-300 flex items-center gap-1 transition-colors shrink-0"
        >
          <ChevronLeft size={16} /> Anterior
        </button>

        <span className="text-[11px] sm:text-xs text-neutral-400 font-medium text-center px-1 truncate">
          {answeredCount} de {questions.length} respondidas
        </span>

        {currentIndex + 1 < questions.length ? (
          <button
            onClick={() => handleSwitchQuestion(currentIndex + 1)}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-amber-500 hover:bg-amber-400 text-neutral-950 text-xs sm:text-sm font-bold flex items-center gap-1 transition-all shadow-md shadow-amber-500/20 active:scale-95 shrink-0"
          >
            Próxima <ChevronRight size={16} />
          </button>
        ) : (
          <button
            onClick={() => setShowConfirmFinish(true)}
            className="px-4 sm:px-5 py-2.5 sm:py-3 rounded-xl sm:rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-neutral-950 text-xs sm:text-sm font-bold flex items-center gap-1 transition-all shadow-md shadow-emerald-500/20 active:scale-95 shrink-0"
          >
            Finalizar Simulado
          </button>
        )}
      </div>

      {/* Confirmation Modal */}
      {showConfirmFinish && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-neutral-900 border border-neutral-800 rounded-3xl p-6 max-w-md w-full space-y-4 shadow-2xl">
            <h3 className="text-xl font-bold text-white">Deseja entregar o simulado?</h3>
            <p className="text-sm text-neutral-400">
              Você respondeu {answeredCount} de {questions.length} questões.
              {answeredCount < questions.length && (
                <span className="block mt-1 text-amber-400 font-medium">
                  Atenção: Existem {questions.length - answeredCount} questões em branco.
                </span>
              )}
            </p>

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => setShowConfirmFinish(false)}
                className="py-3 rounded-xl bg-neutral-800 hover:bg-neutral-700 font-bold text-sm text-neutral-300"
              >
                Voltar à Prova
              </button>
              <button
                onClick={handleFinishExam}
                className="py-3 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-sm"
              >
                Confirmar Entrega
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
