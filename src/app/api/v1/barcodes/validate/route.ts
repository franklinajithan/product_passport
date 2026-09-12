import { NextResponse } from "next/server";
import { z } from "zod";
import { validateGTIN } from "@/lib/standards/gs1/gtin";
import { decodeScannedPayload } from "@/lib/standards/gs1/scan";
import { enforceRateLimit } from "@/utilities/rate-limit";
import { RateLimitError } from "@/utilities/errors";

const bodySchema = z.object({
  value: z.string().min(1),
  symbology: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    enforceRateLimit({ key: `barcode-validate:${ip}`, limit: 60, windowMs: 60_000 });

    const parsedBody = bodySchema.safeParse(await request.json());
    if (!parsedBody.success) {
      return NextResponse.json({ error: "value is required." }, { status: 400 });
    }

    const decoded = decodeScannedPayload(parsedBody.data.value, parsedBody.data.symbology);
    const gtin = validateGTIN(decoded.gtin ?? parsedBody.data.value);

    return NextResponse.json({
      detectedType: gtin.detectedType,
      valid: gtin.valid,
      checkDigitValid: gtin.checkDigitValid,
      canonicalGTIN14: gtin.canonicalGTIN14,
      carrierHint: gtin.carrierHint,
      scan: {
        gtin: decoded.gtin,
        lot: decoded.lot,
        serial: decoded.serial,
        expiry: decoded.expiry,
        symbologyHint: decoded.symbologyHint,
      },
      issues: gtin.issues,
      standards: gtin.standards,
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    throw error;
  }
}
