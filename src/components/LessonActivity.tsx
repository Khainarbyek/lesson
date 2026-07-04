import { useMemo, useRef, useState, type PointerEvent } from "react";
import { ChevronDown, ChevronUp, RotateCcw, Volume2 } from "lucide-react";
import type { PlayableLesson } from "../lib/content";
import { getLessonProgress, saveLessonProgress, type LessonProgress } from "../lib/progress";

type Props = {
  lesson: PlayableLesson;
};

type Feedback = "correct" | "incorrect" | null;
type CanvasPointerEvent = PointerEvent<HTMLCanvasElement>;

function getCanvasContext(canvas: HTMLCanvasElement) {
  try {
    return canvas.getContext("2d");
  } catch {
    return null;
  }
}

function getCanvasPoint(event: CanvasPointerEvent) {
  const canvas = event.currentTarget;
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
  const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;

  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY
  };
}

export function LessonActivity({ lesson }: Props) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [progress, setProgress] = useState<LessonProgress>(() => getLessonProgress(lesson.id));
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingActiveRef = useRef(false);
  const progressText = useMemo(
    () => `${progress.correct}/${progress.attempts} ${lesson.activity.copy.progress}`,
    [lesson.activity.copy.progress, progress.attempts, progress.correct]
  );

  if (lesson.activity.type === "number-flashcards") {
    const activity = lesson.activity;
    const card = activity.cards[cardIndex];
    const cardProgressText = `${cardIndex + 1}/${activity.cards.length}`;
    const objects = Array.from({ length: card.value }, (_, index) => index);
    const hasPreviousCard = cardIndex > 0;
    const hasNextCard = cardIndex < activity.cards.length - 1;

    function findSpeechVoice() {
      const voices = window.speechSynthesis.getVoices?.() ?? [];
      const preferredLanguages = [activity.copy.speechLocale, ...activity.copy.speechFallbackLocales];

      return voices.find((voice) =>
        preferredLanguages.some((language) => voice.lang.toLowerCase().startsWith(language.toLowerCase()))
      );
    }

    function speak() {
      if (!("speechSynthesis" in window) || !("SpeechSynthesisUtterance" in window)) {
        return;
      }

      const utterance = new SpeechSynthesisUtterance(card.speechText);
      const voice = findSpeechVoice();
      utterance.lang = voice?.lang ?? activity.copy.speechLocale;
      utterance.voice = voice ?? null;
      utterance.rate = 0.86;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    }

    function previousCard() {
      setCardIndex((current) => Math.max(0, current - 1));
    }

    function nextCard() {
      setCardIndex((current) => Math.min(activity.cards.length - 1, current + 1));
    }

    function startDrawing(event: CanvasPointerEvent) {
      const canvas = event.currentTarget;
      const context = getCanvasContext(canvas);
      const point = getCanvasPoint(event);

      drawingActiveRef.current = true;
      canvas.setPointerCapture(event.pointerId);

      if (!context) {
        return;
      }

      context.strokeStyle = "#245985";
      context.lineWidth = 20;
      context.lineCap = "round";
      context.lineJoin = "round";
      context.beginPath();
      context.moveTo(point.x, point.y);
      context.lineTo(point.x + 0.1, point.y + 0.1);
      context.stroke();
    }

    function continueDrawing(event: CanvasPointerEvent) {
      if (!drawingActiveRef.current) {
        return;
      }

      const context = getCanvasContext(event.currentTarget);
      if (!context) {
        return;
      }

      const point = getCanvasPoint(event);
      context.lineTo(point.x, point.y);
      context.stroke();
    }

    function stopDrawing(event: CanvasPointerEvent) {
      drawingActiveRef.current = false;
      if (event.currentTarget.hasPointerCapture(event.pointerId)) {
        event.currentTarget.releasePointerCapture(event.pointerId);
      }
    }

    function clearDrawing() {
      const canvas = drawingCanvasRef.current;
      if (!canvas) {
        return;
      }

      const context = getCanvasContext(canvas);
      context?.clearRect(0, 0, canvas.width, canvas.height);
    }

    return (
      <section className="activity-shell number-activity-shell" aria-labelledby="activity-title">
        <div className="number-topbar">
          <h2 id="activity-title" className="sr-only">
            {lesson.title}
          </h2>
          <span className="activity-progress" aria-label={cardProgressText}>
            {cardProgressText}
          </span>
          <div className="number-controls" aria-label={lesson.subject}>
            {hasPreviousCard && (
              <button className="icon-button secondary" type="button" onClick={previousCard} aria-label={activity.copy.previous}>
                <ChevronUp aria-hidden="true" focusable="false" strokeWidth={2.4} />
              </button>
            )}
            <button className="icon-button listen-button" type="button" onClick={speak} aria-label={activity.copy.listen}>
              <Volume2 aria-hidden="true" focusable="false" strokeWidth={2.4} />
            </button>
            {hasNextCard && (
              <button className="icon-button" type="button" onClick={nextCard} aria-label={activity.copy.next}>
                <ChevronDown aria-hidden="true" focusable="false" strokeWidth={2.4} />
              </button>
            )}
          </div>
        </div>

        <article className="number-card" aria-label={`${card.value} ${card.word}`}>
          <div className="number-main">
            <span className="number-value">{card.value}</span>
            <span className="number-word">{card.word}</span>
          </div>

          <div className="writing-panel">
            <p className="sr-only">{activity.copy.writePrompt}</p>
            <div className="trace-board">
              <span className="trace-number" aria-hidden="true">
                {card.value}
              </span>
              <canvas
                key={card.value}
                ref={drawingCanvasRef}
                className="trace-canvas"
                aria-label={activity.copy.writePrompt}
                width="520"
                height="260"
                onPointerDown={startDrawing}
                onPointerMove={continueDrawing}
                onPointerUp={stopDrawing}
                onPointerCancel={stopDrawing}
                onPointerLeave={stopDrawing}
              />
              <button className="icon-button drawing-clear-button" type="button" onClick={clearDrawing} aria-label={activity.copy.clearDrawing}>
                <RotateCcw aria-hidden="true" focusable="false" strokeWidth={2.4} />
              </button>
            </div>
          </div>

          <div className="count-panel" aria-label={activity.copy.objectsLabel}>
            <div className="count-objects" aria-label={card.objectsLabel}>
              {objects.length === 0 ? (
                <span className="zero-objects" aria-hidden="true" />
              ) : (
                objects.map((object) => (
                  <img
                    key={object}
                    className="apple-image"
                    src="/media/objects/apple.svg"
                    alt=""
                    aria-hidden="true"
                    draggable={false}
                    width="52"
                    height="52"
                  />
                ))
              )}
            </div>
          </div>

        </article>
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
