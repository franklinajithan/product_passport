import {
  BarcodeType,
  MeasurementUnit,
  PackagingLevel,
  ProductStatus,
  VerificationLevel,
} from "@prisma/client";
import { prisma } from "@/database/client";
import { validateGTIN } from "@/lib/standards/gs1/gtin";
import { buildGS1DigitalLink } from "@/lib/standards/gs1/digital-link";
import { validatePackagingHierarchy } from "@/lib/standards/packaging-hierarchy";
import { registerGtinIdentifier, retireIdentifier } from "@/services/identifier.service";
import { writeAuditLog } from "@/services/audit.service";
import {
  calculateCompleteness,
  completenessFromProduct,
} from "@/services/product-completeness.service";
import { evaluatePublishGate } from "@/services/product-change.service";
import type { ProductIdentitySnapshot } from "@/lib/standards/gs1/gtin-management";
import { formatInternalId } from "@/utilities/gtin";
import { AppError, ConflictError, ForbiddenError, NotFoundError } from "@/utilities/errors";
import type {
  PackagingLinkInput,
  ProductCreateInput,
  ProductUpdateInput,
  TranslationUpsertInput,
} from "@/validation/product";

function barcodeTypeForGtin(detected: string): BarcodeType {
  switch (detected) {
    case "GTIN_8":
      return BarcodeType.EAN_8;
    case "GTIN_12":
      return BarcodeType.UPC_A;
    case "GTIN_14":
      return BarcodeType.GTIN_14;
    default:
      return BarcodeType.EAN_13;
  }
}

async function loadOwnedProduct(organisationId: string, productId: string) {
  const product = await prisma.product.findFirst({
    where: { id: productId, organisationId },
    include: {
      brand: true,
      translations: true,
      barcodes: true,
      identifiers: true,
      measurement: true,
      ingredients: true,
      allergens: true,
      nutrition: true,
      images: true,
    },
  });
  if (!product) {
    throw new NotFoundError("Product not found in your organisation.");
  }
  return product;
}

async function refreshCompleteness(productId: string) {
  const scored = await prisma.product.findUniqueOrThrow({
    where: { id: productId },
    include: {
      barcodes: true,
      identifiers: true,
      translations: true,
      brand: true,
      measurement: true,
      ingredients: true,
      allergens: true,
      nutrition: true,
      images: true,
    },
  });
  const completeness = calculateCompleteness(completenessFromProduct(scored));
  await prisma.product.update({
    where: { id: productId },
    data: { completenessScore: completeness.score },
  });
  return completeness.score;
}

async function attachGtin(options: {
  productId: string;
  organisationId: string;
  actorId: string;
  gtin: string;
}) {
  const registered = await registerGtinIdentifier({
    value: options.gtin,
    productId: options.productId,
    organisationId: options.organisationId,
    actorId: options.actorId,
  });
  if (!registered.ok) {
    throw new ConflictError(registered.error);
  }

  const parsed = validateGTIN(options.gtin);
  await prisma.productBarcode.upsert({
    where: { value: parsed.displayValue },
    update: { productId: options.productId, isPrimary: true },
    create: {
      productId: options.productId,
      value: parsed.displayValue,
      type: barcodeTypeForGtin(String(parsed.detectedType)),
      isPrimary: true,
      isOfficial: true,
    },
  });

  const existingLink = await prisma.digitalLink.findFirst({ where: { productId: options.productId } });
  if (!existingLink && parsed.valid) {
    const digital = buildGS1DigitalLink({
      domain: process.env.APP_URL ?? "http://localhost:3000",
      gtin: parsed.displayValue,
    });
    await prisma.digitalLink.create({
      data: {
        productId: options.productId,
        identifierId: registered.identifier.id,
        domain: process.env.APP_URL ?? "http://localhost:3000",
        primaryIdentifier: "01",
        uri: digital.uri,
        status: "ACTIVE",
      },
    });
  }
}

function snapshotOf(product: {
  brand: { name: string };
  translations: { languageCode: string; productName: string }[];
  barcodes: { value: string; isPrimary: boolean }[];
  measurement: { netWeightValue: unknown; netWeightUnit: MeasurementUnit | null } | null;
}): ProductIdentitySnapshot {
  const english = product.translations.find((row) => row.languageCode === "en");
  const primary = product.barcodes.find((row) => row.isPrimary) ?? product.barcodes[0];
  const value = product.measurement?.netWeightValue
    ? Number(product.measurement.netWeightValue.toString())
    : null;
  return {
    gtin: primary?.value ?? null,
    brand: product.brand.name,
    primaryBrand: product.brand.name,
    consumerFacingName: english?.productName ?? product.translations[0]?.productName ?? null,
    netContentValue: value,
    netContentUnit: product.measurement?.netWeightUnit ?? null,
    packQuantity: 1,
    packagingLevel: "CONSUMER_UNIT",
  };
}

