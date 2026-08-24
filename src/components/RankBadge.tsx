import React from 'react';
import { RankInfo, RankVisualConfig } from '../types';
import { getRankVisualConfig, getAscensionVisualConfig } from '../config/rankVisualConfig';

export type RankBadgeSize = 'sm' | 'md' | 'lg' | 'hero' | 'preview';

interface RankBadgeProps {
  rank: string | RankInfo | number;
  division?: number; // 1 to 5
  size?: RankBadgeSize;
  animated?: boolean;
  showDivision?: boolean;
  showGlow?: boolean;
  isLocked?: boolean;
  ascensionLevel?: number;
  className?: string;
  onClick?: () => void;
}

export const RankBadge: React.FC<RankBadgeProps> = ({
  rank,
  division = 1,
  size = 'md',
  animated = true,
  showDivision = false,
  showGlow = true,
  isLocked = false,
  ascensionLevel,
  className = '',
  onClick,
}) => {
  // Extract tier index or rank name
  let config: RankVisualConfig;
  let currentDiv = division;
  let currentAscension = ascensionLevel;

  if (typeof rank === 'object' && rank !== null) {
    currentDiv = rank.division || division;
    currentAscension = rank.ascensionLevel ?? ascensionLevel;
    if (currentAscension && currentAscension > 0) {
      config = getAscensionVisualConfig(currentAscension, currentDiv);
    } else {
      config = getRankVisualConfig(rank.tierIndex ?? rank.tierName);
    }
  } else if (typeof rank === 'number') {
    config = getRankVisualConfig(rank);
  } else {
    config = getRankVisualConfig(rank);
  }

  // Size dimensions
  const sizeMap: Record<RankBadgeSize, { px: number; box: string; iconSize: number; text: string }> = {
    sm: { px: 32, box: 'w-8 h-8', iconSize: 20, text: 'text-[9px]' },
    md: { px: 52, box: 'w-13 h-13', iconSize: 32, text: 'text-xs' },
    lg: { px: 84, box: 'w-21 h-21', iconSize: 52, text: 'text-sm' },
    hero: { px: 136, box: 'w-34 h-34', iconSize: 84, text: 'text-base' },
    preview: { px: 100, box: 'w-25 h-25', iconSize: 64, text: 'text-xs' },
  };

  const currentSize = sizeMap[size] || sizeMap.md;
  const isReduced = isLocked;
  const tokens = config.rankColorTokens;
  const tierIndex = config.tierIndex;

  // Roman numeral representation
  const romans = ['I', 'II', 'III', 'IV', 'V'];
  const divisionRoman = romans[Math.min(4, Math.max(0, currentDiv - 1))];

  // SVG Artwork per rank family
  const renderBadgeArtwork = () => {
    // 1. MADEIRA (Escudo entalhado rústico)
    if (tierIndex === 0) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id={`wood_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#8B5A2B" />
              <stop offset="50%" stopColor="#5C3A21" />
              <stop offset="100%" stopColor="#3E2415" />
            </linearGradient>
            <linearGradient id={`wood_rim_${tierIndex}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="#B08968" />
              <stop offset="100%" stopColor="#4A2810" />
            </linearGradient>
          </defs>
          {/* Base Shield */}
          <path
            d="M50 8 C25 8 16 22 16 48 C16 74 38 88 50 94 C62 88 84 74 84 48 C84 22 75 8 50 8 Z"
            fill={`url(#wood_grad_${tierIndex})`}
            stroke={`url(#wood_rim_${tierIndex})`}
            strokeWidth="3.5"
          />
          {/* Wood Planks & Grain */}
          <path d="M50 14 L50 88 M32 20 L32 78 M68 20 L68 78" stroke="#3E2415" strokeWidth="2" strokeDasharray="6,2" opacity="0.6" />
          {/* Division Details */}
          {currentDiv >= 2 && (
            <path d="M30 35 L70 65 M70 35 L30 65" stroke="#D4A373" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          )}
          {currentDiv >= 3 && (
            <path
              d="M50 16 C30 16 24 28 24 48 C24 68 42 80 50 84 C58 80 76 68 76 48 C76 28 70 16 50 16 Z"
              fill="none"
              stroke="#D4A373"
              strokeWidth="1.5"
            />
          )}
          {currentDiv >= 4 && (
            <circle cx="50" cy="20" r="4" fill="#D4A373" stroke="#3E2415" strokeWidth="1" />
          )}
          {currentDiv >= 5 && (
            <g fill="#D4A373">
              <circle cx="22" cy="48" r="3" />
              <circle cx="78" cy="48" r="3" />
              <path d="M50 28 L54 36 L62 37 L56 43 L58 51 L50 46 L42 51 L44 43 L38 37 L46 36 Z" fill="#D4A373" />
            </g>
          )}
        </svg>
      );
    }

    // 2. PEDREGULHO (Fragmento de rocha irregular)
    if (tierIndex === 1) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id={`rock_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#94A3B8" />
              <stop offset="50%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          <polygon
            points="50,10 82,26 90,65 65,88 35,88 10,65 18,26"
            fill={`url(#rock_grad_${tierIndex})`}
            stroke="#CBD5E1"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Rock facets */}
          <path d="M50 10 L50 50 L82 26 M50 50 L90 65 M50 50 L65 88 M50 50 L35 88 M50 50 L10 65 M50 50 L18 26" stroke="#1E293B" strokeWidth="2" opacity="0.7" />
          {currentDiv >= 2 && <polygon points="50,28 68,45 50,68 32,45" fill="#475569" opacity="0.6" />}
          {currentDiv >= 3 && <circle cx="50" cy="50" r="8" fill="#CBD5E1" stroke="#334155" strokeWidth="2" />}
          {currentDiv >= 4 && (
            <path d="M25 15 L35 8 M75 15 L65 8" stroke="#CBD5E1" strokeWidth="2.5" strokeLinecap="round" />
          )}
          {currentDiv >= 5 && (
            <polygon points="50,20 62,38 78,50 62,62 50,80 38,62 22,50 38,38" fill="none" stroke="#F1F5F9" strokeWidth="2" />
          )}
        </svg>
      );
    }

    // 3. PEDRA (Escudo simétrico de pedra talhada)
    if (tierIndex === 2) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id={`stone_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A1A1AA" />
              <stop offset="60%" stopColor="#71717A" />
              <stop offset="100%" stopColor="#3F3F46" />
            </linearGradient>
          </defs>
          <polygon
            points="50,6 88,24 88,68 50,94 12,68 12,24"
            fill={`url(#stone_grad_${tierIndex})`}
            stroke="#D4D4D8"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Mountain Peak / Carvings */}
          <polygon points="50,25 72,65 28,65" fill="#52525B" stroke="#D4D4D8" strokeWidth="1.5" />
          <polygon points="50,38 62,65 38,65" fill="#3F3F46" />
          {currentDiv >= 2 && (
            <path d="M35 30 L45 42 M65 30 L55 42 M50 68 L50 82" stroke="#E4E4E7" strokeWidth="2" strokeLinecap="round" />
          )}
          {currentDiv >= 3 && (
            <polygon points="50,15 78,32 78,62 50,82 22,62 22,32" fill="none" stroke="#E4E4E7" strokeWidth="1.5" />
          )}
          {currentDiv >= 4 && (
            <polygon points="50,8 56,18 44,18" fill="#E4E4E7" />
          )}
          {currentDiv >= 5 && (
            <g fill="#F4F4F5">
              <circle cx="16" cy="28" r="3.5" />
              <circle cx="84" cy="28" r="3.5" />
              <circle cx="50" cy="88" r="3.5" />
            </g>
          )}
        </svg>
      );
    }

    // 4. COBRE (Medalhão circular com engrenagem/martelo)
    if (tierIndex === 3) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id={`copper_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F59E0B" />
              <stop offset="40%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="42" fill={`url(#copper_grad_${tierIndex})`} stroke="#FDE68A" strokeWidth="3" />
          <circle cx="50" cy="50" r="33" fill="#92400E" stroke="#FBBF24" strokeWidth="2" strokeDasharray="4,2" />
          {/* Hammer / Gear Stylized */}
          <path d="M40 38 L60 38 L60 48 L40 48 Z M47 48 L47 70 L53 70 L53 48 Z" fill="#FEF3C7" />
          {currentDiv >= 2 && <circle cx="50" cy="50" r="24" fill="none" stroke="#FEF3C7" strokeWidth="1.5" />}
          {currentDiv >= 3 && (
            <g fill="#FEF3C7">
              <circle cx="50" cy="14" r="3" />
              <circle cx="50" cy="86" r="3" />
              <circle cx="14" cy="50" r="3" />
              <circle cx="86" cy="50" r="3" />
            </g>
          )}
          {currentDiv >= 4 && (
            <path d="M30 20 L50 8 L70 20" stroke="#FDE68A" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          )}
          {currentDiv >= 5 && (
            <circle cx="50" cy="50" r="38" fill="none" stroke="#FFFBEB" strokeWidth="2" strokeDasharray="2,6" />
          )}
        </svg>
      );
    }

    // 5. FERRO (Escudo metálico robusto com bigorna e rebites)
    if (tierIndex === 4) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id={`iron_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CBD5E1" />
              <stop offset="40%" stopColor="#64748B" />
              <stop offset="100%" stopColor="#1E293B" />
            </linearGradient>
          </defs>
          <path
            d="M50 6 L88 18 L88 56 C88 78 50 96 50 96 C50 96 12 78 12 56 L12 18 Z"
            fill={`url(#iron_grad_${tierIndex})`}
            stroke="#E2E8F0"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Anvil / Iron Cross Symbol */}
          <path d="M34 38 L66 38 L60 48 L56 48 L56 64 L44 64 L44 48 L40 48 Z" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.5" />
          {/* Rivets */}
          <circle cx="22" cy="24" r="3" fill="#F8FAFC" />
          <circle cx="78" cy="24" r="3" fill="#F8FAFC" />
          <circle cx="22" cy="54" r="3" fill="#F8FAFC" />
          <circle cx="78" cy="54" r="3" fill="#F8FAFC" />
          {currentDiv >= 2 && <path d="M50 18 L50 82" stroke="#F1F5F9" strokeWidth="2" strokeDasharray="4,3" />}
          {currentDiv >= 3 && <polygon points="50,22 62,34 50,46 38,34" fill="#94A3B8" />}
          {currentDiv >= 4 && (
            <path d="M8 30 L16 38 M92 30 L84 38" stroke="#F8FAFC" strokeWidth="3" strokeLinecap="round" />
          )}
          {currentDiv >= 5 && (
            <path
              d="M50 14 L78 24 L78 52 C78 70 50 84 50 84 C50 84 22 70 22 52 L22 24 Z"
              fill="none"
              stroke="#FFFFFF"
              strokeWidth="2"
            />
          )}
        </svg>
      );
    }

    // 6. BRONZE (Medalhão sofisticado com louros)
    if (tierIndex === 5) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id={`bronze_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFA07A" />
              <stop offset="40%" stopColor="#CD7F32" />
              <stop offset="100%" stopColor="#5A2E0E" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="42" fill={`url(#bronze_grad_${tierIndex})`} stroke="#FFE4E1" strokeWidth="3.5" />
          <circle cx="50" cy="50" r="32" fill="#8B4513" stroke="#FFA07A" strokeWidth="2" />
          {/* Laurel & Trophy star */}
          <polygon points="50,26 56,40 70,40 59,50 63,64 50,55 37,64 41,50 30,40 44,40" fill="#FFE4E1" stroke="#CD7F32" strokeWidth="1" />
          {currentDiv >= 2 && (
            <path
              d="M26 62 C22 45 32 30 50 26 C68 30 78 45 74 62"
              fill="none"
              stroke="#FFA07A"
              strokeWidth="2"
              strokeDasharray="3,3"
            />
          )}
          {currentDiv >= 3 && (
            <g fill="#FFE4E1">
              <circle cx="20" cy="50" r="3.5" />
              <circle cx="80" cy="50" r="3.5" />
            </g>
          )}
          {currentDiv >= 4 && (
            <path d="M36 16 L50 6 L64 16" stroke="#FFE4E1" strokeWidth="3" fill="none" strokeLinecap="round" />
          )}
          {currentDiv >= 5 && (
            <polygon points="50,14 62,26 84,32 70,50 78,72 50,62 22,72 30,50 16,32 38,26" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          )}
        </svg>
      );
    }

    // 7. AÇO (Escudo afiado pontiagudo com lâmina de precisão)
    if (tierIndex === 6) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-md">
          <defs>
            <linearGradient id={`steel_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="40%" stopColor="#94A3B8" />
              <stop offset="100%" stopColor="#334155" />
            </linearGradient>
          </defs>
          <polygon
            points="50,4 92,22 84,68 50,96 16,68 8,22"
            fill={`url(#steel_grad_${tierIndex})`}
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Precision Blade Center */}
          <polygon points="50,14 60,45 50,82 40,45" fill="#0F172A" stroke="#E2E8F0" strokeWidth="1.5" />
          <line x1="50" y1="14" x2="50" y2="82" stroke="#FFFFFF" strokeWidth="2" />
          {currentDiv >= 2 && (
            <path d="M22 30 L36 46 M78 30 L64 46" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          )}
          {currentDiv >= 3 && (
            <polygon points="50,22 72,48 50,72 28,48" fill="none" stroke="#CBD5E1" strokeWidth="2" />
          )}
          {currentDiv >= 4 && (
            <g fill="#FFFFFF">
              <polygon points="50,2 56,12 44,12" />
              <polygon points="6,20 14,24 10,32" />
              <polygon points="94,20 86,24 90,32" />
            </g>
          )}
          {currentDiv >= 5 && (
            <polygon points="50,10 82,26 74,62 50,86 26,62 18,26" fill="none" stroke="#FFFFFF" strokeWidth="2" />
          )}
        </svg>
      );
    }

    // 8. PRATA (Estrela nobre cintilante e simetria refinada)
    if (tierIndex === 7) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-lg">
          <defs>
            <linearGradient id={`silver_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="45%" stopColor="#CBD5E1" />
              <stop offset="100%" stopColor="#64748B" />
            </linearGradient>
            <filter id="silver_glow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feComposite in="SourceGraphic" in2="blur" operator="over" />
            </filter>
          </defs>
          <polygon
            points="50,6 64,36 94,50 64,64 50,94 36,64 6,50 36,36"
            fill={`url(#silver_grad_${tierIndex})`}
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinejoin="round"
            filter="url(#silver_glow)"
          />
          <circle cx="50" cy="50" r="18" fill="#334155" stroke="#FFFFFF" strokeWidth="2" />
          <polygon points="50,38 54,46 62,50 54,54 50,62 46,54 38,50 46,46" fill="#FFFFFF" />
          {currentDiv >= 2 && <circle cx="50" cy="50" r="28" fill="none" stroke="#E2E8F0" strokeWidth="1.5" strokeDasharray="3,3" />}
          {currentDiv >= 3 && (
            <g fill="#FFFFFF">
              <circle cx="22" cy="22" r="3" />
              <circle cx="78" cy="22" r="3" />
              <circle cx="22" cy="78" r="3" />
              <circle cx="78" cy="78" r="3" />
            </g>
          )}
          {currentDiv >= 4 && (
            <polygon points="50,14 58,26 50,38 42,26" fill="#FFFFFF" />
          )}
          {currentDiv >= 5 && (
            <polygon points="50,0 60,30 90,20 70,50 100,60 70,70 80,100 50,80 20,100 30,70 0,60 30,50 10,20 40,30" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          )}
        </svg>
      );
    }

    // 9. OURO (Brasão imperial dourado alado com coroa)
    if (tierIndex === 8) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id={`gold_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="40%" stopColor="#F59E0B" />
              <stop offset="80%" stopColor="#D97706" />
              <stop offset="100%" stopColor="#78350F" />
            </linearGradient>
            <linearGradient id={`gold_wing_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>
          </defs>
          {/* Wings */}
          {currentDiv >= 3 && (
            <g fill={`url(#gold_wing_${tierIndex})`} stroke="#FEF08A" strokeWidth="1.5">
              <path d="M12 40 C6 28 16 16 34 26 C22 34 18 48 20 62 Z" />
              <path d="M88 40 C94 28 84 16 66 26 C78 34 82 48 80 62 Z" />
            </g>
          )}
          {/* Crown */}
          {currentDiv >= 4 && (
            <path d="M36 22 L30 10 L44 16 L50 6 L56 16 L70 10 L64 22 Z" fill="#FEF08A" stroke="#78350F" strokeWidth="1.5" />
          )}
          {/* Base Shield */}
          <polygon
            points="50,14 84,28 78,72 50,94 22,72 16,28"
            fill={`url(#gold_grad_${tierIndex})`}
            stroke="#FEF08A"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Inner 6-Point Gold Star */}
          <polygon points="50,30 55,42 68,44 58,54 62,68 50,60 38,68 42,54 32,44 45,42" fill="#FEF08A" stroke="#B45309" strokeWidth="1.5" />
          {currentDiv >= 2 && <circle cx="50" cy="52" r="6" fill="#FFFFFF" />}
          {currentDiv >= 5 && (
            <g stroke="#FFFFFF" strokeWidth="2">
              <line x1="50" y1="2" x2="50" y2="8" />
              <line x1="12" y1="50" x2="6" y2="50" />
              <line x1="88" y1="50" x2="94" y2="50" />
              <circle cx="50" cy="94" r="3" fill="#FFFFFF" />
            </g>
          )}
        </svg>
      );
    }

    // 10. PLATINA (Prisma cristalino geométrico)
    if (tierIndex === 9) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id={`plat_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#CCFBF1" />
              <stop offset="40%" stopColor="#2DD4BF" />
              <stop offset="100%" stopColor="#0F766E" />
            </linearGradient>
          </defs>
          <polygon
            points="50,4 90,26 90,74 50,96 10,74 10,26"
            fill={`url(#plat_grad_${tierIndex})`}
            stroke="#E6FFFA"
            strokeWidth="3"
            strokeLinejoin="round"
          />
          {/* Facets */}
          <polygon points="50,4 50,50 90,26" fill="#99F6E4" opacity="0.6" />
          <polygon points="90,26 50,50 90,74" fill="#0D9488" opacity="0.8" />
          <polygon points="90,74 50,50 50,96" fill="#115E59" opacity="0.9" />
          <polygon points="50,96 50,50 10,74" fill="#14B8A6" opacity="0.7" />
          <polygon points="10,74 50,50 10,26" fill="#5EEAD4" opacity="0.5" />
          <polygon points="10,26 50,50 50,4" fill="#CCFBF1" opacity="0.8" />
          {/* Inner Crystal Diamond */}
          <polygon points="50,22 70,50 50,78 30,50" fill="#FFFFFF" stroke="#0F766E" strokeWidth="2" />
          {currentDiv >= 2 && <circle cx="50" cy="50" r="5" fill="#0F766E" />}
          {currentDiv >= 3 && (
            <path d="M25 15 L50 2 L75 15 M25 85 L50 98 L75 85" stroke="#E6FFFA" strokeWidth="2" fill="none" />
          )}
          {currentDiv >= 4 && (
            <polygon points="50,10 65,30 50,50 35,30" fill="#CCFBF1" opacity="0.7" />
          )}
          {currentDiv >= 5 && (
            <circle cx="50" cy="50" r="42" fill="none" stroke="#E6FFFA" strokeWidth="1.5" strokeDasharray="4,4" />
          )}
        </svg>
      );
    }

    // 11. ESMERALDA (Gema esmeralda lapidada)
    if (tierIndex === 10) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id={`emerald_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="35%" stopColor="#10B981" />
              <stop offset="85%" stopColor="#047857" />
              <stop offset="100%" stopColor="#064E3B" />
            </linearGradient>
          </defs>
          <polygon
            points="32,6 68,6 94,32 94,68 68,94 32,94 6,68 6,32"
            fill={`url(#emerald_grad_${tierIndex})`}
            stroke="#D1FAE5"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <polygon points="38,20 62,20 80,38 80,62 62,80 38,80 20,62 20,38" fill="#065F46" stroke="#6EE7B7" strokeWidth="2" />
          <polygon points="50,30 65,50 50,70 35,50" fill="#D1FAE5" />
          {currentDiv >= 2 && (
            <g fill="#A7F3D0">
              <circle cx="16" cy="16" r="3" />
              <circle cx="84" cy="16" r="3" />
              <circle cx="16" cy="84" r="3" />
              <circle cx="84" cy="84" r="3" />
            </g>
          )}
          {currentDiv >= 3 && <polygon points="50,12 60,20 40,20" fill="#FFFFFF" />}
          {currentDiv >= 4 && (
            <path d="M4 50 L12 42 L12 58 Z M96 50 L88 42 L88 58 Z" fill="#D1FAE5" />
          )}
          {currentDiv >= 5 && (
            <polygon points="50,2 62,14 86,14 86,38 98,50 86,62 86,86 62,86 50,98 38,86 14,86 14,62 2,50 14,38 14,14 38,14" fill="none" stroke="#FFFFFF" strokeWidth="1.5" />
          )}
        </svg>
      );
    }

    // 12. SAFIRA (Safira estelar lapidada)
    if (tierIndex === 11) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id={`sapphire_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#BFDBFE" />
              <stop offset="35%" stopColor="#3B82F6" />
              <stop offset="80%" stopColor="#1D4ED8" />
              <stop offset="100%" stopColor="#172554" />
            </linearGradient>
          </defs>
          <polygon
            points="50,4 82,18 96,50 82,82 50,96 18,82 4,50 18,18"
            fill={`url(#sapphire_grad_${tierIndex})`}
            stroke="#DBEAFE"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Stellar Star Facet */}
          <polygon points="50,18 60,38 82,50 60,62 50,82 40,62 18,50 40,38" fill="#93C5FD" stroke="#1D4ED8" strokeWidth="1.5" />
          <polygon points="50,32 56,44 68,50 56,56 50,68 44,56 32,50 44,44" fill="#FFFFFF" />
          {currentDiv >= 2 && <circle cx="50" cy="50" r="5" fill="#1D4ED8" />}
          {currentDiv >= 3 && (
            <path d="M50 8 L50 2 M8 50 L2 50 M50 92 L50 98 M92 50 L98 50" stroke="#FFFFFF" strokeWidth="3" strokeLinecap="round" />
          )}
          {currentDiv >= 4 && (
            <polygon points="50,8 60,18 40,18" fill="#DBEAFE" />
          )}
          {currentDiv >= 5 && (
            <circle cx="50" cy="50" r="44" fill="none" stroke="#FFFFFF" strokeWidth="1.5" strokeDasharray="5,5" />
          )}
        </svg>
      );
    }

    // 13. RUBI (Cristal incandescente pontiagudo)
    if (tierIndex === 12) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id={`ruby_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FECACA" />
              <stop offset="35%" stopColor="#EF4444" />
              <stop offset="80%" stopColor="#B91C1C" />
              <stop offset="100%" stopColor="#450A0A" />
            </linearGradient>
          </defs>
          <polygon
            points="50,2 96,30 80,94 50,84 20,94 4,30"
            fill={`url(#ruby_grad_${tierIndex})`}
            stroke="#FEE2E2"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          <polygon points="50,16 80,38 68,80 50,72 32,80 20,38" fill="#7F1D1D" stroke="#FCA5A5" strokeWidth="2" />
          <polygon points="50,26 68,42 50,66 32,42" fill="#FEE2E2" />
          {currentDiv >= 2 && (
            <path d="M12 20 L24 28 M88 20 L76 28" stroke="#FEE2E2" strokeWidth="3" strokeLinecap="round" />
          )}
          {currentDiv >= 3 && <polygon points="50,74 58,86 42,86" fill="#FEE2E2" />}
          {currentDiv >= 4 && (
            <path d="M50 4 L56 16 L44 16 Z" fill="#FFFFFF" />
          )}
          {currentDiv >= 5 && (
            <g stroke="#FFFFFF" strokeWidth="2">
              <line x1="50" y1="0" x2="50" y2="8" />
              <line x1="2" y1="28" x2="8" y2="34" />
              <line x1="98" y1="28" x2="92" y2="34" />
            </g>
          )}
        </svg>
      );
    }

    // 14. AMETISTA (Cristal místico violeta)
    if (tierIndex === 13) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id={`amethyst_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F3E8FF" />
              <stop offset="35%" stopColor="#A855F7" />
              <stop offset="80%" stopColor="#6B21A8" />
              <stop offset="100%" stopColor="#3B0764" />
            </linearGradient>
          </defs>
          <polygon
            points="50,4 88,24 88,76 50,96 12,76 12,24"
            fill={`url(#amethyst_grad_${tierIndex})`}
            stroke="#FAF5FF"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Floating Mystic Geode */}
          <polygon points="50,18 76,34 76,66 50,82 24,66 24,34" fill="#581C87" stroke="#E9D5FF" strokeWidth="2" />
          <polygon points="50,30 64,42 64,58 50,70 36,58 36,42" fill="#F3E8FF" />
          {currentDiv >= 2 && (
            <g fill="#E9D5FF">
              <polygon points="10,18 16,24 8,26" />
              <polygon points="90,18 84,24 92,26" />
            </g>
          )}
          {currentDiv >= 3 && <circle cx="50" cy="50" r="6" fill="#3B0764" stroke="#FAF5FF" strokeWidth="1.5" />}
          {currentDiv >= 4 && (
            <path d="M50 6 L58 16 L42 16 Z" fill="#FFFFFF" />
          )}
          {currentDiv >= 5 && (
            <circle cx="50" cy="50" r="42" fill="none" stroke="#FAF5FF" strokeWidth="1.5" strokeDasharray="6,4" />
          )}
        </svg>
      );
    }

    // 15. DIAMANTE (Diamante hiper-facetado monumental com asas cristalinas)
    if (tierIndex === 14) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`diamond_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="30%" stopColor="#BAE6FD" />
              <stop offset="70%" stopColor="#38BDF8" />
              <stop offset="100%" stopColor="#0369A1" />
            </linearGradient>
            <linearGradient id={`diamond_wing_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="100%" stopColor="#0284C7" />
            </linearGradient>
          </defs>
          {/* Wings */}
          {currentDiv >= 3 && (
            <g fill={`url(#diamond_wing_${tierIndex})`} stroke="#FFFFFF" strokeWidth="1.5">
              <polygon points="14,48 2,24 24,32 18,54" />
              <polygon points="86,48 98,24 76,32 82,54" />
            </g>
          )}
          {/* Crown on top */}
          {currentDiv >= 4 && (
            <polygon points="50,4 58,16 42,16" fill="#FFFFFF" stroke="#0284C7" strokeWidth="1.5" />
          )}
          {/* Base Diamond Shield */}
          <polygon
            points="50,10 90,34 50,96 10,34"
            fill={`url(#diamond_grad_${tierIndex})`}
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Facet Lines */}
          <polygon points="50,10 68,34 50,54 32,34" fill="#E0F2FE" />
          <polygon points="50,54 68,34 50,96" fill="#0284C7" opacity="0.8" />
          <polygon points="50,54 32,34 50,96" fill="#0369A1" opacity="0.9" />
          <polygon points="10,34 32,34 50,96" fill="#38BDF8" opacity="0.7" />
          <polygon points="90,34 68,34 50,96" fill="#7DD3FC" opacity="0.6" />
          <polygon points="50,22 60,34 50,46 40,34" fill="#FFFFFF" />
          {currentDiv >= 2 && <circle cx="50" cy="34" r="4" fill="#0284C7" />}
          {currentDiv >= 5 && (
            <g stroke="#FFFFFF" strokeWidth="2">
              <line x1="50" y1="0" x2="50" y2="8" />
              <line x1="0" y1="34" x2="8" y2="34" />
              <line x1="100" y1="34" x2="92" y2="34" />
              <circle cx="50" cy="96" r="3" fill="#FFFFFF" />
            </g>
          )}
        </svg>
      );
    }

    // 16 to 30: High & Cosmic/Universal/Infinite Tiers
    // 16. OBSIDIANA
    if (tierIndex === 15) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`obsidian_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#C084FC" />
              <stop offset="25%" stopColor="#6B21A8" />
              <stop offset="70%" stopColor="#18181B" />
              <stop offset="100%" stopColor="#000000" />
            </linearGradient>
          </defs>
          <polygon
            points="50,2 96,26 82,90 50,98 18,90 4,26"
            fill={`url(#obsidian_grad_${tierIndex})`}
            stroke="#A855F7"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Glowing Purple Cracks */}
          <path d="M50 12 L44 38 L58 54 L46 78 L50 92" stroke="#E9D5FF" strokeWidth="2.5" fill="none" strokeLinecap="round" />
          <path d="M44 38 L30 48 M58 54 L72 62" stroke="#C084FC" strokeWidth="2" fill="none" />
          <polygon points="50,28 62,45 50,62 38,45" fill="#18181B" stroke="#C084FC" strokeWidth="1.5" />
          {currentDiv >= 2 && <circle cx="50" cy="45" r="4" fill="#E9D5FF" />}
          {currentDiv >= 4 && <polygon points="50,4 58,16 42,16" fill="#C084FC" />}
          {currentDiv >= 5 && <polygon points="50,0 98,24 84,92 50,100 16,92 2,24" fill="none" stroke="#E9D5FF" strokeWidth="1.5" />}
        </svg>
      );
    }

    // 17. TITÂNIO
    if (tierIndex === 16) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-xl">
          <defs>
            <linearGradient id={`titanium_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E2E8F0" />
              <stop offset="40%" stopColor="#06B6D4" />
              <stop offset="80%" stopColor="#334155" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <polygon
            points="50,6 94,22 84,76 50,96 16,76 6,22"
            fill={`url(#titanium_grad_${tierIndex})`}
            stroke="#A5F3FC"
            strokeWidth="3.5"
            strokeLinejoin="round"
          />
          {/* Cybernetic Armor Plates */}
          <polygon points="50,16 80,30 72,70 50,84 28,70 20,30" fill="#083344" stroke="#22D3EE" strokeWidth="2" />
          <polygon points="50,28 66,38 60,62 50,72 40,62 34,38" fill="#06B6D4" />
          <circle cx="50" cy="50" r="5" fill="#FFFFFF" />
          {currentDiv >= 3 && <path d="M12 28 L24 38 M88 28 L76 38" stroke="#A5F3FC" strokeWidth="3" />}
          {currentDiv >= 5 && <polygon points="50,2 96,20 86,78 50,98 14,78 4,20" fill="none" stroke="#FFFFFF" strokeWidth="2" />}
        </svg>
      );
    }

    // 18. MESTRE
    if (tierIndex === 17) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`master_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="35%" stopColor="#8B5CF6" />
              <stop offset="85%" stopColor="#5B21B6" />
              <stop offset="100%" stopColor="#2E1065" />
            </linearGradient>
          </defs>
          <path d="M20 70 L28 25 L42 45 L50 15 L58 45 L72 25 L80 70 Z" fill={`url(#master_grad_${tierIndex})`} stroke="#FDE047" strokeWidth="3" />
          <polygon points="50,25 76,45 68,85 50,94 32,85 24,45" fill="#4C1D95" stroke="#DDD6FE" strokeWidth="2" />
          <polygon points="50,40 60,54 50,68 40,54" fill="#FDE047" />
          <circle cx="50" cy="54" r="3" fill="#FFFFFF" />
          {currentDiv >= 3 && (
            <g fill="#FDE047">
              <circle cx="28" cy="24" r="3.5" />
              <circle cx="50" cy="14" r="4" />
              <circle cx="72" cy="24" r="3.5" />
            </g>
          )}
          {currentDiv >= 5 && <circle cx="50" cy="54" r="38" fill="none" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="4,4" />}
        </svg>
      );
    }

    // 19. GRÃO-MESTRE
    if (tierIndex === 18) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`gm_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="30%" stopColor="#E11D48" />
              <stop offset="80%" stopColor="#881337" />
              <stop offset="100%" stopColor="#4C0519" />
            </linearGradient>
          </defs>
          {/* Majestic Wings & Crown */}
          <polygon points="50,4 62,24 88,18 78,48 96,62 76,74 78,96 50,86 22,96 24,74 4,62 22,48 12,18 38,24" fill={`url(#gm_grad_${tierIndex})`} stroke="#FDE047" strokeWidth="3" />
          <circle cx="50" cy="52" r="18" fill="#881337" stroke="#FDE047" strokeWidth="2" />
          <polygon points="50,40 54,48 62,52 54,56 50,64 46,56 38,52 46,48" fill="#FDE047" />
          {currentDiv >= 3 && <circle cx="50" cy="18" r="5" fill="#FDE047" stroke="#FFFFFF" strokeWidth="1" />}
          {currentDiv >= 5 && <circle cx="50" cy="52" r="42" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="3,3" />}
        </svg>
      );
    }

    // 20. LENDÁRIO
    if (tierIndex === 19) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`leg_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="35%" stopColor="#F97316" />
              <stop offset="70%" stopColor="#D946EF" />
              <stop offset="100%" stopColor="#4A044E" />
            </linearGradient>
          </defs>
          {/* Unbound Flaming Phoenix Wings */}
          <path d="M50 8 C65 24 98 18 94 56 C90 78 72 88 50 96 C28 88 10 78 6 56 C2 18 35 24 50 8 Z" fill={`url(#leg_grad_${tierIndex})`} stroke="#FEF08A" strokeWidth="3" />
          <path d="M50 20 C60 32 80 40 76 64 C72 78 60 84 50 88 C40 84 28 78 24 64 C20 40 40 32 50 20 Z" fill="#701A75" stroke="#FB923C" strokeWidth="2" />
          <polygon points="50,34 58,48 72,52 60,62 64,76 50,68 36,76 40,62 28,52 42,48" fill="#FEF08A" />
          {currentDiv >= 4 && <circle cx="50" cy="54" r="4" fill="#FFFFFF" />}
        </svg>
      );
    }

    // 21. MÍTICO
    if (tierIndex === 20) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`mythic_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#F5D0FE" />
              <stop offset="40%" stopColor="#D946EF" />
              <stop offset="80%" stopColor="#701A75" />
              <stop offset="100%" stopColor="#2E0854" />
            </linearGradient>
          </defs>
          {/* Sacred Runic Geometry */}
          <circle cx="50" cy="50" r="44" fill={`url(#mythic_grad_${tierIndex})`} stroke="#F5D0FE" strokeWidth="3" />
          <polygon points="50,10 85,70 15,70" fill="none" stroke="#F5D0FE" strokeWidth="2" />
          <polygon points="50,90 85,30 15,30" fill="none" stroke="#F5D0FE" strokeWidth="2" />
          <circle cx="50" cy="50" r="16" fill="#4A044E" stroke="#E879F9" strokeWidth="2" />
          <circle cx="50" cy="50" r="6" fill="#FFFFFF" />
          {currentDiv >= 3 && (
            <g fill="#F5D0FE">
              <circle cx="50" cy="10" r="3.5" />
              <circle cx="85" cy="70" r="3.5" />
              <circle cx="15" cy="70" r="3.5" />
            </g>
          )}
        </svg>
      );
    }

    // 22. ARCANO
    if (tierIndex === 21) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`arcane_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#67E8F9" />
              <stop offset="40%" stopColor="#6366F1" />
              <stop offset="80%" stopColor="#312E81" />
              <stop offset="100%" stopColor="#0F172A" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="44" fill={`url(#arcane_grad_${tierIndex})`} stroke="#67E8F9" strokeWidth="3" />
          <circle cx="50" cy="50" r="32" fill="none" stroke="#818CF8" strokeWidth="2" strokeDasharray="8,4" />
          <circle cx="50" cy="50" r="20" fill="none" stroke="#67E8F9" strokeWidth="2" strokeDasharray="4,2" />
          <polygon points="50,22 74,50 50,78 26,50" fill="#312E81" stroke="#67E8F9" strokeWidth="2" />
          <circle cx="50" cy="50" r="6" fill="#FFFFFF" />
        </svg>
      );
    }

    // 23. CELESTIAL
    if (tierIndex === 22) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`cel_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="35%" stopColor="#38BDF8" />
              <stop offset="80%" stopColor="#1E3A8A" />
              <stop offset="100%" stopColor="#0B132B" />
            </linearGradient>
          </defs>
          {/* Double Halo & Celestial Star */}
          <circle cx="50" cy="50" r="45" fill="none" stroke="#FEF08A" strokeWidth="1.5" strokeDasharray="4,4" />
          <circle cx="50" cy="50" r="38" fill={`url(#cel_grad_${tierIndex})`} stroke="#38BDF8" strokeWidth="3" />
          <polygon points="50,14 58,36 80,36 62,50 68,72 50,58 32,72 38,50 20,36 42,36" fill="#FEF08A" stroke="#1E3A8A" strokeWidth="1" />
          <circle cx="50" cy="50" r="7" fill="#FFFFFF" />
        </svg>
      );
    }

    // 24. ESTELAR
    if (tierIndex === 23) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`stellar_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFBEB" />
              <stop offset="30%" stopColor="#F59E0B" />
              <stop offset="75%" stopColor="#B45309" />
              <stop offset="100%" stopColor="#451A03" />
            </linearGradient>
          </defs>
          <polygon points="50,4 64,36 96,50 64,64 50,96 36,64 4,50 36,36" fill={`url(#stellar_grad_${tierIndex})`} stroke="#FDE047" strokeWidth="3.5" />
          <polygon points="50,20 58,42 80,50 58,58 50,80 42,58 20,50 42,42" fill="#78350F" stroke="#FFFBEB" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="8" fill="#FFFFFF" />
          {/* 5 Orbiting Stars */}
          <g fill="#FDE047">
            <circle cx="50" cy="8" r="3" />
            <circle cx="92" cy="50" r="3" />
            <circle cx="50" cy="92" r="3" />
            <circle cx="8" cy="50" r="3" />
            <circle cx="50" cy="50" r="4" fill="#FFFFFF" />
          </g>
        </svg>
      );
    }

    // 25. CÓSMICO
    if (tierIndex === 24) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`cosmic_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#E9D5FF" />
              <stop offset="35%" stopColor="#8B5CF6" />
              <stop offset="75%" stopColor="#1E1B4B" />
              <stop offset="100%" stopColor="#02010A" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill={`url(#cosmic_grad_${tierIndex})`} stroke="#A78BFA" strokeWidth="3" />
          <ellipse cx="50" cy="50" rx="42" ry="16" fill="none" stroke="#E9D5FF" strokeWidth="2" transform="rotate(-30 50 50)" />
          <circle cx="50" cy="50" r="18" fill="#02010A" stroke="#C084FC" strokeWidth="2.5" />
          <circle cx="50" cy="50" r="7" fill="#FFFFFF" />
        </svg>
      );
    }

    // 26. GALÁCTICO
    if (tierIndex === 25) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`gal_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#A7F3D0" />
              <stop offset="35%" stopColor="#10B981" />
              <stop offset="70%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#022C22" />
            </linearGradient>
          </defs>
          <path d="M50 6 C76 6 94 24 94 50 C94 76 76 94 50 94 C24 94 6 76 6 50 C6 24 24 6 50 6 Z" fill={`url(#gal_grad_${tierIndex})`} stroke="#6EE7B7" strokeWidth="3" />
          {/* Galactic Spiral Arms */}
          <path d="M50 50 C60 30 85 35 90 50 C85 75 60 70 50 50 C40 30 15 25 10 50 C15 65 40 70 50 50" fill="none" stroke="#FFFFFF" strokeWidth="2.5" strokeLinecap="round" />
          <circle cx="50" cy="50" r="8" fill="#FFFFFF" />
        </svg>
      );
    }

    // 27. UNIVERSAL
    if (tierIndex === 26) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`uni_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="35%" stopColor="#2563EB" />
              <stop offset="75%" stopColor="#172554" />
              <stop offset="100%" stopColor="#020617" />
            </linearGradient>
          </defs>
          <circle cx="50" cy="50" r="45" fill={`url(#uni_grad_${tierIndex})`} stroke="#FDE047" strokeWidth="3.5" />
          <circle cx="50" cy="50" r="32" fill="#0B1E40" stroke="#60A5FA" strokeWidth="2" />
          <polygon points="50,22 70,50 50,78 30,50" fill="#FDE047" />
          <circle cx="50" cy="50" r="8" fill="#FFFFFF" />
        </svg>
      );
    }

    // 28. TRANSCENDENTE
    if (tierIndex === 27) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`trans_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FDE047" />
              <stop offset="35%" stopColor="#F43F5E" />
              <stop offset="75%" stopColor="#06B6D4" />
              <stop offset="100%" stopColor="#1E1B4B" />
            </linearGradient>
          </defs>
          {/* Hyperdimensional Floating Matrix */}
          <polygon points="50,4 92,26 92,74 50,96 8,74 8,26" fill={`url(#trans_grad_${tierIndex})`} stroke="#FFFFFF" strokeWidth="3" />
          <polygon points="50,18 78,34 78,66 50,82 22,66 22,34" fill="none" stroke="#FFFFFF" strokeWidth="2" strokeDasharray="6,3" />
          <polygon points="50,28 66,50 50,72 34,50" fill="#FFFFFF" />
        </svg>
      );
    }

    // 29. ABSOLUTO
    if (tierIndex === 28) {
      return (
        <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
          <defs>
            <linearGradient id={`abs_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FFFFFF" />
              <stop offset="25%" stopColor="#FDE047" />
              <stop offset="65%" stopColor="#EAB308" />
              <stop offset="100%" stopColor="#7F1D1D" />
            </linearGradient>
          </defs>
          {/* Absolute Monolith Seal */}
          <circle cx="50" cy="50" r="45" fill={`url(#abs_grad_${tierIndex})`} stroke="#FFFFFF" strokeWidth="4" />
          <circle cx="50" cy="50" r="32" fill="#1C1917" stroke="#FDE047" strokeWidth="2.5" />
          <polygon points="50,22 70,36 70,64 50,78 30,64 30,36" fill="#EAB308" stroke="#FFFFFF" strokeWidth="1.5" />
          <circle cx="50" cy="50" r="9" fill="#FFFFFF" />
        </svg>
      );
    }

    // 30. INFINITO (Ápice com arcos interligados, fusão estelar e geometria viva)
    return (
      <svg viewBox="0 0 100 100" className="w-full h-full drop-shadow-2xl">
        <defs>
          <linearGradient id={`inf_grad_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FDE047" />
            <stop offset="30%" stopColor="#F59E0B" />
            <stop offset="60%" stopColor="#EC4899" />
            <stop offset="85%" stopColor="#06B6D4" />
            <stop offset="100%" stopColor="#3B82F6" />
          </linearGradient>
          <linearGradient id={`inf_core_${tierIndex}`} x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#FFFFFF" />
            <stop offset="100%" stopColor="#F59E0B" />
          </linearGradient>
        </defs>
        {/* Outer Halo Rings */}
        <circle cx="50" cy="50" r="46" fill="none" stroke="#FDE047" strokeWidth="1.5" strokeDasharray="3,3" />
        <circle cx="50" cy="50" r="42" fill="none" stroke="#EC4899" strokeWidth="2" />
        
        {/* Infinite Cosmic Background */}
        <circle cx="50" cy="50" r="38" fill="#0A0618" stroke="#06B6D4" strokeWidth="2.5" />

        {/* Geometric Infinite Loops */}
        <path
          d="M32 50 C22 36 14 42 14 50 C14 58 22 64 32 50 C42 36 58 36 68 50 C78 64 86 58 86 50 C86 42 78 36 68 50 C58 64 42 64 32 50 Z"
          fill="none"
          stroke={`url(#inf_grad_${tierIndex})`}
          strokeWidth="6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Inner Luminous Track */}
        <path
          d="M32 50 C22 36 14 42 14 50 C14 58 22 64 32 50 C42 36 58 36 68 50 C78 64 86 58 86 50 C86 42 78 36 68 50 C58 64 42 64 32 50 Z"
          fill="none"
          stroke="#FFFFFF"
          strokeWidth="1.8"
          strokeLinecap="round"
        />

        {/* Core Fusion Star */}
        <polygon points="50,38 53,46 61,50 53,54 50,62 47,54 39,50 47,46" fill={`url(#inf_core_${tierIndex})`} />
        <circle cx="50" cy="50" r="3.5" fill="#FFFFFF" />

        {/* Ascension Star Marks */}
        {currentAscension && currentAscension > 0 && (
          <g fill="#FDE047">
            <circle cx="50" cy="18" r="4" stroke="#FFFFFF" strokeWidth="1" />
            <text x="50" y="21" textAnchor="middle" fontSize="6" fontWeight="bold" fill="#78350F">
              {currentAscension}
            </text>
          </g>
        )}
      </svg>
    );
  };

  return (
    <div
      onClick={onClick}
      className={`relative inline-flex flex-col items-center justify-center select-none ${currentSize.box} ${className} ${
        onClick ? 'cursor-pointer hover:scale-105 active:scale-95 transition-transform' : ''
      }`}
    >
      {/* Background Glow */}
      {showGlow && !isLocked && (
        <div
          className="absolute inset-0 rounded-full blur-md opacity-50 pointer-events-none transition-opacity"
          style={{ backgroundColor: tokens.glow }}
        />
      )}

      {showGlow && !isLocked && tierIndex >= 7 && (
        <div
          className={`absolute -inset-2 rounded-full border opacity-55 pointer-events-none ${
            animated ? 'animate-[spin_14s_linear_infinite]' : ''
          }`}
          style={{ borderColor: tokens.accent, borderStyle: tierIndex >= 14 ? 'dashed' : 'solid' }}
        />
      )}

      {showGlow && !isLocked && tierIndex >= 14 && (
        <div
          className={`absolute -inset-4 rounded-full border border-dotted opacity-35 pointer-events-none ${
            animated ? 'animate-[spin_20s_linear_infinite_reverse]' : ''
          }`}
          style={{ borderColor: tokens.textLight }}
        />
      )}

      {/* Main SVG Badge Artwork */}
      <div
        className={`relative w-full h-full flex items-center justify-center ${
          isLocked ? 'grayscale opacity-40 brightness-75' : ''
        } ${animated ? `${tierIndex >= 10 ? 'animate-[pulse_3.4s_ease-in-out_infinite]' : ''} transition-all duration-300` : ''}`}
      >
        {renderBadgeArtwork()}

        {!isLocked && tierIndex >= 7 && (
          <div className="absolute inset-[12%] -skew-x-12 rounded-full bg-gradient-to-r from-transparent via-white/20 to-transparent mix-blend-screen pointer-events-none" />
        )}

        {/* Locked Overlay Icon */}
        {isLocked && (
          <div className="absolute inset-0 flex items-center justify-center bg-black/40 rounded-full backdrop-blur-[1px]">
            <svg viewBox="0 0 24 24" className="w-1/2 h-1/2 text-white/80" fill="currentColor">
              <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z" />
            </svg>
          </div>
        )}
      </div>

      {/* Division Badge Pill */}
      {showDivision && !isLocked && (
        <div
          className="absolute -bottom-1 px-1.5 py-0.2 rounded-full border shadow-md font-mono font-black tracking-widest text-[9px] uppercase z-10 flex items-center justify-center"
          style={{
            backgroundColor: '#111827',
            borderColor: tokens.border,
            color: tokens.textLight,
          }}
        >
          {currentAscension && currentAscension > 0 ? `∞${currentAscension}` : divisionRoman}
        </div>
      )}
    </div>
  );
};
