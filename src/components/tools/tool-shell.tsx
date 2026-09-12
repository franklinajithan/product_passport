import type { ReactNode } from "react";
import Link from "next/link";
import { PageContainer } from "@/components/layout/page-container";
import { TOOL_PAGES } from "@/data/demo-showcase";
import { gtinIssuanceDisclaimer } from "@/lib/standards/identifiers/namespace";

export function ToolShell({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: ReactNode;
}) {
  return (
    <PageContainer className="grid gap-10 py-16 lg:grid-cols-[220px_1fr]">
      <aside>
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">Tools</p>
        <nav className="mt-3 flex flex-col gap-2 text-sm">
          {TOOL_PAGES.map((tool) => (
            <Link key={tool.href} href={tool.href} className="text-muted-foreground hover:text-foreground">
              {tool.title}
            </Link>
          ))}
        </nav>
      </aside>
      <div className="max-w-3xl space-y-6">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
        {children}
        <p className="text-xs text-muted-foreground">{gtinIssuanceDisclaimer()}</p>
      </div>
    </PageContainer>
  );
}
