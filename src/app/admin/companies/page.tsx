import { prisma } from "@/database/client";
import { OrganisationReviewActions } from "@/features/admin/components/organisation-review-actions";
import { SuspendForm } from "@/features/admin/components/suspend-form";
import { OrganisationStatusBadge } from "@/components/feedback/status-badges";
import { formatDate } from "@/utilities/format";

export default async function AdminCompaniesPage() {
  const companies = await prisma.organisation.findMany({
    include: { country: true, _count: { select: { products: true, members: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Companies</h1>
      <div className="mt-6 space-y-4">
        {companies.map((company) => (
          <article key={company.id} className="rounded-xl border border-border p-5">
            <div className="flex flex-wrap items-start justify-between gap-3">
              <div>
                <h2 className="font-semibold">{company.name}</h2>
                <p className="text-sm text-muted-foreground">
                  {company.legalName} · {company.country.name} · {company._count.products} products
                </p>
                <p className="mt-1 text-xs text-muted-foreground">
                  Created {formatDate(company.createdAt)}
                </p>
              </div>
              <OrganisationStatusBadge status={company.status} />
            </div>
            {company.status === "PENDING_VERIFICATION" ? (
              <div className="mt-4">
                <OrganisationReviewActions organisationId={company.id} />
              </div>
            ) : (
              <div className="mt-4">
                <SuspendForm id={company.id} entity="organisation" />
              </div>
            )}
          </article>
        ))}
      </div>
    </div>
  );
}
