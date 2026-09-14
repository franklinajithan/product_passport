import Link from "next/link";
import {
  ArrowDown,
  ArrowRight,
  Code2,
  Factory,
  Landmark,
  Store,
  Truck,
  Users,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import {
  DEMO_LABEL,
  DEMO_PACKAGING,
  DEMO_PASSPORT,
  DEMO_PRODUCT_DISCLAIMER,
  DEMO_TRANSLATIONS,
} from "@/data/demo-showcase";
import {
  CompactIdentityGraph,
  PackCase,
  PackConsumer,
  PackInner,
  PackPallet,
  ScanPhone,
} from "@/components/marketing/home/section-visuals";

function SectionEyebrow({ children, invert = false }: { children: string; invert?: boolean }) {
  return (
    <p
      className={`text-[11px] font-semibold tracking-[0.22em] ${
        invert ? "text-cyan-200" : "text-cyan-800"
      }`}
    >
      {children}
    </p>
  );
}

const AUDIENCE = [
  {
    icon: Factory,
    title: "Manufacturers",
    detail: "Publish and manage trusted product data.",
    href: "/register",
  },
  {
    icon: Store,
    title: "Retailers",
    detail: "Access accurate product information.",
    href: "/products",
  },
  {
    icon: Code2,
    title: "Developers",
    detail: "Build with our API.",
    href: "/developers",
  },
  {
    icon: Truck,
    title: "Supply Chains",
    detail: "Improve traceability and efficiency.",
    href: "/standards/packaging",
  },
  {
    icon: Users,
    title: "Consumers",
    detail: "Make informed choices.",
    href: "/search",
  },
  {
    icon: Landmark,
    title: "Regulators",
    detail: "Support compliance and safety.",
    href: "/standards",
  },
] as const;

function AudienceSection() {
  return (
    <section className="border-b border-slate-200 bg-white py-10 sm:py-12 lg:py-14">
      <PageContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionEyebrow>BUILT FOR A MORE CONNECTED WORLD</SectionEyebrow>
            <h2 className="mt-2 max-w-2xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl lg:text-[2.5rem] lg:leading-[1.12]">
              Trusted product data for everyone in the value chain.
            </h2>
          </div>
          <Button asChild variant="outline" className="h-11 rounded-sm">
            <Link href="/standards">Learn more about GPR</Link>
          </Button>
        </div>

        <div className="mt-8 grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          {AUDIENCE.map(({ icon: Icon, title, detail, href }) => (
            <Link
              key={title}
              href={href}
              className="rounded-md border border-slate-200 bg-white px-4 py-5 shadow-[0_8px_24px_-18px_rgba(6,21,43,0.35)] transition-colors hover:border-cyan-200 hover:bg-sky-50/40 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300"
            >
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-md bg-sky-50 text-sky-700">
                <Icon className="h-5 w-5" aria-hidden />
              </span>
              <h3 className="mt-4 text-base font-semibold text-slate-900">{title}</h3>
              <p className="mt-1 text-sm leading-6 text-slate-600">{detail}</p>
            </Link>
          ))}
        </div>
      </PageContainer>
    </section>
  );
}

const SCAN_STORY = [
  "Product identity and attributes",
  "Brand and manufacturer details",
  "Packaging hierarchy",
  "Ingredients and nutrition",
  "Market and regulatory information",
  "Linked data across the supply chain",
];

