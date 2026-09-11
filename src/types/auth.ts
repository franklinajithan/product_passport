import type { OrganisationMemberRole, OrganisationStatus, UserRole, UserStatus } from "@prisma/client";

export type SessionUser = {
  id: string;
  email: string;
  name: string | null;
  role: UserRole;
  status: UserStatus;
};

export type OrganisationSummary = {
  id: string;
  name: string;
  status: OrganisationStatus;
  memberRole: OrganisationMemberRole;
};

export type RegisterRole =
  | "MANUFACTURER"
  | "DISTRIBUTOR"
  | "RETAILER"
  | "DEVELOPER"
  | "CONSUMER";
