import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ArrowUpRight, Award, Sparkles, X, CheckCircle } from 'lucide-react';
import { UserState } from '../types';
import { getRankVisualConfig } from '../config/rankVisualConfig';
import { RankBadge } from './RankBadge';
import { RankProfileTheme } from './RankProfileTheme';

interface RankUpModalProps {
  previousRank: string;
  newRank: string;
  userState: UserState;
  onClose: () => void;
}

export const RankUpModal: React.FC<RankUpModalProps> = ({
  previousRank,
  newRank,
  userState,
  onClose,
}) => {
  const currentRankInfo = userState.rank;
  const config = currentRankInfo.visualConfig || getRankVisualConfig(currentRankInfo.tierIndex ?? newRank);
  const tokens = config.rankColorTokens;

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // Grand multi-phase celebration
    const duration = 2.5 * 1000;
    const end = Date.now() + duration;

    const frame = () => {
      confetti({
        particleCount: 4,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
        colors: [tokens.primary, tokens.accent, '#FFFFFF', '#FDE047'],
      });
      confetti({
        particleCount: 4,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
        colors: [tokens.secondary, tokens.accent, '#FFFFFF', '#67E8F9'],
      });

      if (Date.now() < end) {
        requestAnimationFrame(frame);
      }
    };
    frame();
  }, [tokens]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Novo rank conquistado: ${newRank}`} className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300 select-none">
      <div className="absolute left-1/2 top-1/2 h-[34rem] w-[34rem] -translate-x-1/2 -translate-y-1/2 rounded-full blur-[120px] opacity-25" style={{ backgroundColor: tokens.primary }} />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,rgba(0,0,0,0.88)_72%)]" />
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative max-w-lg w-full rounded-[2rem] overflow-hidden shadow-2xl border flex flex-col"
        style={{ borderColor: tokens.border }}
      >
        <RankProfileTheme rank={currentRankInfo} className="p-6 sm:p-8 text-center relative overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            aria-label="Fechar celebração"
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-black/40 border border-white/10 transition cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Banner Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/15 text-[11px] font-mono font-bold tracking-widest uppercase mb-4"
               style={{ color: tokens.textLight }}>
            <Sparkles className="w-3.5 h-3.5" />
            Conquista permanente · Nível {userState.level}
          </div>

          <h2 className="text-3xl sm:text-5xl font-black text-white tracking-tight mb-1 drop-shadow-md">
            UM NOVO RANK É SEU
          </h2>
          <p className="text-xs text-white/55">Pare um instante. Esta conquista nasceu da sua constância.</p>

          {/* Hero Badge Transformation */}
          <div className="relative my-4 flex items-center justify-center">
            <div className="relative">
              <RankBadge
                rank={currentRankInfo}
                division={currentRankInfo.division}
                size="hero"
                showGlow={true}
                showDivision={true}
                animated={true}
              />
            </div>
          </div>

          {/* Transition Box */}
          <div className="my-5 bg-black/50 p-4 rounded-2xl border border-white/10 flex flex-col items-center gap-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Sua jornada agora carrega o título
            </span>
            <div className="flex items-center justify-center gap-2 flex-wrap">
              <span className="text-slate-500 text-sm font-medium line-through">
                {previousRank}
              </span>
              <ArrowUpRight className="w-5 h-5 text-amber-400 stroke-[3]" />
              <span
                className="px-3.5 py-1.5 rounded-xl text-base font-black border shadow-lg"
                style={{
                  backgroundColor: tokens.primary,
                  borderColor: tokens.accent,
                  color: tokens.textLight,
                }}
              >
                {newRank}
              </span>
            </div>
            <p className="text-xs text-slate-300 italic max-w-xs mt-1">
              "{config.rankDescription}"
            </p>
          </div>

          {/* Unlocked Assets Summary */}
          <div className="bg-black/40 rounded-2xl p-4 border border-white/10 text-left space-y-3 mb-6">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              O que esta conquista transforma
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2.5 text-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{config.rankUnlockedPreview.unlockedBadgeTitle}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2.5 text-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{config.rankUnlockedPreview.unlockedFrameTitle}</span>
              </div>
              <div className="flex items-center gap-2 rounded-xl bg-white/5 p-2.5 text-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{config.rankUnlockedPreview.unlockedThemeTitle}</span>
              </div>
            </div>
          </div>

          {/* Claim Button */}
          <button
            onClick={onClose}
            className="w-full py-4 rounded-2xl font-black text-base uppercase tracking-wider shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer border"
            style={{
              backgroundColor: tokens.primary,
              borderColor: tokens.accent,
              color: '#FFFFFF',
              boxShadow: `0 0 20px ${tokens.glow}`,
            }}
          >
            Continuar minha ascensão
          </button>
        </RankProfileTheme>
      </motion.div>
    </div>
  );
};
