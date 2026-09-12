import { PageContainer, SectionHeading } from "@/components/layout/page-container";

export default function DevelopersPage() {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  return (
    <PageContainer width="narrow" className="py-16 space-y-10">
      <SectionHeading
        title="Developer API"
        description="Versioned REST access to product master data, GTIN validation, barcode rendering and GS1 Digital Link resolution. Official GS1 identifiers are never invented by this platform."
      />

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">Authentication</h2>
        <p className="text-sm text-muted-foreground">
          Public product reads currently work without a key and are rate-limited by IP. Send
          <code className="mx-1 rounded bg-muted px-1 py-0.5 text-xs">Authorization: Bearer gpr_live_…</code>
          when keys are issued. Keys are stored hashed; the secret is shown once.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">GET /api/v1/products/{"{gtin}"}</h2>
        <Code>{`curl ${appUrl}/api/v1/products/5901234567893`}</Code>
        <h3 className="text-sm font-semibold">JavaScript</h3>
        <Code>{`const res = await fetch("${appUrl}/api/v1/products/5901234567893");
const product = await res.json();`}</Code>
        <h3 className="text-sm font-semibold">Python</h3>
        <Code>{`import urllib.request, json
with urllib.request.urlopen("${appUrl}/api/v1/products/5901234567893") as response:
    product = json.load(response)`}</Code>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">GET /api/v1/gtins/{"{gtin}"}</h2>
        <Code>{`curl ${appUrl}/api/v1/gtins/5901234123457`}</Code>
        <p className="text-sm text-muted-foreground">
          Returns identifier type, canonical GTIN-14, check-digit validity, ownership and linked
          product. Format validity is not the same as official allocation.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">POST /api/v1/barcodes/validate</h2>
        <Code>{`curl -X POST ${appUrl}/api/v1/barcodes/validate \\
  -H "Content-Type: application/json" \\
  -d '{"value":"5901234123457"}'`}</Code>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">POST /api/v1/barcodes/render</h2>
        <Code>{`curl -X POST ${appUrl}/api/v1/barcodes/render \\
  -H "Content-Type: application/json" \\
  -d '{"value":"5901234123457","symbology":"EAN_13","format":"svg"}'`}</Code>
        <p className="text-sm text-muted-foreground">
          Renders a barcode symbol from a valid identifier. The response message is “Barcode
          symbol generated from GTIN …”, never an official issuance claim.
        </p>
      </section>

      <section className="space-y-3">
        <h2 className="text-lg font-semibold">POST /api/v1/barcodes/scan</h2>
        <Code>{`curl -X POST ${appUrl}/api/v1/barcodes/scan \\
  -H "Content-Type: application/json" \\
  -d '{"value":"(01)05901234123457(17)270501(10)ABC123"}'`}</Code>
      </section>

      <section className="space-y-2 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Other endpoints</h2>
        <p>GET /api/v1/products/search?q=</p>
        <p>GET /api/v1/dl/{"{gtin}"}?lang=pl</p>
        <p>GET /api/v1/brands/{"{id}"}</p>
        <p>GET /api/v1/manufacturers/{"{id}"}</p>
        <p>GET /api/v1/categories</p>
        <p>GET /api/v1/countries</p>
        <p>GET /api/v1/languages</p>
        <p>POST /api/v1/claims</p>
      </section>
    </PageContainer>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-6">
      <code>{children}</code>
    </pre>
  );
}
