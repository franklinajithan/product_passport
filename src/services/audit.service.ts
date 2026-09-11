import { Prisma } from "@prisma/client";
import { headers } from "next/headers";
import { prisma } from "@/database/client";

type AuditInput = {
  actorId?: string | null;
  organisationId?: string | null;
  action: string;
  entityType: string;
  entityId: string;
  metadata?: Record<string, unknown>;
};

export async function writeAuditLog(input: AuditInput): Promise<void> {
  let ipAddress: string | undefined;
  try {
    const headerList = await headers();
    const forwarded = headerList.get("x-forwarded-for");
    ipAddress = forwarded?.split(",")[0]?.trim() ?? headerList.get("x-real-ip") ?? undefined;
  } catch {
    ipAddress = undefined;
  }

  await prisma.auditLog.create({
    data: {
      actorId: input.actorId ?? undefined,
      organisationId: input.organisationId ?? undefined,
      action: input.action,
      entityType: input.entityType,
      entityId: input.entityId,
      metadata: input.metadata as Prisma.InputJsonValue | undefined,
      ipAddress: ipAddress ?? undefined,
    },
  });
}
