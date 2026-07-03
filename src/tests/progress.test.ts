import { beforeEach, describe, expect, it } from "vitest";
import { getLessonProgress, saveLessonProgress } from "../lib/progress";

describe("lesson progress", () => {
  beforeEach(() => {
    localStorage.clear();
  });

  it("returns zero progress by default", () => {
    expect(getLessonProgress("alphabet")).toEqual({ correct: 0, attempts: 0 });
  });

  it("saves progress per lesson", () => {
    saveLessonProgress("animals", { correct: 2, attempts: 3 });

    expect(getLessonProgress("animals")).toEqual({ correct: 2, attempts: 3 });
  });
});

