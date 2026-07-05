import "@testing-library/jest-dom/vitest";
import { act, cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LessonActivity } from "../components/LessonActivity";
import { getLessonById, getNumberRangeLesson } from "../lib/content";
import { getTraceOcrConfig, scoreTraceByOCR, warmUpOcrWorker, type OcrTraceScore, type TraceOcrConfig } from "../lib/ocrTrace";

const digitOcrConfig: TraceOcrConfig = {
  languages: ["eng"],
  whitelist: "0123456789",
  pageSegMode: "single_word",
  minConfidence: 45
};

const englishLetterOcrConfig: TraceOcrConfig = {
  languages: ["eng"],
  whitelist: "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
  pageSegMode: "single_char",
  minConfidence: 50,
  locale: "en"
};

vi.mock("../lib/ocrTrace", () => ({
  getTraceOcrConfig: vi.fn((target: { kind: "number" } | { kind: "letter"; locale: string }) =>
    target.kind === "letter" ? englishLetterOcrConfig : digitOcrConfig
  ),
  scoreTraceByOCR: vi.fn(),
  warmUpOcrWorker: vi.fn(() => Promise.resolve())
}));

const getTraceOcrConfigMock = vi.mocked(getTraceOcrConfig);
const scoreTraceByOCRMock = vi.mocked(scoreTraceByOCR);
const warmUpOcrWorkerMock = vi.mocked(warmUpOcrWorker);

class MockSpeechSynthesisUtterance {
  lang = "";
  rate = 1;
  text: string;

  constructor(text: string) {
    this.text = text;
  }
}

const speechSynthesisMock = {
  cancel: vi.fn(),
  speak: vi.fn()
};

function mockTraceCanvas(canvas: HTMLCanvasElement) {
  const context = {
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    stroke: vi.fn(),
    clearRect: vi.fn()
  };

  vi.spyOn(canvas, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
  vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
    width: 260,
    height: 130,
    left: 10,
    top: 20,
    right: 270,
    bottom: 150,
    x: 10,
    y: 20,
    toJSON: () => ({})
  });

  return context;
}

function drawTouchStroke(canvas: HTMLCanvasElement, points: Array<{ x: number; y: number }>) {
  const toClientPoint = (point: { x: number; y: number }) => ({
    clientX: point.x / 2 + 10,
    clientY: point.y / 2 + 20
  });

  const [startPoint, ...movePoints] = points;
  fireEvent.touchStart(canvas, { touches: [toClientPoint(startPoint)] });

  for (const point of movePoints) {
    fireEvent.touchMove(canvas, { touches: [toClientPoint(point)] });
  }

  fireEvent.touchEnd(canvas);
}

beforeEach(() => {
  speechSynthesisMock.cancel.mockClear();
  speechSynthesisMock.speak.mockClear();
  getTraceOcrConfigMock.mockClear();
  warmUpOcrWorkerMock.mockClear();
  scoreTraceByOCRMock.mockReset();
  scoreTraceByOCRMock.mockResolvedValue({ passed: false, recognizedText: "", confidence: 0 });
  Object.defineProperty(window, "SpeechSynthesisUtterance", {
    configurable: true,
    value: MockSpeechSynthesisUtterance
  });
  Object.defineProperty(window, "speechSynthesis", {
    configurable: true,
    value: speechSynthesisMock
  });
});

afterEach(() => {
  cleanup();
});

