import Link from "next/link";
import { Prisma, ProductStatus, VerificationLevel } from "@prisma/client";
import { requireWorkspace } from "@/authentication/workspace";
import { canEditOrganisationProducts } from "@/authentication/permissions";
import { prisma } from "@/database/client";
import { EmptyState } from "@/components/feedback/empty-state";
import { ProductStatusBadge } from "@/components/feedback/status-badges";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/utilities/format";
import { ProductRowActions } from "@/features/products/components/product-row-actions";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; status?: string; verification?: string; brand?: string }>;
}) {
  const { user, membership } = await requireWorkspace();
  const canEdit = canEditOrganisationProducts(
    user,
    membership.role,
    membership.organisationId,
    membership.organisationId,
  );
  const params = await searchParams;
  const query = params.q?.trim() ?? "";
  const status = Object.values(ProductStatus).includes(params.status as ProductStatus)
    ? (params.status as ProductStatus)
    : undefined;
  const verification = Object.values(VerificationLevel).includes(params.verification as VerificationLevel)
    ? (params.verification as VerificationLevel)
    : undefined;

  const where: Prisma.ProductWhereInput = {
    organisationId: membership.organisationId,
    ...(status ? { status } : {}),
    ...(verification ? { verification } : {}),
    ...(params.brand ? { brand: { slug: params.brand } } : {}),
    ...(query
      ? {
          OR: [
            { gprId: { contains: query, mode: "insensitive" } },
            { sku: { contains: query, mode: "insensitive" } },
            { translations: { some: { productName: { contains: query, mode: "insensitive" } } } },
            { brand: { name: { contains: query, mode: "insensitive" } } },
            { barcodes: { some: { value: { contains: query } } } },
            { identifiers: { some: { displayValue: { contains: query } } } },
          ],
        }
      : {}),
  };

  const [products, brands] = await Promise.all([
    prisma.product.findMany({
      where,
      include: {
        translations: true,
        barcodes: { where: { isPrimary: true }, take: 1 },
        brand: true,
        identifiers: { take: 1 },
        digitalLinks: { take: 1 },
        measurement: true,
      },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.brand.findMany({
      where: { organisationId: membership.organisationId },
      orderBy: { name: "asc" },
    }),
  ]);

  return (
    <div>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Products</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Only products owned by {membership.organisation.name} are listed.
          </p>
        </div>
        {canEdit ? (
          <Button asChild>
            <Link href="/dashboard/products/new">Create product</Link>
          </Button>
        ) : null}
      </div>

      <form className="mt-6 grid gap-3 rounded-xl border border-border p-4 md:grid-cols-4" method="get">
        <input
          name="q"
          defaultValue={query}
          placeholder="GTIN, name, brand or SKU"
          className="h-10 rounded-md border px-3 text-sm md:col-span-2"
        />
        <select name="status" defaultValue={params.status ?? ""} className="h-10 rounded-md border px-3 text-sm">
          <option value="">All statuses</option>
          {["DRAFT", "ACTIVE", "DISCONTINUED", "RECALLED", "SUPERSEDED"].map((status) => (
            <option key={status} value={status}>
              {status}
            </option>
          ))}
        </select>
        <select
          name="verification"
          defaultValue={params.verification ?? ""}
          className="h-10 rounded-md border px-3 text-sm"
        >
          <option value="">All verification</option>
          {["COMMUNITY", "DISTRIBUTOR_VERIFIED", "MANUFACTURER_VERIFIED"].map((level) => (
            <option key={level} value={level}>
              {level.replaceAll("_", " ")}
            </option>
          ))}
        </select>
        <select name="brand" defaultValue={params.brand ?? ""} className="h-10 rounded-md border px-3 text-sm">
          <option value="">All brands</option>
          {brands.map((brand) => (
            <option key={brand.id} value={brand.slug}>
              {brand.name}
            </option>
          ))}
        </select>
        <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm text-primary-foreground">
          Filter
        </button>
      </form>

      {products.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No products match"
            description="Create a draft trade item, then add an allocated GTIN if the brand owner has one."
            actionLabel={canEdit ? "Create product" : undefined}
            actionHref={canEdit ? "/dashboard/products/new" : undefined}
          />
        </div>
      ) : (
        <div className="mt-6 overflow-x-auto rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>GTIN</TableHead>
                <TableHead>Brand</TableHead>
                <TableHead>Net content</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Verification</TableHead>
                <TableHead>Completeness</TableHead>
                <TableHead>2D ready</TableHead>
                <TableHead>Modified</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map((product) => {
                const name =
                  product.translations.find((item) => item.languageCode === "en")?.productName ??
                  product.translations[0]?.productName ??
                  product.gprId;
                const identifier =
                  product.barcodes[0]?.value ?? product.identifiers[0]?.displayValue ?? product.gprId;
                const net =
                  product.measurement?.netWeightValue != null
                    ? `${product.measurement.netWeightValue.toString()} ${product.measurement.netWeightUnit ?? ""}`
                    : "—";
                return (
                  <TableRow key={product.id}>
                    <TableCell>
                      <Link href={`/product/${identifier}`} className="font-medium hover:underline">
                        {name}
                      </Link>
                    </TableCell>
                    <TableCell className="font-mono text-xs">{identifier}</TableCell>
                    <TableCell>{product.brand.name}</TableCell>
                    <TableCell className="text-xs">{net}</TableCell>
                    <TableCell>
                      <ProductStatusBadge status={product.status} />
                    </TableCell>
                    <TableCell className="text-xs">{product.verification.replaceAll("_", " ")}</TableCell>
                    <TableCell>{product.completenessScore}%</TableCell>
                    <TableCell>{product.digitalLinks.length > 0 ? "Yes" : "No"}</TableCell>
                    <TableCell className="text-xs">{formatDate(product.updatedAt)}</TableCell>
                    <TableCell>
                      <ProductRowActions
                        productId={product.id}
                        publicPath={`/product/${identifier}`}
                        canEdit={canEdit}
                        retired={product.status === "DISCONTINUED" || product.status === "WITHDRAWN"}
                      />
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
