import type { UserRole } from "@prisma/client";
import type { SessionUser } from "@/types/auth";
import { ForbiddenError, UnauthorizedError } from "@/utilities/errors";

const COMPANY_DASHBOARD_ROLES: UserRole[] = [
  "MANUFACTURER",
  "DISTRIBUTOR",
  "RETAILER",
  "DEVELOPER",
];

export function assertAuthenticated(user: SessionUser | null): asserts user is SessionUser {
  if (!user) {
    throw new UnauthorizedError();
  }
}

export function assertActive(user: SessionUser): void {
  if (user.status === "SUSPENDED") {
    throw new ForbiddenError("This account has been suspended.");
  }

  if (user.status === "PENDING_EMAIL_VERIFICATION") {
    throw new ForbiddenError("Please verify your email address before continuing.");
  }
}

export function hasRole(user: SessionUser | null, roles: UserRole[]): boolean {
  return Boolean(user && roles.includes(user.role));
}

export function canAccessAdmin(user: SessionUser | null): boolean {
  return hasRole(user, ["SUPER_ADMIN"]);
}

export function canAccessCompanyDashboard(user: SessionUser | null): boolean {
  return hasRole(user, COMPANY_DASHBOARD_ROLES) || canAccessAdmin(user);
}

export function canManageOrganisation(
  user: SessionUser | null,
  membershipRole?: string | null,
): boolean {
  if (canAccessAdmin(user)) {
    return true;
  }

  return membershipRole === "OWNER" || membershipRole === "ADMIN";
}

export function canEditOrganisationProducts(
  user: SessionUser | null,
  membershipRole?: string | null,
  productOrganisationId?: string,
  userOrganisationId?: string,
): boolean {
  if (!user) {
    return false;
  }

  if (user.role === "SUPER_ADMIN") {
    return true;
  }

  if (!productOrganisationId || !userOrganisationId) {
    return false;
  }

  if (productOrganisationId !== userOrganisationId) {
    return false;
  }

  return membershipRole === "OWNER" || membershipRole === "ADMIN" || membershipRole === "EDITOR";
}
