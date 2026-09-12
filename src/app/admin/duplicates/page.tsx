import { prisma } from "@/database/client";
import { EmptyState } from "@/components/feedback/empty-state";

export default async function AdminDuplicatesPage() {
  const rows = await prisma.duplicateCandidate.findMany({
    include: { productA: { include: { translations: true } }, productB: { include: { translations: true } } },
    orderBy: { createdAt: "desc" },
    take: 50,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Duplicates</h1>
      {rows.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No duplicate candidates" description="Collision detection queues possible duplicate trade items here." />
        </div>
      ) : (
        <ul className="mt-6 space-y-3 text-sm">
          {rows.map((row) => (
            <li key={row.id} className="rounded-xl border border-border px-4 py-3">
              Score {row.score} · {row.status}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
