import type { Product, VerificationLevel } from "@prisma/client";

export type CompletenessInput = {
  hasBarcode: boolean;
  hasName: boolean;
  hasEnglishName: boolean;
  hasBrand: boolean;
  hasManufacturer: boolean;
  hasWeight: boolean;
  hasIngredients: boolean;
  hasAllergens: boolean;
  hasNutrition: boolean;
  hasFrontImage: boolean;
  hasBackImage: boolean;
  hasCountry: boolean;
  hasCategory: boolean;
};

export type CompletenessResult = {
  score: number;
  missing: Array<{ key: keyof CompletenessInput; label: string; weight: number }>;
  recommendation: string | null;
};

const WEIGHTS: Array<{ key: keyof CompletenessInput; label: string; weight: number }> = [
  { key: "hasBarcode", label: "barcode", weight: 10 },
  { key: "hasName", label: "product name", weight: 10 },
  { key: "hasEnglishName", label: "English name", weight: 8 },
  { key: "hasBrand", label: "brand", weight: 8 },
  { key: "hasManufacturer", label: "manufacturer", weight: 8 },
  { key: "hasWeight", label: "weight or volume", weight: 8 },
  { key: "hasIngredients", label: "ingredients", weight: 8 },
  { key: "hasAllergens", label: "allergen information", weight: 8 },
  { key: "hasNutrition", label: "nutrition information", weight: 8 },
  { key: "hasFrontImage", label: "front image", weight: 8 },
  { key: "hasBackImage", label: "back image", weight: 6 },
  { key: "hasCountry", label: "country of origin", weight: 5 },
  { key: "hasCategory", label: "category", weight: 5 },
];

export function calculateCompleteness(input: CompletenessInput): CompletenessResult {
  const totalWeight = WEIGHTS.reduce((sum, item) => sum + item.weight, 0);
  const earned = WEIGHTS.reduce(
    (sum, item) => sum + (input[item.key] ? item.weight : 0),
    0,
  );
  const missing = WEIGHTS.filter((item) => !input[item.key]);
  const score = Math.round((earned / totalWeight) * 100);
  const next = missing[0];
  const recommendation = next
    ? `Add ${next.label} to reach ${Math.round(((earned + next.weight) / totalWeight) * 100)}%.`
    : null;

  return { score, missing, recommendation };
}

export function completenessFromProduct(product: {
  barcodes: { id: string }[];
  identifiers?: { id: string }[];
  translations: { languageCode: string; productName: string | null; ingredients: string | null }[];
  brandId: string | null;
  manufacturerId: string | null;
  measurement: { netWeightValue: unknown; netVolumeValue: unknown } | null;
  ingredients: { id: string }[];
  allergens: { id: string }[];
  nutrition: { id: string } | null;
  images: { type: string }[];
  originCountryId: string | null;
  categoryId: string | null;
}): CompletenessInput {
  const english = product.translations.find((item) => item.languageCode === "en");
  const anyName = product.translations.some((item) => Boolean(item.productName));
  const hasIngredientText = product.translations.some((item) => Boolean(item.ingredients));

  return {
    hasBarcode: product.barcodes.length > 0 || Boolean(product.identifiers?.length),
    hasName: anyName,
    hasEnglishName: Boolean(english?.productName),
    hasBrand: Boolean(product.brandId),
    hasManufacturer: Boolean(product.manufacturerId),
    hasWeight: Boolean(
      product.measurement?.netWeightValue || product.measurement?.netVolumeValue,
    ),
    hasIngredients: product.ingredients.length > 0 || hasIngredientText,
    hasAllergens: product.allergens.length > 0,
    hasNutrition: Boolean(product.nutrition),
    hasFrontImage: product.images.some((image) => image.type === "FRONT"),
    hasBackImage: product.images.some((image) => image.type === "BACK"),
    hasCountry: Boolean(product.originCountryId),
    hasCategory: Boolean(product.categoryId),
  };
}

export function isEnglishMissing(
  translations: { languageCode: string }[],
): boolean {
  return !translations.some((item) => item.languageCode === "en");
}

export type ProductCounts = {
  total: number;
  active: number;
  draft: number;
  missingEnglish: number;
  missingImages: number;
  incomplete: number;
};

export function emptyCounts(): ProductCounts {
  return {
    total: 0,
    active: 0,
    draft: 0,
    missingEnglish: 0,
    missingImages: 0,
    incomplete: 0,
  };
}

export function countByStatus(
  products: Array<Pick<Product, "status" | "completenessScore"> & {
    translations: { languageCode: string }[];
    images: { id: string }[];
  }>,
): ProductCounts {
  return {
    total: products.length,
    active: products.filter((item) => item.status === "ACTIVE").length,
    draft: products.filter((item) => item.status === "DRAFT").length,
    missingEnglish: products.filter((item) => isEnglishMissing(item.translations)).length,
    missingImages: products.filter((item) => item.images.length === 0).length,
    incomplete: products.filter((item) => item.completenessScore < 100).length,
  };
}

export function verificationLabel(level: VerificationLevel): string {
  switch (level) {
    case "MANUFACTURER_VERIFIED":
      return "Manufacturer Verified";
    case "DISTRIBUTOR_VERIFIED":
      return "Distributor Verified";
    default:
      return "Community";
  }
}
