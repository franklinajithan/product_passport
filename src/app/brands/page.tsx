import Link from "next/link";
import { prisma } from "@/database/client";
import { PageContainer, SectionHeading } from "@/components/layout/page-container";
import { EmptyState } from "@/components/feedback/empty-state";

export default async function PublicBrandsPage() {
  const brands = await prisma.brand.findMany({
    include: {
      organisation: true,
      _count: { select: { products: true } },
    },
    orderBy: { name: "asc" },
  });

  return (
    <PageContainer className="py-16">
      <SectionHeading
        eyebrow="Brands"
        title="Brand identities in the registry"
        description="The brand owner allocates GTINs. The manufacturer may be a different organisation."
      />
      {brands.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No brands yet" description="Brands appear when organisations publish trade items." />
        </div>
      ) : (
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {brands.map((brand) => (
            <article key={brand.id} className="rounded-2xl border border-border p-6">
              <h2 className="font-semibold">{brand.name}</h2>
              <p className="mt-1 text-sm text-muted-foreground">{brand.organisation.name}</p>
              <p className="mt-3 text-sm">{brand._count.products} products</p>
              <Link href="/products" className="mt-4 inline-block text-sm hover:underline">
                View products
              </Link>
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
