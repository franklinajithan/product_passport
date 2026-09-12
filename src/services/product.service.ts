import { prisma } from "@/database/client";
import type { PublicProductCard } from "@/types";
import { gtinLookupCandidates } from "@/lib/standards/gs1/gtin";
import { formatMeasurement } from "@/utilities/format";
import { looksLikeBarcode } from "@/utilities/gtin";

export const productDetailInclude = {
  brand: true,
  manufacturer: { include: { country: true } },
  organisation: true,
  originCountry: true,
  category: true,
  subcategory: true,
  measurement: true,
  nutrition: true,
  packaging: true,
  translations: { include: { language: true } },
  barcodes: true,
  images: { orderBy: { sortOrder: "asc" as const } },
  allergens: { include: { allergen: true } },
  ingredients: { include: { ingredient: { include: { translations: true } } }, orderBy: { sortOrder: "asc" as const } },
  certifications: { include: { certification: true } },
  countries: { include: { country: true } },
  recalls: { include: { countries: { include: { country: true } } }, orderBy: { recalledAt: "desc" as const } },
  identifiers: { include: { symbols: true, organisation: true } },
  parties: true,
  digitalLinks: true,
  hierarchyAsParent: { include: { child: { include: { translations: true, barcodes: true } } } },
  hierarchyAsChild: { include: { parent: { include: { translations: true, barcodes: true } } } },
  revisions: { orderBy: { version: "desc" as const } },
} as const;

const productCardInclude = {
  brand: true,
  manufacturer: true,
  originCountry: true,
  measurement: true,
  translations: true,
  barcodes: { where: { isPrimary: true }, take: 1 },
  identifiers: { take: 1, orderBy: { createdAt: "asc" } },
  images: { where: { isMain: true }, take: 1 },
} as const;

function toCard(product: {
  gprId: string;
  status: PublicProductCard["status"];
  verification: PublicProductCard["verification"];
  brand: { name: string };
  manufacturer: { name: string };
  originCountry: { name: string } | null;
  measurement: {
    netWeightValue: { toString(): string } | null;
    netWeightUnit: Parameters<typeof formatMeasurement>[1];
    netVolumeValue: { toString(): string } | null;
    netVolumeUnit: Parameters<typeof formatMeasurement>[1];
  } | null;
  translations: { languageCode: string; productName: string }[];
  barcodes: { value: string }[];
  identifiers?: { displayValue: string }[];
  images: { url: string }[];
}): PublicProductCard {
  const original = product.translations.find((item) => item.languageCode !== "en") ?? product.translations[0];
  const english = product.translations.find((item) => item.languageCode === "en");
  const netContent =
    formatMeasurement(
      product.measurement?.netWeightValue ?? null,
      product.measurement?.netWeightUnit ?? null,
    ) ??
    formatMeasurement(
      product.measurement?.netVolumeValue ?? null,
      product.measurement?.netVolumeUnit ?? null,
    );

  return {
    gtin: product.barcodes[0]?.value ?? product.identifiers?.[0]?.displayValue ?? null,
    gprId: product.gprId,
    name: original?.productName ?? english?.productName ?? "Unnamed product",
    englishName: english?.productName ?? null,
    brandName: product.brand.name,
    manufacturerName: product.manufacturer.name,
    originCountry: product.originCountry?.name ?? null,
    netContent,
    verification: product.verification,
    status: product.status,
    imageUrl: product.images[0]?.url ?? null,
  };
}

export async function findProductById(id: string) {
  return prisma.product.findUnique({
    where: { id },
    include: productDetailInclude,
  });
}

export async function findProductByGtin(gtin: string) {
  const candidates = gtinLookupCandidates(gtin);
  if (candidates.length === 0) {
    return null;
  }

  const identifier = await prisma.productIdentifier.findFirst({
    where: {
      OR: [
        { identifierValue: { in: candidates } },
        { canonicalGtin14: { in: candidates } },
        { displayValue: { in: candidates } },
      ],
    },
    select: { productId: true },
  });

  if (identifier?.productId) {
    return findProductById(identifier.productId);
  }

  const barcode = await prisma.productBarcode.findFirst({
    where: { value: { in: candidates } },
    select: { productId: true },
  });

  if (barcode) {
    return findProductById(barcode.productId);
  }

  return null;
}

