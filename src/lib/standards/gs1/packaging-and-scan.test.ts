import { describe, expect, it } from "vitest";
import { validatePackagingHierarchy } from "../packaging-hierarchy";
import { canAssignOfficialGtin, checkDigitIsNotOwnership } from "../identifiers/ownership";
import { validateSymbologyPayload } from "./symbologies";
import { decodeScannedPayload } from "./scan";

describe("packaging hierarchy", () => {
  it("blocks reusing the consumer-unit GTIN on a case", () => {
    const result = validatePackagingHierarchy({
      parentProductId: "case-1",
      childProductId: "each-1",
      parentGtin: "05901234123457",
      childGtin: "05901234123457",
      parentLevel: "CASE",
      childLevel: "CONSUMER_UNIT",
      quantity: 12,
    });
    expect(result.ok).toBe(false);
    expect(result.errors.join(" ")).toMatch(/own GTIN/i);
  });

  it("accepts a case containing twelve consumer units with distinct GTINs", () => {
    const result = validatePackagingHierarchy({
      parentProductId: "case-1",
      childProductId: "each-1",
      parentGtin: "15901234123454",
      childGtin: "05901234123457",
      parentLevel: "CASE",
      childLevel: "CONSUMER_UNIT",
      quantity: 12,
    });
    expect(result.ok).toBe(true);
  });
});

describe("ownership restrictions", () => {
  it("does not treat a valid check digit as official allocation", () => {
    const result = checkDigitIsNotOwnership(true, "FORMAT_VALID");
    expect(result.checkDigitValid).toBe(true);
    expect(result.ownershipVerified).toBe(false);
  });

  it("prevents another organisation from assigning a GTIN", () => {
    expect(
      canAssignOfficialGtin({
        actorRole: "BRAND_OWNER",
        ownershipStatus: "OWNER_VERIFIED",
        sessionOrganisationId: "org-a",
        ownerOrganisationId: "org-b",
      }),
    ).toBe(false);
  });
});

describe("symbology selection", () => {
  it("does not assume every GTIN is EAN-13", () => {
    const ean13 = validateSymbologyPayload("EAN_13", "00012345678905");
    expect(ean13.ok).toBe(false);
    const itf14 = validateSymbologyPayload("ITF_14", "00012345678905");
    expect(itf14.ok).toBe(true);
  });

  it("warns when a symbol would be resized unreliably", () => {
    const result = validateSymbologyPayload("EAN_13", "5901234123457", { magnification: 0.5 });
    expect(result.ok).toBe(true);
    expect(result.warnings.join(" ")).toMatch(/unreliable/i);
  });
});

describe("scan engine", () => {
  it("extracts GTIN, lot and expiry from a GS1 payload instead of using the whole string", () => {
    const decoded = decodeScannedPayload("(01)05901234123457(17)270501(10)ABC123");
    expect(decoded.gtin).toBe("05901234123457");
    expect(decoded.lot).toBe("ABC123");
    expect(decoded.expiry).toBe("270501");
    expect(decoded.rawPayload).not.toBe(decoded.gtin);
  });
});
