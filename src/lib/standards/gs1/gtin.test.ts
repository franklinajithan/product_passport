import { describe, expect, it } from "vitest";
import {
  calculateGTINCheckDigit,
  canonicaliseGTIN,
  detectGTINType,
  displayGTIN,
  gtinLookupCandidates,
  looksLikeGtin,
  normaliseGTIN,
  toCanonicalGTIN14,
  validateGTIN,
} from "./gtin";

describe("calculateGTINCheckDigit", () => {
  it("computes GTIN-13 check digits", () => {
    expect(calculateGTINCheckDigit("590123456789")).toBe("3");
    expect(calculateGTINCheckDigit("590123412345")).toBe("7");
  });
});

describe("GTIN-8", () => {
  it("accepts a valid GTIN-8", () => {
    const result = validateGTIN("96385074");
    expect(result.valid).toBe(true);
    expect(result.checkDigitValid).toBe(true);
    expect(result.detectedType).toBe("GTIN_8");
    expect(result.canonicalGTIN14).toBe("00000096385074");
    expect(result.carrierHint).toBe("EAN_8");
  });

  it("rejects an invalid GTIN-8 check digit", () => {
    const result = validateGTIN("96385075");
    expect(result.valid).toBe(false);
    expect(result.checkDigitValid).toBe(false);
    expect(result.issues.some((issue) => issue.code === "INVALID_CHECK_DIGIT")).toBe(true);
  });
});

describe("GTIN-12 / UPC-A", () => {
  it("accepts a valid GTIN-12", () => {
    const result = validateGTIN("036000291452");
    expect(result.valid).toBe(true);
    expect(result.detectedType).toBe("GTIN_12");
    expect(result.canonicalGTIN14).toBe("00036000291452");
    expect(result.carrierHint).toBe("UPC_A");
  });

  it("rejects an invalid GTIN-12", () => {
    expect(validateGTIN("036000291453").valid).toBe(false);
  });
});

describe("GTIN-13 / EAN-13", () => {
  it("accepts a valid GTIN-13", () => {
    const result = validateGTIN("5901234123457");
    expect(result.valid).toBe(true);
    expect(result.detectedType).toBe("GTIN_13");
    expect(result.canonicalGTIN14).toBe("05901234123457");
    expect(result.carrierHint).toBe("EAN_13");
  });

  it("rejects an invalid GTIN-13 check digit", () => {
    expect(validateGTIN("5901234567890").valid).toBe(false);
  });

  it("does not treat UPC/EAN as a different identification system", () => {
    const ean = validateGTIN("5901234567893");
    expect(ean.detectedType).toBe("GTIN_13");
    expect(ean.officialGtin).toBe(true);
  });
});

describe("GTIN-14", () => {
  it("accepts a valid GTIN-14", () => {
    const result = validateGTIN("00012345678905");
    expect(result.valid).toBe(true);
    expect(result.detectedType).toBe("GTIN_14");
    expect(result.canonicalGTIN14).toBe("00012345678905");
    expect(result.carrierHint).toBe("ITF_14");
  });

  it("rejects an invalid GTIN-14", () => {
    expect(validateGTIN("00012345678900").valid).toBe(false);
  });
});

describe("normalisation", () => {
  it("strips spaces and hyphens", () => {
    expect(normaliseGTIN("590 1234-1234-57")).toBe("5901234123457");
    expect(validateGTIN("590-1234-1234-57").valid).toBe(true);
  });

  it("pads to canonical GTIN-14 without changing the printed form", () => {
    const canonical = canonicaliseGTIN("5901234123457");
    expect(canonical.gtin14).toBe("05901234123457");
    expect(canonical.displayValue).toBe("5901234123457");
    expect(displayGTIN(canonical.gtin14)).toBe("5901234123457");
  });

  it("pads GTIN-12 with two leading zeros", () => {
    expect(toCanonicalGTIN14("036000291452")).toBe("00036000291452");
    expect(displayGTIN("00036000291452")).toBe("036000291452");
  });

  it("looks up both printed GTIN-13 and canonical GTIN-14", () => {
    expect(gtinLookupCandidates("5901234123457")).toEqual(
      expect.arrayContaining(["5901234123457", "05901234123457"]),
    );
    expect(gtinLookupCandidates("05901234123457")).toEqual(
      expect.arrayContaining(["5901234123457", "05901234123457"]),
    );
  });

  it("rejects non-numeric and wrong-length values instead of length-only checks", () => {
    expect(validateGTIN("ABC123").issues[0].code).toBe("NON_NUMERIC");
    expect(validateGTIN("1234567").issues[0].code).toBe("UNSUPPORTED_LENGTH");
    expect(looksLikeGtin("Extra Butter")).toBe(false);
  });

  it("detects ISBN-13 as a GTIN-13 form", () => {
    expect(detectGTINType("9780201379624")).toBe("ISBN_13");
  });
});
