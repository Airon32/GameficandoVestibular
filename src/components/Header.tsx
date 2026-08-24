import React from 'react';
import {
  Home,
  BarChart2,
  Calendar,
  Play,
  Settings,
  Smartphone,
  Sparkles,
  Trophy,
  LogIn,
} from 'lucide-react';
import { UserState } from '../types';
import { RankBadge } from './RankBadge';
import { RankFrame } from './RankFrame';

interface HeaderProps {
  userState: UserState;
  activeTab: 'home' | 'game' | 'stats' | 'calendar' | 'achievements';
  onSelectTab: (tab: 'home' | 'game' | 'stats' | 'calendar' | 'achievements') => void;
  onOpenSettings: () => void;
  onOpenProfile: () => void;
  onOpenAndroidInstall: () => void;
  onOpenAuth: () => void;
  isLoggedIn?: boolean;
  onOpenRecovery?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  userState,
  activeTab,
  onSelectTab,
  onOpenSettings,
  onOpenProfile,
  onOpenAndroidInstall,
  onOpenAuth,
  isLoggedIn = false,
  onOpenRecovery,
}) => {
  const { level, currentLevelXP, xpForNextLevel, levelProgressPercent, rank, streak } = userState;
  const todayStr = new Date().toISOString().split('T')[0];
  const todayActivity = userState.stats.dailyActivity[todayStr];
  const todayCount = todayActivity ? todayActivity.correctCount : 0;
  const dailyGoal = userState.settings?.dailyGoal || 10;
  const isGoalDone = todayCount >= dailyGoal;

  return (
    <header className="w-full bg-[#111] border-b border-[#222] sticky top-0 z-30 px-2.5 sm:px-6 lg:px-8 py-2.5 transition-colors select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-2.5 sm:gap-4">
        {/* Left: User Identity, Rank & Level */}
        <div className="flex items-center justify-between w-full md:w-auto gap-2 sm:gap-4">
          <button
            onClick={onOpenProfile}
            className="flex items-center gap-2 sm:gap-3 text-left group hover:opacity-90 transition cursor-pointer min-w-0"
            title="Abrir meu perfil e jornada de ranks"
          >
            <div className="relative shrink-0">
              <RankFrame rank={rank} size="sm">
                <div className="w-full h-full bg-[#1a1a1a] flex items-center justify-center text-lg">
                  {userState.avatar || '🦊'}
                </div>
              </RankFrame>
              {isLoggedIn && (
                <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 border-2 border-[#111] absolute -bottom-0.5 -right-0.5 z-20" />
              )}
            </div>
            <div className="flex flex-col min-w-0">
              <span className="text-[10px] uppercase tracking-[0.16em] text-[#999] font-bold truncate max-w-[100px] xs:max-w-[130px] sm:max-w-[160px]">
                {userState.displayName || userState.name || 'Matemático'}
              </span>
              <div className="flex items-center gap-1 min-w-0">
                <RankBadge rank={rank} division={rank.division} size="xs" showGlow={false} />
                <span className="text-xs sm:text-base font-black text-[#f97316] tracking-tight truncate max-w-[95px] xs:max-w-[120px] sm:max-w-[150px]">
                  {rank.fullName}
                </span>
              </div>
            </div>
          </button>

          <div className="h-7 w-[1px] bg-[#333] mx-0.5 hidden sm:block" />

          {/* Level & XP Meter */}
          <div className="flex flex-col shrink-0 items-end sm:items-start">
            <div className="flex items-center justify-between gap-1.5">
              <span className="text-[9px] sm:text-[10px] uppercase tracking-[0.18em] text-[#888] font-semibold">
                Nível {level}
              </span>
              <span className="text-[9px] sm:text-[10px] font-mono text-[#888] tabular-nums hidden sm:inline">
                {currentLevelXP} / {xpForNextLevel} XP
              </span>
            </div>
            <div className="w-20 sm:w-32 h-1.5 bg-[#222] rounded-full overflow-hidden mt-0.5 border border-[#333]/50">
              <div
                className="h-full bg-[#f97316] transition-all duration-300 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                style={{ width: `${Math.max(4, levelProgressPercent)}%` }}
              />
            </div>
          </div>
        </div>

        {/* Center: Brand Typography */}
        <button
          onClick={() => onSelectTab('home')}
          className="hidden xl:flex items-center gap-2 group cursor-pointer hover:opacity-90 transition"
          title="Ir para a Tela Inicial"
        >
          <span className="text-xl font-black tracking-tighter text-white group-hover:text-orange-400 transition">
            NUMERIS
          </span>
          <span className="text-[10px] font-bold uppercase tracking-[0.25em] text-[#f97316] bg-orange-950/40 px-2 py-0.5 rounded border border-orange-500/30">
            JORNADA SOLO
          </span>
        </button>

        {/* Right: Streak, Tabs, Notifications, Actions */}
        <div className="flex items-center justify-between w-full md:w-auto gap-1 sm:gap-2.5 overflow-x-auto no-scrollbar py-0.5 max-w-full">
          {/* Daily Streak */}
          <button
            onClick={() => onSelectTab('calendar')}
            className="flex flex-col items-end px-1.5 sm:px-3 py-1 sm:py-1.5 rounded-xl bg-[#1a1a1a] border border-[#222] hover:border-[#333] transition cursor-pointer shrink-0"
            title={`Streak: ${streak?.currentStreak || 0} dias. Meta: ${todayCount}/${dailyGoal} hoje.`}
          >
            <span className="text-[8px] sm:text-[9px] uppercase tracking-[0.18em] text-[#888] font-semibold">
              Streak
            </span>
            <div className="flex items-center gap-1">
              <span className="text-xs sm:text-sm font-bold text-white font-mono tabular-nums">
                {streak?.currentStreak || 0}D
              </span>
              <div className={`w-1.5 sm:w-2 h-1.5 sm:h-2 rounded-full ${isGoalDone ? 'bg-orange-500 animate-pulse' : 'bg-[#555]'}`} />
            </div>
          </button>

          {/* Navigation Tabs */}
          <div className="flex items-center bg-[#0d0d0d] p-0.5 sm:p-1 rounded-xl border border-[#222] shrink-0 gap-0.5">
            <button
              onClick={() => onSelectTab('home')}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                activeTab === 'home'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-900/30'
                  : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
              }`}
              title="Tela Inicial"
            >
              <Home className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Início</span>
            </button>

            <button
              onClick={() => onSelectTab('game')}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                activeTab === 'game'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-900/30'
                  : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
              }`}
              title="Treino Matemático"
            >
              <Play className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Treino</span>
            </button>

            <button
              onClick={() => onSelectTab('stats')}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                activeTab === 'stats'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-900/30'
                  : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
              }`}
              title="Estatísticas"
            >
              <BarChart2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Stats</span>
            </button>

            <button
              onClick={() => onSelectTab('achievements')}
              className={`p-1.5 sm:px-3 sm:py-1.5 rounded-lg text-xs font-bold uppercase tracking-wider flex items-center gap-1 transition cursor-pointer ${
                activeTab === 'achievements'
                  ? 'bg-orange-600 text-white shadow-md shadow-orange-900/30'
                  : 'text-[#888] hover:text-white hover:bg-[#1a1a1a]'
              }`}
              title="Conquistas"
            >
              <Trophy className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Troféus</span>
            </button>
          </div>

          {/* Account and local app actions */}
          <div className="flex items-center gap-0.5 sm:gap-1.5 shrink-0">

            {!isLoggedIn && (
              <button
                onClick={onOpenAuth}
                className="bg-orange-600 hover:bg-orange-500 text-white p-1.5 sm:px-2.5 sm:py-1.5 rounded-lg text-xs font-bold transition flex items-center gap-1 cursor-pointer shadow-md shadow-orange-950/40"
                title="Entrar ou Cadastrar"
              >
                <LogIn className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                <span className="hidden sm:inline">Entrar</span>
              </button>
            )}

            {onOpenRecovery && (
              <button
                onClick={onOpenRecovery}
                className="bg-[#222] p-1.5 sm:p-2 rounded-lg cursor-pointer hover:bg-[#333] text-orange-400 hover:text-orange-300 transition"
                title="Recuperar Conta & Progresso Original"
              >
                <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
              </button>
            )}

            <button
              onClick={onOpenAndroidInstall}
              className="bg-[#222] p-1.5 sm:p-2 rounded-lg cursor-pointer hover:bg-[#333] text-emerald-400 hover:text-emerald-300 transition flex items-center gap-1"
              title="Instalar no Android (App / APK)"
            >
              <Smartphone className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>

            <button
              onClick={onOpenSettings}
              className="bg-[#222] p-1.5 sm:p-2 rounded-lg cursor-pointer hover:bg-[#333] text-[#888] hover:text-white transition"
              title="Configurações"
            >
              <Settings className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
