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
    const gtinIdentifier =
      product.identifiers.find((item) => item.identifierType.startsWith("GTIN") || item.identifierType === "EAN_13" || item.identifierType === "UPC_A") ??
      product.identifiers[0];
    const digitalLink = product.digitalLinks[0];

    return NextResponse.json({
      gtin: primary?.value ?? gtinIdentifier?.displayValue ?? null,
      gprId: product.gprId,
      status: product.status,
      verification: product.verification,
      lastVerifiedAt: product.lastVerifiedAt,
      brand: { id: product.brandId, name: product.brand.name },
      names,
      netContent: product.measurement?.netWeightValue
        ? {
            value: decimal(product.measurement.netWeightValue),
            unit: product.measurement.netWeightUnit,
            unitCode: product.measurement.netContentUnitCode,
            variableMeasure: product.measurement.isVariableMeasure,
          }
        : product.measurement?.netVolumeValue
          ? {
              value: decimal(product.measurement.netVolumeValue),
              unit: product.measurement.netVolumeUnit,
              unitCode: product.measurement.netContentUnitCode,
              variableMeasure: product.measurement.isVariableMeasure,
            }
          : null,
      manufacturer: {
        id: product.manufacturerId,
        name: product.manufacturer.name,
        country: product.manufacturer.country.iso2,
      },
      parties: product.parties.map((party) => ({
        role: party.role,
        name: party.name,
        countryCode: party.countryCode,
      })),
      ingredients,
      allergens: product.allergens.map((item) => ({
        name: item.allergen.name,
        presence: item.presence,
      })),
      nutrition: product.nutrition
        ? {
            basis: product.nutrition.basis,
            energyKcal: decimal(product.nutrition.energyKcal),
            fat: decimal(product.nutrition.fat),
            carbohydrate: decimal(product.nutrition.carbohydrate),
            protein: decimal(product.nutrition.protein),
            salt: decimal(product.nutrition.salt),
          }
        : null,
      images: {
        front: front?.url ?? null,
        back: back?.url ?? null,
      },
      lifecycle: {
        status: product.status,
        recall: product.recalls[0]
          ? { reason: product.recalls[0].reason, recalledAt: product.recalls[0].recalledAt }
          : null,
      },
      identifiers: product.identifiers.map((item) => ({
        type: item.identifierType,
        value: item.displayValue,
        canonicalGTIN14: item.canonicalGtin14,
        issuingSystem: item.issuingSystem,
        checkDigitValid: item.checkDigitValid,
        ownership: item.ownershipStatus,
      })),
      barcodeCarriers: product.identifiers.flatMap((item) => item.symbols.map((symbol) => symbol.symbology)),
      digitalLink: digitalLink?.uri ?? null,
      packagingHierarchy: [
        ...product.hierarchyAsParent.map((link) => ({
          level: link.packagingLevel,
          role: "parent",
          quantity: link.quantity,
          childGtin: link.childGtin,
        })),
        ...product.hierarchyAsChild.map((link) => ({
          level: link.packagingLevel,
          role: "child",
          quantity: link.quantity,
          parentGtin: link.parentGtin,
        })),
      ],
    });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    throw error;
  }
}