export async function createOrganisationProduct(options: {
  organisationId: string;
  actorId: string;
  input: ProductCreateInput;
}) {
  const brand = await prisma.brand.findFirst({
    where: { id: options.input.brandId, organisationId: options.organisationId },
  });
  if (!brand) {
    throw new ForbiddenError("Brand is not part of this organisation.");
  }

  const manufacturer = await prisma.manufacturer.findFirst({
    where: {
      id: options.input.manufacturerId,
      OR: [
        { organisationId: options.organisationId },
        { products: { some: { organisationId: options.organisationId } } },
      ],
    },
  });
  if (!manufacturer) {
    throw new ForbiddenError("Manufacturer is not available to this organisation.");
  }

  if (options.input.variantOfProductId) {
    await loadOwnedProduct(options.organisationId, options.input.variantOfProductId);
    if (!options.input.variantLabel) {
      throw new AppError("A variant label is required.");
    }
  }

  const product = await prisma.product.create({
    data: {
      gprId: `TMP-${crypto.randomUUID()}`,
      sku: options.input.sku || null,
      organisationId: options.organisationId,
      brandId: brand.id,
      manufacturerId: manufacturer.id,
      categoryId: options.input.categoryId || null,
      originCountryId: options.input.originCountryId || null,
      status: ProductStatus.DRAFT,
      verification: VerificationLevel.COMMUNITY,
    },
  });

  await prisma.product.update({
    where: { id: product.id },
    data: { gprId: formatInternalId(product.publicNumber) },
  });

  await prisma.productTranslation.create({
    data: {
      productId: product.id,
      languageCode: options.input.originalLanguageCode,
      productName: options.input.originalName,
      ingredients: options.input.ingredients || null,
      isOriginalLanguage: true,
      translationSource: "MANUFACTURER",
    },
  });

  if (options.input.englishName && options.input.originalLanguageCode.toLowerCase() !== "en") {
    await prisma.productTranslation.create({
      data: {
        productId: product.id,
        languageCode: "en",
        productName: options.input.englishName,
        ingredients: options.input.ingredients || null,
        translationSource: "MANUFACTURER",
      },
    });
  }

  if (options.input.netContentValue && options.input.netContentUnit) {
    await prisma.productMeasurement.create({
      data: {
        productId: product.id,
        netWeightValue: options.input.netContentValue,
        netWeightUnit: options.input.netContentUnit,
      },
    });
  }

  if (options.input.gtin) {
    await attachGtin({
      productId: product.id,
      organisationId: options.organisationId,
      actorId: options.actorId,
      gtin: options.input.gtin,
    });
  }

  if (options.input.variantOfProductId && options.input.variantLabel) {
    await prisma.productVariant.create({
      data: {
        parentId: options.input.variantOfProductId,
        variantId: product.id,
        variantLabel: options.input.variantLabel,
      },
    });
  }

  await prisma.productRevision.create({
    data: {
      productId: product.id,
      version: 1,
      status: ProductStatus.DRAFT,
      changeReason: options.input.variantOfProductId
        ? `Variant created: ${options.input.variantLabel}`
        : "Product created as draft",
      gtinDecision: "SAME_GTIN",
      createdById: options.actorId,
    },
  });

  const score = await refreshCompleteness(product.id);
  await writeAuditLog({
    actorId: options.actorId,
    organisationId: options.organisationId,
    action: "PRODUCT_CREATED",
    entityType: "Product",
    entityId: product.id,
    metadata: { completeness: score, hasGtin: Boolean(options.input.gtin) },
  });

  return prisma.product.findUniqueOrThrow({ where: { id: product.id } });
}

export async function duplicateOrganisationProduct(options: {
  organisationId: string;
  actorId: string;
  productId: string;
}) {
  const source = await loadOwnedProduct(options.organisationId, options.productId);
  const original =
    source.translations.find((row) => row.isOriginalLanguage) ?? source.translations[0];
  if (!original) {
    throw new AppError("The source product has no name to copy.");
  }
  const englishName = source.translations.find((row) => row.languageCode === "en")?.productName;

  return createOrganisationProduct({
    organisationId: options.organisationId,
    actorId: options.actorId,
    input: {
      brandId: source.brandId,
      manufacturerId: source.manufacturerId,
      categoryId: source.categoryId ?? "",
      originCountryId: source.originCountryId ?? "",
      sku: source.sku ? `${source.sku}-COPY` : "",
      originalLanguageCode: original.languageCode,
      originalName: `${original.productName} (copy)`,
      englishName: englishName ? `${englishName} (copy)` : "",
      ingredients: original.ingredients ?? "",
      gtin: "",
      netContentValue: source.measurement?.netWeightValue
        ? Number(source.measurement.netWeightValue.toString())
        : "",
      netContentUnit: source.measurement?.netWeightUnit ?? undefined,
    },
  });
}

