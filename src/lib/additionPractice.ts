export type AdditionProblemRange = {
  min: number;
  max: number;
};

export type AdditionProblem = {
  left: number;
  right: number;
  answer: number;
};

function randomIntegerBetween(min: number, max: number, rng: () => number): number {
  const lower = Math.ceil(min);
  const upper = Math.floor(max);
  const span = upper - lower + 1;
  const roll = Math.min(span - 1, Math.max(0, Math.floor(rng() * span)));

  return lower + roll;
}

export function createAdditionProblem(range: AdditionProblemRange, rng: () => number = Math.random): AdditionProblem {
  const left = randomIntegerBetween(range.min, range.max, rng);
  const right = randomIntegerBetween(range.min, range.max, rng);

  return {
    left,
    right,
    answer: left + right
  };
}

export function createNextAdditionProblem(
  range: AdditionProblemRange,
  previous: AdditionProblem,
  rng: () => number = Math.random
): AdditionProblem {
  for (let attempt = 0; attempt < 6; attempt += 1) {
    const next = createAdditionProblem(range, rng);
    if (next.left !== previous.left || next.right !== previous.right) {
      return next;
    }
  }

  return createAdditionProblem(range, rng);
}

export function isAdditionAnswerCorrect(value: string, problem: AdditionProblem): boolean {
  const normalizedValue = value.trim();

  if (!/^\d+$/.test(normalizedValue)) {
    return false;
  }

  return Number(normalizedValue) === problem.answer;
}
