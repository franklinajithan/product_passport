import Link from "next/link";
import type { PublicProductCard } from "@/types";
import { Badge } from "@/components/ui/badge";
import { verificationLabel } from "@/services/product-completeness.service";

export function ProductResultCard({ product }: { product: PublicProductCard }) {
  return (
    <Link
      href={`/product/${product.gtin ?? product.gprId}`}
      className="flex gap-4 rounded-xl border border-border bg-card p-4 transition-colors hover:bg-muted/40"
    >
      <div className="flex h-24 w-24 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
        {product.imageUrl ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={product.imageUrl} alt="" className="h-full w-full object-cover" />
        ) : (
          <span className="px-2 text-center text-[11px] text-muted-foreground">No image</span>
        )}
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
          {product.brandName}
        </p>
        <h3 className="truncate text-base font-semibold">{product.name}</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          English: {product.englishName ?? "English translation missing"}
        </p>
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
          {product.netContent ? <span>{product.netContent}</span> : null}
          {product.originCountry ? <span>Made in {product.originCountry}</span> : null}
          <Badge variant={product.verification === "MANUFACTURER_VERIFIED" ? "success" : "secondary"}>
            {product.verification === "MANUFACTURER_VERIFIED" ? "✓ " : ""}
            {verificationLabel(product.verification)}
          </Badge>
        </div>
        <p className="mt-2 font-mono text-xs text-muted-foreground">
          {product.gtin ? `GTIN: ${product.gtin}` : `Internal ID: ${product.gprId}`}
        </p>
      </div>
    </Link>
  );
}
