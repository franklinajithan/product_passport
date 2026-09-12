import Link from "next/link";
import { prisma } from "@/database/client";
import { PageContainer, SectionHeading } from "@/components/layout/page-container";
import { EmptyState } from "@/components/feedback/empty-state";
import { ProductStatusBadge, VerificationBadge } from "@/components/feedback/status-badges";

export default async function PublicProductsPage() {
  const products = await prisma.product.findMany({
    where: { status: { in: ["ACTIVE", "DISCONTINUED", "RECALLED"] } },
    include: {
      brand: true,
      translations: true,
      barcodes: { where: { isPrimary: true }, take: 1 },
      identifiers: { take: 1 },
    },
    orderBy: { updatedAt: "desc" },
    take: 50,
  });

  return (
    <PageContainer className="py-16">
      <SectionHeading
        eyebrow="Registry"
        title="Products"
        description="Public trade-item records. Search stays on /search; this index lists published items."
      />
      {products.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No published products" description="Manufacturers can register a company and publish trade items." />
        </div>
      ) : (
        <div className="mt-10 divide-y rounded-2xl border border-border">
          {products.map((product) => {
            const name =
              product.translations.find((item) => item.languageCode === "en")?.productName ??
              product.translations[0]?.productName ??
              product.gprId;
            const gtin = product.barcodes[0]?.value ?? product.identifiers[0]?.displayValue ?? product.gprId;
            return (
              <Link key={product.id} href={`/product/${gtin}`} className="flex flex-wrap items-center justify-between gap-3 px-5 py-4 hover:bg-muted/40">
                <div>
                  <p className="font-medium">{name}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.brand.name} · {gtin}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <ProductStatusBadge status={product.status} />
                  <VerificationBadge level={product.verification} lastVerifiedAt={product.lastVerifiedAt} />
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
