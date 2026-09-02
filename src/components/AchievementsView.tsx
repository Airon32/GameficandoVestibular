import React, { useState } from 'react';
import { Award, Check, Crown, Flame, Lock, Sparkles, Star, Trophy, Zap } from 'lucide-react';
import { ACHIEVEMENTS_LIST } from '../config/constants';
import { Achievement, UserState } from '../types';

interface AchievementsViewProps {
  userState: UserState;
  onEquipTitle: (title: string) => void;
}

export const AchievementsView: React.FC<AchievementsViewProps> = ({ userState, onEquipTitle }) => {
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const { achievements, unlockedTitles, selectedTitle, stats, streak, level, rank, maxCombo } = userState;

  const categories = [
    { id: 'all', label: 'Todas' },
    { id: 'progression', label: 'Progressão' },
    { id: 'speed', label: 'Velocidade' },
    { id: 'accuracy', label: 'Combos & Precisão' },
    { id: 'streak', label: 'Sequência' },
    { id: 'operations', label: 'Operações' },
    { id: 'english', label: 'Inglês' },
  ];

  const filteredAchievements = ACHIEVEMENTS_LIST.filter(
    (a) => activeCategory === 'all' || a.category === activeCategory
  );

  const totalUnlockedCount = Object.keys(achievements).length;
  const totalAchievements = ACHIEVEMENTS_LIST.length;

  const getMetricCurrentValue = (targetMetric: string): number => {
    switch (targetMetric) {
      case 'totalCorrect':
        return stats.totalCorrect;
      case 'totalQuestions':
        return stats.totalQuestions;
      case 'maxCombo':
        return maxCombo;
      case 'currentStreak':
        return streak.currentStreak;
      case 'level':
        return level;
      case 'rankTierIndex':
        return rank.tierIndex;
      case 'multCorrect':
        return stats.byOperation['multiplication']?.correct || 0;
      case 'divCorrect':
        return stats.byOperation['division']?.correct || 0;
      case 'fastestCorrectTime':
        return 0; // Boolean unlock
      case 'englishWordsMastered':
        return userState.englishProgress?.stats.wordsMastered || 0;
      case 'englishWordsSeen':
        return (Object.values(userState.englishProgress?.vocabulary || {}) as Array<{ timesSeen: number }>).filter((entry) => entry.timesSeen > 0).length;
      case 'englishListeningCount':
        return userState.englishProgress?.stats.listeningCount || 0;
      case 'englishSpeakingCount':
        return userState.englishProgress?.stats.speakingCount || 0;
      case 'englishCefrIndex':
        return userState.englishProgress
          ? ['a0', 'a1', 'a2', 'b1', 'b2', 'c1', 'c2'].indexOf(userState.englishProgress.estimatedCefr)
          : 0;
      case 'englishQuestions':
        return userState.englishProgress?.stats.questionsAnswered || 0;
      default:
        return 0;
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-6 animate-in fade-in duration-200 select-none">
      {/* Overview Banner */}
      <div className="bg-[#111] rounded-3xl p-5 sm:p-6 border border-[#222] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-orange-500/40 text-orange-500 flex items-center justify-center text-3xl shadow-lg">
            <Trophy className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-xl sm:text-2xl font-black text-white">Galeria de Conquistas</h2>
            <p className="text-xs sm:text-sm text-[#888] mt-0.5">
              Desbloqueie títulos exclusivos, bônus de XP e medalhas de prestígio.
            </p>
          </div>
        </div>

        <div className="bg-[#161616] px-5 py-3 rounded-2xl border border-[#222] text-center">
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold block">Desbloqueadas</span>
          <span className="text-xl sm:text-2xl font-black text-orange-400 font-mono tabular-nums">
            {totalUnlockedCount} / {totalAchievements}
          </span>
        </div>
      </div>

      {/* Equipped Title & Title Selector */}
      <div className="bg-[#111] rounded-3xl p-5 sm:p-6 border border-[#222] shadow-xl">
        <div className="flex items-center gap-2 mb-3">
          <Crown className="w-5 h-5 text-orange-500" />
          <h3 className="text-sm uppercase tracking-[0.2em] font-bold text-white">Títulos Desbloqueados</h3>
        </div>

        <div className="flex flex-wrap gap-2">
          {unlockedTitles.map((title) => {
            const isEquipped = selectedTitle === title;
            return (
              <button
                key={title}
                onClick={() => onEquipTitle(title)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 border cursor-pointer ${
                  isEquipped
                    ? 'bg-orange-600 text-white border-orange-500 shadow-md shadow-orange-900/30'
                    : 'bg-[#161616] text-[#888] border-[#222] hover:border-[#333] hover:text-white'
                }`}
              >
                {isEquipped && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                <span>{title}</span>
                {isEquipped && <span className="text-[10px] font-bold uppercase tracking-wider opacity-90">(Equipado)</span>}
              </button>
            );
          })}
        </div>
      </div>

      {/* Category Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
        {categories.filter((cat) => cat && cat.id).map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold uppercase tracking-wider whitespace-nowrap transition cursor-pointer ${
              activeCategory === cat.id
                ? 'bg-orange-600 text-white shadow-sm'
                : 'bg-[#161616] text-[#888] hover:text-white border border-[#222]'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Achievements Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {filteredAchievements.filter((ach) => ach && ach.id).map((ach) => {
          const isUnlocked = !!achievements[ach.id];
          const unlockTime = achievements[ach.id];
          const currentVal = getMetricCurrentValue(ach.targetMetric);
          const progressPercent = Math.min(100, Math.max(0, (currentVal / ach.targetValue) * 100));

          return (
            <div
              key={ach.id}
              className={`rounded-2xl p-4 border transition-all flex flex-col justify-between ${
                isUnlocked
                  ? 'bg-[#161616] border-orange-500/40 shadow-sm'
                  : 'bg-[#111] border-[#222] opacity-75'
              }`}
            >
              <div className="flex items-start gap-3">
                <div
                  className={`w-11 h-11 rounded-xl flex items-center justify-center text-xl shrink-0 shadow-sm border ${
                    isUnlocked
                      ? 'bg-orange-950/40 text-orange-400 border-orange-500/50'
                      : 'bg-[#1a1a1a] text-[#555] border-[#222]'
                  }`}
                >
                  {isUnlocked ? <Trophy className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-1">
                    <h4 className={`text-sm font-bold truncate ${isUnlocked ? 'text-white' : 'text-[#888]'}`}>
                      {ach.title}
                    </h4>
                    {isUnlocked && (
                      <span className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-emerald-950/60 text-emerald-300 font-bold border border-emerald-500/30 shrink-0">
                        Desbloqueado
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[#888] mt-0.5 leading-relaxed">{ach.description}</p>
                </div>
              </div>

              {/* Progress bar or Rewards */}
              <div className="mt-3 pt-2.5 border-t border-[#222]">
                {!isUnlocked && ach.targetMetric !== 'fastestCorrectTime' && (
                  <div className="mb-2">
                    <div className="flex items-center justify-between text-[10px] font-mono text-[#777] mb-1">
                      <span className="uppercase tracking-wider">Progresso</span>
                      <span>
                        {currentVal} / {ach.targetValue}
                      </span>
                    </div>
                    <div className="w-full bg-[#222] rounded-full h-1.5 overflow-hidden">
                      <div
                        className="bg-orange-500 h-full rounded-full transition-all"
                        style={{ width: `${progressPercent}%` }}
                      />
                    </div>
                  </div>
                )}

                <div className="flex items-center justify-between text-[11px] text-[#888]">
                  <div className="flex items-center gap-2">
                    {ach.rewardXP && (
                      <span className="text-orange-400 font-bold font-mono">+{ach.rewardXP} XP</span>
                    )}
                    {ach.rewardTitle && (
                      <span className="text-slate-300 font-semibold">Título: "{ach.rewardTitle}"</span>
                    )}
                  </div>
                  {isUnlocked && unlockTime && (
                    <span className="text-[10px] text-[#666] font-mono">
                      {new Date(unlockTime).toLocaleDateString()}
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

