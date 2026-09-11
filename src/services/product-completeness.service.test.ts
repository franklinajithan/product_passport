import { describe, expect, it } from "vitest";
import { calculateCompleteness } from "./product-completeness.service";

describe("product completeness", () => {
  it("returns 100 when every requirement is present", () => {
    const result = calculateCompleteness({
      hasBarcode: true,
      hasName: true,
      hasEnglishName: true,
      hasBrand: true,
      hasManufacturer: true,
      hasWeight: true,
      hasIngredients: true,
      hasAllergens: true,
      hasNutrition: true,
      hasFrontImage: true,
      hasBackImage: true,
      hasCountry: true,
      hasCategory: true,
    });

    expect(result.score).toBe(100);
    expect(result.recommendation).toBeNull();
  });

  it("recommends the next missing field", () => {
    const result = calculateCompleteness({
      hasBarcode: true,
      hasName: true,
      hasEnglishName: false,
      hasBrand: true,
      hasManufacturer: true,
      hasWeight: true,
      hasIngredients: true,
      hasAllergens: true,
      hasNutrition: true,
      hasFrontImage: true,
      hasBackImage: true,
      hasCountry: true,
      hasCategory: true,
    });

    expect(result.score).toBeLessThan(100);
    expect(result.recommendation).toMatch(/English name/i);
  });
});
