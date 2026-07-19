import { Check, RotateCcw } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import {
  createAdditionProblem,
  createNextAdditionProblem,
  isAdditionAnswerCorrect,
  type AdditionProblem,
  type AdditionProblemRange
} from "../lib/additionPractice";
import type { AdditionPracticeCopy } from "../lib/content";

type Props = {
  title: string;
  subject: string;
  range: AdditionProblemRange;
  copy: AdditionPracticeCopy;
};

type Feedback = "correct" | "incorrect" | null;
type Score = {
  correct: number;
  attempts: number;
};
type SubmitEvent = {
  preventDefault: () => void;
};

const ADDITION_FEEDBACK_DELAY_MS = 900;

export function AdditionActivity({ title, subject, range, copy }: Props) {
  const [problem, setProblem] = useState<AdditionProblem | null>(null);
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
      currentProblem ? createNextAdditionProblem(range, currentProblem) : createAdditionProblem(range)
    );
    resetAnswerState();
  }

  useEffect(() => {
    setProblem(createAdditionProblem(range));
    setAnswer("");
    setFeedback(null);
    setScore({ correct: 0, attempts: 0 });
    clearFeedbackTimeout();
  }, [range.min, range.max]);

  useEffect(() => {
    return () => {
      clearFeedbackTimeout();
    };
  }, []);

  function checkAnswer(event: SubmitEvent) {
    event.preventDefault();

    if (isLocked || answer.trim() === "") {
      return;
    }

    if (!problem) {
      return;
    }

    const isCorrect = isAdditionAnswerCorrect(answer, problem);

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
    }, ADDITION_FEEDBACK_DELAY_MS);
  }

  function startNewProblem() {
    clearFeedbackTimeout();
    showNextProblem();
  }

  const inputStateClass =
    feedback === "correct" ? " is-correct" : feedback === "incorrect" ? " is-incorrect" : "";

  return (
    <section className="activity-shell addition-shell" aria-labelledby="activity-title">
      <div className="activity-header">
        <div>
          <p className="activity-kicker">{subject}</p>
          <h2 id="activity-title">{title}</h2>
        </div>
        <span className="activity-progress">
          {score.correct} {copy.progress}
        </span>
      </div>

      <div className="addition-problem-card" aria-label={copy.title}>
        <p>{copy.title}</p>
        <div className="addition-equation" aria-live="polite">
          <span>{problem?.left ?? "?"}</span>
          <span aria-label="plus">+</span>
          <span>{problem?.right ?? "?"}</span>
          <span>=</span>
          <span>?</span>
        </div>
      </div>

      <form className="addition-form" onSubmit={checkAnswer}>
        <label className="addition-answer-label" htmlFor="addition-answer">
          {copy.answerLabel}
        </label>
        <div className="addition-input-row">
          <input
            ref={inputRef}
            id="addition-answer"
            className={`addition-answer-input${inputStateClass}`}
            type="number"
            inputMode="numeric"
            min="0"
            step="1"
            value={answer}
            placeholder={copy.placeholder}
            disabled={isLocked}
            onChange={(event) => setAnswer(event.currentTarget.value)}
          />
          <button className="addition-check-button" type="submit" disabled={isLocked || answer.trim() === ""}>
            <Check aria-hidden="true" focusable="false" strokeWidth={2.4} />
            <span>{copy.checkAnswer}</span>
          </button>
          <button className="addition-new-button" type="button" onClick={startNewProblem}>
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
