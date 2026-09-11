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
  const dairy = await prisma.category.findUniqueOrThrow({ where: { slug: "dairy" } });
  const food = await prisma.category.findUniqueOrThrow({ where: { slug: "food-beverage" } });
  const milk = await prisma.allergen.findUniqueOrThrow({ where: { code: "MILK" } });

  const adminHash = await bcrypt.hash("ChangeMe_Admin_123!", 12);
  const manufacturerHash = await bcrypt.hash("Manufacturer_123!", 12);
  const pendingHash = await bcrypt.hash("PendingCo_123!", 12);

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

  const translations = [
    { languageCode: "pl", productName: "Masło Ekstra", ingredients: "Śmietanka pasteryzowana, kultury mleczarskie, sól." },
    { languageCode: "en", productName: "Extra Butter", ingredients: "Pasteurised cream, starter cultures, salt." },
    { languageCode: "fr", productName: "Beurre Extra", ingredients: "Crème pasteurisée, ferments lactiques, sel." },
    { languageCode: "ko", productName: "엑스트라 버터", ingredients: "살균 크림, 유산균, 소금." },
    { languageCode: "ja", productName: "エクストラバター", ingredients: "殺菌クリーム、乳酸菌、食塩。" },
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

  await prisma.auditLog.create({
    data: {
      actorId: admin.id,
      organisationId: exampleFoods.id,
      action: "seed.completed",
      entityType: "Organisation",
      entityId: exampleFoods.id,
      metadata: { products: 1 },
    },
  });

  console.log("Seed complete.");
  console.log("Admin: admin@globalproductregistry.com / ChangeMe_Admin_123!");
  console.log("Manufacturer: manufacturer@example.com / Manufacturer_123!");
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
