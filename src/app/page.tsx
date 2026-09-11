import Link from "next/link";
import { BarcodeSearchForm } from "@/components/marketing/barcode-search-form";
import { Button } from "@/components/ui/button";

const features = [
  {
    title: "Global Product Database",
    body: "One canonical record per product, identified by GTIN or a clearly labelled internal GPR ID.",
  },
  {
    title: "Manufacturer Verified",
    body: "Verified brand owners control the source of truth. Community data never outranks manufacturer data.",
  },
  {
    title: "Multilingual Product Data",
    body: "Names, ingredients and instructions live in a translation table — not duplicated language columns.",
  },
  {
    title: "Developer API",
    body: "A versioned REST API for POS, ecommerce and apps. GraphQL can be added without changing the data model.",
  },
  {
    title: "Retail Integration",
    body: "Retailers search, scan and subscribe to product data instead of re-keying catalogues by hand.",
  },
  {
    title: "Product Transparency",
    body: "Ingredients, allergens, nutrition, packaging and certifications — visible to anyone with a barcode.",
  },
];

export default function HomePage() {
  return (
    <div>
      <section className="border-b border-border bg-muted/20">
        <div className="mx-auto grid w-full max-w-6xl gap-12 px-4 py-20 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
          <div>
            <p className="text-sm font-medium text-primary">Global Product Registry</p>
            <h1 className="mt-4 max-w-xl text-4xl font-semibold tracking-tight sm:text-5xl">
              One product. One identity. Available everywhere.
            </h1>
            <p className="mt-5 max-w-xl text-base leading-7 text-muted-foreground">
              The global platform where manufacturers publish verified product information once
              and make it available to retailers, developers and consumers everywhere.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Button asChild>
                <Link href="/search">Search a Product</Link>
              </Button>
              <Button asChild variant="secondary">
                <Link href="/register">Register Your Company</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/developers">Developer API</Link>
              </Button>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background p-6 shadow-sm">
            <h2 className="text-sm font-semibold">Look up a product</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              Search the live registry by barcode or name.
            </p>
            <div className="mt-4">
              <BarcodeSearchForm size="hero" />
            </div>
          </div>
        </div>
      </section>

      <section className="mx-auto w-full max-w-6xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {features.map((feature) => (
            <article key={feature.title} className="rounded-xl border border-border bg-card p-6">
              <h2 className="text-base font-semibold">{feature.title}</h2>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">{feature.body}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  );
}
