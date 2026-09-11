import { describe, expect, it } from "vitest";
import type { SessionUser } from "@/types/auth";
import {
  canAccessAdmin,
  canEditOrganisationProducts,
  canManageOrganisation,
} from "./permissions";

function user(role: SessionUser["role"], status: SessionUser["status"] = "ACTIVE"): SessionUser {
  return {
    id: "user-1",
    email: "user@example.com",
    name: "Test User",
    role,
    status,
  };
}

describe("role permissions", () => {
  it("allows only super admins into the admin area", () => {
    expect(canAccessAdmin(user("SUPER_ADMIN"))).toBe(true);
    expect(canAccessAdmin(user("MANUFACTURER"))).toBe(false);
    expect(canAccessAdmin(user("CONSUMER"))).toBe(false);
  });

  it("prevents a manufacturer from editing another organisation's products", () => {
    const manufacturer = user("MANUFACTURER");
    expect(
      canEditOrganisationProducts(manufacturer, "OWNER", "org-a", "org-a"),
    ).toBe(true);
    expect(
      canEditOrganisationProducts(manufacturer, "OWNER", "org-b", "org-a"),
    ).toBe(false);
  });

  it("allows super admins to edit any product", () => {
    expect(
      canEditOrganisationProducts(user("SUPER_ADMIN"), null, "org-b", "org-a"),
    ).toBe(true);
  });

  it("limits organisation management to owners and admins", () => {
    expect(canManageOrganisation(user("MANUFACTURER"), "OWNER")).toBe(true);
    expect(canManageOrganisation(user("MANUFACTURER"), "EDITOR")).toBe(false);
    expect(canManageOrganisation(user("SUPER_ADMIN"), "VIEWER")).toBe(true);
  });
});
