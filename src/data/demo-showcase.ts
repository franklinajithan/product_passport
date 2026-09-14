export type DemoTranslation = {
  language: string;
  code: string;
  name: string;
  source: "MANUFACTURER" | "HUMAN_VERIFIED" | "MACHINE" | "PUBLIC_DEMO";
};

export type DemoPackNode = {
  level: string;
  gtin: string;
  quantityFromChild: number | null;
  carrier: string;
  note?: string;
};

export const DEMO_LABEL = "Demonstration model — not a live production statistic";

export const DEMO_PRODUCT_DISCLAIMER =
  "Product information shown for demonstration. Not verified by Coca-Cola through Global Product Registry.";

export const DEMO_PASSPORT = {
  gtin: "5449000000996",
  canonicalGTIN14: "05449000000996",
  name: "Coca-Cola Original Taste",
  englishName: "Coca-Cola Original Taste",
  brand: "Coca-Cola",
  brandOwner: "The Coca-Cola Company",
  manufacturer: "The Coca-Cola Company",
  importer: "Not attested on this platform",
  origin: "United Kingdom",
  targetMarket: "United Kingdom",
  productType: "Sparkling Soft Drink",
  netContent: "330 ml",
  status: "Public demo",
  lastVerified: null as string | null,
  carrier: "EAN-13",
  verification: "PUBLIC_DEMO_RECORD",
  completeness: 51,
  twoDReadiness: 40,
  ingredients:
    "Carbonated Water, Sugar, Colour (Caramel E150d), Acid (Phosphoric Acid), Natural Flavourings, Caffeine Flavouring.",
  nutritionPer100ml: {
    energy: "180 kJ / 42 kcal",
    fat: "0 g",
    saturates: "0 g",
    carbohydrate: "10.6 g",
    sugars: "10.6 g",
    protein: "0 g",
    salt: "0 g",
  },
};

export const DEMO_TRANSLATIONS: DemoTranslation[] = [
  {
    language: "English",
    code: "en",
    name: "Coca-Cola Original Taste",
    source: "PUBLIC_DEMO",
  },
];

export const DEMO_PACKAGING: DemoPackNode[] = [
  {
    level: "Each / consumer unit",
    gtin: "5449000000996",
    quantityFromChild: null,
    carrier: "EAN-13",
  },
  {
    level: "Inner pack",
    gtin: "Own GTIN required",
    quantityFromChild: 6,
    carrier: "ITF-14",
  },
  {
    level: "Case",
    gtin: "Own GTIN required",
    quantityFromChild: 4,
    carrier: "ITF-14",
  },
  {
    level: "Pallet / logistics",
    gtin: "SSCC assigned at shipping",
    quantityFromChild: 60,
    carrier: "GS1-128",
    note: "SSCC is not a GTIN",
  },
];

export const DEMO_TIMELINE = [
  {
    year: "Demo",
    title: "Public demonstration record",
    detail:
      "330 ml consumer unit shown with GTIN 5449000000996. Not verified by Coca-Cola through this platform.",
  },
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
