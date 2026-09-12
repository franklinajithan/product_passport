import { describe, expect, it } from "vitest";
import { canOverwriteAuthority } from "./types";

describe("data authority hierarchy", () => {
  it("does not let community data overwrite brand-owner data", () => {
    expect(canOverwriteAuthority("VERIFIED_BRAND_OWNER", "COMMUNITY")).toBe(false);
    expect(canOverwriteAuthority("VERIFIED_BRAND_OWNER", "RETAILER")).toBe(false);
  });

  it("allows an authorised manufacturer to replace distributor data", () => {
    expect(canOverwriteAuthority("AUTHORISED_DISTRIBUTOR", "AUTHORISED_MANUFACTURER")).toBe(true);
  });
});
