import { useMemo, useState } from "react";
import type { PlayableLesson } from "../lib/content";
import { getLessonProgress, saveLessonProgress, type LessonProgress } from "../lib/progress";

type Props = {
  lesson: PlayableLesson;
};

type Feedback = "correct" | "incorrect" | null;

export function LessonActivity({ lesson }: Props) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [progress, setProgress] = useState<LessonProgress>(() => getLessonProgress(lesson.id));
  const progressText = useMemo(
    () => `${progress.correct}/${progress.attempts} ${lesson.activity.copy.progress}`,
    [lesson.activity.copy.progress, progress.attempts, progress.correct]
  );

  if (lesson.activity.type === "number-flashcards") {
    const activity = lesson.activity;
    const card = activity.cards[cardIndex];
    const cardProgressText = `${cardIndex + 1}/${activity.cards.length} ${activity.copy.progress}`;
    const objects = Array.from({ length: card.value }, (_, index) => index);

    function speak() {
      if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(card.speechText);
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }

    function previousCard() {
      setCardIndex((current) => (current === 0 ? activity.cards.length - 1 : current - 1));
    }

    function nextCard() {
      setCardIndex((current) => (current + 1) % activity.cards.length);
    }

    return (
      <section className="activity-shell number-activity-shell" aria-labelledby="activity-title">
        <div className="activity-header">
          <div>
            <p className="activity-kicker">{lesson.subject}</p>
            <h2 id="activity-title">{lesson.title}</h2>
          </div>
          <span className="activity-progress">{cardProgressText}</span>
        </div>

        <article className="number-card" aria-label={`${card.value} ${card.word}`}>
          <div className="number-main">
            <span className="number-value">{card.value}</span>
            <span className="number-word">{card.word}</span>
          </div>

          <button className="listen-button" type="button" onClick={speak}>
            {activity.copy.listen}
          </button>

          <div className="count-panel" aria-label={activity.copy.objectsLabel}>
            <strong>{activity.copy.objectsLabel}</strong>
            <div className="count-objects" aria-label={card.objectsLabel}>
              {objects.length === 0 ? (
                <span className="zero-objects">{card.objectsLabel}</span>
              ) : (
                objects.map((object) => <span key={object} className="count-object" aria-hidden="true" />)
              )}
            </div>
          </div>

          <div className="writing-panel">
            <p>{activity.copy.writePrompt}</p>
            <div className="trace-number" aria-hidden="true">
              {card.value}
            </div>
          </div>
        </article>

        <div className="number-actions">
          <button className="next-button secondary" type="button" onClick={previousCard}>
            {activity.copy.previous}
          </button>
          <button className="next-button" type="button" onClick={nextCard}>
            {activity.copy.next}
          </button>
        </div>
      </section>
    );
  }

  const activity = lesson.activity;
  const prompt = activity.prompts[promptIndex];

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
    setPromptIndex((current) => (current + 1) % activity.prompts.length);
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
