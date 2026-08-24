import { DailyActivityRecord, OperationType, UserState } from '../types';

export interface ChartDataPoint {
  date: string;
  label: string;
  xp: number;
  questions: number;
  correct: number;
  accuracy: number;
  timeSpentMinutes: number;
}

export class StatisticsEngine {
  /**
   * Generates chronological chart data points for the given time range
   */
  public static getActivityChartData(
    dailyActivity: Record<string, DailyActivityRecord>,
    daysRange: number = 30
  ): ChartDataPoint[] {
    const points: ChartDataPoint[] = [];
    const today = new Date();

    for (let i = daysRange - 1; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      const dateStr = `${year}-${month}-${day}`;

      const rec = dailyActivity[dateStr] || {
        date: dateStr,
        questionsCount: 0,
        correctCount: 0,
        xpGained: 0,
        goalReached: false,
        timeSpentMs: 0,
      };

      const accuracy = rec.questionsCount > 0 ? Math.round((rec.correctCount / rec.questionsCount) * 100) : 0;
      const dayLabel = `${day}/${month}`;

      points.push({
        date: dateStr,
        label: dayLabel,
        xp: rec.xpGained,
        questions: rec.questionsCount,
        correct: rec.correctCount,
        accuracy,
        timeSpentMinutes: Math.round((rec.timeSpentMs / 60000) * 10) / 10,
      });
    }

    return points;
  }

  /**
   * Formats milliseconds into readable "HHh MMm" or "MMm SSs"
   */
  public static formatDuration(ms: number): string {
    const totalSeconds = Math.floor(ms / 1000);
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;

    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    if (minutes > 0) {
      return `${minutes}m ${seconds}s`;
    }
    return `${seconds}s`;
  }

  /**
   * Gets performance summary per operation
   */
  public static getOperationSummary(userState: UserState): Array<{
    operation: OperationType;
    name: string;
    symbol: string;
    totalQuestions: number;
    correct: number;
    wrong: number;
    accuracy: number;
    avgTimeSeconds: number;
    difficultyScore: number;
  }> {
    const opMeta: Record<OperationType, { name: string; symbol: string }> = {
      addition: { name: 'Adição', symbol: '+' },
      subtraction: { name: 'Subtração', symbol: '-' },
      multiplication: { name: 'Multiplicação', symbol: '×' },
      division: { name: 'Divisão', symbol: '÷' },
    };

    return (['addition', 'subtraction', 'multiplication', 'division'] as OperationType[]).map((op) => {
      const stat = userState.stats.byOperation[op] || {
        totalQuestions: 0,
        correct: 0,
        wrong: 0,
        accuracy: 0,
        avgTimeMs: 0,
        difficultyScore: 1,
      };

      return {
        operation: op,
        name: opMeta[op].name,
        symbol: opMeta[op].symbol,
        totalQuestions: stat.totalQuestions,
        correct: stat.correct,
        wrong: stat.wrong,
        accuracy: stat.accuracy,
        avgTimeSeconds: Math.round((stat.avgTimeMs / 1000) * 10) / 10,
        difficultyScore: Math.round(stat.difficultyScore * 10) / 10,
      };
    });
  }
}
