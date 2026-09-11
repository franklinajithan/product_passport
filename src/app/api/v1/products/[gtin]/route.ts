import { NextResponse } from "next/server";
import { findProductByPublicId } from "@/services/product.service";
import { enforceRateLimit } from "@/utilities/rate-limit";
import { RateLimitError } from "@/utilities/errors";

function decimal(value: { toString(): string } | null | undefined): number | null {
  if (value === null || value === undefined) {
    return null;
  }
  return Number(value.toString());
}

export async function GET(
  request: Request,
  { params }: { params: Promise<{ gtin: string }> },
) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    enforceRateLimit({ key: `api:${ip}`, limit: 60, windowMs: 60_000 });

    const { gtin } = await params;
    const product = await findProductByPublicId(gtin);

    if (!product) {
      return NextResponse.json({ error: "Product not found" }, { status: 404 });
    }

    const names = Object.fromEntries(
      product.translations.map((item) => [item.languageCode, item.productName]),
    );
    const ingredients = Object.fromEntries(
      product.translations
        .filter((item) => item.ingredients)
        .map((item) => [item.languageCode, item.ingredients]),
    );
    const front = product.images.find((item) => item.type === "FRONT") ?? product.images.find((item) => item.isMain);
    const back = product.images.find((item) => item.type === "BACK");
    const primary = product.barcodes.find((item) => item.isPrimary) ?? product.barcodes[0];

    return NextResponse.json({
      gtin: primary?.value ?? null,
      gprId: product.gprId,
      status: product.status,
      verification: product.verification,
      brand: { name: product.brand.name },
      names,
      netContent: product.measurement?.netWeightValue
        ? {
            value: decimal(product.measurement.netWeightValue),
            unit: product.measurement.netWeightUnit,
          }
        : product.measurement?.netVolumeValue
          ? {
              value: decimal(product.measurement.netVolumeValue),
              unit: product.measurement.netVolumeUnit,
            }
          : null,
      manufacturer: {
        name: product.manufacturer.name,
        country: product.manufacturer.country.iso2,
      },
      ingredients,
      images: {
        front: front?.url ?? null,
        back: back?.url ?? null,
      },
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    throw error;
  }
}
