import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const lessonActivitySource = readFileSync(`${process.cwd()}/src/components/LessonActivity.tsx`, "utf8");
const lessonPageSource = readFileSync(`${process.cwd()}/src/pages/[locale]/lessons/[lessonId].astro`, "utf8");

describe("icon source", () => {
  it("uses lucide-react icons for number lesson controls", () => {
    expect(lessonActivitySource).toContain('from "lucide-react"');
    expect(lessonActivitySource).toContain("Volume2");
    expect(lessonActivitySource).toContain("ChevronUp");
    expect(lessonActivitySource).toContain("ChevronDown");
    expect(lessonActivitySource).toContain("RotateCcw");
    expect(lessonActivitySource).not.toContain("function SpeakerIcon");
    expect(lessonActivitySource).not.toContain("function ResetIcon");
  });

  it("uses a lucide icon for the lesson back button", () => {
    expect(lessonPageSource).toContain('from "lucide-react"');
    expect(lessonPageSource).toContain("ChevronLeft");
    expect(lessonPageSource).not.toContain("<path d=");
  });
});
