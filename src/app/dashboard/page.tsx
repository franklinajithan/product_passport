import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentUser } from "@/authentication/session";
import { getMembershipForUser } from "@/services/organisation.service";
import { prisma } from "@/database/client";
import {
  calculateCompleteness,
  completenessFromProduct,
  countByStatus,
} from "@/services/product-completeness.service";
import { getManufacturerDashboardData } from "@/services/product.service";
import { OrganisationStatusBadge } from "@/components/feedback/status-badges";
import { StatCard } from "@/components/feedback/stat-card";
import { Alert } from "@/components/ui/alert";
import { formatDate } from "@/utilities/format";

export default async function DashboardPage() {
  const user = await getCurrentUser();
  if (!user) {
    redirect("/login");
  }

  if (user.role === "CONSUMER") {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Your account</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Search and scan products, then report anything that looks wrong.
        </p>
        <div className="mt-6 flex gap-3 text-sm">
          <Link href="/search" className="rounded-md bg-primary px-4 py-2 text-primary-foreground">
            Search products
          </Link>
          <Link href="/scan" className="rounded-md border border-border px-4 py-2">
            Scan a barcode
          </Link>
        </div>
      </div>
    );
  }

  if (user.role === "DEVELOPER") {
    return (
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Developer workspace</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Use the public API today. Key management and usage dashboards expand in the next phases.
        </p>
        <Link href="/developers" className="mt-6 inline-block text-sm hover:underline">
          Open API documentation
        </Link>
      </div>
    );
  }

  const membership = await getMembershipForUser(user.id);
  if (!membership) {
    redirect("/organisation/setup");
  }

  const { products, apiRequests } = await getManufacturerDashboardData(
    membership.organisationId,
  );
  const counts = countByStatus(products);
  const recent = products.slice(0, 8);
  const incomplete = products
    .map((product) => ({
      product,
      completeness: calculateCompleteness(completenessFromProduct(product)),
    }))
    .filter((item) => item.completeness.score < 100)
    .slice(0, 5);

  const inNinetyDays = new Date();
  inNinetyDays.setDate(inNinetyDays.getDate() + 90);
  const [gtinIssues, missingCase, twoDReady, expiringCerts] = await Promise.all([
    prisma.productIdentifier.count({
      where: {
        organisationId: membership.organisationId,
        OR: [{ checkDigitValid: false }, { ownershipStatus: "UNVERIFIED" }],
      },
    }),
    prisma.product.count({
      where: {
        organisationId: membership.organisationId,
        status: "ACTIVE",
        hierarchyAsChild: { none: {} },
        hierarchyAsParent: { none: {} },
      },
    }),
    prisma.product.count({
      where: { organisationId: membership.organisationId, digitalLinks: { some: {} } },
    }),
    prisma.productCertification.count({
      where: {
        product: { organisationId: membership.organisationId },
        expiresAt: { lte: inNinetyDays, gte: new Date() },
      },
    }),
  ]);
  const twoDPercent = counts.total === 0 ? 0 : Math.round((twoDReady / counts.total) * 100);

  return (
    <div className="space-y-8">
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">
            {membership.organisation.name}
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {membership.organisation.legalName}
          </p>
        </div>
        <OrganisationStatusBadge status={membership.organisation.status} />
      </div>

      {membership.organisation.status === "PENDING_VERIFICATION" ? (
        <Alert variant="warning">
          This organisation is pending verification. You can prepare product data,
          but manufacturer-verified publication is enabled after an admin review.
        </Alert>
      ) : null}

      {membership.organisation.status === "REJECTED" ? (
        <Alert variant="destructive">
          Verification was rejected
          {membership.organisation.verificationNote
            ? `: ${membership.organisation.verificationNote}`
            : "."}
        </Alert>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Total products" value={counts.total} />
        <StatCard label="Active products" value={counts.active} />
        <StatCard label="Draft products" value={counts.draft} />
        <StatCard label="Needs attention" value={counts.incomplete} />
        <StatCard label="Missing translations (EN)" value={counts.missingEnglish} />
        <StatCard label="Missing images" value={counts.missingImages} />
        <StatCard label="API requests this month" value={apiRequests} />
        <StatCard label="Team members" value={membership.organisation._count.members} />
        <StatCard label="GTIN verification issues" value={gtinIssues} />
        <StatCard label="Products missing case GTIN" value={missingCase} />
        <StatCard label="2D readiness" value={`${twoDPercent}%`} />
        <StatCard label="Certifications expiring (90d)" value={expiringCerts} />
      </div>

      <section className="grid gap-4 lg:grid-cols-2">
        <article className="rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold">Products by status</h2>
          <div className="mt-4 space-y-3">
            <Meter label="Active" value={counts.active} total={counts.total || 1} />
            <Meter label="Draft" value={counts.draft} total={counts.total || 1} />
            <Meter label="Needs attention" value={counts.incomplete} total={counts.total || 1} />
          </div>
        </article>
        <article className="rounded-xl border border-border p-5">
          <h2 className="text-sm font-semibold">Completeness distribution</h2>
          <div className="mt-4 space-y-3">
            <Meter
              label="Complete"
              value={products.filter((item) => item.completenessScore >= 90).length}
              total={counts.total || 1}
            />
            <Meter
              label="Partial"
              value={products.filter((item) => item.completenessScore >= 50 && item.completenessScore < 90).length}
              total={counts.total || 1}
            />
            <Meter
              label="Low"
              value={products.filter((item) => item.completenessScore < 50).length}
              total={counts.total || 1}
            />
          </div>
        </article>
      </section>

      <section>
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-semibold">Recently modified</h2>
          <Link href="/dashboard/products" className="text-sm text-muted-foreground hover:underline">
            View all
          </Link>
        </div>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">No products yet.</p>
        ) : (
          <div className="divide-y rounded-xl border border-border">
            {recent.map((product) => {
              const name =
                product.translations.find((item) => item.languageCode === "en")?.productName ??
                product.translations[0]?.productName ??
                product.gprId;
              return (
                <Link
                  key={product.id}
                  href={`/product/${product.barcodes[0]?.value ?? product.gprId}`}
                  className="flex items-center justify-between px-4 py-3 text-sm hover:bg-muted/40"
                >
                  <span className="font-medium">{name}</span>
                  <span className="text-xs text-muted-foreground">
                    {formatDate(product.updatedAt)}
                  </span>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {incomplete.length > 0 ? (
        <section>
          <h2 className="mb-3 text-sm font-semibold">Completeness recommendations</h2>
          <div className="space-y-2">
            {incomplete.map(({ product, completeness }) => {
              const name =
                product.translations.find((item) => item.languageCode === "en")?.productName ??
                product.translations[0]?.productName ??
                product.gprId;
              return (
                <div key={product.id} className="rounded-lg border border-border px-4 py-3 text-sm">
                  <div className="flex items-center justify-between gap-3">
                    <span className="font-medium">{name}</span>
                    <span>{completeness.score}%</span>
                  </div>
                  {completeness.recommendation ? (
                    <p className="mt-1 text-muted-foreground">{completeness.recommendation}</p>
                  ) : null}
                </div>
              );
            })}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Meter({ label, value, total }: { label: string; value: number; total: number }) {
  const width = Math.round((value / total) * 100);
  return (
    <div>
      <div className="mb-1 flex justify-between text-sm">
        <span>{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-muted">
        <div className="h-full rounded-full bg-primary" style={{ width: `${width}%` }} />
      </div>
    </div>
  );
}
