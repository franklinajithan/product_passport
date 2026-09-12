import Link from "next/link";
import { notFound } from "next/navigation";
import { requireWorkspace } from "@/authentication/workspace";
import { canEditOrganisationProducts } from "@/authentication/permissions";
import { prisma } from "@/database/client";
import { ProductEditForm } from "@/features/products/components/product-edit-form";
import { EmptyState } from "@/components/feedback/empty-state";

export default async function EditProductPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { user, membership } = await requireWorkspace();
  const { id } = await params;
  const canEdit = canEditOrganisationProducts(
    user,
    membership.role,
    membership.organisationId,
    membership.organisationId,
  );
  const product = await prisma.product.findFirst({
    where: { id, organisationId: membership.organisationId },
    include: {
      brand: true,
      translations: true,
      barcodes: true,
      measurement: true,
    },
  });

  if (!product) {
    notFound();
  }

  if (!canEdit) {
    return (
      <EmptyState title="Read-only" description="Your role cannot edit this product." actionLabel="View products" actionHref="/dashboard/products" />
    );
  }

  const original =
    product.translations.find((row) => row.isOriginalLanguage) ?? product.translations[0];
  const english = product.translations.find((row) => row.languageCode === "en");
  const gtin = product.barcodes.find((row) => row.isPrimary)?.value ?? product.barcodes[0]?.value ?? null;
  const netValue = product.measurement?.netWeightValue?.toString() ?? "";

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        <Link href="/dashboard/products" className="hover:underline">
          Products
        </Link>{" "}
        / Edit
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {english?.productName ?? original?.productName ?? product.gprId}
      </h1>
      <p className="mt-1 font-mono text-xs text-muted-foreground">{gtin ?? product.gprId}</p>
      <div className="mt-8">
        <ProductEditForm
          productId={product.id}
          sku={product.sku ?? ""}
          originalName={original?.productName ?? ""}
          originalLanguageCode={original?.languageCode ?? "en"}
          englishName={english?.productName ?? ""}
          ingredients={original?.ingredients ?? english?.ingredients ?? ""}
          netContentValue={netValue}
          netContentUnit={product.measurement?.netWeightUnit ?? "G"}
          previous={{
            gtin,
            brand: product.brand.name,
            primaryBrand: product.brand.name,
            consumerFacingName: english?.productName ?? original?.productName ?? null,
            netContentValue: netValue ? Number(netValue) : null,
            netContentUnit: product.measurement?.netWeightUnit ?? null,
            packQuantity: 1,
            packagingLevel: "CONSUMER_UNIT",
          }}
          status={product.status}
          canPublish={membership.organisation.status === "VERIFIED"}
        />
      </div>
    </div>
  );
}
