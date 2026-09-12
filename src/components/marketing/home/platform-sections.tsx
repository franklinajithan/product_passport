"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageContainer, SectionHeading } from "@/components/layout/page-container";
import { PackagingHierarchy } from "@/components/platform/packaging-hierarchy";
import { IdentityGraph } from "@/components/platform/identity-graph";
import { GtinDecisionBadge } from "@/components/platform/gtin-decision";
import {
  DEMO_LABEL,
  DEMO_PASSPORT,
  DEMO_TIMELINE,
  DEMO_TRANSLATIONS,
} from "@/data/demo-showcase";

function Meter({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span className="font-medium">{value}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${value}%` }} />
      </div>
    </div>
  );
}

export function HomePlatformSections() {
  const item = DEMO_PASSPORT;

  return (
    <>
      <section className="border-b border-border py-20">
        <PageContainer className="space-y-10">
          <SectionHeading
            eyebrow="Product passport"
            title="A single trade-item record, not a barcode image"
            description="Identifiers, carriers, parties and translations stay distinct. The preview below uses demonstration data modelled on the seeded Extra Butter record."
          />
          <Tabs defaultValue="overview">
            <TabsList>
              {[
                "overview",
                "identity",
                "ingredients",
                "allergens",
                "nutrition",
                "packaging",
                "translations",
                "certifications",
                "traceability",
                "history",
              ].map((tab) => (
                <TabsTrigger key={tab} value={tab} className="capitalize">
                  {tab}
                </TabsTrigger>
              ))}
            </TabsList>
            <TabsContent value="overview">
              <div className="grid gap-8 lg:grid-cols-[280px_1fr]">
                <div className="rounded-2xl border border-dashed border-border bg-muted/40 p-6 text-sm text-muted-foreground">
                  Product image lives on the trade-item record. This preview is labelled demonstration data.
                </div>
                <dl className="grid gap-4 sm:grid-cols-2 text-sm">
                  <Item label="Product name" value={item.name} />
                  <Item label="English name" value={item.englishName} />
                  <Item label="GTIN" value={item.gtin} />
                  <Item label="Brand" value={item.brand} />
                  <Item label="Brand owner" value={item.brandOwner} />
                  <Item label="Manufacturer" value={item.manufacturer} />
                  <Item label="Importer" value={item.importer} />
                  <Item label="Country of origin" value={item.origin} />
                  <Item label="Net content" value={item.netContent} />
                  <Item label="Status" value={item.status} />
                  <Item label="Last verified" value={item.lastVerified} />
                </dl>
              </div>
              <div className="mt-6 flex flex-wrap gap-2">
                <Badge variant="success">Manufacturer verified</Badge>
                <Badge variant="success">GTIN valid</Badge>
                <Badge variant="warning">Brand-owner allocation not GS1-verified</Badge>
              </div>
            </TabsContent>
            <TabsContent value="identity">
              <p className="text-sm leading-6 text-muted-foreground">
                GTIN {item.gtin} · type GTIN-13 · canonical GTIN-14 {item.canonicalGTIN14}. Check digit valid is not the same as official ownership.
              </p>
            </TabsContent>
            <TabsContent value="ingredients">
              <p className="text-sm">Pasteurised cream, starter cultures, salt.</p>
            </TabsContent>
            <TabsContent value="allergens">
              <p className="text-sm">Contains milk.</p>
            </TabsContent>
            <TabsContent value="nutrition">
              <p className="text-sm">Per 100 g: 741 kcal · fat 82 g · salt 1.1 g.</p>
            </TabsContent>
            <TabsContent value="packaging">
              <PackagingHierarchy />
            </TabsContent>
            <TabsContent value="translations">
              <ul className="divide-y rounded-xl border border-border">
                {DEMO_TRANSLATIONS.map((row) => (
                  <li key={row.code} className="flex items-center justify-between px-4 py-3 text-sm">
                    <span>
                      {row.language}: {row.name}
                    </span>
                    <Badge variant="outline">{row.source.replace("_", " ").toLowerCase()}</Badge>
                  </li>
                ))}
              </ul>
            </TabsContent>
            <TabsContent value="certifications">
              <p className="text-sm text-muted-foreground">Certification records attach to the product, not the barcode symbol.</p>
            </TabsContent>
            <TabsContent value="traceability">
              <p className="text-sm text-muted-foreground">
                Batch, serial and expiry are instance data (AIs 10, 21, 17). They do not create a new GTIN.
              </p>
            </TabsContent>
            <TabsContent value="history">
              <ol className="space-y-4">
                {DEMO_TIMELINE.map((event) => (
                  <li key={event.year} className="rounded-xl border border-border p-4">
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">{event.year}</p>
                    <p className="mt-1 font-medium">{event.title}</p>
                    <p className="mt-1 text-sm text-muted-foreground">{event.detail}</p>
                  </li>
                ))}
              </ol>
            </TabsContent>
          </Tabs>
        </PageContainer>
      </section>

      <section className="border-b border-border bg-muted/30 py-20">
        <PageContainer className="grid gap-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Barcode intelligence"
            title="Several validation layers, never a single VALID stamp"
            description="Structure, check digit, registry match and ownership are independent results."
          />
          <div className="rounded-2xl border border-border bg-background p-6">
            <dl className="space-y-3 text-sm">
              <Row k="GTIN" v={item.gtin} />
              <Row k="Structure" v="Valid GTIN-13" ok />
              <Row k="Check digit" v="Valid" ok />
              <Row k="Database" v="Product found" ok />
              <Row k="Owner" v="Manufacturer verified · allocation not GS1-verified" />
              <Row k="Status" v="Active" ok />
              <Row k="Carrier" v="EAN-13" />
            </dl>
            <p className="mt-5 text-xs text-muted-foreground">
              Possible carriers for a GTIN: EAN-13 · UPC-A · ITF-14 · GS1-128 · GS1 DataMatrix · GS1 QR
            </p>
            <Button asChild className="mt-6">
              <Link href="/tools/gtin-validator">Validate GTIN</Link>
            </Button>
          </div>
        </PageContainer>
      </section>

      <section className="border-b border-border py-20">
        <PageContainer className="grid gap-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Packaging hierarchy"
            title="Each level is a different trade item"
            description="A case does not reuse the consumer-unit GTIN. Logistics units may use SSCC rather than GTIN."
          />
          <PackagingHierarchy />
        </PageContainer>
      </section>

      <section className="border-b border-border bg-[hsl(222_47%_8%)] py-20 text-white">
        <PageContainer className="grid gap-12 lg:grid-cols-2">
          <SectionHeading
            invert
            eyebrow="Identity graph"
            title="Parties and packs are a network, not a single company field"
            description="Manufacturer is not automatically the brand owner. Country of sale is not country of manufacture."
          />
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
            <IdentityGraph />
          </div>
        </PageContainer>
      </section>

      <section className="border-b border-border py-20">
        <PageContainer>
          <SectionHeading
            eyebrow="Multilingual master data"
            title="Unlimited languages, no hardcoded language columns"
            description="ProductTranslation rows use ISO language codes. Machine translation is stored separately from manufacturer text."
          />
          <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {DEMO_TRANSLATIONS.map((row) => (
              <article key={row.code} className="rounded-2xl border border-border p-5">
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{row.language}</p>
                <p className="mt-2 text-lg font-medium">{row.name}</p>
                <Badge className="mt-3" variant="outline">
                  {row.source === "MANUFACTURER"
                    ? "Manufacturer supplied"
                    : row.source === "HUMAN_VERIFIED"
                      ? "Human verified"
                      : "Machine translated"}
                </Badge>
              </article>
            ))}
          </div>
        </PageContainer>
      </section>

      <section className="border-b border-border bg-muted/30 py-20">
        <PageContainer className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="Trust"
              title="Completeness, verification and standards are separate scores"
            />
            <p className="mt-4 text-xs text-muted-foreground">{DEMO_LABEL}</p>
            <div className="mt-8 space-y-4">
              <Meter label="Completeness" value={item.completeness} />
              <Meter label="Identity" value={100} />
              <Meter label="Manufacturer" value={100} />
              <Meter label="Images" value={90} />
              <Meter label="Ingredients" value={100} />
              <Meter label="Translations" value={70} />
              <Meter label="Packaging" value={90} />
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-6">
            <h3 className="text-sm font-semibold">Recommendations</h3>
            <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
              <li>Add German ingredients (currently machine-translated name only)</li>
              <li>Add a back-of-pack image</li>
              <li>Confirm outer-case GTIN ownership</li>
            </ul>
            <p className="mt-6 text-sm">
              Verification: {item.verification.replaceAll("_", " ")}
            </p>
          </div>
        </PageContainer>
      </section>

      <section className="border-b border-border py-20">
        <PageContainer className="grid gap-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Lifecycle"
            title="History is never destroyed when a GTIN is retired"
          />
          <ol className="relative space-y-6 border-l border-border pl-6">
            {DEMO_TIMELINE.map((event) => (
              <li key={event.year}>
                <span className="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full bg-primary" />
                <p className="text-xs uppercase tracking-wide text-muted-foreground">{event.year}</p>
                <p className="font-medium">{event.title}</p>
                <p className="text-sm text-muted-foreground">{event.detail}</p>
              </li>
            ))}
          </ol>
        </PageContainer>
      </section>

      <section className="border-b border-border bg-muted/30 py-20">
        <PageContainer>
          <SectionHeading
            eyebrow="GTIN change intelligence"
            title="Not every edit is a new GTIN. Not every edit keeps the same GTIN."
          />
          <div className="mt-10 grid gap-4 md:grid-cols-3">
            <article className="rounded-2xl border border-border bg-background p-5">
              <GtinDecisionBadge decision="SAME_GTIN" />
              <p className="mt-4 text-sm text-muted-foreground">Artwork refresh. Identification unchanged.</p>
            </article>
            <article className="rounded-2xl border border-border bg-background p-5">
              <GtinDecisionBadge decision="REVIEW_REQUIRED" />
              <p className="mt-4 text-sm text-muted-foreground">Consumer-facing name changed. Review before publish.</p>
            </article>
            <article className="rounded-2xl border border-border bg-background p-5">
              <GtinDecisionBadge decision="NEW_GTIN_REQUIRED" />
              <p className="mt-4 text-sm text-muted-foreground">
                You changed net quantity 500 g → 400 g. Direct replacement is blocked; create a successor.
              </p>
            </article>
          </div>
        </PageContainer>
      </section>

      <section className="border-b border-border py-20">
        <PageContainer className="grid gap-12 lg:grid-cols-2">
          <div>
            <SectionHeading
              eyebrow="1D to 2D"
              title="The identifier stays. The carrier can evolve."
            />
            <p className="mt-4 text-sm text-muted-foreground">
              Current retail carrier: EAN-13. Future: GS1 QR / GS1 DataMatrix carrying GTIN, batch, expiry, serial and Digital Link.
            </p>
            <Button asChild className="mt-6">
              <Link href="/standards/2d-migration">Create 2D migration plan</Link>
            </Button>
          </div>
          <div className="space-y-4 rounded-2xl border border-border p-6">
            <Meter label="2D readiness" value={item.twoDReadiness} />
            <ul className="space-y-2 text-sm">
              <li>✓ GTIN ready</li>
              <li>✓ Product data ready</li>
              <li>✓ Digital Link ready</li>
              <li>⚠ Batch support missing on this demo item</li>
              <li>✓ Expiry encoding supported by the AI parser</li>
            </ul>
          </div>
        </PageContainer>
      </section>

      <section className="border-b border-border bg-[hsl(222_47%_8%)] py-20">
        <PageContainer>
          <SectionHeading
            invert
            eyebrow="Digital Link"
            title="A URI, not a query-string barcode"
            description="https://example.com/01/05901234567893 can resolve to a product passport, ingredients, recall, traceability and language-specific pages. This platform is not GS1."
          />
          <div className="mt-10 grid gap-3 text-sm text-white/80 sm:grid-cols-4">
            {["GTIN", "Digital Link", "Product passport", "Ingredients / allergens / recall / languages"].map(
              (label, index) => (
                <div key={label} className="rounded-xl border border-white/10 px-4 py-5">
                  <p className="text-xs text-white/40">{String(index + 1).padStart(2, "0")}</p>
                  <p className="mt-2 font-medium text-white">{label}</p>
                </div>
              ),
            )}
          </div>
        </PageContainer>
      </section>

      <section className="border-b border-border py-20">
        <PageContainer className="grid gap-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Recall network"
            title="A recall updates the record, the API and the Digital Link"
          />
          <div className="rounded-2xl border border-border p-6 text-sm">
            <p>GTIN {item.gtin}</p>
            <p className="mt-2 text-muted-foreground">Batches, countries, reason, date and consumer instructions stay on the historical product.</p>
            <ul className="mt-4 space-y-1 text-muted-foreground">
              <li>Notify subscribed retailers</li>
              <li>Update API payloads</li>
              <li>Update Digital Link resolver</li>
              <li>Show a consumer warning</li>
            </ul>
            <Button asChild className="mt-6" variant="outline">
              <Link href="/dashboard/recalls">Open recall centre</Link>
            </Button>
          </div>
        </PageContainer>
      </section>

      <section className="border-b border-border bg-muted/30 py-20">
        <PageContainer>
          <SectionHeading
            eyebrow="Retailer subscriptions"
            title="Follow a product instead of re-keying it"
            description="Future event types include product.updated, product.recalled, gtin.retired, packaging.changed, certification.expired and translation.updated."
          />
          <article className="mt-10 max-w-xl rounded-2xl border border-border bg-background p-6">
            <Badge>PRODUCT UPDATED</Badge>
            <p className="mt-3 font-medium">ABC Butter 200g</p>
            <p className="text-sm text-muted-foreground">Ingredients changed by a verified manufacturer. Effective 18 September 2026.</p>
          </article>
        </PageContainer>
      </section>
    </>
  );
}

function Item({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{label}</dt>
      <dd className="mt-1">{value}</dd>
    </div>
  );
}

function Row({ k, v, ok }: { k: string; v: string; ok?: boolean }) {
  return (
    <div className="flex justify-between gap-4 border-b border-border py-2">
      <dt className="text-xs uppercase tracking-wide text-muted-foreground">{k}</dt>
      <dd>
        {ok ? "✓ " : null}
        {v}
      </dd>
    </div>
  );
}