function BarcodeIntelligenceSection() {
  return (
    <section className="border-b border-slate-200 bg-slate-50 py-10 sm:py-14 lg:py-16">
      <PageContainer className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.95fr)_minmax(0,0.7fr)_minmax(0,1.05fr)]">
        <div>
          <SectionEyebrow>BARCODE INTELLIGENCE</SectionEyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Scan. Identify. Explore.
          </h2>
          <p className="mt-4 max-w-md text-sm leading-6 text-slate-600">
            Look up any barcode to get instant access to product information, company details,
            packaging hierarchy and more. The registry stores GTIN identity separately from the
            EAN, UPC, QR or Digital Link that carries it.
          </p>
          <Button asChild className="mt-6 h-11 w-full rounded-sm sm:w-auto">
            <Link href="/search">Try a barcode search</Link>
          </Button>
        </div>

        <ScanPhone />

        <div className="grid gap-3">
          <article className="rounded-md border border-slate-200 bg-white p-5">
            <p className="text-base font-semibold text-slate-900">From barcode to full product story</p>
            <ul className="mt-3 space-y-1.5 text-sm text-slate-600">
              {SCAN_STORY.map((item) => (
                <li key={item} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-cyan-600" />
                  {item}
                </li>
              ))}
            </ul>
          </article>
          <article className="grid gap-3 rounded-md border border-slate-200 bg-white p-5 sm:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-slate-900">Supports EAN, UPC, GTIN, QR Codes and more</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                Carriers encode identity. They are not a second identifier.
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">Works across web, mobile and enterprise systems</p>
              <p className="mt-1 text-sm leading-6 text-slate-600">
                GS1 Digital Link is URI resolution, not another barcode type.
              </p>
            </div>
          </article>
        </div>
      </PageContainer>
    </section>
  );
}

const PACK_VISUALS = [PackConsumer, PackInner, PackCase, PackPallet];
const PACK_LABELS = ["Consumer Unit", "Multipack", "Case", "Pallet"] as const;
const PACK_CONTENTS = ["330 ml", "6 × 330 ml", "24 × 330 ml", "60 × case"] as const;

function PackagingHierarchySection() {
  return (
    <section className="border-b border-slate-200 bg-white py-10 sm:py-14 lg:py-16">
      <PageContainer>
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <SectionEyebrow>PACKAGING HIERARCHY</SectionEyebrow>
            <h2 className="mt-3 max-w-xl text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
              From can to consumer.
            </h2>
          </div>
          <div className="max-w-md">
            <p className="text-sm leading-6 text-slate-600">
              See how products connect across every packaging level in the global supply chain.
              A case does not reuse the consumer-unit GTIN. Logistics units may use an SSCC.
            </p>
            <Link
              href="/standards/packaging"
              className="mt-2 inline-flex min-h-11 items-center text-sm text-cyan-800 hover:text-slate-900"
            >
              Explore packaging data →
            </Link>
          </div>
        </div>

        <div className="mt-8 hidden md:grid md:grid-cols-[1fr_auto_1fr_auto_1fr_auto_1fr] md:items-start md:gap-2">
          {DEMO_PACKAGING.map((node, index) => {
            const Visual = PACK_VISUALS[index];
            return (
              <div key={`${node.level}-${node.gtin}`} className="contents">
                {index > 0 ? (
                  <div className="flex h-[7.5rem] flex-col items-center justify-center text-slate-400" aria-hidden>
                    <ArrowRight className="h-4 w-4" />
                    <span className="mt-2 bg-[#06152b] px-2 py-0.5 font-mono text-[11px] font-semibold tracking-wide text-cyan-200">
                      {node.quantityFromChild} ×
                    </span>
                  </div>
                ) : null}
                <article className="rounded-md border border-slate-200 bg-slate-50 px-3 py-4 text-center">
                  <div className="flex h-[5.75rem] items-end justify-center pb-1">
                    {Visual ? <Visual /> : null}
                  </div>
                  <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-slate-500">
                    {PACK_LABELS[index] ?? node.level}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{PACK_CONTENTS[index]}</p>
                  <p className="mt-1 break-all font-mono text-[11px] text-slate-500">{node.gtin}</p>
                  {node.note ? (
                    <p className="mt-1 text-[11px] font-medium text-amber-800">SSCC is not a GTIN.</p>
                  ) : null}
                  <Badge
                    variant="outline"
                    className="mt-2 rounded-sm border-slate-200 bg-white text-slate-700 dark:border-slate-200 dark:bg-white dark:text-slate-700"
                  >
                    {node.carrier}
                  </Badge>
                </article>
              </div>
            );
          })}
        </div>

        <ol className="mt-6 space-y-0 md:hidden">
          {DEMO_PACKAGING.map((node, index) => {
            const Visual = PACK_VISUALS[index];
            return (
              <li key={`${node.level}-${node.gtin}`}>
                {index > 0 ? (
                  <div className="flex flex-col items-center gap-1 py-2" aria-hidden>
                    <ArrowDown className="h-4 w-4 text-slate-400" />
                    <span className="bg-[#06152b] px-2 py-0.5 font-mono text-xs font-semibold tracking-wide text-cyan-200">
                      {node.quantityFromChild} ×
                    </span>
                  </div>
                ) : null}
                <article className="rounded-md border border-slate-200 bg-slate-50 px-4 py-4 text-center">
                  <div className="flex h-[5.5rem] items-end justify-center">
                    {Visual ? <Visual /> : null}
                  </div>
                  <p className="mt-3 text-[11px] font-semibold tracking-[0.16em] text-slate-500">
                    {PACK_LABELS[index] ?? node.level}
                  </p>
                  <p className="mt-1 text-sm font-medium text-slate-900">{PACK_CONTENTS[index]}</p>
                  <p className="mt-1 break-all font-mono text-sm text-slate-600">{node.gtin}</p>
                  {node.note ? (
                    <p className="mt-1 text-xs font-medium text-amber-800">
                      SSCC is not a GTIN. It identifies the logistics unit, not the product.
                    </p>
                  ) : null}
                </article>
              </li>
            );
          })}
        </ol>
        <p className="mt-4 text-xs leading-5 text-slate-500">{DEMO_PRODUCT_DISCLAIMER}</p>
        <p className="mt-1 text-xs text-slate-400">{DEMO_LABEL}</p>
      </PageContainer>
    </section>
  );
}

