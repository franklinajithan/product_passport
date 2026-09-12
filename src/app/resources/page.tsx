import Link from "next/link";
import { PageContainer, SectionHeading } from "@/components/layout/page-container";
import { STANDARDS_PAGES, TOOL_PAGES } from "@/data/demo-showcase";

export default function ResourcesPage() {
  return (
    <PageContainer className="py-16">
      <SectionHeading
        eyebrow="Resources"
        title="Guides, tools and the design system"
      />
      <div className="mt-10 grid gap-4 md:grid-cols-3">
        <Link href="/standards" className="rounded-2xl border border-border p-6 hover:bg-muted/40">
          <h2 className="font-semibold">Standards centre</h2>
          <p className="mt-2 text-sm text-muted-foreground">{STANDARDS_PAGES.length} topic pages</p>
        </Link>
        <Link href="/tools/gtin-validator" className="rounded-2xl border border-border p-6 hover:bg-muted/40">
          <h2 className="font-semibold">Identifier tools</h2>
          <p className="mt-2 text-sm text-muted-foreground">{TOOL_PAGES.length} working utilities</p>
        </Link>
        <Link href="/design-system" className="rounded-2xl border border-border p-6 hover:bg-muted/40">
          <h2 className="font-semibold">Design system</h2>
          <p className="mt-2 text-sm text-muted-foreground">Typography, badges, tables and platform blocks</p>
        </Link>
      </div>
    </PageContainer>
  );
}
