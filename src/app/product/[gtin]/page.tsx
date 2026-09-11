import { notFound } from "next/navigation";
import { findProductByPublicId } from "@/services/product.service";
import { VerificationBadge, ProductStatusBadge } from "@/components/feedback/status-badges";
import { Alert } from "@/components/ui/alert";
import { formatMeasurement } from "@/utilities/format";
import { DEFAULT_LANGUAGE } from "@/utilities/constants";

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
    product.translations.find((item) => item.languageCode !== DEFAULT_LANGUAGE) ??
    product.translations[0];
  const primaryBarcode = product.barcodes.find((item) => item.isPrimary) ?? product.barcodes[0];
  const mainImage = product.images.find((item) => item.isMain) ?? product.images[0];
  const netContent =
    formatMeasurement(product.measurement?.netWeightValue, product.measurement?.netWeightUnit) ??
    formatMeasurement(product.measurement?.netVolumeValue, product.measurement?.netVolumeUnit);
  const latestRecall = product.recalls[0];
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const publicPath = `/product/${primaryBarcode?.value ?? product.gprId}`;

  return (
    <div className="mx-auto w-full max-w-5xl px-4 py-10">
      {product.status === "RECALLED" || latestRecall ? (
        <Alert variant="destructive" className="mb-6">
          <strong>⚠ PRODUCT RECALL</strong>
          <p className="mt-1">
            {latestRecall?.reason ?? "This product has been recalled. Historical data is retained."}
          </p>
        </Alert>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
        <div className="flex h-72 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
          {mainImage ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={mainImage.url} alt={mainImage.altText ?? original?.productName ?? ""} className="h-full w-full object-cover" />
          ) : (
            <span className="text-sm text-muted-foreground">No product image</span>
          )}
        </div>
        <div>
          <p className="text-sm text-muted-foreground">{product.brand.name}</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight">
            {original?.productName ?? english?.productName ?? product.gprId}
          </h1>
          <p className="mt-2 text-sm text-muted-foreground">
            English: {english?.productName ?? "English translation missing"}
          </p>
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <ProductStatusBadge status={product.status} />
            <VerificationBadge level={product.verification} lastVerifiedAt={product.lastVerifiedAt} />
          </div>
          <dl className="mt-6 grid gap-3 text-sm sm:grid-cols-2">
            <Item
              label="Barcode"
              value={
                primaryBarcode
                  ? `${primaryBarcode.value}${primaryBarcode.isOfficial ? "" : " (internal, not a GS1 GTIN)"}`
                  : product.gprId
              }
            />
            <Item label="Internal ID" value={`${product.gprId} · not an official GS1 GTIN`} />
            <Item label="Manufacturer" value={product.manufacturer.name} />
            <Item label="Country of origin" value={product.originCountry?.name} />
            <Item label="Net content" value={netContent} />
            <Item label="Category" value={product.category?.name} />
          </dl>
        </div>
      </div>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <Block title="Ingredients">
          {english?.ingredients || original?.ingredients || "No ingredients published yet."}
        </Block>
        <Block title="Allergens">
          {product.allergens.length === 0
            ? "No allergen statements published yet."
            : product.allergens
                .map((item) => `${item.allergen.name}: ${item.presence.replace("_", " ").toLowerCase()}`)
                .join(", ")}
        </Block>
        <Block title="Nutrition">
          {product.nutrition ? (
            <ul className="grid grid-cols-2 gap-2">
              <li>Energy: {String(product.nutrition.energyKcal ?? "—")} kcal</li>
              <li>Fat: {String(product.nutrition.fat ?? "—")} g</li>
              <li>Saturates: {String(product.nutrition.saturatedFat ?? "—")} g</li>
              <li>Carbohydrate: {String(product.nutrition.carbohydrate ?? "—")} g</li>
              <li>Sugars: {String(product.nutrition.sugars ?? "—")} g</li>
              <li>Protein: {String(product.nutrition.protein ?? "—")} g</li>
              <li>Salt: {String(product.nutrition.salt ?? "—")} g</li>
              <li>Fibre: {String(product.nutrition.fibre ?? "—")} g</li>
            </ul>
          ) : (
            "No nutrition information published yet."
          )}
        </Block>
        <Block title="Packaging">
          {product.packaging
            ? `${product.packaging.type.toLowerCase()} · ${product.packaging.material.toLowerCase()}`
            : "No packaging information published yet."}
        </Block>
      </section>

      <section className="mt-8">
        <h2 className="text-sm font-semibold">Translations</h2>
        <ul className="mt-3 divide-y rounded-xl border border-border">
          {product.translations.map((translation) => (
            <li key={translation.id} className="px-4 py-3 text-sm">
              <span className="font-mono text-xs uppercase text-muted-foreground">
                {translation.languageCode}
              </span>
              <span className="ml-3">{translation.productName}</span>
            </li>
          ))}
        </ul>
        {!english ? (
          <p className="mt-3 text-sm text-amber-700 dark:text-amber-300">English translation missing</p>
        ) : null}
      </section>

      <section className="mt-8 text-sm text-muted-foreground">
        <p>
          QR destination: {appUrl}
          {publicPath}
        </p>
        <p className="mt-1">
          Countries available:{" "}
          {product.countries.length > 0
            ? product.countries.map((item) => item.country.name).join(", ")
            : "Not specified"}
        </p>
      </section>
    </div>
  );
}

function Item({ label, value }: { label: string; value?: string | null }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1">{value || "—"}</dd>
    </div>
  );
}

function Block({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-xl border border-border p-5">
      <h2 className="text-sm font-semibold">{title}</h2>
      <div className="mt-3 text-sm leading-6 text-muted-foreground">{children}</div>
    </section>
  );
}
