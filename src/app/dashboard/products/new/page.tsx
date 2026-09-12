import Link from "next/link";
import { requireWorkspace } from "@/authentication/workspace";
import { prisma } from "@/database/client";
import { canEditOrganisationProducts } from "@/authentication/permissions";
import { ProductWizard } from "@/features/products/components/product-wizard";
import { EmptyState } from "@/components/feedback/empty-state";

export default async function NewProductPage({
  searchParams,
}: {
  searchParams: Promise<{ variantOf?: string }>;
}) {
  const { user, membership } = await requireWorkspace();
  const canEdit = canEditOrganisationProducts(
    user,
    membership.role,
    membership.organisationId,
    membership.organisationId,
  );
  const params = await searchParams;

  const [brands, manufacturers, categories, languages, countries, variantParent] = await Promise.all([
    prisma.brand.findMany({
      where: { organisationId: membership.organisationId },
      orderBy: { name: "asc" },
    }),
    prisma.manufacturer.findMany({
      where: {
        OR: [
          { organisationId: membership.organisationId },
          { products: { some: { organisationId: membership.organisationId } } },
        ],
      },
      orderBy: { name: "asc" },
    }),
    prisma.category.findMany({ orderBy: { name: "asc" } }),
    prisma.language.findMany({ orderBy: { name: "asc" } }),
    prisma.country.findMany({ orderBy: { name: "asc" } }),
    params.variantOf
      ? prisma.product.findFirst({
          where: { id: params.variantOf, organisationId: membership.organisationId },
          include: { translations: true },
        })
      : Promise.resolve(null),
  ]);

  if (!canEdit) {
    return (
      <EmptyState
        title="Read-only workspace"
        description="Your role can view products but cannot create or edit them."
      />
    );
  }

  if (brands.length === 0 || manufacturers.length === 0) {
    return (
      <EmptyState
        title="Brand and manufacturer required"
        description="Add a brand during organisation setup before creating trade items."
        actionLabel="Organisation settings"
        actionHref="/organisation"
      />
    );
  }

  return (
    <div>
      <p className="text-sm text-muted-foreground">
        <Link href="/dashboard/products" className="hover:underline">
          Products
        </Link>{" "}
        / {params.variantOf ? "Create variant" : "Create product"}
      </p>
      <h1 className="mt-2 text-2xl font-semibold tracking-tight">
        {params.variantOf ? "Create variant" : "Create product"}
      </h1>
      <p className="mt-1 text-sm text-muted-foreground">
        Enter an allocated GTIN if you have one. This platform does not issue official GS1 identifiers.
      </p>
      <div className="mt-8">
        <ProductWizard
          brands={brands.map((item) => ({ id: item.id, label: item.name }))}
          manufacturers={manufacturers.map((item) => ({ id: item.id, label: item.name }))}
          categories={categories.map((item) => ({ id: item.id, label: item.name }))}
          languages={languages.map((item) => ({ id: item.code, label: `${item.name} (${item.code})` }))}
          countries={countries.map((item) => ({ id: item.id, label: item.name }))}
          variantOfProductId={variantParent?.id}
          variantLabelDefault={
            variantParent
              ? `Variant of ${variantParent.translations.find((row) => row.languageCode === "en")?.productName ?? variantParent.gprId}`
              : undefined
          }
        />
      </div>
    </div>
  );
}
