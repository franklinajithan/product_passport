import { NextResponse } from "next/server";
import { z } from "zod";
import { decodeScannedPayload } from "@/lib/standards/gs1/scan";
import { findIdentifierByGtin } from "@/services/identifier.service";
import { findProductByGtin } from "@/services/product.service";
import { enforceRateLimit } from "@/utilities/rate-limit";
import { RateLimitError } from "@/utilities/errors";

const bodySchema = z.object({
  value: z.string().min(1),
  symbology: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    enforceRateLimit({ key: `barcode-scan:${ip}`, limit: 60, windowMs: 60_000 });

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "value is required." }, { status: 400 });
    }

    const decoded = decodeScannedPayload(parsed.data.value, parsed.data.symbology);
    const lookupValue = decoded.gtin ?? parsed.data.value;
    const identifier = decoded.gtin ? await findIdentifierByGtin(decoded.gtin) : null;
    const product = await findProductByGtin(lookupValue);

    return NextResponse.json({
      scan: decoded,
      productFound: Boolean(product || identifier?.product),
      identifierId: identifier?.id ?? null,
      productId: product?.id ?? identifier?.productId ?? null,
      lookupGtin: decoded.gtin ?? identifier?.displayValue ?? lookupValue,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    throw error;
  }
}
