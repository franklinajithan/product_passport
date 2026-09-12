import Link from "next/link";
import { requireWorkspace } from "@/authentication/workspace";
import { prisma } from "@/database/client";
import { ownershipLabel } from "@/lib/standards/identifiers/ownership";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { formatDate } from "@/utilities/format";
import { RetireIdentifierButton } from "@/features/products/components/retire-identifier-button";

export default async function IdentifierManagerPage() {
  const { membership } = await requireWorkspace();
  const identifiers = await prisma.productIdentifier.findMany({
    where: { organisationId: membership.organisationId },
    include: { product: { include: { translations: true } } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Identifiers</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        GTINs allocated to {membership.organisation.name}. Retired identifiers stay in history.
      </p>
      {identifiers.length === 0 ? (
        <div className="mt-8">
          <EmptyState title="No identifiers" description="Allocated GTINs appear here after product publication." />
        </div>
      ) : (
        <div className="mt-6 rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Identifier</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Product</TableHead>
                <TableHead>Check digit</TableHead>
                <TableHead>Ownership</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Created</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {identifiers.map((item) => {
                const name =
                  item.product?.translations.find((row) => row.languageCode === "en")?.productName ??
                  item.product?.translations[0]?.productName ??
                  "Unlinked";
                return (
                  <TableRow key={item.id}>
                    <TableCell className="font-mono text-xs">{item.displayValue}</TableCell>
                    <TableCell>{item.identifierType}</TableCell>
                    <TableCell>{name}</TableCell>
                    <TableCell>{item.checkDigitValid ? "Valid" : "Invalid"}</TableCell>
                    <TableCell>{ownershipLabel(item.ownershipStatus)}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{item.status}</Badge>
                    </TableCell>
                    <TableCell className="text-xs">{formatDate(item.createdAt)}</TableCell>
                    <TableCell className="space-x-2 text-xs">
                      <Link href={`/validate?q=${item.displayValue}`} className="hover:underline">
                        Validate
                      </Link>
                      {item.product ? (
                        <Link href={`/product/${item.displayValue}`} className="hover:underline">
                          View product
                        </Link>
                      ) : null}
                      <Link href={`/tools/barcode-generator`} className="hover:underline">
                        Generate symbol
                      </Link>
                      <Link href={`/validate?q=${encodeURIComponent(item.displayValue)}`} className="hover:underline">
                        Review ownership
                      </Link>
                      <RetireIdentifierButton identifierId={item.id} retired={item.status === "RETIRED"} />
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
}
