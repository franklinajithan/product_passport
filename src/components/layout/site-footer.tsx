import Link from "next/link";
import { APP_NAME } from "@/utilities/constants";

export function SiteFooter() {
  return (
    <footer className="mt-auto border-t border-border bg-muted/30">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-10 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm font-semibold">{APP_NAME}</p>
          <p className="mt-2 max-w-sm text-sm text-muted-foreground">
            Manufacturer-controlled product identity for retailers, developers and
            consumers worldwide.
          </p>
        </div>
        <div className="grid grid-cols-2 gap-8 text-sm">
          <div className="flex flex-col gap-2">
            <Link href="/search" className="hover:underline">
              Search products
            </Link>
            <Link href="/scan" className="hover:underline">
              Barcode scanner
            </Link>
            <Link href="/developers" className="hover:underline">
              Developer API
            </Link>
          </div>
          <div className="flex flex-col gap-2">
            <Link href="/register" className="hover:underline">
              Register a company
            </Link>
            <Link href="/login" className="hover:underline">
              Sign in
            </Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
