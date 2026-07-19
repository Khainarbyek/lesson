import { describe, expect, it } from "vitest";
import { createAdditionProblem, createNextAdditionProblem, isAdditionAnswerCorrect } from "../lib/additionPractice";

describe("addition practice helpers", () => {
  it("creates an addition problem inside an inclusive range", () => {
    const rolls = [0, 0.999];
    const problem = createAdditionProblem({ min: 0, max: 10 }, () => rolls.shift() ?? 0);

    expect(problem).toEqual({ left: 0, right: 10, answer: 10 });
  });

  it("creates problems for the 0-100 range", () => {
    const rolls = [0.42, 1];
    const problem = createAdditionProblem({ min: 0, max: 100 }, () => rolls.shift() ?? 0);

    expect(problem).toEqual({ left: 42, right: 100, answer: 142 });
  });

  it("avoids repeating the same problem when possible", () => {
    const rolls = [0.2, 0.3, 0.4, 0.5];
    const previous = { left: 2, right: 3, answer: 5 };
    const problem = createNextAdditionProblem({ min: 0, max: 10 }, previous, () => rolls.shift() ?? 0);

    expect(problem).toEqual({ left: 4, right: 5, answer: 9 });
  });

  it("checks typed answers exactly", () => {
    const problem = { left: 4, right: 5, answer: 9 };

    expect(isAdditionAnswerCorrect("9", problem)).toBe(true);
    expect(isAdditionAnswerCorrect(" 09 ", problem)).toBe(true);
    expect(isAdditionAnswerCorrect("8", problem)).toBe(false);
    expect(isAdditionAnswerCorrect("9.5", problem)).toBe(false);
    expect(isAdditionAnswerCorrect("9abc", problem)).toBe(false);
  });
});
