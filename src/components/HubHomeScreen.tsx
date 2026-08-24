import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  UserState,
  SubjectId,
  SubjectCategory,
  SubjectMastery,
  ExamProfile,
  GameMode,
} from '../types';
import {
  SUBJECTS_CONFIG,
  ALL_SUBJECT_IDS,
  SUBJECT_CATEGORIES,
  SubjectDefinition,
  getSubjectsByCategory,
} from '../config/subjectsConfig';
import { EXAM_PROFILES } from '../config/examProfilesConfig';
import { StudyRecommendationEngine } from '../engines/StudyRecommendationEngine';
import { ErrorNotebookEngine } from '../engines/ErrorNotebookEngine';
import { SpacedRepetitionEngine } from '../engines/SpacedRepetitionEngine';
import { STUDY_GUIDES } from '../data/studyGuidesData';
import {
  Flame,
  Zap,
  BookOpen,
  Award,
  Clock,
  Target,
  ArrowRight,
  Sparkles,
  AlertCircle,
  Brain,
  Layers,
  ChevronRight,
  TrendingUp,
  RotateCcw,
  GraduationCap,
  Play,
  FileCheck2,
  Infinity,
  BookmarkCheck,
} from 'lucide-react';

interface HubHomeScreenProps {
  userState: UserState;
  onStartMathGame: () => void;
  onStartEducationalGame: (options: {
    subjectId?: SubjectId;
    topicId?: string;
    gameMode: GameMode;
    count?: number;
  }) => void;
  onStartInfiniteTraining: (options?: { subjectId?: SubjectId; topicId?: string }) => void;
  onOpenStudyGuides: (guideId?: string) => void;
  onStartSimulado: (profile: ExamProfile) => void;
  onOpenErrorNotebook: () => void;
  onOpenSpacedRepetition: () => void;
  onSelectSubjectDetail: (subjectId: SubjectId) => void;
}

