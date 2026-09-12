import type { ReactNode } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { STANDARDS_PAGES } from "@/data/demo-showcase";
import { gtinIssuanceDisclaimer } from "@/lib/standards/identifiers/namespace";

export function StandardsArticle({
  title,
  children,
}: {
  title: string;
  children: ReactNode;
}) {
  return (
    <PageContainer className="grid gap-10 py-16 lg:grid-cols-[220px_1fr]">
      <aside>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Standards</p>
        <nav className="mt-3 flex flex-col gap-2 text-sm">
          <Link href="/standards">Overview</Link>
          {STANDARDS_PAGES.map((page) => (
            <Link key={page.href} href={page.href} className="text-muted-foreground hover:text-foreground">
              {page.title}
            </Link>
          ))}
        </nav>
      </aside>
      <article className="max-w-3xl space-y-4 text-sm leading-7 text-muted-foreground">
        <h1 className="text-3xl font-semibold tracking-tight text-foreground">{title}</h1>
        {children}
        <p className="text-xs">{gtinIssuanceDisclaimer()}</p>
      </article>
    </PageContainer>
  );
}
