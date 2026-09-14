"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { APP_NAME } from "@/utilities/constants";
import { PUBLIC_NAV, STANDARDS_PAGES, TOOL_PAGES } from "@/data/demo-showcase";
import { PageContainer } from "@/components/layout/page-container";
import { gtinIssuanceDisclaimer } from "@/lib/standards/identifiers/namespace";

export function SiteFooter() {
  const pathname = usePathname();
  if (
    pathname.startsWith("/dashboard") ||
    pathname.startsWith("/admin") ||
    pathname.startsWith("/organisation")
  ) {
    return null;
  }

  return (
    <footer className="mt-auto border-t border-border bg-[hsl(222_47%_8%)] text-white">
      <PageContainer className="grid gap-8 py-10 lg:grid-cols-[1.2fr_2fr] lg:gap-10 lg:py-16">
        <div>
          <p className="text-sm font-semibold">{APP_NAME}</p>
          <p className="mt-3 max-w-sm text-sm leading-6 text-white/65">
            Create once. Verify once. Use everywhere. A product identity network for
            manufacturers, retailers, developers and consumers.
          </p>
        </div>
        <div className="grid gap-8 text-sm sm:grid-cols-2 xl:grid-cols-3">
          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/45">Platform</p>
            {PUBLIC_NAV.map((item) => (
              <Link key={item.href} href={item.href} className="flex min-h-11 items-center text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                {item.label}
              </Link>
            ))}
          </div>
          <div className="flex flex-col">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/45">Standards</p>
            {STANDARDS_PAGES.slice(0, 5).map((item) => (
              <Link key={item.href} href={item.href} className="flex min-h-11 items-center text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                {item.title}
              </Link>
            ))}
          </div>
          <div className="flex flex-col sm:col-span-2 xl:col-span-1">
            <p className="text-xs font-semibold uppercase tracking-wide text-white/45">Tools</p>
            {TOOL_PAGES.map((item) => (
              <Link key={item.href} href={item.href} className="flex min-h-11 items-center text-white/80 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cyan-300">
                {item.title}
              </Link>
            ))}
          </div>
        </div>
      </PageContainer>
      <PageContainer className="border-t border-white/10 py-6">
        <p className="max-w-4xl text-[13px] leading-6 text-white/50">{gtinIssuanceDisclaimer()}</p>
      </PageContainer>
    </footer>
  );
}
