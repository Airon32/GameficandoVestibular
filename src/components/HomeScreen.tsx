import React, { useState } from 'react';
import {
  Play,
  Flame,
  Trophy,
  BarChart2,
  Zap,
  Target,
  Sparkles,
  ChevronRight,
  TrendingUp,
  Shield,
  GraduationCap,
  Layers,
  BookOpen,
  Brain,
  AlertCircle,
  FileCheck2,
} from 'lucide-react';
import { GameMode, UserState, SubjectId, ExamProfile } from '../types';
import { ACHIEVEMENTS_LIST } from '../config/constants';
import { getStreakXpMultiplier } from '../config/xpConfig';
import { RankBadge } from './RankBadge';
import { RankFrame } from './RankFrame';
import { RankProfileTheme } from './RankProfileTheme';
import { RankJourneyModal } from './RankJourneyModal';
import { HubHomeScreen } from './HubHomeScreen';

interface HomeScreenProps {
  userState: UserState;
  onStartTraining: (mode?: GameMode) => void;
  onStartEducationalGame?: (options: {
    subjectId?: SubjectId;
    topicId?: string;
    gameMode: GameMode;
    count?: number;
  }) => void;
  onStartInfiniteTraining?: (options?: { subjectId?: SubjectId; topicId?: string }) => void;
  onOpenStudyGuides?: (guideId?: string) => void;
  onStartSimulado?: (profile: ExamProfile) => void;
  onOpenErrorNotebook?: () => void;
  onOpenSpacedRepetition?: () => void;
  onSelectSubjectDetail?: (subjectId: SubjectId) => void;
  onNavigateTab: (tab: 'game' | 'stats' | 'calendar' | 'achievements') => void;
  onOpenProfile: () => void;
  onOpenRecovery?: () => void;
}

