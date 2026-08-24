import React, { useEffect, useCallback } from 'react';
import { Check, Delete, RotateCcw } from 'lucide-react';
import { soundService } from '../services/soundService';

interface VirtualKeypadProps {
  onDigitPress: (digit: string) => void;
  onDeletePress: () => void;
  onClearPress: () => void;
  onSubmitPress: () => void;
  disabled?: boolean;
  soundEnabled?: boolean;
  soundVolume?: number;
  vibrationEnabled?: boolean;
}

export const VirtualKeypad: React.FC<VirtualKeypadProps> = ({
  onDigitPress,
  onDeletePress,
  onClearPress,
  onSubmitPress,
  disabled = false,
  soundEnabled = true,
  soundVolume = 0.5,
  vibrationEnabled = true,
}) => {
  const handleKeyInteraction = useCallback(
    (action: () => void) => {
      if (disabled) return;
      if (soundEnabled) soundService.playKeyClick(soundVolume);
      if (vibrationEnabled) soundService.triggerHaptic('light');
      action();
    },
    [disabled, soundEnabled, soundVolume, vibrationEnabled]
  );

  // Physical Keyboard Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (disabled) return;

      // Do not intercept if user is typing in an input or textarea
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return;
      }

      // Digits 0-9 (main keyboard and numpad)
      if (/^[0-9]$/.test(e.key)) {
        e.preventDefault();
        handleKeyInteraction(() => onDigitPress(e.key));
      } else if (e.key === 'Backspace') {
        e.preventDefault();
        handleKeyInteraction(() => onDeletePress());
      } else if (e.key === 'Enter' || e.key === '=') {
        e.preventDefault();
        handleKeyInteraction(() => onSubmitPress());
      } else if (e.key === 'Escape' || e.key === 'c' || e.key === 'C') {
        e.preventDefault();
        handleKeyInteraction(() => onClearPress());
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [disabled, handleKeyInteraction, onDigitPress, onDeletePress, onSubmitPress, onClearPress]);

  const numpadButtons = ['7', '8', '9', '4', '5', '6', '1', '2', '3'];

  return (
    <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl mx-auto select-none px-1 sm:px-2">
      <div className="grid grid-cols-3 gap-3 sm:gap-4 md:gap-5">
        {/* Row 1-3: Numbers 1 to 9 */}
        {numpadButtons.map((digit) => (
          <button
            key={digit}
            type="button"
            disabled={disabled}
            onClick={() => handleKeyInteraction(() => onDigitPress(digit))}
            className="h-20 sm:h-24 md:h-26 rounded-2xl sm:rounded-3xl bg-[#181818] hover:bg-[#252525] active:bg-[#303030] active:scale-[0.93] text-4xl sm:text-5xl md:text-6xl font-mono font-black text-white border-2 border-[#282828] hover:border-[#3a3a3a] transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed shadow-xl"
          >
            {digit}
          </button>
        ))}

        {/* Row 4: Delete/Backspace, 0, Confirm/Enter */}
        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKeyInteraction(() => onDeletePress())}
          className="h-20 sm:h-24 md:h-26 rounded-2xl sm:rounded-3xl bg-[#261515] hover:bg-[#351a1a] active:bg-[#451f1f] active:scale-[0.93] text-red-400 border-2 border-red-900/50 hover:border-red-700/70 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 shadow-xl"
          title="Apagar último número (Backspace)"
        >
          <Delete className="w-8 h-8 sm:w-11 sm:h-11 stroke-[2.5]" />
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKeyInteraction(() => onDigitPress('0'))}
          className="h-20 sm:h-24 md:h-26 rounded-2xl sm:rounded-3xl bg-[#181818] hover:bg-[#252525] active:bg-[#303030] active:scale-[0.93] text-4xl sm:text-5xl md:text-6xl font-mono font-black text-white border-2 border-[#282828] hover:border-[#3a3a3a] transition-all flex items-center justify-center cursor-pointer disabled:opacity-40 shadow-xl"
        >
          0
        </button>

        <button
          type="button"
          disabled={disabled}
          onClick={() => handleKeyInteraction(() => onSubmitPress())}
          className="h-20 sm:h-24 md:h-26 rounded-2xl sm:rounded-3xl bg-orange-600 hover:bg-orange-500 active:bg-orange-700 active:scale-[0.93] text-white shadow-2xl shadow-orange-950/70 border-2 border-orange-400/60 transition-all flex items-center justify-center cursor-pointer disabled:opacity-40"
          title="Confirmar resposta (Enter)"
        >
          <Check className="w-9 h-9 sm:w-12 sm:h-12 stroke-[3.5]" />
        </button>
      </div>

      {/* Quick Helper for Keyboard */}
      <div className="mt-4 flex items-center justify-between text-[11px] sm:text-xs text-[#777] px-2 font-semibold uppercase tracking-wider">
        <span className="hidden sm:inline">Teclado: 0-9 • Backspace • Enter</span>
        <button
          type="button"
          onClick={() => handleKeyInteraction(() => onClearPress())}
          className="text-[#777] hover:text-white flex items-center gap-1.5 transition ml-auto cursor-pointer font-bold text-xs"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Limpar (C)
        </button>
      </div>
    </div>
  );
};

