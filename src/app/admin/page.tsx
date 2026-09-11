import { getAdminDashboardData } from "@/services/product.service";
import { StatCard } from "@/components/feedback/stat-card";
import { OrganisationReviewActions } from "@/features/admin/components/organisation-review-actions";
import { OrganisationStatusBadge } from "@/components/feedback/status-badges";

export default async function AdminDashboardPage() {
  const { stats, pendingOrganisations } = await getAdminDashboardData();

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Admin</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform operations, verification and audit.
        </p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total products" value={stats.totalProducts} />
        <StatCard label="Verified products" value={stats.verifiedProducts} />
        <StatCard label="Registered manufacturers" value={stats.manufacturers} />
        <StatCard label="Countries" value={stats.countries} />
        <StatCard label="API requests today" value={stats.apiRequestsToday} />
        <StatCard label="New products today" value={stats.newProductsToday} />
        <StatCard label="Pending verifications" value={stats.pendingCompanies} />
        <StatCard label="Pending claims" value={stats.pendingClaims} />
        <StatCard label="Users" value={stats.users} />
        <StatCard label="Open reports" value={stats.openReports} />
      </div>

      <section>
        <h2 className="mb-3 text-sm font-semibold">Pending company verifications</h2>
        {pendingOrganisations.length === 0 ? (
          <p className="text-sm text-muted-foreground">No companies waiting for review.</p>
        ) : (
          <div className="space-y-4">
            {pendingOrganisations.map((organisation) => (
              <article key={organisation.id} className="rounded-xl border border-border p-5">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <h3 className="font-semibold">{organisation.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {organisation.legalName} · {organisation.country.name}
                    </p>
                  </div>
                  <OrganisationStatusBadge status={organisation.status} />
                </div>
                <div className="mt-4">
                  <OrganisationReviewActions organisationId={organisation.id} />
                </div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
