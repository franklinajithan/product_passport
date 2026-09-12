import { describe, expect, it } from "vitest";
import { renderBarcodeSymbol } from "./render";

describe("barcode rendering", () => {
  it("renders an EAN-13 SVG from a valid GTIN-13 without claiming official issuance", async () => {
    const result = await renderBarcodeSymbol({
      value: "5901234123457",
      symbology: "EAN_13",
      format: "svg",
    });
    expect(result.ok).toBe(true);
    expect(result.body).toContain("<svg");
    expect(result.message).toBe("Barcode symbol generated from GTIN 5901234123457.");
    expect(result.message).not.toMatch(/official barcode has been created/i);
  });

  it("refuses to render an EAN-13 from a GTIN-14", async () => {
    const result = await renderBarcodeSymbol({
      value: "00012345678905",
      symbology: "EAN_13",
      format: "svg",
    });
    expect(result.ok).toBe(false);
  });
});
