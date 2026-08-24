import React, { useState, useEffect } from 'react';
import { Award, Clock, Flame, Heart, Sparkles, Target, Zap, ArrowLeft, Home } from 'lucide-react';
import { GameMode, Question, UserState } from '../types';
import { VirtualKeypad } from './VirtualKeypad';
import { checkStreakXpMilestone, getStreakTierDisplay, StreakMilestone } from '../config/xpConfig';

interface CalculatorScreenProps {
  currentQuestion: Question | null;
  userState: UserState;
  gameMode: GameMode;
  onAnswerSubmit: (userAnswer: number) => void;
  feedback: {
    visible: boolean;
    isCorrect: boolean;
    correctAnswer?: number;
    xpEarned?: number;
    baseXP?: number;
    streakMultiplier?: number;
    streakBonusXP?: number;
    message?: string;
  } | null;
  timeRemainingSeconds: number;
  totalTimeSeconds: number;
  survivalLives?: number;
  onChangeGameMode: () => void;
  onGoHome?: () => void;
}

export const CalculatorScreen: React.FC<CalculatorScreenProps> = ({
  currentQuestion,
  userState,
  gameMode,
  onAnswerSubmit,
  feedback,
  timeRemainingSeconds,
  totalTimeSeconds,
  survivalLives = 3,
  onChangeGameMode,
  onGoHome,
}) => {
  const [typedInput, setTypedInput] = useState<string>('');
  const [lastXpGain, setLastXpGain] = useState<number | null>(30);
  const [milestoneToast, setMilestoneToast] = useState<StreakMilestone | null>(null);

  const streakTier = getStreakTierDisplay(userState.combo);

  // Clear input when question changes
  useEffect(() => {
    setTypedInput('');
  }, [currentQuestion?.id]);

  useEffect(() => {
    if (feedback?.isCorrect && feedback.xpEarned) {
      setLastXpGain(feedback.xpEarned);
    }
  }, [feedback]);

  // Check for streak milestone notification
  useEffect(() => {
    const milestone = checkStreakXpMilestone(userState.combo);
    if (milestone && userState.combo > 0) {
      setMilestoneToast(milestone);
      const timer = setTimeout(() => setMilestoneToast(null), 3200);
      return () => clearTimeout(timer);
    }
  }, [userState.combo]);

  const handleDigitPress = (digit: string) => {
    if (feedback?.visible) return;
    if (typedInput.length < 9) {
      setTypedInput((prev) => (prev === '0' ? digit : prev + digit));
    }
  };

  const handleDeletePress = () => {
    if (feedback?.visible) return;
    setTypedInput((prev) => prev.slice(0, -1));
  };

  const handleClearPress = () => {
    if (feedback?.visible) return;
    setTypedInput('');
  };

  const handleSubmitPress = () => {
    if (feedback?.visible || typedInput.trim() === '') return;
    const numericAnswer = parseInt(typedInput, 10);
    if (!isNaN(numericAnswer)) {
      onAnswerSubmit(numericAnswer);
    }
  };

  const isUrgent = timeRemainingSeconds <= 5;
  const timeProgressPercent = Math.max(0, Math.min(100, (timeRemainingSeconds / totalTimeSeconds) * 100));

  const modeLabels: Partial<Record<GameMode, string>> = {
    mixed: 'Treino Misto',
    addition: 'Apenas Adição (+)',
    subtraction: 'Apenas Subtração (-)',
    multiplication: 'Apenas Multiplicação (×)',
    division: 'Apenas Divisão (÷)',
    time_attack: 'Contra o Tempo ⏱️',
    survival: 'Sobrevivência ❤️',
    calculo_rapido: 'Cálculo Rápido',
    quiz_rapido: 'Quiz Rápido',
    verdadeiro_falso: 'Verdadeiro ou Falso',
    complete_frase: 'Complete a Frase',
    associacao: 'Associação de Conceitos',
    ordenacao: 'Ordenação Cronológica/Lógica',
    flashcards: 'Flashcards de Memorização',
    treino_misto: 'Treino Adaptativo Geral',
    vestibular_rush: 'Vestibular Rush',
    maratona: 'Maratona 100 Questões',
    sem_erros: 'Desafio Sem Erros',
    recuperacao: 'Recuperação de Erros',
    boss_challenge: 'Boss Challenge',
    simulado: 'Simulado Vestibular',
  };

  // Helper to format and style mathematical expression tokens nicely
  const renderFormattedExpression = (expr: string) => {
    if (!expr) return <span>...</span>;

    const parts = expr.split(/(\s+|[+\-×÷*/()])/).filter((p) => p && p.trim() !== '');

    return (
      <span className="inline-flex flex-wrap items-center justify-center gap-1.5 sm:gap-2.5">
        {parts.map((token, idx) => {
          if (['+', '-', '×', '÷', '*', '/'].includes(token)) {
            return (
              <span
                key={idx}
                className="text-orange-500 font-bold px-1 select-none transform scale-110 drop-shadow-[0_0_8px_rgba(249,115,22,0.3)]"
              >
                {token === '*' ? '×' : token === '/' ? '÷' : token}
              </span>
            );
          }
          if (token === '(' || token === ')') {
            return (
              <span key={idx} className="text-yellow-400 font-bold opacity-90 select-none">
                {token}
              </span>
            );
          }
          return (
            <span key={idx} className="text-white font-mono tracking-tight font-black">
              {token}
            </span>
          );
        })}
      </span>
    );
  };

  // Calculate dynamic typography scale based on expression length
  const expressionLength = currentQuestion?.expressionString?.length || 5;
  const opCount = currentQuestion?.operatorCount || 1;

  const getDynamicFontSizeClass = () => {
    if (opCount >= 4 || expressionLength > 22) {
      return 'text-3xl sm:text-4xl md:text-5xl lg:text-6xl';
    }
    if (opCount === 3 || expressionLength > 15) {
      return 'text-4xl sm:text-5xl md:text-6xl lg:text-7xl';
    }
    if (opCount === 2 || expressionLength > 10) {
      return 'text-5xl sm:text-6xl md:text-7xl lg:text-8xl';
    }
    return 'text-6xl sm:text-7xl md:text-8xl lg:text-9xl';
  };

  return (
    <div className="w-full max-w-5xl mx-auto flex flex-col items-center justify-center relative px-3 sm:px-6 py-2 select-none">
      {/* Discreet Milestone Toast Notification */}
      {milestoneToast && (
        <div className="absolute top-2 z-40 animate-bounce transition-all">
          <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-yellow-500 text-white px-5 py-2 rounded-full shadow-2xl border border-orange-300/40 flex items-center gap-2.5 text-xs font-extrabold tracking-wide">
            <span className="text-base">{milestoneToast.badgeEmoji}</span>
            <span>
              STREAK {milestoneToast.streak}! NOVO BÔNUS XP ×{(milestoneToast.multiplier ?? 1.0).toFixed(2)} ({milestoneToast.bonusPercentText})
            </span>
          </div>
        </div>
      )}

      {/* Top Controls: Game Mode Bar & Survival Lives */}
      <div className="w-full max-w-xl flex items-center justify-between gap-2 sm:gap-3 mb-3 z-10">
        <div className="flex items-center gap-2">
          {onGoHome && (
            <button
              onClick={onGoHome}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#111] hover:bg-[#1a1a1a] text-xs font-bold uppercase tracking-wider text-slate-300 border border-[#222] hover:border-orange-500/40 hover:text-white transition cursor-pointer"
              title="Voltar para a Tela Inicial"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Início</span>
            </button>
          )}

          <button
            onClick={onChangeGameMode}
            className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl bg-[#111] hover:bg-[#1a1a1a] text-xs font-bold uppercase tracking-wider text-slate-300 border border-[#222] hover:border-[#333] transition cursor-pointer"
          >
            <Target className="w-3.5 h-3.5 text-orange-500" />
            <span>{modeLabels[gameMode]}</span>
          </button>
        </div>

        {/* Structural Difficulty Badge */}
        <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-xl bg-[#141414] border border-[#222] text-[11px] font-mono text-[#888]">
          <span className="text-[9px] uppercase tracking-wider text-[#666] font-bold">Estrutura</span>
          <span className="font-bold text-orange-400">
            {currentQuestion?.operatorCount || 1} op{currentQuestion && currentQuestion.operatorCount > 1 ? 's' : ''}
          </span>
          {currentQuestion && currentQuestion.operatorCount >= 4 && (
            <span className="bg-orange-500/20 text-orange-300 text-[9px] px-1 py-0.2 rounded font-bold uppercase border border-orange-500/30">
              Pico
            </span>
          )}
        </div>

        {gameMode === 'survival' ? (
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/30 border border-red-900/40 text-xs font-bold text-red-300">
            <span className="text-[10px] uppercase tracking-wider text-red-400 font-bold mr-1">Vidas</span>
            {Array.from({ length: 3 }).map((_, i) => (
              <Heart
                key={i}
                className={`w-4 h-4 ${
                  i < survivalLives ? 'text-red-500 fill-red-500' : 'text-[#333]'
                }`}
              />
            ))}
          </div>
        ) : (
          <div className="flex items-center gap-2 text-xs font-bold font-mono">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-semibold">Tempo</span>
            <span className={`tabular-nums ${isUrgent ? 'text-red-400 font-black animate-pulse' : 'text-white'}`}>
              {timeRemainingSeconds.toFixed(1)}s
            </span>
          </div>
        )}
      </div>

      {/* Main Math HUD & Display Grid */}
      <div className="w-full max-w-4xl grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-8 items-center z-10 mb-4">
        {/* Left HUD: Combo & Progressive Streak Multiplier */}
        <div className="hidden lg:flex lg:col-span-3 flex-col gap-5">
          <div className="flex flex-col bg-[#111] p-3.5 rounded-2xl border border-[#222]">
            <div className="flex items-center justify-between mb-1">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-bold">
                Sequência
              </span>
              {userState.combo >= 5 && (
                <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
                  XP ×{(streakTier?.multiplier ?? 1.0).toFixed(2)}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              <span className="text-4xl xl:text-5xl font-black text-[#f97316] leading-none font-mono">
                🔥 {userState.combo}
              </span>
            </div>
            {userState.combo >= 5 && (
              <div className="mt-2 pt-2 border-t border-[#222] flex items-center justify-between text-[11px] font-mono">
                <span className="text-[#777]">Bônus Atual:</span>
                <span className="font-bold text-amber-400">
                  +{Math.round((streakTier.multiplier - 1) * 100)}% XP
                </span>
              </div>
            )}
          </div>

          <div className="flex flex-col bg-[#111] p-3.5 rounded-2xl border border-[#222]">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] mb-1 font-bold">
              Último Ganho
            </span>
            <span className="text-xl font-black text-emerald-400 font-mono">
              +{lastXpGain || 30} XP
            </span>
          </div>
        </div>

        {/* Center: Math Question & Answer Visor */}
        <div className="lg:col-span-6 flex flex-col items-center w-full max-w-xl mx-auto">
          {/* Minimalist Glowing Timer Bar */}
          <div className="w-full h-1 sm:h-1.5 bg-[#1a1a1a] rounded-full mb-5 overflow-hidden border border-[#222]">
            <div
              className={`h-full transition-all duration-100 ease-linear ${
                isUrgent
                  ? 'bg-red-500 shadow-[0_0_12px_rgba(239,68,68,0.7)]'
                  : 'bg-white shadow-[0_0_12px_rgba(255,255,255,0.4)]'
              }`}
              style={{ width: `${timeProgressPercent}%` }}
            />
          </div>

          {/* The Mathematical Expression with Adaptive Typography */}
          <div className="relative w-full flex flex-col items-center min-h-[110px] sm:min-h-[140px] justify-center">
            <div className="py-2 sm:py-3 text-center w-full px-2">
              <h2
                className={`${getDynamicFontSizeClass()} font-black leading-tight tracking-tight text-white mb-1 font-mono transition-all duration-200`}
              >
                {currentQuestion
                  ? renderFormattedExpression(
                      currentQuestion.expressionString ||
                        `${currentQuestion.num1} ${currentQuestion.symbol} ${currentQuestion.num2}`
                    )
                  : '...'}
              </h2>
            </div>

            {/* Answer Display Box */}
            <div className="relative w-full max-w-lg md:max-w-xl group my-2">
              <div className="absolute -inset-1 bg-gradient-to-r from-orange-600 to-orange-400 rounded-2xl sm:rounded-3xl blur opacity-20 group-hover:opacity-40 transition" />
              <div className="relative bg-[#111] border-2 border-[#333] rounded-2xl sm:rounded-3xl p-4 sm:p-6 flex items-center justify-center min-h-[80px] sm:min-h-[96px] shadow-2xl">
                <span className="text-4xl sm:text-5xl md:text-6xl font-mono font-black tracking-widest text-white tabular-nums">
                  {typedInput || <span className="text-[#333]">0</span>}
                  <span className="animate-pulse text-orange-500 font-light ml-1">|</span>
                </span>
              </div>
            </div>

            {/* Smooth Feedback Overlay with Clear Streak XP Breakdown */}
            {feedback?.visible && (
              <div
                className={`absolute inset-0 z-30 flex flex-col items-center justify-center p-4 rounded-2xl backdrop-blur-md transition-all animate-in fade-in duration-100 ${
                  feedback.isCorrect
                    ? 'bg-[#0a0a0a]/95 border-2 border-emerald-500/80 shadow-[0_0_30px_rgba(16,185,129,0.2)]'
                    : 'bg-[#0a0a0a]/95 border-2 border-red-500/80 shadow-[0_0_30px_rgba(239,68,68,0.2)]'
                }`}
              >
                {feedback.isCorrect ? (
                  <>
                    <h3 className="text-3xl sm:text-4xl font-black text-emerald-400 tracking-tight uppercase flex items-center gap-2">
                      <span>CORRETO!</span>
                      <span className="text-2xl">⚡</span>
                    </h3>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-2xl font-black text-white font-mono">
                        +{feedback.xpEarned || 30} XP
                      </span>
                      {feedback.streakMultiplier && feedback.streakMultiplier > 1 && (
                        <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
                          🔥 ×{(feedback.streakMultiplier ?? 1.0).toFixed(2)}
                        </span>
                      )}
                    </div>
                    {feedback.streakBonusXP !== undefined && feedback.streakBonusXP > 0 && (
                      <p className="text-[11px] text-[#999] font-mono mt-1">
                        Base: {feedback.baseXP || 30} XP + Bônus Streak: +{feedback.streakBonusXP} XP
                      </p>
                    )}
                  </>
                ) : (
                  <>
                    <h3 className="text-2xl sm:text-3xl font-black text-red-400 tracking-tight uppercase">
                      {feedback.message || 'INCORRETO!'}
                    </h3>
                    {feedback.correctAnswer !== undefined && (
                      <p className="text-sm text-slate-300 mt-2 font-mono">
                        Resposta: <strong className="text-white text-lg font-black">{feedback.correctAnswer}</strong>
                      </p>
                    )}
                    <span className="text-[11px] text-red-400/80 font-mono mt-1">
                      Sequência zerada • Multiplicador voltou para 1.00x
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right HUD: Stats Sidebar */}
        <div className="hidden lg:flex lg:col-span-3 flex-col items-end gap-6 text-right">
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold mb-0.5">
              Precisão
            </span>
            <span className="text-3xl font-light text-white font-mono">{userState.stats.accuracy}%</span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold mb-0.5">
              Tempo Médio
            </span>
            <span className="text-3xl font-light text-white font-mono">
              {userState.stats.avgTimeMs > 0 ? `${(userState.stats.avgTimeMs / 1000).toFixed(1)}s` : '0.0s'}
            </span>
          </div>
          <div>
            <span className="block text-[10px] uppercase tracking-[0.2em] text-[#555] font-bold mb-0.5">
              Dificuldade
            </span>
            <span className="text-2xl font-light text-orange-400 font-mono">
              {currentQuestion?.difficultyScore?.toFixed(1) || '1.0'}
            </span>
          </div>
        </div>
      </div>

      {/* Mobile/Tablet Compact HUD Row with Multiplier */}
      <div className="lg:hidden w-full max-w-lg sm:max-w-xl md:max-w-2xl flex items-center justify-between px-3 sm:px-4 mb-3 text-center bg-[#111] py-2 rounded-2xl border border-[#222]">
        <div>
          <span className="block text-[9px] uppercase tracking-[0.2em] text-[#666] font-bold">Sequência</span>
          <div className="flex items-center justify-center gap-1">
            <span className="text-xl font-black text-orange-500 font-mono">🔥 {userState.combo}</span>
            {userState.combo >= 5 && (
              <span className="text-[10px] text-amber-400 font-mono font-bold">
                (×{(streakTier?.multiplier ?? 1.0).toFixed(2)})
              </span>
            )}
          </div>
        </div>
        <div className="h-7 w-px bg-[#222]" />
        <div>
          <span className="block text-[9px] uppercase tracking-[0.2em] text-[#666] font-bold">Precisão</span>
          <span className="text-xl font-bold text-white font-mono">{userState.stats.accuracy}%</span>
        </div>
        <div className="h-7 w-px bg-[#222]" />
        <div>
          <span className="block text-[9px] uppercase tracking-[0.2em] text-[#666] font-bold">Dificuldade</span>
          <span className="text-xl font-bold text-orange-400 font-mono">
            {currentQuestion?.difficultyScore?.toFixed(1) || '1.0'}
          </span>
        </div>
      </div>

      {/* Integrated Bold Typography Keypad */}
      <div className="w-full max-w-lg sm:max-w-xl md:max-w-2xl z-10">
        <VirtualKeypad
          onDigitPress={handleDigitPress}
          onDeletePress={handleDeletePress}
          onClearPress={handleClearPress}
          onSubmitPress={handleSubmitPress}
          disabled={feedback?.visible}
          soundEnabled={userState.settings?.soundEnabled}
          soundVolume={userState.settings?.soundVolume}
          vibrationEnabled={userState.settings?.vibrationEnabled}
        />
      </div>
    </div>
  );
};

