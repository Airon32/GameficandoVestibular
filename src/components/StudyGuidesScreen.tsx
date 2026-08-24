import React, { useState, useMemo } from 'react';
import {
  BookOpen,
  Search,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Zap,
  Sparkles,
  Bookmark,
  ChevronRight,
  ArrowLeft,
  GraduationCap,
  Play,
  RotateCcw,
  Star,
  Check,
  X,
  Share2,
} from 'lucide-react';
import { StudyGuide, SubjectId, UserState } from '../types';
import { STUDY_GUIDES, getStudyGuideByIdOrTopic, searchStudyGuides } from '../data/studyGuidesData';
import { SUBJECTS_CONFIG, ALL_SUBJECT_IDS } from '../config/subjectsConfig';

interface StudyGuidesScreenProps {
  userState: UserState;
  onBack: () => void;
  onStartTopicTraining?: (subjectId: SubjectId, topicId: string) => void;
  onStartPractice?: (subjectId: SubjectId, topicId: string) => void;
  initialGuideId?: string;
  onUpdateUserState?: (updater: (prev: UserState) => UserState) => void;
  onCompleteMiniQuiz?: (guideId: string, xpEarned: number) => void;
}

export const StudyGuidesScreen: React.FC<StudyGuidesScreenProps> = ({
  userState,
  onBack,
  onStartTopicTraining,
  onStartPractice,
  initialGuideId,
  onUpdateUserState,
  onCompleteMiniQuiz,
}) => {
  const triggerPractice = (subjectId: SubjectId, topicId: string) => {
    if (onStartPractice) {
      onStartPractice(subjectId, topicId);
    } else if (onStartTopicTraining) {
      onStartTopicTraining(subjectId, topicId);
    }
  };
  const [selectedSubject, setSelectedSubject] = useState<SubjectId | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeGuide, setActiveGuide] = useState<StudyGuide | null>(() => {
    if (initialGuideId) {
      return getStudyGuideByIdOrTopic(initialGuideId) || null;
    }
    return null;
  });

  // Mini-quiz state
  const [quizActive, setQuizActive] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizSelectedOption, setQuizSelectedOption] = useState<string | null>(null);
  const [quizSubmitted, setQuizSubmitted] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [quizFinished, setQuizFinished] = useState(false);

  // Filtered guides
  const filteredGuides = useMemo(() => {
    let list = STUDY_GUIDES;
    if (searchQuery.trim()) {
      list = searchStudyGuides(searchQuery);
    }
    if (selectedSubject !== 'all') {
      list = list.filter((g) => g.subjectId === selectedSubject);
    }
    return list;
  }, [searchQuery, selectedSubject]);

  const handleOpenGuide = (guide: StudyGuide) => {
    setActiveGuide(guide);
    setQuizActive(false);
    setQuizStep(0);
    setQuizSelectedOption(null);
    setQuizSubmitted(false);
    setQuizScore(0);
    setQuizFinished(false);

    // Record review in userState
    if (onUpdateUserState) {
      onUpdateUserState((prev) => {
        const guidesProgress = { ...(prev.studyGuidesProgress || {}) };
        const existing = guidesProgress[guide.id] || {
          guideId: guide.id,
          subjectId: guide.subjectId,
          topicId: guide.topicId,
          lastReviewedAt: Date.now(),
          reviewCount: 0,
          isFavorite: false,
        };
        existing.lastReviewedAt = Date.now();
        existing.reviewCount += 1;
        guidesProgress[guide.id] = existing;

        return {
          ...prev,
          studyGuidesProgress: guidesProgress,
        };
      });
    }
  };

  const handleToggleFavorite = (guideId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (onUpdateUserState) {
      onUpdateUserState((prev) => {
        const guidesProgress = { ...(prev.studyGuidesProgress || {}) };
        const existing = guidesProgress[guideId] || {
          guideId,
          subjectId: 'matematica',
          topicId: '',
          lastReviewedAt: Date.now(),
          reviewCount: 1,
          isFavorite: false,
        };
        existing.isFavorite = !existing.isFavorite;
        guidesProgress[guideId] = existing;
        return { ...prev, studyGuidesProgress: guidesProgress };
      });
    }
  };

  // Mini-Quiz Sample Questions for currently opened guide
  const sampleQuizQuestions = useMemo(() => {
    if (!activeGuide) return [];
    // Generate 3 verified quick quiz questions from the guide content
    return [
      {
        question: `Qual é o conceito-chave fundamental em "${activeGuide.title}"?`,
        options: [
          activeGuide.quickSummary[0] || 'Aplicação prática e contextualizada dos conceitos',
          'Ignorar as fórmulas e tentar dedução por eliminação',
          'Memorizar apenas números sem entender a teoria',
          'Aplicar métodos antigos sem validação de dados',
        ],
        correctIndex: 0,
        explanation: activeGuide.quickSummary[0] || 'Conceito essencial sintetizado no resumo do guia.',
      },
      {
        question: `Em vestibulares, qual é um dos erros mais comuns destacados neste tema?`,
        options: [
          activeGuide.commonMistakes[0]?.mistake || 'Confundir unidades e sinais das operações',
          'Fazer o cálculo com calma e revisar no final',
          'Identificar corretamente as grandezas fornecidas',
          'Usar a fórmula recomendada no passo a passo',
        ],
        correctIndex: 0,
        explanation: activeGuide.commonMistakes[0]?.correction || 'Atenção redobrada nas pegadinhas clássicas.',
      },
      {
        question: `Qual a melhor estratégia para resolver questões desse assunto com agilidade?`,
        options: [
          'Seguir o passo a passo estruturado e usar atalhos conceituais',
          'Chutar na alternativa com texto mais longo',
          'Pular a questão e não voltar mais',
          'Resolver sem ler o comando da pergunta',
        ],
        correctIndex: 0,
        explanation: 'O método passo a passo garante precisão e economia de tempo precioso na prova.',
      },
    ];
  }, [activeGuide]);

  // Quiz submission
  const handleQuizSelect = (optIndex: number) => {
    if (quizSubmitted) return;
    setQuizSelectedOption(`${optIndex}`);
  };

  const handleQuizSubmitAnswer = () => {
    if (quizSelectedOption === null || quizSubmitted) return;
    setQuizSubmitted(true);
    const currentQ = sampleQuizQuestions[quizStep];
    if (parseInt(quizSelectedOption, 10) === currentQ.correctIndex) {
      setQuizScore((prev) => prev + 1);
    }
  };

  const handleQuizNext = () => {
    if (quizStep + 1 < sampleQuizQuestions.length) {
      setQuizStep((prev) => prev + 1);
      setQuizSelectedOption(null);
      setQuizSubmitted(false);
    } else {
      setQuizFinished(true);
      if (onCompleteMiniQuiz && activeGuide) {
        onCompleteMiniQuiz(activeGuide.id, 25);
      } else if (onUpdateUserState) {
        onUpdateUserState((prev) => ({
          ...prev,
          totalXP: (prev.totalXP || 0) + 25,
          currentLevelXP: (prev.currentLevelXP || 0) + 25,
        }));
      }
    }
  };

  // IF A GUIDE IS OPENED: Render detailed reading view
  if (activeGuide) {
    const subjectConfig = SUBJECTS_CONFIG[activeGuide.subjectId];
    const isFav = userState.studyGuidesProgress?.[activeGuide.id]?.isFavorite;
    const reviewCount = userState.studyGuidesProgress?.[activeGuide.id]?.reviewCount || 1;

    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
        {/* Top Header */}
        <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveGuide(null)}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Voltar às Apostilas"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <span
                  className="text-xs px-2 py-0.5 rounded-full font-bold uppercase"
                  style={{
                    backgroundColor: `${subjectConfig?.color || '#3b82f6'}20`,
                    color: subjectConfig?.color || '#60a5fa',
                  }}
                >
                  {subjectConfig?.name || activeGuide.subjectId}
                </span>
                <span className="text-xs text-slate-400 flex items-center gap-1">
                  <Clock className="w-3 h-3" /> {activeGuide.estimatedReadMinutes} min de leitura
                </span>
              </div>
              <h1 className="text-base font-bold text-white line-clamp-1">{activeGuide.title}</h1>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={(e) => handleToggleFavorite(activeGuide.id, e)}
              className={`p-2 rounded-lg transition-colors ${
                isFav ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
              }`}
              title={isFav ? 'Salvo nos favoritos' : 'Adicionar aos favoritos'}
            >
              <Star className={`w-5 h-5 ${isFav ? 'fill-amber-400' : ''}`} />
            </button>
            <button
              onClick={() => onStartTopicTraining(activeGuide.subjectId, activeGuide.topicId)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-xs shadow-lg shadow-indigo-600/30 transition-all"
            >
              <Zap className="w-4 h-4" />
              Treinar Assunto
            </button>
          </div>
        </header>

        {/* Content Body */}
        <main className="flex-1 max-w-4xl w-full mx-auto p-4 sm:p-6 space-y-6">
          {/* Hero Banner */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-850 rounded-2xl p-5 sm:p-7 border border-slate-800 shadow-xl relative overflow-hidden">
            <div className="relative z-10 space-y-2">
              <div className="flex flex-wrap items-center gap-2">
                {activeGuide.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-xs px-2.5 py-0.5 rounded-md bg-slate-800/80 text-slate-300 border border-slate-700 font-medium"
                  >
                    #{tag}
                  </span>
                ))}
              </div>
              <h2 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                {activeGuide.title}
              </h2>
              <p className="text-sm sm:text-base text-slate-300">{activeGuide.subtitle}</p>
              <div className="pt-2 flex items-center gap-4 text-xs text-slate-400">
                <span className="flex items-center gap-1">
                  <BookOpen className="w-4 h-4 text-indigo-400" />
                  Revisado {reviewCount}x
                </span>
                <span className="flex items-center gap-1">
                  <Sparkles className="w-4 h-4 text-amber-400" />
                  Direto ao ponto para Vestibulares
                </span>
              </div>
            </div>
          </div>

          {/* Quick Summary Box */}
          <div className="bg-indigo-950/30 border border-indigo-500/30 rounded-xl p-5 space-y-3">
            <div className="flex items-center gap-2 text-indigo-300 font-bold text-sm">
              <Zap className="w-4 h-4 text-indigo-400" />
              RESUMO EXPRESS (3 a 5 Pontos-Chave)
            </div>
            <ul className="grid sm:grid-cols-2 gap-2.5 text-sm text-slate-200">
              {activeGuide.quickSummary.map((item, idx) => (
                <li key={idx} className="flex items-start gap-2 bg-slate-900/60 p-2.5 rounded-lg border border-slate-800/80">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>
          </div>

          {/* Dynamic Sections */}
          <div className="space-y-6">
            {activeGuide.sections.map((section, idx) => (
              <div
                key={idx}
                className="bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-800 space-y-3"
              >
                <h3 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                  {section.title}
                </h3>

                <p className="text-slate-300 leading-relaxed text-sm sm:text-base">{section.content}</p>

                {section.latex && (
                  <div className="bg-slate-950 p-3.5 rounded-lg border border-slate-800 text-center font-mono text-indigo-300 text-sm sm:text-base overflow-x-auto">
                    {section.latex}
                  </div>
                )}

                {section.items && (
                  <ul className="space-y-2 pt-1">
                    {section.items.map((item, itemIdx) => (
                      <li
                        key={itemIdx}
                        className="flex items-start gap-2.5 text-sm text-slate-300 bg-slate-950/40 p-2.5 rounded-lg border border-slate-800/50"
                      >
                        <ChevronRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                        <span>{item}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ))}
          </div>

          {/* Common Mistakes / Pitfalls */}
          <div className="bg-rose-950/20 border border-rose-500/30 rounded-xl p-5 sm:p-6 space-y-4">
            <div className="flex items-center gap-2 text-rose-300 font-bold text-base">
              <AlertTriangle className="w-5 h-5 text-rose-400" />
              ERROS MAIS COMUNS & PEGADINHAS DE VESTIBULAR
            </div>
            <div className="space-y-3">
              {activeGuide.commonMistakes.map((m, idx) => (
                <div key={idx} className="bg-slate-900/90 rounded-lg p-4 border border-rose-900/40 space-y-2">
                  <div className="font-semibold text-white text-sm flex items-center gap-2">
                    <span className="text-xs px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 font-bold">
                      Pegadinha #{idx + 1}
                    </span>
                    {m.title}
                  </div>
                  <div className="text-xs sm:text-sm text-rose-300 flex items-start gap-2 bg-rose-950/40 p-2.5 rounded border border-rose-800/30">
                    <X className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">O Erro: </strong> {m.mistake}
                    </div>
                  </div>
                  <div className="text-xs sm:text-sm text-emerald-300 flex items-start gap-2 bg-emerald-950/40 p-2.5 rounded border border-emerald-800/30">
                    <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <strong className="font-bold">A Correção: </strong> {m.correction}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Solved Sample Question */}
          {activeGuide.sampleQuestion && (
            <div className="bg-slate-900 rounded-xl p-5 sm:p-6 border border-slate-800 space-y-4">
              <div className="flex items-center gap-2 text-amber-300 font-bold text-base">
                <GraduationCap className="w-5 h-5 text-amber-400" />
                EXEMPLO RESOLVIDO PASSO A PASSO
              </div>
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-sm text-slate-200 space-y-3">
                <div className="font-semibold text-white">{activeGuide.sampleQuestion.prompt}</div>
                <div className="space-y-1.5 pt-2 border-t border-slate-800">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                    Passos da Resolução:
                  </span>
                  {activeGuide.sampleQuestion.solutionSteps.map((step, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-slate-300">
                      <span className="text-amber-400 font-bold">{idx + 1}.</span>
                      <span>{step}</span>
                    </div>
                  ))}
                </div>
                <div className="pt-2 flex items-center justify-between text-xs sm:text-sm font-bold text-emerald-400 bg-emerald-950/30 p-2.5 rounded border border-emerald-800/40">
                  <span>Resposta Correta:</span>
                  <span>{activeGuide.sampleQuestion.answer}</span>
                </div>
              </div>
            </div>
          )}

          {/* Interactive Mini-Quiz Section */}
          <div className="bg-gradient-to-br from-indigo-950/50 to-slate-900 rounded-2xl p-5 sm:p-7 border border-indigo-500/40 shadow-xl space-y-5">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-indigo-400" />
                  Testar Meu Conhecimento
                </h3>
                <p className="text-xs sm:text-sm text-slate-300">
                  Mini-quiz rápido de 3 perguntas para fixar a apostila e ganhar +25 XP
                </p>
              </div>
              {!quizActive && !quizFinished && (
                <button
                  onClick={() => setQuizActive(true)}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm shadow-lg shadow-indigo-600/30 transition-all flex items-center gap-2"
                >
                  <Play className="w-4 h-4 fill-white" />
                  Iniciar Quiz
                </button>
              )}
            </div>

            {quizActive && !quizFinished && sampleQuizQuestions.length > 0 && (
              <div className="bg-slate-900/90 rounded-xl p-5 border border-slate-800 space-y-4">
                <div className="flex items-center justify-between text-xs text-slate-400 pb-2 border-b border-slate-800">
                  <span>
                    Pergunta <strong className="text-white">{quizStep + 1}</strong> de{' '}
                    {sampleQuizQuestions.length}
                  </span>
                  <span>Acertos: {quizScore}</span>
                </div>

                <div className="text-sm sm:text-base font-semibold text-white">
                  {sampleQuizQuestions[quizStep].question}
                </div>

                <div className="space-y-2">
                  {sampleQuizQuestions[quizStep].options.map((opt, optIdx) => {
                    const isSelected = quizSelectedOption === `${optIdx}`;
                    const isCorrect = optIdx === sampleQuizQuestions[quizStep].correctIndex;

                    let btnStyle = 'bg-slate-850 hover:bg-slate-800 border-slate-700 text-slate-200';
                    if (quizSubmitted) {
                      if (isCorrect) {
                        btnStyle = 'bg-emerald-950/60 border-emerald-500 text-emerald-200 font-bold';
                      } else if (isSelected) {
                        btnStyle = 'bg-rose-950/60 border-rose-500 text-rose-200';
                      } else {
                        btnStyle = 'bg-slate-900 border-slate-800 text-slate-500 opacity-60';
                      }
                    } else if (isSelected) {
                      btnStyle = 'bg-indigo-600/20 border-indigo-500 text-indigo-200 font-bold';
                    }

                    return (
                      <button
                        key={optIdx}
                        onClick={() => handleQuizSelect(optIdx)}
                        disabled={quizSubmitted}
                        className={`w-full text-left p-3 rounded-lg border text-xs sm:text-sm transition-all flex items-center justify-between ${btnStyle}`}
                      >
                        <span>{opt}</span>
                        {quizSubmitted && isCorrect && <Check className="w-4 h-4 text-emerald-400" />}
                        {quizSubmitted && isSelected && !isCorrect && (
                          <X className="w-4 h-4 text-rose-400" />
                        )}
                      </button>
                    );
                  })}
                </div>

                {quizSubmitted && (
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800 text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-indigo-400">Explicação:</span>
                    <p>{sampleQuizQuestions[quizStep].explanation}</p>
                  </div>
                )}

                <div className="flex justify-end pt-2">
                  {!quizSubmitted ? (
                    <button
                      onClick={handleQuizSubmitAnswer}
                      disabled={quizSelectedOption === null}
                      className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold text-xs"
                    >
                      Confirmar Resposta
                    </button>
                  ) : (
                    <button
                      onClick={handleQuizNext}
                      className="px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center gap-1.5"
                    >
                      {quizStep + 1 < sampleQuizQuestions.length ? 'Próxima Pergunta' : 'Ver Resultado'}
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            )}

            {quizFinished && (
              <div className="bg-slate-900 rounded-xl p-6 border border-emerald-500/40 text-center space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-500/20 text-emerald-400 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h4 className="text-xl font-extrabold text-white">Quiz Concluído!</h4>
                  <p className="text-sm text-slate-300">
                    Você acertou <strong className="text-emerald-400">{quizScore}</strong> de{' '}
                    <strong>{sampleQuizQuestions.length}</strong> perguntas (+25 XP adicionados).
                  </p>
                </div>
                <div className="flex items-center justify-center gap-3 pt-2">
                  <button
                    onClick={() => {
                      setQuizFinished(false);
                      setQuizActive(true);
                      setQuizStep(0);
                      setQuizSelectedOption(null);
                      setQuizSubmitted(false);
                      setQuizScore(0);
                    }}
                    className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 font-bold text-xs flex items-center gap-1.5"
                  >
                    <RotateCcw className="w-4 h-4" />
                    Refazer Quiz
                  </button>
                  <button
                    onClick={() => triggerPractice(activeGuide.subjectId, activeGuide.topicId)}
                    className="px-5 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
                  >
                    <Zap className="w-4 h-4" />
                    Treinar no Modo Infinito
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Action Footer */}
          <div className="pt-4 pb-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-800">
            <button
              onClick={() => setActiveGuide(null)}
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-sm transition-colors text-center"
            >
              ← Voltar à Lista de Apostilas
            </button>
            <button
              onClick={() => triggerPractice(activeGuide.subjectId, activeGuide.topicId)}
              className="w-full sm:w-auto px-6 py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
            >
              <Zap className="w-5 h-5 fill-white" />
              Treinar Este Assunto Agora (Infinito)
            </button>
          </div>
        </main>
      </div>
    );
  }

  // MAIN LIST OF MINI APOSTILAS
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-30 bg-slate-900/90 backdrop-blur border-b border-slate-800 px-4 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <button
              onClick={onBack}
              className="p-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
              title="Voltar ao Hub"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-xl font-extrabold text-white flex items-center gap-2">
                <BookOpen className="w-5 h-5 text-indigo-400" />
                Mini Apostilas & Guias Rápidos
              </h1>
              <p className="text-xs text-slate-400">
                Guias de 2 a 5 minutos focados em conceitos essenciais e pegadinhas de vestibulares
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto p-4 sm:p-6 space-y-6">
        {/* Search and Filters */}
        <div className="space-y-3">
          <div className="relative">
            <Search className="w-5 h-5 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar assunto, fórmula, matéria ou pegadinha (ex: crase, mitocôndria, torricelli)..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          {/* Subject Pills */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none">
            <button
              onClick={() => setSelectedSubject('all')}
              className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                selectedSubject === 'all'
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              Todas as Matérias ({STUDY_GUIDES.length})
            </button>

            {ALL_SUBJECT_IDS.map((sId) => {
              const cfg = SUBJECTS_CONFIG[sId];
              const count = STUDY_GUIDES.filter((g) => g.subjectId === sId).length;
              if (count === 0) return null;
              const isSelected = selectedSubject === sId;

              return (
                <button
                  key={sId}
                  onClick={() => setSelectedSubject(sId)}
                  className={`px-3.5 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                    isSelected
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                      : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border border-slate-800'
                  }`}
                >
                  <span
                    className="w-2 h-2 rounded-full"
                    style={{ backgroundColor: cfg?.color || '#3b82f6' }}
                  />
                  {cfg?.name || sId} ({count})
                </button>
              );
            })}
          </div>
        </div>

        {/* Guides Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
          {filteredGuides.map((guide) => {
            const subjectCfg = SUBJECTS_CONFIG[guide.subjectId];
            const isFav = userState.studyGuidesProgress?.[guide.id]?.isFavorite;
            const progress = userState.studyGuidesProgress?.[guide.id];

            return (
              <div
                key={guide.id}
                onClick={() => handleOpenGuide(guide)}
                className="group bg-slate-900/80 hover:bg-slate-900 rounded-2xl p-5 border border-slate-800 hover:border-indigo-500/50 shadow-lg hover:shadow-indigo-500/10 transition-all cursor-pointer flex flex-col justify-between space-y-4 relative"
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span
                      className="text-xs px-2.5 py-0.5 rounded-md font-bold uppercase"
                      style={{
                        backgroundColor: `${subjectCfg?.color || '#3b82f6'}20`,
                        color: subjectCfg?.color || '#60a5fa',
                      }}
                    >
                      {subjectCfg?.name || guide.subjectId}
                    </span>

                    <div className="flex items-center gap-1.5">
                      <span className="text-xs text-slate-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {guide.estimatedReadMinutes}m
                      </span>
                      <button
                        onClick={(e) => handleToggleFavorite(guide.id, e)}
                        className={`p-1.5 rounded-md hover:bg-slate-800 transition-colors ${
                          isFav ? 'text-amber-400' : 'text-slate-500 hover:text-slate-300'
                        }`}
                        title="Favoritar"
                      >
                        <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400' : ''}`} />
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="font-bold text-white group-hover:text-indigo-300 transition-colors text-base line-clamp-1">
                      {guide.title}
                    </h3>
                    <p className="text-xs text-slate-400 line-clamp-2 mt-1">{guide.subtitle}</p>
                  </div>

                  <div className="flex flex-wrap gap-1.5">
                    {guide.tags.slice(0, 3).map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2 py-0.5 rounded bg-slate-800 text-slate-400 border border-slate-750"
                      >
                        #{tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
                  <span className="text-slate-400">
                    {progress?.reviewCount ? `Lido ${progress.reviewCount}x` : 'Novo'}
                  </span>
                  <span className="text-indigo-400 font-bold flex items-center gap-1 group-hover:translate-x-0.5 transition-transform">
                    Ler Apostila <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            );
          })}
        </div>

        {filteredGuides.length === 0 && (
          <div className="text-center py-12 bg-slate-900/40 rounded-2xl border border-slate-800 space-y-3">
            <BookOpen className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-bold text-slate-300">Nenhuma apostila encontrada</h3>
            <p className="text-xs text-slate-500">
              Tente buscar por termos mais genéricos como "matemática", "biologia" ou "fórmula".
            </p>
          </div>
        )}
      </main>
    </div>
  );
};
