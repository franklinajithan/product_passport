import { describe, expect, it } from "vitest";
import { evaluateProductChange } from "./index";

const base = {
  gtin: "5901234123457",
  brand: "Example Brand",
  primaryBrand: "Example Brand",
  consumerFacingName: "Extra Butter",
  netContentValue: 200,
  netContentUnit: "GRM",
  packQuantity: 1,
  packagingLevel: "CONSUMER_UNIT",
  grossWeightValue: 210,
  formulationKey: "butter-82",
};

describe("GTIN management rules", () => {
  it("keeps the same GTIN when only marketing copy would change", () => {
    const result = evaluateProductChange(base, { ...base });
    expect(result.decision).toBe("SAME_GTIN");
    expect(result.rules).toHaveLength(0);
  });

  it("requires a new GTIN when declared net content changes", () => {
    const result = evaluateProductChange(base, { ...base, netContentValue: 450 });
    expect(result.decision).toBe("NEW_GTIN_REQUIRED");
    expect(result.severity).toBe("BLOCKING");
    expect(result.rules.some((rule) => rule.id === "net-content")).toBe(true);
  });

  it("requires a new GTIN for pack quantity or packaging level changes", () => {
    expect(
      evaluateProductChange(base, { ...base, packQuantity: 6 }).decision,
    ).toBe("NEW_GTIN_REQUIRED");
    expect(
      evaluateProductChange(base, { ...base, packagingLevel: "CASE" }).decision,
    ).toBe("NEW_GTIN_REQUIRED");
  });

  it("asks for review when consumer-facing identity changes without a hard identification change", () => {
    const result = evaluateProductChange(base, {
      ...base,
      consumerFacingName: "Extra Butter Unsalted",
    });
    expect(result.decision).toBe("REVIEW_REQUIRED");
    expect(result.severity).toBe("WARNING");
  });

  it("does not treat every edit as a new GTIN", () => {
    const result = evaluateProductChange(base, {
      ...base,
      grossWeightValue: 215,
    });
    expect(result.decision).toBe("SAME_GTIN");
  });
});
