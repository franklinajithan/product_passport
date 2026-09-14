"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import { Menu, X } from "lucide-react";
import { APP_NAME } from "@/utilities/constants";
import { PUBLIC_NAV } from "@/data/demo-showcase";
import { ThemeToggle } from "@/components/layout/theme-toggle";
import { UserMenu } from "@/components/layout/user-menu";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { cn } from "@/utilities/cn";
import type { UserRole } from "@prisma/client";

function isAppPath(pathname: string) {
  return (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/organisation")
  );
}

export function SiteHeaderNav({
  user,
}: {
  user: { email: string; name: string | null; role: UserRole } | null;
}) {
  const pathname = usePathname();
  const app = isAppPath(pathname);
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 border-b border-border/80 bg-background/90 backdrop-blur">
      <PageContainer className="flex h-16 min-w-0 items-center justify-between gap-2 sm:gap-4">
        <Link href="/" className="flex min-w-0 shrink-0 items-center gap-2">
          <span className="flex h-10 w-10 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground sm:h-8 sm:w-8">
            GPR
          </span>
          <span className="hidden truncate text-sm font-semibold sm:inline">{APP_NAME}</span>
        </Link>

        {!app ? (
          <nav className="hidden items-center gap-5 text-sm xl:flex">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "text-muted-foreground transition-colors hover:text-foreground",
                  pathname === item.href || pathname.startsWith(`${item.href}/`)
                    ? "font-medium text-foreground"
                    : null,
                )}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        ) : (
          <form action="/search" method="get" className="hidden max-w-md min-w-0 flex-1 md:block">
            <label htmlFor="workspace-search" className="sr-only">
              Search products
            </label>
            <input
              id="workspace-search"
              name="q"
              placeholder="Search GTIN, brand or product"
              className="h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
            />
          </form>
        )}

        <div className="flex shrink-0 items-center gap-1">
          <Button variant="ghost" asChild className="hidden xl:inline-flex">
            <Link href="/search">Search</Link>
          </Button>
          <Button variant="ghost" asChild className="hidden xl:inline-flex">
            <Link href="/scan">Scan</Link>
          </Button>
          <ThemeToggle className="h-11 w-11" />
          {user ? (
            <UserMenu email={user.email} name={user.name} role={user.role} />
          ) : (
            <>
              <Button variant="ghost" asChild className="hidden xl:inline-flex">
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild className="hidden xl:inline-flex">
                <Link href="/register">Register company</Link>
              </Button>
              <Button asChild className="h-11 px-3 xl:hidden">
                <Link href="/register">Register</Link>
              </Button>
            </>
          )}
          {!app ? (
            <Button
              variant="ghost"
              size="icon"
              className="h-11 w-11 xl:hidden"
              aria-expanded={open}
              aria-controls="mobile-nav"
              onClick={() => setOpen((value) => !value)}
            >
              <span className="sr-only">{open ? "Close menu" : "Open menu"}</span>
              {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          ) : null}
        </div>
      </PageContainer>
      {open && !app ? (
        <div id="mobile-nav" className="border-t border-border xl:hidden">
          <PageContainer className="flex flex-col py-3">
            {PUBLIC_NAV.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="flex min-h-11 items-center py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setOpen(false)}
              >
                {item.label}
              </Link>
            ))}
            <Link
              href="/search"
              className="flex min-h-11 items-center py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setOpen(false)}
            >
              Search
            </Link>
            <Link
              href="/scan"
              className="flex min-h-11 items-center py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              onClick={() => setOpen(false)}
            >
              Scan barcode
            </Link>
            {!user ? (
              <Link
                href="/login"
                className="flex min-h-11 items-center py-2 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                onClick={() => setOpen(false)}
              >
                Sign in
              </Link>
            ) : null}
          </PageContainer>
        </div>
      ) : null}
    </header>
  );
}
