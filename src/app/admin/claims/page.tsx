import { prisma } from "@/database/client";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatDate } from "@/utilities/format";

export default async function AdminClaimsPage() {
  const [productClaims, identifierClaims] = await Promise.all([
    prisma.productClaim.findMany({ include: { organisation: true, product: true }, orderBy: { createdAt: "desc" }, take: 50 }),
    prisma.identifierClaim.findMany({ include: { organisation: true }, orderBy: { createdAt: "desc" }, take: 50 }),
  ]);

  const rows = [
    ...productClaims.map((item) => ({
      id: item.id,
      type: "PRODUCT",
      status: item.status,
      org: item.organisation.name,
      createdAt: item.createdAt,
    })),
    ...identifierClaims.map((item) => ({
      id: item.id,
      type: item.type,
      status: item.status,
      org: item.organisation.name,
      createdAt: item.createdAt,
    })),
  ].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Claims</h1>
      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No claims" description="Ownership and misassignment claims will queue here for investigation." />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="flex items-center justify-between rounded-xl border border-border px-4 py-3 text-sm">
              <span>
                {row.type} · {row.org} · {formatDate(row.createdAt)}
              </span>
              <Badge variant="outline">{row.status}</Badge>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
