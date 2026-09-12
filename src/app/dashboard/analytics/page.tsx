import { requireWorkspace } from "@/authentication/workspace";
import { getManufacturerDashboardData } from "@/services/product.service";
import {
  calculateCompleteness,
  completenessFromProduct,
  countByStatus,
} from "@/services/product-completeness.service";
import { StatCard } from "@/components/feedback/stat-card";

export default async function AnalyticsPage() {
  const { membership } = await requireWorkspace();
  const { products, apiRequests } = await getManufacturerDashboardData(membership.organisationId);
  const counts = countByStatus(products);
  const averageCompleteness =
    products.length === 0
      ? 0
      : Math.round(
          products
            .map((product) => calculateCompleteness(completenessFromProduct(product)).score)
            .reduce((sum, score) => sum + score, 0) / products.length,
        );

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Analytics</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Figures are for {membership.organisation.name} only — not invented platform-wide statistics.
      </p>
      <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Products" value={counts.total} />
        <StatCard label="Active" value={counts.active} />
        <StatCard label="Average completeness" value={`${averageCompleteness}%`} />
        <StatCard label="API requests this month" value={apiRequests} />
      </div>
      <div className="mt-8 space-y-3">
        <Bar label="Active" value={counts.active} total={counts.total || 1} />
        <Bar label="Draft" value={counts.draft} total={counts.total || 1} />
        <Bar label="Incomplete" value={counts.incomplete} total={counts.total || 1} />
      </div>
    </div>
  );
}

function Bar({ label, value, total }: { label: string; value: number; total: number }) {
  const width = Math.round((value / total) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full bg-primary" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
