import Link from "next/link";
import { PageContainer, SectionHeading } from "@/components/layout/page-container";
import { STANDARDS_PAGES, TOOL_PAGES } from "@/data/demo-showcase";
import { gtinIssuanceDisclaimer } from "@/lib/standards/identifiers/namespace";

export default function StandardsIndexPage() {
  return (
    <PageContainer className="py-16">
      <SectionHeading
        eyebrow="Standards centre"
        title="How identification works on this platform"
        description="Operational rules live in a framework-independent engine. This site is not GS1 and does not issue official GTINs."
      />
      <div className="mt-10 grid gap-4 md:grid-cols-2">
        {STANDARDS_PAGES.map((page) => (
          <Link key={page.href} href={page.href} className="rounded-2xl border border-border p-6 hover:bg-muted/40">
            <h2 className="font-semibold">{page.title}</h2>
            <p className="mt-2 text-sm text-muted-foreground">{page.body}</p>
          </Link>
        ))}
      </div>
      <h2 className="mt-14 text-lg font-semibold">Public tools</h2>
      <div className="mt-4 flex flex-wrap gap-2">
        {TOOL_PAGES.map((tool) => (
          <Link key={tool.href} href={tool.href} className="rounded-full border border-border px-4 py-2 text-sm hover:bg-muted">
            {tool.title}
          </Link>
        ))}
      </div>
      <p className="mt-10 text-xs text-muted-foreground">{gtinIssuanceDisclaimer()}</p>
    </PageContainer>
  );
}
