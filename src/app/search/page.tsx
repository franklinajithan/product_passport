import { redirect } from "next/navigation";
import { BarcodeSearchForm } from "@/components/marketing/barcode-search-form";
import { ProductResultCard } from "@/components/products/product-result-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { searchProducts, findProductByPublicId } from "@/services/product.service";
import { looksLikeBarcode } from "@/utilities/gtin";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (query && looksLikeBarcode(query)) {
    const exact = await findProductByPublicId(query);
    if (exact) {
      const identifier =
        exact.identifiers[0]?.displayValue ??
        exact.barcodes.find((item) => item.isPrimary)?.value ??
        exact.gprId;
      redirect(`/product/${identifier}`);
    }
  }

  const results = query ? await searchProducts(query) : [];

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12">
      <h1 className="text-2xl font-semibold tracking-tight">Search products</h1>
      <div className="mt-6">
        <BarcodeSearchForm initialQuery={query} />
      </div>
      <div className="mt-8 space-y-4">
        {!query ? (
          <p className="text-sm text-muted-foreground">
            Try a GTIN such as <span className="font-mono">5901234567893</span> or a product name.
          </p>
        ) : results.length === 0 ? (
          <EmptyState
            title="Product not found"
            description="Nothing in the registry matched that query. You can still validate the identifier format and check digit, or file an ownership claim."
            actionLabel="Validate identifier"
            actionHref={`/validate?q=${encodeURIComponent(query)}`}
          />
        ) : (
          results.map((product) => (
            <ProductResultCard key={product.gprId} product={product} />
          ))
        )}
      </div>
    </div>
  );
}
