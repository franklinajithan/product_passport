import Link from "next/link";
import { prisma } from "@/database/client";
import { PageContainer, SectionHeading } from "@/components/layout/page-container";
import { Badge } from "@/components/ui/badge";
import { ownershipLabel } from "@/lib/standards/identifiers/ownership";
import { EmptyState } from "@/components/feedback/empty-state";

export default async function PublicIdentifiersPage() {
  const identifiers = await prisma.productIdentifier.findMany({
    include: { product: { include: { translations: true, brand: true } } },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <PageContainer className="py-16">
      <SectionHeading
        eyebrow="Identifiers"
        title="GTIN and internal identifier index"
        description="Official GTINs, Digital Links and internal SKUs live in separate namespaces. A valid check digit is not official ownership."
      />
      {identifiers.length === 0 ? (
        <div className="mt-10">
          <EmptyState title="No identifiers yet" description="Identifiers appear when manufacturers register allocated GTINs." />
        </div>
      ) : (
        <div className="mt-10 overflow-x-auto rounded-2xl border border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b text-left text-xs uppercase tracking-wide text-muted-foreground">
                <th className="px-4 py-3">Identifier</th>
                <th className="px-4 py-3">Type</th>
                <th className="px-4 py-3">Product</th>
                <th className="px-4 py-3">Check digit</th>
                <th className="px-4 py-3">Ownership</th>
                <th className="px-4 py-3">Status</th>
              </tr>
            </thead>
            <tbody>
              {identifiers.map((item) => (
                <tr key={item.id} className="border-b">
                  <td className="px-4 py-3 font-mono">
                    <Link href={`/validate?q=${encodeURIComponent(item.displayValue)}`} className="hover:underline">
                      {item.displayValue}
                    </Link>
                  </td>
                  <td className="px-4 py-3">{item.identifierType}</td>
                  <td className="px-4 py-3">
                    {item.product
                      ? item.product.translations.find((row) => row.languageCode === "en")?.productName ??
                        item.product.brand.name
                      : "—"}
                  </td>
                  <td className="px-4 py-3">{item.checkDigitValid ? "Valid" : "Invalid"}</td>
                  <td className="px-4 py-3">{ownershipLabel(item.ownershipStatus)}</td>
                  <td className="px-4 py-3">
                    <Badge variant="outline">{item.status}</Badge>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </PageContainer>
  );
}
