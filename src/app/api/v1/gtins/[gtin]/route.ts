import { NextResponse } from "next/server";
import { findIdentifierByGtin, verificationPayload } from "@/services/identifier.service";
import { validateGTIN } from "@/lib/standards/gs1/gtin";
import { enforceRateLimit } from "@/utilities/rate-limit";
import { RateLimitError } from "@/utilities/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gtin: string }> },
) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    enforceRateLimit({ key: `gtin:${ip}`, limit: 60, windowMs: 60_000 });

    const { gtin } = await params;
    const parsed = validateGTIN(gtin);
    const identifier = await findIdentifierByGtin(gtin);

    if (!identifier) {
      return NextResponse.json(
        {
          identifier: {
            type: parsed.detectedType,
            value: parsed.displayValue,
            canonicalGTIN14: parsed.canonicalGTIN14,
            checkDigitValid: parsed.checkDigitValid,
          },
          verification: {
            format: parsed.checkDigitValid ? "VALID" : "INVALID",
            ownership: "UNVERIFIED",
            product: "NOT_FOUND",
          },
          product: null,
          barcodeCarriers: parsed.carrierHint ? [parsed.carrierHint] : [],
        },
        { status: parsed.valid ? 404 : 400 },
      );
    }

    return NextResponse.json({
      identifier: {
        type: identifier.identifierType,
        value: identifier.displayValue,
        canonicalGTIN14: identifier.canonicalGtin14,
        checkDigitValid: identifier.checkDigitValid,
      },
      verification: verificationPayload(identifier),
      product: identifier.product
        ? {
            name:
              identifier.product.translations.find((item) => item.languageCode === "en")?.productName ??
              identifier.product.translations[0]?.productName ??
              identifier.product.brand.name,
            brand: identifier.product.brand.name,
            manufacturer: identifier.product.manufacturer.name,
            status: identifier.product.status,
          }
        : null,
      barcodeCarriers: identifier.symbols.map((symbol) => symbol.symbology),
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    throw error;
  }
}
