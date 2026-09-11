import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/authentication/session";
import { getMembershipForUser } from "@/services/organisation.service";
import { prisma } from "@/database/client";
import { EmptyState } from "@/components/feedback/empty-state";
import { ProductStatusBadge } from "@/components/feedback/status-badges";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function ProductsPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    redirect("/organisation/setup");
  }

  const products = await prisma.product.findMany({
    where: { organisationId: membership.organisationId },
    include: {
      translations: true,
      barcodes: { where: { isPrimary: true }, take: 1 },
      brand: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  if (products.length === 0) {
    return (
      <EmptyState
        title="No products yet"
        description="When the product wizard is enabled for your organisation, new items will appear here. Seeded demo data is available on the public search if you are exploring the platform."
      />
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Only products owned by {membership.organisation.name} are listed.
      </p>
      <div className="mt-6 rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Brand</TableHead>
              <TableHead>GTIN / ID</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Completeness</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {products.map((product) => {
              const name =
                product.translations.find((item) => item.languageCode === "en")?.productName ??
                product.translations[0]?.productName ??
                product.gprId;
              const identifier = product.barcodes[0]?.value ?? product.gprId;
              return (
                <TableRow key={product.id}>
                  <TableCell>
                    <Link href={`/product/${identifier}`} className="font-medium hover:underline">
                      {name}
                    </Link>
                  </TableCell>
                  <TableCell>{product.brand.name}</TableCell>
                  <TableCell className="font-mono text-xs">{identifier}</TableCell>
                  <TableCell>
                    <ProductStatusBadge status={product.status} />
                  </TableCell>
                  <TableCell>{product.completenessScore}%</TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
