import React from 'react';
import { RankInfo, RankVisualConfig } from '../types';
import { getRankVisualConfig, getAscensionVisualConfig } from '../config/rankVisualConfig';

export type RankFrameSize = 'sm' | 'md' | 'lg' | 'xl';

interface RankFrameProps {
  rank: string | RankInfo | number;
  size?: RankFrameSize;
  children: React.ReactNode;
  showGlow?: boolean;
  animated?: boolean;
  className?: string;
}

export const RankFrame: React.FC<RankFrameProps> = ({
  rank,
  size = 'md',
  children,
  showGlow = true,
  animated = true,
  className = '',
}) => {
  let config: RankVisualConfig;
  let ascension = 0;

  if (typeof rank === 'object' && rank !== null) {
    ascension = rank.ascensionLevel ?? 0;
    if (ascension > 0) {
      config = getAscensionVisualConfig(ascension, rank.division);
    } else {
      config = getRankVisualConfig(rank.tierIndex ?? rank.tierName);
    }
  } else if (typeof rank === 'number') {
    config = getRankVisualConfig(rank);
  } else {
    config = getRankVisualConfig(rank);
  }

  const tokens = config.rankColorTokens;
  const tierIndex = config.tierIndex;

  const sizeClasses: Record<RankFrameSize, { container: string; padding: string; cornerSize: number }> = {
    sm: { container: 'w-10 h-10', padding: 'p-0.5', cornerSize: 6 },
    md: { container: 'w-16 h-16', padding: 'p-1', cornerSize: 10 },
    lg: { container: 'w-24 h-24', padding: 'p-1.5', cornerSize: 14 },
    xl: { container: 'w-32 h-32', padding: 'p-2', cornerSize: 18 },
  };

  const currentSize = sizeClasses[size] || sizeClasses.md;

  // Frame Border & Corner Styles based on Rank Tiers
  const renderFrameOrnaments = () => {
    // Rustic: Madeira, Pedregulho, Pedra (0-2)
    if (tierIndex <= 2) {
      return (
        <div
          className="absolute inset-0 rounded-2xl pointer-events-none border-2"
          style={{ borderColor: tokens.border }}
        />
      );
    }

    // Metallic: Cobre, Ferro, Bronze, Aço (3-6)
    if (tierIndex <= 6) {
      return (
        <>
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none border-2"
            style={{ borderColor: tokens.border }}
          />
          <div
            className="absolute -top-1 -left-1 w-2.5 h-2.5 rounded-sm border"
            style={{ backgroundColor: tokens.accent, borderColor: tokens.border }}
          />
          <div
            className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-sm border"
            style={{ backgroundColor: tokens.accent, borderColor: tokens.border }}
          />
          <div
            className="absolute -bottom-1 -left-1 w-2.5 h-2.5 rounded-sm border"
            style={{ backgroundColor: tokens.accent, borderColor: tokens.border }}
          />
          <div
            className="absolute -bottom-1 -right-1 w-2.5 h-2.5 rounded-sm border"
            style={{ backgroundColor: tokens.accent, borderColor: tokens.border }}
          />
        </>
      );
    }

    // Noble: Prata, Ouro, Platina (7-9)
    if (tierIndex <= 9) {
      return (
        <>
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none border-2 shadow-inner"
            style={{ borderColor: tokens.frameBorder }}
          />
          <div
            className="absolute -top-1.5 left-1/2 -translate-x-1/2 px-1.5 py-0.5 rounded-full border text-[7px] font-bold"
            style={{ backgroundColor: tokens.secondary, borderColor: tokens.accent, color: tokens.textLight }}
          >
            ★
          </div>
          {/* Ornate corner cuts */}
          <div className="absolute -top-1 -left-1 w-3 h-3 border-t-2 border-l-2 rounded-tl-md" style={{ borderColor: tokens.accent }} />
          <div className="absolute -top-1 -right-1 w-3 h-3 border-t-2 border-r-2 rounded-tr-md" style={{ borderColor: tokens.accent }} />
          <div className="absolute -bottom-1 -left-1 w-3 h-3 border-b-2 border-l-2 rounded-bl-md" style={{ borderColor: tokens.accent }} />
          <div className="absolute -bottom-1 -right-1 w-3 h-3 border-b-2 border-r-2 rounded-br-md" style={{ borderColor: tokens.accent }} />
        </>
      );
    }

    // Gemstones: Esmeralda, Safira, Rubi, Ametista, Diamante (10-14)
    if (tierIndex <= 14) {
      return (
        <>
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none border-2"
            style={{ borderColor: tokens.frameBorder }}
          />
          {/* Gemstone Corner Jewels */}
          <div className="absolute -top-1.5 -left-1.5 w-3 h-3 rotate-45 border shadow-sm" style={{ backgroundColor: tokens.accent, borderColor: tokens.primary }} />
          <div className="absolute -top-1.5 -right-1.5 w-3 h-3 rotate-45 border shadow-sm" style={{ backgroundColor: tokens.accent, borderColor: tokens.primary }} />
          <div className="absolute -bottom-1.5 -left-1.5 w-3 h-3 rotate-45 border shadow-sm" style={{ backgroundColor: tokens.accent, borderColor: tokens.primary }} />
          <div className="absolute -bottom-1.5 -right-1.5 w-3 h-3 rotate-45 border shadow-sm" style={{ backgroundColor: tokens.accent, borderColor: tokens.primary }} />
        </>
      );
    }

    // Mastery & Mythic: Obsidiana to Mítico (15-20)
    if (tierIndex <= 20) {
      return (
        <>
          <div
            className="absolute -inset-1 rounded-2xl pointer-events-none border-2 shadow-lg"
            style={{ borderColor: tokens.accent }}
          />
          <div
            className="absolute inset-0 rounded-2xl pointer-events-none border"
            style={{ borderColor: tokens.primary }}
          />
          {/* Wings / Crest top crown */}
          <div
            className="absolute -top-2 left-1/2 -translate-x-1/2 flex items-center gap-0.5 px-2 py-0.5 rounded-full border shadow-md"
            style={{ backgroundColor: tokens.secondary, borderColor: tokens.accent }}
          >
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tokens.accent }} />
            <span className="w-2 h-2 rotate-45" style={{ backgroundColor: tokens.textLight }} />
            <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: tokens.accent }} />
          </div>
        </>
      );
    }

    // Cosmic, Transcendent & Infinite (21-29+)
    return (
      <>
        {/* Animated Rotating Orbit Ring */}
        <div
          className={`absolute -inset-1.5 rounded-3xl pointer-events-none border-2 border-dashed opacity-80 ${
            animated ? 'animate-[spin_12s_linear_infinite]' : ''
          }`}
          style={{ borderColor: tokens.accent }}
        />
        <div
          className="absolute -inset-0.5 rounded-2xl pointer-events-none border-2 shadow-2xl"
          style={{ borderColor: tokens.primary }}
        />
        {/* Cardinal Jewels */}
        <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 border shadow-md" style={{ backgroundColor: tokens.accent, borderColor: '#FFFFFF' }} />
        <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-3.5 h-3.5 rotate-45 border shadow-md" style={{ backgroundColor: tokens.accent, borderColor: '#FFFFFF' }} />
        <div className="absolute top-1/2 -left-2 -translate-y-1/2 w-3.5 h-3.5 rotate-45 border shadow-md" style={{ backgroundColor: tokens.accent, borderColor: '#FFFFFF' }} />
        <div className="absolute top-1/2 -right-2 -translate-y-1/2 w-3.5 h-3.5 rotate-45 border shadow-md" style={{ backgroundColor: tokens.accent, borderColor: '#FFFFFF' }} />
      </>
    );
  };

  return (
    <div className={`relative inline-flex items-center justify-center ${currentSize.container} ${className}`}>
      {/* Outer Glow */}
      {showGlow && (
        <div
          className="absolute -inset-1 rounded-2xl blur-md opacity-40 pointer-events-none"
          style={{ backgroundColor: tokens.glow }}
        />
      )}

      {/* Frame Ornaments */}
      {renderFrameOrnaments()}

      {/* Inner Avatar Content Container */}
      <div className={`relative z-10 w-full h-full rounded-xl overflow-hidden flex items-center justify-center ${currentSize.padding}`}>
        {children}
      </div>
    </div>
  );
};
