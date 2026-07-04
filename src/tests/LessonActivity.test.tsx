import "@testing-library/jest-dom/vitest";
import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { LessonActivity } from "../components/LessonActivity";
import { getLessonById } from "../lib/content";

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

  it("navigates between number flashcards", () => {
    const lesson = getLessonById("en", "math");
    if (!lesson || lesson.status !== "playable") {
      throw new Error("Missing math lesson");
    }

    render(<LessonActivity lesson={lesson} />);
    fireEvent.click(screen.getByRole("button", { name: /Next number/i }));

    expect(screen.getByLabelText("1 one")).toHaveTextContent("1");
    expect(screen.getByLabelText("1 one")).toHaveTextContent("one");
  });
});
