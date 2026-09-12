import { prisma } from "@/database/client";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";

export default async function AdminReportsPage() {
  const reports = await prisma.productReport.findMany({
    include: { product: { include: { translations: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Reports</h1>
      {reports.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No reports" description="Consumer and retailer data-quality reports appear here." />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {reports.map((report) => (
            <li key={report.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
              <span>{report.reason.replaceAll("_", " ")}</span>
              <Badge variant="outline">{report.status}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
