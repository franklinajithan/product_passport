export type StandardRecord = {
  key: string;
  name: string;
  version: string;
  publishedDate: string;
  effectiveDate: string;
  status: "ACTIVE" | "SUPERSEDED" | "DRAFT";
  source: string;
};

/**
 * Version metadata only. Do not embed copyrighted standards text.
 * Implementations encode the operational rules; this table records which
 * publication a validation run was aligned to.
 */
export const CURRENT_STANDARDS: StandardRecord[] = [
  {
    key: "GS1_GENERAL_SPECIFICATIONS",
    name: "GS1 General Specifications",
    version: "26.0",
    publishedDate: "2026-01-01",
    effectiveDate: "2026-01-01",
    status: "ACTIVE",
    source: "https://www.gs1.org/standards/barcodes-epcrfid-id-keys/gs1-general-specifications",
  },
  {
    key: "GS1_GTIN_MANAGEMENT",
    name: "GS1 GTIN Management Standard",
    version: "2.0.1",
    publishedDate: "2023-01-01",
    effectiveDate: "2023-01-01",
    status: "ACTIVE",
    source: "https://www.gs1.org/standards/gtin-management-standard",
  },
  {
    key: "GS1_DIGITAL_LINK",
    name: "GS1 Digital Link URI Syntax",
    version: "1.2.1",
    publishedDate: "2023-09-01",
    effectiveDate: "2023-09-01",
    status: "ACTIVE",
    source: "https://www.gs1.org/standards/gs1-digital-link",
  },
  {
    key: "GS1_APPLICATION_IDENTIFIERS",
    name: "GS1 Application Identifier definitions",
    version: "26.0",
    publishedDate: "2026-01-01",
    effectiveDate: "2026-01-01",
    status: "ACTIVE",
    source: "https://www.gs1.org/standards/barcodes/application-identifiers",
  },
];

export function getStandard(key: string): StandardRecord | undefined {
  return CURRENT_STANDARDS.find((item) => item.key === key);
}

export function validationProvenance() {
  return {
    validatedAgainst: CURRENT_STANDARDS.filter((item) => item.status === "ACTIVE").map((item) => ({
      name: item.name,
      version: item.version,
    })),
  };
}
