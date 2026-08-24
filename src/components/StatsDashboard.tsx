import React, { useState } from 'react';
import { Activity, Award, BarChart2, CheckCircle2, Clock, Flame, Infinity as InfinityIcon, PieChart, Sparkles, Target, TrendingUp, Trophy, XCircle, Zap } from 'lucide-react';
import { ChartDataPoint, StatisticsEngine } from '../engines/StatisticsEngine';
import { LevelManager } from '../engines/LevelManager';
import { UserState } from '../types';

interface StatsDashboardProps {
  userState: UserState;
}

export const StatsDashboard: React.FC<StatsDashboardProps> = ({ userState }) => {
  const [timeRange, setTimeRange] = useState<number>(30); // 7, 30, 90, 365
  const chartData = StatisticsEngine.getActivityChartData(userState.stats.dailyActivity, timeRange);
  const operationSummaries = StatisticsEngine.getOperationSummary(userState);

  const { stats, level, totalXP, rank, streak, maxCombo, infiniteStats } = userState;
  const trainingTimeStr = StatisticsEngine.formatDuration(stats.totalTrainingTimeMs);

  const totalXPTo150 = LevelManager.getTotalXPToReachLevel(150);
  const infiniteProgressPercent = Math.min(100, Math.round((totalXP / totalXPTo150) * 1000) / 10);
  const maxXPInChart = Math.max(...chartData.map((d) => d.xp), 50);

  return (
    <div className="w-full max-w-5xl mx-auto p-3 sm:p-6 space-y-6 animate-in fade-in duration-200 select-none">
      {/* Top Banner Overview */}
      <div className="bg-[#111] rounded-3xl p-5 sm:p-6 border border-[#222] shadow-xl flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-[#1a1a1a] border border-[#333] flex items-center justify-center text-3xl shadow-lg">
            {userState.avatar || '🦊'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl sm:text-2xl font-black text-white">{userState.name || 'Jogador'}</h2>
              <span className="px-2.5 py-0.5 rounded text-xs font-bold bg-orange-950/60 text-[#f97316] border border-orange-500/40">
                {rank.fullName}
              </span>
            </div>
            <p className="text-xs sm:text-sm text-[#888] font-medium mt-0.5">{userState.selectedTitle}</p>
          </div>
        </div>

        <div className="flex items-center gap-4 sm:gap-6 bg-[#161616] px-5 py-3 rounded-2xl border border-[#222]">
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold block">Nível</span>
            <span className="text-lg sm:text-2xl font-black text-white font-mono tabular-nums">{level}</span>
          </div>
          <div className="h-8 w-px bg-[#222]" />
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold block">XP Total</span>
            <span className="text-lg sm:text-2xl font-black text-[#f97316] font-mono tabular-nums">{totalXP.toLocaleString()}</span>
          </div>
          <div className="h-8 w-px bg-[#222]" />
          <div className="text-center">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold block">Streak</span>
            <span className="text-lg sm:text-2xl font-black text-white font-mono tabular-nums">{streak.currentStreak}d</span>
          </div>
        </div>
      </div>

      {/* Core Metrics Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
        <div className="bg-[#111] rounded-2xl p-4 sm:p-5 border border-[#222] shadow-sm flex flex-col">
          <div className="flex items-center justify-between text-[#888] mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Total Questões</span>
            <Target className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-3xl font-black text-white font-mono tabular-nums mt-auto">
            {stats.totalQuestions}
          </span>
          <span className="text-[11px] text-emerald-400 font-medium mt-1 font-mono">
            {stats.totalCorrect} certas / {stats.totalWrong} erros
          </span>
        </div>

        <div className="bg-[#111] rounded-2xl p-4 sm:p-5 border border-[#222] shadow-sm flex flex-col">
          <div className="flex items-center justify-between text-[#888] mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Precisão</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
          </div>
          <span className="text-3xl font-black text-emerald-400 font-mono tabular-nums mt-auto">
            {stats.accuracy}%
          </span>
          <span className="text-[11px] text-[#777] font-medium mt-1">
            Média de acertos global
          </span>
        </div>

        <div className="bg-[#111] rounded-2xl p-4 sm:p-5 border border-[#222] shadow-sm flex flex-col">
          <div className="flex items-center justify-between text-[#888] mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Tempo Médio</span>
            <Clock className="w-4 h-4 text-orange-400" />
          </div>
          <span className="text-3xl font-black text-orange-400 font-mono tabular-nums mt-auto">
            {stats && stats.avgTimeMs > 0 ? `${(stats.avgTimeMs / 1000).toFixed(1)}s` : '0.0s'}
          </span>
          <span className="text-[11px] text-[#777] font-medium mt-1">
            Tempo por resposta
          </span>
        </div>

        <div className="bg-[#111] rounded-2xl p-4 sm:p-5 border border-[#222] shadow-sm flex flex-col">
          <div className="flex items-center justify-between text-[#888] mb-1">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold">Maior Combo</span>
            <Flame className="w-4 h-4 text-orange-500" />
          </div>
          <span className="text-3xl font-black text-orange-500 font-mono tabular-nums mt-auto">
            {maxCombo}x
          </span>
          <span className="text-[11px] text-[#777] font-medium mt-1">
            Treino total: {trainingTimeStr}
          </span>
        </div>
      </div>

      {/* Infinite Saga Roadmap / Plaque Card */}
      <div className="bg-gradient-to-br from-[#121216] via-[#101014] to-[#0c0c10] rounded-3xl p-5 sm:p-6 border border-amber-500/30 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center">
              <InfinityIcon className="w-6 h-6 text-amber-400" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base sm:text-lg font-black text-white">
                  {infiniteStats ? 'Placa de Conquista: Infinito V' : 'Saga Principal: Rota até Infinito V'}
                </h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Level 150
                </span>
              </div>
              <p className="text-xs text-[#888]">
                {infiniteStats
                  ? 'Você concluiu a jornada principal de 30 ligas competitivas.'
                  : 'Calibrado para 7 a 8 meses de treino consistente (~45 min/dia).'}
              </p>
            </div>
          </div>

          <div className="text-left sm:text-right font-mono">
            <span className="text-xs text-[#777] block">Progresso Global</span>
            <span className="text-lg font-black text-amber-400">
              {level >= 150 ? '100% Concluído' : `${infiniteProgressPercent}%`}
            </span>
          </div>
        </div>

        {infiniteStats ? (
          /* Unlocked Plaque Details */
          <div className="bg-[#181820] border border-amber-500/30 rounded-2xl p-4 sm:p-5 mt-3 shadow-inner">
            <div className="flex items-center gap-2 mb-3 text-amber-300 font-bold text-xs">
              <Trophy className="w-4 h-4 text-amber-400" />
              <span>Registro Histórico da Jornada Concluída:</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-[#121218] p-3 rounded-xl border border-[#252530]">
                <span className="text-[10px] text-[#777] block uppercase">Tempo até Infinito</span>
                <span className="text-sm font-black text-white font-mono">
                  {infiniteStats.daysFromFirstPlay} dias ({infiniteStats.activeDaysCount} ativos)
                </span>
              </div>
              <div className="bg-[#121218] p-3 rounded-xl border border-[#252530]">
                <span className="text-[10px] text-[#777] block uppercase">Treino Total</span>
                <span className="text-sm font-black text-amber-400 font-mono">
                  {(infiniteStats.totalHoursTrained ?? 0).toFixed(1)}h
                </span>
              </div>
              <div className="bg-[#121218] p-3 rounded-xl border border-[#252530]">
                <span className="text-[10px] text-[#777] block uppercase">Questões Resolvidas</span>
                <span className="text-sm font-black text-emerald-400 font-mono">
                  {infiniteStats.totalQuestionsSolved.toLocaleString()}
                </span>
              </div>
              <div className="bg-[#121218] p-3 rounded-xl border border-[#252530]">
                <span className="text-[10px] text-[#777] block uppercase">Precisão / Streak</span>
                <span className="text-sm font-black text-orange-400 font-mono">
                  {infiniteStats.averageAccuracy}% • 🔥 {infiniteStats.maxStreak}
                </span>
              </div>
            </div>
          </div>
        ) : (
          /* Ongoing Progression Bar */
          <div className="space-y-2 mt-2">
            <div className="w-full bg-[#181820] h-3.5 rounded-full overflow-hidden border border-[#2a2a34] p-0.5">
              <div
                className="bg-gradient-to-r from-amber-500 via-orange-500 to-yellow-400 h-full rounded-full transition-all duration-500 shadow-[0_0_12px_rgba(251,191,36,0.5)]"
                style={{ width: `${Math.max(2, Math.min(100, (level / 150) * 100))}%` }}
              />
            </div>
            <div className="flex items-center justify-between text-xs font-mono text-[#888]">
              <span>Level Atual: <strong className="text-white">{level}</strong> / 150</span>
              <span>XP Acumulado: <strong className="text-amber-300">{totalXP.toLocaleString()}</strong> / ~{totalXPTo150.toLocaleString()} XP</span>
            </div>
          </div>
        )}
      </div>

      {/* Operations Performance Breakdown */}
      <div className="bg-[#111] rounded-3xl p-5 sm:p-6 border border-[#222] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-black text-white">Desempenho por Operação</h3>
          </div>
          <span className="text-[10px] uppercase tracking-[0.2em] text-[#777] font-bold">Dificuldade Adaptativa</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
          {operationSummaries.map((op) => (
            <div
              key={op.operation}
              className="bg-[#161616] rounded-2xl p-4 border border-[#222] hover:border-[#333] transition"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-9 h-9 rounded-xl bg-[#222] border border-[#333] text-orange-400 font-mono font-bold flex items-center justify-center text-lg">
                    {op.symbol}
                  </span>
                  <div>
                    <h4 className="font-bold text-white text-sm">{op.name}</h4>
                    <span className="text-[11px] text-[#888] font-mono">
                      {op.totalQuestions} questões resolvidas
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="font-mono font-bold text-base text-emerald-400 tabular-nums">
                    {op.accuracy}%
                  </span>
                  <span className="text-[10px] text-[#777] block font-mono">
                    ~{op.avgTimeSeconds}s / resp
                  </span>
                </div>
              </div>

              {/* Accuracy progress bar */}
              <div className="w-full bg-[#222] rounded-full h-1.5 overflow-hidden mt-3">
                <div
                  className="bg-orange-500 h-full rounded-full transition-all duration-300"
                  style={{ width: `${op.accuracy}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-[11px] text-[#888] mt-2 font-mono">
                <span>{op.correct} acertos / {op.wrong} erros</span>
                <span className="font-bold text-orange-400">Nível Dificuldade: {op.difficultyScore}</span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Progressive Streak Performance Section */}
      <div className="bg-[#111] rounded-3xl p-5 sm:p-6 border border-[#222] shadow-lg">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-orange-500" />
            <h3 className="text-lg font-black text-white">Recordes de Sequência e Multiplicador de XP</h3>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-orange-500/20 text-orange-400 border border-orange-500/30 font-mono">
            Bônus até ×2.00+
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
          <div className="bg-[#161616] p-3.5 rounded-2xl border border-[#222]">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-bold block mb-1">
              Maior Sequência
            </span>
            <span className="text-2xl font-black text-orange-500 font-mono">
              🔥 {maxCombo}
            </span>
          </div>

          <div className="bg-[#161616] p-3.5 rounded-2xl border border-[#222]">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-bold block mb-1">
              Maior Multiplicador
            </span>
            <span className="text-2xl font-black text-amber-400 font-mono">
              ×{(userState.streakStats?.highestMultiplierReached || 1.0).toFixed(2)}
            </span>
          </div>

          <div className="bg-[#161616] p-3.5 rounded-2xl border border-[#222]">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-bold block mb-1">
              XP Ganho por Streak
            </span>
            <span className="text-2xl font-black text-emerald-400 font-mono">
              +{(userState.streakStats?.xpFromStreaksTotal || 0).toLocaleString()} XP
            </span>
          </div>

          <div className="bg-[#161616] p-3.5 rounded-2xl border border-[#222]">
            <span className="text-[10px] uppercase tracking-[0.2em] text-[#666] font-bold block mb-1">
              Sequência Atual
            </span>
            <span className="text-2xl font-black text-white font-mono">
              {userState.combo} acertos
            </span>
          </div>
        </div>

        {/* Milestone milestones reached */}
        <div className="bg-[#161616] p-4 rounded-2xl border border-[#222]">
          <span className="text-xs font-bold text-slate-300 block mb-2">Marcos de Sequência Atingidos:</span>
          <div className="flex flex-wrap gap-2">
            {[5, 10, 20, 40, 80, 160, 320, 640, 1000].map((m) => {
              const count = userState.streakStats?.milestoneHits?.[m] || (maxCombo >= m ? 1 : 0);
              const reached = count > 0;
              return (
                <div
                  key={m}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-mono font-bold flex items-center gap-1.5 transition ${
                    reached
                      ? 'bg-orange-500/10 border-orange-500/30 text-orange-400'
                      : 'bg-[#111] border-[#222] text-[#555]'
                  }`}
                >
                  <span>🔥 {m}</span>
                  {reached && <span className="text-[10px] text-amber-300">({count}x)</span>}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {/* Historical Progress Chart */}
      <div className="bg-[#111] rounded-3xl p-5 sm:p-6 border border-[#222] shadow-lg">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-orange-500" />
            <div>
              <h3 className="text-lg font-black text-white">Evolução de XP e Questões</h3>
              <p className="text-xs text-[#888]">Acompanhe seu ritmo de aprendizado diário</p>
            </div>
          </div>

          {/* Time range filters */}
          <div className="flex items-center bg-[#161616] p-1 rounded-xl border border-[#222] self-start sm:self-auto">
            {[
              { label: '7d', days: 7 },
              { label: '30d', days: 30 },
              { label: '90d', days: 90 },
            ].map((item) => (
              <button
                key={item.days}
                onClick={() => setTimeRange(item.days)}
                className={`px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer ${
                  timeRange === item.days
                    ? 'bg-orange-600 text-white shadow-sm'
                    : 'text-[#888] hover:text-white'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>

        {/* Responsive Custom SVG / Bar Chart */}
        <div className="w-full h-48 sm:h-56 flex items-end gap-1.5 sm:gap-2 pt-4 pb-2 px-2 bg-[#161616] rounded-2xl border border-[#222] relative">
          {chartData.map((dp, idx) => {
            const heightPercent = maxXPInChart > 0 ? Math.max(4, (dp.xp / maxXPInChart) * 100) : 4;
            const hasActivity = dp.xp > 0 || dp.questions > 0;

            return (
              <div
                key={idx}
                className="flex-1 h-full flex flex-col items-center justify-end group relative"
              >
                {/* Tooltip on hover */}
                <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-center z-30 bg-[#111] text-white text-[11px] p-2 rounded-xl border border-[#333] shadow-2xl whitespace-nowrap pointer-events-none">
                  <span className="font-bold text-orange-400 font-mono">{dp.date}</span>
                  <span className="font-mono">+{dp.xp} XP acumulado</span>
                  <span className="font-mono">{dp.questions} questões ({dp.correct} certas)</span>
                  <span className="font-mono">{dp.accuracy}% de precisão</span>
                </div>

                {/* Bar */}
                <div
                  className={`w-full max-w-[24px] rounded-t-md transition-all duration-300 ${
                    hasActivity
                      ? 'bg-orange-500 group-hover:bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.4)]'
                      : 'bg-[#222]'
                  }`}
                  style={{ height: `${heightPercent}%` }}
                />

                {/* Day label on every few bars */}
                {(timeRange <= 7 || idx % Math.ceil(timeRange / 7) === 0) && (
                  <span className="text-[9px] font-mono text-[#666] mt-1 truncate">
                    {dp.label}
                  </span>
                )}
              </div>
            );
          })}
        </div>

        <div className="flex items-center justify-between text-xs text-[#888] mt-3 px-2">
          <span>Passe o mouse ou toque nas barras para ver detalhes diários.</span>
          <span className="font-bold text-orange-400 font-mono">Total no período: {chartData.reduce((acc, c) => acc + c.xp, 0)} XP</span>
        </div>
      </div>
    </div>
  );
};

