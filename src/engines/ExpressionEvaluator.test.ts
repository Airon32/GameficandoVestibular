import { describe, expect, it } from 'vitest';
import { ExpressionEvaluator } from './ExpressionEvaluator';

describe('ExpressionEvaluator', () => {
  it('respects multiplication and division precedence', () => {
    expect(ExpressionEvaluator.evaluateExpressionString('10 + 5 × 4 - 12 ÷ 3')).toBe(26);
  });

  it('respects parentheses', () => {
    expect(ExpressionEvaluator.evaluateExpressionString('(10 + 5) × (8 - 3)')).toBe(75);
  });

  it('handles decimals without eval', () => {
    expect(ExpressionEvaluator.evaluateExpressionString('2.5 × 4 + 0.5')).toBe(10.5);
  });

  it('counts the structural operator limit correctly', () => {
    expect(ExpressionEvaluator.countOperators('1 + 2 × 3 - 4 ÷ 2')).toBe(4);
  });
});
