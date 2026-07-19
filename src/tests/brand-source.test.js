import { readFileSync } from "node:fs";
import { describe, expect, it } from "vitest";

const languageSwitcherSource = readFileSync(`${process.cwd()}/src/components/LanguageSwitcher.astro`, "utf8");
const homePageSource = readFileSync(`${process.cwd()}/src/pages/[locale]/index.astro`, "utf8");
const baseLayoutSource = readFileSync(`${process.cwd()}/src/layouts/BaseLayout.astro`, "utf8");
const logoSource = readFileSync(`${process.cwd()}/public/media/brand/uyren-logo.svg`, "utf8");

describe("brand source", () => {
  it("does not hard-code the old brand mark", () => {
    expect(languageSwitcherSource).not.toContain('class="brand-mark" aria-hidden="true">B</span>');
  });

  it("uses the Uyren SVG logo in the header", () => {
    expect(languageSwitcherSource).toContain('src="/media/brand/uyren-logo.svg"');
    expect(languageSwitcherSource).toContain('class="brand-logo"');
    expect(languageSwitcherSource).not.toContain("brandMark");
  });

  it("ships a favicon and complete SVG logo asset", () => {
    expect(baseLayoutSource).toContain('<link rel="icon" type="image/svg+xml" href="/favicon.svg" />');
    expect(logoSource).toContain("<title");
    expect(logoSource).toContain("Uyren logo");
    expect(logoSource).toContain(">Uyren</text>");
  });

  it("shows top languages in Kazakh, Russian, English order", () => {
    expect(languageSwitcherSource).toContain('const languageCodes: LocaleCode[] = ["kk", "ru", "en"];');
  });

  it("does not render a second language chooser on the home page", () => {
    expect(homePageSource).not.toContain('class="language-choice"');
    expect(homePageSource).not.toContain("language-choice-link");
  });
});
