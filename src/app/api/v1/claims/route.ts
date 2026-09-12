import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/authentication/session";
import { getMembershipForUser } from "@/services/organisation.service";
import { createIdentifierClaim } from "@/services/claim.service";
import { enforceRateLimit } from "@/utilities/rate-limit";
import { RateLimitError } from "@/utilities/errors";

const bodySchema = z.object({
  type: z.enum([
    "CLAIM_GTIN",
    "CLAIM_BRAND",
    "CLAIM_PRODUCT",
    "REPORT_MISASSIGNMENT",
    "REPORT_COUNTERFEIT",
    "REPORT_DUPLICATE",
  ]),
  gtin: z.string().optional(),
  productId: z.string().uuid().optional(),
  evidenceNote: z.string().max(4000).optional(),
  evidenceUrl: z.string().url().optional(),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    enforceRateLimit({ key: `claims:${ip}`, limit: 20, windowMs: 60_000 });

    const user = await getCurrentUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in required." }, { status: 401 });
    }

    const membership = await getMembershipForUser(user.id);
    if (!membership) {
      return NextResponse.json({ error: "An organisation membership is required." }, { status: 403 });
    }

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid claim payload." }, { status: 400 });
    }

    const claim = await createIdentifierClaim({
      type: parsed.data.type as import("@prisma/client").IdentifierClaimType,
      gtin: parsed.data.gtin,
      productId: parsed.data.productId,
      organisationId: membership.organisationId,
      claimantId: user.id,
      evidenceNote: parsed.data.evidenceNote,
      evidenceUrl: parsed.data.evidenceUrl,
    });

    return NextResponse.json({ id: claim.id, status: claim.status }, { status: 201 });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    throw error;
  }
}
