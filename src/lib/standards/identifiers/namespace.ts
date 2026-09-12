import type { IdentifierNamespace, IdentifierType } from "@/lib/standards/types";

export function namespaceForIdentifierType(type: IdentifierType): IdentifierNamespace {
  switch (type) {
    case "GTIN_8":
    case "GTIN_12":
    case "GTIN_13":
    case "GTIN_14":
    case "UPC_A":
    case "EAN_8":
    case "EAN_13":
    case "GS1_DIGITAL_LINK":
      return "GS1_GTIN";
    case "ISBN_10":
    case "ISBN_13":
      return "ISBN";
    case "PLU":
      return "PLU";
    case "SKU":
    case "MPN":
    case "INTERNAL":
      return "INTERNAL";
    default:
      return "OTHER";
  }
}

export function isGs1GtinType(type: IdentifierType): boolean {
  return namespaceForIdentifierType(type) === "GS1_GTIN" && type !== "GS1_DIGITAL_LINK";
}

export function internalIdentifierDisclaimer(): string {
  return "Internal Identifier — not a globally registered GS1 GTIN";
}

export function gtinIssuanceDisclaimer(): string {
  return "This platform helps organisations manage and validate product identifiers and associated product information. Official GS1 identifiers must be obtained and allocated according to GS1 rules through the applicable GS1 organisation.";
}

export function barcodeGeneratedMessage(gtin: string): string {
  return `Barcode symbol generated from GTIN ${gtin}.`;
}
