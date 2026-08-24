import { DailyActivityRecord, StreakData, UserState } from '../types';

export class StreakManager {
  /**
   * Returns current date string in user's local timezone (YYYY-MM-DD)
   */
  public static getLocalDateString(date: Date = new Date()): string {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
  }

  /**
   * Gets date string for N days ago
   */
  public static getOffsetDateString(offsetDays: number, baseDate: Date = new Date()): string {
    const d = new Date(baseDate);
    d.setDate(d.getDate() - offsetDays);
    return this.getLocalDateString(d);
  }

  /**
   * Evaluates streak and updates daily activity after a question is solved
   */
  public static processActivity(
    userState: UserState,
    isCorrect: boolean,
    xpEarned: number,
    timeTakenMs: number
  ): {
    updatedDailyActivity: Record<string, DailyActivityRecord>;
    updatedStreak: StreakData;
    goalReachedNow: boolean;
    streakIncremented: boolean;
  } {
    const todayStr = this.getLocalDateString();
    const dailyGoal = userState.settings?.dailyGoal || 10;

    const existingToday = userState.stats.dailyActivity[todayStr] || {
      date: todayStr,
      questionsCount: 0,
      correctCount: 0,
      xpGained: 0,
      goalReached: false,
      timeSpentMs: 0,
    };

    const prevGoalReached = existingToday.goalReached;
    const newQuestionsCount = existingToday.questionsCount + 1;
    const newCorrectCount = existingToday.correctCount + (isCorrect ? 1 : 0);
    const newXPGained = existingToday.xpGained + xpEarned;
    const newTimeSpent = existingToday.timeSpentMs + timeTakenMs;
    const newGoalReached = newCorrectCount >= dailyGoal;

    const goalReachedNow = !prevGoalReached && newGoalReached;

    const updatedToday: DailyActivityRecord = {
      date: todayStr,
      questionsCount: newQuestionsCount,
      correctCount: newCorrectCount,
      xpGained: newXPGained,
      goalReached: newGoalReached,
      timeSpentMs: newTimeSpent,
    };

    const updatedDailyActivity = {
      ...userState.stats.dailyActivity,
      [todayStr]: updatedToday,
    };

    let updatedStreak: StreakData = { ...userState.streak };
    let streakIncremented = false;

    // Check streak advancement if goal was newly reached today
    if (goalReachedNow) {
      const yesterdayStr = this.getOffsetDateString(1);
      const yesterdayActivity = updatedDailyActivity[yesterdayStr];

      if (userState.streak.lastActiveDate === todayStr) {
        // Already active today
      } else if (userState.streak.lastActiveDate === yesterdayStr || (yesterdayActivity && yesterdayActivity.goalReached)) {
        // Continued streak from yesterday!
        updatedStreak.currentStreak += 1;
        updatedStreak.maxStreak = Math.max(updatedStreak.maxStreak, updatedStreak.currentStreak);
        updatedStreak.lastActiveDate = todayStr;
        streakIncremented = true;
      } else if (!userState.streak.lastActiveDate) {
        // First streak ever!
        updatedStreak.currentStreak = 1;
        updatedStreak.maxStreak = Math.max(updatedStreak.maxStreak, 1);
        updatedStreak.lastActiveDate = todayStr;
        streakIncremented = true;
      } else {
        // Streak was broken; check if streak freeze can protect
        if (updatedStreak.streakFreezes > 0) {
          updatedStreak.streakFreezes -= 1;
          updatedStreak.currentStreak += 1;
          updatedStreak.maxStreak = Math.max(updatedStreak.maxStreak, updatedStreak.currentStreak);
          updatedStreak.lastActiveDate = todayStr;
          streakIncremented = true;
        } else {
          // Reset streak to 1
          updatedStreak.currentStreak = 1;
          updatedStreak.maxStreak = Math.max(updatedStreak.maxStreak, 1);
          updatedStreak.lastActiveDate = todayStr;
          streakIncremented = true;
        }
      }
    }

    return {
      updatedDailyActivity,
      updatedStreak,
      goalReachedNow,
      streakIncremented,
    };
  }
}
