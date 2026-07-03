import "@testing-library/jest-dom/vitest";
import { fireEvent, render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { LessonActivity } from "../components/LessonActivity";
import { getLessonById } from "../lib/content";

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
});

