export type ArithmeticOperationId = "addition" | "subtraction" | "multiplication" | "division";

export type ArithmeticProblemRange = {
  min: number;
  max: number;
};

export type ArithmeticProblem = {
  operationId: ArithmeticOperationId;
  left: number;
  right: number;
  answer: number;
  symbol: string;
};

export const arithmeticOperationSymbols: Record<ArithmeticOperationId, string> = {
  addition: "+",
  subtraction: "-",
  multiplication: "×",
  division: "÷"
};

const WHOLE_NUMBER_PATTERN = /^\d+$/;

function randomIntegerBetween(min: number, max: number, rng: () => number): number {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  const span = upper - lower + 1;
  const roll = Math.min(span - 1, Math.max(0, Math.floor(rng() * span)));

  return lower + roll;
}

function createDivisionProblem(range: ArithmeticProblemRange, rng: () => number): ArithmeticProblem {
  const left = randomIntegerBetween(range.min, range.max, rng);
  const divisors = Array.from({ length: Math.max(1, Math.floor(range.max)) }, (_, index) => index + 1).filter(
    (divisor) => left % divisor === 0
  );
  const divisorIndex = randomIntegerBetween(0, divisors.length - 1, rng);
  const right = divisors[divisorIndex];

  return {
    operationId: "division",
    left,
    right,
    answer: left / right,
    symbol: arithmeticOperationSymbols.division
  };
}

export function createArithmeticProblem(
  operationId: ArithmeticOperationId,
  range: ArithmeticProblemRange,
  rng: () => number = Math.random
): ArithmeticProblem {
  if (operationId === "division") {
    return createDivisionProblem(range, rng);
  }

  const first = randomIntegerBetween(range.min, range.max, rng);
  const second = randomIntegerBetween(range.min, range.max, rng);

  if (operationId === "subtraction") {
    const left = Math.max(first, second);
    const right = Math.min(first, second);

    return {
      operationId,
      left,
      right,
      answer: left - right,
      symbol: arithmeticOperationSymbols[operationId]
    };
  }

  return {
    operationId,
    left: first,
    right: second,
    answer: operationId === "addition" ? first + second : first * second,
    symbol: arithmeticOperationSymbols[operationId]
  };
}

export function createNextArithmeticProblem(
  operationId: ArithmeticOperationId,
  range: ArithmeticProblemRange,
  previous: ArithmeticProblem,
  rng: () => number = Math.random
): ArithmeticProblem {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const next = createArithmeticProblem(operationId, range, rng);
    if (next.left !== previous.left || next.right !== previous.right || next.operationId !== previous.operationId) {
      return next;
    }
  }

  return createArithmeticProblem(operationId, range, rng);
}

export function isArithmeticAnswerCorrect(value: string, problem: ArithmeticProblem): boolean {
  const normalizedValue = value.trim();

  if (!WHOLE_NUMBER_PATTERN.test(normalizedValue)) {
    return false;
  }

  return Number(normalizedValue) === problem.answer;
}
