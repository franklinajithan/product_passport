import Link from "next/link";
import { Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { DEMO_LABEL, DEMO_PASSPORT } from "@/data/demo-showcase";
import { PageContainer } from "@/components/layout/page-container";

export function HeroSearch() {
  return (
    <form action="/search" method="get" className="w-full">
      <label htmlFor="hero-search" className="sr-only">
        Search GTIN, EAN, UPC, brand or product name
      </label>
      <div className="flex flex-col gap-3 rounded-2xl border border-border bg-background p-2 shadow-sm sm:flex-row sm:items-center">
        <div className="flex flex-1 items-center gap-2 px-3">
          <Search className="h-4 w-4 text-muted-foreground" aria-hidden />
          <input
            id="hero-search"
            name="q"
            placeholder="Search GTIN, EAN, UPC, brand or product name"
            className="h-12 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoComplete="off"
          />
        </div>
        <div className="flex gap-2">
          <Button type="submit" size="lg">
            Search
          </Button>
          <Button asChild variant="outline" size="lg">
            <Link href="/scan">Scan barcode</Link>
          </Button>
        </div>
      </div>
    </form>
  );
}

export function HeroPassportCard({ barcodeSvg }: { barcodeSvg?: string | null }) {
  const item = DEMO_PASSPORT;
  return (
    <article className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <div className="flex items-center justify-between border-b border-border px-5 py-3">
        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Product passport
        </p>
        <Badge variant="outline">{DEMO_LABEL.split("—")[0].trim()}</Badge>
      </div>
      <div className="aspect-[4/3] bg-muted">
        {barcodeSvg ? (
          <div
            className="flex h-full items-center justify-center bg-white p-6 dark:bg-zinc-100"
            dangerouslySetInnerHTML={{ __html: barcodeSvg }}
          />
        ) : (
          <div className="flex h-full items-center justify-center text-sm text-muted-foreground">
            EAN-13 symbol for GTIN {item.gtin}
          </div>
        )}
      </div>
      <div className="space-y-3 p-5">
        <div>
          <p className="text-lg font-semibold">{item.name}</p>
          <p className="text-sm text-muted-foreground">English: {item.englishName}</p>
        </div>
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">GTIN</dt>
            <dd className="mt-1 font-mono">{item.gtin}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Brand</dt>
            <dd className="mt-1">{item.brand}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Net content</dt>
            <dd className="mt-1">{item.netContent}</dd>
          </div>
          <div>
            <dt className="text-xs uppercase tracking-wide text-muted-foreground">Carrier</dt>
            <dd className="mt-1">{item.carrier}</dd>
          </div>
        </dl>
        <div className="flex flex-wrap gap-2">
          <Badge variant="success">Manufacturer verified</Badge>
          <Badge variant="success">GTIN format valid</Badge>
          <Badge>2D-ready architecture</Badge>
        </div>
        <p className="text-xs text-muted-foreground">
          Packaging: each · inner pack · case · pallet. QR / Digital Link path: /01/{item.canonicalGTIN14}
        </p>
      </div>
    </article>
  );
}

export function HomeHero({ barcodeSvg }: { barcodeSvg?: string | null }) {
  return (
    <section className="border-b border-border bg-[radial-gradient(circle_at_top_left,hsl(var(--muted)),transparent_55%)]">
      <PageContainer className="grid gap-16 py-20 lg:grid-cols-[1.15fr_0.85fr] lg:items-center lg:py-28">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">
            Global product identity network
          </p>
          <h1 className="mt-5 max-w-3xl text-5xl font-semibold tracking-tight sm:text-6xl lg:text-[4.5rem] lg:leading-[1.05]">
            One product.
            <br />
            One trusted identity.
            <br />
            Everywhere.
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-muted-foreground">
            The global product identity network where manufacturers publish verified product
            information once and make it available to retailers, developers, supply chains and
            consumers worldwide.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Button asChild size="lg">
              <Link href="/search">Search a product</Link>
            </Button>
            <Button asChild size="lg" variant="secondary">
              <Link href="/register">Register a company</Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/developers">Explore developer API</Link>
            </Button>
          </div>
          <div className="mt-10">
            <HeroSearch />
          </div>
        </div>
        <HeroPassportCard barcodeSvg={barcodeSvg} />
      </PageContainer>
    </section>
  );
}
