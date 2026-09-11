import {
  OrganisationMemberRole,
  OrganisationStatus,
  OrganisationType,
  UserRole,
} from "@prisma/client";
import { prisma } from "@/database/client";
import { writeAuditLog } from "@/services/audit.service";
import { ConflictError, ForbiddenError, NotFoundError } from "@/utilities/errors";
import { slugify } from "@/utilities/slug";
import type { OrganisationWizardInput } from "@/validation/organisation";

function organisationTypeForRole(role: UserRole): OrganisationType {
  switch (role) {
    case "DISTRIBUTOR":
      return OrganisationType.DISTRIBUTOR;
    case "RETAILER":
      return OrganisationType.RETAILER;
    default:
      return OrganisationType.MANUFACTURER;
  }
}

export async function getMembershipForUser(userId: string) {
  return prisma.organisationMember.findFirst({
    where: { userId },
    include: {
      organisation: {
        include: {
          country: true,
          members: {
            include: { user: true },
            orderBy: { createdAt: "asc" },
          },
          _count: { select: { products: true, members: true, brands: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });
}

export async function createOrganisationForUser(
  userId: string,
  role: UserRole,
  input: OrganisationWizardInput,
) {
  const existing = await prisma.organisationMember.findFirst({
    where: { userId },
  });

  if (existing) {
    throw new ConflictError("You already belong to an organisation.");
  }

  const country = await prisma.country.findUnique({
    where: { id: input.countryId },
  });

  if (!country) {
    throw new NotFoundError("The selected country was not found.");
  }

  const uniqueBrands = [...new Set(input.brands.map((brand) => brand.trim()).filter(Boolean))];

  const organisation = await prisma.$transaction(async (tx) => {
    const created = await tx.organisation.create({
      data: {
        type: input.type ?? organisationTypeForRole(role),
        name: input.name,
        legalName: input.legalName,
        registrationNumber: input.registrationNumber || null,
        vatNumber: input.vatNumber || null,
        countryId: input.countryId,
        addressLine1: input.addressLine1,
        addressLine2: input.addressLine2 || null,
        city: input.city,
        region: input.region || null,
        postalCode: input.postalCode,
        website: input.website || null,
        businessEmail: input.businessEmail,
        contactPerson: input.contactPerson,
        phone: input.phone,
        gs1CompanyPrefix: input.gs1CompanyPrefix || null,
        status: OrganisationStatus.PENDING_VERIFICATION,
        members: {
          create: {
            userId,
            role: OrganisationMemberRole.OWNER,
          },
        },
        brands: {
          create: uniqueBrands.map((name) => ({
            name,
            slug: slugify(name),
          })),
        },
        manufacturers: {
          create: {
            name: input.legalName,
            addressLine1: input.addressLine1,
            addressLine2: input.addressLine2 || null,
            city: input.city,
            postalCode: input.postalCode,
            countryId: input.countryId,
            website: input.website || null,
            contactEmail: input.businessEmail,
            contactPhone: input.phone,
          },
        },
        subscriptions: {
          create: {
            plan: "FREE",
            status: "ACTIVE",
            monthlyRequestLimit: 10_000,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000),
          },
        },
      },
    });

    if (created.type === OrganisationType.DISTRIBUTOR) {
      await tx.distributor.create({
        data: {
          organisationId: created.id,
          tradingName: input.name,
          addressLine1: input.addressLine1,
          city: input.city,
          postalCode: input.postalCode,
          countryId: input.countryId,
          website: input.website || null,
          contactEmail: input.businessEmail,
        },
      });
    }

    return created;
  });

  await writeAuditLog({
    actorId: userId,
    organisationId: organisation.id,
    action: "organisation.created",
    entityType: "Organisation",
    entityId: organisation.id,
    metadata: { status: organisation.status },
  });

  return organisation;
}

export async function reviewOrganisation(options: {
  actorId: string;
  organisationId: string;
  decision: "VERIFIED" | "REJECTED";
  note?: string;
}) {
  const organisation = await prisma.organisation.findUnique({
    where: { id: options.organisationId },
  });

  if (!organisation) {
    throw new NotFoundError("Organisation not found.");
  }

  const updated = await prisma.organisation.update({
    where: { id: options.organisationId },
    data: {
      status: options.decision,
      verificationNote: options.note || null,
      verifiedAt: options.decision === "VERIFIED" ? new Date() : null,
    },
  });

  await writeAuditLog({
    actorId: options.actorId,
    organisationId: updated.id,
    action:
      options.decision === "VERIFIED"
        ? "organisation.verified"
        : "organisation.rejected",
    entityType: "Organisation",
    entityId: updated.id,
    metadata: { note: options.note },
  });

  return updated;
}

export async function setOrganisationStatus(options: {
  actorId: string;
  organisationId: string;
  status: OrganisationStatus;
  reason: string;
}) {
  const updated = await prisma.organisation.update({
    where: { id: options.organisationId },
    data: {
      status: options.status,
      verificationNote: options.reason,
    },
  });

  await writeAuditLog({
    actorId: options.actorId,
    organisationId: updated.id,
    action: "organisation.status_changed",
    entityType: "Organisation",
    entityId: updated.id,
    metadata: { status: options.status, reason: options.reason },
  });

  return updated;
}

export async function setUserStatus(options: {
  actorId: string;
  userId: string;
  status: "ACTIVE" | "SUSPENDED";
  reason: string;
}) {
  if (options.actorId === options.userId) {
    throw new ForbiddenError("You cannot change the status of your own account.");
  }

  const updated = await prisma.user.update({
    where: { id: options.userId },
    data: { status: options.status },
  });

  await writeAuditLog({
    actorId: options.actorId,
    action: "user.status_changed",
    entityType: "User",
    entityId: updated.id,
    metadata: { status: options.status, reason: options.reason },
  });

  return updated;
}

export async function addOrganisationMember(options: {
  organisationId: string;
  actorId: string;
  email: string;
  role: Exclude<OrganisationMemberRole, "OWNER">;
}) {
  const user = await prisma.user.findUnique({
    where: { email: options.email },
  });

  if (!user) {
    throw new NotFoundError(
      "No account exists for that email. Ask them to register first, then invite them again.",
    );
  }

  const existing = await prisma.organisationMember.findUnique({
    where: {
      organisationId_userId: {
        organisationId: options.organisationId,
        userId: user.id,
      },
    },
  });

  if (existing) {
    throw new ConflictError("That user is already a member of this organisation.");
  }

  const member = await prisma.organisationMember.create({
    data: {
      organisationId: options.organisationId,
      userId: user.id,
      role: options.role,
    },
  });

  await writeAuditLog({
    actorId: options.actorId,
    organisationId: options.organisationId,
    action: "organisation.member_added",
    entityType: "OrganisationMember",
    entityId: member.id,
    metadata: { email: options.email, role: options.role },
  });

  return member;
}
