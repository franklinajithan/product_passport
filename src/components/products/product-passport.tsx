"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { PackagingHierarchy } from "@/components/platform/packaging-hierarchy";
import { GtinDecisionBadge } from "@/components/platform/gtin-decision";
import type { DemoPackNode } from "@/data/demo-showcase";
import type { GtinDecision } from "@/lib/standards/types";

export type ProductPassportView = {
  gtin: string | null;
  gtinType: string | null;
  canonicalGTIN14: string | null;
  checkDigitValid: boolean | null;
  ownership: string;
  carriers: string[];
  issuer: string | null;
  verification: string;
  name: string;
  englishName: string | null;
  originalName: string | null;
  brand: string;
  manufacturer: string;
  brandOwner: string | null;
  importer: string | null;
  origin: string | null;
  netContent: string | null;
  status: string;
  lastVerified: string | null;
  ingredients: string | null;
  allergens: string[];
  nutrition: Array<{ label: string; value: string }>;
  packaging: string | null;
  translations: Array<{ language: string; name: string; source: string }>;
  certifications: string[];
  countries: string[];
  digitalLink: string | null;
  history: Array<{ title: string; detail: string; decision: GtinDecision | null }>;
  packTree: DemoPackNode[];
  sku: string | null;
};

const TABS = [
  "overview",
  "identity",
  "translations",
  "ingredients",
  "allergens",
  "nutrition",
  "packaging",
  "images",
  "certifications",
  "countries",
  "digital-link",
  "changes",
  "audit",
] as const;

export function ProductPassport({
  data,
  image,
}: {
  data: ProductPassportView;
  image?: { url: string; alt: string } | null;
}) {
  return (
    <Tabs defaultValue="overview">
      <TabsList>
        {TABS.map((tab) => (
          <TabsTrigger key={tab} value={tab} className="capitalize">
            {tab.replace("-", " ")}
          </TabsTrigger>
        ))}
      </TabsList>

      <TabsContent value="overview">
        <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
          <div className="flex h-72 items-center justify-center overflow-hidden rounded-xl border border-border bg-muted">
            {image ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img src={image.url} alt={image.alt} className="h-full w-full object-cover" />
            ) : (
              <span className="text-sm text-muted-foreground">No product image</span>
            )}
          </div>
          <dl className="grid gap-4 text-sm sm:grid-cols-2">
            <Item label="Product name" value={data.name} />
            <Item label="English name" value={data.englishName} />
            <Item label="Original-language name" value={data.originalName} />
            <Item label="GTIN" value={data.gtin} mono />
            <Item label="Brand" value={data.brand} />
            <Item label="Manufacturer" value={data.manufacturer} />
            <Item label="Brand owner" value={data.brandOwner} />
            <Item label="Importer" value={data.importer} />
            <Item label="Country of origin" value={data.origin} />
            <Item label="Net content" value={data.netContent} />
            <Item label="Status" value={data.status} />
            <Item label="Last verified" value={data.lastVerified} />
          </dl>
        </div>
      </TabsContent>

      <TabsContent value="identity">
        <dl className="grid gap-4 text-sm sm:grid-cols-2">
          <Item label="GTIN" value={data.gtin} mono />
          <Item label="GTIN type" value={data.gtinType} />
          <Item label="Canonical GTIN-14" value={data.canonicalGTIN14} mono />
          <Item label="Check digit" value={data.checkDigitValid == null ? null : data.checkDigitValid ? "Valid" : "Invalid"} />
          <Item label="Ownership verification" value={data.ownership} />
          <Item label="Barcode carriers" value={data.carriers.join(", ") || "None generated"} />
          <Item label="Issuer" value={data.issuer} />
          <Item label="Verification status" value={data.verification.replaceAll("_", " ")} />
          <Item label="SKU (internal, not a GTIN)" value={data.sku} />
        </dl>
      </TabsContent>

      <TabsContent value="translations">
        <ul className="divide-y rounded-xl border border-border">
          {data.translations.map((row) => (
            <li key={row.language} className="flex items-center justify-between px-4 py-3 text-sm">
              <span>
                <span className="font-mono text-xs uppercase text-muted-foreground">{row.language}</span>
                <span className="ml-3">{row.name}</span>
              </span>
              <Badge variant="outline">{row.source.replaceAll("_", " ")}</Badge>
            </li>
          ))}
        </ul>
      </TabsContent>

      <TabsContent value="ingredients">
        <p className="text-sm leading-6 text-muted-foreground">{data.ingredients ?? "No ingredients published yet."}</p>
      </TabsContent>

      <TabsContent value="allergens">
        <p className="text-sm leading-6 text-muted-foreground">
          {data.allergens.length === 0 ? "No allergen statements published yet." : data.allergens.join(", ")}
        </p>
      </TabsContent>

      <TabsContent value="nutrition">
        {data.nutrition.length === 0 ? (
          <p className="text-sm text-muted-foreground">No nutrition information published yet.</p>
        ) : (
          <ul className="grid grid-cols-2 gap-2 text-sm">
            {data.nutrition.map((row) => (
              <li key={row.label}>
                {row.label}: {row.value}
              </li>
            ))}
          </ul>
        )}
      </TabsContent>

      <TabsContent value="packaging">
        <p className="mb-4 text-sm text-muted-foreground">{data.packaging ?? "No packaging material published yet."}</p>
        {data.packTree.length > 0 ? <PackagingHierarchy nodes={data.packTree} /> : null}
      </TabsContent>

      <TabsContent value="images">
        {image ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={image.url} alt={image.alt} className="max-h-96 rounded-xl border border-border object-contain" />
        ) : (
          <p className="text-sm text-muted-foreground">No images on this record yet.</p>
        )}
      </TabsContent>

      <TabsContent value="certifications">
        <p className="text-sm text-muted-foreground">
          {data.certifications.length === 0 ? "No certifications attached." : data.certifications.join(", ")}
        </p>
      </TabsContent>

      <TabsContent value="countries">
        <p className="text-sm text-muted-foreground">
          {data.countries.length === 0 ? "Countries of sale are not specified." : data.countries.join(", ")}
        </p>
      </TabsContent>

      <TabsContent value="digital-link">
        <p className="font-mono text-sm">{data.digitalLink ?? "No Digital Link URI stored."}</p>
        <p className="mt-2 text-xs text-muted-foreground">
          A Digital Link is a URI using /01/{"{gtin14}"}. It is not a barcode image and is not an official GS1 service.
        </p>
      </TabsContent>

      <TabsContent value="changes">
        {data.history.length === 0 ? (
          <p className="text-sm text-muted-foreground">No recorded revisions yet.</p>
        ) : (
          <ol className="space-y-3">
            {data.history.map((row) => (
              <li key={row.title} className="rounded-xl border border-border p-4">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-medium">{row.title}</p>
                  {row.decision ? <GtinDecisionBadge decision={row.decision} /> : null}
                </div>
                <p className="mt-1 text-sm text-muted-foreground">{row.detail}</p>
              </li>
            ))}
          </ol>
        )}
      </TabsContent>

      <TabsContent value="audit">
        <p className="text-sm text-muted-foreground">
          Organisation audit entries for this trade item appear in the manufacturer audit log. Identifier history is
          retained when a GTIN is retired.
        </p>
      </TabsContent>
    </Tabs>
  );
}

function Item({ label, value, mono }: { label: string; value?: string | null; mono?: boolean }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className={mono ? "mt-1 font-mono text-xs sm:text-sm" : "mt-1"}>{value || "—"}</dd>
    </div>
  );
}
