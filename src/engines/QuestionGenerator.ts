import { DIFFICULTY_CONFIG } from '../config/difficultyConfig';
import { OperationType, Question } from '../types';
import { DifficultyEngine, DifficultyProfile } from './DifficultyEngine';
import { ExpressionEvaluator } from './ExpressionEvaluator';

export class QuestionGenerator {
  private static recentExpressions: string[] = [];

  private static getRandomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Generates a calibrated math question based on enabled operations and difficulty score or profile
   */
  public static generateQuestion(
    enabledOperations: OperationType[] = ['addition', 'subtraction', 'multiplication', 'division'],
    difficultyScoreOrProfile: number | DifficultyProfile = 1
  ): Question {
    const profile: DifficultyProfile =
      typeof difficultyScoreOrProfile === 'object'
        ? difficultyScoreOrProfile
        : {
            targetDifficultyScore: difficultyScoreOrProfile,
            structuralOperatorCount: this.getOperatorCountForScore(difficultyScoreOrProfile),
            allowedOperations: enabledOperations,
            allowParentheses: difficultyScoreOrProfile >= 70,
            numericalScale: this.getNumericalScaleForScore(difficultyScoreOrProfile),
            isBreathingQuestion: false,
            streakMilestoneTriggered: null,
            streakBonusPercent: 0,
            speedBonus: 0,
            explanation: `Score: ${difficultyScoreOrProfile}`,
          };

    // Cap structural operator count strictly at MAX_OPERATORS_PER_EXPRESSION (4)
    const operatorCount = Math.min(
      DIFFICULTY_CONFIG.MAX_OPERATORS_PER_EXPRESSION,
      Math.max(1, profile.structuralOperatorCount)
    );

    let attempts = 0;
    let question: Question | null = null;

    while (attempts < 10) {
      attempts++;
      question = this.buildQuestionByOperatorCount(operatorCount, profile);
      // Avoid immediate consecutive duplicate questions
      if (!this.recentExpressions.includes(question.expressionString)) {
        break;
      }
    }

    if (!question) {
      question = this.buildQuestionByOperatorCount(1, profile);
    }

    // Record in recent expressions ring buffer (max 12)
    this.recentExpressions.push(question.expressionString);
    if (this.recentExpressions.length > 12) {
      this.recentExpressions.shift();
    }

    return question;
  }

  private static getOperatorCountForScore(score: number): number {
    if (score >= 110) return 4;
    if (score >= 55) return 3;
    if (score >= 22) return 2;
    return 1;
  }

  private static getNumericalScaleForScore(score: number): 'single' | 'double' | 'triple' | 'thousands' | 'unlimited' {
    if (score <= 10) return 'single';
    if (score <= 35) return 'double';
    if (score <= 80) return 'triple';
    if (score <= 180) return 'thousands';
    return 'unlimited';
  }

