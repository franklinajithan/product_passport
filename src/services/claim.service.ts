import { IdentifierClaimType } from "@prisma/client";
import { prisma } from "@/database/client";
import { findIdentifierByGtin } from "@/services/identifier.service";
import { writeAuditLog } from "@/services/audit.service";
import { ForbiddenError } from "@/utilities/errors";

export async function createIdentifierClaim(options: {
  type: IdentifierClaimType;
  gtin?: string;
  productId?: string;
  organisationId: string;
  claimantId: string;
  evidenceNote?: string;
  evidenceUrl?: string;
}) {
  if (!options.organisationId) {
    throw new ForbiddenError("An authenticated organisation is required to file a claim.");
  }

  const identifier = options.gtin ? await findIdentifierByGtin(options.gtin, { includeRetired: true }) : null;

  const claim = await prisma.identifierClaim.create({
    data: {
      type: options.type,
      identifierId: identifier?.id,
      productId: options.productId ?? identifier?.productId,
      organisationId: options.organisationId,
      claimantId: options.claimantId,
      evidenceNote: options.evidenceNote,
      evidenceUrl: options.evidenceUrl,
    },
  });

  await writeAuditLog({
    actorId: options.claimantId,
    organisationId: options.organisationId,
    action: "CLAIM_FILED",
    entityType: "IdentifierClaim",
    entityId: claim.id,
    metadata: { type: options.type, gtin: options.gtin ?? null },
  });

  return claim;
}
