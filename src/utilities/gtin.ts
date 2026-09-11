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
  return input.replace(/[\s-]/g, "").trim().toUpperCase();
}

export function isNumericBarcode(value: string): boolean {
  return /^\d+$/.test(value);
}

/**
 * GS1 check digit: from the right of the payload (excluding the check digit),
 * odd positions are multiplied by 3 and even positions by 1.
 */
export function computeGtinCheckDigit(payloadWithoutCheck: string): string {
  if (!isNumericBarcode(payloadWithoutCheck) || payloadWithoutCheck.length === 0) {
    throw new Error("GTIN payload must be a non-empty numeric string.");
  }

  const digits = payloadWithoutCheck.split("").map(Number);
  let sum = 0;
  const reversed = [...digits].reverse();

  for (let index = 0; index < reversed.length; index += 1) {
    const multiplier = index % 2 === 0 ? 3 : 1;
    sum += reversed[index] * multiplier;
  }

  return String((10 - (sum % 10)) % 10);
}

export function hasValidGtinCheckDigit(gtin: string): boolean {
  if (!isNumericBarcode(gtin) || gtin.length < 8) {
    return false;
  }

  const payload = gtin.slice(0, -1);
  const check = gtin.slice(-1);
  return computeGtinCheckDigit(payload) === check;
}

export function detectBarcodeType(value: string): BarcodeKind {
  if (INTERNAL_PATTERN.test(value)) {
    return "INTERNAL";
  }

  if (!isNumericBarcode(value)) {
    return "UNKNOWN";
  }

  switch (value.length) {
    case 8:
      return "EAN_8";
    case 12:
      return "UPC_A";
    case 13:
      if (value.startsWith("978") || value.startsWith("979")) {
        return "ISBN";
      }
      return "EAN_13";
    case 14:
      return "GTIN_14";
    default:
      return "UNKNOWN";
  }
}

export function validateBarcode(input: string): GtinValidationResult {
  const trimmed = input.trim();
  const errors: string[] = [];

  if (!trimmed) {
    return {
      ok: false,
      normalized: "",
      type: "UNKNOWN",
      isOfficialGtin: false,
      errors: ["Barcode is required."],
    };
  }

  if (INTERNAL_PATTERN.test(trimmed.toUpperCase())) {
    return {
      ok: true,
      normalized: trimmed.toUpperCase(),
      type: "INTERNAL",
      isOfficialGtin: false,
      errors: [],
    };
  }

  const normalized = normalizeBarcode(trimmed);
  const type = detectBarcodeType(normalized);
  const officialLengths = [8, 12, 13, 14];

  if (!isNumericBarcode(normalized)) {
    errors.push("Official barcodes must contain only digits, spaces or hyphens.");
  } else if (!officialLengths.includes(normalized.length)) {
    errors.push(
      "Official GTIN/EAN/UPC values must be 8, 12, 13 or 14 digits. Use an internal GPR ID for products without a GS1 number.",
    );
  } else if (!hasValidGtinCheckDigit(normalized)) {
    errors.push("The check digit is invalid. This is not a valid GTIN/EAN/UPC number.");
  }

  return {
    ok: errors.length === 0,
    normalized,
    type,
    isOfficialGtin: errors.length === 0 && type !== "INTERNAL" && type !== "UNKNOWN",
    errors,
  };
}

export function formatInternalId(publicNumber: number): string {
  return `GPR-${String(publicNumber).padStart(11, "0")}`;
}

export function looksLikeBarcode(query: string): boolean {
  const normalized = normalizeBarcode(query);
  return isNumericBarcode(normalized) && [8, 12, 13, 14].includes(normalized.length);
}
