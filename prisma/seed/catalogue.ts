import {
  MeasurementUnit,
  type PrismaClient,
  ProductStatus,
  VerificationLevel,
  type OwnershipStatus,
  type PackagingLevel,
} from "@prisma/client";
import { calculateGTINCheckDigit, toCanonicalGTIN14, detectGTINType } from "../../src/lib/standards/gs1/gtin";
import { buildGS1DigitalLink } from "../../src/lib/standards/gs1/digital-link";
import {
  calculateCompleteness,
  completenessFromProduct,
} from "../../src/services/product-completeness.service";

export function gtin13FromBody(body12: string): string {
  return `${body12}${calculateGTINCheckDigit(body12)}`;
}

export function gtin14FromBody(body13: string): string {
  return `${body13}${calculateGTINCheckDigit(body13)}`;
}

type TranslationInput = {
  languageCode: string;
  productName: string;
  ingredients?: string;
  isOriginalLanguage?: boolean;
  translationSource?: string;
};

type SeedItemInput = {
  gprId: string;
  sku?: string;
  gtin: string;
  organisationId: string;
  brandId: string;
  manufacturerId: string;
  categoryId: string;
  subcategoryId?: string;
  originCountryId: string;
  status: ProductStatus;
  verification: VerificationLevel;
  names: TranslationInput[];
  netWeight?: { value: number; unit: MeasurementUnit };
  ownership?: OwnershipStatus;
  digitalLink?: boolean;
  predecessorId?: string;
};

export async function seedTradeItem(prisma: PrismaClient, input: SeedItemInput) {
  const product = await prisma.product.upsert({
    where: { gprId: input.gprId },
    update: {
      status: input.status,
      verification: input.verification,
      predecessorId: input.predecessorId,
    },
    create: {
      gprId: input.gprId,
      sku: input.sku,
      organisationId: input.organisationId,
      brandId: input.brandId,
      manufacturerId: input.manufacturerId,
      categoryId: input.categoryId,
      subcategoryId: input.subcategoryId,
      originCountryId: input.originCountryId,
      status: input.status,
      verification: input.verification,
      lastVerifiedAt: input.verification === "MANUFACTURER_VERIFIED" ? new Date("2026-09-10") : null,
      predecessorId: input.predecessorId,
    },
  });

  const detected = detectGTINType(input.gtin);
  const barcodeType =
    detected === "GTIN_14" ? "GTIN_14" : detected === "GTIN_12" ? "UPC_A" : detected === "GTIN_8" ? "EAN_8" : "EAN_13";
  const identifierType =
    detected === "UNKNOWN" || detected === "ISBN_13" ? "GTIN_13" : detected;

  await prisma.productBarcode.upsert({
    where: { value: input.gtin },
    update: { productId: product.id, isPrimary: true },
    create: {
      productId: product.id,
      value: input.gtin,
      type: barcodeType,
      isPrimary: true,
      isOfficial: true,
    },
  });

  const canonical = toCanonicalGTIN14(input.gtin);
  await prisma.productIdentifier.upsert({
    where: { canonicalGtin14: canonical },
    update: {
      productId: product.id,
      organisationId: input.organisationId,
      status: input.status === "RECALLED" ? "ACTIVE" : input.status === "DISCONTINUED" ? "RETIRED" : "ACTIVE",
    },
    create: {
      productId: product.id,
      organisationId: input.organisationId,
      identifierType,
      identifierValue: input.gtin,
      displayValue: input.gtin,
      canonicalGtin14: canonical,
      issuingSystem: "GS1",
      status: input.status === "DISCONTINUED" ? "RETIRED" : "ACTIVE",
      checkDigitValid: true,
      ownershipStatus: input.ownership ?? "FORMAT_VALID",
      verified: input.ownership === "OWNER_VERIFIED",
      standardKey: "GS1_GENERAL_SPECIFICATIONS",
      standardVersion: "26.0",
    },
  });

  if (input.digitalLink) {
    const digital = buildGS1DigitalLink({
      domain: process.env.APP_URL ?? "http://localhost:3000",
      gtin: input.gtin,
    });
    const existingLink = await prisma.digitalLink.findFirst({ where: { productId: product.id } });
    if (!existingLink) {
      const identifier = await prisma.productIdentifier.findUnique({ where: { canonicalGtin14: canonical } });
      await prisma.digitalLink.create({
        data: {
          productId: product.id,
          identifierId: identifier?.id,
          domain: process.env.APP_URL ?? "http://localhost:3000",
          primaryIdentifier: "01",
          uri: digital.uri,
          status: "ACTIVE",
        },
      });
    }
  }

  for (const translation of input.names) {
    await prisma.productTranslation.upsert({
      where: {
        productId_languageCode: { productId: product.id, languageCode: translation.languageCode },
      },
      update: translation,
      create: { productId: product.id, ...translation },
    });
  }

  if (input.netWeight) {
    await prisma.productMeasurement.upsert({
      where: { productId: product.id },
      update: { netWeightValue: input.netWeight.value, netWeightUnit: input.netWeight.unit },
      create: {
        productId: product.id,
        netWeightValue: input.netWeight.value,
        netWeightUnit: input.netWeight.unit,
        netContentUnitCode: input.netWeight.unit === "G" ? "GRM" : input.netWeight.unit === "ML" ? "MLT" : "LTR",
        packQuantity: 1,
      },
    });
  }

  const scored = await prisma.product.findUniqueOrThrow({
    where: { id: product.id },
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
    where: { id: product.id },
    data: { completenessScore: completeness.score },
  });

  return product;
}

