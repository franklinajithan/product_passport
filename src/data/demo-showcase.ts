export type DemoTranslation = {
  language: string;
  code: string;
  name: string;
  source: "MANUFACTURER" | "HUMAN_VERIFIED" | "MACHINE";
};

export type DemoPackNode = {
  level: string;
  gtin: string;
  quantityFromChild: number | null;
  carrier: string;
  note?: string;
};

export const DEMO_LABEL = "Demonstration model — not a live production statistic";

export const DEMO_PASSPORT = {
  gtin: "5901234567893",
  canonicalGTIN14: "05901234567893",
  name: "Masło Ekstra",
  englishName: "Extra Butter",
  brand: "Example Brand",
  brandOwner: "Example Foods Sp. z o.o.",
  manufacturer: "Example Foods — Warsaw Dairy Plant",
  importer: "Example Distribution UK Ltd",
  origin: "Poland",
  netContent: "200 g",
  status: "Active",
  lastVerified: "10 September 2026",
  carrier: "EAN-13",
  verification: "MANUFACTURER_VERIFIED",
  completeness: 92,
  twoDReadiness: 82,
};

export const DEMO_TRANSLATIONS: DemoTranslation[] = [
  { language: "Polish", code: "pl", name: "Masło Ekstra", source: "MANUFACTURER" },
  { language: "English", code: "en", name: "Extra Butter", source: "MANUFACTURER" },
  { language: "French", code: "fr", name: "Beurre Extra", source: "MANUFACTURER" },
  { language: "Korean", code: "ko", name: "엑스트라 버터", source: "HUMAN_VERIFIED" },
  { language: "Japanese", code: "ja", name: "エクストラバター", source: "HUMAN_VERIFIED" },
  { language: "German", code: "de", name: "Extra Butter", source: "MACHINE" },
];

export const DEMO_PACKAGING: DemoPackNode[] = [
  { level: "Each / consumer unit", gtin: "5901234567893", quantityFromChild: null, carrier: "EAN-13" },
  { level: "Inner pack", gtin: "5901234567909", quantityFromChild: 6, carrier: "ITF-14" },
  { level: "Case", gtin: "15901234567906", quantityFromChild: 4, carrier: "ITF-14" },
  { level: "Pallet / logistics", gtin: "SSCC assigned at shipping", quantityFromChild: 60, carrier: "GS1-128", note: "SSCC is not a GTIN" },
];

export const DEMO_TIMELINE = [
  { year: "2025", title: "Product created", detail: "200 g consumer unit published with GTIN 5901234567893." },
  { year: "2026", title: "Artwork updated", detail: "Packaging artwork refreshed. Identification unchanged — SAME_GTIN." },
  { year: "2027", title: "Net quantity change modelled", detail: "500 g → 450 g would require NEW_GTIN. Historical 200 g record stays visible." },
];

export const PUBLIC_NAV = [
  { href: "/products", label: "Products" },
  { href: "/identifiers", label: "Identifiers" },
  { href: "/companies", label: "Companies" },
  { href: "/brands", label: "Brands" },
  { href: "/standards", label: "Standards" },
  { href: "/developers", label: "Developers" },
  { href: "/resources", label: "Resources" },
] as const;

export const STANDARDS_PAGES = [
  { href: "/standards/gtin", title: "GTIN", body: "Identifier types, canonical GTIN-14 storage and check digits." },
  { href: "/standards/barcodes", title: "Barcode carriers", body: "Symbologies are not identifiers. EAN-13 is a way to print a GTIN." },
  { href: "/standards/packaging", title: "Packaging hierarchy", body: "Each packaging level needs its own GTIN." },
  { href: "/standards/application-identifiers", title: "Application Identifiers", body: "AI 01, 10, 17, 21 and related element-string parsing." },
  { href: "/standards/digital-link", title: "GS1 Digital Link", body: "URI syntax using /01/{gtin} — not ?barcode=." },
  { href: "/standards/gtin-management", title: "GTIN management", body: "When a product change keeps, reviews, or requires a new GTIN." },
  { href: "/standards/2d-migration", title: "1D to 2D migration", body: "Moving from EAN-13 towards GS1 QR and GS1 DataMatrix." },
] as const;

export const TOOL_PAGES = [
  { href: "/tools/gtin-validator", title: "GTIN validator" },
  { href: "/tools/check-digit-calculator", title: "Check-digit calculator" },
  { href: "/tools/barcode-generator", title: "Barcode symbol generator" },
  { href: "/tools/barcode-scanner", title: "Barcode scanner" },
  { href: "/tools/gtin-normalizer", title: "GTIN normaliser" },
  { href: "/tools/digital-link-builder", title: "Digital Link builder" },
  { href: "/tools/gs1-ai-parser", title: "GS1 AI parser" },
] as const;
