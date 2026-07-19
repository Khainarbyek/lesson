import { Check, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  createArithmeticProblem,
  createNextArithmeticProblem,
  isArithmeticAnswerCorrect,
  type ArithmeticOperationId,
  type ArithmeticProblem,
  type ArithmeticProblemRange
} from "../lib/arithmeticPractice";
import type { ArithmeticPracticeCopy } from "../lib/content";

type Props = {
  operationId: ArithmeticOperationId;
  title: string;
  subject: string;
  range: ArithmeticProblemRange;
  copy: ArithmeticPracticeCopy;
};

type Feedback = "correct" | "incorrect" | null;
type Score = {
  correct: number;
  attempts: number;
};
type SubmitEvent = {
  preventDefault: () => void;
};

const ARITHMETIC_FEEDBACK_DELAY_MS = 900;

export function ArithmeticActivity({ operationId, title, subject, range, copy }: Props) {
  const [problem, setProblem] = useState<ArithmeticProblem | null>(null);
  const [answer, setAnswer] = useState("");
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [score, setScore] = useState<Score>({ correct: 0, attempts: 0 });
  const feedbackTimeoutRef = useRef<number | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isLocked = feedback !== null || problem === null;

  function clearFeedbackTimeout() {
    if (feedbackTimeoutRef.current === null) {
      return;
    }

    window.clearTimeout(feedbackTimeoutRef.current);
    feedbackTimeoutRef.current = null;
  }

  function resetAnswerState() {
    setAnswer("");
    setFeedback(null);
    feedbackTimeoutRef.current = null;
    inputRef.current?.focus();
  }

  function showNextProblem() {
    setProblem((currentProblem) =>
      currentProblem
        ? createNextArithmeticProblem(operationId, range, currentProblem)
        : createArithmeticProblem(operationId, range)
    );
    resetAnswerState();
  }

  useEffect(() => {
    setProblem(createArithmeticProblem(operationId, range));
    setAnswer("");
    setFeedback(null);
    setScore({ correct: 0, attempts: 0 });
    clearFeedbackTimeout();
  }, [operationId, range.min, range.max]);

  useEffect(() => {
    return () => {
      clearFeedbackTimeout();
    };
  }, []);

  function checkAnswer(event: SubmitEvent) {
    event.preventDefault();

    if (isLocked || answer.trim() === "" || !problem) {
      return;
    }

    const isCorrect = isArithmeticAnswerCorrect(answer, problem);

    setFeedback(isCorrect ? "correct" : "incorrect");
    setScore((currentScore) => ({
      correct: currentScore.correct + (isCorrect ? 1 : 0),
      attempts: currentScore.attempts + 1
    }));
    clearFeedbackTimeout();
    feedbackTimeoutRef.current = window.setTimeout(() => {
      if (isCorrect) {
        showNextProblem();
        return;
      }

      resetAnswerState();
    }, ARITHMETIC_FEEDBACK_DELAY_MS);
  }

  function startNewProblem() {
    clearFeedbackTimeout();
    showNextProblem();
  }

  const inputStateClass =
    feedback === "correct" ? " is-correct" : feedback === "incorrect" ? " is-incorrect" : "";
  const operatorLabel = copy.operatorLabels[operationId];

  return (
    <section className="activity-shell arithmetic-shell" aria-labelledby="activity-title">
      <div className="activity-header">
        <div>
          <p className="activity-kicker">{subject}</p>
          <h2 id="activity-title">{title}</h2>
        </div>
        <span className="activity-progress">
          {score.correct} {copy.progress}
        </span>
      </div>

      <div className="arithmetic-problem-card" aria-label={copy.title}>
        <p>{copy.title}</p>
        <div className="arithmetic-equation" aria-live="polite">
          <span>{problem?.left ?? "?"}</span>
          <span aria-label={operatorLabel}>{problem?.symbol ?? "?"}</span>
          <span>{problem?.right ?? "?"}</span>
          <span>=</span>
          <span>?</span>
        </div>
      </div>

      <form className="arithmetic-form" onSubmit={checkAnswer}>
        <label className="arithmetic-answer-label" htmlFor="arithmetic-answer">
          {copy.answerLabel}
        </label>
        <div className="arithmetic-input-row">
          <input
            ref={inputRef}
            id="arithmetic-answer"
            className={`arithmetic-answer-input${inputStateClass}`}
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={answer}
            placeholder={copy.placeholder}
            disabled={isLocked}
            onChange={(event) => setAnswer(event.currentTarget.value)}
          />
          <button className="arithmetic-check-button" type="submit" disabled={isLocked || answer.trim() === ""}>
            <Check aria-hidden="true" focusable="false" strokeWidth={2.4} />
            <span>{copy.checkAnswer}</span>
          </button>
          <button className="arithmetic-new-button" type="button" onClick={startNewProblem}>
            <RotateCcw aria-hidden="true" focusable="false" strokeWidth={2.4} />
            <span>{copy.newProblem}</span>
          </button>
        </div>
      </form>

      <div className="feedback-row" aria-live="polite">
        {feedback === "correct" && <p className="feedback correct">{copy.correct}</p>}
        {feedback === "incorrect" && <p className="feedback incorrect">{copy.incorrect}</p>}
      </div>
    </section>
  );
}
