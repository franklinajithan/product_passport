import { NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentUser } from "@/authentication/session";
import { getMembershipForUser } from "@/services/organisation.service";
import { prisma } from "@/database/client";
import { writeAuditLog } from "@/services/audit.service";
import { findProductByPublicId } from "@/services/product.service";

const schema = z.object({
  gtin: z.string().min(8).max(32),
  reason: z.string().min(8).max(4000),
  batchNumbers: z.string().max(500).optional(),
  consumerInstructions: z.string().min(8).max(4000),
  retailerInstructions: z.string().max(4000).optional(),
  countryIso2: z.array(z.string().length(2)).optional(),
});

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
    return NextResponse.json({ error: "GTIN, reason and consumer instructions are required." }, { status: 400 });
  }

  const product = await findProductByPublicId(parsed.data.gtin);
  if (!product || product.organisationId !== membership.organisationId) {
    return NextResponse.json({ error: "Product not found in your organisation." }, { status: 404 });
  }

  const reason = parsed.data.retailerInstructions
    ? `${parsed.data.reason}\n\nRetailer instructions: ${parsed.data.retailerInstructions}`
    : parsed.data.reason;

  const countries = parsed.data.countryIso2?.length
    ? await prisma.country.findMany({ where: { iso2: { in: parsed.data.countryIso2 } } })
    : [];

  const recall = await prisma.productRecall.create({
    data: {
      productId: product.id,
      reason,
      recalledAt: new Date(),
      batchNumbers: parsed.data.batchNumbers,
      consumerInstructions: parsed.data.consumerInstructions,
      countries: {
        create: countries.map((country) => ({ countryId: country.id })),
      },
    },
  });

  await prisma.product.update({
    where: { id: product.id },
    data: { status: "RECALLED" },
  });

  await writeAuditLog({
    actorId: user.id,
    organisationId: membership.organisationId,
    action: "PRODUCT_RECALLED",
    entityType: "ProductRecall",
    entityId: recall.id,
    metadata: { productId: product.id },
  });

  return NextResponse.json({ id: recall.id });
}
