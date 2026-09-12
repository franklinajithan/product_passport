import {
  looksLikeGtin,
  normaliseGTIN,
  validateGTIN,
  calculateGTINCheckDigit,
  isGtinCheckDigitValid,
} from "@/lib/standards/gs1/gtin";

export type BarcodeKind =
  | "EAN_13"
  | "EAN_8"
  | "UPC_A"
  | "UPC_E"
  | "GTIN_14"
  | "ISBN"
  | "INTERNAL"
  | "UNKNOWN";

export type GtinValidationResult = {
  ok: boolean;
  normalized: string;
  type: BarcodeKind;
  isOfficialGtin: boolean;
  errors: string[];
};

const INTERNAL_PATTERN = /^GPR-\d{11}$/;

export function normalizeBarcode(input: string): string {
  return normaliseGTIN(input).toUpperCase();
}

export function isNumericBarcode(value: string): boolean {
  return /^\d+$/.test(value);
}

export function computeGtinCheckDigit(payloadWithoutCheck: string): string {
  return calculateGTINCheckDigit(payloadWithoutCheck);
}

export function hasValidGtinCheckDigit(gtin: string): boolean {
  return isGtinCheckDigitValid(gtin);
}

function carrierToLegacyType(detected: string): BarcodeKind {
  switch (detected) {
    case "GTIN_8":
      return "EAN_8";
    case "GTIN_12":
      return "UPC_A";
    case "GTIN_13":
      return "EAN_13";
    case "ISBN_13":
      return "ISBN";
    case "GTIN_14":
      return "GTIN_14";
    default:
      return "UNKNOWN";
  }
}

export function detectBarcodeType(value: string): BarcodeKind {
  if (INTERNAL_PATTERN.test(value)) {
    return "INTERNAL";
  }
  return carrierToLegacyType(validateGTIN(value).detectedType);
}

export function validateBarcode(input: string): GtinValidationResult {
  const trimmed = input.trim();
  if (INTERNAL_PATTERN.test(trimmed.toUpperCase())) {
    return {
      ok: true,
      normalized: trimmed.toUpperCase(),
      type: "INTERNAL",
      isOfficialGtin: false,
      errors: [],
    };
  }

  const result = validateGTIN(trimmed);
  return {
    ok: result.valid,
    normalized: result.displayValue,
    type: carrierToLegacyType(result.detectedType),
    isOfficialGtin: result.officialGtin,
    errors: result.issues.map((issue) => issue.message),
  };
}

export function formatInternalId(publicNumber: number): string {
  return `GPR-${String(publicNumber).padStart(11, "0")}`;
}

export function looksLikeBarcode(query: string): boolean {
  if (INTERNAL_PATTERN.test(query.trim().toUpperCase())) {
    return true;
  }
  return looksLikeGtin(query);
}
