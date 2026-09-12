import { describe, expect, it } from "vitest";
import {
  DUPLICATE_GTIN_ACTIONS,
  GTIN_ALREADY_EXISTS,
  duplicateGtinError,
} from "./duplicates";

describe("duplicate GTIN prevention", () => {
  it("blocks a second assignment and offers ownership actions", () => {
    const result = duplicateGtinError({ id: "id-1", productId: "prod-1" });
    expect(result.ok).toBe(false);
    expect(result.error).toBe(GTIN_ALREADY_EXISTS);
    expect(result.productId).toBe("prod-1");
    expect(result.actions).toEqual([...DUPLICATE_GTIN_ACTIONS]);
  });
});
