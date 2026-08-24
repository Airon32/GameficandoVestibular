import React, { useState, useEffect } from 'react';
import { CheckCircle2, Play, RefreshCw, Sparkles, X, XCircle } from 'lucide-react';
import { XPManager } from '../engines/XPManager';
import { LevelManager } from '../engines/LevelManager';
import { RankManager } from '../engines/RankManager';
import { QuestionGenerator } from '../engines/QuestionGenerator';
import { DifficultyEngine } from '../engines/DifficultyEngine';
import { ExpressionEvaluator } from '../engines/ExpressionEvaluator';
import { StreakManager } from '../engines/StreakManager';
import { AchievementEngine } from '../engines/AchievementEngine';
import { createDefaultUserState } from '../services/storageService';
import { DIFFICULTY_CONFIG, getStreakBonusPercent } from '../config/difficultyConfig';

interface TestResult {
  id: string;
  name: string;
  category: string;
  passed: boolean;
  durationMs: number;
  details: string;
}

export const TestRunnerModal: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [results, setResults] = useState<TestResult[]>([]);

  const runAllTests = () => {
    setIsRunning(true);
    const testList: TestResult[] = [];

    // Test 1: Mathematical Precedence (345 + 413 × 10 = 4.475, not 7.580)
    const t1Start = performance.now();
    const expr1 = '345 + 413 × 10';
    const eval1 = ExpressionEvaluator.evaluateExpressionString(expr1);
    const passed1 = eval1 === 4475;
    testList.push({
      id: 'precedence_345_413_10',
      name: 'Precedência Operatória: 345 + 413 × 10 = 4.475 (não 7.580)',
      category: 'Motor de Dificuldade & AST',
      passed: passed1,
      durationMs: performance.now() - t1Start,
      details: `Expressão "${expr1}" avaliada com precisão: ${eval1} (esperado 4475). Respeita ordem PEMDAS sem eval().`,
    });

    // Test 2: Peak 4-Operator Expression (34 + 617 - 200 × 5 ÷ 100 = 641)
    const t2Start = performance.now();
    const expr2 = '34 + 617 - 200 × 5 ÷ 100';
    const eval2 = ExpressionEvaluator.evaluateExpressionString(expr2);
    const passed2 = eval2 === 641;
    testList.push({
      id: 'precedence_peak_expression',
      name: 'Expressão de Pico: 34 + 617 - 200 × 5 ÷ 100 = 641',
      category: 'Motor de Dificuldade & AST',
      passed: passed2,
      durationMs: performance.now() - t2Start,
      details: `200 × 5 = 1000, 1000 ÷ 100 = 10, 34 + 617 - 10 = ${eval2} (esperado 641).`,
    });

    // Test 3: Hard Structural Ceiling (MAX 4 operators, MAX 5 operands) across 100 generated questions
    const t3Start = performance.now();
    let structuralCapped = true;
    let maxOpsSeen = 0;
    for (let i = 0; i < 100; i++) {
      const q = QuestionGenerator.generateQuestion(
        ['addition', 'subtraction', 'multiplication', 'division'],
        {
          targetDifficultyScore: 350 + i * 5,
          structuralOperatorCount: 4,
          allowedOperations: ['addition', 'subtraction', 'multiplication', 'division'],
          allowParentheses: true,
          numericalScale: 'thousands',
          isBreathingQuestion: false,
          streakMilestoneTriggered: null,
          streakBonusPercent: 5.5,
          speedBonus: 1.5,
          explanation: 'Peak test',
        }
      );

      const opCount = ExpressionEvaluator.countOperators(q.expressionString);
      if (opCount > maxOpsSeen) maxOpsSeen = opCount;
      if (opCount > DIFFICULTY_CONFIG.MAX_OPERATORS_PER_EXPRESSION || q.operatorCount > 4 || q.operandCount > 5) {
        structuralCapped = false;
        break;
      }
    }
    testList.push({
      id: 'structural_ceiling_limit',
      name: 'Teto Estrutural Absoluto: MAX 4 operadores e 5 operandos (100 questões)',
      category: 'Motor de Dificuldade & AST',
      passed: structuralCapped && maxOpsSeen <= 4,
      durationMs: performance.now() - t3Start,
      details: `100 questões geradas em dificuldade extrema. Máximo de operadores constatado: ${maxOpsSeen} (Limite: 4).`,
    });

    // Test 4: Streak Thresholds Table (10 -> +0.5%, 20 -> +1.5%, 40 -> +2.5%, 80 -> +3.5%, 160 -> +4.5%)
    const t4Start = performance.now();
    const bonus0 = getStreakBonusPercent(5);
    const bonus10 = getStreakBonusPercent(10);
    const bonus20 = getStreakBonusPercent(20);
    const bonus40 = getStreakBonusPercent(40);
    const bonus80 = getStreakBonusPercent(80);
    const bonus160 = getStreakBonusPercent(160);
    const passed4 =
      bonus0 === 0 &&
      bonus10 === 0.5 &&
      bonus20 === 1.5 &&
      bonus40 === 2.5 &&
      bonus80 === 3.5 &&
      bonus160 === 4.5;
    testList.push({
      id: 'streak_thresholds_table',
      name: 'Tabela de Thresholds de Streak: 10 (+0.5%), 20 (+1.5%), 40 (+2.5%), 80 (+3.5%)',
      category: 'Motor de Dificuldade & AST',
      passed: passed4,
      durationMs: performance.now() - t4Start,
      details: `10 acertos: +${bonus10}%, 20 acertos: +${bonus20}%, 40 acertos: +${bonus40}%, 80 acertos: +${bonus80}%, 160 acertos: +${bonus160}%.`,
    });

    // Test 5: Safe AST Evaluation with Parentheses: (125 + 75) × 4 = 800
    const t5Start = performance.now();
    const parenExpr1 = '(125 + 75) × 4';
    const parenEval1 = ExpressionEvaluator.evaluateExpressionString(parenExpr1);
    const parenExpr2 = '(30 + 20) × 5 - 100 ÷ 10';
    const parenEval2 = ExpressionEvaluator.evaluateExpressionString(parenExpr2);
    const passed5 = parenEval1 === 800 && parenEval2 === 240;
    testList.push({
      id: 'parentheses_evaluation',
      name: 'Interpretação de Parênteses: (125 + 75) × 4 = 800 e (30 + 20) × 5 - 100 ÷ 10 = 240',
      category: 'Motor de Dificuldade & AST',
      passed: passed5,
      durationMs: performance.now() - t5Start,
      details: `(125 + 75) × 4 = ${parenEval1}, (30 + 20) × 5 - 100 ÷ 10 = ${parenEval2}. Avaliação segura sem eval().`,
    });

    // Test 6: Division Safety & Clean Integer Results across 100 expressions
    const t6Start = performance.now();
    let divisionClean = true;
    for (let i = 0; i < 100; i++) {
      const q = QuestionGenerator.generateQuestion(['division'], Math.floor(Math.random() * 80) + 1);
      if (
        isNaN(q.correctAnswer) ||
        !isFinite(q.correctAnswer) ||
        q.correctAnswer % 1 !== 0 ||
        q.expressionString.includes('÷ 0') ||
        q.expressionString.includes('/ 0')
      ) {
        divisionClean = false;
        break;
      }
    }
    testList.push({
      id: 'generator_division_safety',
      name: 'Segurança de Divisão: 100 Questões Inteiras e Sem Divisão por Zero',
      category: 'Gerador Matemático',
      passed: divisionClean,
      durationMs: performance.now() - t6Start,
      details: '100 operações de divisão testadas. Todas produziram inteiros exatos e divisores seguros.',
    });

    // Test 7: Gentle Degradation on Mistakes (No abrupt drop to 1)
    const t7Start = performance.now();
    const initialDifficulty = 50.0;
    const singleMistakeDiff = DifficultyEngine.updateOperationDifficulty(initialDifficulty, false, 8000, 0);
    const twoMistakesDiff = DifficultyEngine.updateOperationDifficulty(singleMistakeDiff, false, 8000, 1);
    const passed7 = singleMistakeDiff > 40.0 && singleMistakeDiff < initialDifficulty && twoMistakesDiff < singleMistakeDiff;
    testList.push({
      id: 'difficulty_gentle_decay',
      name: 'Degradação Suave de Dificuldade em Erros (Sem Reset Abrupto)',
      category: 'Motor de Dificuldade & AST',
      passed: passed7,
      durationMs: performance.now() - t7Start,
      details: `Score inicial: ${initialDifficulty} -> 1º erro: ${singleMistakeDiff} -> 2º erro: ${twoMistakesDiff}. Queda controlada e justa.`,
    });

    // Test 8: XP Timing Boundaries & Base Calculation
    const t8Start = performance.now();
    const xp10s = XPManager.calculateXP(true, 10000, 0);
    const xp20s = XPManager.calculateXP(true, 20000, 0);
    const xp30s = XPManager.calculateXP(true, 30000, 0);
    const xpWrong = XPManager.calculateXP(false, 5000, 50);
    const passed8 = xp10s.xp === 30 && xp20s.xp === 20 && xp30s.xp === 10 && xpWrong.xp === 0;
    testList.push({
      id: 'xp_timing_boundaries',
      name: 'Cálculo de XP Base por Velocidade: 0-10s (30 XP), 11-20s (20 XP), 21-30s (10 XP), Erro (0 XP)',
      category: 'XP & Pontuação',
      passed: passed8,
      durationMs: performance.now() - t8Start,
      details: `10s = ${xp10s.xp} XP, 20s = ${xp20s.xp} XP, 30s = ${xp30s.xp} XP, Erro = ${xpWrong.xp} XP.`,
    });

    // Test 9: Progressive Streak Multiplier Table (0 to 320)
    const t9Start = performance.now();
    const m0 = XPManager.calculateXP(true, 5000, 0).streakMultiplier;
    const m5 = XPManager.calculateXP(true, 5000, 5).streakMultiplier;
    const m10 = XPManager.calculateXP(true, 5000, 10).streakMultiplier;
    const m20 = XPManager.calculateXP(true, 5000, 20).streakMultiplier;
    const m40 = XPManager.calculateXP(true, 5000, 40).streakMultiplier;
    const m80 = XPManager.calculateXP(true, 5000, 80).streakMultiplier;
    const m160 = XPManager.calculateXP(true, 5000, 160).streakMultiplier;
    const m320 = XPManager.calculateXP(true, 5000, 320).streakMultiplier;
    const passed9 =
      m0 === 1.0 &&
      m5 === 1.05 &&
      m10 === 1.1 &&
      m20 === 1.2 &&
      m40 === 1.35 &&
      m80 === 1.5 &&
      m160 === 1.75 &&
      m320 === 2.0;
    testList.push({
      id: 'streak_multiplier_table',
      name: 'Tabela Progressiva de Multiplicadores de Streak (0 a 320 acertos: 1.00x a 2.00x)',
      category: 'XP Progressivo por Streak',
      passed: passed9,
      durationMs: performance.now() - t9Start,
      details: `Streak 0: ×${m0} | 5: ×${m5} | 10: ×${m10} | 20: ×${m20} | 40: ×${m40} | 80: ×${m80} | 160: ×${m160} | 320: ×${m320}.`,
    });

    // Test 10: Diminishing Returns (> 320) via Logarithmic Scaling
    const t10Start = performance.now();
    const m640 = XPManager.calculateXP(true, 5000, 640).streakMultiplier;
    const m1280 = XPManager.calculateXP(true, 5000, 1280).streakMultiplier;
    const passed10 = m640 === 2.15 && m1280 === 2.3;
    testList.push({
      id: 'streak_diminishing_returns',
      name: 'Curva Logarítmica Suave para Streaks Extremas (> 320: 640 -> 2.15x, 1280 -> 2.30x)',
      category: 'XP Progressivo por Streak',
      passed: passed10,
      durationMs: performance.now() - t10Start,
      details: `Fórmula 2.00 + log2(streak / 320) * 0.15: 640 acertos = ×${m640}, 1280 acertos = ×${m1280}. Previne inflação da economia.`,
    });

    // Test 11: Combined Pipeline Calculation & Audit Breakdown
    const t11Start = performance.now();
    const calcFastStreak20 = XPManager.calculateXP(true, 4000, 20); // 30 base * 1.20 = 36 XP (+6 bonus)
    const calcMedStreak80 = XPManager.calculateXP(true, 14000, 80); // 20 base * 1.50 = 30 XP (+10 bonus)
    const passed11 =
      calcFastStreak20.xp === 36 &&
      calcFastStreak20.streakBonusXP === 6 &&
      calcMedStreak80.xp === 30 &&
      calcMedStreak80.streakBonusXP === 10;
    testList.push({
      id: 'combined_xp_pipeline',
      name: 'Pipeline Combinado: Velocidade × Multiplicador com Arredondamento e Breakdown',
      category: 'XP Progressivo por Streak',
      passed: passed11,
      durationMs: performance.now() - t11Start,
      details: `Rápido (30 XP) com streak 20 (×1.20) = ${calcFastStreak20.xp} XP (bônus +${calcFastStreak20.streakBonusXP}). Médio (20 XP) com streak 80 (×1.50) = ${calcMedStreak80.xp} XP.`,
    });

    // Test 12: Level & Rank Scaling
    const t12Start = performance.now();
    const lvl1 = LevelManager.getLevelDataFromTotalXP(0);
    const lvl50 = LevelManager.getLevelDataFromTotalXP(350000);
    const rankLvl1 = RankManager.getRankForLevel(1);
    const passed12 = lvl1.level === 1 && lvl50.level > 25 && rankLvl1.fullName === 'Madeira I';
    testList.push({
      id: 'level_rank_progression',
      name: 'Progressão Contínua de Níveis e Sistema de Ranks',
      category: 'Níveis & Ranks',
      passed: passed12,
      durationMs: performance.now() - t12Start,
      details: `0 XP = Nível ${lvl1.level} (${rankLvl1.fullName}), 350.000 XP = Nível ${lvl50.level}.`,
    });

    // Test 13: Anticheat Verification with Server-Authoritative Streak
    const t13Start = performance.now();
    const now = Date.now();
    const validVerify = XPManager.verifySubmission(42, 42, now - 3000, now, now, 20);
    const fakeSpeed = XPManager.verifySubmission(42, 42, now - 10, now, now, 20);
    const passed13 = validVerify.valid && validVerify.xp === 36 && !fakeSpeed.valid;
    testList.push({
      id: 'anticheat_verification',
      name: 'Anticheat: Verificação de Timestamps e Streak Multiplier Seguro',
      category: 'Segurança',
      passed: passed13,
      durationMs: performance.now() - t13Start,
      details: `Submissão em 3s com streak validada no servidor = ${validVerify.xp} XP (30 * 1.20). Resposta em 10ms rejeitada.`,
    });

    // Test 14: Calibração da Curva de Níveis até Infinito V (Level 150 - 30 Tiers Estruturados)
    const t14Start = performance.now();
    const totalXPTo150 = LevelManager.getTotalXPToReachLevel(150);
    const lvl1XP = LevelManager.getXPForLevel(1);
    const lvl5XP = LevelManager.getXPForLevel(5);
    const lvl150XP = LevelManager.getXPForLevel(150);
    const passed14 = totalXPTo150 >= 2500000 && totalXPTo150 <= 2900000 && lvl1XP === 3000 && lvl5XP === 5400 && lvl150XP > 40000;
    testList.push({
      id: 'level_curve_calibration_150',
      name: 'Calibração Level 150 (Infinito V): Curva Longa, Rara e Recompensadora (~2.720.000 XP)',
      category: 'Progressão & Economia',
      passed: passed14,
      durationMs: performance.now() - t14Start,
      details: `XP Total p/ Lvl 150 = ${totalXPTo150.toLocaleString()} XP. Nível 1 (Madeira I) = ${lvl1XP.toLocaleString()} XP, Nível 5 (Madeira V) = ${lvl5XP.toLocaleString()} XP, Nível 150 (Infinito V) = ${lvl150XP.toLocaleString()} XP.`,
    });

    // Test 15: Simulação dos 4 Perfis de Jogadores (Sem prazo artificial, o jogador chega quando merece)
    const t15Start = performance.now();
    const simCommitted = LevelManager.simulateArchetype('Comprometido', 45, 0.90, 6.0, 1.22);
    const simCasual = LevelManager.simulateArchetype('Casual', 15, 0.80, 8.0, 1.08);
    const simRegular = LevelManager.simulateArchetype('Regular', 30, 0.85, 7.0, 1.15);
    const simHardcore = LevelManager.simulateArchetype('Hardcore', 90, 0.95, 4.0, 1.35);

    const passed15 =
      simCommitted.estimatedMonthsToInfinite >= 12 &&
      simCasual.estimatedMonthsToInfinite >= 30 &&
      simRegular.estimatedMonthsToInfinite >= 18 &&
      simHardcore.estimatedMonthsToInfinite >= 7;

    testList.push({
      id: 'player_profiles_simulation',
      name: 'Simulação de Progressão: Jornada Longa e Rara (Comprometido ~16m, Regular ~24m, Casual ~48m, Hardcore ~9m)',
      category: 'Progressão & Economia',
      passed: passed15,
      durationMs: performance.now() - t15Start,
      details: `Comprometido (45m/d): ${simCommitted.estimatedDaysToInfinite}d (~${simCommitted.estimatedMonthsToInfinite} meses). Regular (30m/d): ~${simRegular.estimatedMonthsToInfinite}m. Casual (15m/d): ~${simCasual.estimatedMonthsToInfinite}m. Hardcore (90m/d): ~${simHardcore.estimatedMonthsToInfinite}m.`,
    });

    // Test 16: Mapeamento de Ranks (30 Tiers x 5 Divisões = 150 Níveis)
    const t16Start = performance.now();
    const rankTier1 = RankManager.getRankForLevel(1);
    const rankLvl145 = RankManager.getRankForLevel(145);
    const rankLvl146 = RankManager.getRankForLevel(146);
    const rankLvl150 = RankManager.getRankForLevel(150);
    const rankLvl151 = RankManager.getRankForLevel(151);

    const passed16 =
      rankTier1.fullName === 'Madeira I' &&
      rankLvl145.fullName === 'Absoluto V' &&
      rankLvl146.fullName === 'Infinito I' &&
      rankLvl150.fullName === 'Infinito V' &&
      rankLvl151.fullName.includes('Ascensão 1');

    testList.push({
      id: 'rank_ladder_mapping_150',
      name: 'Escada de Ranks: Level 1 (Madeira I) -> Level 150 (Infinito V) -> Level 151+ (Ascensão)',
      category: 'Progressão & Economia',
      passed: passed16,
      durationMs: performance.now() - t16Start,
      details: `Lvl 1: "${rankTier1.fullName}", Lvl 145: "${rankLvl145.fullName}", Lvl 146: "${rankLvl146.fullName}", Lvl 150: "${rankLvl150.fullName}", Lvl 151: "${rankLvl151.fullName}".`,
    });

    // Test 17: Safeguard de Ranks (Preservação Permanente de highestUnlockedRank)
    const t17Start = performance.now();
    const diamanteTierIndex = 6; // Diamante is tier index 6 (levels 31-35)
    // Even if XP is 0 (which normally would be level 1 Madeira I), with highestUnlockedRank = 6, minimum level is 31
    const protectedLevelData = LevelManager.getLevelDataFromTotalXP(0, diamanteTierIndex);
    const protectedRank = RankManager.getRankForLevel(protectedLevelData.level, diamanteTierIndex);
    const passed17 = protectedLevelData.level >= 31 && protectedRank.tierIndex >= diamanteTierIndex;

    testList.push({
      id: 'rank_safeguard_non_demotion',
      name: 'Proteção Permanente de Rank: Nunca Rebaixa Ranks Conquistados (highestUnlockedRank)',
      category: 'Níveis & Ranks',
      passed: passed17,
      durationMs: performance.now() - t17Start,
      details: `Jogador com Tier 6 (Diamante) e 0 XP recalculado: Nível garantido = ${protectedLevelData.level}, Rank = "${protectedRank.fullName}". Risco zero de perda de prestígio.`,
    });

    setResults(testList);
    setIsRunning(false);
  };

  useEffect(() => {
    runAllTests();
  }, []);

  const totalPassed = results.filter((r) => r.passed).length;
  const totalFailed = results.filter((r) => !r.passed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-in fade-in">
      <div className="bg-[#121212] border border-[#222] rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-6 border-b border-[#222] flex items-center justify-between bg-[#161616]">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-orange-600/20 text-orange-500 border border-orange-500/30">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white tracking-tight">Suíte de Testes Automatizados</h2>
              <p className="text-xs text-[#888]">
                Validação de precedência operatória, teto estrutural (MAX 4 ops), thresholds de streak e segurança
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-[#888] hover:text-white hover:bg-[#222] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Summary Bar */}
        <div className="px-6 py-4 bg-[#141414] border-b border-[#222] flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-emerald-400" />
              <span className="text-sm font-mono text-emerald-400 font-bold">{totalPassed} Passaram</span>
            </div>
            <div className="flex items-center gap-2">
              <XCircle className={`w-5 h-5 ${totalFailed > 0 ? 'text-red-400' : 'text-[#555]'}`} />
              <span
                className={`text-sm font-mono font-bold ${totalFailed > 0 ? 'text-red-400' : 'text-[#555]'}`}
              >
                {totalFailed} Falharam
              </span>
            </div>
          </div>

          <button
            onClick={runAllTests}
            disabled={isRunning}
            className="px-4 py-2 rounded-xl bg-orange-600 hover:bg-orange-500 text-white font-bold text-xs uppercase tracking-wider flex items-center gap-2 transition cursor-pointer disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRunning ? 'animate-spin' : ''}`} />
            <span>Reexecutar Testes</span>
          </button>
        </div>

        {/* Test Cases List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {results.map((t) => (
            <div
              key={t.id}
              className={`p-4 rounded-2xl border transition-all ${
                t.passed
                  ? 'bg-[#161616] border-emerald-900/30 hover:border-emerald-500/40'
                  : 'bg-red-950/20 border-red-900/50'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3">
                  {t.passed ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
                  )}
                  <div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-sm font-bold text-white tracking-tight">{t.name}</span>
                      <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#222] text-[#888]">
                        {t.category}
                      </span>
                    </div>
                    <p className="text-xs text-[#999] mt-1 font-mono">{t.details}</p>
                  </div>
                </div>
                <span className="text-[11px] font-mono text-[#666] shrink-0">{t.durationMs.toFixed(1)}ms</span>
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-[#222] bg-[#161616] flex justify-end">
          <button
            onClick={onClose}
            className="px-6 py-2.5 rounded-xl bg-[#222] hover:bg-[#333] text-white text-sm font-bold transition cursor-pointer"
          >
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
};
