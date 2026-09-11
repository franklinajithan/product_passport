export default function DevelopersPage() {
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";

  return (
    <div className="mx-auto w-full max-w-3xl px-4 py-12 space-y-10">
      <div>
        <h1 className="text-3xl font-semibold tracking-tight">Developer API</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Versioned REST access to manufacturer-published product data. Authenticated API keys,
          rate plans and usage analytics are modelled in the database and will be enforced as
          the developer portal expands. The product lookup below is live.
        </p>
      </div>

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

      <section className="space-y-2 text-sm text-muted-foreground">
        <h2 className="text-lg font-semibold text-foreground">Other endpoints</h2>
        <p>GET /api/v1/products/search?q=</p>
        <p>GET /api/v1/brands/{"{id}"}</p>
        <p>GET /api/v1/manufacturers/{"{id}"}</p>
        <p>GET /api/v1/categories</p>
        <p>GET /api/v1/countries</p>
        <p>GET /api/v1/languages</p>
      </section>
    </div>
  );
}

function Code({ children }: { children: string }) {
  return (
    <pre className="overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 text-xs leading-6">
      <code>{children}</code>
    </pre>
  );
}
