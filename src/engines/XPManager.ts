import { XP_CONFIG } from '../config/constants';
import { getStreakXpMultiplier } from '../config/xpConfig';
import { calculateEffectiveMultiplier } from '../config/progressionConfig';
import {
  XPAuditEvent,
  XPCalculationBreakdown,
  QuestionXPParams,
  QuestionXPCalculationResult,
} from '../types';

export interface XPCalculationResult {
  xp: number; // Final integer XP (rounded)
  baseXP: number; // Base XP before streak/event multipliers
  streakBonusXP: number; // Additional XP gained purely from streak
  streakMultiplier: number; // Multiplier applied
  speedTier: 'gold' | 'silver' | 'bronze' | 'none';
  timeTakenSeconds: number;
  isEligible: boolean;
  breakdown: XPCalculationBreakdown;
}

export class XPManager {
  // Maximum combined multiplier safety ceiling
  public static readonly MAX_COMBINED_MULTIPLIER = 3.0;

  /**
   * Translates a question's calibrated Difficulty Score (1 to 100+) into validated Base XP (10 to 50 XP).
   * 0–15:   10 XP (Muito Fácil)
   * 16–30:  15 XP (Fácil)
   * 31–45:  20 XP (Média)
   * 46–60:  25 XP (Média/Difícil)
   * 61–75:  30 XP (Difícil)
   * 76–90:  40 XP (Muito Difícil)
   * 91–100+: 50 XP (Extrema)
   */
  public static calculateBaseDifficultyXP(difficulty: number): {
    baseXP: number;
    tier: 'very_easy' | 'easy' | 'medium' | 'medium_hard' | 'hard' | 'very_hard' | 'extreme';
  } {
    const score = Math.max(1, difficulty);

    if (score <= 15) {
      return { baseXP: 10, tier: 'very_easy' };
    } else if (score <= 30) {
      return { baseXP: 15, tier: 'easy' };
    } else if (score <= 45) {
      return { baseXP: 20, tier: 'medium' };
    } else if (score <= 60) {
      return { baseXP: 25, tier: 'medium_hard' };
    } else if (score <= 75) {
      return { baseXP: 30, tier: 'hard' };
    } else if (score <= 90) {
      return { baseXP: 40, tier: 'very_hard' };
    } else {
      return { baseXP: 50, tier: 'extreme' };
    }
  }

  /**
   * Calculates dynamic Speed Modifier based on response time and game mode.
   * Standard mode:
   *  - Very Fast (<6s): +20% (1.20x)
   *  - Fast (6-15s):    +10% (1.10x)
   *  - Normal (>15s):   1.00x
   * Math Quick mode (Cálculo Rápido):
   *  - 1.30x (<4s), 1.15x (<8s), 1.00x
   */
  public static calculateSpeedModifier(timeTakenMs: number, gameMode?: string): {
    speedModifier: number;
    speedBonusPercent: string;
  } {
    const seconds = timeTakenMs / 1000;

    if (gameMode === 'calculo_rapido') {
      if (seconds <= 4.0) return { speedModifier: 1.3, speedBonusPercent: '+30%' };
      if (seconds <= 8.0) return { speedModifier: 1.15, speedBonusPercent: '+15%' };
      return { speedModifier: 1.0, speedBonusPercent: '+0%' };
    }

    if (seconds <= 6.0) {
      return { speedModifier: 1.2, speedBonusPercent: '+20%' };
    } else if (seconds <= 15.0) {
      return { speedModifier: 1.1, speedBonusPercent: '+10%' };
    } else {
      return { speedModifier: 1.0, speedBonusPercent: '+0%' };
    }
  }

