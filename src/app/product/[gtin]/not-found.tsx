import Link from "next/link";

export default function ProductNotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 text-center">
      <h1 className="text-2xl font-semibold">Product not found</h1>
      <p className="mt-3 text-sm text-muted-foreground">
        That barcode is not in the registry yet.
      </p>
      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:justify-center">
        <Link href="/register" className="rounded-md bg-primary px-4 py-2 text-sm text-primary-foreground">
          Manufacturers: add this product
        </Link>
        <Link href="/scan" className="rounded-md border border-border px-4 py-2 text-sm">
          Report a missing product
        </Link>
        <Link href="/search" className="rounded-md border border-border px-4 py-2 text-sm">
          Search again
        </Link>
      </div>
    </div>
  );
}
