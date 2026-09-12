import { requireWorkspace } from "@/authentication/workspace";
import { prisma } from "@/database/client";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatDate } from "@/utilities/format";

export default async function CertificationsPage() {
  const { membership } = await requireWorkspace();
  const rows = await prisma.productCertification.findMany({
    where: { product: { organisationId: membership.organisationId } },
    include: { certification: true, product: { include: { translations: true } } },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Certifications</h1>
      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No certifications" description="Expiring certificates will be listed here for attention." />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {rows.map((row) => (
            <li key={row.id} className="rounded-xl border border-border px-4 py-3 text-sm">
              {row.certification.name}
              {row.expiresAt ? ` · expires ${formatDate(row.expiresAt)}` : ""}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
