import "@testing-library/jest-dom/vitest";
import { readFileSync } from "node:fs";
import { fireEvent } from "@testing-library/dom";
import { beforeEach, describe, expect, it } from "vitest";
import { setupAgeFilter } from "../lib/ageFilter";

const ageFilterSource = readFileSync(`${process.cwd()}/src/components/AgeFilter.astro`, "utf8");
const lessonCardSource = readFileSync(`${process.cwd()}/src/components/LessonCard.astro`, "utf8");

function renderAgeFilterFixture() {
  document.body.innerHTML = `
    <div data-age-filter-root>
      <button type="button" data-age-filter="3-5" aria-pressed="false">3-5</button>
      <button type="button" data-age-filter="6-8" aria-pressed="false">6-8</button>
      <button type="button" data-age-filter="9+" aria-pressed="false">9+</button>
    </div>
    <section>
      <article class="lesson-card" data-lesson-card data-age="3-5">Alphabet</article>
      <article class="lesson-card" data-lesson-card data-age="6-8">Math</article>
      <article class="lesson-card" data-lesson-card data-age="9+">Typing</article>
    </section>
  `;
}

describe("age filter", () => {
  beforeEach(() => {
    renderAgeFilterFixture();
  });

  it("filters lesson cards by age and clears when the active age is clicked again", () => {
    setupAgeFilter();

    const earlyYears = document.querySelector<HTMLButtonElement>('[data-age-filter="3-5"]');
    const mathYears = document.querySelector<HTMLButtonElement>('[data-age-filter="6-8"]');
    const alphabet = document.querySelector<HTMLElement>('[data-age="3-5"]');
    const math = document.querySelector<HTMLElement>('[data-age="6-8"]');
    const typing = document.querySelector<HTMLElement>('[data-age="9+"]');

    if (!earlyYears || !mathYears || !alphabet || !math || !typing) {
      throw new Error("Missing age filter fixture elements");
    }

    fireEvent.click(mathYears);

    expect(mathYears).toHaveAttribute("aria-pressed", "true");
    expect(earlyYears).toHaveAttribute("aria-pressed", "false");
    expect(alphabet).toHaveAttribute("hidden");
    expect(math).not.toHaveAttribute("hidden");
    expect(typing).toHaveAttribute("hidden");

    fireEvent.click(mathYears);

    expect(mathYears).toHaveAttribute("aria-pressed", "false");
    expect(alphabet).not.toHaveAttribute("hidden");
    expect(math).not.toHaveAttribute("hidden");
    expect(typing).not.toHaveAttribute("hidden");
  });

  it("renders age chips as filter buttons and lesson cards with age metadata", () => {
    expect(ageFilterSource).toContain('type="button"');
    expect(ageFilterSource).toContain("data-age-filter");
    expect(ageFilterSource).not.toContain('href={`#age-${range.id}`}');
    expect(lessonCardSource).toContain("data-age={lesson.ageRange}");
  });
});
