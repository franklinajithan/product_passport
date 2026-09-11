import { redirect } from "next/navigation";
import { BarcodeSearchForm } from "@/components/marketing/barcode-search-form";
import { ProductResultCard } from "@/components/products/product-result-card";
import { EmptyState } from "@/components/feedback/empty-state";
import { searchProducts, findProductByGtin } from "@/services/product.service";
import { looksLikeBarcode } from "@/utilities/gtin";

export default async function SearchPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";

  if (query && looksLikeBarcode(query)) {
    const exact = await findProductByGtin(query);
    if (exact) {
      const identifier = exact.barcodes.find((item) => item.isPrimary)?.value ?? exact.gprId;
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
            description="Nothing in the registry matched that query. Manufacturers can add the product after signing in. Consumers and retailers can report a missing product from the scanner page."
            actionLabel="Scan a barcode"
            actionHref="/scan"
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
