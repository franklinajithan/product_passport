import { validateGTIN } from "@/lib/standards/gs1/gtin";
import { decodeScannedPayload } from "@/lib/standards/gs1/scan";
import { gtinIssuanceDisclaimer, internalIdentifierDisclaimer } from "@/lib/standards/identifiers/namespace";
import { ownershipLabel } from "@/lib/standards/identifiers/ownership";
import { findIdentifierByGtin } from "@/services/identifier.service";
import { findProductByGtin } from "@/services/product.service";
import { BarcodeSearchForm } from "@/components/marketing/barcode-search-form";
import { ProductStatusBadge } from "@/components/feedback/status-badges";
import { Alert } from "@/components/ui/alert";
import { Term } from "@/components/standards/term";
import { IdentifierClaimForm } from "@/features/claims/components/identifier-claim-form";
import Link from "next/link";
import type { ReactNode } from "react";

function Row({ label, ok, children }: { label: string; ok?: boolean; children: ReactNode }) {
  return (
    <div className="grid gap-1 border-b border-border py-3 sm:grid-cols-[180px_1fr]">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">{label}</p>
      <div className="text-sm">
        {ok === undefined ? null : <span className="mr-2">{ok ? "✓" : "⚠"}</span>}
        {children}
      </div>
    </div>
  );
}

export default async function ValidatePage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q?.trim() ?? "";
  const parsed = query ? validateGTIN(query) : null;
  const decoded = query ? decodeScannedPayload(query) : null;
  const identifier = query ? await findIdentifierByGtin(query, { includeRetired: true }) : null;
  const product = query ? await findProductByGtin(query) : null;
  const linkedProduct = product ?? identifier?.product ?? null;
  const ownerVerified =
    identifier?.ownershipStatus === "OWNER_VERIFIED" || identifier?.ownershipStatus === "GS1_VERIFIED";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Identifier validation</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Format, <Term term="Check digit">check digit</Term>, registry match and ownership are
          separate results. A mathematically valid <Term term="GTIN" /> is not automatically an
          authorised GS1 allocation.
        </p>
      </div>
      <BarcodeSearchForm initialQuery={query} action="/validate" />

      {query && parsed ? (
        <section className="rounded-xl border border-border p-6">
          <Row label="GTIN">{parsed.displayValue || query}</Row>
          <Row label="Structure" ok={parsed.valid && parsed.detectedType !== "UNKNOWN"}>
            {parsed.detectedType === "UNKNOWN"
              ? "Not a GTIN"
              : `${String(parsed.detectedType).replace("_", "-")} format`}
          </Row>
          <Row label="Check digit" ok={parsed.checkDigitValid}>
            {parsed.checkDigitValid ? "Valid" : "Invalid"}
          </Row>
          <Row label="Canonical GTIN-14">{parsed.canonicalGTIN14 ?? "—"}</Row>
          <Row label="Database" ok={Boolean(linkedProduct)}>
            {linkedProduct ? (
              <Link className="underline" href={`/product/${parsed.displayValue || linkedProduct.gprId}`}>
                Product found — view record
              </Link>
            ) : (
              "Product not found"
            )}
          </Row>
          <Row label="Owner" ok={ownerVerified}>
            {identifier ? ownershipLabel(identifier.ownershipStatus) : "GTIN ownership not verified"}
          </Row>
          <Row label="Brand">{linkedProduct?.brand.name ?? "—"}</Row>
          <Row label="Status">
            {linkedProduct ? <ProductStatusBadge status={linkedProduct.status} /> : "—"}
          </Row>
          <Row label="Barcode carrier">{parsed.carrierHint ?? decoded?.symbologyHint ?? "Not determined"}</Row>
          <Row label="Last verified">
            {linkedProduct?.lastVerifiedAt
              ? new Intl.DateTimeFormat("en-GB", {
                  day: "numeric",
                  month: "long",
                  year: "numeric",
                }).format(linkedProduct.lastVerifiedAt)
              : "—"}
          </Row>
          {parsed.standards.validatedAgainst[0] ? (
            <Row label="Validated against">
              {parsed.standards.validatedAgainst
                .map((item) => `${item.name} ${item.version}`)
                .join(" · ")}
            </Row>
          ) : null}
          {decoded?.lot || decoded?.serial || decoded?.expiry ? (
            <Row label="Instance data">
              {[
                decoded.lot && `LOT ${decoded.lot}`,
                decoded.serial && `SER ${decoded.serial}`,
                decoded.expiry && `EXP ${decoded.expiry}`,
              ]
                .filter(Boolean)
                .join(" · ")}
            </Row>
          ) : null}
          {parsed.detectedType === "INTERNAL" ? (
            <Alert className="mt-4">{internalIdentifierDisclaimer()}</Alert>
          ) : null}
        </section>
      ) : null}

      {query ? (
        <IdentifierClaimForm
          gtin={parsed?.displayValue || query}
          productId={linkedProduct?.id}
          defaultType={linkedProduct ? "CLAIM_GTIN" : "REPORT_MISASSIGNMENT"}
        />
      ) : null}

      <p className="text-xs leading-5 text-muted-foreground">{gtinIssuanceDisclaimer()}</p>
    </div>
  );
}
