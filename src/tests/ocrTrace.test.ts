import { describe, expect, it } from "vitest";
import { evaluateOcrTrace, getTraceOcrConfig, normalizeOcrText } from "../lib/ocrTrace";

describe("ocrTrace", () => {
  it("uses digit-only OCR config for number tracing", () => {
    const config = getTraceOcrConfig({ kind: "number" });

    expect(config.languages).toEqual(["eng"]);
    expect(config.whitelist).toBe("0123456789");
    expect(config.pageSegMode).toBe("single_word");
  });

  it("has separate OCR configs for English, Russian, and Kazakh letters", () => {
    const english = getTraceOcrConfig({ kind: "letter", locale: "en" });
    const russian = getTraceOcrConfig({ kind: "letter", locale: "ru" });
    const kazakh = getTraceOcrConfig({ kind: "letter", locale: "kk" });

    expect(english.languages).toEqual(["eng"]);
    expect(english.whitelist).toContain("A");
    expect(english.whitelist).toContain("Z");

    expect(russian.languages).toEqual(["rus"]);
    expect(russian.whitelist).toContain("А");
    expect(russian.whitelist).toContain("Я");
    expect(russian.whitelist).toContain("Ё");

    expect(kazakh.languages).toEqual(["kaz"]);
    expect(kazakh.whitelist).toContain("Ә");
    expect(kazakh.whitelist).toContain("І");
    expect(kazakh.whitelist).toContain("Ң");
  });

  it("normalizes OCR text through the target whitelist", () => {
    const digits = getTraceOcrConfig({ kind: "number" });
    const english = getTraceOcrConfig({ kind: "letter", locale: "en" });

    expect(normalizeOcrText(" 5 1\n", digits)).toBe("51");
    expect(normalizeOcrText("a b c!", english)).toBe("ABC");
  });

  it("accepts only exact text with enough confidence", () => {
    const config = getTraceOcrConfig({ kind: "number" });

    expect(evaluateOcrTrace("51", "51", 90, config).passed).toBe(true);
    expect(evaluateOcrTrace("51", "62", 95, config).passed).toBe(false);
    expect(evaluateOcrTrace("51", "51", 40, config).passed).toBe(false);
  });
});