export const HomeScreen: React.FC<HomeScreenProps> = ({
  userState,
  onStartTraining,
  onStartEducationalGame,
  onStartInfiniteTraining,
  onOpenStudyGuides,
  onStartSimulado,
  onOpenErrorNotebook,
  onOpenSpacedRepetition,
  onSelectSubjectDetail,
  onNavigateTab,
  onOpenProfile,
  onOpenRecovery,
}) => {
  const [viewMode, setViewMode] = useState<'hub' | 'math'>('hub');
  const {
    level,
    totalXP,
    currentLevelXP,
    xpForNextLevel,
    levelProgressPercent,
    rank,
    streak,
    stats,
  } = userState;
  const [isJourneyOpen, setIsJourneyOpen] = useState(false);

  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivity = stats.dailyActivity[todayStr];
  const todayQuestions = todayActivity ? todayActivity.correctCount : 0;
  const dailyGoal = userState.settings?.dailyGoal || 10;
  const isDailyGoalDone = todayQuestions >= dailyGoal;
  const dailyPercent = Math.min(100, Math.round((todayQuestions / dailyGoal) * 100));

  // Personal weekly pace, without external comparison.
  const weeklyXP = userState.weeklyXP || 0;

  // Time-based greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Bom dia';
    if (hour < 18) return 'Boa tarde';
    return 'Boa noite';
  };

  // Quick mode definitions
  const trainingModes: {
    id: GameMode;
    title: string;
    description: string;
    icon: React.ReactNode;
    color: string;
    badge?: string;
  }[] = [
    {
      id: 'mixed',
      title: 'Treino Misto',
      description: 'Expressões aritméticas completas com dificuldade adaptativa.',
      icon: <Zap className="w-5 h-5 text-orange-400" />,
      color: 'border-orange-500/40 hover:border-orange-500 bg-orange-950/20 hover:bg-orange-950/30',
      badge: 'Recomendado',
    },
    {
      id: 'addition',
      title: 'Adição',
      description: 'Somas mentais rápidas e sequências numéricas.',
      icon: <span className="text-xl font-black text-emerald-400">+</span>,
      color: 'border-emerald-500/30 hover:border-emerald-500 bg-emerald-950/15 hover:bg-emerald-950/25',
    },
    {
      id: 'subtraction',
      title: 'Subtração',
      description: 'Diferenças e complementos para reflexo ágil.',
      icon: <span className="text-xl font-black text-blue-400">−</span>,
      color: 'border-blue-500/30 hover:border-blue-500 bg-blue-950/15 hover:bg-blue-950/25',
    },
    {
      id: 'multiplication',
      title: 'Multiplicação',
      description: 'Tabuadas e produtos avançados sob pressão.',
      icon: <span className="text-xl font-black text-purple-400">×</span>,
      color: 'border-purple-500/30 hover:border-purple-500 bg-purple-950/15 hover:bg-purple-950/25',
    },
    {
      id: 'division',
      title: 'Divisão',
      description: 'Quocientes exatos e divisibilidade matemática.',
      icon: <span className="text-xl font-black text-amber-400">÷</span>,
      color: 'border-amber-500/30 hover:border-amber-500 bg-amber-950/15 hover:bg-amber-950/25',
    },
    {
      id: 'time_attack',
      title: 'Desafio de Velocidade',
      description: 'Contrarrelógio dinâmico para acelerar o raciocínio sob pressão.',
      icon: <span className="text-base font-black text-rose-400">⚡</span>,
      color: 'border-rose-500/30 hover:border-rose-500 bg-rose-950/15 hover:bg-rose-950/25',
    },
  ];

  return (
    <div className="w-full max-w-full space-y-5 sm:space-y-8 animate-in fade-in duration-300">
      {/* Top View Toggle: Hub Vestibular vs Math Mode */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-2 bg-neutral-900/90 border border-neutral-800 p-1.5 rounded-2xl w-full">
        <div className="grid grid-cols-2 gap-1.5 w-full sm:w-auto sm:flex sm:items-center">
          <button
            onClick={() => setViewMode('hub')}
            className={`px-2.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center truncate ${
              viewMode === 'hub'
                ? 'bg-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <GraduationCap size={15} className="shrink-0" />
            <span className="truncate">Hub de Vestibulares</span>
          </button>

          <button
            onClick={() => setViewMode('math')}
            className={`px-2.5 sm:px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 text-center truncate ${
              viewMode === 'math'
                ? 'bg-amber-500 text-neutral-950 font-black shadow-lg shadow-amber-500/20'
                : 'text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/60'
            }`}
          >
            <Zap size={15} className="shrink-0" />
            <span className="truncate">Agilidade Mental</span>
          </button>
        </div>

        <button
          onClick={() => setIsJourneyOpen(true)}
          className="hidden sm:flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-neutral-950 border border-neutral-800 hover:border-amber-500/40 text-xs font-bold text-amber-300 transition-colors shrink-0"
        >
          <Shield size={14} className="shrink-0" />
          <span>Jornada dos Ranks</span>
        </button>
      </div>

      {/* Render selected view */}
      {viewMode === 'hub' ? (
        <HubHomeScreen
          userState={userState}
          onStartMathGame={() => {
            setViewMode('math');
            onStartTraining('mixed');
          }}
          onStartEducationalGame={onStartEducationalGame || (() => onStartTraining('mixed'))}
          onStartInfiniteTraining={onStartInfiniteTraining || (() => {})}
          onOpenStudyGuides={onOpenStudyGuides || (() => {})}
          onStartSimulado={onStartSimulado || (() => {})}
          onOpenErrorNotebook={onOpenErrorNotebook || (() => {})}
          onOpenSpacedRepetition={onOpenSpacedRepetition || (() => {})}
          onSelectSubjectDetail={onSelectSubjectDetail || (() => {})}
        />
      ) : (
        <div className="space-y-6">
          {/* Quick Recovery helper */}
          {onOpenRecovery && (
            <div className="bg-gradient-to-r from-orange-950/50 via-[#1a1410] to-[#121212] border border-orange-500/40 rounded-2xl p-3.5 px-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-lg shadow-orange-950/20">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-orange-600/30 border border-orange-500/40 flex items-center justify-center text-orange-400 shrink-0">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-xs font-black text-white block">
                    Buscando sua conta anterior com Nível alto & XP?
                  </span>
                  <span className="text-[11px] text-[#aaa]">
                    Restaure e vincule seu progresso em 1 clique.
                  </span>
                </div>
              </div>
              <button
                onClick={onOpenRecovery}
                className="px-3.5 py-1.5 bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs rounded-xl transition cursor-pointer flex items-center justify-center gap-1.5 shrink-0 shadow-md shadow-orange-950/40"
              >
                <span>Recuperar Conta</span>
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}

          {/* 1. Hero Welcome & Main CTA Banner */}
          <RankProfileTheme
            rank={rank}
            className="rounded-3xl border p-6 sm:p-8 shadow-2xl relative"
          >
            <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              {/* User Info & Greeting */}
              <div className="flex items-center gap-4 sm:gap-6">
                <div className="cursor-pointer" onClick={onOpenProfile}>
                  <RankFrame rank={rank} avatarUrl={userState.avatarUrl} size="lg" />
                </div>

                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="text-xs text-[#888] font-bold tracking-wide">
                      {getGreeting()},
                    </span>
                    <RankBadge rank={rank} size="sm" showIcon={false} />
                  </div>

                  <h1
                    onClick={onOpenProfile}
                    className="text-2xl sm:text-3xl font-black text-white tracking-tight cursor-pointer hover:text-orange-400 transition"
                  >
                    {userState.displayName || 'Jogador'}
                  </h1>

                  <div className="flex items-center gap-3 pt-1">
                    <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10 text-xs font-bold text-[#ddd]">
                      <Trophy className="w-3.5 h-3.5 text-amber-400" />
                      <span>Nível {level}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-black/40 px-2.5 py-1 rounded-xl border border-white/10 text-xs font-bold text-orange-400">
                      <Flame className="w-3.5 h-3.5 fill-current" />
                      <span>{streak.currentStreak} dias</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Big Primary Action: Jogar Agora */}
              <div className="w-full lg:w-auto flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
                <button
                  onClick={() => onStartTraining('mixed')}
                  className="px-8 py-4 rounded-2xl bg-gradient-to-r from-orange-500 via-amber-500 to-yellow-500 hover:from-orange-400 hover:to-yellow-400 text-black font-black text-base shadow-xl shadow-orange-500/20 active:scale-95 transition flex items-center justify-center gap-3 cursor-pointer group"
                >
                  <Play className="w-5 h-5 fill-current group-hover:scale-110 transition-transform" />
                  <span>JOGAR TREINO MISTO</span>
                </button>
              </div>
            </div>

            {/* Level XP Progress Bar inside Hero */}
            <div className="mt-6 pt-5 border-t border-white/10 space-y-2">
              <div className="flex justify-between text-xs font-bold">
                <span className="text-[#888]">
                  Progresso do Nível {level} ({currentLevelXP} / {xpForNextLevel} XP)
                </span>
                <span className="text-orange-400">{levelProgressPercent}%</span>
              </div>
              <div className="w-full h-2.5 bg-black/50 rounded-full overflow-hidden border border-white/5">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 via-amber-400 to-yellow-400 rounded-full transition-all duration-500"
                  style={{ width: `${levelProgressPercent}%` }}
                />
              </div>
            </div>
          </RankProfileTheme>

          {/* 2. Personal consistency widgets */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Daily Goal Card */}
            <div className="rounded-3xl bg-[#131313] border border-[#222] p-5 flex items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <Target className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#888]">
                    Meta Diária
                  </span>
                  {isDailyGoalDone && (
                    <span className="text-[10px] bg-emerald-950/80 text-emerald-400 border border-emerald-500/40 px-2 py-0.5 rounded-full font-bold">
                      Concluída!
                    </span>
                  )}
                </div>
                <div className="text-xl font-black text-white">
                  {todayQuestions}{' '}
                  <span className="text-xs font-normal text-[#888]">/ {dailyGoal} acertos</span>
                </div>
                <div className="w-36 h-2 bg-[#222] rounded-full overflow-hidden mt-2">
                  <div
                    className="h-full bg-orange-500 rounded-full transition-all"
                    style={{ width: `${dailyPercent}%` }}
                  />
                </div>
              </div>

              <div className="text-right">
                <span className="text-xs text-[#888] block">Multiplicador</span>
                <span className="text-2xl font-black text-orange-400 font-mono">
                  {(
                    (streak as any)?.streakMultiplier ??
                    userState.streakStats?.currentMultiplier ??
                    getStreakXpMultiplier(userState.combo || userState.streakStats?.currentStreak || streak?.currentStreak || 0)
                  ).toFixed(2)}x
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => onNavigateTab('calendar')}
              className="rounded-3xl bg-[#131313] border border-[#222] hover:border-purple-500/40 p-5 flex items-center justify-between gap-4 cursor-pointer transition group text-left"
            >
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-purple-400" />
                  <span className="text-xs font-bold uppercase tracking-wider text-[#888]">
                    Ritmo Semanal
                  </span>
                </div>
                <div className="text-xl font-black text-white group-hover:text-purple-400 transition">
                  Sua evolução, no seu ritmo
                </div>
                <span className="text-xs text-[#666] block">
                  {weeklyXP.toLocaleString()} XP conquistados nesta semana
                </span>
              </div>

              <div className="w-10 h-10 rounded-2xl bg-purple-950/40 border border-purple-500/30 flex items-center justify-center text-purple-400 group-hover:scale-110 transition">
                <ChevronRight className="w-5 h-5" />
              </div>
            </button>
          </div>

          {/* 3. Training Modes Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold uppercase tracking-wider text-[#888] flex items-center gap-2">
                <Zap className="w-4 h-4 text-orange-400" />
                <span>Treinos por Operação</span>
              </h3>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {trainingModes.map((mode) => (
                <div
                  key={mode.id}
                  onClick={() => onStartTraining(mode.id)}
                  className={`rounded-2xl border p-4 transition-all duration-200 cursor-pointer flex flex-col justify-between gap-3 group ${mode.color}`}
                >
                  <div className="flex items-center justify-between">
                    <div className="w-9 h-9 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-110 transition">
                      {mode.icon}
                    </div>
                    {mode.badge && (
                      <span className="text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full bg-orange-500 text-black">
                        {mode.badge}
                      </span>
                    )}
                  </div>

                  <div>
                    <h4 className="text-sm font-bold text-white group-hover:text-orange-400 transition">
                      {mode.title}
                    </h4>
                    <p className="text-xs text-[#888] mt-0.5 line-clamp-2">{mode.description}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-white/5 text-[11px] font-bold text-[#888] group-hover:text-white transition">
                    <span>Jogar Modo</span>
                    <Play className="w-3.5 h-3.5 fill-current text-orange-500" />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* 4. Quick Stats & Navigation Hub */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <button
              onClick={() => onNavigateTab('stats')}
              className="rounded-2xl bg-[#131313] border border-[#222] hover:border-[#333] p-4 flex flex-col gap-1 text-left transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[#888] group-hover:text-orange-400 transition">
                <span className="text-[10px] uppercase font-bold tracking-wider">Precisão</span>
                <BarChart2 className="w-4 h-4" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
                {stats.accuracyRate}%
              </span>
              <span className="text-[10px] text-[#666]">
                {stats.totalQuestions} questões totais
              </span>
            </button>

            <button
              onClick={() => onNavigateTab('stats')}
              className="rounded-2xl bg-[#131313] border border-[#222] hover:border-[#333] p-4 flex flex-col gap-1 text-left transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[#888] group-hover:text-orange-400 transition">
                <span className="text-[10px] uppercase font-bold tracking-wider">Combo Recorde</span>
                <Zap className="w-4 h-4" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-orange-400 font-mono tabular-nums">
                {userState.maxCombo}x
              </span>
              <span className="text-[10px] text-[#666]">Multiplicador bônus</span>
            </button>

            <button
              onClick={() => onNavigateTab('achievements')}
              className="rounded-2xl bg-[#131313] border border-[#222] hover:border-[#333] p-4 flex flex-col gap-1 text-left transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[#888] group-hover:text-orange-400 transition">
                <span className="text-[10px] uppercase font-bold tracking-wider">Conquistas</span>
                <Trophy className="w-4 h-4" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
                {userState.achievements
                  ? Array.isArray(userState.achievements)
                    ? (userState.achievements as any[]).filter((a) => a?.unlocked).length
                    : Object.keys(userState.achievements).length
                  : 0}{' '}
                / {ACHIEVEMENTS_LIST.length}
              </span>
              <span className="text-[10px] text-[#666]">Troféus desbloqueados</span>
            </button>

            <button
              onClick={() => setIsJourneyOpen(true)}
              className="rounded-2xl bg-[#131313] border border-[#222] hover:border-[#333] p-4 flex flex-col gap-1 text-left transition cursor-pointer group"
            >
              <div className="flex items-center justify-between text-[#888] group-hover:text-orange-400 transition">
                <span className="text-[10px] uppercase font-bold tracking-wider">Ranks Descobertos</span>
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-xl sm:text-2xl font-black text-white font-mono tabular-nums">
                {(userState.highestUnlockedRank ?? rank.tierIndex ?? 0) + 1} / 30
              </span>
              <span className="text-[10px] text-[#666]">Abrir jornada de prestígio</span>
            </button>
          </div>
        </div>
      )}

      {/* Rank Journey Modal */}
      {isJourneyOpen && (
        <RankJourneyModal
          isOpen={isJourneyOpen}
          onClose={() => setIsJourneyOpen(false)}
          userState={userState}
        />
      )}
    </div>
  );
};
