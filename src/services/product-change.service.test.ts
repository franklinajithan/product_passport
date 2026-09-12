import { describe, expect, it } from "vitest";
import { evaluatePublishGate } from "./product-change.service";

const previous = {
  gtin: "5901234123457",
  brand: "Example Brand",
  primaryBrand: "Example Brand",
  consumerFacingName: "Extra Butter",
  netContentValue: 500,
  netContentUnit: "GRM",
  packQuantity: 1,
  packagingLevel: "CONSUMER_UNIT",
};

describe("product change workflow", () => {
  it("publishes when identification is unchanged", () => {
    const gate = evaluatePublishGate(previous, { ...previous });
    expect(gate.allowDirectReplacement).toBe(true);
    expect(gate.requireSuccessor).toBe(false);
    expect(gate.result.decision).toBe("SAME_GTIN");
  });

  it("blocks in-place replacement when a new GTIN is required", () => {
    const gate = evaluatePublishGate(previous, { ...previous, netContentValue: 450 });
    expect(gate.allowDirectReplacement).toBe(false);
    expect(gate.requireSuccessor).toBe(true);
    expect(gate.result.decision).toBe("NEW_GTIN_REQUIRED");
  });

  it("warns when consumer-facing identity needs review", () => {
    const gate = evaluatePublishGate(previous, {
      ...previous,
      consumerFacingName: "Extra Butter Unsalted",
    });
    expect(gate.allowDirectReplacement).toBe(false);
    expect(gate.requireSuccessor).toBe(false);
    expect(gate.warning).toBe(true);
  });
});
