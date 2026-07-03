export type LessonProgress = {
  correct: number;
  attempts: number;
};

const prefix = "children-learning-progress";

function keyForLesson(lessonId: string) {
  return `${prefix}:${lessonId}`;
}

export function getLessonProgress(lessonId: string): LessonProgress {
  if (typeof localStorage === "undefined") {
    return { correct: 0, attempts: 0 };
  }

  const raw = localStorage.getItem(keyForLesson(lessonId));
  if (!raw) {
    return { correct: 0, attempts: 0 };
  }

  try {
    const parsed = JSON.parse(raw) as Partial<LessonProgress>;

    return {
      correct: Number(parsed.correct ?? 0),
      attempts: Number(parsed.attempts ?? 0)
    };
  } catch {
    return { correct: 0, attempts: 0 };
  }
}

export function saveLessonProgress(lessonId: string, progress: LessonProgress) {
  localStorage.setItem(keyForLesson(lessonId), JSON.stringify(progress));
}

