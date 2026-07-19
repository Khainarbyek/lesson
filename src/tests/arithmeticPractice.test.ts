import { describe, expect, it } from "vitest";
import {
  createArithmeticProblem,
  createNextArithmeticProblem,
  isArithmeticAnswerCorrect
} from "../lib/arithmeticPractice";

describe("arithmetic practice helpers", () => {
  it("creates an addition problem inside an inclusive range", () => {
    const rolls = [0, 0.999];
    const problem = createArithmeticProblem("addition", { min: 0, max: 10 }, () => rolls.shift() ?? 0);

    expect(problem).toEqual({ operationId: "addition", left: 0, right: 10, answer: 10, symbol: "+" });
  });

  it("creates subtraction problems without negative answers", () => {
    const rolls = [0.2, 0.8];
    const problem = createArithmeticProblem("subtraction", { min: 0, max: 10 }, () => rolls.shift() ?? 0);

    expect(problem).toEqual({ operationId: "subtraction", left: 8, right: 2, answer: 6, symbol: "-" });
  });

  it("creates multiplication problems for the 0-100 range", () => {
    const rolls = [0.42, 1];
    const problem = createArithmeticProblem("multiplication", { min: 0, max: 100 }, () => rolls.shift() ?? 0);

    expect(problem).toEqual({ operationId: "multiplication", left: 42, right: 100, answer: 4200, symbol: "×" });
  });

  it("creates division problems with whole-number answers", () => {
    const rolls = [0.6, 0.5];
    const problem = createArithmeticProblem("division", { min: 0, max: 10 }, () => rolls.shift() ?? 0);

    expect(problem).toEqual({ operationId: "division", left: 6, right: 3, answer: 2, symbol: "÷" });
  });

  it("avoids repeating the same problem when possible", () => {
    const rolls = [0.2, 0.3, 0.4, 0.5];
    const previous = { operationId: "addition" as const, left: 2, right: 3, answer: 5, symbol: "+" };
    const problem = createNextArithmeticProblem("addition", { min: 0, max: 10 }, previous, () => rolls.shift() ?? 0);

    expect(problem).toEqual({ operationId: "addition", left: 4, right: 5, answer: 9, symbol: "+" });
  });

  it("checks typed answers exactly", () => {
    const problem = { operationId: "addition" as const, left: 4, right: 5, answer: 9, symbol: "+" };

    expect(isArithmeticAnswerCorrect("9", problem)).toBe(true);
    expect(isArithmeticAnswerCorrect(" 09 ", problem)).toBe(true);
    expect(isArithmeticAnswerCorrect("8", problem)).toBe(false);
    expect(isArithmeticAnswerCorrect("9.5", problem)).toBe(false);
    expect(isArithmeticAnswerCorrect("9abc", problem)).toBe(false);
  });
});
