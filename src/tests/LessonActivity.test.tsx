import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { LessonActivity } from "../components/LessonActivity";
import { getLessonById } from "../lib/content";

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

beforeEach(() => {
  speechSynthesisMock.cancel.mockClear();
  speechSynthesisMock.speak.mockClear();
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
  it("shows success feedback for a correct answer", () => {
    const lesson = getLessonById("en", "alphabet");
    if (!lesson || lesson.status !== "playable") {
      throw new Error("Missing alphabet lesson");
    }

    render(<LessonActivity lesson={lesson} />);
    fireEvent.click(screen.getByRole("button", { name: /A/i }));

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
    const lesson = getLessonById("en", "math");
    if (!lesson || lesson.status !== "playable") {
      throw new Error("Missing math lesson");
    }

    render(<LessonActivity lesson={lesson} />);

    for (let count = 0; count < 10; count += 1) {
      fireEvent.click(screen.getByRole("button", { name: /Next number/i }));
    }

    expect(screen.getByLabelText("10 ten")).toBeInTheDocument();
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
});
