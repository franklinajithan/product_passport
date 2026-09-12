import type { BarcodeSymbology, GtinType } from "@/lib/standards/types";
import { validateGTIN } from "@/lib/standards/gs1/gtin";

export type SymbologyRule = {
  symbology: BarcodeSymbology;
  title: string;
  permittedIdentifierTypes: Array<GtinType | "ELEMENT_STRING" | "URI" | "FREE">;
  minLength: number;
  maxLength: number;
  requiresCheckDigit: boolean;
  typicalUse: string;
};

export const SYMBOLOGY_RULES: SymbologyRule[] = [
  {
    symbology: "EAN_8",
    title: "EAN-8",
    permittedIdentifierTypes: ["GTIN_8"],
    minLength: 8,
    maxLength: 8,
    requiresCheckDigit: true,
    typicalUse: "Small consumer packages encoded from GTIN-8",
  },
  {
    symbology: "EAN_13",
    title: "EAN-13",
    permittedIdentifierTypes: ["GTIN_13"],
    minLength: 13,
    maxLength: 13,
    requiresCheckDigit: true,
    typicalUse: "Retail consumer packages encoded from GTIN-13",
  },
  {
    symbology: "UPC_A",
    title: "UPC-A",
    permittedIdentifierTypes: ["GTIN_12"],
    minLength: 12,
    maxLength: 12,
    requiresCheckDigit: true,
    typicalUse: "North American retail packages encoded from GTIN-12",
  },
  {
    symbology: "UPC_E",
    title: "UPC-E",
    permittedIdentifierTypes: ["GTIN_12"],
    minLength: 6,
    maxLength: 8,
    requiresCheckDigit: true,
    typicalUse: "Zero-suppressed UPC-A for small packages",
  },
  {
    symbology: "ITF_14",
    title: "ITF-14",
    permittedIdentifierTypes: ["GTIN_14"],
    minLength: 14,
    maxLength: 14,
    requiresCheckDigit: true,
    typicalUse: "Cartons and outer packs encoded from GTIN-14",
  },
  {
    symbology: "GS1_128",
    title: "GS1-128",
    permittedIdentifierTypes: ["ELEMENT_STRING", "GTIN_14", "GTIN_13", "GTIN_12", "GTIN_8"],
    minLength: 1,
    maxLength: 48,
    requiresCheckDigit: false,
    typicalUse: "Logistics labels carrying Application Identifiers",
  },
  {
    symbology: "GS1_DATABAR",
    title: "GS1 DataBar",
    permittedIdentifierTypes: ["GTIN_13", "GTIN_12", "GTIN_8", "GTIN_14"],
    minLength: 8,
    maxLength: 14,
    requiresCheckDigit: true,
    typicalUse: "Loose produce and coupons",
  },
  {
    symbology: "GS1_DATAMATRIX",
    title: "GS1 DataMatrix",
    permittedIdentifierTypes: ["ELEMENT_STRING", "URI", "GTIN_14", "GTIN_13"],
    minLength: 1,
    maxLength: 1556,
    requiresCheckDigit: false,
    typicalUse: "Healthcare and 2D marking of trade items",
  },
  {
    symbology: "GS1_QR_CODE",
    title: "GS1 QR Code",
    permittedIdentifierTypes: ["URI", "ELEMENT_STRING"],
    minLength: 1,
    maxLength: 4296,
    requiresCheckDigit: false,
    typicalUse: "GS1 Digital Link in a QR carrier",
  },
  {
    symbology: "QR_CODE",
    title: "QR Code",
    permittedIdentifierTypes: ["URI", "FREE"],
    minLength: 1,
    maxLength: 4296,
    requiresCheckDigit: false,
    typicalUse: "Generic QR carrier — not a GS1 identifier by itself",
  },
  {
    symbology: "DATA_MATRIX",
    title: "Data Matrix",
    permittedIdentifierTypes: ["FREE", "ELEMENT_STRING"],
    minLength: 1,
    maxLength: 1556,
    requiresCheckDigit: false,
    typicalUse: "Generic 2D carrier — not a GS1 identifier by itself",
  },
];

export type SymbologyValidation = {
  ok: boolean;
  warnings: string[];
  errors: string[];
  encodedData: string;
  humanReadableText: string;
};

export function getSymbologyRule(symbology: BarcodeSymbology): SymbologyRule {
  const rule = SYMBOLOGY_RULES.find((item) => item.symbology === symbology);
  if (!rule) {
    throw new Error(`Unsupported symbology ${symbology}.`);
  }
  return rule;
}

export function validateSymbologyPayload(
  symbology: BarcodeSymbology,
  value: string,
  options?: { xDimensionMm?: number; magnification?: number },
): SymbologyValidation {
  const rule = getSymbologyRule(symbology);
  const errors: string[] = [];
  const warnings: string[] = [];
  const trimmed = value.trim();

  if (rule.requiresCheckDigit) {
    const gtin = validateGTIN(trimmed);
    if (!gtin.valid) {
      errors.push(...gtin.issues.map((issue) => issue.message));
    } else {
      const typeOk =
        (gtin.detectedType === "ISBN_13" && rule.permittedIdentifierTypes.includes("GTIN_13")) ||
        rule.permittedIdentifierTypes.includes(gtin.detectedType as GtinType);
      if (!typeOk) {
        errors.push(
          `${rule.title} cannot encode ${gtin.detectedType}. Choose a carrier that matches the identifier form. A GTIN is not the same thing as a barcode symbol.`,
        );
      }
    }
  } else if (trimmed.length < rule.minLength) {
    errors.push(`${rule.title} payload is too short.`);
  }

  if (options?.magnification !== undefined && options.magnification < 0.8) {
    warnings.push(
      "Magnification is below 0.80. Reducing a symbol this far can make it unreliable to scan. Do not distort barcode dimensions to fit artwork.",
    );
  }

  if (options?.xDimensionMm !== undefined && options.xDimensionMm < 0.264) {
    warnings.push(
      "X-dimension is below the common retail minimum. Print quality may fail even if the data is valid.",
    );
  }

  const gtin = validateGTIN(trimmed);
  const encodedData = gtin.valid ? gtin.displayValue : trimmed;
  const humanReadableText = gtin.valid ? gtin.displayValue : trimmed;

  return {
    ok: errors.length === 0,
    warnings,
    errors,
    encodedData,
    humanReadableText,
  };
}
