import { describe, expect, it } from "vitest";
import {
  generateGS1ElementString,
  parseGS1ElementString,
  validateApplicationIdentifiers,
} from "./application-identifiers";

describe("Application Identifiers", () => {
  it("parses a parenthesised element string into GTIN, lot and expiry", () => {
    const parsed = parseGS1ElementString("(01)05901234123457(17)270501(10)ABC123");
    expect(parsed.ok).toBe(true);
    expect(parsed.values.find((item) => item.ai === "01")?.value).toBe("05901234123457");
    expect(parsed.values.find((item) => item.ai === "10")?.value).toBe("ABC123");
    expect(parsed.values.find((item) => item.ai === "17")?.value).toBe("270501");
  });

  it("does not treat the entire payload as a product barcode", () => {
    const parsed = parseGS1ElementString("(01)05901234123457(21)SN9");
    expect(parsed.values).toHaveLength(2);
    expect(parsed.values[0].ai).toBe("01");
    expect(parsed.values[1].ai).toBe("21");
  });

  it("generates a human-readable element string from structured AIs", () => {
    const encoded = generateGS1ElementString([
      { ai: "01", value: "5901234123457" },
      { ai: "10", value: "LOT1" },
    ]);
    expect(encoded).toBe("(01)05901234123457(10)LOT1");
  });

  it("rejects an unknown AI", () => {
    const errors = validateApplicationIdentifiers([{ ai: "99", value: "X" }]);
    expect(errors[0]).toMatch(/Unknown Application Identifier/);
  });
});