  /**
   * PRIMARY CENTRALIZED QUESTION XP ENGINE
   * Formula:
   * FINAL_XP = BASE_DIFFICULTY_XP × SPEED_MODIFIER × STREAK_MULTIPLIER × MODE_MODIFIER × EVENT_MODIFIER
   * 
   * Strict Rules:
   * - Incorrect answer -> 0 XP
   * - Base XP between 10 and 50 XP
   * - Final XP can scale with streaks and speed
   * - Anti-farming guard with moderate efficiency factor
   * - Multiplier cap prevents inflation
   */
  public static calculateQuestionXP(params: QuestionXPParams): QuestionXPCalculationResult {
    const {
      difficulty,
      timeTakenMs,
      currentStreak,
      isCorrect,
      gameMode = 'infinite',
      userMastery = 0,
      isManuallySelectedLowDifficulty = false,
      eventMultiplier = 1.0,
    } = params;

    const seconds = timeTakenMs / 1000;
    const { baseXP, tier } = this.calculateBaseDifficultyXP(difficulty);

    if (!isCorrect) {
      return {
        finalXP: 0,
        baseXP: 0,
        speedModifier: 1.0,
        speedBonusXP: 0,
        streakMultiplier: 1.0,
        streakBonusXP: 0,
        modeModifier: 1.0,
        eventMultiplier: 1.0,
        isAntiFarmed: false,
        timeTakenSeconds: seconds,
        difficultyTier: tier,
        breakdown: {
          baseXP: 0,
          speedBonusXP: 0,
          streakBonusXP: 0,
          finalXP: 0,
          explanation: 'Resposta incorreta ou tempo esgotado (0 XP)',
        },
      };
    }

    // 1. Speed modifier
    const { speedModifier, speedBonusPercent } = this.calculateSpeedModifier(timeTakenMs, gameMode);

    // 2. Streak multiplier
    const streakMultiplier = getStreakXpMultiplier(currentStreak);

    // 3. Mode modifier
    let modeModifier = 1.0;
    if (gameMode === 'sem_erros' || gameMode === 'vestibular_rush') {
      modeModifier = 1.15;
    }

    // 4. Anti-farming guard
    let isAntiFarmed = false;
    let antiFarmEfficiency = 1.0;
    if (isManuallySelectedLowDifficulty && userMastery >= 75 && difficulty <= 25) {
      isAntiFarmed = true;
      antiFarmEfficiency = 0.6; // 60% efficiency for intentionally farming very low difficulty
    }

    // 5. Stacking & Multiplier Cap
    const rawMultiplier = speedModifier * streakMultiplier * modeModifier * eventMultiplier * antiFarmEfficiency;
    const effectiveMultiplier = Math.min(this.MAX_COMBINED_MULTIPLIER, rawMultiplier);

    const finalXP = Math.max(1, Math.round(baseXP * effectiveMultiplier));

    // Breakdown components calculation
    const speedBonusXP = Math.round(baseXP * (speedModifier - 1));
    const streakBonusXP = Math.max(0, finalXP - (baseXP + speedBonusXP));

    const breakdownExplanation = isAntiFarmed
      ? `Base ${baseXP} XP × Streak ${streakMultiplier}x (${speedBonusPercent} Velocidade) [Treino de revisão: eficiência 60%]`
      : `Base ${baseXP} XP + Velocidade ${speedBonusPercent} + Streak ${streakMultiplier}x`;

    return {
      finalXP,
      baseXP,
      speedModifier,
      speedBonusXP,
      streakMultiplier,
      streakBonusXP,
      modeModifier,
      eventMultiplier,
      isAntiFarmed,
      antiFarmEfficiency,
      timeTakenSeconds: seconds,
      difficultyTier: tier,
      breakdown: {
        baseXP,
        speedBonusXP,
        streakBonusXP,
        finalXP,
        explanation: breakdownExplanation,
      },
    };
  }

  /**
   * Legacy method for backward compatibility with Math quick calculation screens
   */
  public static calculateBaseSpeedXP(
    isCorrect: boolean,
    timeTakenMs: number
  ): { baseXP: number; speedTier: 'gold' | 'silver' | 'bronze' | 'none'; seconds: number } {
    if (!isCorrect) {
      return {
        baseXP: XP_CONFIG.WRONG_OR_TIMEOUT_XP,
        speedTier: 'none',
        seconds: timeTakenMs / 1000,
      };
    }

    const seconds = timeTakenMs / 1000;

    if (seconds <= XP_CONFIG.TIER_1_MAX_SECONDS) {
      return { baseXP: XP_CONFIG.TIER_1_XP, speedTier: 'gold', seconds };
    } else if (seconds <= XP_CONFIG.TIER_2_MAX_SECONDS) {
      return { baseXP: XP_CONFIG.TIER_2_XP, speedTier: 'silver', seconds };
    } else if (seconds <= XP_CONFIG.TIER_3_MAX_SECONDS) {
      return { baseXP: XP_CONFIG.TIER_3_XP, speedTier: 'bronze', seconds };
    } else {
      return { baseXP: XP_CONFIG.WRONG_OR_TIMEOUT_XP, speedTier: 'none', seconds };
    }
  }

