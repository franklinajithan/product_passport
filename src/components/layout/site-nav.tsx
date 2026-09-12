"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
      <PageContainer className="flex h-16 items-center justify-between gap-4">
        <Link href="/" className="flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-[11px] font-semibold text-primary-foreground">
            GPR
          </span>
          <span className="hidden text-sm font-semibold sm:inline">{APP_NAME}</span>
        </Link>

        {!app ? (
          <nav className="hidden items-center gap-5 text-sm lg:flex">
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
          <form action="/search" method="get" className="hidden max-w-md flex-1 md:block">
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

        <div className="flex items-center gap-1">
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/search">Search</Link>
          </Button>
          <Button variant="ghost" asChild className="hidden sm:inline-flex">
            <Link href="/scan">Scan</Link>
          </Button>
          <ThemeToggle />
          {user ? (
            <UserMenu email={user.email} name={user.name} role={user.role} />
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/login">Sign in</Link>
              </Button>
              <Button asChild>
                <Link href="/register">Register company</Link>
              </Button>
            </>
          )}
          {!app ? (
            <Button variant="ghost" size="icon" className="lg:hidden" onClick={() => setOpen((value) => !value)}>
              <span className="sr-only">Menu</span>
              <span aria-hidden className="text-lg leading-none">
                ☰
              </span>
            </Button>
          ) : null}
        </div>
      </PageContainer>
      {open && !app ? (
        <div className="border-t border-border lg:hidden">
          <PageContainer className="flex flex-col gap-2 py-4">
            {PUBLIC_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="py-1 text-sm" onClick={() => setOpen(false)}>
                {item.label}
              </Link>
            ))}
          </PageContainer>
        </div>
      ) : null}
    </header>
  );
}
