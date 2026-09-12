import { prisma } from "@/database/client";
import { EmptyState } from "@/components/feedback/empty-state";
import { formatDate } from "@/utilities/format";

export default async function AdminApiClientsPage() {
  const keys = await prisma.aPIKey.findMany({
    include: { user: true, organisation: true },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">API clients</h1>
      {keys.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No API keys issued" description="Manufacturer-created keys are hashed and listed here for operations." />
        </div>
      ) : (
        <ul className="mt-6 space-y-3 text-sm">
          {keys.map((key) => (
            <li key={key.id} className="rounded-xl border border-border px-4 py-3">
              <p className="font-medium">{key.name}</p>
              <p className="text-muted-foreground">
                {key.keyPrefix}… · {key.organisation?.name ?? key.user.email} · {formatDate(key.createdAt)}
                {key.revokedAt ? " · revoked" : ""}
              </p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
