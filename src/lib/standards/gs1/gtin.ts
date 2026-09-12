import type { CanonicalGtin, GtinType, IdentifierType } from "@/lib/standards/types";
import { isGtinCheckDigitValid } from "@/lib/standards/gs1/check-digit";
import { validationProvenance } from "@/lib/standards/versions";

export { calculateGTINCheckDigit, isGtinCheckDigitValid } from "@/lib/standards/gs1/check-digit";

const GTIN_LENGTHS = [8, 12, 13, 14] as const;

export type GtinValidationIssue = {
  code:
    | "EMPTY"
    | "NON_NUMERIC"
    | "UNSUPPORTED_LENGTH"
    | "INVALID_CHECK_DIGIT"
    | "NOT_A_GTIN";
  message: string;
};

export type GtinValidationResult = {
  valid: boolean;
  checkDigitValid: boolean;
  detectedType: GtinType | IdentifierType | "UNKNOWN";
  rawValue: string;
  displayValue: string;
  canonicalGTIN14: string | null;
  checkDigit: string | null;
  carrierHint: "EAN_8" | "EAN_13" | "UPC_A" | "ITF_14" | null;
  issues: GtinValidationIssue[];
  officialGtin: boolean;
  standards: ReturnType<typeof validationProvenance>;
};

export function stripIdentifierFormatting(input: string): string {
  return input.replace(/[\s-]/g, "").trim();
}

export function normaliseGTIN(input: string): string {
  return stripIdentifierFormatting(input);
}

export const normalizeGTIN = normaliseGTIN;

export function detectGTINType(value: string): GtinType | "ISBN_13" | "UNKNOWN" {
  const digits = normaliseGTIN(value);
  if (!/^\d+$/.test(digits)) {
    return "UNKNOWN";
  }

  switch (digits.length) {
    case 8:
      return "GTIN_8";
    case 12:
      return "GTIN_12";
    case 13:
      if (digits.startsWith("978") || digits.startsWith("979")) {
        return "ISBN_13";
      }
      return "GTIN_13";
    case 14:
      return "GTIN_14";
    default:
      return "UNKNOWN";
  }
}

export function toCanonicalGTIN14(digits: string): string {
  if (!/^\d+$/.test(digits) || ![8, 12, 13, 14].includes(digits.length)) {
    throw new Error("Only GTIN-8, GTIN-12, GTIN-13 and GTIN-14 can be canonicalised.");
  }

  return digits.padStart(14, "0");
}

export function formatGTIN(digits: string): string {
  return displayGTIN(digits);
}

export function displayGTIN(canonicalOrRaw: string): string {
  const digits = normaliseGTIN(canonicalOrRaw);
  if (!/^\d+$/.test(digits)) {
    return canonicalOrRaw;
  }

  if (digits.length !== 14) {
    return digits;
  }

  if (digits.startsWith("000000") && isGtinCheckDigitValid(digits.slice(6))) {
    return digits.slice(6);
  }
  if (digits.startsWith("00") && isGtinCheckDigitValid(digits.slice(2))) {
    return digits.slice(2);
  }
  if (digits.startsWith("0") && isGtinCheckDigitValid(digits.slice(1))) {
    return digits.slice(1);
  }

  return digits;
}

export function recommendedCarrier(gtinType: GtinType | "ISBN_13"): GtinValidationResult["carrierHint"] {
  switch (gtinType) {
    case "GTIN_8":
      return "EAN_8";
    case "GTIN_12":
      return "UPC_A";
    case "GTIN_13":
    case "ISBN_13":
      return "EAN_13";
    case "GTIN_14":
      return "ITF_14";
    default:
      return null;
  }
}

export function canonicaliseGTIN(input: string): CanonicalGtin {
  const rawValue = input.trim();
  const displayValue = normaliseGTIN(rawValue);
  const detected = detectGTINType(displayValue);

  if (detected === "UNKNOWN" || !/^\d+$/.test(displayValue)) {
    throw new Error("Value is not a GTIN.");
  }

  const gtinType: GtinType = detected === "ISBN_13" ? "GTIN_13" : detected;
  const checkDigitValid = isGtinCheckDigitValid(displayValue);
  const gtin14 = toCanonicalGTIN14(displayValue);

  return {
    rawValue,
    displayValue,
    gtin14,
    gtinType,
    checkDigit: displayValue.slice(-1),
    checkDigitValid,
  };
}