const COMPLETENESS_CATEGORIES = [
  { label: "Identity", value: 100 },
  { label: "Packaging", value: 40 },
  { label: "Translations", value: 20 },
  { label: "Ingredients", value: 100 },
  { label: "Allergens", value: 0 },
  { label: "Nutrition", value: 100 },
  { label: "Images", value: 50 },
  { label: "Certifications", value: 0 },
];

function GraphAndCompletenessSection() {
  const score = DEMO_PASSPORT.completeness;
  const translationNote = DEMO_TRANSLATIONS.some((row) => row.source === "MACHINE")
    ? "German name is machine-translated in the demonstration model."
    : null;

  return (
    <section className="border-b border-slate-200 bg-slate-50 py-10 sm:py-14 lg:py-16">
      <PageContainer className="grid gap-8 lg:grid-cols-2 lg:gap-12">
        <div>
          <SectionEyebrow>GLOBAL PRODUCT IDENTITY GRAPH</SectionEyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Connected data. Greater value.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            Link products, companies, brands and more to unlock new insights and opportunities.
            Manufacturer is not automatically the brand owner. Country of sale is not country of
            manufacture.
          </p>
          <Link
            href="/identifiers"
            className="mt-3 inline-flex min-h-11 items-center text-sm text-cyan-800 hover:text-slate-900"
          >
            Explore the graph →
          </Link>
          <div className="mt-6 rounded-md border border-slate-200 bg-white p-4 sm:p-6">
            <CompactIdentityGraph />
          </div>
        </div>

        <div>
          <SectionEyebrow>PRODUCT COMPLETENESS</SectionEyebrow>
          <h2 className="mt-3 text-3xl font-semibold tracking-tight text-slate-900 sm:text-4xl">
            Richer data. Bigger opportunities.
          </h2>
          <p className="mt-3 max-w-md text-sm leading-6 text-slate-600">
            A more complete product record helps everyone across the value chain. Completeness is
            not verification, and a valid GTIN structure is not official ownership.
          </p>

          <div className="mt-6 grid items-center gap-6 sm:grid-cols-[auto_1fr]">
            <div
              className="relative mx-auto h-40 w-40 rounded-full"
              style={{ background: `conic-gradient(#0891b2 ${score}%, #e2e8f0 0)` }}
              role="img"
              aria-label={`Demonstration completeness ${score} percent`}
            >
              <div className="absolute inset-3 flex flex-col items-center justify-center rounded-full bg-white">
                <span className="text-4xl font-semibold tracking-tight text-slate-900">{score}%</span>
                <span className="mt-1 max-w-[7rem] text-center text-[10px] font-semibold tracking-[0.08em] text-slate-500">
                  COMPLETE
                </span>
              </div>
            </div>
            <ul className="space-y-2.5">
              {COMPLETENESS_CATEGORIES.map((row) => (
                <li key={row.label}>
                  <div className="mb-1 flex items-center justify-between text-sm">
                    <span className="text-slate-800">{row.label}</span>
                    <span className="font-mono text-xs text-slate-500">{row.value}%</span>
                  </div>
                  <div className="h-1.5 overflow-hidden bg-slate-100">
                    <div
                      className={`h-full ${row.value === 0 ? "bg-slate-300" : row.value < 80 ? "bg-amber-400" : "bg-cyan-700"}`}
                      style={{ width: `${row.value}%` }}
                    />
                  </div>
                </li>
              ))}
            </ul>
          </div>

          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <article className="rounded-md bg-white px-4 py-3 ring-1 ring-slate-200">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">COMPLETENESS</p>
              <p className="mt-1 text-sm leading-5 text-slate-600">How much information is present.</p>
            </article>
            <article className="rounded-md bg-white px-4 py-3 ring-1 ring-slate-200">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-slate-500">VERIFICATION</p>
              <p className="mt-1 text-sm font-semibold text-slate-900">
                {DEMO_PASSPORT.verification.replaceAll("_", " ")}
              </p>
            </article>
            <article className="rounded-md bg-[#06152b] px-4 py-3 text-white">
              <p className="text-[11px] font-semibold tracking-[0.14em] text-cyan-200">STRUCTURE</p>
              <p className="mt-1 text-sm font-semibold">GTIN STRUCTURE VALID</p>
            </article>
          </div>
          {translationNote ? <p className="mt-4 text-sm text-slate-500">{translationNote}</p> : null}
        </div>
      </PageContainer>
      <PageContainer>
        <p className="mt-6 text-xs leading-5 text-slate-500">{DEMO_PRODUCT_DISCLAIMER}</p>
        <p className="mt-1 text-xs text-slate-400">{DEMO_LABEL}</p>
      </PageContainer>
    </section>
  );
}

function TwoDMigrationSection() {
  return (
    <section className="border-b border-slate-200 bg-white py-8 sm:py-10">
      <PageContainer className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
        <div>
          <SectionEyebrow>1D TO 2D</SectionEyebrow>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Identity remains. The carrier can evolve.
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-6 text-slate-600">
            Moving from EAN-13 to GS1 QR or GS1 DataMatrix does not replace the GTIN. Demonstration
            2D readiness for this record is {DEMO_PASSPORT.twoDReadiness}%.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <span className="bg-cyan-50 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-cyan-800">
            IDENTITY REMAINS
          </span>
          <span className="bg-slate-100 px-3 py-1.5 text-[11px] font-semibold tracking-[0.14em] text-slate-600">
            DATA CARRIER EVOLVES
          </span>
          <Button asChild variant="outline" className="h-11 rounded-sm">
            <Link href="/standards/2d-migration">Check 2D readiness</Link>
          </Button>
        </div>
      </PageContainer>
    </section>
  );
}

export function HomePlatformSections() {
  return (
    <>
      <AudienceSection />
      <BarcodeIntelligenceSection />
      <PackagingHierarchySection />
      <GraphAndCompletenessSection />
      <TwoDMigrationSection />
    </>
  );
}