export async function createProductVariant(options: {
  organisationId: string;
  actorId: string;
  productId: string;
  variantLabel: string;
  gtin?: string;
}) {
  const source = await loadOwnedProduct(options.organisationId, options.productId);
  const original =
    source.translations.find((row) => row.isOriginalLanguage) ?? source.translations[0];
  if (!original) {
    throw new AppError("The source product has no name to copy.");
  }
  const englishName = source.translations.find((row) => row.languageCode === "en")?.productName;

  return createOrganisationProduct({
    organisationId: options.organisationId,
    actorId: options.actorId,
    input: {
      brandId: source.brandId,
      manufacturerId: source.manufacturerId,
      categoryId: source.categoryId ?? "",
      originCountryId: source.originCountryId ?? "",
      sku: source.sku ? `${source.sku}-${options.variantLabel}` : "",
      originalLanguageCode: original.languageCode,
      originalName: `${original.productName} — ${options.variantLabel}`,
      englishName: englishName ? `${englishName} — ${options.variantLabel}` : "",
      ingredients: original.ingredients ?? "",
      gtin: options.gtin ?? "",
      netContentValue: "",
      variantOfProductId: source.id,
      variantLabel: options.variantLabel,
    },
  });
}

export async function updateOrganisationProduct(options: {
  organisationId: string;
  actorId: string;
  input: ProductUpdateInput;
}) {
  const product = await loadOwnedProduct(options.organisationId, options.input.productId);
  const previous = snapshotOf(product);
  const nextSnapshot: ProductIdentitySnapshot = {
    ...previous,
    consumerFacingName: options.input.englishName || options.input.originalName,
    netContentValue: options.input.netContentValue
      ? Number(options.input.netContentValue)
      : previous.netContentValue,
    netContentUnit: options.input.netContentUnit ?? previous.netContentUnit,
  };
  const gate = evaluatePublishGate(previous, nextSnapshot);

  if (gate.requireSuccessor && !options.input.createSuccessor) {
    throw new AppError(
      `${gate.result.explanation} Create a successor or variant with a new GTIN instead of editing this record in place.`,
    );
  }

  const original =
    product.translations.find((row) => row.languageCode === options.input.originalLanguageCode) ??
    product.translations.find((row) => row.isOriginalLanguage);

  if (original) {
    await prisma.productTranslation.update({
      where: { id: original.id },
      data: {
        productName: options.input.originalName,
        ingredients: options.input.ingredients || original.ingredients,
        isOriginalLanguage: true,
      },
    });
  }

  if (options.input.englishName) {
    await prisma.productTranslation.upsert({
      where: {
        productId_languageCode: { productId: product.id, languageCode: "en" },
      },
      update: { productName: options.input.englishName },
      create: {
        productId: product.id,
        languageCode: "en",
        productName: options.input.englishName,
        translationSource: "MANUFACTURER",
      },
    });
  }

  await prisma.product.update({
    where: { id: product.id },
    data: { sku: options.input.sku || null },
  });

  if (options.input.netContentValue && options.input.netContentUnit) {
    await prisma.productMeasurement.upsert({
      where: { productId: product.id },
      update: {
        netWeightValue: options.input.netContentValue,
        netWeightUnit: options.input.netContentUnit,
      },
      create: {
        productId: product.id,
        netWeightValue: options.input.netContentValue,
        netWeightUnit: options.input.netContentUnit,
      },
    });
  }

  const latest = await prisma.productRevision.aggregate({
    where: { productId: product.id },
    _max: { version: true },
  });
  await prisma.productRevision.create({
    data: {
      productId: product.id,
      version: (latest._max.version ?? 0) + 1,
      status: product.status,
      changeReason: gate.result.explanation,
      gtinDecision: gate.result.decision,
      createdById: options.actorId,
    },
  });

  await refreshCompleteness(product.id);
  await writeAuditLog({
    actorId: options.actorId,
    organisationId: options.organisationId,
    action: "PRODUCT_UPDATED",
    entityType: "Product",
    entityId: product.id,
    metadata: { decision: gate.result.decision },
  });

  return { productId: product.id, decision: gate.result.decision };
}

export async function publishOrganisationProduct(options: {
  organisationId: string;
  actorId: string;
  productId: string;
  organisationStatus: string;
}) {
  const product = await loadOwnedProduct(options.organisationId, options.productId);
  if (options.organisationStatus !== "VERIFIED") {
    throw new ForbiddenError(
      "Organisation verification is required before manufacturer-verified publication.",
    );
  }
  await prisma.product.update({
    where: { id: product.id },
    data: {
      status: ProductStatus.ACTIVE,
      verification: VerificationLevel.MANUFACTURER_VERIFIED,
      lastVerifiedAt: new Date(),
    },
  });
  await writeAuditLog({
    actorId: options.actorId,
    organisationId: options.organisationId,
    action: "PRODUCT_PUBLISHED",
    entityType: "Product",
    entityId: product.id,
  });
}

