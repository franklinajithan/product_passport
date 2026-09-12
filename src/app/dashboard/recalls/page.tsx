import { requireWorkspace } from "@/authentication/workspace";
import { prisma } from "@/database/client";
import { EmptyState } from "@/components/feedback/empty-state";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/utilities/format";
import { RecallForm } from "./recall-form";
import Link from "next/link";

export default async function RecallsPage() {
  const { membership } = await requireWorkspace();
  const recalls = await prisma.productRecall.findMany({
    where: { product: { organisationId: membership.organisationId } },
    include: { product: { include: { barcodes: { take: 1 }, translations: true } }, countries: true },
    orderBy: { recalledAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Recall centre</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Recalls update the product record, API payload and Digital Link warning. Identifier history is retained.
      </p>
      <RecallForm />
      {recalls.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No recalls"
            description="When a recall is published, subscribed retailers and the public product page receive the warning."
          />
        </div>
      ) : (
        <ul className="mt-6 space-y-3">
          {recalls.map((recall) => (
            <li key={recall.id} className="rounded-xl border border-border p-4">
              <div className="flex items-center justify-between">
                <p className="font-medium">
                  {recall.product.translations[0]?.productName ?? recall.product.barcodes[0]?.value}
                </p>
                <Badge variant="destructive">{formatDate(recall.recalledAt)}</Badge>
              </div>
              <p className="mt-2 text-sm text-muted-foreground">{recall.reason}</p>
              <Link
                href={`/product/${recall.product.barcodes[0]?.value ?? recall.productId}`}
                className="mt-2 inline-block text-sm hover:underline"
              >
                View product
              </Link>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
