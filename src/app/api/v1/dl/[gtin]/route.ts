import { NextResponse } from "next/server";
import { findProductByGtin } from "@/services/product.service";
import { validateGTIN } from "@/lib/standards/gs1/gtin";
import {
  buildResolverLinks,
  pickTranslationLanguage,
  preferredLanguagesFromRequest,
} from "@/lib/standards/gs1/resolver";
import { enforceRateLimit } from "@/utilities/rate-limit";
import { RateLimitError } from "@/utilities/errors";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gtin: string }> },
) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    enforceRateLimit({ key: `dl:${ip}`, limit: 60, windowMs: 60_000 });

    const { gtin } = await params;
    const url = new URL(request.url);
    const parsed = validateGTIN(gtin);
    const product = parsed.valid ? await findProductByGtin(gtin) : null;
    const appUrl = process.env.APP_URL ?? url.origin;
    const available = product?.translations.map((item) => item.languageCode) ?? ["en"];
    const language = pickTranslationLanguage(
      available,
      preferredLanguagesFromRequest({
        queryLanguage: url.searchParams.get("lang"),
        acceptLanguage: request.headers.get("accept-language"),
      }),
    );
    const displayGtin = parsed.displayValue || gtin;
    const translation = product?.translations.find((item) => item.languageCode === language);

    return NextResponse.json(
      {
        digitalLink: `${appUrl}/01/${parsed.canonicalGTIN14 ?? gtin}`,
        language,
        identifier: {
          type: parsed.detectedType,
          value: parsed.displayValue,
          canonicalGTIN14: parsed.canonicalGTIN14,
          checkDigitValid: parsed.checkDigitValid,
        },
        product: product
          ? {
              name: translation?.productName ?? product.brand.name,
              brand: product.brand.name,
              status: product.status,
            }
          : null,
        links: buildResolverLinks({
          appUrl,
          gtin: displayGtin,
          language,
          hasRecall: Boolean(product?.recalls[0]),
        }),
      },
      { status: product ? 200 : parsed.valid ? 404 : 400 },
    );
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    throw error;
  }
}
