import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Sparkles, Shield, ChevronRight, Lock, CheckCircle2, Award, Info } from 'lucide-react';
import { RankVisualConfig, UserState } from '../types';
import { RANK_VISUAL_CONFIGS } from '../config/rankVisualConfig';
import { RankBadge } from './RankBadge';
import { RankFrame } from './RankFrame';
import { RankProfileTheme } from './RankProfileTheme';

interface RankJourneyModalProps {
  isOpen: boolean;
  onClose: () => void;
  userState: UserState;
}

export const RankJourneyModal: React.FC<RankJourneyModalProps> = ({
  isOpen,
  onClose,
  userState,
}) => {
  const currentTierIndex = userState.rank.tierIndex ?? 0;
  const currentDivision = userState.rank.division ?? 1;
  const highestUnlocked = Math.max(currentTierIndex, userState.highestUnlockedRank ?? currentTierIndex);

  const [selectedRankIndex, setSelectedRankIndex] = useState<number>(currentTierIndex);
  const [selectedDivision, setSelectedDivision] = useState<number>(currentDivision);

  const selectedConfig: RankVisualConfig = useMemo(() => {
    return RANK_VISUAL_CONFIGS[selectedRankIndex] || RANK_VISUAL_CONFIGS[0];
  }, [selectedRankIndex]);

  const isSelectedUnlocked = selectedRankIndex <= highestUnlocked;
  const isSelectedCurrent = selectedRankIndex === currentTierIndex;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-black/80 backdrop-blur-md overflow-hidden">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="relative w-full max-w-5xl h-[92vh] max-h-[850px] bg-[#0d1117] border border-slate-800 rounded-2xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        >
          {/* Header */}
          <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800/80 bg-slate-900/50">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                <Shield className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                  Atlas da Ascensão
                  <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-400">
                    30 mundos visuais
                  </span>
                </h2>
                <p className="text-xs text-slate-400">
                  Cada rank é uma lembrança permanente do quanto você evoluiu
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              aria-label="Fechar atlas de ranks"
              className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Main Content Layout */}
          <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
            {/* Left Sidebar: 30 Ranks Scrollable List */}
            <div className="h-[34vh] w-full shrink-0 border-r border-slate-800/80 bg-slate-950/40 flex flex-col overflow-hidden md:h-auto md:w-72">
              <div className="p-3 border-b border-slate-800/60 text-xs font-semibold text-slate-400 uppercase tracking-wider flex justify-between">
                <span>Constelação de Ranks</span>
                <span className="text-amber-400">{highestUnlocked + 1}/30 descobertos</span>
              </div>

              <div className="flex-1 overflow-y-auto p-2 space-y-1.5 scrollbar-thin">
                {RANK_VISUAL_CONFIGS.map((config, idx) => {
                  const isUnlocked = idx <= highestUnlocked;
                  const isCurrent = idx === currentTierIndex;
                  const isSelected = idx === selectedRankIndex;

                  return (
                    <button
                      key={config.rankId}
                      onClick={() => {
                        setSelectedRankIndex(idx);
                        setSelectedDivision(isCurrent ? currentDivision : 1);
                      }}
                      className={`w-full flex items-center justify-between p-2 rounded-xl transition-all border text-left ${
                        isSelected
                          ? 'bg-slate-800/90 border-amber-500/50 shadow-md shadow-amber-500/5'
                          : isCurrent
                          ? 'bg-slate-900/60 border-indigo-500/40 hover:bg-slate-800/50'
                          : isUnlocked
                          ? 'bg-slate-900/30 border-slate-800/60 hover:bg-slate-800/30'
                          : 'bg-slate-950/30 border-slate-900/80 opacity-60 hover:opacity-80'
                      }`}
                    >
                      <div className="flex items-center gap-2.5">
                        <RankBadge
                          rank={idx}
                          division={1}
                          size="sm"
                          isLocked={!isUnlocked}
                          showGlow={isSelected}
                          animated={false}
                        />
                        <div>
                          <div className="flex items-center gap-1.5">
                            <span className={`text-xs font-bold ${isSelected ? 'text-white' : 'text-slate-200'}`}>
                              {config.rankName}
                            </span>
                            {isCurrent && (
                              <span className="text-[9px] px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 font-mono">
                                ATUAL
                              </span>
                            )}
                          </div>
                          <span className="text-[10px] text-slate-400">
                            {config.rankRarity}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center">
                        {isUnlocked ? (
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        ) : (
                          <Lock className="w-3.5 h-3.5 text-slate-600" />
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Right Panel: Selected Rank Detailed Inspection & Visual Preview */}
            <div className="min-h-0 flex-1 overflow-y-auto p-4 sm:p-6 bg-slate-900/30 space-y-6">
              {/* Grand Rank Spotlight Card */}
              <RankProfileTheme
                rank={selectedRankIndex}
                className="rounded-2xl border p-6 flex flex-col sm:flex-row items-center gap-6 relative"
              >
                {/* Hero Badge Display */}
                <div className="flex flex-col items-center gap-3">
                  <div className="relative p-2">
                    <RankBadge
                      rank={selectedRankIndex}
                      division={selectedDivision}
                      size="hero"
                      isLocked={!isSelectedUnlocked}
                      showGlow={isSelectedUnlocked}
                      showDivision={true}
                    />
                  </div>
                  <div className="text-center">
                    <span
                      className="text-xs font-mono font-bold px-2 py-0.5 rounded-full border"
                      style={{
                        backgroundColor: selectedConfig.rankColorTokens.secondary,
                        borderColor: selectedConfig.rankColorTokens.accent,
                        color: selectedConfig.rankColorTokens.textLight,
                      }}
                    >
                      {selectedConfig.rankRarity} • {selectedConfig.rankVisualTier.toUpperCase()}
                    </span>
                  </div>
                </div>

                {/* Identity & Lore */}
                <div className="flex-1 text-center sm:text-left space-y-2">
                  <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2">
                    <h3
                      className="text-2xl sm:text-3xl font-extrabold tracking-tight"
                      style={{ color: selectedConfig.rankColorTokens.textLight }}
                    >
                      {selectedConfig.rankName}{' '}
                      <span className="font-mono text-xl opacity-90">
                        {['I', 'II', 'III', 'IV', 'V'][selectedDivision - 1]}
                      </span>
                    </h3>
                    {isSelectedCurrent && (
                      <span className="px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-xs font-semibold">
                        Seu Rank Atual
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-slate-300 leading-relaxed max-w-xl">
                    "{selectedConfig.rankDescription}"
                  </p>

                  <div className="pt-2 flex flex-wrap gap-2 text-xs">
                    <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                      Símbolo: <span className="font-semibold text-white">{selectedConfig.rankSymbol}</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-lg bg-black/40 border border-white/10 text-slate-300">
                      XP Estimado:{' '}
                      <span className="font-semibold text-amber-300 font-mono">
                        {selectedConfig.minTotalXP.toLocaleString()} XP
                      </span>
                    </div>
                  </div>
                </div>
              </RankProfileTheme>

              {/* Division Selector (I, II, III, IV, V) */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Variações de Divisão (I a V)
                  </h4>
                  <span className="text-xs text-slate-500">
                    Cada divisão aprimora entalhes e ornamentos visuais
                  </span>
                </div>

                <div className="grid grid-cols-5 gap-2">
                  {selectedConfig.rankDivisionVariants.map((div) => {
                    const isDivSelected = selectedDivision === div.division;
                    return (
                      <button
                        key={div.division}
                        onClick={() => setSelectedDivision(div.division)}
                        className={`p-2.5 rounded-xl border text-center transition-all ${
                          isDivSelected
                            ? 'bg-amber-500/20 border-amber-400 text-white font-bold shadow-md'
                            : 'bg-slate-900/60 border-slate-800 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
                        }`}
                      >
                        <div className="text-sm font-mono">{div.roman}</div>
                        <div className="text-[10px] text-slate-500 line-clamp-1 mt-0.5">
                          Divisão {div.division}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Division Details Note */}
                <div className="p-2.5 rounded-xl bg-slate-900/40 border border-slate-800 text-xs text-slate-300 flex items-start gap-2">
                  <Info className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <div>
                    <span className="font-semibold text-white">
                      Detalhes da Divisão {selectedConfig.rankDivisionVariants[selectedDivision - 1]?.roman}:
                    </span>{' '}
                    {selectedConfig.rankDivisionVariants[selectedDivision - 1]?.addedDetailsDescription}
                  </div>
                </div>
              </div>

              {/* Unlocked Profile Cosmetics Showcase */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Profile Frame Preview */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Award className="w-4 h-4 text-amber-400" />
                    Moldura Exclusiva de Perfil
                  </div>

                  <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                    <RankFrame rank={selectedRankIndex} size="md">
                      <div className="w-full h-full bg-slate-800 flex items-center justify-center text-xs font-bold text-white">
                        {userState.displayName?.slice(0, 2).toUpperCase() || 'AI'}
                      </div>
                    </RankFrame>
                    <div>
                      <div className="text-xs font-bold text-white">
                        {selectedConfig.rankUnlockedPreview.unlockedFrameTitle}
                      </div>
                      <div className="text-[11px] text-slate-400 mt-0.5">
                        {isSelectedUnlocked ? 'Conquistada permanentemente para seu perfil' : 'Será revelada quando você alcançar este Rank'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Profile Theme Card Preview */}
                <div className="bg-slate-950/40 border border-slate-800/80 rounded-2xl p-4 space-y-3">
                  <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-slate-400">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    Tema e Efeitos Visuais
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Partículas:</span>
                      <span className="font-semibold text-white font-mono">{selectedConfig.rankParticleEffect}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Intensidade de Glow:</span>
                      <span className="font-semibold text-white font-mono">{selectedConfig.rankGlowEffect}</span>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Animação de Rank Up:</span>
                      <span className="font-semibold text-white font-mono">{selectedConfig.rankLevelUpAnimation}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
