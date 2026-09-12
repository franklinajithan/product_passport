import { NextResponse } from "next/server";
import { getCurrentUser } from "@/authentication/session";
import { getMembershipForUser } from "@/services/organisation.service";
import { prisma } from "@/database/client";
import { writeAuditLog } from "@/services/audit.service";

export async function POST(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const membership = await getMembershipForUser(user.id);
  const { id } = await params;
  const key = await prisma.aPIKey.findFirst({
    where: {
      id,
      ...(membership ? { organisationId: membership.organisationId } : { userId: user.id }),
    },
  });
  if (!key) {
    return NextResponse.json({ error: "Key not found." }, { status: 404 });
  }

  await prisma.aPIKey.update({
    where: { id },
    data: { revokedAt: new Date() },
  });
  await writeAuditLog({
    actorId: user.id,
    organisationId: membership?.organisationId,
    action: "API_KEY_REVOKED",
    entityType: "APIKey",
    entityId: id,
  });
  return NextResponse.json({ ok: true });
}
