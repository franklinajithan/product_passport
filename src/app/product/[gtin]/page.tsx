import { notFound } from "next/navigation";
import { findProductByPublicId } from "@/services/product.service";
import { VerificationBadge, ProductStatusBadge } from "@/components/feedback/status-badges";
import { Alert } from "@/components/ui/alert";
import { formatDate, formatMeasurement } from "@/utilities/format";
import { DEFAULT_LANGUAGE } from "@/utilities/constants";
import { gtinIssuanceDisclaimer, internalIdentifierDisclaimer } from "@/lib/standards/identifiers/namespace";
import { ownershipLabel } from "@/lib/standards/identifiers/ownership";
import { detectGTINType } from "@/lib/standards/gs1/gtin";
import { ProductPassport, type ProductPassportView } from "@/components/products/product-passport";
import type { DemoPackNode } from "@/data/demo-showcase";
import type { GtinDecision } from "@/lib/standards/types";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ gtin: string }>;
}) {
  const { gtin } = await params;
  const product = await findProductByPublicId(gtin);
  const name =
    product?.translations.find((item) => item.languageCode === "en")?.productName ??
    product?.translations[0]?.productName ??
    gtin;

  return {
    title: name,
    description: `Product record ${gtin} in the Global Product Registry.`,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ gtin: string }>;
}) {
  const { gtin } = await params;
  const product = await findProductByPublicId(gtin);

  if (!product) {
    notFound();
  }

  const english = product.translations.find((item) => item.languageCode === DEFAULT_LANGUAGE);
  const original =
    product.translations.find((item) => item.isOriginalLanguage) ??
    product.translations.find((item) => item.languageCode !== DEFAULT_LANGUAGE) ??
    product.translations[0];
  const primaryBarcode = product.barcodes.find((item) => item.isPrimary) ?? product.barcodes[0];
  const primaryIdentifier =
    product.identifiers.find((item) => item.status !== "RETIRED") ?? product.identifiers[0];
  const digitalLink = product.digitalLinks[0];
  const brandOwner = product.parties.find((item) => item.role === "BRAND_OWNER");
  const manufacturerParty = product.parties.find((item) => item.role === "MANUFACTURER");
  const importer = product.parties.find((item) => item.role === "IMPORTER");
  const mainImage = product.images.find((item) => item.isMain) ?? product.images[0];
  const netContent =
    formatMeasurement(product.measurement?.netWeightValue, product.measurement?.netWeightUnit) ??
    formatMeasurement(product.measurement?.netVolumeValue, product.measurement?.netVolumeUnit);
  const latestRecall = product.recalls[0];
  const printedGtin = primaryIdentifier?.displayValue ?? primaryBarcode?.value ?? null;
  const carriers = [
    ...new Set(
      [
        ...primaryIdentifier?.symbols.map((symbol) => symbol.symbology.replaceAll("_", "-")) ?? [],
        primaryBarcode?.type ? String(primaryBarcode.type).replaceAll("_", "-") : null,
      ].filter((value): value is string => Boolean(value)),
    ),
  ];

  const packTree: DemoPackNode[] = [];
  if (product.hierarchyAsChild[0]) {
    const parent = product.hierarchyAsChild[0].parent;
    packTree.push({
      level: "Parent pack",
      gtin: product.hierarchyAsChild[0].parentGtin ?? parent.barcodes[0]?.value ?? parent.gprId,
      quantityFromChild: null,
      carrier: parent.barcodes[0]?.type.replaceAll("_", "-") ?? "—",
    });
  }
  packTree.push({
    level: "This trade item",
    gtin: printedGtin ?? product.gprId,
    quantityFromChild: product.hierarchyAsChild[0]?.quantity ?? null,
    carrier: carriers[0] ?? "—",
  });
  for (const link of product.hierarchyAsParent) {
    packTree.push({
      level: link.packagingLevel.replaceAll("_", " "),
      gtin: link.childGtin ?? link.child.barcodes[0]?.value ?? link.child.gprId,
      quantityFromChild: link.quantity,
      carrier: link.child.barcodes[0]?.type.replaceAll("_", "-") ?? "—",
    });
  }

  const view: ProductPassportView = {
    gtin: printedGtin,
    gtinType: printedGtin ? detectGTINType(printedGtin) : null,
    canonicalGTIN14: primaryIdentifier?.canonicalGtin14 ?? null,
    checkDigitValid: primaryIdentifier?.checkDigitValid ?? null,
    ownership: primaryIdentifier ? ownershipLabel(primaryIdentifier.ownershipStatus) : "GTIN ownership not verified",
    carriers,
    issuer: primaryIdentifier?.issuingOrganisation ?? primaryIdentifier?.issuingSystem ?? null,
    verification: product.verification,
    name: original?.productName ?? english?.productName ?? product.gprId,
    englishName: english?.productName ?? null,
    originalName: original?.productName ?? null,
    brand: product.brand.name,
    manufacturer: manufacturerParty?.name ?? product.manufacturer.name,
    brandOwner: brandOwner?.name ?? product.brand.name,
    importer: importer?.name ?? null,
    origin: product.originCountry?.name ?? null,
    netContent: product.measurement?.isVariableMeasure
      ? `${netContent ?? "Variable measure"} (variable measure)`
      : netContent,
    status: product.status,
    lastVerified: product.lastVerifiedAt ? formatDate(product.lastVerifiedAt) : null,
    ingredients: english?.ingredients || original?.ingredients || null,
    allergens: product.allergens.map(
      (item) => `${item.allergen.name}: ${item.presence.replaceAll("_", " ").toLowerCase()}`,
    ),
    nutrition: product.nutrition
      ? [
          { label: "Energy", value: `${String(product.nutrition.energyKcal ?? "—")} kcal` },
          { label: "Fat", value: `${String(product.nutrition.fat ?? "—")} g` },
          { label: "Saturates", value: `${String(product.nutrition.saturatedFat ?? "—")} g` },
          { label: "Carbohydrate", value: `${String(product.nutrition.carbohydrate ?? "—")} g` },
          { label: "Sugars", value: `${String(product.nutrition.sugars ?? "—")} g` },
          { label: "Protein", value: `${String(product.nutrition.protein ?? "—")} g` },
          { label: "Salt", value: `${String(product.nutrition.salt ?? "—")} g` },
          { label: "Fibre", value: `${String(product.nutrition.fibre ?? "—")} g` },
        ]
      : [],
    packaging: product.packaging
      ? `${product.packaging.type.toLowerCase()} · ${product.packaging.material.toLowerCase()}`
      : null,
    translations: product.translations.map((row) => ({
      language: row.languageCode,
      name: row.productName,
      source: row.translationSource,
    })),
    certifications: product.certifications.map((row) => row.certification.name),
    countries: product.countries.map((row) => row.country.name),
    digitalLink: digitalLink?.uri ?? null,
    history: product.revisions.map((row) => ({
      title: `Version ${row.version}`,
      detail: row.changeReason ?? "Revision recorded.",
      decision: (row.gtinDecision as GtinDecision | null) ?? null,
    })),
    packTree,
    sku: product.sku,
  };

  return (
    <div className="mx-auto w-full max-w-[1440px] px-4 py-10 sm:px-6">
      {product.status === "RECALLED" || latestRecall ? (
        <Alert variant="destructive" className="mb-6">
          <div id="recall">
            <strong>Product recall</strong>
            <p className="mt-1">
              {latestRecall?.reason ?? "This product has been recalled. Historical data is retained."}
            </p>
            {latestRecall?.consumerInstructions ? (
              <p className="mt-2">{latestRecall.consumerInstructions}</p>
            ) : null}
          </div>
        </Alert>
      ) : null}

      <p className="text-sm text-muted-foreground">{product.brand.name}</p>
      <h1 className="mt-1 text-3xl font-semibold tracking-tight">{view.name}</h1>
      <p className="mt-2 text-sm text-muted-foreground">English: {view.englishName ?? "English translation missing"}</p>
      <div className="mt-4 flex flex-wrap items-center gap-3">
        <ProductStatusBadge status={product.status} />
        <VerificationBadge level={product.verification} lastVerifiedAt={product.lastVerifiedAt} />
      </div>
      <p className="mt-3 text-xs text-muted-foreground">
        Internal ID {product.gprId} · {internalIdentifierDisclaimer()}
      </p>

      <div className="mt-8">
        <ProductPassport
          data={view}
          image={mainImage ? { url: mainImage.url, alt: mainImage.altText ?? view.name } : null}
        />
      </div>

      <p className="mt-10 text-xs leading-5 text-muted-foreground">{gtinIssuanceDisclaimer()}</p>
    </div>
  );
}
