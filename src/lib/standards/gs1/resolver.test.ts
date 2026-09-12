import { describe, expect, it } from "vitest";
import { buildResolverLinks, pickTranslationLanguage, preferredLanguagesFromRequest } from "./resolver";

describe("Digital Link resolver language selection", () => {
  it("selects Polish when requested and available", () => {
    expect(pickTranslationLanguage(["en", "pl", "ja"], ["pl-PL", "en"])).toBe("pl");
  });

  it("selects Japanese for ja-JP", () => {
    expect(pickTranslationLanguage(["en", "ja"], ["ja-JP"])).toBe("ja");
  });

  it("falls back to English then the first available language", () => {
    expect(pickTranslationLanguage(["en", "pl"], ["ko"])).toBe("en");
    expect(pickTranslationLanguage(["pl"], ["ko"])).toBe("pl");
  });

  it("honours an explicit query language over Accept-Language", () => {
    const preferred = preferredLanguagesFromRequest({
      queryLanguage: "ja",
      acceptLanguage: "en-GB,en;q=0.9",
    });
    expect(pickTranslationLanguage(["en", "pl", "ja"], preferred)).toBe("ja");
  });
});

describe("resolver link set", () => {
  it("includes recall only when a recall exists", () => {
    const without = buildResolverLinks({
      appUrl: "https://example.com",
      gtin: "5901234567893",
      language: "en",
    });
    expect(without.some((link) => link.rel === "recall")).toBe(false);

    const withRecall = buildResolverLinks({
      appUrl: "https://example.com",
      gtin: "5901234567893",
      language: "en",
      hasRecall: true,
    });
    expect(withRecall.some((link) => link.rel === "recall")).toBe(true);
  });
});
