import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/authentication/session";
import { getMembershipForUser } from "@/services/organisation.service";
import { prisma } from "@/database/client";
import { hashToken, generateToken } from "@/utilities/crypto";
import { writeAuditLog } from "@/services/audit.service";

const schema = z.object({
  endpoint: z.string().url(),
  events: z.array(z.string()).min(1),
});

export async function GET() {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Organisation required." }, { status: 403 });
  }
  const webhooks = await prisma.webhook.findMany({
    where: { organisationId: membership.organisationId },
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      endpoint: true,
      events: true,
      status: true,
      lastDeliveryAt: true,
      failureCount: true,
      createdAt: true,
    },
  });
  return NextResponse.json({ webhooks });
}

export async function POST(request: Request) {
  const user = await getCurrentUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in required." }, { status: 401 });
  }
  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    return NextResponse.json({ error: "Organisation required." }, { status: 403 });
  }
  const parsed = schema.safeParse(await request.json());
  if (!parsed.success) {
    return NextResponse.json({ error: "Endpoint and at least one event are required." }, { status: 400 });
  }

  const secret = generateToken(24);
  const webhook = await prisma.webhook.create({
    data: {
      organisationId: membership.organisationId,
      endpoint: parsed.data.endpoint,
      secretHash: hashToken(secret),
      events: parsed.data.events,
    },
  });
  await writeAuditLog({
    actorId: user.id,
    organisationId: membership.organisationId,
    action: "WEBHOOK_CREATED",
    entityType: "Webhook",
    entityId: webhook.id,
  });

  return NextResponse.json({
    id: webhook.id,
    secret,
    warning: "Store the signing secret now. Only a hash is retained.",
  });
}
