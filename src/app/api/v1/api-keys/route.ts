import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/authentication/session";
import { getMembershipForUser } from "@/services/organisation.service";
import { prisma } from "@/database/client";
import { generateApiKey } from "@/utilities/crypto";
import { writeAuditLog } from "@/services/audit.service";

const createSchema = z.object({
  name: z.string().min(2).max(80),
  scopes: z.array(z.string().min(3).max(40)).max(12).optional(),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const membership = await getMembershipForUser(user.id);
  const keys = await prisma.aPIKey.findMany({
    where: membership ? { organisationId: membership.organisationId } : { userId: user.id },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      name: true,
      keyPrefix: true,
      lastUsedAt: true,
      revokedAt: true,
      createdAt: true,
      monthlyLimit: true,
    },
  });
  return NextResponse.json({ keys });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const membership = await getMembershipForUser(user.id);
  const parsed = createSchema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "A key name is required." }, { status: 400 });
  }

  const generated = generateApiKey();
  const key = await prisma.aPIKey.create({
    data: {
      userId: user.id,
      organisationId: membership?.organisationId,
      name: parsed.data.name,
      keyPrefix: generated.prefix,
      keyHash: generated.hash,
      permissions: parsed.data.scopes ?? ["products:read"],
    },
  });

  await writeAuditLog({
    actorId: user.id,
    organisationId: membership?.organisationId,
    action: "API_KEY_CREATED",
    entityType: "APIKey",
    entityId: key.id,
  });

  return NextResponse.json({
    id: key.id,
    prefix: key.keyPrefix,
    raw: generated.raw,
    warning: "Store this secret now. It will not be shown again.",
  });
}
