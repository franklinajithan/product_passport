export const ISSUING_SYSTEM_GS1 = "GS1";
export const ISSUING_SYSTEM_ISBN = "ISBN";
export const ISSUING_SYSTEM_PLU = "PLU";
export const ISSUING_SYSTEM_INTERNAL = "INTERNAL";
export const ISSUING_SYSTEM_GPR = "GPR";

export type IdentifierType =
  | "GTIN_8"
  | "GTIN_12"
  | "GTIN_13"
  | "GTIN_14"
  | "UPC_A"
  | "EAN_8"
  | "EAN_13"
  | "ISBN_10"
  | "ISBN_13"
  | "PLU"
  | "SKU"
  | "MPN"
  | "INTERNAL"
  | "GS1_DIGITAL_LINK"
  | "OTHER";

export type IdentifierNamespace = "GS1_GTIN" | "ISBN" | "PLU" | "INTERNAL" | "OTHER";

export type IdentifierStatus =
  | "ACTIVE"
  | "RESERVED"
  | "RETIRED"
  | "SUPERSEDED"
  | "DISPUTED";

export type OwnershipStatus =
  | "UNVERIFIED"
  | "FORMAT_VALID"
  | "OWNER_VERIFIED"
  | "GS1_VERIFIED"
  | "DISPUTED"
  | "RETIRED";

export type TradePartyRole =
  | "BRAND_OWNER"
  | "MANUFACTURER"
  | "CONTRACT_MANUFACTURER"
  | "IMPORTER"
  | "DISTRIBUTOR"
  | "RETAILER"
  | "DATA_PROVIDER";

export type PackagingLevel =
  | "CONSUMER_UNIT"
  | "INNER_PACK"
  | "CASE"
  | "TRAY"
  | "DISPLAY"
  | "PALLET"
  | "LOGISTIC_UNIT";

export type BarcodeSymbology =
  | "EAN_8"
  | "EAN_13"
  | "UPC_A"
  | "UPC_E"
  | "ITF_14"
  | "GS1_128"
  | "GS1_DATABAR"
  | "GS1_DATAMATRIX"
  | "GS1_QR_CODE"
  | "QR_CODE"
  | "DATA_MATRIX";

export type GtinType = "GTIN_8" | "GTIN_12" | "GTIN_13" | "GTIN_14";

export type CanonicalGtin = {
  rawValue: string;
  displayValue: string;
  gtin14: string;
  gtinType: GtinType;
  checkDigit: string;
  checkDigitValid: boolean;
};

export type GtinDecision = "SAME_GTIN" | "NEW_GTIN_REQUIRED" | "REVIEW_REQUIRED";

export type RuleSeverity = "INFO" | "WARNING" | "BLOCKING";

export type DataAuthority =
  | "VERIFIED_BRAND_OWNER"
  | "AUTHORISED_MANUFACTURER"
  | "AUTHORISED_DISTRIBUTOR"
  | "RETAILER"
  | "TRUSTED_EXTERNAL"
  | "COMMUNITY";

export const DATA_AUTHORITY_RANK: Record<DataAuthority, number> = {
  VERIFIED_BRAND_OWNER: 100,
  AUTHORISED_MANUFACTURER: 80,
  AUTHORISED_DISTRIBUTOR: 60,
  RETAILER: 40,
  TRUSTED_EXTERNAL: 20,
  COMMUNITY: 10,
};

export function canOverwriteAuthority(existing: DataAuthority, incoming: DataAuthority): boolean {
  return DATA_AUTHORITY_RANK[incoming] >= DATA_AUTHORITY_RANK[existing];
}
