export const APP_NAME = "Global Product Registry";
export const APP_SHORT_NAME = "GPR";

export const INTERNAL_ID_PREFIX = "GPR-";
export const INTERNAL_ID_PATTERN = /^GPR-\d{11}$/;

export const DEFAULT_LANGUAGE = "en";

export const SUBSCRIPTION_LIMITS = {
  FREE: 10_000,
  PRO: 100_000,
  ENTERPRISE: 1_000_000,
} as const;

export const AUTH_TOKEN_TTL_HOURS = {
  EMAIL_VERIFICATION: 24,
  PASSWORD_RESET: 2,
  ORGANISATION_INVITE: 24 * 7,
} as const;

export const PUBLIC_ROLES = [
  "MANUFACTURER",
  "DISTRIBUTOR",
  "RETAILER",
  "DEVELOPER",
  "CONSUMER",
] as const;

export const COMPANY_ROLES = [
  "MANUFACTURER",
  "DISTRIBUTOR",
  "RETAILER",
] as const;
