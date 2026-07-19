import { useEffect, useMemo, useRef, useState, type MouseEvent, type PointerEvent } from "react";
import { Check, ChevronDown, ChevronUp, RotateCcw, Volume2 } from "lucide-react";
import type { PlayableLesson } from "../lib/content";
import type { TraceStroke } from "../lib/numberTrace";
import { getTraceOcrConfig, scoreTraceByOCR, warmUpOcrWorker } from "../lib/ocrTrace";
import { getLessonProgress, saveLessonProgress, type LessonProgress } from "../lib/progress";

type Props = {
  lesson: PlayableLesson;
};

type Feedback = "correct" | "incorrect" | null;
type TraceFeedback = "success" | "retry" | "checking" | null;
type CanvasPointerEvent = PointerEvent<HTMLCanvasElement>;
type CanvasMouseEvent = MouseEvent<HTMLCanvasElement>;
type CanvasPoint = {
  x: number;
  y: number;
};

function getCanvasContext(canvas: HTMLCanvasElement) {
  try {
    return canvas.getContext("2d");
  } catch {
    return null;
  }
}

function getCanvasPointFromClient(canvas: HTMLCanvasElement, clientX: number, clientY: number): CanvasPoint {
  const rect = canvas.getBoundingClientRect();
  const scaleX = rect.width > 0 ? canvas.width / rect.width : 1;
  const scaleY = rect.height > 0 ? canvas.height / rect.height : 1;

  return {
    x: (clientX - rect.left) * scaleX,
    y: (clientY - rect.top) * scaleY
  };
}

function getCanvasPoint(event: CanvasPointerEvent | CanvasMouseEvent) {
  return getCanvasPointFromClient(event.currentTarget, event.clientX, event.clientY);
}

function getTouchCanvasPoint(canvas: HTMLCanvasElement, event: TouchEvent) {
  const touch = event.touches[0] ?? event.changedTouches[0];

  if (!touch) {
    return null;
  }

  return getCanvasPointFromClient(canvas, touch.clientX, touch.clientY);
}

function supportsPointerEvents() {
  return typeof window !== "undefined" && typeof window.PointerEvent === "function";
}

function isTouchPointer(event: CanvasPointerEvent) {
  return event.pointerType === "touch";
}

function capturePointer(canvas: HTMLCanvasElement, pointerId: number) {
  if (typeof canvas.setPointerCapture !== "function") {
    return;
  }

  try {
    canvas.setPointerCapture(pointerId);
  } catch {
    // Older mobile WebViews can expose pointer events without reliable capture.
  }
}

function releasePointer(canvas: HTMLCanvasElement, pointerId: number) {
  if (typeof canvas.releasePointerCapture !== "function") {
    return;
  }

  try {
    if (typeof canvas.hasPointerCapture === "function" && !canvas.hasPointerCapture(pointerId)) {
      return;
    }

    canvas.releasePointerCapture(pointerId);
  } catch {
    // Releasing capture can throw if the pointer was already cancelled.
  }
}

