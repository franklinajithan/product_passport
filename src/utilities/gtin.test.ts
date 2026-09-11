import { describe, expect, it } from "vitest";
import {
  computeGtinCheckDigit,
  hasValidGtinCheckDigit,
  looksLikeBarcode,
  normalizeBarcode,
  validateBarcode,
} from "./gtin";

describe("normalizeBarcode", () => {
  it("strips spaces and hyphens", () => {
    expect(normalizeBarcode("590 1234-567893")).toBe("5901234567893");
  });
});

describe("EAN-13 check digits", () => {
  it("accepts a valid EAN-13", () => {
    expect(hasValidGtinCheckDigit("5901234567893")).toBe(true);
    expect(validateBarcode("5901234567893").ok).toBe(true);
    expect(validateBarcode("5901234567893").type).toBe("EAN_13");
  });

  it("rejects an EAN-13 with an incorrect check digit", () => {
    expect(hasValidGtinCheckDigit("5901234567890")).toBe(false);
    const result = validateBarcode("5901234567890");
    expect(result.ok).toBe(false);
    expect(result.errors[0]).toMatch(/check digit/i);
  });

  it("computes the expected check digit", () => {
    expect(computeGtinCheckDigit("590123456789")).toBe("3");
  });

  it("accepts barcodes entered with spaces or hyphens", () => {
    expect(validateBarcode("590-1234-5678-93").ok).toBe(true);
    expect(validateBarcode("5901234567893 ").normalized).toBe("5901234567893");
  });
});

describe("other GTIN lengths", () => {
  it("validates EAN-8", () => {
    expect(hasValidGtinCheckDigit("96385074")).toBe(true);
    expect(validateBarcode("96385074").type).toBe("EAN_8");
  });

  it("validates UPC-A", () => {
    expect(hasValidGtinCheckDigit("036000291452")).toBe(true);
    expect(validateBarcode("036000291452").type).toBe("UPC_A");
  });

  it("validates GTIN-14", () => {
    expect(hasValidGtinCheckDigit("00012345678905")).toBe(true);
    expect(validateBarcode("00012345678905").type).toBe("GTIN_14");
  });

  it("rejects non-numeric official barcodes", () => {
    expect(validateBarcode("ABC1234567890").ok).toBe(false);
  });
});

describe("internal identifiers", () => {
  it("accepts GPR internal IDs and marks them as unofficial", () => {
    const result = validateBarcode("GPR-00000012345");
    expect(result.ok).toBe(true);
    expect(result.type).toBe("INTERNAL");
    expect(result.isOfficialGtin).toBe(false);
  });
});

describe("looksLikeBarcode", () => {
  it("detects numeric barcode queries", () => {
    expect(looksLikeBarcode("5901234567893")).toBe(true);
    expect(looksLikeBarcode("Extra Butter")).toBe(false);
  });
});
