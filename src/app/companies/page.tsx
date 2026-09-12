import Link from "next/link";
import { prisma } from "@/database/client";
import { PageContainer, SectionHeading } from "@/components/layout/page-container";
import { OrganisationStatusBadge } from "@/components/feedback/status-badges";
import { EmptyState } from "@/components/feedback/empty-state";

export default async function PublicCompaniesPage() {
  const organisations = await prisma.organisation.findMany({
    include: { country: true, _count: { select: { products: true, brands: true } } },
    orderBy: { name: "asc" },
  });

  return (
    <PageContainer className="py-16">
      <SectionHeading
        eyebrow="Companies"
        title="Brand owners, manufacturers, distributors and retailers"
        description="A manufacturer is not automatically the brand owner. Company prefix does not identify country of manufacture."
      />
      {organisations.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No companies yet" description="Register a company to appear here after verification." />
        </div>
      ) : (
        <div className="mt-10 grid gap-4 md:grid-cols-2">
          {organisations.map((org) => (
            <article key={org.id} className="rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{org.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {org.legalName} · {org.type.replaceAll("_", " ")} · {org.country.name}
                  </p>
                </div>
                <OrganisationStatusBadge status={org.status} />
              </div>
              <p className="mt-4 text-sm text-muted-foreground">
                {org._count.brands} brands · {org._count.products} products
              </p>
              <Link href={`/register`} className="mt-4 inline-block text-sm hover:underline">
                Register your company
              </Link>
            </article>
          ))}
        </div>
      )}
    </PageContainer>
  );
}
