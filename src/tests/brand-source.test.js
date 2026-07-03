import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const languageSwitcherSource = readFileSync(`${process.cwd()}/src/components/LanguageSwitcher.astro`, "utf8");

describe("brand source", () => {
  it("does not hard-code the old brand mark", () => {
    expect(languageSwitcherSource).not.toContain('class="brand-mark" aria-hidden="true">B</span>');
  });
});
