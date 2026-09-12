import { requireWorkspace } from "@/authentication/workspace";
import { prisma } from "@/database/client";
import { PackagingHierarchy } from "@/components/platform/packaging-hierarchy";
import { EmptyState } from "@/components/feedback/empty-state";
import { PackagingForm } from "@/features/products/components/packaging-form";

export default async function PackagingManagerPage() {
  const { membership } = await requireWorkspace();
  const [links, products] = await Promise.all([
    prisma.packagingHierarchy.findMany({
      where: {
        OR: [
          { parent: { organisationId: membership.organisationId } },
          { child: { organisationId: membership.organisationId } },
        ],
      },
      include: {
        parent: { include: { translations: true, barcodes: true } },
        child: { include: { translations: true, barcodes: true } },
      },
    }),
    prisma.product.findMany({
      where: { organisationId: membership.organisationId },
      include: { translations: true, barcodes: { take: 1 } },
      orderBy: { updatedAt: "desc" },
    }),
  ]);

  return (
    <div className="grid gap-10 lg:grid-cols-2">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Packaging</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Each, inner pack, case, tray, display and pallet are separate trade items. Do not reuse a
          consumer-unit GTIN on a case.
        </p>
        {links.length === 0 ? (
          <div className="mt-8">
            <EmptyState
              title="No hierarchy recorded yet"
              description="Demonstration tree on the right shows the intended model. Live links appear after you connect parent and child products."
            />
          </div>
        ) : (
          <ul className="mt-6 space-y-3 text-sm">
            {links.map((link) => (
              <li key={link.id} className="rounded-xl border border-border p-4">
                {link.packagingLevel.replaceAll("_", " ")} contains {link.quantity} × child
                <span className="mt-1 block font-mono text-xs">
                  {link.parentGtin ?? link.parent.barcodes[0]?.value} → {link.childGtin ?? link.child.barcodes[0]?.value}
                </span>
              </li>
            ))}
          </ul>
        )}
        <PackagingForm
          products={products.map((product) => ({
            id: product.id,
            label:
              product.translations.find((row) => row.languageCode === "en")?.productName ??
              product.translations[0]?.productName ??
              product.barcodes[0]?.value ??
              product.gprId,
          }))}
        />
      </div>
      <PackagingHierarchy
        nodes={
          links.length === 0
            ? undefined
            : links.flatMap((link, index) => {
                const parentName = link.parent.translations.find((row) => row.languageCode === "en")?.productName;
                const childName = link.child.translations.find((row) => row.languageCode === "en")?.productName;
                if (index === 0) {
                  return [
                    {
                      level: parentName ?? "Parent",
                      gtin: link.parentGtin ?? link.parent.barcodes[0]?.value ?? link.parent.gprId,
                      quantityFromChild: null,
                      carrier: link.parent.barcodes[0]?.type.replaceAll("_", "-") ?? "—",
                    },
                    {
                      level: childName ?? link.packagingLevel.replaceAll("_", " "),
                      gtin: link.childGtin ?? link.child.barcodes[0]?.value ?? link.child.gprId,
                      quantityFromChild: link.quantity,
                      carrier: link.child.barcodes[0]?.type.replaceAll("_", "-") ?? "—",
                    },
                  ];
                }
                return [
                  {
                    level: childName ?? link.packagingLevel.replaceAll("_", " "),
                    gtin: link.childGtin ?? link.child.barcodes[0]?.value ?? link.child.gprId,
                    quantityFromChild: link.quantity,
                    carrier: link.child.barcodes[0]?.type.replaceAll("_", "-") ?? "—",
                  },
                ];
              })
        }
      />
    </div>
  );
}
