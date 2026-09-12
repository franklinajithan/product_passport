import type { OwnershipStatus, TradePartyRole } from "@/lib/standards/types";

export function ownershipLabel(status: OwnershipStatus): string {
  switch (status) {
    case "GS1_VERIFIED":
      return "Ownership verified (GS1)";
    case "OWNER_VERIFIED":
      return "Ownership verified";
    case "FORMAT_VALID":
      return "Check digit valid — ownership not verified";
    case "DISPUTED":
      return "Ownership disputed";
    case "RETIRED":
      return "Identifier retired";
    default:
      return "GTIN ownership not verified";
  }
}

export function isOfficiallyAuthorised(status: OwnershipStatus): boolean {
  return status === "OWNER_VERIFIED" || status === "GS1_VERIFIED";
}

export function canAssignOfficialGtin(options: {
  actorRole: TradePartyRole | "SUPER_ADMIN";
  ownershipStatus: OwnershipStatus;
  sessionOrganisationId: string;
  ownerOrganisationId: string | null;
}): boolean {
  if (options.actorRole === "SUPER_ADMIN") {
    return true;
  }

  if (options.ownershipStatus === "RETIRED" || options.ownershipStatus === "DISPUTED") {
    return false;
  }

  if (!options.ownerOrganisationId) {
    return options.actorRole === "BRAND_OWNER";
  }

  if (options.sessionOrganisationId !== options.ownerOrganisationId) {
    return false;
  }

  return options.actorRole === "BRAND_OWNER";
}

export function checkDigitIsNotOwnership(checkDigitValid: boolean, ownership: OwnershipStatus): {
  checkDigitValid: boolean;
  ownershipVerified: boolean;
} {
  return {
    checkDigitValid,
    ownershipVerified: isOfficiallyAuthorised(ownership),
  };
}
