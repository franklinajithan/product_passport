import Link from "next/link";
import { Search } from "lucide-react";

export function BarcodeSearchForm({
  initialQuery = "",
  size = "default",
  action = "/search",
}: {
  initialQuery?: string;
  size?: "default" | "hero";
  action?: string;
}) {
  return (
    <form action={action} method="get" className="w-full">
      <label htmlFor="product-search" className="sr-only">
        Search by GTIN, EAN, UPC or product name
      </label>
      <div
        className={
          size === "hero"
            ? "flex flex-col gap-3 rounded-xl border border-border bg-background p-2 shadow-sm sm:flex-row sm:items-center"
            : "flex items-center gap-2 rounded-lg border border-border bg-background px-3"
        }
      >
        <div className="flex flex-1 items-center gap-2 px-2">
          <Search className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden />
          <input
            id="product-search"
            name="q"
            defaultValue={initialQuery}
            placeholder="Search GTIN, EAN, UPC, brand or product name"
            className="h-11 w-full bg-transparent text-sm outline-none placeholder:text-muted-foreground"
            autoComplete="off"
          />
        </div>
        <button
          type="submit"
          className="inline-flex h-11 items-center justify-center rounded-lg bg-primary px-5 text-sm font-medium text-primary-foreground hover:bg-primary/90"
        >
          Search
        </button>
      </div>
      <p className="mt-2 text-xs text-muted-foreground">
        Spaces and hyphens in barcodes are ignored.{" "}
        <Link href="/scan" className="underline-offset-4 hover:underline">
          Scan with camera
        </Link>
        {" · "}
        <Link href="/validate" className="underline-offset-4 hover:underline">
          Validate an identifier
        </Link>
      </p>
    </form>
  );
}
