import React, { useState, useEffect, useRef } from 'react';
import {
  Zap,
  Flame,
  Clock,
  Pause,
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  BookOpen,
  Flag,
  ArrowRight,
  Sparkles,
  ChevronRight,
  ShieldAlert,
  Award,
  TrendingUp,
  X,
  Share2,
} from 'lucide-react';
import {
  EducationalQuestion,
  MultipleChoiceQuestion,
  InfiniteSessionConfig,
  InfiniteSessionState,
  SubjectId,
  UserState,
  QuestionReportReason,
} from '../types';
import { QuestionSessionManager } from '../engines/QuestionSessionManager';
import { SUBJECTS_CONFIG } from '../config/subjectsConfig';
import { getStudyGuideByIdOrTopic } from '../data/studyGuidesData';

interface InfiniteTrainingScreenProps {
  config: InfiniteSessionConfig;
  userState: UserState;
  onExit: () => void;
  onOpenStudyGuide: (guideIdOrTopic: string) => void;
  onUpdateUserState: (updater: (prev: UserState) => UserState) => void;
}

export const InfiniteTrainingScreen: React.FC<InfiniteTrainingScreenProps> = ({
  config,
  userState,
  onExit,
  onOpenStudyGuide,
  onUpdateUserState,
}) => {
  // Session State
  const [session, setSession] = useState<InfiniteSessionState | null>(null);
  const [currentQuestion, setCurrentQuestion] = useState<EducationalQuestion | null>(null);
  const [selectedOptionId, setSelectedOptionId] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [lastXPResult, setLastXPResult] = useState<any>(null);
  const [isCorrect, setIsCorrect] = useState<boolean>(false);

  // Time tracking
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [sessionElapsedTime, setSessionElapsedTime] = useState<number>(0);
  const [isPaused, setIsPaused] = useState<boolean>(false);

  // Modals
  const [showSummaryModal, setShowSummaryModal] = useState<boolean>(false);
  const [summaryData, setSummaryData] = useState<InfiniteSessionState | null>(null);
  const [showReportModal, setShowReportModal] = useState<boolean>(false);
  const [reportReason, setReportReason] = useState<QuestionReportReason>('wrong_answer');
  const [reportComment, setReportComment] = useState<string>('');
  const [reportSuccess, setReportSuccess] = useState<boolean>(false);

  // Initialize Session on mount
  useEffect(() => {
    const { session: newSession, firstQuestion } = QuestionSessionManager.startSession(
      config,
      userState
    );
    setSession(newSession);
    setCurrentQuestion(firstQuestion);
    setQuestionStartTime(Date.now());
  }, []);

  // Elapsed time clock
  useEffect(() => {
    if (isPaused || showSummaryModal) return;
    const interval = setInterval(() => {
      setSessionElapsedTime((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isPaused, showSummaryModal]);

  const subjectConfig = currentQuestion ? SUBJECTS_CONFIG[currentQuestion.subjectId] : null;
  const relatedGuide = currentQuestion
    ? getStudyGuideByIdOrTopic(currentQuestion.topicId) ||
      getStudyGuideByIdOrTopic(currentQuestion.subjectId)
    : null;

  // Handle Option Select
  const handleSelectOption = (optionId: string) => {
    if (isSubmitted || isPaused) return;
    setSelectedOptionId(optionId);
  };

  // Submit Answer
  const handleSubmitAnswer = () => {
    if (!currentQuestion || selectedOptionId === null || isSubmitted || isPaused) return;

    const timeTakenMs = Math.max(500, Date.now() - questionStartTime);
    let correct = false;

    if (currentQuestion.questionType === 'multiple_choice') {
      correct = selectedOptionId === (currentQuestion as MultipleChoiceQuestion).correctOptionId;
    }

    setIsCorrect(correct);
    setIsSubmitted(true);

    const {
      session: updatedSession,
      updatedUserState,
      xpResult,
      nextQuestion: bufferedNext,
    } = QuestionSessionManager.submitAnswer(
      currentQuestion,
      selectedOptionId,
      correct,
      timeTakenMs,
      userState
    );

    setSession({ ...updatedSession });
    setLastXPResult(xpResult);
    onUpdateUserState(() => updatedUserState);

    // Save buffered next question for next click
    (window as any).__bufferedNextQuestion = bufferedNext;
  };

  // Next Question
  const handleNextQuestion = () => {
    // Check if finite session completed
    if (
      config.sessionType === 'fixed_count' &&
      config.targetCount &&
      session &&
      session.questionsAnswered >= config.targetCount
    ) {
      handleFinishSession();
      return;
    }

    const nextQ = (window as any).__bufferedNextQuestion;
    if (nextQ) {
      setCurrentQuestion(nextQ);
      (window as any).__bufferedNextQuestion = null;
    } else {
      // Fallback
      const fallbackQ = QuestionSessionManager.startSession(config, userState).firstQuestion;
      setCurrentQuestion(fallbackQ);
    }

    setSelectedOptionId(null);
    setIsSubmitted(false);
    setLastXPResult(null);
    setQuestionStartTime(Date.now());
  };

  // Pause / Resume
  const handleTogglePause = () => {
    if (isPaused) {
      QuestionSessionManager.resumeSession();
      setIsPaused(false);
      setQuestionStartTime(Date.now());
    } else {
      QuestionSessionManager.pauseSession();
      setIsPaused(true);
    }
  };

  // Finish Session
  const handleFinishSession = () => {
    const finalSession = QuestionSessionManager.endSession();
    setSummaryData(finalSession || session);
    setShowSummaryModal(true);
  };

  // Report Question
  const handleSendReport = () => {
    if (!currentQuestion) return;
    QuestionSessionManager.reportQuestion(
      currentQuestion,
      reportReason,
      userState.id || 'anonymous_user',
      reportComment
    );
    setReportSuccess(true);
    setTimeout(() => {
      setShowReportModal(false);
      setReportSuccess(false);
      setReportComment('');
      // Skip problematic question
      handleNextQuestion();
    }, 1200);
  };

  // Formatting helpers
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (!currentQuestion) {
    return (
      <div className="min-h-screen bg-slate-950 text-white flex items-center justify-center">
        <div className="text-center space-y-3">
          <div className="w-12 h-12 border-4 border-indigo-500 border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="text-sm text-slate-400">Preparando questões da sua sessão...</p>
        </div>
      </div>
    );
  }

  const mcQuestion = currentQuestion as MultipleChoiceQuestion;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between select-none">
      {/* Top Session HUD */}
      <header className="sticky top-0 z-30 bg-slate-900/95 backdrop-blur border-b border-slate-800 px-4 py-3">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          {/* Left: Subject & Topic */}
          <div className="flex items-center gap-3">
            <span
              className="text-xs px-2.5 py-1 rounded-lg font-bold uppercase tracking-wider"
              style={{
                backgroundColor: `${subjectConfig?.color || '#3b82f6'}20`,
                color: subjectConfig?.color || '#60a5fa',
              }}
            >
              {subjectConfig?.name || currentQuestion.subjectId}
            </span>
            <span className="hidden sm:inline text-xs text-slate-400 font-medium">
              {config.sessionType === 'infinite' ? 'Treino Infinito' : 'Treino Rápido'}
            </span>
          </div>

          {/* Center: Live Stats (Streak & XP) */}
          <div className="flex items-center gap-3 sm:gap-6">
            <div className="flex items-center gap-1.5 bg-slate-800/80 px-2.5 py-1 rounded-lg border border-slate-700">
              <Flame
                className={`w-4 h-4 ${
                  (session?.currentStreak || 0) > 0
                    ? 'text-amber-400 fill-amber-400 animate-pulse'
                    : 'text-slate-500'
                }`}
              />
              <span className="text-xs font-bold text-white">
                {session?.currentStreak || 0}{' '}
                <span className="text-[10px] text-slate-400">streak</span>
              </span>
            </div>

            <div className="flex items-center gap-1.5 bg-indigo-950/60 px-2.5 py-1 rounded-lg border border-indigo-700/50">
              <Zap className="w-4 h-4 text-indigo-400 fill-indigo-400" />
              <span className="text-xs font-extrabold text-indigo-300">
                +{session?.sessionXP || 0} <span className="text-[10px] text-indigo-400">XP</span>
              </span>
            </div>

            <div className="hidden md:flex items-center gap-1.5 text-xs text-slate-400">
              <Clock className="w-3.5 h-3.5" />
              <span>{formatTime(sessionElapsedTime)}</span>
            </div>
          </div>

          {/* Right: Controls (Pause / Exit) */}
          <div className="flex items-center gap-2">
            <button
              onClick={handleTogglePause}
              className={`p-2 rounded-lg border text-xs font-bold flex items-center gap-1 transition-all ${
                isPaused
                  ? 'bg-amber-500 text-slate-950 border-amber-400 animate-pulse'
                  : 'bg-slate-800 hover:bg-slate-700 text-slate-300 border-slate-700'
              }`}
              title={isPaused ? 'Continuar Treino' : 'Pausar Treino'}
            >
              {isPaused ? <Play className="w-4 h-4 fill-slate-950" /> : <Pause className="w-4 h-4" />}
              <span className="hidden sm:inline">{isPaused ? 'Retomar' : 'Pausar'}</span>
            </button>

            <button
              onClick={handleFinishSession}
              className="px-3 py-1.5 rounded-lg bg-rose-950/60 hover:bg-rose-900 border border-rose-800 text-rose-300 text-xs font-bold transition-colors"
            >
              Encerrar
            </button>
          </div>
        </div>
      </header>

      {/* Main Question Area */}
      <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 flex flex-col justify-center space-y-6">
        {/* Pause Overlay if active */}
        {isPaused ? (
          <div className="bg-slate-900 rounded-2xl p-8 border border-slate-800 text-center space-y-4 my-auto">
            <div className="w-16 h-16 rounded-full bg-amber-500/20 text-amber-400 flex items-center justify-center mx-auto">
              <Pause className="w-8 h-8" />
            </div>
            <h2 className="text-2xl font-bold text-white">Sessão em Pausa</h2>
            <p className="text-sm text-slate-400 max-w-md mx-auto">
              Seu progresso, streak e XP acumulados foram salvos com segurança. Respire fundo e
              retome quando estiver pronto.
            </p>
            <div className="pt-4 flex items-center justify-center gap-3">
              <button
                onClick={handleTogglePause}
                className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 flex items-center gap-2"
              >
                <Play className="w-4 h-4 fill-white" />
                Continuar Treinando
              </button>
              <button
                onClick={handleFinishSession}
                className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm"
              >
                Concluir Sessão
              </button>
            </div>
          </div>
        ) : (
          <>
            {/* Question Header Metadata */}
            <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-md bg-slate-800 text-slate-300 font-semibold border border-slate-700">
                  Questão #{session?.questionsAnswered ? session.questionsAnswered + 1 : 1}
                </span>

                <span className="px-2.5 py-0.5 rounded-md bg-indigo-950 text-indigo-300 font-medium border border-indigo-800/40">
                  Dificuldade {currentQuestion.difficulty || 30} • Base{' '}
                  {currentQuestion.difficulty <= 15
                    ? '10'
                    : currentQuestion.difficulty <= 30
                    ? '15'
                    : currentQuestion.difficulty <= 45
                    ? '20'
                    : currentQuestion.difficulty <= 60
                    ? '25'
                    : currentQuestion.difficulty <= 75
                    ? '30'
                    : currentQuestion.difficulty <= 90
                    ? '40'
                    : '50'}{' '}
                  XP
                </span>

                {currentQuestion.source && (
                  <span className="px-2 py-0.5 rounded-md bg-slate-800/50 text-slate-400 text-[11px]">
                    {currentQuestion.source}
                  </span>
                )}
              </div>

              {/* Utility buttons */}
              <div className="flex items-center gap-2">
                {relatedGuide && (
                  <button
                    onClick={() => onOpenStudyGuide(relatedGuide.id)}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-indigo-950/80 hover:bg-indigo-900 text-indigo-300 border border-indigo-700/60 font-semibold transition-colors"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
                    Revisar Assunto
                  </button>
                )}

                <button
                  onClick={() => setShowReportModal(true)}
                  className="p-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-slate-500 hover:text-slate-300 transition-colors"
                  title="Reportar problema na questão"
                >
                  <Flag className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Prompt Box */}
            <div className="bg-slate-900 rounded-2xl p-5 sm:p-7 border border-slate-800 shadow-xl space-y-4">
              <h2 className="text-base sm:text-lg font-bold text-white leading-relaxed">
                {currentQuestion.prompt}
              </h2>

              {currentQuestion.latexPrompt && (
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 text-center font-mono text-indigo-300 text-lg sm:text-xl overflow-x-auto">
                  {currentQuestion.latexPrompt}
                </div>
              )}
            </div>

            {/* Multiple Choice Options */}
            {mcQuestion.options && (
              <div className="space-y-3">
                {mcQuestion.options.map((opt) => {
                  const isSelected = selectedOptionId === opt.id;
                  const isAnswerCorrect = opt.id === mcQuestion.correctOptionId;

                  let containerStyle =
                    'bg-slate-900/90 hover:bg-slate-850 border-slate-800 text-slate-200 hover:border-slate-700';

                  if (isSubmitted) {
                    if (isAnswerCorrect) {
                      containerStyle =
                        'bg-emerald-950/80 border-emerald-500 text-emerald-100 font-bold shadow-lg shadow-emerald-900/20';
                    } else if (isSelected) {
                      containerStyle =
                        'bg-rose-950/80 border-rose-500 text-rose-100 shadow-lg shadow-rose-900/20';
                    } else {
                      containerStyle = 'bg-slate-900/40 border-slate-850 text-slate-500 opacity-60';
                    }
                  } else if (isSelected) {
                    containerStyle =
                      'bg-indigo-950/90 border-indigo-500 text-indigo-100 font-semibold shadow-lg shadow-indigo-900/30';
                  }

                  return (
                    <button
                      key={opt.id}
                      onClick={() => handleSelectOption(opt.id)}
                      disabled={isSubmitted}
                      className={`w-full text-left p-4 sm:p-5 rounded-2xl border transition-all flex items-center justify-between gap-4 ${containerStyle}`}
                    >
                      <div className="flex items-center gap-3 sm:gap-4 flex-1">
                        <span
                          className={`w-7 h-7 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                            isSubmitted && isAnswerCorrect
                              ? 'bg-emerald-500 text-slate-950'
                              : isSubmitted && isSelected && !isAnswerCorrect
                              ? 'bg-rose-500 text-white'
                              : isSelected
                              ? 'bg-indigo-500 text-white'
                              : 'bg-slate-800 text-slate-300'
                          }`}
                        >
                          {opt.id}
                        </span>
                        <span className="text-sm sm:text-base leading-snug">{opt.text}</span>
                      </div>

                      {isSubmitted && isAnswerCorrect && (
                        <CheckCircle2 className="w-6 h-6 text-emerald-400 shrink-0" />
                      )}
                      {isSubmitted && isSelected && !isAnswerCorrect && (
                        <XCircle className="w-6 h-6 text-rose-400 shrink-0" />
                      )}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Post-Submission Feedback & Pedagogical Explanation */}
            {isSubmitted && (
              <div className="space-y-4 animate-in fade-in slide-in-from-bottom-2 duration-300">
                {/* XP Reward Banner */}
                {isCorrect && lastXPResult && (
                  <div className="bg-gradient-to-r from-emerald-950/60 to-indigo-950/60 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center gap-3 text-center sm:text-left">
                      <div className="w-12 h-12 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center shrink-0">
                        <Sparkles className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="text-lg font-extrabold text-white flex items-center gap-2 justify-center sm:justify-start">
                          <span>+{lastXPResult.finalXP} XP Conquistados!</span>
                        </div>
                        <p className="text-xs text-slate-300">
                          {lastXPResult.breakdown?.explanation || 'Excelente resposta!'}
                        </p>
                      </div>
                    </div>

                    <div className="text-xs font-mono bg-slate-900/80 px-3 py-1.5 rounded-lg border border-slate-800 text-emerald-300">
                      Streak Multiplier: {lastXPResult.streakMultiplier}x
                    </div>
                  </div>
                )}

                {/* Incorrect Banner */}
                {!isCorrect && (
                  <div className="bg-rose-950/30 border border-rose-500/30 rounded-2xl p-4 sm:p-5 flex items-start gap-3">
                    <div className="w-10 h-10 rounded-xl bg-rose-500/20 text-rose-400 flex items-center justify-center shrink-0 mt-0.5">
                      <XCircle className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white text-sm">Não foi dessa vez (0 XP)</h4>
                      <p className="text-xs text-rose-300 mt-0.5">
                        Esta questão foi adicionada automaticamente ao seu Caderno de Erros para
                        revisão espaçada posterior.
                      </p>
                    </div>
                  </div>
                )}

                {/* Pedagogical Explanation Card */}
                <div className="bg-slate-900 rounded-2xl p-5 border border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-indigo-400 font-bold text-xs uppercase tracking-wider">
                    <BookOpen className="w-4 h-4" />
                    Explicação Pedagógica
                  </div>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {currentQuestion.explanation}
                  </p>
                  {currentQuestion.keyConcept && (
                    <div className="pt-2 text-xs text-slate-400 flex items-center gap-1.5">
                      <strong className="text-slate-300">Conceito-Chave:</strong>
                      <span className="text-indigo-300">{currentQuestion.keyConcept}</span>
                    </div>
                  )}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Bottom Action Footer */}
      {!isPaused && (
        <footer className="sticky bottom-0 z-30 bg-slate-900/95 backdrop-blur border-t border-slate-800 p-4">
          <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
            <span className="text-xs text-slate-400">
              {session?.questionsAnswered || 0} questões feitas nesta sessão
            </span>

            {!isSubmitted ? (
              <button
                onClick={handleSubmitAnswer}
                disabled={selectedOptionId === null}
                className="px-6 sm:px-8 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-extrabold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
              >
                Confirmar Resposta
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={handleNextQuestion}
                className="px-6 sm:px-8 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-sm shadow-lg shadow-emerald-600/30 transition-all flex items-center gap-2"
              >
                Próxima Questão
                <ChevronRight className="w-5 h-5" />
              </button>
            )}
          </div>
        </footer>
      )}

      {/* Summary Modal on Finish */}
      {showSummaryModal && summaryData && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-3xl p-6 sm:p-8 max-w-lg w-full border border-slate-800 shadow-2xl space-y-6 animate-in zoom-in-95 duration-200">
            <div className="text-center space-y-2">
              <div className="w-16 h-16 rounded-full bg-indigo-600/20 text-indigo-400 flex items-center justify-center mx-auto">
                <Award className="w-8 h-8" />
              </div>
              <h3 className="text-2xl font-extrabold text-white">Sessão Concluída!</h3>
              <p className="text-xs text-slate-400">
                Parabéns pelo treino. Aqui está o resumo do seu desempenho:
              </p>
            </div>

            <div className="grid grid-cols-2 gap-3 text-center">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Total Respondidas</span>
                <div className="text-xl font-bold text-white">
                  {summaryData.questionsAnswered}
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Precisão</span>
                <div className="text-xl font-bold text-emerald-400">
                  {summaryData.questionsAnswered > 0
                    ? Math.round(
                        (summaryData.correctAnswers / summaryData.questionsAnswered) * 100
                      )
                    : 0}
                  %
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">XP Acumulado</span>
                <div className="text-xl font-bold text-indigo-400">
                  +{summaryData.sessionXP} XP
                </div>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-1">
                <span className="text-xs text-slate-400">Maior Streak</span>
                <div className="text-xl font-bold text-amber-400">
                  {summaryData.maxStreak} 🔥
                </div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={() => {
                  setShowSummaryModal(false);
                  const { firstQuestion } = QuestionSessionManager.startSession(config, userState);
                  setCurrentQuestion(firstQuestion);
                  setSelectedOptionId(null);
                  setIsSubmitted(false);
                  setLastXPResult(null);
                  setSessionElapsedTime(0);
                }}
                className="w-full sm:flex-1 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all text-center flex items-center justify-center gap-2"
              >
                <RotateCcw className="w-4 h-4" />
                Treinar Mais
              </button>

              <button
                onClick={onExit}
                className="w-full sm:flex-1 py-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-sm transition-colors text-center"
              >
                Voltar ao Hub
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Report Question Modal */}
      {showReportModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 rounded-2xl p-6 max-w-md w-full border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-amber-400" />
                Reportar Problema na Questão
              </h3>
              <button
                onClick={() => setShowReportModal(false)}
                className="p-1 rounded-lg text-slate-500 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {reportSuccess ? (
              <div className="py-6 text-center space-y-2">
                <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto" />
                <p className="text-sm font-bold text-white">Relatório enviado com sucesso!</p>
                <p className="text-xs text-slate-400">
                  A questão foi colocada em quarentena para revisão. Pulando para a próxima...
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Motivo do Problema:</label>
                  <select
                    value={reportReason}
                    onChange={(e) => setReportReason(e.target.value as QuestionReportReason)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500"
                  >
                    <option value="wrong_answer">Gabarito Incorreto</option>
                    <option value="ambiguous">Enunciado Ambíguo / Dupla Interpretação</option>
                    <option value="prompt_error">Erro de Digitação / Português no Enunciado</option>
                    <option value="explanation_error">Explicação Incoerente</option>
                    <option value="other">Outro Problema</option>
                  </select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    Detalhes Adicionais (opcional):
                  </label>
                  <textarea
                    value={reportComment}
                    onChange={(e) => setReportComment(e.target.value)}
                    placeholder="Descreva o que está incorreto para que nossa equipe ajuste imediatamente..."
                    rows={3}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white focus:outline-none focus:border-indigo-500 placeholder-slate-600"
                  />
                </div>

                <div className="pt-2 flex items-center justify-end gap-2">
                  <button
                    onClick={() => setShowReportModal(false)}
                    className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 text-xs font-bold"
                  >
                    Cancelar
                  </button>
                  <button
                    onClick={handleSendReport}
                    className="px-4 py-2 rounded-lg bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold flex items-center gap-1.5"
                  >
                    <Flag className="w-3.5 h-3.5" />
                    Enviar e Pular
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
