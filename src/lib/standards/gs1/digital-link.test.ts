import { describe, expect, it } from "vitest";
import {
  buildGS1DigitalLink,
  extractGtinFromPayload,
  parseGS1DigitalLink,
} from "./digital-link";

describe("GS1 Digital Link", () => {
  it("builds an uncompressed Digital Link URI with a 14-digit GTIN", () => {
    const result = buildGS1DigitalLink({
      domain: "https://id.example.com",
      gtin: "5901234123457",
      qualifiers: { lot: "ABC123", serial: "SN9" },
      attributes: { expiry: "270501" },
    });

    expect(result.uri).toBe(
      "https://id.example.com/01/05901234123457/10/ABC123/21/SN9?17=270501",
    );
    expect(result.gtin14).toBe("05901234123457");
    expect(result.primaryIdentifier).toBe("01");
  });

  it("refuses a query-string barcode shortcut", () => {
    expect(parseGS1DigitalLink("https://example.com/?barcode=5901234123457")).toBeNull();
    expect(extractGtinFromPayload("https://example.com/?barcode=5901234123457")).toBeNull();
  });

  it("extracts a GTIN from a Digital Link or a plain identifier", () => {
    expect(extractGtinFromPayload("5901234123457")).toBe("5901234123457");
    expect(
      extractGtinFromPayload("https://id.example.com/01/05901234123457"),
    ).toBe("05901234123457");
    expect(extractGtinFromPayload("(01)05901234123457(10)LOT")).toBe("05901234123457");
  });
});
