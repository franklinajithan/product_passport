import {
  AllergenPresence,
  IngredientKind,
  MeasurementUnit,
  NutritionBasis,
  PackagingMaterial,
  PackagingType,
  PrismaClient,
  ProductStatus,
  VerificationLevel,
} from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  calculateCompleteness,
  completenessFromProduct,
} from "../src/services/product-completeness.service";
import { allergens, categories, certifications, countries, languages } from "./seed/data";
import { CURRENT_STANDARDS } from "../src/lib/standards/versions";
import { GS1_APPLICATION_IDENTIFIERS } from "../src/lib/standards/gs1/application-identifiers.dictionary";
import { UNITS_OF_MEASURE } from "../src/lib/standards/units";
import { DEFAULT_GTIN_MANAGEMENT_RULES } from "../src/lib/standards/gs1/gtin-management";
import { buildGS1DigitalLink } from "../src/lib/standards/gs1/digital-link";
import { toCanonicalGTIN14 } from "../src/lib/standards/gs1/gtin";
import { seedDemoCatalogue } from "./seed/catalogue";

const prisma = new PrismaClient();

async function main() {
  await prisma.rateLimitSetting.createMany({
    data: [
      { plan: "FREE", monthlyRequestLimit: 10_000, burstPerMinute: 60 },
      { plan: "PRO", monthlyRequestLimit: 100_000, burstPerMinute: 300 },
      { plan: "ENTERPRISE", monthlyRequestLimit: 1_000_000, burstPerMinute: 1000 },
    ],
    skipDuplicates: true,
  });

  await prisma.language.createMany({ data: [...languages], skipDuplicates: true });
  await prisma.country.createMany({ data: countries, skipDuplicates: true });
  await prisma.allergen.createMany({ data: [...allergens], skipDuplicates: true });
  await prisma.certification.createMany({ data: [...certifications], skipDuplicates: true });

  await prisma.unitOfMeasure.createMany({
    data: UNITS_OF_MEASURE.map((unit) => ({
      code: unit.code,
      displayUnit: unit.displayUnit,
      title: unit.title,
      quantityType: unit.quantityType,
    })),
    skipDuplicates: true,
  });

  await prisma.gs1ApplicationIdentifier.createMany({
    data: GS1_APPLICATION_IDENTIFIERS.map((item) => ({
      ai: item.ai,
      title: item.title,
      description: item.description,
      dataType: item.dataType,
      minLength: item.minLength,
      maxLength: item.maxLength,
      fixedLength: item.fixedLength,
      decimalIndicator: item.decimalIndicator,
    })),
    skipDuplicates: true,
  });

  for (const standard of CURRENT_STANDARDS) {
    const record = await prisma.standard.upsert({
      where: { key: standard.key },
      update: { name: standard.name, source: standard.source },
      create: { key: standard.key, name: standard.name, source: standard.source },
    });
    const version = await prisma.standardVersion.upsert({
      where: { standardId_version: { standardId: record.id, version: standard.version } },
      update: { status: standard.status, effectiveDate: new Date(standard.effectiveDate) },
      create: {
        standardId: record.id,
        version: standard.version,
        publishedDate: new Date(standard.publishedDate),
        effectiveDate: new Date(standard.effectiveDate),
        status: standard.status,
      },
    });
    if (standard.key === "GS1_GTIN_MANAGEMENT") {
      for (const rule of DEFAULT_GTIN_MANAGEMENT_RULES) {
        await prisma.standardRule.upsert({
          where: { standardVersionId_key: { standardVersionId: version.id, key: rule.id } },
          update: { title: rule.explanation, payload: JSON.parse(JSON.stringify(rule)) },
          create: {
            standardVersionId: version.id,
            key: rule.id,
            title: rule.explanation,
            payload: JSON.parse(JSON.stringify(rule)),
          },
        });
      }
    }
  }

  for (const [index, category] of categories.entries()) {
    const parent = await prisma.category.upsert({
      where: { slug: category.slug },
      update: { name: category.name, description: category.description, sortOrder: index },
      create: {
        slug: category.slug,
        name: category.name,
        description: category.description,
        sortOrder: index,
      },
    });

    for (const [childIndex, child] of category.children.entries()) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: { name: child.name, parentId: parent.id, sortOrder: childIndex },
        create: {
          slug: child.slug,
          name: child.name,
          parentId: parent.id,
          sortOrder: childIndex,
        },
      });
    }
  }

  const poland = await prisma.country.findUniqueOrThrow({ where: { iso2: "PL" } });
  const germany = await prisma.country.findUniqueOrThrow({ where: { iso2: "DE" } });
  const unitedKingdom = await prisma.country.findUniqueOrThrow({ where: { iso2: "GB" } });
  const dairy = await prisma.category.findUniqueOrThrow({ where: { slug: "dairy" } });
  const food = await prisma.category.findUniqueOrThrow({ where: { slug: "food-beverage" } });
  const bakery = await prisma.category.findUniqueOrThrow({ where: { slug: "bakery" } });
  const beverages = await prisma.category.findUniqueOrThrow({ where: { slug: "beverages" } });
  const milk = await prisma.allergen.findUniqueOrThrow({ where: { code: "MILK" } });

  const adminHash = await bcrypt.hash("ChangeMe_Admin_123!", 12);
  const manufacturerHash = await bcrypt.hash("Manufacturer_123!", 12);
  const pendingHash = await bcrypt.hash("PendingCo_123!", 12);
  const retailerHash = await bcrypt.hash("HarborRetail_123!", 12);

  const admin = await prisma.user.upsert({
    where: { email: "admin@globalproductregistry.com" },
    update: {},
    create: {
      email: "admin@globalproductregistry.com",
      name: "Platform Admin",
      passwordHash: adminHash,
      role: "SUPER_ADMIN",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const manufacturerUser = await prisma.user.upsert({
    where: { email: "manufacturer@example.com" },
    update: {},
    create: {
      email: "manufacturer@example.com",
      name: "Anna Kowalska",
      passwordHash: manufacturerHash,
      role: "MANUFACTURER",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const pendingUser = await prisma.user.upsert({
    where: { email: "pending@example.com" },
    update: {},
    create: {
      email: "pending@example.com",
      name: "Pending Owner",
      passwordHash: pendingHash,
      role: "MANUFACTURER",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const exampleFoods = await prisma.organisation.upsert({
    where: { id: "11111111-1111-1111-1111-111111111111" },
    update: {},
    create: {
      id: "11111111-1111-1111-1111-111111111111",
      type: "MANUFACTURER",
      name: "Example Foods",
      legalName: "Example Foods Sp. z o.o.",
      registrationNumber: "KRS 0001234567",
      vatNumber: "PL5252345678",
      countryId: poland.id,
      addressLine1: "ul. Przykładowa 12",
      city: "Warsaw",
      postalCode: "00-001",
      website: "https://example-foods.example",
      businessEmail: "quality@example-foods.example",
      contactPerson: "Anna Kowalska",
      phone: "+48 22 000 00 00",
      gs1CompanyPrefix: "590123",
      status: "VERIFIED",
      verifiedAt: new Date("2026-03-01"),
    },
  });

  await prisma.organisationMember.upsert({
    where: {
      organisationId_userId: {
        organisationId: exampleFoods.id,
        userId: manufacturerUser.id,
      },
    },
    update: {},
    create: {
      organisationId: exampleFoods.id,
      userId: manufacturerUser.id,
      role: "OWNER",
    },
  });

  const pendingOrg = await prisma.organisation.upsert({
    where: { id: "22222222-2222-2222-2222-222222222222" },
    update: {},
    create: {
      id: "22222222-2222-2222-2222-222222222222",
      type: "MANUFACTURER",
      name: "Nordic Pantry",
      legalName: "Nordic Pantry GmbH",
      countryId: germany.id,
      addressLine1: "Musterstrasse 8",
      city: "Berlin",
      postalCode: "10115",
      businessEmail: "hello@nordic-pantry.example",
      contactPerson: "Pending Owner",
      phone: "+49 30 000000",
      status: "PENDING_VERIFICATION",
    },
  });

  await prisma.organisationMember.upsert({
    where: {
      organisationId_userId: {
        organisationId: pendingOrg.id,
        userId: pendingUser.id,
      },
    },
    update: {},
    create: {
      organisationId: pendingOrg.id,
      userId: pendingUser.id,
      role: "OWNER",
    },
  });

  const retailerUser = await prisma.user.upsert({
    where: { email: "retailer@example.com" },
    update: {},
    create: {
      email: "retailer@example.com",
      name: "Jordan Hale",
      passwordHash: retailerHash,
      role: "RETAILER",
      status: "ACTIVE",
      emailVerified: new Date(),
    },
  });

  const harbor = await prisma.organisation.upsert({
    where: { id: "44444444-4444-4444-4444-444444444444" },
    update: {},
    create: {
      id: "44444444-4444-4444-4444-444444444444",
      type: "RETAILER",
      name: "Harbor Retail Group",
      legalName: "Harbor Retail Group Ltd",
      countryId: unitedKingdom.id,
      addressLine1: "14 Quayside",
      city: "London",
      postalCode: "E1 1AA",
      businessEmail: "data@harbor-retail.example",
      contactPerson: "Jordan Hale",
      phone: "+44 20 0000 0000",
      status: "VERIFIED",
      verifiedAt: new Date("2026-04-01"),
    },
  });

  await prisma.organisationMember.upsert({
    where: {
      organisationId_userId: {
        organisationId: harbor.id,
        userId: retailerUser.id,
      },
    },
    update: {},
    create: {
      organisationId: harbor.id,
      userId: retailerUser.id,
      role: "OWNER",
    },
  });

  const brand = await prisma.brand.upsert({
    where: {
      organisationId_slug: { organisationId: exampleFoods.id, slug: "example-brand" },
    },
    update: {},
    create: {
      organisationId: exampleFoods.id,
      name: "Example Brand",
      slug: "example-brand",
    },
  });

  const warsawDairyBrand = await prisma.brand.upsert({
    where: { organisationId_slug: { organisationId: exampleFoods.id, slug: "warsaw-dairy" } },
    update: {},
    create: { organisationId: exampleFoods.id, name: "Warsaw Dairy", slug: "warsaw-dairy" },
  });

  const alpineBrand = await prisma.brand.upsert({
    where: { organisationId_slug: { organisationId: exampleFoods.id, slug: "alpine-creamery" } },
    update: {},
    create: { organisationId: exampleFoods.id, name: "Alpine Creamery", slug: "alpine-creamery" },
  });

  const nordicBrand = await prisma.brand.upsert({
    where: { organisationId_slug: { organisationId: pendingOrg.id, slug: "nordic-pantry" } },
    update: {},
    create: { organisationId: pendingOrg.id, name: "Nordic Pantry", slug: "nordic-pantry" },
  });

  const harborBrand = await prisma.brand.upsert({
    where: { organisationId_slug: { organisationId: harbor.id, slug: "harbor-kitchen" } },
    update: {},
    create: { organisationId: harbor.id, name: "Harbor Kitchen", slug: "harbor-kitchen" },
  });

  const manufacturer = await prisma.manufacturer.upsert({
    where: { id: "33333333-3333-3333-3333-333333333333" },
    update: {},
    create: {
      id: "33333333-3333-3333-3333-333333333333",
      organisationId: exampleFoods.id,
      name: "Example Foods",
      addressLine1: "ul. Przykładowa 12",
      city: "Warsaw",
      postalCode: "00-001",
      countryId: poland.id,
      website: "https://example-foods.example",
      contactEmail: "quality@example-foods.example",
      contactPhone: "+48 22 000 00 00",
      factoryName: "Warsaw Dairy Plant",
    },
  });

  const nordicManufacturer = await prisma.manufacturer.upsert({
    where: { id: "55555555-5555-5555-5555-555555555555" },
    update: {},
    create: {
      id: "55555555-5555-5555-5555-555555555555",
      organisationId: pendingOrg.id,
      name: "Nordic Pantry GmbH",
      city: "Berlin",
      postalCode: "10115",
      countryId: germany.id,
      factoryName: "Berlin bakery",
    },
  });

  const butter = await prisma.product.upsert({
    where: { gprId: "GPR-00000000001" },
    update: {},
    create: {
      gprId: "GPR-00000000001",
      sku: "BUTTER-200",
      organisationId: exampleFoods.id,
      brandId: brand.id,
      manufacturerId: manufacturer.id,
      categoryId: food.id,
      subcategoryId: dairy.id,
      productType: "Butter",
      originCountryId: poland.id,
      status: ProductStatus.ACTIVE,
      verification: VerificationLevel.MANUFACTURER_VERIFIED,
      lastVerifiedAt: new Date("2026-09-10"),
    },
  });

  await prisma.productBarcode.upsert({
    where: { value: "5901234567893" },
    update: {},
    create: {
      productId: butter.id,
      value: "5901234567893",
      type: "EAN_13",
      isPrimary: true,
      isOfficial: true,
    },
  });

  const prefix = await prisma.gs1CompanyPrefix.upsert({
    where: { prefix: "590123" },
    update: {},
    create: {
      organisationId: exampleFoods.id,
      prefix: "590123",
      countryId: poland.id,
      issuingMemberOrganisation: "GS1 Poland",
      status: "OWNER_VERIFIED",
      verifiedAt: new Date("2026-03-01"),
      source: "organisation-supplied",
      allocationCapacity: 100000,
    },
  });

  const canonical = toCanonicalGTIN14("5901234567893");
  const identifier = await prisma.productIdentifier.upsert({
    where: { canonicalGtin14: canonical },
    update: {
      productId: butter.id,
      organisationId: exampleFoods.id,
      gs1CompanyPrefixId: prefix.id,
    },
    create: {
      productId: butter.id,
      organisationId: exampleFoods.id,
      identifierType: "GTIN_13",
      identifierValue: "5901234567893",
      displayValue: "5901234567893",
      canonicalGtin14: canonical,
      issuingSystem: "GS1",
      status: "ACTIVE",
      checkDigitValid: true,
      ownershipStatus: "FORMAT_VALID",
      verified: false,
      gs1CompanyPrefixId: prefix.id,
      standardKey: "GS1_GENERAL_SPECIFICATIONS",
      standardVersion: "26.0",
    },
  });

  const digital = buildGS1DigitalLink({
    domain: process.env.APP_URL ?? "http://localhost:3000",
    gtin: "5901234567893",
  });
  const existingLink = await prisma.digitalLink.findFirst({ where: { productId: butter.id } });
  if (!existingLink) {
    await prisma.digitalLink.create({
      data: {
        productId: butter.id,
        identifierId: identifier.id,
        domain: process.env.APP_URL ?? "http://localhost:3000",
        primaryIdentifier: "01",
        uri: digital.uri,
        status: "ACTIVE",
      },
    });
  }

  const parties = [
    { role: "BRAND_OWNER" as const, name: "Example Foods Sp. z o.o.", countryCode: "PL" },
    { role: "MANUFACTURER" as const, name: "Example Foods — Warsaw Dairy Plant", countryCode: "PL" },
    { role: "IMPORTER" as const, name: "Example Distribution UK Ltd", countryCode: "GB" },
  ];
  for (const party of parties) {
    const found = await prisma.productParty.findFirst({
      where: { productId: butter.id, role: party.role },
    });
    if (!found) {
      await prisma.productParty.create({
        data: {
          productId: butter.id,
          organisationId: party.role === "IMPORTER" ? null : exampleFoods.id,
          ...party,
        },
      });
    }
  }

  const existingRevision = await prisma.productRevision.findUnique({
    where: { productId_version: { productId: butter.id, version: 1 } },
  });
  if (!existingRevision) {
    await prisma.productRevision.create({
      data: {
        productId: butter.id,
        version: 1,
        status: ProductStatus.ACTIVE,
        changeReason: "Initial publication",
        gtinDecision: "SAME_GTIN",
        createdById: manufacturerUser.id,
        snapshot: { netContent: "200 g", gtin: "5901234567893" },
      },
    });
  }

  await prisma.fieldProvenance.upsert({
    where: { id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa" },
    update: {},
    create: {
      id: "aaaaaaaa-aaaa-aaaa-aaaa-aaaaaaaaaaaa",
      productId: butter.id,
      entityType: "ProductTranslation",
      entityId: butter.id,
      fieldName: "productName",
      value: "Masło Ekstra",
      sourceType: "MANUFACTURER",
      sourceOrganisation: "Example Foods Sp. z o.o.",
      authority: "AUTHORISED_MANUFACTURER",
      verified: true,
      verifiedBy: manufacturerUser.id,
      confidence: 90,
    },
  });

  const translations = [
    { languageCode: "pl", productName: "Masło Ekstra", ingredients: "Śmietanka pasteryzowana, kultury mleczarskie, sól.", isOriginalLanguage: true, translationSource: "MANUFACTURER" },
    { languageCode: "en", productName: "Extra Butter", ingredients: "Pasteurised cream, starter cultures, salt.", isOriginalLanguage: false, translationSource: "MANUFACTURER" },
    { languageCode: "fr", productName: "Beurre Extra", ingredients: "Crème pasteurisée, ferments lactiques, sel.", isOriginalLanguage: false, translationSource: "MANUFACTURER" },
    { languageCode: "ko", productName: "엑스트라 버터", ingredients: "살균 크림, 유산균, 소금.", isOriginalLanguage: false, translationSource: "MANUFACTURER" },
    { languageCode: "ja", productName: "エクストラバター", ingredients: "殺菌クリーム、乳酸菌、食塩。", isOriginalLanguage: false, translationSource: "MANUFACTURER" },
    { languageCode: "de", productName: "Extra Butter", ingredients: "Pasteurisierte Sahne, Milchsäurekulturen, Salz.", isOriginalLanguage: false, translationSource: "MACHINE" },
  ];

  for (const translation of translations) {
    await prisma.productTranslation.upsert({
      where: {
        productId_languageCode: {
          productId: butter.id,
          languageCode: translation.languageCode,
        },
      },
      update: translation,
      create: { productId: butter.id, ...translation },
    });
  }

  await prisma.productMeasurement.upsert({
    where: { productId: butter.id },
    update: {},
    create: {
      productId: butter.id,
      netWeightValue: 200,
      netWeightUnit: MeasurementUnit.G,
      netContentUnitCode: "GRM",
      packQuantity: 1,
      pieceCount: 1,
    },
  });

  await prisma.nutrition.upsert({
    where: { productId: butter.id },
    update: {},
    create: {
      productId: butter.id,
      basis: NutritionBasis.PER_100G,
      energyKcal: 741,
      energyKj: 3049,
      fat: 82,
      saturatedFat: 52,
      carbohydrate: 0.7,
      sugars: 0.7,
      fibre: 0,
      protein: 0.7,
      salt: 1.1,
      sodium: 0.44,
    },
  });

  await prisma.packaging.upsert({
    where: { productId: butter.id },
    update: {},
    create: {
      productId: butter.id,
      type: PackagingType.CARTON,
      material: PackagingMaterial.PAPER,
      isRecyclable: true,
    },
  });

  await prisma.productAllergen.upsert({
    where: {
      productId_allergenId: { productId: butter.id, allergenId: milk.id },
    },
    update: {},
    create: {
      productId: butter.id,
      allergenId: milk.id,
      presence: AllergenPresence.CONTAINS,
    },
  });

  await prisma.productIngredient.deleteMany({ where: { productId: butter.id } });
  await prisma.productIngredient.createMany({
    data: [
      { productId: butter.id, kind: IngredientKind.INGREDIENT, percentage: 99, sortOrder: 1, rawText: "Pasteurised cream" },
      { productId: butter.id, kind: IngredientKind.INGREDIENT, percentage: 1, sortOrder: 2, rawText: "Salt" },
    ],
  });

  await prisma.productCountry.upsert({
    where: {
      productId_countryId: { productId: butter.id, countryId: poland.id },
    },
    update: {},
    create: { productId: butter.id, countryId: poland.id },
  });

  const productForScore = await prisma.product.findUniqueOrThrow({
    where: { id: butter.id },
    include: {
      barcodes: true,
      translations: true,
      brand: true,
      measurement: true,
      ingredients: true,
      allergens: true,
      nutrition: true,
      images: true,
    },
  });

  const completeness = calculateCompleteness(completenessFromProduct(productForScore));
  await prisma.product.update({
    where: { id: butter.id },
    data: { completenessScore: completeness.score },
  });

  await seedDemoCatalogue(prisma, {
    exampleFoodsId: exampleFoods.id,
    nordicId: pendingOrg.id,
    harborId: harbor.id,
    exampleBrandId: brand.id,
    warsawDairyBrandId: warsawDairyBrand.id,
    alpineBrandId: alpineBrand.id,
    nordicBrandId: nordicBrand.id,
    harborBrandId: harborBrand.id,
    exampleManufacturerId: manufacturer.id,
    nordicManufacturerId: nordicManufacturer.id,
    foodId: food.id,
    dairyId: dairy.id,
    bakeryId: bakery.id,
    beveragesId: beverages.id,
    polandId: poland.id,
    germanyId: germany.id,
    ukId: unitedKingdom.id,
    butterId: butter.id,
    milkAllergenId: milk.id,
  });

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      organisationId: exampleFoods.id,
      action: "seed.completed",
      entityType: "Organisation",
      entityId: exampleFoods.id,
      metadata: { products: 15, developmentData: true },
    },
  });

  console.log("Seed complete. Development demo data only — not live production statistics.");
  console.log("Admin: admin@globalproductregistry.com / ChangeMe_Admin_123!");
  console.log("Manufacturer: manufacturer@example.com / Manufacturer_123!");
  console.log("Retailer: retailer@example.com / HarborRetail_123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
