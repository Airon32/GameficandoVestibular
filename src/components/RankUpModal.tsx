import React, { useEffect } from 'react';
import { motion } from 'motion/react';
import confetti from 'canvas-confetti';
import { ArrowUpRight, Award, Sparkles, X, Shield, CheckCircle } from 'lucide-react';
import { UserState } from '../types';
import { getRankVisualConfig, getAscensionVisualConfig } from '../config/rankVisualConfig';
import { RankBadge } from './RankBadge';
import { RankFrame } from './RankFrame';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/90 backdrop-blur-lg animate-in fade-in duration-300 select-none">
      <motion.div
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        className="relative max-w-md w-full rounded-3xl overflow-hidden shadow-2xl border flex flex-col"
        style={{ borderColor: tokens.border }}
      >
        <RankProfileTheme rank={currentRankInfo} className="p-6 sm:p-8 text-center relative overflow-hidden">
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-white rounded-full bg-black/40 border border-white/10 transition cursor-pointer z-20"
          >
            <X className="w-4 h-4" />
          </button>

          {/* Banner Tag */}
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/15 text-[11px] font-mono font-bold tracking-widest uppercase mb-4"
               style={{ color: tokens.textLight }}>
            <Sparkles className="w-3.5 h-3.5" />
            Promoção de Escalão & Prestígio
          </div>

          <h2 className="text-3xl sm:text-4xl font-black text-white tracking-tight mb-4 drop-shadow-md">
            RANK UP!
          </h2>

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
          <div className="my-4 bg-black/50 p-4 rounded-2xl border border-white/10 flex flex-col items-center gap-2">
            <span className="text-[11px] text-slate-400 font-bold uppercase tracking-wider">
              Você evoluiu para:
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
          <div className="bg-black/40 rounded-2xl p-3 border border-white/10 text-left space-y-2 mb-6">
            <div className="text-[11px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Award className="w-3.5 h-3.5 text-amber-400" />
              Recompensas Visuais Desbloqueadas:
            </div>
            <div className="grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{config.rankUnlockedPreview.unlockedBadgeTitle}</span>
              </div>
              <div className="flex items-center gap-1.5 text-slate-200">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="truncate">{config.rankUnlockedPreview.unlockedFrameTitle}</span>
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
            Equipar & Continuar
          </button>
        </RankProfileTheme>
      </motion.div>
    </div>
  );
};
