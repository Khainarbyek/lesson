import { describe, expect, it } from "vitest";
import { getCanonicalUrl, getLocalizedAlternates, siteUrl } from "../lib/seo";

describe("SEO helpers", () => {
  it("uses the Netlify production URL as the site origin", () => {
    expect(siteUrl).toBe("https://uyren.netlify.app");
  });

  it("builds canonical URLs from localized paths", () => {
    expect(getCanonicalUrl("/kk/")).toBe("https://uyren.netlify.app/kk/");
    expect(getCanonicalUrl("kk/lessons/alphabet")).toBe("https://uyren.netlify.app/kk/lessons/alphabet");
  });

  it("builds locale alternates for matching localized routes", () => {
    expect(getLocalizedAlternates("/lessons/alphabet")).toEqual([
      { locale: "en", href: "https://uyren.netlify.app/en/lessons/alphabet", hrefLang: "en" },
      { locale: "ru", href: "https://uyren.netlify.app/ru/lessons/alphabet", hrefLang: "ru" },
      { locale: "kk", href: "https://uyren.netlify.app/kk/lessons/alphabet", hrefLang: "kk" }
    ]);
  });
});