  /**
   * Legacy calculateXP method maintained for existing math game runner
   */
  public static calculateXP(
    isCorrect: boolean,
    timeTakenMs: number,
    currentStreak: number = 0,
    difficultyModifier: number = 1.0,
    eventModifier: number = 1.0
  ): XPCalculationResult {
    const { baseXP, speedTier, seconds } = this.calculateBaseSpeedXP(isCorrect, timeTakenMs);

    if (!isCorrect || baseXP === 0) {
      const breakdown: XPCalculationBreakdown = {
        baseXP: 0,
        speedTier: 'none',
        timeTakenSeconds: seconds,
        streak: 0,
        streakMultiplier: 1.0,
        streakBonusXP: 0,
        difficultyModifier: 1.0,
        eventModifier: 1.0,
        finalXP: 0,
        isEligible: false,
      };

      return {
        xp: 0,
        baseXP: 0,
        streakBonusXP: 0,
        streakMultiplier: 1.0,
        speedTier: 'none',
        timeTakenSeconds: seconds,
        isEligible: false,
        breakdown,
      };
    }

    const streakMultiplier = getStreakXpMultiplier(currentStreak);
    const safeDiffModifier = Math.max(0.5, Math.min(2.0, difficultyModifier));
    const safeEventModifier = Math.max(1.0, Math.min(5.0, eventModifier));

    const { effectiveMultiplier } = calculateEffectiveMultiplier(
      streakMultiplier,
      safeDiffModifier,
      safeEventModifier
    );

    const finalXP = Math.round(baseXP * effectiveMultiplier);
    const streakBonusXP = Math.max(0, finalXP - baseXP);

    const breakdown: XPCalculationBreakdown = {
      baseXP,
      speedTier,
      timeTakenSeconds: seconds,
      streak: currentStreak,
      streakMultiplier,
      streakBonusXP,
      difficultyModifier: safeDiffModifier,
      eventModifier: safeEventModifier,
      finalXP,
      isEligible: true,
    };

    return {
      xp: finalXP,
      baseXP,
      streakBonusXP,
      streakMultiplier,
      speedTier,
      timeTakenSeconds: seconds,
      isEligible: true,
      breakdown,
    };
  }

  /**
   * Helper to construct a typed audit event for logging and cloud synchronization
   */
  public static createAuditEvent(
    questionId: string,
    userId: string,
    isCorrect: boolean,
    timeTakenMs: number,
    prevStreak: number,
    nextStreak: number,
    xpResult: XPCalculationResult,
    difficultyScore: number,
    sessionId?: string
  ): XPAuditEvent {
    return {
      questionId,
      sessionId,
      userId,
      isCorrect,
      timeTakenMs,
      baseXP: xpResult.baseXP,
      previousStreak: prevStreak,
      nextStreak,
      streakMultiplier: xpResult.streakMultiplier,
      streakBonusXP: xpResult.streakBonusXP,
      difficultyModifier: xpResult.breakdown.difficultyModifier,
      eventModifier: xpResult.breakdown.eventModifier,
      finalXP: xpResult.xp,
      difficultyScore,
      timestamp: Date.now(),
    };
  }

  /**
   * Anticheat verification: verifies timestamps, calculates expected progressive XP
   */
  public static verifySubmission(
    userAnswer: number,
    correctAnswer: number,
    clientStartedAt: number,
    clientAnsweredAt: number,
    serverReceivedAt: number,
    validStreak: number = 0
  ): { valid: boolean; xp: number; timeTakenMs: number; streakMultiplier: number; reason?: string } {
    const isCorrect = userAnswer === correctAnswer;
    const timeTakenMs = clientAnsweredAt - clientStartedAt;

    if (timeTakenMs < 50) {
      return {
        valid: false,
        xp: 0,
        timeTakenMs,
        streakMultiplier: 1.0,
        reason: 'Tempo de resposta desumanamente rápido (<50ms).',
      };
    }

    if (clientAnsweredAt > serverReceivedAt + 5000) {
      return {
        valid: false,
        xp: 0,
        timeTakenMs,
        streakMultiplier: 1.0,
        reason: 'Horário do cliente inconsistente com o servidor.',
      };
    }

    const { xp, streakMultiplier } = this.calculateXP(isCorrect, timeTakenMs, validStreak);
    return { valid: true, xp, timeTakenMs, streakMultiplier };
  }
}