export async function seedPackagingLink(
  prisma: PrismaClient,
  parentId: string,
  childId: string,
  quantity: number,
  packagingLevel: PackagingLevel,
  parentGtin: string,
  childGtin: string,
) {
  const existing = await prisma.packagingHierarchy.findFirst({
    where: { parentProductId: parentId, childProductId: childId },
  });
  if (existing) {
    return existing;
  }
  return prisma.packagingHierarchy.create({
    data: {
      parentProductId: parentId,
      childProductId: childId,
      quantity,
      packagingLevel,
      parentGtin,
      childGtin,
    },
  });
}

export async function seedDemoCatalogue(
  prisma: PrismaClient,
  ctx: {
    exampleFoodsId: string;
    nordicId: string;
    harborId: string;
    exampleBrandId: string;
    warsawDairyBrandId: string;
    alpineBrandId: string;
    nordicBrandId: string;
    harborBrandId: string;
    exampleManufacturerId: string;
    nordicManufacturerId: string;
    foodId: string;
    dairyId: string;
    bakeryId: string;
    beveragesId: string;
    polandId: string;
    germanyId: string;
    ukId: string;
    butterId: string;
    milkAllergenId: string;
  },
) {
  const innerGtin = gtin13FromBody("590123456790");
  const caseGtin = gtin14FromBody("1590123456790");
  const successorGtin = gtin13FromBody("590123100001");
  const yogurtGtin = gtin13FromBody("590123100002");
  const milkGtin = gtin13FromBody("590123100003");
  const goudaGtin = gtin13FromBody("590123100004");
  const creamGtin = gtin13FromBody("590123100005");
  const oatGtin = gtin13FromBody("590123100006");
  const alpineGtin = gtin13FromBody("590123100007");
  const ryeGtin = gtin13FromBody("590123100008");
  const jamGtin = gtin13FromBody("590123100009");
  const oilGtin = gtin13FromBody("590123100010");
  const pastaGtin = gtin13FromBody("590123100011");
  const saltedGtin = gtin13FromBody("590123100012");

  const inner = await seedTradeItem(prisma, {
    gprId: "GPR-00000000002",
    sku: "BUTTER-200-INNER",
    gtin: innerGtin,
    organisationId: ctx.exampleFoodsId,
    brandId: ctx.exampleBrandId,
    manufacturerId: ctx.exampleManufacturerId,
    categoryId: ctx.foodId,
    subcategoryId: ctx.dairyId,
    originCountryId: ctx.polandId,
    status: ProductStatus.ACTIVE,
    verification: VerificationLevel.MANUFACTURER_VERIFIED,
    names: [
      { languageCode: "en", productName: "Extra Butter inner pack (6 × 200 g)", translationSource: "MANUFACTURER" },
      { languageCode: "pl", productName: "Masło Ekstra zgrzewka 6 × 200 g", isOriginalLanguage: true, translationSource: "MANUFACTURER" },
    ],
    netWeight: { value: 1200, unit: MeasurementUnit.G },
    ownership: "OWNER_VERIFIED",
  });

  const casePack = await seedTradeItem(prisma, {
    gprId: "GPR-00000000003",
    sku: "BUTTER-200-CASE",
    gtin: caseGtin,
    organisationId: ctx.exampleFoodsId,
    brandId: ctx.exampleBrandId,
    manufacturerId: ctx.exampleManufacturerId,
    categoryId: ctx.foodId,
    subcategoryId: ctx.dairyId,
    originCountryId: ctx.polandId,
    status: ProductStatus.ACTIVE,
    verification: VerificationLevel.MANUFACTURER_VERIFIED,
    names: [
      { languageCode: "en", productName: "Extra Butter case (24 × 200 g)", translationSource: "MANUFACTURER" },
    ],
    netWeight: { value: 4800, unit: MeasurementUnit.G },
    ownership: "OWNER_VERIFIED",
  });

  const successor = await seedTradeItem(prisma, {
    gprId: "GPR-00000000004",
    sku: "BUTTER-450",
    gtin: successorGtin,
    organisationId: ctx.exampleFoodsId,
    brandId: ctx.exampleBrandId,
    manufacturerId: ctx.exampleManufacturerId,
    categoryId: ctx.foodId,
    subcategoryId: ctx.dairyId,
    originCountryId: ctx.polandId,
    status: ProductStatus.ACTIVE,
    verification: VerificationLevel.MANUFACTURER_VERIFIED,
    names: [
      { languageCode: "pl", productName: "Masło Ekstra 450 g", isOriginalLanguage: true, translationSource: "MANUFACTURER" },
      { languageCode: "en", productName: "Extra Butter 450 g", translationSource: "MANUFACTURER" },
      { languageCode: "de", productName: "Extra Butter 450 g", translationSource: "MACHINE" },
    ],
    netWeight: { value: 450, unit: MeasurementUnit.G },
    ownership: "OWNER_VERIFIED",
    digitalLink: true,
    predecessorId: ctx.butterId,
  });

  const yogurt = await seedTradeItem(prisma, {
    gprId: "GPR-00000000005",
    sku: "YOGURT-400",
    gtin: yogurtGtin,
    organisationId: ctx.exampleFoodsId,
    brandId: ctx.warsawDairyBrandId,
    manufacturerId: ctx.exampleManufacturerId,
    categoryId: ctx.foodId,
    subcategoryId: ctx.dairyId,
    originCountryId: ctx.polandId,
    status: ProductStatus.RECALLED,
    verification: VerificationLevel.MANUFACTURER_VERIFIED,
    names: [
      { languageCode: "pl", productName: "Jogurt Naturalny", isOriginalLanguage: true, translationSource: "MANUFACTURER" },
      { languageCode: "en", productName: "Natural Yogurt", translationSource: "MANUFACTURER" },
    ],
    netWeight: { value: 400, unit: MeasurementUnit.G },
    ownership: "FORMAT_VALID",
  });

  await seedTradeItem(prisma, {
    gprId: "GPR-00000000006",
    sku: "MILK-1L",
    gtin: milkGtin,
    organisationId: ctx.exampleFoodsId,
    brandId: ctx.warsawDairyBrandId,
    manufacturerId: ctx.exampleManufacturerId,
    categoryId: ctx.foodId,
    subcategoryId: ctx.dairyId,
    originCountryId: ctx.polandId,
    status: ProductStatus.ACTIVE,
    verification: VerificationLevel.MANUFACTURER_VERIFIED,
    names: [
      { languageCode: "pl", productName: "Mleko 3,2%", isOriginalLanguage: true, translationSource: "MANUFACTURER" },
      { languageCode: "en", productName: "Whole milk 3.2%", translationSource: "MANUFACTURER" },
    ],
    netWeight: { value: 1000, unit: MeasurementUnit.ML },
    ownership: "OWNER_VERIFIED",
    digitalLink: true,
  });

  await seedTradeItem(prisma, {
    gprId: "GPR-00000000007",
    sku: "GOUDA-250",
    gtin: goudaGtin,
    organisationId: ctx.exampleFoodsId,
    brandId: ctx.warsawDairyBrandId,
    manufacturerId: ctx.exampleManufacturerId,
    categoryId: ctx.foodId,
    subcategoryId: ctx.dairyId,
    originCountryId: ctx.polandId,
    status: ProductStatus.ACTIVE,
    verification: VerificationLevel.DISTRIBUTOR_VERIFIED,
    names: [
      { languageCode: "en", productName: "Gouda 250 g", translationSource: "HUMAN_VERIFIED" },
    ],
    netWeight: { value: 250, unit: MeasurementUnit.G },
  });

  await seedTradeItem(prisma, {
    gprId: "GPR-00000000008",
    sku: "CREAM-200",
    gtin: creamGtin,
    organisationId: ctx.exampleFoodsId,
    brandId: ctx.exampleBrandId,
    manufacturerId: ctx.exampleManufacturerId,
    categoryId: ctx.foodId,
    subcategoryId: ctx.dairyId,
    originCountryId: ctx.polandId,
    status: ProductStatus.ACTIVE,
    verification: VerificationLevel.MANUFACTURER_VERIFIED,
    names: [
      { languageCode: "pl", productName: "Śmietana 18%", isOriginalLanguage: true, translationSource: "MANUFACTURER" },
      { languageCode: "en", productName: "Sour cream 18%", translationSource: "MANUFACTURER" },
    ],
    netWeight: { value: 200, unit: MeasurementUnit.G },
  });

  await seedTradeItem(prisma, {
    gprId: "GPR-00000000009",
    sku: "OAT-DRAFT",
    gtin: oatGtin,
    organisationId: ctx.exampleFoodsId,
    brandId: ctx.alpineBrandId,
    manufacturerId: ctx.exampleManufacturerId,
    categoryId: ctx.foodId,
    subcategoryId: ctx.beveragesId,
    originCountryId: ctx.polandId,
    status: ProductStatus.DRAFT,
    verification: VerificationLevel.COMMUNITY,
    names: [{ languageCode: "en", productName: "Oat drink (draft)", translationSource: "MANUFACTURER" }],
    ownership: "UNVERIFIED",
  });

  await seedTradeItem(prisma, {
    gprId: "GPR-00000000010",
    sku: "ALPINE-250",
    gtin: alpineGtin,
    organisationId: ctx.exampleFoodsId,
    brandId: ctx.alpineBrandId,
    manufacturerId: ctx.exampleManufacturerId,
    categoryId: ctx.foodId,
    subcategoryId: ctx.dairyId,
    originCountryId: ctx.polandId,
    status: ProductStatus.ACTIVE,
    verification: VerificationLevel.MANUFACTURER_VERIFIED,
    names: [
      { languageCode: "en", productName: "Alpine unsalted butter 250 g", translationSource: "MANUFACTURER" },
      { languageCode: "de", productName: "Alpine Butter ungesalzen 250 g", isOriginalLanguage: true, translationSource: "MANUFACTURER" },
    ],
    netWeight: { value: 250, unit: MeasurementUnit.G },
    ownership: "FORMAT_VALID",
  });

  await seedTradeItem(prisma, {
    gprId: "GPR-00000000011",
    sku: "RYE-200",
    gtin: ryeGtin,
    organisationId: ctx.nordicId,
    brandId: ctx.nordicBrandId,
    manufacturerId: ctx.nordicManufacturerId,
    categoryId: ctx.foodId,
    subcategoryId: ctx.bakeryId,
    originCountryId: ctx.germanyId,
    status: ProductStatus.DRAFT,
    verification: VerificationLevel.COMMUNITY,
    names: [
      { languageCode: "de", productName: "Roggenknäckebrot", isOriginalLanguage: true, translationSource: "MANUFACTURER" },
      { languageCode: "en", productName: "Rye crispbread", translationSource: "MACHINE" },
    ],
    netWeight: { value: 200, unit: MeasurementUnit.G },
    ownership: "UNVERIFIED",
  });

  await seedTradeItem(prisma, {
    gprId: "GPR-00000000012",
    sku: "JAM-300",
    gtin: jamGtin,
    organisationId: ctx.nordicId,
    brandId: ctx.nordicBrandId,
    manufacturerId: ctx.nordicManufacturerId,
    categoryId: ctx.foodId,
    originCountryId: ctx.germanyId,
    status: ProductStatus.ACTIVE,
    verification: VerificationLevel.COMMUNITY,
    names: [
      { languageCode: "en", productName: "Lingonberry jam", translationSource: "MANUFACTURER" },
    ],
    netWeight: { value: 300, unit: MeasurementUnit.G },
  });

  await seedTradeItem(prisma, {
    gprId: "GPR-00000000013",
    sku: "OIL-500",
    gtin: oilGtin,
    organisationId: ctx.harborId,
    brandId: ctx.harborBrandId,
    manufacturerId: ctx.exampleManufacturerId,
    categoryId: ctx.foodId,
    originCountryId: ctx.ukId,
    status: ProductStatus.ACTIVE,
    verification: VerificationLevel.DISTRIBUTOR_VERIFIED,
    names: [{ languageCode: "en", productName: "Harbor Kitchen olive oil 500 ml", translationSource: "MANUFACTURER" }],
    netWeight: { value: 500, unit: MeasurementUnit.ML },
    ownership: "FORMAT_VALID",
  });

  await seedTradeItem(prisma, {
    gprId: "GPR-00000000014",
    sku: "PASTA-500",
    gtin: pastaGtin,
    organisationId: ctx.harborId,
    brandId: ctx.harborBrandId,
    manufacturerId: ctx.exampleManufacturerId,
    categoryId: ctx.foodId,
    originCountryId: ctx.ukId,
    status: ProductStatus.ACTIVE,
    verification: VerificationLevel.COMMUNITY,
    names: [{ languageCode: "en", productName: "Harbor Kitchen spaghetti 500 g", translationSource: "MANUFACTURER" }],
    netWeight: { value: 500, unit: MeasurementUnit.G },
  });

  await seedTradeItem(prisma, {
    gprId: "GPR-00000000015",
    sku: "BUTTER-SALTED-RETIRED",
    gtin: saltedGtin,
    organisationId: ctx.exampleFoodsId,
    brandId: ctx.exampleBrandId,
    manufacturerId: ctx.exampleManufacturerId,
    categoryId: ctx.foodId,
    subcategoryId: ctx.dairyId,
    originCountryId: ctx.polandId,
    status: ProductStatus.DISCONTINUED,
    verification: VerificationLevel.MANUFACTURER_VERIFIED,
    names: [
      { languageCode: "en", productName: "Salted butter 200 g (retired GTIN)", translationSource: "MANUFACTURER" },
    ],
    netWeight: { value: 200, unit: MeasurementUnit.G },
    ownership: "RETIRED",
  });

  await seedPackagingLink(prisma, inner.id, ctx.butterId, 6, "INNER_PACK", innerGtin, "5901234567893");
  await seedPackagingLink(prisma, casePack.id, inner.id, 4, "CASE", caseGtin, innerGtin);

  const existingRecall = await prisma.productRecall.findFirst({ where: { productId: yogurt.id } });
  if (!existingRecall) {
    await prisma.productRecall.create({
      data: {
        productId: yogurt.id,
        reason: "Possible undeclared allergen in a single production lot.",
        recalledAt: new Date("2026-08-12"),
        batchNumbers: "YOG-2218, YOG-2219",
        consumerInstructions: "Do not consume. Return to the retailer for a refund.",
        countries: { create: [{ countryId: ctx.polandId }] },
      },
    });
  }

  const artworkRevision = await prisma.productRevision.findUnique({
    where: { productId_version: { productId: ctx.butterId, version: 2 } },
  });
  if (!artworkRevision) {
    await prisma.productRevision.create({
      data: {
        productId: ctx.butterId,
        version: 2,
        status: ProductStatus.ACTIVE,
        changeReason: "Packaging artwork updated. Identification unchanged.",
        gtinDecision: "SAME_GTIN",
        snapshot: { netContent: "200 g", gtin: "5901234567893" },
      },
    });
  }

  const quantityModel = await prisma.productRevision.findUnique({
    where: { productId_version: { productId: successor.id, version: 1 } },
  });
  if (!quantityModel) {
    await prisma.productRevision.create({
      data: {
        productId: successor.id,
        version: 1,
        status: ProductStatus.ACTIVE,
        changeReason: "Net quantity 200 g → 450 g required a new GTIN. Predecessor retained.",
        gtinDecision: "NEW_GTIN_REQUIRED",
        snapshot: { predecessorGtin: "5901234567893", gtin: successorGtin },
      },
    });
  }

  await prisma.productAllergen.upsert({
    where: { productId_allergenId: { productId: yogurt.id, allergenId: ctx.milkAllergenId } },
    update: {},
    create: { productId: yogurt.id, allergenId: ctx.milkAllergenId, presence: "CONTAINS" },
  });

  return { innerGtin, caseGtin, successorGtin, yogurtGtin };
}