export const HubHomeScreen: React.FC<HubHomeScreenProps> = ({
  userState,
  onStartMathGame,
  onStartEducationalGame,
  onStartInfiniteTraining,
  onOpenStudyGuides,
  onStartSimulado,
  onOpenErrorNotebook,
  onOpenSpacedRepetition,
  onSelectSubjectDetail,
}) => {
  const [selectedCategory, setSelectedCategory] = useState<SubjectCategory | 'todas'>('todas');
  const [selectedExamId, setSelectedExamId] = useState<string>(
    userState.targetExamGoal?.targetExam || 'FATEC'
  );

  const recommendations = StudyRecommendationEngine.generateRecommendations(userState);
  const errorStats = ErrorNotebookEngine.getStats(userState);
  const srsStats = SpacedRepetitionEngine.getStats(userState);

  const activeSubjects = (
    selectedCategory === 'todas'
      ? ALL_SUBJECT_IDS.map((id) => SUBJECTS_CONFIG[id])
      : getSubjectsByCategory(selectedCategory)
  ).filter((s): s is SubjectDefinition => Boolean(s && s.id));

  // Overall Mastery Calculation
  const subjectsMap: Record<string, SubjectMastery> =
    (userState.subjectsMastery as Record<string, SubjectMastery>) || {};
  const subjectValues: SubjectMastery[] = Object.values(subjectsMap);
  const overallMastery =
    subjectValues.length > 0
      ? Math.round(
          subjectValues.reduce(
            (acc: number, s: SubjectMastery) => acc + (s.masteryPercent || 0),
            0
          ) / ALL_SUBJECT_IDS.length
        )
      : 0;

  const currentExamProfile = EXAM_PROFILES[selectedExamId] || EXAM_PROFILES.FATEC;
  const lifetimeQuestions = userState.stats?.lifetimeQuestionsCount || userState.stats?.totalQuestions || 0;

  return (
    <div className="w-full max-w-full p-0 text-neutral-100 space-y-5 sm:space-y-8">
      {/* ========================================================
          1. HERO HUB BANNER: PROGRESSO & TREINO INFINITO
         ======================================================== */}
      <div className="relative overflow-hidden bg-gradient-to-br from-indigo-950/40 via-neutral-900 to-neutral-950 border border-indigo-500/20 rounded-2xl sm:rounded-3xl p-3.5 sm:p-7 shadow-2xl w-full">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-4 sm:gap-6 w-full min-w-0">
          <div className="space-y-2.5 sm:space-y-3 max-w-2xl min-w-0">
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-indigo-500/10 border border-indigo-500/30 text-indigo-400 flex items-center gap-1.5">
                <Infinity size={14} /> Arquitetura de Treino Infinito
              </span>
              <span className="px-2.5 py-1 rounded-xl text-[11px] sm:text-xs font-bold bg-amber-500/10 border border-amber-500/30 text-amber-400">
                Foco: {currentExamProfile.shortName}
              </span>
            </div>

            <h1 className="text-xl sm:text-3xl lg:text-4xl font-black text-white tracking-tight leading-tight break-words">
              Sempre existe mais uma questão para treinar e evoluir.
            </h1>

            <p className="text-xs sm:text-sm text-neutral-300 leading-relaxed break-words">
              Treino contínuo híbrido (curadas + templates combinatórios validados) em 15 disciplinas com
              XP por dificuldade (10 a 50 XP), streaks progressivos e mini apostilas integradas.
            </p>

            {/* Quick Action Button */}
            <div className="pt-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-2 sm:gap-3 w-full sm:w-auto">
              <button
                onClick={() => onStartInfiniteTraining()}
                className="w-full sm:w-auto px-4 sm:px-5 py-3 sm:py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-indigo-600/30 transition-all flex items-center justify-center gap-2"
              >
                <Zap size={16} className="fill-white shrink-0" />
                <span>Iniciar Treino Infinito Geral</span>
              </button>
              <button
                onClick={() => onOpenStudyGuides()}
                className="w-full sm:w-auto px-4 py-3 sm:py-2.5 rounded-xl bg-neutral-800/80 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-bold text-xs sm:text-sm transition-colors flex items-center justify-center gap-1.5"
              >
                <BookOpen size={16} className="text-indigo-400 shrink-0" />
                <span>Ver Mini Apostilas ({STUDY_GUIDES.length})</span>
              </button>
            </div>
          </div>

          {/* Quick Metrics Pillar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-2 gap-2 sm:gap-3 w-full lg:w-auto min-w-0">
            <div className="p-3 sm:p-3.5 bg-neutral-950/80 border border-neutral-800/80 rounded-xl sm:rounded-2xl">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
                <span>Domínio Geral</span>
                <TrendingUp size={14} className="text-amber-400 shrink-0" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-white mt-1">{overallMastery}%</div>
              <div className="w-full h-1.5 bg-neutral-800 rounded-full mt-2 overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                  style={{ width: `${overallMastery}%` }}
                />
              </div>
            </div>

            <div className="p-3 sm:p-3.5 bg-neutral-950/80 border border-neutral-800/80 rounded-xl sm:rounded-2xl">
              <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
                <span>Ofensiva</span>
                <Flame size={14} className="text-orange-400 fill-orange-400 shrink-0" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-orange-400 mt-1">
                {userState.streak?.currentStreak || 0} dias
              </div>
              <span className="text-[10px] sm:text-xs text-neutral-500 block mt-0.5 sm:mt-1 truncate">
                Multiplicador ativo
              </span>
            </div>

            <div
              onClick={onOpenErrorNotebook}
              className="p-3 sm:p-3.5 bg-neutral-950/80 border border-neutral-800/80 hover:border-rose-500/50 rounded-xl sm:rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
                <span className="truncate">Caderno de Erros</span>
                <AlertCircle size={14} className="text-rose-400 shrink-0" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-rose-400 mt-1">
                {errorStats.pendingCount}
              </div>
              <span className="text-[10px] sm:text-xs text-neutral-500 block mt-0.5 sm:mt-1 truncate">
                Pendentes de revisão
              </span>
            </div>

            <div
              onClick={onOpenSpacedRepetition}
              className="p-3 sm:p-3.5 bg-neutral-950/80 border border-neutral-800/80 hover:border-blue-500/50 rounded-xl sm:rounded-2xl cursor-pointer transition-colors"
            >
              <div className="flex items-center justify-between text-neutral-400 text-xs font-medium">
                <span className="truncate">Revisar Hoje</span>
                <Clock size={14} className="text-blue-400 shrink-0" />
              </div>
              <div className="text-xl sm:text-2xl font-black text-blue-400 mt-1">
                {srsStats.dueTodayCount}
              </div>
              <span className="text-[10px] sm:text-xs text-neutral-500 block mt-0.5 sm:mt-1 truncate">
                Repetição espaçada
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          2. QUICK LAUNCH ACTIONS (MODOS DE TREINAMENTO)
         ======================================================== */}
      <div className="space-y-4">
        <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
          <Zap size={20} className="text-indigo-400" />
          Treinos Rápidos & Modos de Estudo
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Card 1: Treino Infinito Contínuo */}
          <div
            onClick={() => onStartInfiniteTraining()}
            className="group p-5 bg-gradient-to-br from-indigo-950/40 via-neutral-900 to-neutral-900 border border-indigo-500/30 hover:border-indigo-500/60 rounded-3xl cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-lg shadow-indigo-500/10 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center text-indigo-400 mb-4 group-hover:scale-110 transition-transform">
                <Infinity size={24} />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white group-hover:text-indigo-300 transition-colors">
                  Treino Infinito
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-extrabold uppercase">
                  Novo
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Fluxo contínuo sem limites com preloading instantâneo, bônus de velocidade e pausa livre.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-indigo-400 mt-6 pt-3 border-t border-neutral-800/80">
              <span>Treinar Sem Parar</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 2: Mini Apostilas & Guias Rápidos */}
          <div
            onClick={() => onOpenStudyGuides()}
            className="group p-5 bg-gradient-to-br from-emerald-950/30 via-neutral-900 to-neutral-900 border border-emerald-500/20 hover:border-emerald-500/50 rounded-3xl cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-lg shadow-emerald-500/5 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400 mb-4 group-hover:scale-110 transition-transform">
                <BookOpen size={24} />
              </div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                  Mini Apostilas
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold uppercase">
                  2-5 min
                </span>
              </div>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Guias rápidos com o conceito essencial, passos de resolução, fórmulas e pegadinhas.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-emerald-400 mt-6 pt-3 border-t border-neutral-800/80">
              <span>Ler e Testar Quiz</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 3: Cálculo Rápido (Math Game) */}
          <div
            onClick={onStartMathGame}
            className="group p-5 bg-gradient-to-br from-amber-950/30 via-neutral-900 to-neutral-900 border border-amber-500/20 hover:border-amber-500/50 rounded-3xl cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-lg shadow-amber-500/5 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 mb-4 group-hover:scale-110 transition-transform">
                <Zap size={24} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors">
                Cálculo Rápido
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                Treine agilidade matemática, operações aritméticas e reflexos sob pressão de tempo.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-amber-400 mt-6 pt-3 border-t border-neutral-800/80">
              <span>Jogar Modo Clássico</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>

          {/* Card 4: Simulado Oficial Completo */}
          <div
            onClick={() => onStartSimulado(currentExamProfile)}
            className="group p-5 bg-gradient-to-br from-blue-950/30 via-neutral-900 to-neutral-900 border border-blue-500/20 hover:border-blue-500/50 rounded-3xl cursor-pointer transition-all duration-200 hover:-translate-y-1 shadow-lg shadow-blue-500/5 flex flex-col justify-between"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-blue-500/10 border border-blue-500/30 flex items-center justify-center text-blue-400 mb-4 group-hover:scale-110 transition-transform">
                <FileCheck2 size={24} />
              </div>
              <h3 className="text-lg font-bold text-white group-hover:text-blue-400 transition-colors">
                Simulado {currentExamProfile.shortName}
              </h3>
              <p className="text-xs text-neutral-400 mt-1 leading-relaxed">
                {currentExamProfile.totalQuestions} questões cronometradas com diagnóstico oficial de notas e pesos.
              </p>
            </div>

            <div className="flex items-center justify-between text-xs font-bold text-blue-400 mt-6 pt-3 border-t border-neutral-800/80">
              <span>Começar Prova</span>
              <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </div>
        </div>
      </div>

      {/* ========================================================
          3. STUDY RECOMMENDATIONS ("VOCÊ PRECISA MELHORAR")
         ======================================================== */}
      {recommendations.length > 0 && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Sparkles size={20} className="text-amber-400" />
              Recomendações Personalizadas
            </h2>
            <span className="text-xs text-neutral-400">Baseado no seu histórico de acertos</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {recommendations.map((rec) => {
              if (!rec || !rec.id) return null;
              const subDef = SUBJECTS_CONFIG[rec.subjectId];
              return (
                <div
                  key={rec.id}
                  className="p-4 bg-neutral-900/90 border border-neutral-800 rounded-2xl flex flex-col justify-between gap-3 hover:border-neutral-700 transition-colors"
                >
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      {subDef && (
                        <span
                          className={`text-xs px-2 py-0.5 rounded-lg font-bold border ${subDef.badgeBg} ${subDef.badgeBorder} ${subDef.badgeText}`}
                        >
                          {subDef.name}
                        </span>
                      )}
                      {rec.masteryPercent !== undefined && (
                        <span className="text-xs font-bold text-rose-400">
                          {rec.masteryPercent}% domínio
                        </span>
                      )}
                    </div>
                    <h4 className="text-sm font-bold text-neutral-100">{rec.title}</h4>
                    <p className="text-xs text-neutral-400 leading-relaxed">{rec.subtitle}</p>
                  </div>

                  <div className="flex items-center gap-2 pt-1">
                    <button
                      onClick={() => {
                        if (rec.gameMode === 'recuperacao') {
                          onOpenErrorNotebook();
                        } else {
                          onStartInfiniteTraining({
                            subjectId: rec.subjectId,
                            topicId: rec.topicId,
                          });
                        }
                      }}
                      className="flex-1 py-2.5 rounded-xl bg-indigo-600/90 hover:bg-indigo-600 text-xs font-bold text-white transition-colors flex items-center justify-center gap-1.5 shadow-md shadow-indigo-600/20"
                    >
                      <Zap size={14} />
                      <span>{rec.actionLabel}</span>
                    </button>

                    <button
                      onClick={() => onOpenStudyGuides(rec.topicId)}
                      className="p-2.5 rounded-xl bg-neutral-800 hover:bg-neutral-750 text-neutral-300 text-xs font-bold"
                      title="Ver Mini Apostila deste assunto"
                    >
                      <BookOpen size={14} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ========================================================
          4. ALL SUBJECTS TAXONOMY GRID (15 DISCIPLINAS)
         ======================================================== */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg sm:text-xl font-bold text-white flex items-center gap-2">
              <Layers size={20} className="text-amber-400" />
              Disciplinas do Vestibular
            </h2>
            <p className="text-xs text-neutral-400">
              Escolha qualquer matéria para treinar infinitamente ou ver o mapa de tópicos
            </p>
          </div>

          {/* Category Filter Chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            <button
              onClick={() => setSelectedCategory('todas')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                selectedCategory === 'todas'
                  ? 'bg-amber-500 text-neutral-950 font-black shadow-md shadow-amber-500/20'
                  : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
              }`}
            >
              Todas (15)
            </button>
            {SUBJECT_CATEGORIES.filter((c) => c && c.id !== 'all').map((cat) => (
              <button
                key={cat.id}
                onClick={() => setSelectedCategory(cat.id as SubjectCategory)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors ${
                  selectedCategory === cat.id
                    ? 'bg-amber-500 text-neutral-950 font-black shadow-md shadow-amber-500/20'
                    : 'bg-neutral-900 border border-neutral-800 text-neutral-400 hover:text-neutral-200'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Disciplines Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5">
          {activeSubjects.map((sub) => {
            if (!sub || !sub.id) return null;
            const masteryData = subjectsMap[sub.id];
            const masteryPercent = masteryData ? masteryData.masteryPercent : 0;
            const skillLevel = masteryData ? masteryData.skillLevel : 1;

            return (
              <div
                key={sub.id}
                className="group p-4 bg-neutral-900/80 border border-neutral-800/90 hover:border-neutral-700 rounded-2xl transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between gap-3 shadow-lg"
              >
                <div
                  onClick={() => onSelectSubjectDetail(sub.id)}
                  className="space-y-2 cursor-pointer"
                >
                  <div className="flex items-center justify-between">
                    <span
                      className={`text-xs px-2.5 py-0.5 rounded-lg font-bold border ${sub.badgeBg} ${sub.badgeBorder} ${sub.badgeText}`}
                    >
                      {sub.name}
                    </span>
                    <span className="text-xs text-neutral-400 font-medium">Nível {skillLevel}</span>
                  </div>

                  <p className="text-xs text-neutral-400 line-clamp-2 leading-relaxed">
                    {sub.description}
                  </p>
                </div>

                <div className="space-y-2 pt-2 border-t border-neutral-800/60">
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-neutral-400">{sub.topics.length} tópicos</span>
                    <span className="font-bold text-neutral-200">{masteryPercent}% domínio</span>
                  </div>

                  <div className="w-full h-1.5 bg-neutral-800 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-amber-500 to-orange-500 rounded-full"
                      style={{ width: `${masteryPercent}%` }}
                    />
                  </div>

                  {/* Direct Actions in Card */}
                  <div className="pt-1 flex items-center gap-2">
                    <button
                      onClick={() => onStartInfiniteTraining({ subjectId: sub.id })}
                      className="flex-1 py-1.5 rounded-lg bg-indigo-600/80 hover:bg-indigo-600 text-white font-bold text-xs flex items-center justify-center gap-1 transition-colors"
                      title={`Iniciar Treino Infinito em ${sub.name}`}
                    >
                      <Zap size={13} />
                      Treinar Agora
                    </button>
                    <button
                      onClick={() => onSelectSubjectDetail(sub.id)}
                      className="px-2.5 py-1.5 rounded-lg bg-neutral-800 hover:bg-neutral-750 text-neutral-300 font-bold text-xs transition-colors"
                      title="Ver todos os tópicos"
                    >
                      Tópicos
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
