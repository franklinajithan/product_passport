import Link from "next/link";
import { prisma } from "@/database/client";
import { ProductStatusBadge } from "@/components/feedback/status-badges";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";

export default async function AdminProductsPage() {
  const products = await prisma.product.findMany({
    include: {
      translations: true,
      organisation: true,
      barcodes: { where: { isPrimary: true }, take: 1 },
    },
    orderBy: { createdAt: "desc" },
    take: 100,
  });

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
      <div className="mt-6 rounded-xl border border-border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Product</TableHead>
              <TableHead>Organisation</TableHead>
              <TableHead>Identifier</TableHead>
              <TableHead>Status</TableHead>
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
                    <Link href={`/product/${identifier}`} className="hover:underline">
                      {name}
                    </Link>
                  </TableCell>
                  <TableCell>{product.organisation.name}</TableCell>
                  <TableCell className="font-mono text-xs">{identifier}</TableCell>
                  <TableCell>
                    <ProductStatusBadge status={product.status} />
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
