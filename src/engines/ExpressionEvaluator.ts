import { ASTNode } from '../types';

/**
 * Safe Mathematical Expression Evaluator and AST processor.
 * Completely eliminates eval() and enforces strict mathematical operator precedence (BODMAS/PEMDAS).
 */
export class ExpressionEvaluator {
  /**
   * Safely evaluates an ASTNode tree into a numeric result.
   */
  public static evaluateAST(node: ASTNode): number {
    if (node.type === 'number') {
      return node.value ?? 0;
    }

    if (node.type === 'parentheses') {
      if (!node.inner) return 0;
      return this.evaluateAST(node.inner);
    }

    if (node.type === 'binary_op') {
      if (!node.left || !node.right) return 0;
      const leftVal = this.evaluateAST(node.left);
      const rightVal = this.evaluateAST(node.right);

      switch (node.op) {
        case '+':
          return leftVal + rightVal;
        case '-':
          return leftVal - rightVal;
        case '×':
          return leftVal * rightVal;
        case '÷':
          if (rightVal === 0) return 0;
          return leftVal / rightVal;
        default:
          return 0;
      }
    }

    return 0;
  }

  /**
   * Converts an ASTNode tree into a clean formatted mathematical expression string.
   */
  public static formatASTToString(node: ASTNode): string {
    if (node.type === 'number') {
      return (node.value ?? 0).toString();
    }

    if (node.type === 'parentheses') {
      if (!node.inner) return '';
      return `(${this.formatASTToString(node.inner)})`;
    }

    if (node.type === 'binary_op') {
      if (!node.left || !node.right) return '';
      const leftStr = this.formatASTToString(node.left);
      const rightStr = this.formatASTToString(node.right);
      return `${leftStr} ${node.op} ${rightStr}`;
    }

    return '';
  }

  /**
   * Safe parser for mathematical expressions with standard precedence without using eval().
   * Handles: +, -, ×, *, ÷, /, and parentheses.
   */
  public static evaluateExpressionString(expr: string): number {
    // Standardize tokens
    const cleanExpr = expr
      .replace(/×/g, '*')
      .replace(/÷/g, '/')
      .replace(/\s+/g, '');

    const tokens: string[] = [];
    let currentNumber = '';

    for (let i = 0; i < cleanExpr.length; i++) {
      const char = cleanExpr[i];
      if ((char >= '0' && char <= '9') || char === '.') {
        currentNumber += char;
      } else {
        if (currentNumber) {
          tokens.push(currentNumber);
          currentNumber = '';
        }
        if (['+', '-', '*', '/', '(', ')'].includes(char)) {
          tokens.push(char);
        }
      }
    }
    if (currentNumber) {
      tokens.push(currentNumber);
    }

    // Shunting-Yard Algorithm to convert Infix to Postfix (RPN)
    const outputQueue: (number | string)[] = [];
    const operatorStack: string[] = [];

    const precedence: Record<string, number> = {
      '+': 1,
      '-': 1,
      '*': 2,
      '/': 2,
    };

    for (const token of tokens) {
      const num = parseFloat(token);
      if (!isNaN(num) && !['+', '-', '*', '/', '(', ')'].includes(token)) {
        outputQueue.push(num);
      } else if (token === '(') {
        operatorStack.push(token);
      } else if (token === ')') {
        while (operatorStack.length > 0 && operatorStack[operatorStack.length - 1] !== '(') {
          outputQueue.push(operatorStack.pop()!);
        }
        operatorStack.pop(); // discard '('
      } else if (['+', '-', '*', '/'].includes(token)) {
        while (
          operatorStack.length > 0 &&
          operatorStack[operatorStack.length - 1] !== '(' &&
          precedence[operatorStack[operatorStack.length - 1]] >= precedence[token]
        ) {
          outputQueue.push(operatorStack.pop()!);
        }
        operatorStack.push(token);
      }
    }

    while (operatorStack.length > 0) {
      outputQueue.push(operatorStack.pop()!);
    }

    // Evaluate RPN
    const evalStack: number[] = [];
    for (const token of outputQueue) {
      if (typeof token === 'number') {
        evalStack.push(token);
      } else {
        const b = evalStack.pop() ?? 0;
        const a = evalStack.pop() ?? 0;
        switch (token) {
          case '+':
            evalStack.push(a + b);
            break;
          case '-':
            evalStack.push(a - b);
            break;
          case '*':
            evalStack.push(a * b);
            break;
          case '/':
            evalStack.push(b === 0 ? 0 : a / b);
            break;
        }
      }
    }

    return evalStack.length > 0 ? evalStack[0] : 0;
  }

  /**
   * Counts the exact number of mathematical operators in an expression or AST.
   */
  public static countOperators(exprOrNode: string | ASTNode): number {
    if (typeof exprOrNode === 'string') {
      const matches = exprOrNode.match(/[+\-×÷*/]/g);
      return matches ? matches.length : 0;
    }

    // Node-based count
    if (exprOrNode.type === 'binary_op') {
      const leftCount = exprOrNode.left ? this.countOperators(exprOrNode.left) : 0;
      const rightCount = exprOrNode.right ? this.countOperators(exprOrNode.right) : 0;
      return 1 + leftCount + rightCount;
    }
    if (exprOrNode.type === 'parentheses' && exprOrNode.inner) {
      return this.countOperators(exprOrNode.inner);
    }
    return 0;
  }

  /**
   * Evaluates the intrinsic expression complexity score.
   * Considers structural count, precedence mixing, number scale, and non-trivial calculations.
   */
  public static calculateExpressionComplexity(
    expressionString: string,
    operands: number[],
    operators: string[],
    hasParentheses: boolean
  ): number {
    let score = 0;

    // 1. Structural base weight (number of operators)
    const opCount = operators.length;
    score += opCount * 18;

    // 2. Mixed precedence bonus (e.g. + and × together requires mental precedence parsing)
    const hasAddSub = operators.some((o) => o === '+' || o === '-');
    const hasMulDiv = operators.some((o) => o === '×' || o === '÷' || o === '*' || o === '/');
    if (hasAddSub && hasMulDiv) {
      score += 25; // Significant mental step requirement
    }

    // 3. Parentheses complexity
    if (hasParentheses) {
      score += 20;
    }

    // 4. Numerical scale and non-trivial operands
    for (const num of operands) {
      if (num >= 1000) {
        score += 15;
      } else if (num >= 100) {
        score += 8;
      } else if (num >= 20) {
        score += 3;
      }

      // Penalty if number is excessively trivial (e.g., 0, 1, 10, 100)
      if (num === 0 || num === 1 || num === 10 || num === 100) {
        score -= 2;
      }
    }

    // 5. Operator-specific weighting
    for (const op of operators) {
      if (op === '×' || op === '*') score += 8;
      if (op === '÷' || op === '/') score += 10;
      if (op === '+' || op === '-') score += 3;
    }

    return Math.max(1, Math.round(score));
  }
}
