import { useMemo, useState } from "react";
import type { PlayableLesson } from "../lib/content";
import { getLessonProgress, saveLessonProgress, type LessonProgress } from "../lib/progress";

type Props = {
  lesson: PlayableLesson;
};

type Feedback = "correct" | "incorrect" | null;

export function LessonActivity({ lesson }: Props) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [progress, setProgress] = useState<LessonProgress>(() => getLessonProgress(lesson.id));

  const prompt = lesson.activity.prompts[promptIndex];
  const progressText = useMemo(
    () => `${progress.correct}/${progress.attempts} ${lesson.activity.copy.progress}`,
    [lesson.activity.copy.progress, progress.attempts, progress.correct]
  );

  function answer(choiceId: string) {
    const isCorrect = choiceId === prompt.correctChoiceId;
    const nextProgress = {
      correct: progress.correct + (isCorrect ? 1 : 0),
      attempts: progress.attempts + 1
    };

    setProgress(nextProgress);
    saveLessonProgress(lesson.id, nextProgress);
    setFeedback(isCorrect ? "correct" : "incorrect");
  }

  function nextPrompt() {
    setPromptIndex((current) => (current + 1) % lesson.activity.prompts.length);
    setFeedback(null);
  }

  return (
    <section className="activity-shell" aria-labelledby="activity-title">
      <div className="activity-header">
        <div>
          <p className="activity-kicker">{lesson.subject}</p>
          <h2 id="activity-title">{lesson.title}</h2>
        </div>
        <span className="activity-progress">{progressText}</span>
      </div>

      <div className="prompt-card">
        <p className="prompt-question">{prompt.question}</p>
        <div className="prompt-target" aria-hidden="true">
          {prompt.target}
        </div>
      </div>

      <div className="choice-grid">
        {prompt.choices.map((choice) => (
          <button
            className="choice-button"
            key={choice.id}
            type="button"
            onClick={() => answer(choice.id)}
          >
            <span className="choice-visual" aria-hidden="true">
              {choice.visual}
            </span>
            <span>{choice.label}</span>
          </button>
        ))}
      </div>

      <div className="feedback-row" aria-live="polite">
        {feedback === "correct" && (
          <>
            <p className="feedback correct">{lesson.activity.copy.correct}</p>
            <button className="next-button" type="button" onClick={nextPrompt}>
              {lesson.activity.copy.next}
            </button>
          </>
        )}
        {feedback === "incorrect" && <p className="feedback incorrect">{lesson.activity.copy.incorrect}</p>}
      </div>
    </section>
  );
}

