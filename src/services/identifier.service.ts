import { IdentifierStatus, OwnershipStatus, Prisma } from "@prisma/client";
import { prisma } from "@/database/client";
import {
  gtinLookupCandidates,
  identifierTypeForGtin,
  validateGTIN,
} from "@/lib/standards/gs1/gtin";
import { duplicateGtinError } from "@/lib/standards/identifiers/duplicates";
import { ISSUING_SYSTEM_GS1 } from "@/lib/standards/types";
import { writeAuditLog } from "@/services/audit.service";

export {
  DUPLICATE_GTIN_ACTIONS,
  GTIN_ALREADY_EXISTS,
  duplicateGtinError,
} from "@/lib/standards/identifiers/duplicates";

export async function findIdentifierByGtin(value: string, options?: { includeRetired?: boolean }) {
  const candidates = gtinLookupCandidates(value);
  if (candidates.length === 0) {
    return null;
  }

  return prisma.productIdentifier.findFirst({
    where: {
      ...(options?.includeRetired ? {} : { status: { not: IdentifierStatus.RETIRED } }),
      OR: [
        { identifierValue: { in: candidates } },
        { canonicalGtin14: { in: candidates } },
        { displayValue: { in: candidates } },
      ],
    },
    include: {
      product: {
        include: {
          brand: true,
          organisation: true,
          manufacturer: { include: { country: true } },
          translations: true,
        },
      },
      organisation: true,
      symbols: true,
    },
  });
}

export async function registerGtinIdentifier(options: {
  value: string;
  productId?: string;
  organisationId?: string;
  actorId?: string;
}) {
  const parsed = validateGTIN(options.value);
  if (!parsed.valid || !parsed.canonicalGTIN14) {
    return { ok: false as const, error: parsed.issues[0]?.message ?? "Invalid GTIN." };
  }

  const existing = await findIdentifierByGtin(parsed.canonicalGTIN14, { includeRetired: true });
  if (existing) {
    return duplicateGtinError(existing);
  }

  const barcodeClash = await prisma.productBarcode.findFirst({
    where: { value: { in: gtinLookupCandidates(parsed.canonicalGTIN14) } },
    select: { id: true, productId: true },
  });
  if (barcodeClash) {
    return duplicateGtinError({ id: barcodeClash.id, productId: barcodeClash.productId });
  }

  try {
    const identifier = await prisma.productIdentifier.create({
      data: {
        productId: options.productId,
        organisationId: options.organisationId,
        identifierType: identifierTypeForGtin(parsed.detectedType),
        identifierValue: parsed.displayValue,
        displayValue: parsed.displayValue,
        canonicalGtin14: parsed.canonicalGTIN14,
        issuingSystem: ISSUING_SYSTEM_GS1,
        status: IdentifierStatus.ACTIVE,
        checkDigitValid: parsed.checkDigitValid,
        ownershipStatus: OwnershipStatus.FORMAT_VALID,
        verified: false,
        standardKey: "GS1_GENERAL_SPECIFICATIONS",
        standardVersion: parsed.standards.validatedAgainst[0]?.version,
      },
    });

    await writeAuditLog({
      actorId: options.actorId,
      organisationId: options.organisationId,
      action: "GTIN_ADDED",
      entityType: "ProductIdentifier",
      entityId: identifier.id,
      metadata: {
        value: parsed.displayValue,
        canonicalGTIN14: parsed.canonicalGTIN14,
        checkDigitValid: parsed.checkDigitValid,
      },
    });

    return { ok: true as const, identifier };
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      const clash = await findIdentifierByGtin(parsed.canonicalGTIN14, { includeRetired: true });
      return duplicateGtinError({ id: clash?.id ?? "unknown", productId: clash?.productId ?? null });
    }
    throw error;
  }
}

export async function retireIdentifier(options: {
  identifierId: string;
  actorId?: string;
  reason: string;
}) {
  const identifier = await prisma.productIdentifier.update({
    where: { id: options.identifierId },
    data: {
      status: IdentifierStatus.RETIRED,
      ownershipStatus: OwnershipStatus.RETIRED,
      retiredAt: new Date(),
    },
  });

  await writeAuditLog({
    actorId: options.actorId,
    organisationId: identifier.organisationId,
    action: "GTIN_RETIRED",
    entityType: "ProductIdentifier",
    entityId: identifier.id,
    metadata: { reason: options.reason, previousValue: identifier.identifierValue },
  });

  return identifier;
}

export function verificationPayload(identifier: {
  checkDigitValid: boolean;
  ownershipStatus: OwnershipStatus;
  verified: boolean;
  productId: string | null;
}) {
  return {
    format: identifier.checkDigitValid ? "VALID" : "INVALID",
    ownership: identifier.ownershipStatus,
    product: identifier.verified && identifier.productId ? "VERIFIED" : identifier.productId ? "LINKED" : "NOT_FOUND",
  };
}

export type IdentifierCreateInput = Prisma.ProductIdentifierCreateInput;
