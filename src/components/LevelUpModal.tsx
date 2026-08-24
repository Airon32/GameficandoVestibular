import React, { useEffect } from 'react';
import confetti from 'canvas-confetti';
import { ArrowUpRight, Sparkles, Star, Trophy, X } from 'lucide-react';
import { UserState } from '../types';

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
  useEffect(() => {
    // Launch celebratory confetti fireworks
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 },
    });
  }, []);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-[#111] border border-orange-500/50 rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center relative overflow-hidden">
        {/* Glow backdrop */}
        <div className="absolute -top-12 -left-12 w-36 h-36 bg-orange-500/20 rounded-full blur-3xl" />
        <div className="absolute -bottom-12 -right-12 w-36 h-36 bg-amber-500/20 rounded-full blur-3xl" />

        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-[#888] hover:text-white rounded-full bg-[#1a1a1a] transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="w-20 h-20 mx-auto rounded-3xl bg-orange-600/30 border border-orange-500/50 p-0.5 shadow-xl mb-4 flex items-center justify-center">
          <Sparkles className="w-10 h-10 text-orange-400 animate-bounce" />
        </div>

        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-orange-400 block mb-1">
          Evolução Desbloqueada
        </span>
        <h2 className="text-3xl font-black text-white tracking-tight mb-2">
          LEVEL UP!
        </h2>

        <div className="flex items-center justify-center gap-3 my-4 bg-[#161616] p-3 rounded-2xl border border-[#222]">
          <div className="text-[#888] font-mono text-lg font-bold">
            Nível {previousLevel}
          </div>
          <ArrowUpRight className="w-6 h-6 text-orange-400 stroke-[3]" />
          <div className="text-2xl font-mono font-black text-orange-400">
            Nível {newLevel}
          </div>
        </div>

        <p className="text-xs text-[#888] mb-6 leading-relaxed">
          Sua velocidade e precisão continuam subindo! As operações se adaptaram ao seu novo nível de maestria.
        </p>

        <button
          onClick={onClose}
          className="w-full py-3.5 rounded-2xl bg-orange-600 text-white font-black text-base uppercase tracking-wider shadow-lg shadow-orange-950/50 hover:bg-orange-500 active:scale-[0.98] transition cursor-pointer"
        >
          Continuar Treinando
        </button>
      </div>
    </div>
  );
};

