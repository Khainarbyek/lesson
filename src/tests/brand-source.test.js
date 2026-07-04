import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const languageSwitcherSource = readFileSync(`${process.cwd()}/src/components/LanguageSwitcher.astro`, "utf8");
const homePageSource = readFileSync(`${process.cwd()}/src/pages/[locale]/index.astro`, "utf8");

describe("brand source", () => {
  it("does not hard-code the old brand mark", () => {
    expect(languageSwitcherSource).not.toContain('class="brand-mark" aria-hidden="true">B</span>');
  });

  it("shows top languages in Kazakh, Russian, English order", () => {
    expect(languageSwitcherSource).toContain('const languageCodes: LocaleCode[] = ["kk", "ru", "en"];');
  });

  it("does not render a second language chooser on the home page", () => {
    expect(homePageSource).not.toContain('class="language-choice"');
    expect(homePageSource).not.toContain("language-choice-link");
  });
});
