import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { motion } from 'motion/react';
import { ArrowUpRight, Route, Sparkles, Star, X } from 'lucide-react';
import { UserState } from '../types';
import { RankBadge } from './RankBadge';
import { RankProfileTheme } from './RankProfileTheme';

interface LevelUpModalProps {
  previousLevel: number;
  newLevel: number;
  userState: UserState;
  onClose: () => void;
}

export const LevelUpModal: React.FC<LevelUpModalProps> = ({
  previousLevel,
  newLevel,
  userState,
  onClose,
}) => {
  const config = userState.rank.visualConfig;
  const tokens = config?.rankColorTokens;
  const levelsUntilNextRank = 5 - ((newLevel - 1) % 5);

  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    confetti({
      particleCount: 110,
      spread: 82,
      startVelocity: 48,
      origin: { y: 0.62 },
      colors: tokens ? [tokens.primary, tokens.accent, tokens.textLight, '#FFFFFF'] : undefined,
    });
  }, [tokens]);

  return (
    <div role="dialog" aria-modal="true" aria-label={`Nível ${newLevel} alcançado`} className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 p-3 backdrop-blur-xl">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(249,115,22,0.14),transparent_58%)]" />
      <motion.div initial={{ opacity: 0, scale: 0.88, y: 28 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-md overflow-hidden rounded-[2rem] border shadow-2xl" style={{ borderColor: tokens?.border || '#f97316' }}>
        <RankProfileTheme rank={userState.rank} className="p-6 text-center sm:p-8">
          <button type="button" onClick={onClose} aria-label="Fechar celebração" className="absolute right-4 top-4 z-20 rounded-full border border-white/10 bg-black/35 p-2 text-white/50 transition hover:text-white"><X size={17} /></button>

          <div className="inline-flex items-center gap-1.5 rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[10px] font-black uppercase tracking-[0.2em]" style={{ color: tokens?.textLight || '#fdba74' }}><Sparkles size={13} /> Evolução conquistada</div>
          <h2 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-4xl">VOCÊ ESTÁ MAIS FORTE</h2>
          <p className="mt-1 text-xs text-white/50">Seu esforço virou progresso permanente.</p>

          <div className="relative mx-auto my-6 flex h-44 w-44 items-center justify-center">
            <div className="absolute inset-0 animate-pulse rounded-full blur-3xl opacity-30" style={{ backgroundColor: tokens?.accent || '#f97316' }} />
            <div className="absolute inset-3 rounded-full border border-dashed border-white/20 animate-[spin_14s_linear_infinite]" />
            <RankBadge rank={userState.rank} size="hero" showGlow showDivision />
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
              <span className="text-[9px] font-black uppercase tracking-[0.18em] text-white/50">Nível</span>
              <strong className="text-4xl font-black text-white drop-shadow-xl">{newLevel}</strong>
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-black/40 p-4">
            <div className="flex items-center justify-center gap-3">
              <span className="text-sm font-bold text-white/35">Nível {previousLevel}</span>
              <ArrowUpRight className="text-amber-300" size={20} />
              <span className="text-xl font-black" style={{ color: tokens?.textLight || '#fdba74' }}>Nível {newLevel}</span>
            </div>
            <div className="mt-3 flex items-center justify-center gap-2 border-t border-white/10 pt-3 text-xs font-bold text-white/60"><Star size={14} className="text-amber-300" /> {userState.rank.fullName} permanece gravado no seu perfil</div>
          </div>

          <div className="mt-3 flex items-center justify-center gap-2 rounded-xl border border-purple-400/15 bg-purple-400/10 px-3 py-2.5 text-[11px] font-bold text-purple-200"><Route size={14} /> {levelsUntilNextRank === 1 ? 'O próximo nível revela um novo rank.' : `Faltam ${levelsUntilNextRank} níveis para revelar o próximo rank.`}</div>

          <button type="button" onClick={onClose} className="mt-6 w-full rounded-2xl border py-4 text-sm font-black uppercase tracking-wider text-white shadow-xl transition hover:brightness-110 active:scale-[0.98]" style={{ backgroundColor: tokens?.primary || '#f97316', borderColor: tokens?.accent || '#fb923c', boxShadow: `0 0 24px ${tokens?.glow || 'rgba(249,115,22,.3)'}` }}>Celebrar e continuar</button>
        </RankProfileTheme>
      </motion.div>
    </div>
  );
};
