import { describe, expect, it } from "vitest";
import { getHomeCopy, getLessonById, getLessons, locales } from "../lib/content";

describe("localized content", () => {
  it("supports English, Russian, and Kazakh", () => {
    expect(locales.map((locale) => locale.code)).toEqual(["en", "ru", "kk"]);
  });

  it("returns homepage copy for each locale", () => {
    expect(getHomeCopy("en").heroTitle).toContain("Learn");
    expect(getHomeCopy("ru").heroTitle).toContain("Учись");
    expect(getHomeCopy("kk").heroTitle).toContain("Үйрен");
  });

  it("uses Uyren as the product name in every locale", () => {
    expect(locales.map((locale) => getHomeCopy(locale.code).productName)).toEqual(["Uyren", "Uyren", "Uyren"]);
  });

  it("marks Alphabet and Animals as playable", () => {
    const playable = getLessons("en").filter((lesson) => lesson.status === "playable");

    expect(playable.map((lesson) => lesson.id)).toEqual(["alphabet", "animals"]);
  });

  it("returns localized lesson detail", () => {
    expect(getLessonById("kk", "animals")?.title).toContain("Жануар");
  });
});
