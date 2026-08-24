import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { Award, Flame, Infinity as InfinityIcon, Sparkles, Trophy, X, Zap } from 'lucide-react';
import { InfiniteStats, UserState } from '../types';

interface InfiniteCelebrationModalProps {
  userState: UserState;
  infiniteStats: InfiniteStats;
  onClose: () => void;
}

export const InfiniteCelebrationModal: React.FC<InfiniteCelebrationModalProps> = ({
  userState,
  infiniteStats,
  onClose,
}) => {
  useEffect(() => {
    // Grand fireworks celebration
    const duration = 4000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 7,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: ['#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#3B82F6', '#EC4899'],
      });
      confetti({
        particleCount: 7,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: ['#F59E0B', '#EF4444', '#8B5CF6', '#10B981', '#3B82F6', '#EC4899'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/90 backdrop-blur-xl animate-in fade-in duration-300 select-none overflow-y-auto">
      <div className="bg-[#0c0c0e] border-2 border-amber-400/80 rounded-3xl p-6 sm:p-9 max-w-lg w-full shadow-[0_0_80px_rgba(251,191,36,0.3)] text-center relative overflow-hidden my-auto">
        {/* Ambient Glows */}
        <div className="absolute -top-24 -left-24 w-56 h-56 bg-amber-500/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute -bottom-24 -right-24 w-56 h-56 bg-rose-500/25 rounded-full blur-3xl animate-pulse" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-indigo-500/15 rounded-full blur-3xl" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#888] hover:text-white rounded-full bg-[#1a1a1a] transition cursor-pointer z-10"
        >
          <X className="w-4 h-4" />
        </button>

        {/* Grand Crown / Infinite Icon */}
        <div className="w-24 h-24 mx-auto rounded-3xl bg-gradient-to-tr from-amber-500 via-rose-500 to-indigo-600 p-1 shadow-2xl mb-4 relative flex items-center justify-center animate-bounce">
          <div className="w-full h-full bg-[#0c0c0e] rounded-[22px] flex items-center justify-center">
            <InfinityIcon className="w-12 h-12 text-amber-400 stroke-[2.5]" />
          </div>
        </div>

        {/* Milestone Badges */}
        <div className="flex items-center justify-center gap-2 mb-2">
          <span className="px-3 py-0.5 rounded-full text-[10px] font-black tracking-[0.25em] uppercase bg-amber-500/20 text-amber-300 border border-amber-500/40">
            Jornada Principal Concluída
          </span>
          <span className="px-3 py-0.5 rounded-full text-[10px] font-black tracking-[0.25em] uppercase bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
            Ascensão Desbloqueada
          </span>
        </div>

        <h1 className="text-4xl sm:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-amber-300 via-yellow-200 to-amber-500 tracking-tight mb-1">
          INFINITO V
        </h1>
        <p className="text-base font-extrabold text-white/90 font-mono mb-4">
          LEVEL 150 • O ÁPICE DA MAESTRIA MATEMÁTICA
        </p>

        {/* Journey Statistics Overview */}
        <div className="bg-[#141418] border border-[#26262e] rounded-2xl p-4 sm:p-5 mb-5 text-left shadow-inner">
          <div className="flex items-center justify-between border-b border-[#26262e] pb-2 mb-3">
            <span className="text-xs font-bold text-amber-400 uppercase tracking-wider flex items-center gap-1.5">
              <Trophy className="w-4 h-4 text-amber-400" /> Registro da Saga Principal
            </span>
            <span className="text-[11px] font-mono font-bold text-[#888]">
              {new Date(infiniteStats.reachedInfiniteAt).toLocaleDateString('pt-BR')}
            </span>
          </div>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-[#1c1c22] p-2.5 rounded-xl border border-[#2a2a34]">
              <span className="text-[10px] text-[#777] font-semibold block uppercase">Tempo até Infinito</span>
              <span className="text-base font-black text-white font-mono">
                {infiniteStats.daysFromFirstPlay} dias <span className="text-xs text-[#888]">({infiniteStats.activeDaysCount} ativos)</span>
              </span>
            </div>

            <div className="bg-[#1c1c22] p-2.5 rounded-xl border border-[#2a2a34]">
              <span className="text-[10px] text-[#777] font-semibold block uppercase">Horas de Treino</span>
              <span className="text-base font-black text-amber-400 font-mono">
                {(infiniteStats.totalHoursTrained ?? 0).toFixed(1)}h
              </span>
            </div>

            <div className="bg-[#1c1c22] p-2.5 rounded-xl border border-[#2a2a34]">
              <span className="text-[10px] text-[#777] font-semibold block uppercase">Questões Resolvidas</span>
              <span className="text-base font-black text-emerald-400 font-mono">
                {infiniteStats.totalQuestionsSolved.toLocaleString()}
              </span>
            </div>

            <div className="bg-[#1c1c22] p-2.5 rounded-xl border border-[#2a2a34]">
              <span className="text-[10px] text-[#777] font-semibold block uppercase">Precisão & Maior Streak</span>
              <span className="text-base font-black text-orange-400 font-mono">
                {infiniteStats.averageAccuracy}% • 🔥 {infiniteStats.maxStreak}
              </span>
            </div>
          </div>

          <div className="mt-3 pt-3 border-t border-[#26262e] flex items-center justify-between text-xs font-mono">
            <span className="text-[#888]">XP Total Acumulado:</span>
            <span className="font-black text-amber-300">
              {infiniteStats.totalXPEarned.toLocaleString()} XP
            </span>
          </div>
        </div>

        <p className="text-xs text-[#999] mb-5 leading-relaxed">
          Você superou todas as 30 ligas competitivas e consolidou seu nome entre a elite suprema. A partir de agora, cada novo nível avança o sistema de <strong className="text-white">Ascensão Infinita</strong>.
        </p>

        <button
          onClick={onClose}
          className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-500 text-black font-black text-base uppercase tracking-wider shadow-lg shadow-amber-950/60 hover:brightness-110 active:scale-[0.98] transition cursor-pointer"
        >
          Ascender para o Infinito
        </button>
      </div>
    </div>
  );
};
