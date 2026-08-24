import React from 'react';
import { RankInfo, RankVisualConfig } from '../types';
import { getRankVisualConfig, getAscensionVisualConfig } from '../config/rankVisualConfig';

interface RankProfileThemeProps {
  rank: string | RankInfo | number;
  children: React.ReactNode;
  variant?: 'card' | 'banner' | 'modal' | 'full';
  className?: string;
  showParticles?: boolean;
}

export const RankProfileTheme: React.FC<RankProfileThemeProps> = ({
  rank,
  children,
  variant = 'card',
  className = '',
  showParticles = true,
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

  // Particle effects rendering
  const renderParticles = () => {
    if (!showParticles || config.rankParticleEffect === 'none') return null;

    if (config.rankParticleEffect === 'subtle_sparks') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-40">
          <div className="absolute top-1/4 left-1/4 w-1 h-1 rounded-full bg-amber-200 animate-ping" />
          <div className="absolute top-3/4 right-1/4 w-1 h-1 rounded-full bg-amber-300 animate-pulse delay-300" />
        </div>
      );
    }

    if (config.rankParticleEffect === 'golden_shimmer') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-50">
          <div className="absolute top-1/6 left-1/3 w-1.5 h-1.5 rounded-full bg-yellow-300 animate-pulse" />
          <div className="absolute top-2/3 right-1/5 w-1 h-1 rounded-full bg-yellow-200 animate-ping delay-500" />
          <div className="absolute bottom-1/4 left-1/5 w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse delay-700" />
        </div>
      );
    }

    if (config.rankParticleEffect === 'crystal_float') {
      return (
        <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
          <div className="absolute top-1/4 right-1/4 w-2 h-2 rotate-45 border border-cyan-300/60 animate-pulse" />
          <div className="absolute bottom-1/3 left-1/6 w-1.5 h-1.5 rotate-45 border border-sky-300/60 animate-ping delay-700" />
        </div>
      );
    }

    // cosmic_nebula or infinite_energy
    return (
      <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-60">
        <div className="absolute top-0 right-0 w-32 h-32 rounded-full blur-3xl bg-pink-500/20" />
        <div className="absolute bottom-0 left-0 w-32 h-32 rounded-full blur-3xl bg-cyan-500/20" />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 rounded-full blur-3xl bg-purple-500/20" />
      </div>
    );
  };

  return (
    <div
      className={`relative overflow-hidden transition-all duration-500 bg-gradient-to-br ${tokens.backgroundGradient} ${className}`}
      style={{
        borderColor: tokens.border,
        boxShadow: `0 0 25px ${tokens.cardGlow}`,
      }}
    >
      {/* Rank-colored atmospheric lighting */}
      <div
        className="absolute -right-20 -top-24 h-64 w-64 rounded-full blur-[80px] pointer-events-none opacity-25"
        style={{ backgroundColor: tokens.primary }}
      />
      <div
        className="absolute -bottom-28 -left-20 h-72 w-72 rounded-full blur-[90px] pointer-events-none opacity-20"
        style={{ backgroundColor: tokens.accent }}
      />
      <div
        className="absolute inset-x-0 top-0 h-px pointer-events-none opacity-80"
        style={{ background: `linear-gradient(90deg, transparent, ${tokens.textLight}, transparent)` }}
      />

      {/* Subtle Pattern Texture */}
      <div
        className="absolute inset-0 opacity-10 pointer-events-none mix-blend-overlay"
        style={{
          backgroundImage: `radial-gradient(${tokens.accent} 1px, transparent 1px)`,
          backgroundSize: '16px 16px',
        }}
      />

      {/* Higher ranks gain a living aurora without affecting layout. */}
      {tierIndex >= 7 && (
        <div
          className={`absolute left-1/2 top-0 h-24 w-2/3 -translate-x-1/2 rounded-full blur-3xl pointer-events-none opacity-20 ${
            tierIndex >= 14 ? 'animate-pulse' : ''
          }`}
          style={{ backgroundColor: tokens.textLight }}
        />
      )}

      {/* Particle Effects */}
      {renderParticles()}

      {/* Foreground Content */}
      <div className="relative z-10">{children}</div>
    </div>
  );
};