export function validateGTIN(input: string): GtinValidationResult {
  const standards = validationProvenance();
  const rawValue = input.trim();

  if (!rawValue) {
    return {
      valid: false,
      checkDigitValid: false,
      detectedType: "UNKNOWN",
      rawValue,
      displayValue: "",
      canonicalGTIN14: null,
      checkDigit: null,
      carrierHint: null,
      officialGtin: false,
      issues: [{ code: "EMPTY", message: "An identifier value is required." }],
      standards,
    };
  }

  const displayValue = normaliseGTIN(rawValue);
  const issues: GtinValidationIssue[] = [];

  if (!/^\d+$/.test(displayValue)) {
    issues.push({
      code: "NON_NUMERIC",
      message: "GTIN values may contain only digits, spaces or hyphens.",
    });
  } else if (!GTIN_LENGTHS.includes(displayValue.length as (typeof GTIN_LENGTHS)[number])) {
    issues.push({
      code: "UNSUPPORTED_LENGTH",
      message: "A GTIN must be 8, 12, 13 or 14 digits. Other lengths are not GS1 GTINs.",
    });
  }

  const detected = issues.length === 0 ? detectGTINType(displayValue) : "UNKNOWN";
  const checkDigitValid =
    issues.length === 0 && /^\d+$/.test(displayValue) && isGtinCheckDigitValid(displayValue);

  if (issues.length === 0 && !checkDigitValid) {
    issues.push({
      code: "INVALID_CHECK_DIGIT",
      message: "The GS1 Modulo-10 check digit is invalid. This value is not a valid GTIN.",
    });
  }

  const gtinType = detected === "ISBN_13" ? "GTIN_13" : detected;
  const officialGtin = issues.length === 0 && checkDigitValid;

  return {
    valid: officialGtin,
    checkDigitValid,
    detectedType: detected,
    rawValue,
    displayValue,
    canonicalGTIN14: officialGtin ? toCanonicalGTIN14(displayValue) : null,
    checkDigit: /^\d+$/.test(displayValue) ? displayValue.slice(-1) : null,
    carrierHint: officialGtin && gtinType !== "UNKNOWN" ? recommendedCarrier(gtinType) : null,
    officialGtin,
    issues,
    standards,
  };
}

/**
 * UPC-A and EAN-13 are GTIN encodings, not separate identification systems.
 */
export function identifierTypeForGtin(detected: GtinValidationResult["detectedType"]): IdentifierType {
  switch (detected) {
    case "GTIN_8":
      return "GTIN_8";
    case "GTIN_12":
      return "GTIN_12";
    case "GTIN_13":
      return "GTIN_13";
    case "GTIN_14":
      return "GTIN_14";
    case "ISBN_13":
      return "ISBN_13";
    default:
      return "OTHER";
  }
}

export function looksLikeGtin(query: string): boolean {
  const digits = normaliseGTIN(query);
  return /^\d+$/.test(digits) && GTIN_LENGTHS.includes(digits.length as (typeof GTIN_LENGTHS)[number]);
}

/**
 * Values that may be stored for the same GTIN: printed form and canonical GTIN-14.
 * Used for registry lookup; never used to change the printed barcode.
 */
export function gtinLookupCandidates(input: string): string[] {
  const digits = normaliseGTIN(input);
  const values = new Set<string>();
  if (digits) {
    values.add(digits);
  }

  const parsed = validateGTIN(input);
  if (parsed.displayValue) {
    values.add(parsed.displayValue);
  }
  if (parsed.canonicalGTIN14) {
    values.add(parsed.canonicalGTIN14);
    values.add(displayGTIN(parsed.canonicalGTIN14));
  }

  if (/^\d+$/.test(digits) && GTIN_LENGTHS.includes(digits.length as (typeof GTIN_LENGTHS)[number])) {
    try {
      const padded = toCanonicalGTIN14(digits);
      values.add(padded);
      values.add(displayGTIN(padded));
    } catch {
      // ignore values that cannot be canonicalised
    }
  }

  return [...values];
}
