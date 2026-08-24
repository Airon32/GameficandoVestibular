import React, { useState } from 'react';
import { Calendar as CalendarIcon, CheckCircle2, ChevronLeft, ChevronRight, Flame, Shield, Sparkles, Trophy } from 'lucide-react';
import { DailyActivityRecord, UserState } from '../types';

interface CalendarViewProps {
  userState: UserState;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ userState }) => {
  const [currentMonthDate, setCurrentMonthDate] = useState<Date>(new Date());
  const [selectedDayRecord, setSelectedDayRecord] = useState<{ date: string; data?: DailyActivityRecord } | null>(null);

  const { streak, stats, settings } = userState;
  const dailyGoal = settings?.dailyGoal || 10;

  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();

  const monthNames = [
    'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
    'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'
  ];

  const daysOfWeek = ['DOM', 'SEG', 'TER', 'QUA', 'QUI', 'SEX', 'SÁB'];

  // Days in month calculation
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDays = new Date(year, month + 1, 0).getDate();

  const handlePrevMonth = () => {
    setCurrentMonthDate(new Date(year, month - 1, 1));
    setSelectedDayRecord(null);
  };

  const handleNextMonth = () => {
    setCurrentMonthDate(new Date(year, month + 1, 1));
    setSelectedDayRecord(null);
  };

  const todayStr = new Date().toISOString().split('T')[0];

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-6 animate-in fade-in duration-200 select-none">
      {/* Streak Hero Card */}
      <div className="bg-[#111] rounded-3xl p-5 sm:p-6 border border-[#222] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-5">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-orange-500/40 text-orange-500 flex items-center justify-center text-3xl shadow-lg">
            <Flame className="w-8 h-8 fill-orange-500 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl sm:text-3xl font-black text-white font-mono tabular-nums">
                {streak.currentStreak} {streak.currentStreak === 1 ? 'Dia de Foco' : 'Dias Seguidos'}
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#888] mt-0.5">
              Meta Diária: {dailyGoal} acertos por dia.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 bg-[#161616] px-5 py-3 rounded-2xl border border-[#222]">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold block">Recorde</span>
            <span className="text-lg sm:text-2xl font-black text-orange-400 font-mono tabular-nums">{streak.maxStreak} dias</span>
          </div>
          <div className="h-8 w-px bg-[#222]" />
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold block">Proteção Freeze</span>
            <div className="flex items-center justify-center gap-1 mt-0.5">
              <Shield className="w-4 h-4 text-cyan-400" />
              <span className="text-lg sm:text-2xl font-black text-cyan-300 font-mono tabular-nums">{streak.streakFreezes}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Interactive Calendar Board */}
      <div className="bg-[#111] rounded-3xl p-5 sm:p-6 border border-[#222] shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2.5">
            <CalendarIcon className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg sm:text-xl font-black text-white">
              {monthNames[month]} de {year}
            </h3>
          </div>

          <div className="flex items-center gap-1.5 bg-[#161616] p-1 rounded-xl border border-[#222]">
            <button
              onClick={handlePrevMonth}
              className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#222] transition cursor-pointer"
              title="Mês anterior"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => setCurrentMonthDate(new Date())}
              className="px-2.5 py-1 text-xs font-bold text-[#888] hover:text-white hover:bg-[#222] rounded-lg transition cursor-pointer"
            >
              Hoje
            </button>
            <button
              onClick={handleNextMonth}
              className="p-1.5 rounded-lg text-[#888] hover:text-white hover:bg-[#222] transition cursor-pointer"
              title="Próximo mês"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Days of Week Header */}
        <div className="grid grid-cols-7 gap-1 sm:gap-2 text-center text-[10px] uppercase tracking-[0.2em] font-bold text-[#666] mb-2">
          {daysOfWeek.map((day) => (
            <div key={day} className="py-1">
              {day}
            </div>
          ))}
        </div>

        {/* Calendar Grid */}
        <div className="grid grid-cols-7 gap-1.5 sm:gap-2.5">
          {/* Empty prefix slots */}
          {Array.from({ length: firstDayIndex }).map((_, idx) => (
            <div key={`empty-${idx}`} className="h-14 sm:h-20 rounded-2xl bg-transparent" />
          ))}

          {/* Month Days */}
          {Array.from({ length: totalDays }).map((_, idx) => {
            const dayNum = idx + 1;
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(dayNum).padStart(2, '0')}`;
            const activity = stats.dailyActivity[dateStr];
            const isToday = dateStr === todayStr;
            const isGoalDone = activity && activity.goalReached;
            const hasActivity = activity && activity.questionsCount > 0;

            return (
              <button
                key={dateStr}
                onClick={() => setSelectedDayRecord({ date: dateStr, data: activity })}
                className={`h-14 sm:h-20 rounded-2xl p-1.5 sm:p-2 border text-left flex flex-col justify-between transition-all group cursor-pointer ${
                  isGoalDone
                    ? 'bg-orange-950/30 border-orange-500/50 hover:bg-orange-950/50 shadow-sm shadow-orange-950/50'
                    : hasActivity
                    ? 'bg-[#1a1a1a] border-[#333] hover:border-[#444]'
                    : 'bg-[#161616] border-[#222] hover:bg-[#1a1a1a]'
                } ${isToday ? 'ring-2 ring-orange-500 ring-offset-2 ring-offset-[#0a0a0a]' : ''}`}
              >
                <div className="flex items-center justify-between w-full">
                  <span
                    className={`text-xs font-mono font-bold ${
                      isToday ? 'text-orange-500' : 'text-white'
                    }`}
                  >
                    {dayNum}
                  </span>
                  {isGoalDone ? (
                    <Flame className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                  ) : hasActivity ? (
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                  ) : null}
                </div>

                {hasActivity ? (
                  <div className="text-[10px] font-mono text-[#888] truncate">
                    <span className="text-orange-400 font-bold block">+{activity.xpGained} XP</span>
                    <span className="hidden sm:inline text-[#666]">{activity.correctCount}/{activity.questionsCount}</span>
                  </div>
                ) : (
                  <span className="text-[10px] text-[#333] hidden sm:inline">-</span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Selected Day Details Panel */}
      {selectedDayRecord && (
        <div className="bg-[#111] rounded-2xl p-4 sm:p-5 border border-[#222] shadow-md animate-in fade-in">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-bold text-white text-sm">
              Detalhes de {selectedDayRecord.date}
            </h4>
            <span className="text-xs text-[#888]">
              {selectedDayRecord.data?.goalReached ? 'Meta Diária Concluída 🎉' : 'Meta não atingida'}
            </span>
          </div>

          {selectedDayRecord.data ? (
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
              <div className="bg-[#161616] p-2.5 rounded-xl border border-[#222]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold block">XP Ganho</span>
                <span className="font-mono font-black text-orange-400 text-base">+{selectedDayRecord.data.xpGained} XP</span>
              </div>
              <div className="bg-[#161616] p-2.5 rounded-xl border border-[#222]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold block">Acertos</span>
                <span className="font-mono font-black text-emerald-400 text-base">
                  {selectedDayRecord.data.correctCount} / {selectedDayRecord.data.questionsCount}
                </span>
              </div>
              <div className="bg-[#161616] p-2.5 rounded-xl border border-[#222]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold block">Precisão</span>
                <span className="font-mono font-black text-white text-base">
                  {selectedDayRecord.data.questionsCount > 0
                    ? `${Math.round((selectedDayRecord.data.correctCount / selectedDayRecord.data.questionsCount) * 100)}%`
                    : '0%'}
                </span>
              </div>
              <div className="bg-[#161616] p-2.5 rounded-xl border border-[#222]">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold block">Tempo</span>
                <span className="font-mono font-black text-[#888] text-base">
                  {Math.round(selectedDayRecord.data.timeSpentMs / 1000)}s
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#666] italic">Nenhum treino registrado neste dia.</p>
          )}
        </div>
      )}
    </div>
  );
};