export async function findProductByPublicId(identifier: string) {
  const byGpr = await prisma.product.findUnique({
    where: { gprId: identifier.toUpperCase() },
    include: productDetailInclude,
  });

  if (byGpr) {
    return byGpr;
  }

  return findProductByGtin(identifier);
}

export async function searchProducts(query: string): Promise<PublicProductCard[]> {
  const trimmed = query.trim();
  if (!trimmed) {
    return [];
  }

  if (looksLikeBarcode(trimmed)) {
    const product = await findProductByPublicId(trimmed);
    return product ? [toCard(product)] : [];
  }

  const products = await prisma.product.findMany({
    where: {
      status: { in: ["ACTIVE", "DISCONTINUED", "RECALLED"] },
      OR: [
        { translations: { some: { productName: { contains: trimmed, mode: "insensitive" } } } },
        { brand: { name: { contains: trimmed, mode: "insensitive" } } },
        { manufacturer: { name: { contains: trimmed, mode: "insensitive" } } },
        { gprId: { contains: trimmed.toUpperCase(), mode: "insensitive" } },
        { ingredients: { some: { rawText: { contains: trimmed, mode: "insensitive" } } } },
      ],
    },
    include: productCardInclude,
    take: 25,
    orderBy: { updatedAt: "desc" },
  });

  return products.map(toCard);
}

export async function getManufacturerDashboardData(organisationId: string) {
  const products = await prisma.product.findMany({
    where: { organisationId },
    include: {
      translations: true,
      images: true,
      barcodes: true,
      measurement: true,
      ingredients: true,
      allergens: true,
      nutrition: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);

  const apiRequests = await prisma.aPIUsage.count({
    where: {
      occurredAt: { gte: monthStart },
      apiKey: { organisationId },
    },
  });

  return { products, apiRequests };
}

export async function getAdminDashboardData() {
  const startOfDay = new Date();
  startOfDay.setHours(0, 0, 0, 0);

  const [
    totalProducts,
    verifiedProducts,
    manufacturers,
    countries,
    apiRequestsToday,
    newProductsToday,
    pendingCompanies,
    pendingProductClaims,
    pendingIdentifierClaims,
    users,
    openReports,
  ] = await Promise.all([
    prisma.product.count(),
    prisma.product.count({ where: { verification: "MANUFACTURER_VERIFIED" } }),
    prisma.organisation.count({ where: { type: { in: ["MANUFACTURER", "BRAND_OWNER"] } } }),
    prisma.country.count(),
    prisma.aPIUsage.count({ where: { occurredAt: { gte: startOfDay } } }),
    prisma.product.count({ where: { createdAt: { gte: startOfDay } } }),
    prisma.organisation.count({ where: { status: "PENDING_VERIFICATION" } }),
    prisma.productClaim.count({ where: { status: "PENDING" } }),
    prisma.identifierClaim.count({ where: { status: "PENDING" } }),
    prisma.user.count(),
    prisma.productReport.count({ where: { status: { in: ["OPEN", "IN_REVIEW"] } } }),
  ]);
  const pendingClaims = pendingProductClaims + pendingIdentifierClaims;

  const pendingOrganisations = await prisma.organisation.findMany({
    where: { status: "PENDING_VERIFICATION" },
    include: { country: true, members: { include: { user: true } } },
    orderBy: { createdAt: "desc" },
    take: 10,
  });

  return {
    stats: {
      totalProducts,
      verifiedProducts,
      manufacturers,
      countries,
      apiRequestsToday,
      newProductsToday,
      pendingCompanies,
      pendingClaims,
      users,
      openReports,
    },
    pendingOrganisations,
  };
}
