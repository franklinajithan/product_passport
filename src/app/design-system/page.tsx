import { PageContainer, SectionHeading } from "@/components/layout/page-container";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { EmptyState } from "@/components/feedback/empty-state";
import { Skeleton } from "@/components/ui/skeleton";
import { GtinDecisionBadge } from "@/components/platform/gtin-decision";
import { PackagingHierarchy } from "@/components/platform/packaging-hierarchy";
import { StatCard } from "@/components/feedback/stat-card";
import { ProductStatusBadge } from "@/components/feedback/status-badges";

export default function DesignSystemPage() {
  return (
    <PageContainer className="space-y-16 py-16">
      <SectionHeading eyebrow="Design system" title="Platform primitives" />

      <section>
        <h2 className="text-lg font-semibold">Typography</h2>
        <p className="mt-4 text-5xl font-semibold tracking-tight">Hero 60–72px</p>
        <p className="mt-2 text-3xl font-semibold">Section 30–36px</p>
        <p className="mt-2 text-base text-muted-foreground">Body copy for standards and product data.</p>
      </section>

      <section className="flex flex-wrap gap-2">
        <Button>Primary</Button>
        <Button variant="secondary">Secondary</Button>
        <Button variant="outline">Outline</Button>
        <Button variant="ghost">Ghost</Button>
      </section>

      <section className="max-w-sm">
        <Input placeholder="GTIN, EAN, UPC or name" />
      </section>

      <section className="flex flex-wrap gap-2">
        <Badge variant="success">Manufacturer verified</Badge>
        <Badge variant="warning">Ownership not verified</Badge>
        <ProductStatusBadge status="ACTIVE" />
        <GtinDecisionBadge decision="NEW_GTIN_REQUIRED" />
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <StatCard label="Active products" value={12} hint="From this organisation" />
        <Card>
          <CardHeader>
            <CardTitle>Product card</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-muted-foreground">GTIN · brand · net content</CardContent>
        </Card>
        <EmptyState title="Empty state" description="Used when a manufacturer has no records yet." />
      </section>

      <section>
        <div className="rounded-xl border border-border">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Product</TableHead>
                <TableHead>GTIN</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow>
                <TableCell>Extra Butter</TableCell>
                <TableCell className="font-mono">5901234567893</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </div>
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <PackagingHierarchy />
        <div className="space-y-2">
          <Skeleton className="h-8 w-1/2" />
          <Skeleton className="h-24 w-full" />
        </div>
      </section>
    </PageContainer>
  );
}
