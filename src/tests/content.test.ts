import { describe, expect, it } from "vitest";
import { getHomeCopy, getLessonById, getLessons, getNumberRangeLesson, getNumberRanges, locales } from "../lib/content";
import { defaultLocale } from "../lib/locales";

describe("localized content", () => {
  it("supports English, Russian, and Kazakh", () => {
    expect(locales.map((locale) => locale.code)).toEqual(["en", "ru", "kk"]);
  });

  it("uses Kazakh as the default locale", () => {
    expect(defaultLocale).toBe("kk");
  });

  it("returns homepage copy for each locale", () => {
    expect(getHomeCopy("en").heroTitle).toContain("Learn");
    expect(getHomeCopy("ru").heroTitle).toContain("Учись");
    expect(getHomeCopy("kk").heroTitle).toContain("Үйрен");
  });

  it("uses Uyren as the product name in every locale", () => {
    expect(locales.map((locale) => getHomeCopy(locale.code).productName)).toEqual(["Uyren", "Uyren", "Uyren"]);
  });

  it("defines the mobile-first start flow for each locale", () => {
    expect(getHomeCopy("en").startFlow.map((step) => step.title)).toEqual([
      "Choose language",
      "Choose age",
      "Pick a lesson"
    ]);
    expect(getHomeCopy("ru").startFlow).toHaveLength(3);
    expect(getHomeCopy("kk").startFlow).toHaveLength(3);
  });

  it("marks Alphabet, Animals, and Math as playable", () => {
    const playable = getLessons("en").filter((lesson) => lesson.status === "playable");

    expect(playable.map((lesson) => lesson.id)).toEqual(["alphabet", "animals", "math"]);
  });

  it("marks Math as a playable numbers lesson", () => {
    const math = getLessonById("en", "math");

    expect(math?.status).toBe("playable");
    if (!math || math.status !== "playable") {
      throw new Error("Missing playable math lesson");
    }

    expect(math.activity.type).toBe("number-flashcards");
  });

  it("marks Alphabet as playable letter flashcards in each locale", () => {
    const expectedLetters = {
      en: "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split(""),
      ru: ["А", "Б", "В", "Г", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Л", "М", "Н", "О", "П", "Р", "С", "Т", "У", "Ф", "Х", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "Ь", "Э", "Ю", "Я"],
      kk: ["А", "Ә", "Б", "В", "Г", "Ғ", "Д", "Е", "Ё", "Ж", "З", "И", "Й", "К", "Қ", "Л", "М", "Н", "Ң", "О", "Ө", "П", "Р", "С", "Т", "У", "Ұ", "Ү", "Ф", "Х", "Һ", "Ц", "Ч", "Ш", "Щ", "Ъ", "Ы", "І", "Ь", "Э", "Ю", "Я"]
    };

    for (const locale of locales) {
      const alphabet = getLessonById(locale.code, "alphabet");

      expect(alphabet?.status).toBe("playable");
      if (!alphabet || alphabet.status !== "playable" || alphabet.activity.type !== "letter-flashcards") {
        throw new Error(`Missing letter flashcards for ${locale.code}`);
      }

      expect(alphabet.activity.locale).toBe(locale.code);
      expect(alphabet.activity.cards.map((card) => card.value)).toEqual(expectedLetters[locale.code]);
      expect(alphabet.activity.cards.every((card) => card.object.label.trim().length > 0)).toBe(true);
      expect(alphabet.activity.cards.every((card) => Boolean(card.object.imageSrc ?? card.object.glyph?.trim()))).toBe(true);
      expect(alphabet.activity.copy.next).not.toContain("number");
    }
  });

  it("adds a visual object to alphabet cards across languages", () => {
    const englishAlphabet = getLessonById("en", "alphabet");
    const russianAlphabet = getLessonById("ru", "alphabet");
    const kazakhAlphabet = getLessonById("kk", "alphabet");

    if (
      !englishAlphabet ||
      englishAlphabet.status !== "playable" ||
      englishAlphabet.activity.type !== "letter-flashcards" ||
      !russianAlphabet ||
      russianAlphabet.status !== "playable" ||
      russianAlphabet.activity.type !== "letter-flashcards" ||
      !kazakhAlphabet ||
      kazakhAlphabet.status !== "playable" ||
      kazakhAlphabet.activity.type !== "letter-flashcards"
    ) {
      throw new Error("Missing letter flashcards");
    }

    expect(englishAlphabet.activity.cards[0].object).toEqual({
      label: "apple",
      imageSrc: "/media/objects/apple.svg"
    });
    expect(englishAlphabet.activity.cards[1].object.label).toBe("ball");
    expect(englishAlphabet.activity.cards[1].object.glyph).toBe("⚽");
    expect(englishAlphabet.activity.cards.at(-1)?.object.label).toBe("zebra");
    expect(russianAlphabet.activity.cards.at(-1)?.object).toEqual({
      label: "яблоко",
      imageSrc: "/media/objects/apple.svg"
    });
    expect(kazakhAlphabet.activity.cards[0].object).toEqual({
      label: "алма",
      imageSrc: "/media/objects/apple.svg"
    });
    expect(kazakhAlphabet.activity.cards.find((card) => card.value === "Қ")?.object.label).toBe("қоян");
    expect(kazakhAlphabet.activity.cards.find((card) => card.value === "І")?.object.label).toBe("ірімшік");
  });

  it("keeps the first numbers card from 0 through 10", () => {
    for (const locale of locales) {
      const firstRange = getNumberRangeLesson(locale.code, "0-10");
      if (!firstRange || firstRange.activity.type !== "number-flashcards") {
        throw new Error(`Missing first number range for ${locale.code}`);
      }

      expect(firstRange.activity.cards.map((card) => card.value)).toEqual([0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10]);
    }
  });

  it("defines number range cards from 0-10 through 91-100", () => {
    const ranges = getNumberRanges("en");

    expect(ranges.map((range) => range.id)).toEqual([
      "0-10",
      "11-20",
      "21-30",
      "31-40",
      "41-50",
      "51-60",
      "61-70",
      "71-80",
      "81-90",
      "91-100"
    ]);

    expect(ranges[0].route).toBe("/en/lessons/math/numbers/0-10");
    expect(ranges[1].route).toBe("/en/lessons/math/numbers/11-20");
  });

  it("builds localized number lessons for each range", () => {
    for (const locale of locales) {
      const secondRange = getNumberRangeLesson(locale.code, "11-20");
      if (!secondRange || secondRange.activity.type !== "number-flashcards") {
        throw new Error(`Missing second number range for ${locale.code}`);
      }

      expect(secondRange.activity.cards.map((card) => card.value)).toEqual([11, 12, 13, 14, 15, 16, 17, 18, 19, 20]);
      for (const card of secondRange.activity.cards) {
        expect(card.word.trim().length).toBeGreaterThan(0);
        expect(card.speechText.trim().length).toBeGreaterThan(0);
        expect(card.objectsLabel.trim().length).toBeGreaterThan(0);
      }
    }
  });

  it("defines lesson image metadata for every locale", () => {
    for (const locale of locales) {
      for (const lesson of getLessons(locale.code)) {
        expect(lesson.image.src).toMatch(/^\/media\/lessons\/[a-z-]+\.svg$/);
        expect(lesson.image.alt.trim().length).toBeGreaterThan(12);
      }
    }
  });

  it("returns localized lesson detail", () => {
    expect(getLessonById("kk", "animals")?.title).toContain("Жануар");
  });
});
