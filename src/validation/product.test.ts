import { describe, expect, it } from "vitest";
import { packagingLinkSchema, productCreateSchema, productRetireSchema } from "./product";

const brandId = "11111111-1111-4111-8111-111111111111";
const manufacturerId = "22222222-2222-4222-8222-222222222222";
const parentId = "33333333-3333-4333-8333-333333333333";
const childId = "44444444-4444-4444-8444-444444444444";

describe("product validation", () => {
  it("accepts a draft without a GTIN", () => {
    const parsed = productCreateSchema.safeParse({
      brandId,
      manufacturerId,
      originalLanguageCode: "pl",
      originalName: "Masło Ekstra",
      gtin: "",
    });
    expect(parsed.success).toBe(true);
  });

  it("rejects an invalid GTIN instead of inventing one", () => {
    const parsed = productCreateSchema.safeParse({
      brandId,
      manufacturerId,
      originalLanguageCode: "en",
      originalName: "Extra Butter",
      gtin: "5901234567890",
    });
    expect(parsed.success).toBe(false);
  });

  it("accepts the seeded Extra Butter GTIN", () => {
    const parsed = productCreateSchema.safeParse({
      brandId,
      manufacturerId,
      originalLanguageCode: "en",
      originalName: "Extra Butter",
      gtin: "5901234567893",
    });
    expect(parsed.success).toBe(true);
  });

  it("requires a retirement reason", () => {
    expect(
      productRetireSchema.safeParse({
        productId: brandId,
        reason: "",
      }).success,
    ).toBe(false);
  });

  it("rejects packaging that reuses the same product as parent and child at the schema layer only by ids differing", () => {
    const parsed = packagingLinkSchema.safeParse({
      parentProductId: parentId,
      childProductId: childId,
      quantity: 6,
      parentLevel: "INNER_PACK",
      childLevel: "CONSUMER_UNIT",
    });
    expect(parsed.success).toBe(true);
  });
});
