"use client";

import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageContainer, SectionHeading } from "@/components/layout/page-container";

const JS = `const product = await fetch("/api/v1/products/5901234567893")
  .then((res) => res.json());`;

const PY = `import urllib.request, json
url = "http://localhost:3000/api/v1/products/5901234567893"
with urllib.request.urlopen(url) as response:
    product = json.load(response)`;

const CURL = `curl http://localhost:3000/api/v1/products/5901234567893`;

const RESPONSE = `{
  "gtin": "5901234567893",
  "verification": "MANUFACTURER_VERIFIED",
  "name": { "en": "Extra Butter", "pl": "Masło Ekstra" },
  "netContent": { "value": 200, "unit": "g" }
}`;

const WORKFLOW = [
  "Create product",
  "Enter GTIN",
  "Validate",
  "Upload packaging images",
  "Extract product information",
  "Confirm details",
  "Add packaging hierarchy",
  "Add translations",
  "Publish",
  "Distribute through API",
];

export function HomeDeveloperAndWorkflow() {
  return (
    <>
      <section className="border-b border-border py-20">
        <PageContainer>
          <SectionHeading
            eyebrow="Developer API"
            title="Look up a trade item the same way POS and ecommerce will"
          />
          <Tabs defaultValue="js" className="mt-10">
            <TabsList>
              <TabsTrigger value="js">JavaScript</TabsTrigger>
              <TabsTrigger value="py">Python</TabsTrigger>
              <TabsTrigger value="curl">cURL</TabsTrigger>
              <TabsTrigger value="json">Response</TabsTrigger>
            </TabsList>
            <TabsContent value="js">
              <pre className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 text-xs leading-6"><code>{JS}</code></pre>
            </TabsContent>
            <TabsContent value="py">
              <pre className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 text-xs leading-6"><code>{PY}</code></pre>
            </TabsContent>
            <TabsContent value="curl">
              <pre className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 text-xs leading-6"><code>{CURL}</code></pre>
            </TabsContent>
            <TabsContent value="json">
              <pre className="overflow-x-auto rounded-xl border border-border bg-muted/40 p-4 text-xs leading-6"><code>{RESPONSE}</code></pre>
            </TabsContent>
          </Tabs>
          <p className="mt-6 text-sm text-muted-foreground">
            REST API · Webhooks · API keys · Rate limits · Sandbox · SDKs
          </p>
          <Button asChild className="mt-4">
            <Link href="/developers">Open API documentation</Link>
          </Button>
        </PageContainer>
      </section>

      <section className="border-b border-border bg-muted/30 py-20">
        <PageContainer>
          <SectionHeading eyebrow="Manufacturer workflow" title="Publish once. Distribute everywhere." />
          <ol className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
            {WORKFLOW.map((step, index) => (
              <li key={step} className="rounded-xl border border-border bg-background px-4 py-4 text-sm">
                <span className="text-xs text-muted-foreground">{String(index + 1).padStart(2, "0")}</span>
                <p className="mt-2 font-medium">{step}</p>
              </li>
            ))}
          </ol>
        </PageContainer>
      </section>

      <section className="py-20">
        <PageContainer className="grid gap-12 lg:grid-cols-2">
          <SectionHeading
            eyebrow="Smart extraction"
            title="AI can suggest. Manufacturers confirm."
            description="Front, back, nutrition and ingredients images can produce suggested fields. Every suggestion is labelled AI Suggested until the manufacturer confirms, after which it becomes Manufacturer Verified."
          />
          <ul className="space-y-2 text-sm">
            {["Product name", "Brand", "GTIN", "Weight", "Ingredients", "Allergens", "Nutrition", "Manufacturer", "Country"].map(
              (field) => (
                <li key={field} className="flex items-center justify-between rounded-lg border border-border px-4 py-3">
                  <span>{field}</span>
                  <span className="text-xs uppercase tracking-wide text-muted-foreground">AI suggested</span>
                </li>
              ),
            )}
          </ul>
        </PageContainer>
      </section>
    </>
  );
}