export async function retireOrganisationProduct(options: {
  organisationId: string;
  actorId: string;
  productId: string;
  reason: string;
}) {
  const product = await loadOwnedProduct(options.organisationId, options.productId);
  await prisma.product.update({
    where: { id: product.id },
    data: { status: ProductStatus.DISCONTINUED },
  });

  const identifiers = await prisma.productIdentifier.findMany({
    where: {
      productId: product.id,
      organisationId: options.organisationId,
      status: { not: "RETIRED" },
    },
  });
  for (const identifier of identifiers) {
    await retireIdentifier({
      identifierId: identifier.id,
      actorId: options.actorId,
      reason: options.reason,
    });
  }

  await writeAuditLog({
    actorId: options.actorId,
    organisationId: options.organisationId,
    action: "PRODUCT_RETIRED",
    entityType: "Product",
    entityId: product.id,
    metadata: { reason: options.reason, identifiersRetained: identifiers.length },
  });
}

export async function addPackagingLink(options: {
  organisationId: string;
  actorId: string;
  input: PackagingLinkInput;
}) {
  const parent = await loadOwnedProduct(options.organisationId, options.input.parentProductId);
  const child = await loadOwnedProduct(options.organisationId, options.input.childProductId);
  const parentGtin = parent.barcodes[0]?.value ?? parent.identifiers[0]?.displayValue ?? null;
  const childGtin = child.barcodes[0]?.value ?? child.identifiers[0]?.displayValue ?? null;

  const validation = validatePackagingHierarchy({
    parentProductId: parent.id,
    childProductId: child.id,
    parentGtin,
    childGtin,
    parentLevel: options.input.parentLevel as PackagingLevel,
    childLevel: options.input.childLevel as PackagingLevel,
    quantity: options.input.quantity,
  });
  if (!validation.ok) {
    throw new AppError(validation.errors[0] ?? "Invalid packaging relationship.");
  }

  const link = await prisma.packagingHierarchy.create({
    data: {
      parentProductId: parent.id,
      childProductId: child.id,
      quantity: options.input.quantity,
      packagingLevel: options.input.parentLevel,
      parentGtin,
      childGtin,
    },
  });

  await writeAuditLog({
    actorId: options.actorId,
    organisationId: options.organisationId,
    action: "PACKAGING_LINKED",
    entityType: "PackagingHierarchy",
    entityId: link.id,
  });
  return link;
}

export async function upsertProductTranslation(options: {
  organisationId: string;
  actorId: string;
  input: TranslationUpsertInput;
}) {
  await loadOwnedProduct(options.organisationId, options.input.productId);
  const language = await prisma.language.findUnique({
    where: { code: options.input.languageCode },
  });
  if (!language) {
    throw new AppError("Unknown language code.");
  }

  const row = await prisma.productTranslation.upsert({
    where: {
      productId_languageCode: {
        productId: options.input.productId,
        languageCode: options.input.languageCode,
      },
    },
    update: {
      productName: options.input.productName,
      ingredients: options.input.ingredients || undefined,
      translationSource: options.input.translationSource,
      isOriginalLanguage: options.input.isOriginalLanguage ?? false,
    },
    create: {
      productId: options.input.productId,
      languageCode: options.input.languageCode,
      productName: options.input.productName,
      ingredients: options.input.ingredients || null,
      translationSource: options.input.translationSource,
      isOriginalLanguage: options.input.isOriginalLanguage ?? false,
    },
  });

  await refreshCompleteness(options.input.productId);
  await writeAuditLog({
    actorId: options.actorId,
    organisationId: options.organisationId,
    action: "TRANSLATION_UPDATED",
    entityType: "ProductTranslation",
    entityId: row.id,
    metadata: { language: options.input.languageCode, source: options.input.translationSource },
  });
  return row;
}

export async function retireOrganisationIdentifier(options: {
  organisationId: string;
  actorId: string;
  identifierId: string;
  reason: string;
}) {
  const identifier = await prisma.productIdentifier.findFirst({
    where: { id: options.identifierId, organisationId: options.organisationId },
  });
  if (!identifier) {
    throw new NotFoundError("Identifier not found in your organisation.");
  }
  if (identifier.status === "RETIRED") {
    throw new AppError("This identifier is already retired. History is retained.");
  }
  return retireIdentifier({
    identifierId: identifier.id,
    actorId: options.actorId,
    reason: options.reason,
  });
}