function beginCanvasDrawing(canvas: HTMLCanvasElement, point: CanvasPoint) {
  const context = getCanvasContext(canvas);

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

function drawCanvasPoint(canvas: HTMLCanvasElement, point: CanvasPoint) {
  const context = getCanvasContext(canvas);
  if (!context) {
    return;
  }

  context.lineTo(point.x, point.y);
  context.stroke();
}

export function LessonActivity({ lesson }: Props) {
  const [promptIndex, setPromptIndex] = useState(0);
  const [cardIndex, setCardIndex] = useState(0);
  const [feedback, setFeedback] = useState<Feedback>(null);
  const [traceFeedback, setTraceFeedback] = useState<TraceFeedback>(null);
  const [progress, setProgress] = useState<LessonProgress>(() => ({ correct: 0, attempts: 0 }));
  const drawingCanvasRef = useRef<HTMLCanvasElement>(null);
  const drawingActiveRef = useRef(false);
  const drawingStrokesRef = useRef<TraceStroke[]>([]);
  const traceCheckIdRef = useRef(0);
  const traceOcrConfig = useMemo(() => {
    if (lesson.activity.type === "number-flashcards") {
      return getTraceOcrConfig({ kind: "number" });
    }

    if (lesson.activity.type === "letter-flashcards") {
      return getTraceOcrConfig({ kind: "letter", locale: lesson.activity.locale });
    }

    return null;
  }, [lesson.activity]);
  useEffect(() => {
    setProgress(getLessonProgress(lesson.id));
  }, [lesson.id]);

  function resetTraceState() {
    traceCheckIdRef.current += 1;
    drawingActiveRef.current = false;
    drawingStrokesRef.current = [];
    setTraceFeedback(null);
  }

  function rememberStrokeStart(point: CanvasPoint) {
    drawingStrokesRef.current.push([point]);
    setTraceFeedback(null);
  }

  function rememberStrokePoint(point: CanvasPoint) {
    const currentStroke = drawingStrokesRef.current[drawingStrokesRef.current.length - 1];

    if (!currentStroke) {
      rememberStrokeStart(point);
      return;
    }

    currentStroke.push(point);
  }

  useEffect(() => {
    resetTraceState();
  }, [cardIndex, lesson.id]);

  useEffect(() => {
    if (!traceOcrConfig) {
      return;
    }

    void warmUpOcrWorker(traceOcrConfig).catch(() => {
      // Checking still works later if the user retries and the worker loads successfully.
    });
  }, [traceOcrConfig]);

  useEffect(() => {
    if (lesson.activity.type !== "number-flashcards" && lesson.activity.type !== "letter-flashcards") {
      return;
    }

    const canvas = drawingCanvasRef.current;
    if (!canvas) {
      return;
    }
    const touchCanvas = canvas;

    const touchListenerOptions: AddEventListenerOptions = { passive: false };

    function preventNativeTouchGesture(event: TouchEvent) {
      if (event.cancelable) {
        event.preventDefault();
      }
    }

    function startNativeTouchDrawing(event: TouchEvent) {
      preventNativeTouchGesture(event);
      const point = getTouchCanvasPoint(touchCanvas, event);
      if (!point) {
        return;
      }

      drawingActiveRef.current = true;
      rememberStrokeStart(point);
      beginCanvasDrawing(touchCanvas, point);
    }

    function continueNativeTouchDrawing(event: TouchEvent) {
      preventNativeTouchGesture(event);
      if (!drawingActiveRef.current) {
        return;
      }

      const point = getTouchCanvasPoint(touchCanvas, event);
      if (!point) {
        return;
      }

      rememberStrokePoint(point);
      drawCanvasPoint(touchCanvas, point);
    }

    function stopNativeTouchDrawing(event: TouchEvent) {
      preventNativeTouchGesture(event);
      drawingActiveRef.current = false;
    }

    touchCanvas.addEventListener("touchstart", startNativeTouchDrawing, touchListenerOptions);
    touchCanvas.addEventListener("touchmove", continueNativeTouchDrawing, touchListenerOptions);
    touchCanvas.addEventListener("touchend", stopNativeTouchDrawing, touchListenerOptions);
    touchCanvas.addEventListener("touchcancel", stopNativeTouchDrawing, touchListenerOptions);

    return () => {
      touchCanvas.removeEventListener("touchstart", startNativeTouchDrawing, touchListenerOptions);
      touchCanvas.removeEventListener("touchmove", continueNativeTouchDrawing, touchListenerOptions);
      touchCanvas.removeEventListener("touchend", stopNativeTouchDrawing, touchListenerOptions);
      touchCanvas.removeEventListener("touchcancel", stopNativeTouchDrawing, touchListenerOptions);
    };
  }, [cardIndex, lesson.activity.type]);

  if (lesson.activity.type === "number-flashcards" || lesson.activity.type === "letter-flashcards") {
    const activity = lesson.activity;
    const numberActivity = activity.type === "number-flashcards" ? activity : null;
    const letterActivity = activity.type === "letter-flashcards" ? activity : null;
    const numberCard = numberActivity?.cards[cardIndex] ?? null;
    const letterCard = letterActivity?.cards[cardIndex] ?? null;
    const card = numberCard ?? letterCard;
    if (!card) {
      return null;
    }

    const activeCard = card;
    const isLetterActivity = letterActivity !== null;
    const cardValue = String(activeCard.value);
    const cardLabel = letterCard?.name ?? numberCard?.word ?? "";
    const letterObject = letterCard?.object ?? null;
    const cardProgressText = `${cardIndex + 1}/${activity.cards.length}`;
    const objects = numberCard ? Array.from({ length: numberCard.value }, (_, index) => index) : [];
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

      const utterance = new SpeechSynthesisUtterance(activeCard.speechText);
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

    function drawToPoint(canvas: HTMLCanvasElement, point: CanvasPoint) {
      if (!drawingActiveRef.current) {
        return;
      }

      rememberStrokePoint(point);
      drawCanvasPoint(canvas, point);
    }

    function startDrawing(event: CanvasPointerEvent) {
      if (isTouchPointer(event)) {
        return;
      }

      const canvas = event.currentTarget;
      const point = getCanvasPoint(event);

      drawingActiveRef.current = true;
      capturePointer(canvas, event.pointerId);
      rememberStrokeStart(point);
      beginCanvasDrawing(canvas, point);
    }

    function continueDrawing(event: CanvasPointerEvent) {
      if (isTouchPointer(event)) {
        return;
      }

      drawToPoint(event.currentTarget, getCanvasPoint(event));
    }

    function stopDrawing(event: CanvasPointerEvent) {
      if (isTouchPointer(event)) {
        return;
      }

      drawingActiveRef.current = false;
      releasePointer(event.currentTarget, event.pointerId);
    }

    function startMouseDrawing(event: CanvasMouseEvent) {
      if (supportsPointerEvents() || event.button !== 0) {
        return;
      }

      const point = getCanvasPoint(event);
      drawingActiveRef.current = true;
      rememberStrokeStart(point);
      beginCanvasDrawing(event.currentTarget, point);
    }

    function continueMouseDrawing(event: CanvasMouseEvent) {
      if (supportsPointerEvents()) {
        return;
      }

      drawToPoint(event.currentTarget, getCanvasPoint(event));
    }

    function stopMouseDrawing() {
      if (supportsPointerEvents()) {
        return;
      }

      drawingActiveRef.current = false;
    }

    function clearDrawing() {
      const canvas = drawingCanvasRef.current;
      resetTraceState();

      if (!canvas) {
        return;
      }

      const context = getCanvasContext(canvas);
      context?.clearRect(0, 0, canvas.width, canvas.height);
    }

    async function checkDrawing() {
      const canvas = drawingCanvasRef.current;
      if (!canvas || !traceOcrConfig) {
        return;
      }

      const checkId = traceCheckIdRef.current + 1;
      traceCheckIdRef.current = checkId;
      setTraceFeedback("checking");

      try {
        const result = await scoreTraceByOCR(canvas, cardValue, traceOcrConfig);

        if (traceCheckIdRef.current !== checkId) {
          return;
        }

        setTraceFeedback(result.passed ? "success" : "retry");
      } catch {
        if (traceCheckIdRef.current === checkId) {
          setTraceFeedback("retry");
        }
      }
    }

    const isCheckingTrace = traceFeedback === "checking";

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

        <article className={`number-card ${isLetterActivity ? "letter-card" : ""}`} aria-label={`${cardValue} ${cardLabel}`}>
          <div className={`number-main ${isLetterActivity ? "letter-main" : ""}`}>
            <span className={`number-value ${isLetterActivity ? "letter-value" : ""}`}>{cardValue}</span>
            <span className={`number-word ${isLetterActivity ? "letter-name" : ""}`}>{cardLabel}</span>
            {letterObject && (
              <div className="letter-object" aria-label={letterObject.label}>
                {letterObject.imageSrc ? (
                  <img className="letter-object-image" src={letterObject.imageSrc} alt="" aria-hidden="true" width="58" height="58" />
                ) : (
                  <span className="letter-object-glyph" aria-hidden="true">
                    {letterObject.glyph}
                  </span>
                )}
                <span className="letter-object-label">{letterObject.label}</span>
              </div>
            )}
          </div>

          <div className="writing-panel">
            <p className="sr-only">{activity.copy.writePrompt}</p>
            <div className="trace-board">
              <span className="trace-number" aria-hidden="true">
                {cardValue}
              </span>
              <canvas
                key={cardValue}
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
                onMouseDown={startMouseDrawing}
                onMouseMove={continueMouseDrawing}
                onMouseUp={stopMouseDrawing}
                onMouseLeave={stopMouseDrawing}
              />
              <div className="drawing-actions">
                <button
                  className="icon-button drawing-check-button"
                  type="button"
                  onClick={checkDrawing}
                  aria-label={activity.copy.checkDrawing}
                  aria-busy={isCheckingTrace}
                  disabled={isCheckingTrace}
                >
                  <Check aria-hidden="true" focusable="false" strokeWidth={2.4} />
                </button>
                <button className="icon-button drawing-clear-button" type="button" onClick={clearDrawing} aria-label={activity.copy.clearDrawing}>
                  <RotateCcw aria-hidden="true" focusable="false" strokeWidth={2.4} />
                </button>
              </div>
            </div>
            {traceFeedback && (
              <p className={`trace-feedback ${traceFeedback}`} aria-live="polite">
                {traceFeedback === "checking"
                  ? activity.copy.traceChecking
                  : traceFeedback === "success"
                    ? activity.copy.traceSuccess
                    : activity.copy.traceRetry}
              </p>
            )}
          </div>

          {numberActivity && numberCard && (
            <div className="count-panel" aria-label={numberActivity.copy.objectsLabel}>
              <div className="count-objects" aria-label={numberCard.objectsLabel}>
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
          )}

        </article>
      </section>
    );
  }

  const activity = lesson.activity;
  const prompt = activity.prompts[promptIndex];
  const choiceProgressText = `${promptIndex + 1}/${activity.prompts.length} ${activity.copy.progress}`;

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
        <span className="activity-progress">{choiceProgressText}</span>
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