  /**
   * Router for expression generation based on operator count (1, 2, 3, or 4)
   */
  private static buildQuestionByOperatorCount(opCount: number, profile: DifficultyProfile): Question {
    const id = `q_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const now = Date.now();

    if (opCount === 1) {
      return this.generateSingleOperationQuestion(id, profile, now);
    } else if (opCount === 2) {
      return this.generateTwoOperatorQuestion(id, profile, now);
    } else if (opCount === 3) {
      return this.generateThreeOperatorQuestion(id, profile, now);
    } else {
      // 4 operators (Peak Structural Ceiling: 4 operators, 5 operands)
      return this.generateFourOperatorQuestion(id, profile, now);
    }
  }

  /**
   * 1 Operator / 2 Operands (e.g. 7 + 5, 365 - 130, 742 × 8, 1440 ÷ 12)
   */
  private static generateSingleOperationQuestion(id: string, profile: DifficultyProfile, startedAt: number): Question {
    const ops = profile.allowedOperations.length > 0 ? profile.allowedOperations : ['addition', 'subtraction', 'multiplication', 'division'];
    const chosenOp = ops[Math.floor(Math.random() * ops.length)] as OperationType;
    const diff = profile.targetDifficultyScore;

    let num1 = 0;
    let num2 = 0;
    let symbol = '+';
    let answer = 0;

    switch (chosenOp) {
      case 'addition': {
        symbol = '+';
        if (diff <= 8) {
          num1 = this.getRandomInt(1, 9);
          num2 = this.getRandomInt(1, 9);
        } else if (diff <= 25) {
          num1 = this.getRandomInt(15, 60);
          num2 = this.getRandomInt(10, 45);
        } else if (diff <= 60) {
          num1 = this.getRandomInt(100, 750);
          num2 = this.getRandomInt(80, 500);
        } else if (diff <= 120) {
          num1 = this.getRandomInt(1000, 4500);
          num2 = this.getRandomInt(500, 3500);
        } else {
          num1 = this.getRandomInt(3000, 15000);
          num2 = this.getRandomInt(1500, 12000);
        }
        answer = num1 + num2;
        break;
      }
      case 'subtraction': {
        symbol = '-';
        if (diff <= 8) {
          num1 = this.getRandomInt(3, 10);
          num2 = this.getRandomInt(1, num1);
        } else if (diff <= 25) {
          num1 = this.getRandomInt(20, 80);
          num2 = this.getRandomInt(5, num1 - 5);
        } else if (diff <= 60) {
          num1 = this.getRandomInt(150, 950);
          num2 = this.getRandomInt(50, num1 - 30);
        } else if (diff <= 120) {
          num1 = this.getRandomInt(1200, 6000);
          num2 = this.getRandomInt(300, num1 - 200);
        } else {
          num1 = this.getRandomInt(4000, 20000);
          num2 = this.getRandomInt(1000, num1 - 500);
        }
        answer = num1 - num2;
        break;
      }
      case 'multiplication': {
        symbol = '×';
        if (diff <= 8) {
          num1 = this.getRandomInt(2, 6);
          num2 = this.getRandomInt(2, 6);
        } else if (diff <= 25) {
          num1 = this.getRandomInt(6, 12);
          num2 = this.getRandomInt(4, 9);
        } else if (diff <= 60) {
          num1 = this.getRandomInt(12, 45);
          num2 = this.getRandomInt(6, 18);
        } else if (diff <= 120) {
          num1 = this.getRandomInt(35, 125);
          num2 = this.getRandomInt(12, 35);
        } else {
          num1 = this.getRandomInt(75, 250);
          num2 = this.getRandomInt(18, 65);
        }
        answer = num1 * num2;
        break;
      }
      case 'division': {
        symbol = '÷';
        let divisor = 2;
        let quotient = 2;
        if (diff <= 8) {
          divisor = this.getRandomInt(2, 5);
          quotient = this.getRandomInt(2, 5);
        } else if (diff <= 25) {
          divisor = this.getRandomInt(3, 9);
          quotient = this.getRandomInt(4, 12);
        } else if (diff <= 60) {
          divisor = this.getRandomInt(6, 18);
          quotient = this.getRandomInt(10, 35);
        } else if (diff <= 120) {
          divisor = this.getRandomInt(12, 32);
          quotient = this.getRandomInt(25, 80);
        } else {
          divisor = this.getRandomInt(15, 60);
          quotient = this.getRandomInt(40, 150);
        }
        if (divisor === 0) divisor = 2;
        num1 = divisor * quotient;
        num2 = divisor;
        answer = quotient;
        break;
      }
    }

    const expressionString = `${num1} ${symbol} ${num2}`;
    const complexityScore = ExpressionEvaluator.calculateExpressionComplexity(expressionString, [num1, num2], [symbol], false);

    return {
      id,
      num1,
      num2,
      symbol,
      expressionString,
      operation: chosenOp,
      correctAnswer: answer,
      difficultyScore: diff,
      expressionComplexityScore: complexityScore,
      structuralDifficulty: 1,
      operatorCount: 1,
      operandCount: 2,
      hasParentheses: false,
      startedAt,
    };
  }

  /**
   * 2 Operators / 3 Operands (e.g. 45 + 30 × 2, 320 - 80 ÷ 4, 345 + 413 × 10, (125 + 75) × 4)
   * Strictly respects precedence!
   */
  private static generateTwoOperatorQuestion(id: string, profile: DifficultyProfile, startedAt: number): Question {
    const diff = profile.targetDifficultyScore;
    const withParen = profile.allowParentheses && Math.random() < 0.4;
    const patternType = this.getRandomInt(1, 4);

    let expr = '';
    let operands: number[] = [];
    let ops: string[] = [];

    if (withParen) {
      // Pattern with parentheses: (A + B) × C or (A - B) × C or (A + B) ÷ C
      const subPattern = this.getRandomInt(1, 2);
      if (subPattern === 1) {
        // (A + B) × C
        const a = diff > 50 ? this.getRandomInt(25, 150) : this.getRandomInt(10, 50);
        const b = diff > 50 ? this.getRandomInt(15, 120) : this.getRandomInt(5, 30);
        const c = diff > 50 ? this.getRandomInt(3, 12) : this.getRandomInt(2, 6);
        expr = `(${a} + ${b}) × ${c}`;
        operands = [a, b, c];
        ops = ['+', '×'];
      } else {
        // (A + B) ÷ C with exact integer result
        const c = this.getRandomInt(2, 8);
        const quotient = diff > 50 ? this.getRandomInt(15, 60) : this.getRandomInt(5, 20);
        const sumTarget = c * quotient;
        const a = Math.floor(sumTarget * 0.6);
        const b = sumTarget - a;
        expr = `(${a} + ${b}) ÷ ${c}`;
        operands = [a, b, c];
        ops = ['+', '÷'];
      }
    } else {
      // Standard precedence patterns:
      // Pattern 1: A + B × C (e.g. 345 + 413 × 10)
      // Pattern 2: A - B × C (e.g. 500 - 35 × 6)
      // Pattern 3: A + B ÷ C (e.g. 145 + 720 ÷ 8)
      // Pattern 4: A × B - C (e.g. 125 × 4 - 235)
      switch (patternType) {
        case 1: {
          const b = diff > 60 ? this.getRandomInt(15, 120) : this.getRandomInt(5, 30);
          const c = diff > 60 ? this.getRandomInt(4, 15) : this.getRandomInt(2, 8);
          const a = diff > 60 ? this.getRandomInt(50, 400) : this.getRandomInt(10, 80);
          expr = `${a} + ${b} × ${c}`;
          operands = [a, b, c];
          ops = ['+', '×'];
          break;
        }
        case 2: {
          const b = diff > 60 ? this.getRandomInt(12, 60) : this.getRandomInt(4, 15);
          const c = diff > 60 ? this.getRandomInt(4, 12) : this.getRandomInt(2, 6);
          const product = b * c;
          const a = product + (diff > 60 ? this.getRandomInt(50, 350) : this.getRandomInt(15, 70));
          expr = `${a} - ${b} × ${c}`;
          operands = [a, b, c];
          ops = ['-', '×'];
          break;
        }
        case 3: {
          const c = this.getRandomInt(3, 12);
          const quotient = diff > 60 ? this.getRandomInt(15, 80) : this.getRandomInt(5, 25);
          const b = c * quotient;
          const a = diff > 60 ? this.getRandomInt(40, 300) : this.getRandomInt(10, 60);
          expr = `${a} + ${b} ÷ ${c}`;
          operands = [a, b, c];
          ops = ['+', '÷'];
          break;
        }
        case 4:
        default: {
          const a = diff > 60 ? this.getRandomInt(15, 60) : this.getRandomInt(5, 20);
          const b = diff > 60 ? this.getRandomInt(4, 12) : this.getRandomInt(2, 6);
          const product = a * b;
          const c = Math.max(5, product - (diff > 60 ? this.getRandomInt(10, 100) : this.getRandomInt(5, 25)));
          expr = `${a} × ${b} - ${c}`;
          operands = [a, b, c];
          ops = ['×', '-'];
          break;
        }
      }
    }

    const answer = Math.round(ExpressionEvaluator.evaluateExpressionString(expr));
    const complexityScore = ExpressionEvaluator.calculateExpressionComplexity(expr, operands, ops, withParen);

    return {
      id,
      expressionString: expr,
      operation: 'mixed_expression',
      correctAnswer: answer,
      difficultyScore: diff,
      expressionComplexityScore: complexityScore,
      structuralDifficulty: 2,
      operatorCount: 2,
      operandCount: 3,
      hasParentheses: withParen,
      startedAt,
    };
  }

  /**
   * 3 Operators / 4 Operands (e.g. 240 + 35 × 8 - 90, 720 ÷ 9 + 145 × 2, 1250 - 48 × 12 + 360)
   */
  private static generateThreeOperatorQuestion(id: string, profile: DifficultyProfile, startedAt: number): Question {
    const diff = profile.targetDifficultyScore;
    const withParen = profile.allowParentheses && Math.random() < 0.35;
    const patternType = this.getRandomInt(1, 4);

    let expr = '';
    let operands: number[] = [];
    let ops: string[] = [];

    if (withParen) {
      // (A + B) × C - D or (A - B) × (C + D)
      const a = diff > 90 ? this.getRandomInt(40, 180) : this.getRandomInt(15, 60);
      const b = diff > 90 ? this.getRandomInt(20, 120) : this.getRandomInt(10, 40);
      const c = diff > 90 ? this.getRandomInt(3, 10) : this.getRandomInt(2, 5);
      const d = diff > 90 ? this.getRandomInt(20, 150) : this.getRandomInt(10, 50);
      expr = `(${a} + ${b}) × ${c} - ${d}`;
      operands = [a, b, c, d];
      ops = ['+', '×', '-'];
    } else {
      switch (patternType) {
        case 1: {
          // A + B × C - D (e.g. 240 + 35 × 8 - 90)
          const b = diff > 90 ? this.getRandomInt(20, 75) : this.getRandomInt(8, 30);
          const c = diff > 90 ? this.getRandomInt(4, 12) : this.getRandomInt(3, 8);
          const a = diff > 90 ? this.getRandomInt(80, 500) : this.getRandomInt(25, 120);
          const d = diff > 90 ? this.getRandomInt(30, 250) : this.getRandomInt(10, 60);
          expr = `${a} + ${b} × ${c} - ${d}`;
          operands = [a, b, c, d];
          ops = ['+', '×', '-'];
          break;
        }
        case 2: {
          // A ÷ B + C × D (e.g. 720 ÷ 9 + 145 × 2)
          const b = this.getRandomInt(4, 12);
          const quotient = diff > 90 ? this.getRandomInt(25, 90) : this.getRandomInt(10, 40);
          const a = b * quotient;
          const c = diff > 90 ? this.getRandomInt(20, 120) : this.getRandomInt(8, 35);
          const d = diff > 90 ? this.getRandomInt(3, 8) : this.getRandomInt(2, 5);
          expr = `${a} ÷ ${b} + ${c} × ${d}`;
          operands = [a, b, c, d];
          ops = ['÷', '+', '×'];
          break;
        }
        case 3: {
          // A - B × C + D (e.g. 1250 - 48 × 12 + 360)
          const b = diff > 90 ? this.getRandomInt(18, 55) : this.getRandomInt(6, 20);
          const c = diff > 90 ? this.getRandomInt(4, 14) : this.getRandomInt(3, 8);
          const product = b * c;
          const a = product + (diff > 90 ? this.getRandomInt(150, 800) : this.getRandomInt(40, 180));
          const d = diff > 90 ? this.getRandomInt(50, 400) : this.getRandomInt(15, 90);
          expr = `${a} - ${b} × ${c} + ${d}`;
          operands = [a, b, c, d];
          ops = ['-', '×', '+'];
          break;
        }
        case 4:
        default: {
          // A ÷ B + C - D
          const b = this.getRandomInt(3, 12);
          const quotient = diff > 90 ? this.getRandomInt(30, 120) : this.getRandomInt(10, 45);
          const a = b * quotient;
          const c = diff > 90 ? this.getRandomInt(50, 350) : this.getRandomInt(15, 90);
          const d = diff > 90 ? this.getRandomInt(20, 180) : this.getRandomInt(8, 40);
          expr = `${a} ÷ ${b} + ${c} - ${d}`;
          operands = [a, b, c, d];
          ops = ['÷', '+', '-'];
          break;
        }
      }
    }

    const answer = Math.round(ExpressionEvaluator.evaluateExpressionString(expr));
    const complexityScore = ExpressionEvaluator.calculateExpressionComplexity(expr, operands, ops, withParen);

    return {
      id,
      expressionString: expr,
      operation: 'mixed_expression',
      correctAnswer: answer,
      difficultyScore: diff,
      expressionComplexityScore: complexityScore,
      structuralDifficulty: 3,
      operatorCount: 3,
      operandCount: 4,
      hasParentheses: withParen,
      startedAt,
    };
  }

  /**
   * 4 Operators / 5 Operands (PEAK STRUCTURAL CEILING)
   * STRICT GUARANTEE: Never generates more than 4 operators!
   * Examples:
   * 34 + 617 - 200 × 5 ÷ 100
   * 420 ÷ 7 + 85 × 6 - 30
   * 850 - 120 × 4 + 360 ÷ 6
   * 72 × 8 - 240 ÷ 5 + 125
   * 1200 ÷ 8 + 75 × 9 - 320
   */
  private static generateFourOperatorQuestion(id: string, profile: DifficultyProfile, startedAt: number): Question {
    const diff = profile.targetDifficultyScore;
    const withParen = profile.allowParentheses && Math.random() < 0.3;
    const patternType = this.getRandomInt(1, 4);

    let expr = '';
    let operands: number[] = [];
    let ops: string[] = [];

    if (withParen) {
      // (A + B) × C - D ÷ E (Strictly 4 operators: +, ×, -, ÷)
      const e = this.getRandomInt(2, 10);
      const divQuotient = diff > 150 ? this.getRandomInt(15, 60) : this.getRandomInt(5, 20);
      const d = e * divQuotient;
      const a = diff > 150 ? this.getRandomInt(25, 120) : this.getRandomInt(10, 40);
      const b = diff > 150 ? this.getRandomInt(15, 90) : this.getRandomInt(8, 30);
      const c = diff > 150 ? this.getRandomInt(3, 8) : this.getRandomInt(2, 5);
      expr = `(${a} + ${b}) × ${c} - ${d} ÷ ${e}`;
      operands = [a, b, c, d, e];
      ops = ['+', '×', '-', '÷'];
    } else {
      switch (patternType) {
        case 1: {
          // Exemplar: 34 + 617 - 200 × 5 ÷ 100
          // Construct C × D ÷ E to produce exact clean integer
          const e = diff > 180 ? this.getRandomInt(10, 50) : this.getRandomInt(5, 25);
          const targetMultiplier = diff > 180 ? this.getRandomInt(5, 30) : this.getRandomInt(2, 12);
          const product = e * targetMultiplier;
          // Decompose product into C and D
          const d = this.getRandomInt(2, 10);
          const c = Math.round(product / d) * d; // ensure clean multiple
          const actualProduct = c * d;
          const divResult = actualProduct / e;

          const a = diff > 180 ? this.getRandomInt(80, 850) : this.getRandomInt(25, 250);
          const b = diff > 180 ? this.getRandomInt(150, 1800) : this.getRandomInt(50, 650);

          expr = `${a} + ${b} - ${c} × ${d} ÷ ${e}`;
          operands = [a, b, c, d, e];
          ops = ['+', '-', '×', '÷'];
          break;
        }
        case 2: {
          // Exemplar: A ÷ B + C × D - E (e.g. 420 ÷ 7 + 85 × 6 - 30)
          const b = this.getRandomInt(4, 14);
          const q1 = diff > 180 ? this.getRandomInt(35, 140) : this.getRandomInt(15, 60);
          const a = b * q1;
          const c = diff > 180 ? this.getRandomInt(35, 180) : this.getRandomInt(12, 65);
          const d = diff > 180 ? this.getRandomInt(4, 14) : this.getRandomInt(2, 7);
          const e = diff > 180 ? this.getRandomInt(40, 350) : this.getRandomInt(10, 80);

          expr = `${a} ÷ ${b} + ${c} × ${d} - ${e}`;
          operands = [a, b, c, d, e];
          ops = ['÷', '+', '×', '-'];
          break;
        }
        case 3: {
          // Exemplar: A - B × C + D ÷ E (e.g. 850 - 120 × 4 + 360 ÷ 6)
          const b = diff > 180 ? this.getRandomInt(25, 90) : this.getRandomInt(10, 35);
          const c = diff > 180 ? this.getRandomInt(4, 12) : this.getRandomInt(2, 6);
          const mulResult = b * c;
          const a = mulResult + (diff > 180 ? this.getRandomInt(200, 1200) : this.getRandomInt(80, 400));

          const e = this.getRandomInt(3, 12);
          const q2 = diff > 180 ? this.getRandomInt(20, 100) : this.getRandomInt(8, 45);
          const d = e * q2;

          expr = `${a} - ${b} × ${c} + ${d} ÷ ${e}`;
          operands = [a, b, c, d, e];
          ops = ['-', '×', '+', '÷'];
          break;
        }
        case 4:
        default: {
          // Exemplar: A × B - C ÷ D + E (e.g. 72 × 8 - 240 ÷ 5 + 125)
          const a = diff > 180 ? this.getRandomInt(30, 110) : this.getRandomInt(12, 45);
          const b = diff > 180 ? this.getRandomInt(4, 12) : this.getRandomInt(3, 8);

          const d = this.getRandomInt(3, 12);
          const q = diff > 180 ? this.getRandomInt(20, 80) : this.getRandomInt(8, 35);
          const c = d * q;

          const e = diff > 180 ? this.getRandomInt(80, 500) : this.getRandomInt(25, 180);

          expr = `${a} × ${b} - ${c} ÷ ${d} + ${e}`;
          operands = [a, b, c, d, e];
          ops = ['×', '-', '÷', '+'];
          break;
        }
      }
    }

    // Strict validation: check operator count
    const totalOps = ExpressionEvaluator.countOperators(expr);
    if (totalOps > DIFFICULTY_CONFIG.MAX_OPERATORS_PER_EXPRESSION) {
      // Fallback safe 4-operator expression
      expr = `34 + 617 - 200 × 5 ÷ 100`;
      operands = [34, 617, 200, 5, 100];
      ops = ['+', '-', '×', '÷'];
    }

    const answer = Math.round(ExpressionEvaluator.evaluateExpressionString(expr));
    const complexityScore = ExpressionEvaluator.calculateExpressionComplexity(expr, operands, ops, withParen);

    return {
      id,
      expressionString: expr,
      operation: 'mixed_expression',
      correctAnswer: answer,
      difficultyScore: diff,
      expressionComplexityScore: complexityScore,
      structuralDifficulty: 4,
      operatorCount: 4,
      operandCount: 5,
      hasParentheses: withParen,
      startedAt,
    };
  }
}
