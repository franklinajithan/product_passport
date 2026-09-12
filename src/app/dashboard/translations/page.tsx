import { requireWorkspace } from "@/authentication/workspace";
import { prisma } from "@/database/client";
import { Badge } from "@/components/ui/badge";
import { EmptyState } from "@/components/feedback/empty-state";
import { TranslationForm } from "@/features/products/components/translation-form";

export default async function TranslationsManagerPage({
  searchParams,
}: {
  searchParams: Promise<{ language?: string; source?: string }>;
}) {
  const { membership } = await requireWorkspace();
  const params = await searchParams;
  const [translations, products, languages] = await Promise.all([
    prisma.productTranslation.findMany({
      where: {
        product: { organisationId: membership.organisationId },
        ...(params.language ? { languageCode: params.language } : {}),
        ...(params.source ? { translationSource: params.source } : {}),
      },
      include: { product: { include: { barcodes: { take: 1 } } } },
      orderBy: { languageCode: "asc" },
    }),
    prisma.product.findMany({
      where: { organisationId: membership.organisationId },
      include: { translations: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.language.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div>
      <h1 className="text-2xl font-semibold tracking-tight">Translations</h1>
      <p className="mt-1 text-sm text-muted-foreground">
        ISO language codes. Machine translation is never silently mixed with manufacturer text.
      </p>
      <form className="mt-6 flex flex-wrap gap-3" method="get">
        <select name="language" defaultValue={params.language ?? ""} className="h-10 rounded-md border px-3 text-sm">
          <option value="">All languages</option>
          {languages.map((language) => (
            <option key={language.code} value={language.code}>
              {language.name}
            </option>
          ))}
        </select>
        <select name="source" defaultValue={params.source ?? ""} className="h-10 rounded-md border px-3 text-sm">
          <option value="">All sources</option>
          <option value="MANUFACTURER">Manufacturer verified</option>
          <option value="HUMAN_VERIFIED">Human verified</option>
          <option value="MACHINE">Machine translated</option>
        </select>
        <button type="submit" className="h-10 rounded-md bg-primary px-4 text-sm text-primary-foreground">
          Filter
        </button>
      </form>
      {translations.length === 0 ? (
        <div className="mt-8">
          <EmptyState
            title="No translations"
            description="Language records appear after a product is created. Machine-translated rows stay labelled until a human or manufacturer confirms them."
          />
        </div>
      ) : (
        <div className="mt-6 divide-y rounded-xl border border-border">
          {translations.map((row) => (
            <div key={row.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
              <div>
                <p className="font-medium">{row.productName}</p>
                <p className="text-muted-foreground">
                  {row.languageCode} · {row.product.barcodes[0]?.value ?? row.productId}
                </p>
              </div>
              <Badge variant="outline">
                {row.translationSource.replaceAll("_", " ")}
                {row.isOriginalLanguage ? " · original" : ""}
              </Badge>
            </div>
          ))}
        </div>
      )}
      <TranslationForm
        products={products.map((product) => ({
          id: product.id,
          label:
            product.translations.find((row) => row.languageCode === "en")?.productName ??
            product.translations[0]?.productName ??
            product.gprId,
        }))}
        languages={languages.map((language) => ({
          id: language.code,
          label: `${language.name} (${language.code})`,
        }))}
      />
    </div>
  );
}
