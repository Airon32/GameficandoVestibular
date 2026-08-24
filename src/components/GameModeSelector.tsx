import React from 'react';
import { Clock, Divide, Flame, Heart, Minus, Plus, Sparkles, Target, X, Zap } from 'lucide-react';
import { GameMode } from '../types';

interface GameModeSelectorProps {
  currentMode: GameMode;
  onSelectMode: (mode: GameMode) => void;
  onClose: () => void;
}

export const GameModeSelector: React.FC<GameModeSelectorProps> = ({
  currentMode,
  onSelectMode,
  onClose,
}) => {
  const modes: Array<{
    id: GameMode;
    title: string;
    description: string;
    badge: string;
    icon: React.ReactNode;
  }> = [
    {
      id: 'mixed',
      title: 'Treino Misto Adaptativo',
      description: 'O algoritmo equilibra automaticamente as quatro operações de acordo com suas forças e fraquezas.',
      badge: 'Recomendado',
      icon: <Sparkles className="w-5 h-5 text-orange-400" />,
    },
    {
      id: 'addition',
      title: 'Apenas Adição (+)',
      description: 'Treine somas progressivas, de um único dígito a cálculos com centenas e milhares.',
      badge: 'Foco +',
      icon: <Plus className="w-5 h-5 text-emerald-400" />,
    },
    {
      id: 'subtraction',
      title: 'Apenas Subtração (-)',
      description: 'Aprimore sua agilidade mental com subtrações com e sem empréstimo.',
      badge: 'Foco -',
      icon: <Minus className="w-5 h-5 text-sky-400" />,
    },
    {
      id: 'multiplication',
      title: 'Apenas Multiplicação (×)',
      description: 'Domine a tabuada básica até multiplicações complexas de múltiplos dígitos.',
      badge: 'Foco ×',
      icon: <Zap className="w-5 h-5 text-amber-400" />,
    },
    {
      id: 'division',
      title: 'Apenas Divisão (÷)',
      description: 'Divisões exatas e calibração de cálculo reverso sem números decimais confusos.',
      badge: 'Foco ÷',
      icon: <Divide className="w-5 h-5 text-purple-400" />,
    },
    {
      id: 'time_attack',
      title: 'Contra o Tempo ⏱️',
      description: 'Responda o máximo de questões no limite contínuo e dispute recordes de pontuação.',
      badge: 'Desafio',
      icon: <Clock className="w-5 h-5 text-orange-500" />,
    },
    {
      id: 'survival',
      title: 'Sobrevivência ❤️',
      description: 'Você começa com 3 vidas. Cada erro ou tempo esgotado custa uma vida.',
      badge: 'Hardcore',
      icon: <Heart className="w-5 h-5 text-rose-500 fill-rose-500" />,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200 select-none">
      <div className="bg-[#111] border border-[#222] rounded-3xl p-5 sm:p-6 max-w-lg w-full shadow-2xl relative max-h-[90vh] flex flex-col">
        <div className="flex items-center justify-between pb-3 border-b border-[#222]">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-black text-white">Escolha o Modo de Jogo</h3>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-[#888] hover:text-white rounded-lg hover:bg-[#222] transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto py-4 space-y-2.5 flex-1 pr-1 scrollbar-none">
          {modes.map((mode) => {
            const isSelected = currentMode === mode.id;

            return (
              <button
                key={mode.id}
                onClick={() => {
                  onSelectMode(mode.id);
                  onClose();
                }}
                className={`w-full text-left p-4 rounded-2xl border transition-all flex items-start gap-3.5 cursor-pointer bg-[#161616] ${
                  isSelected
                    ? 'border-orange-500 ring-2 ring-orange-500 shadow-md shadow-orange-950/40'
                    : 'border-[#222] hover:border-[#333] hover:bg-[#1a1a1a]'
                }`}
              >
                <div className="p-2.5 rounded-xl bg-[#111] border border-[#222] shrink-0">
                  {mode.icon}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <h4 className="font-bold text-sm text-white">{mode.title}</h4>
                    <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#111] font-bold text-orange-400 border border-[#333]">
                      {mode.badge}
                    </span>
                  </div>
                  <p className="text-xs text-[#888] leading-relaxed">{mode.description}</p>
                </div>
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
};