describe("LessonActivity", () => {
  it("shows success feedback for a correct choice answer", () => {
    const lesson = getLessonById("en", "animals");
    if (!lesson || lesson.status !== "playable") {
      throw new Error("Missing animals lesson");
    }

    render(<LessonActivity lesson={lesson} />);
    fireEvent.click(screen.getByRole("button", { name: /Cat/i }));

    expect(screen.getByText(/Great job/i)).toBeInTheDocument();
  });

  it("shows try-again feedback for an incorrect answer", () => {
    const lesson = getLessonById("en", "animals");
    if (!lesson || lesson.status !== "playable") {
      throw new Error("Missing animals lesson");
    }

    render(<LessonActivity lesson={lesson} />);
    fireEvent.click(screen.getByRole("button", { name: /Dog/i }));

    expect(screen.getByText(/Try again/i)).toBeInTheDocument();
  });

  it("renders number flashcards for the math lesson", () => {
    const lesson = getLessonById("en", "math");
    if (!lesson || lesson.status !== "playable") {
      throw new Error("Missing math lesson");
    }

    render(<LessonActivity lesson={lesson} />);

    expect(screen.getByRole("heading", { name: /Math Adventure/i })).toBeInTheDocument();
    expect(screen.getByLabelText("0 zero")).toHaveTextContent("0");
    expect(screen.getByLabelText("0 zero")).toHaveTextContent("zero");
    expect(screen.getByRole("button", { name: /Listen/i })).toBeInTheDocument();
  });

  it("renders letter flashcards for the alphabet lesson without math counting", () => {
    const lesson = getLessonById("en", "alphabet");
    if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "letter-flashcards") {
      throw new Error("Missing alphabet lesson");
    }

    render(<LessonActivity lesson={lesson} />);

    expect(screen.getByRole("heading", { name: /Alphabet Garden/i })).toBeInTheDocument();
    expect(screen.getByLabelText("A letter A")).toHaveTextContent("A");
    expect(screen.getByLabelText("A letter A")).toHaveTextContent("letter A");
    expect(screen.getByLabelText("apple")).toHaveTextContent("apple");
    expect(screen.getByAltText("")).toHaveAttribute("src", "/media/objects/apple.svg");
    expect(screen.getByRole("button", { name: /Listen/i })).toBeInTheDocument();
    expect(screen.queryByLabelText(/Count together/i)).not.toBeInTheDocument();
  });

  it("warms up letter OCR for alphabet flashcards", () => {
    const lesson = getLessonById("en", "alphabet");
    if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "letter-flashcards") {
      throw new Error("Missing alphabet lesson");
    }

    render(<LessonActivity lesson={lesson} />);

    expect(getTraceOcrConfigMock).toHaveBeenCalledWith({ kind: "letter", locale: "en" });
    expect(warmUpOcrWorkerMock).toHaveBeenCalledWith(englishLetterOcrConfig);
  });

  it("checks alphabet drawings against the current letter", async () => {
    const lesson = getLessonById("en", "alphabet");
    if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "letter-flashcards") {
      throw new Error("Missing alphabet lesson");
    }

    scoreTraceByOCRMock.mockResolvedValueOnce({ passed: true, recognizedText: "A", confidence: 90 });

    render(<LessonActivity lesson={lesson} />);

    const canvas = screen.getByLabelText(lesson.activity.copy.writePrompt) as HTMLCanvasElement;
    mockTraceCanvas(canvas);

    drawTouchStroke(canvas, [
      { x: 260, y: 60 },
      { x: 190, y: 205 }
    ]);
    drawTouchStroke(canvas, [
      { x: 260, y: 60 },
      { x: 330, y: 205 }
    ]);
    drawTouchStroke(canvas, [
      { x: 220, y: 135 },
      { x: 300, y: 135 }
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Check drawing" }));

    expect(await screen.findByText("Great letter tracing!")).toBeInTheDocument();
    expect(scoreTraceByOCRMock).toHaveBeenCalledWith(canvas, "A", englishLetterOcrConfig);
  });

  it("uses compact icon controls for number flashcards", () => {
    const lesson = getLessonById("en", "math");
    if (!lesson || lesson.status !== "playable") {
      throw new Error("Missing math lesson");
    }

    render(<LessonActivity lesson={lesson} />);

    const listen = screen.getByRole("button", { name: /Listen/i });
    const next = screen.getByRole("button", { name: /Next number/i });

    expect(listen).toHaveClass("icon-button");
    expect(listen.textContent?.trim()).toBe("");
    expect(next).toHaveClass("icon-button");
    expect(next.textContent?.trim()).toBe("");
    expect(screen.queryByRole("button", { name: /Previous number/i })).not.toBeInTheDocument();

    fireEvent.click(next);

    expect(screen.getByLabelText("1 one")).toHaveTextContent("1");
    expect(screen.getByLabelText("1 one")).toHaveTextContent("one");
    expect(screen.getByRole("button", { name: /Previous number/i })).toBeInTheDocument();
  });

  it("hides next on the final number card", () => {
    const lesson = getNumberRangeLesson("en", "0-10");
    if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "number-flashcards") {
      throw new Error("Missing math lesson");
    }

    render(<LessonActivity lesson={lesson} />);

    for (let count = 0; count < lesson.activity.cards.length - 1; count += 1) {
      fireEvent.click(screen.getByRole("button", { name: /Next number/i }));
    }

    expect(screen.getByLabelText("10 ten")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Next number/i })).not.toBeInTheDocument();
  });

  it("renders the 11-20 number range as a separate activity", () => {
    const lesson = getNumberRangeLesson("en", "11-20");
    if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "number-flashcards") {
      throw new Error("Missing 11-20 math lesson");
    }

    render(<LessonActivity lesson={lesson} />);

    expect(screen.getByLabelText("11 eleven")).toHaveTextContent("11");
    expect(screen.getByText("1/10")).toBeInTheDocument();

    for (let count = 0; count < lesson.activity.cards.length - 1; count += 1) {
      fireEvent.click(screen.getByRole("button", { name: /Next number/i }));
    }

    expect(screen.getByLabelText("20 twenty")).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: /Next number/i })).not.toBeInTheDocument();
  });

  it("sets localized speech language for Kazakh and Russian numbers", () => {
    for (const [locale, language] of [
      ["kk", "kk-KZ"],
      ["ru", "ru-RU"]
    ] as const) {
      cleanup();
      speechSynthesisMock.speak.mockClear();
      const lesson = getLessonById(locale, "math");
      if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "number-flashcards") {
        throw new Error(`Missing ${locale} math lesson`);
      }

      render(<LessonActivity lesson={lesson} />);
      fireEvent.click(screen.getByRole("button", { name: lesson.activity.copy.listen }));

      expect(speechSynthesisMock.speak).toHaveBeenCalledTimes(1);
      expect(speechSynthesisMock.speak.mock.calls[0][0].lang).toBe(language);
    }
  });

  it("renders a compact drawing area without visible card-progress text", () => {
    const lesson = getLessonById("kk", "math");
    if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "number-flashcards") {
      throw new Error("Missing Kazakh math lesson");
    }

    render(<LessonActivity lesson={lesson} />);

    expect(screen.getByText("1/11")).toBeInTheDocument();
    expect(screen.queryByText(/сан карточкасы/i)).not.toBeInTheDocument();
    expect(screen.getByLabelText(lesson.activity.copy.writePrompt)).toBeInTheDocument();
  });

  it("draws on the number tracing canvas with touch events", () => {
    const lesson = getLessonById("en", "math");
    if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "number-flashcards") {
      throw new Error("Missing math lesson");
    }

    const originalPointerEvent = window.PointerEvent;
    Object.defineProperty(window, "PointerEvent", {
      configurable: true,
      value: undefined
    });

    try {
      render(<LessonActivity lesson={lesson} />);

      const canvas = screen.getByLabelText(lesson.activity.copy.writePrompt) as HTMLCanvasElement;
      const context = {
        beginPath: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        stroke: vi.fn(),
        clearRect: vi.fn()
      };

      vi.spyOn(canvas, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
      vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
        width: 260,
        height: 130,
        left: 10,
        top: 20,
        right: 270,
        bottom: 150,
        x: 10,
        y: 20,
        toJSON: () => ({})
      });

      fireEvent.touchStart(canvas, { touches: [{ clientX: 40, clientY: 50 }] });
      fireEvent.touchMove(canvas, { touches: [{ clientX: 70, clientY: 80 }] });
      fireEvent.touchEnd(canvas);

      expect(context.beginPath).toHaveBeenCalledTimes(1);
      expect(context.moveTo).toHaveBeenCalledWith(60, 60);
      expect(context.lineTo).toHaveBeenLastCalledWith(120, 120);
      expect(context.stroke).toHaveBeenCalled();
    } finally {
      Object.defineProperty(window, "PointerEvent", {
        configurable: true,
        value: originalPointerEvent
      });
    }
  });

  it("keeps finger drawing active on multi-digit cards after clearing", () => {
    const lesson = getNumberRangeLesson("en", "21-30");
    if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "number-flashcards") {
      throw new Error("Missing 21-30 math lesson");
    }

    render(<LessonActivity lesson={lesson} />);

    const canvas = screen.getByLabelText(lesson.activity.copy.writePrompt) as HTMLCanvasElement;
    const context = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      clearRect: vi.fn()
    };

    vi.spyOn(canvas, "getContext").mockReturnValue(context as unknown as CanvasRenderingContext2D);
    vi.spyOn(canvas, "getBoundingClientRect").mockReturnValue({
      width: 260,
      height: 130,
      left: 10,
      top: 20,
      right: 270,
      bottom: 150,
      x: 10,
      y: 20,
      toJSON: () => ({})
    });

    fireEvent.touchStart(canvas, { touches: [{ clientX: 35, clientY: 45 }] });
    fireEvent.touchMove(canvas, { touches: [{ clientX: 85, clientY: 95 }] });
    fireEvent.touchEnd(canvas);
    fireEvent.touchStart(canvas, { touches: [{ clientX: 150, clientY: 45 }] });
    fireEvent.touchMove(canvas, { touches: [{ clientX: 150, clientY: 105 }] });
    fireEvent.touchEnd(canvas);
    fireEvent.click(screen.getByRole("button", { name: lesson.activity.copy.clearDrawing }));
    fireEvent.touchStart(canvas, { touches: [{ clientX: 190, clientY: 45 }] });
    fireEvent.touchMove(canvas, { touches: [{ clientX: 190, clientY: 105 }] });
    fireEvent.touchEnd(canvas);

    expect(screen.getByLabelText("21 twenty one")).toBeInTheDocument();
    expect(context.beginPath).toHaveBeenCalledTimes(3);
    expect(context.clearRect).toHaveBeenCalledWith(0, 0, 520, 260);
    expect(context.lineTo).toHaveBeenLastCalledWith(360, 170);
  });

  it("registers native non-passive touch listeners for iOS drawing", () => {
    const lesson = getNumberRangeLesson("en", "21-30");
    if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "number-flashcards") {
      throw new Error("Missing 21-30 math lesson");
    }

    const addEventListenerSpy = vi.spyOn(HTMLCanvasElement.prototype, "addEventListener");

    try {
      render(<LessonActivity lesson={lesson} />);

      expect(addEventListenerSpy).toHaveBeenCalledWith("touchstart", expect.any(Function), { passive: false });
      expect(addEventListenerSpy).toHaveBeenCalledWith("touchmove", expect.any(Function), { passive: false });
      expect(addEventListenerSpy).toHaveBeenCalledWith("touchend", expect.any(Function), { passive: false });
      expect(addEventListenerSpy).toHaveBeenCalledWith("touchcancel", expect.any(Function), { passive: false });
    } finally {
      addEventListenerSpy.mockRestore();
    }
  });

  it("warms up digit OCR when number flashcards render", () => {
    const lesson = getNumberRangeLesson("en", "21-30");
    if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "number-flashcards") {
      throw new Error("Missing 21-30 math lesson");
    }

    render(<LessonActivity lesson={lesson} />);

    expect(getTraceOcrConfigMock).toHaveBeenCalledWith({ kind: "number" });
    expect(warmUpOcrWorkerMock).toHaveBeenCalledWith(digitOcrConfig);
  });

  it("shows checking feedback while OCR is reading the drawing", async () => {
    const lesson = getNumberRangeLesson("en", "21-30");
    if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "number-flashcards") {
      throw new Error("Missing 21-30 math lesson");
    }

    let resolveOcr: (value: OcrTraceScore) => void = () => {};
    scoreTraceByOCRMock.mockReturnValueOnce(
      new Promise((resolve) => {
        resolveOcr = resolve;
      })
    );

    render(<LessonActivity lesson={lesson} />);

    const canvas = screen.getByLabelText(lesson.activity.copy.writePrompt) as HTMLCanvasElement;
    mockTraceCanvas(canvas);

    drawTouchStroke(canvas, [
      { x: 150, y: 60 },
      { x: 225, y: 205 }
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Check drawing" }));

    expect(screen.getByText("Checking drawing...")).toBeInTheDocument();

    await act(async () => {
      resolveOcr({ passed: true, recognizedText: "21", confidence: 90 });
    });

    expect(await screen.findByText("Great tracing!")).toBeInTheDocument();
  });

  it("shows success when OCR recognizes the expected number", async () => {
    const lesson = getNumberRangeLesson("en", "21-30");
    if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "number-flashcards") {
      throw new Error("Missing 21-30 math lesson");
    }

    scoreTraceByOCRMock.mockResolvedValueOnce({ passed: true, recognizedText: "21", confidence: 91 });

    render(<LessonActivity lesson={lesson} />);

    const canvas = screen.getByLabelText(lesson.activity.copy.writePrompt) as HTMLCanvasElement;
    mockTraceCanvas(canvas);

    drawTouchStroke(canvas, [
      { x: 150, y: 60 },
      { x: 225, y: 60 },
      { x: 230, y: 100 },
      { x: 190, y: 130 },
      { x: 150, y: 200 },
      { x: 225, y: 205 }
    ]);
    drawTouchStroke(canvas, [
      { x: 350, y: 60 },
      { x: 350, y: 205 }
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Check drawing" }));

    expect(await screen.findByText("Great tracing!")).toBeInTheDocument();
    expect(scoreTraceByOCRMock).toHaveBeenCalledWith(canvas, "21", digitOcrConfig);
  });

  it("asks the learner to try again when OCR does not recognize the expected number", async () => {
    const lesson = getNumberRangeLesson("en", "21-30");
    if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "number-flashcards") {
      throw new Error("Missing 21-30 math lesson");
    }

    scoreTraceByOCRMock.mockResolvedValueOnce({ passed: false, recognizedText: "2", confidence: 88 });

    render(<LessonActivity lesson={lesson} />);

    const canvas = screen.getByLabelText(lesson.activity.copy.writePrompt) as HTMLCanvasElement;
    mockTraceCanvas(canvas);

    drawTouchStroke(canvas, [
      { x: 350, y: 60 },
      { x: 350, y: 205 }
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Check drawing" }));

    expect(await screen.findByText("Try tracing more of the number.")).toBeInTheDocument();
  });

  it("asks the learner to try again when OCR reads a different two-digit number", async () => {
    const lesson = getNumberRangeLesson("en", "51-60");
    if (!lesson || lesson.status !== "playable" || lesson.activity.type !== "number-flashcards") {
      throw new Error("Missing 51-60 math lesson");
    }

    scoreTraceByOCRMock.mockResolvedValueOnce({ passed: false, recognizedText: "62", confidence: 94 });

    render(<LessonActivity lesson={lesson} />);

    const canvas = screen.getByLabelText(lesson.activity.copy.writePrompt) as HTMLCanvasElement;
    mockTraceCanvas(canvas);

    drawTouchStroke(canvas, [
      { x: 188, y: 60 },
      { x: 150, y: 92 },
      { x: 150, y: 130 },
      { x: 150, y: 168 },
      { x: 188, y: 205 },
      { x: 228, y: 168 }
    ]);
    drawTouchStroke(canvas, [
      { x: 332, y: 60 },
      { x: 372, y: 92 },
      { x: 332, y: 130 },
      { x: 292, y: 168 },
      { x: 332, y: 205 }
    ]);
    fireEvent.click(screen.getByRole("button", { name: "Check drawing" }));

    expect(screen.getByLabelText("51 fifty one")).toBeInTheDocument();
    expect(await screen.findByText("Try tracing more of the number.")).toBeInTheDocument();
  });
});
