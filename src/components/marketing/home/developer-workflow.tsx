"use client";

import Link from "next/link";
import { Sparkles } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { PageContainer } from "@/components/layout/page-container";
import { CokeCan } from "@/components/marketing/home/section-visuals";
import { DEMO_PASSPORT, DEMO_PRODUCT_DISCLAIMER } from "@/data/demo-showcase";

const JS = `const product = await fetch("/api/v1/products/${DEMO_PASSPORT.gtin}")
  .then((res) => res.json());`;

const PY = `import urllib.request, json
url = "http://localhost:3000/api/v1/products/${DEMO_PASSPORT.gtin}"
with urllib.request.urlopen(url) as response:
    product = json.load(response)`;

const CURL = `curl http://localhost:3000/api/v1/products/${DEMO_PASSPORT.gtin}`;

const RESPONSE = `{
  "gtin": "${DEMO_PASSPORT.gtin}",
  "verification": "PUBLIC_DEMO_RECORD",
  "name": { "en": "${DEMO_PASSPORT.englishName}" },
  "brand": "${DEMO_PASSPORT.brand}",
  "netContent": { "value": 330, "unit": "ml" },
  "targetMarket": "${DEMO_PASSPORT.targetMarket}"
}`;

const WORKFLOW = [
  { n: "01", label: "Create product", group: "Identify" },
  { n: "02", label: "Enter GTIN", group: "Identify" },
  { n: "03", label: "Validate", group: "Identify" },
  { n: "04", label: "Upload images", group: "Enrich" },
  { n: "05", label: "Extract", group: "Enrich" },
  { n: "06", label: "Confirm", group: "Enrich" },
  { n: "07", label: "Packaging", group: "Enrich" },
  { n: "08", label: "Translate", group: "Enrich" },
  { n: "09", label: "Publish", group: "Release" },
  { n: "10", label: "API distribution", group: "Release" },
];

const EXTRACTION_FIELDS = [
  { field: "Product name", status: "demo" as const, value: DEMO_PASSPORT.name },
  { field: "Brand", status: "demo" as const, value: DEMO_PASSPORT.brand },
  { field: "Ingredients", status: "suggested" as const, value: "Carbonated Water, Sugar, Colour (Caramel E150d)" },
  { field: "Nutrition", status: "suggested" as const, value: DEMO_PASSPORT.nutritionPer100ml.energy + " per 100 ml" },
  { field: "Packaging", status: "suggested" as const, value: DEMO_PASSPORT.netContent },
];

export function HomeDeveloperAndWorkflow() {
  return (
    <>
      <section className="border-b border-[#0b2344] bg-[#06152b] py-10 text-white sm:py-14 lg:py-16">
        <PageContainer className="grid min-w-0 items-stretch gap-6 lg:grid-cols-2">
          <div className="flex min-w-0 flex-col">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-cyan-200">DEVELOPER API</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              Build with GPR
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
              Integrate global product data into your applications with our powerful and flexible
              API. Look up a trade item the same way POS and ecommerce will.
            </p>
            <Button asChild className="mt-6 h-11 w-full rounded-sm sm:w-auto">
              <Link href="/developers">View API documentation</Link>
            </Button>

            <Tabs defaultValue="json" className="mt-6 min-w-0 overflow-hidden bg-[#081b35] text-cyan-100 ring-1 ring-white/10">
              <div className="flex items-center gap-2 border-b border-white/10 px-3 py-2">
                <span className="h-2 w-2 rounded-full bg-red-400" />
                <span className="h-2 w-2 rounded-full bg-amber-300" />
                <span className="h-2 w-2 rounded-full bg-emerald-400" />
                <span className="ml-2 font-mono text-[10px] text-slate-400">product-registry · lookup</span>
              </div>
              <TabsList className="w-full flex-nowrap overflow-x-auto rounded-none border-0 border-b border-white/10 bg-transparent p-1">
                <TabsTrigger
                  value="js"
                  className="min-h-11 shrink-0 rounded-sm text-slate-400 data-[state=active]:bg-white/10 data-[state=active]:text-cyan-100"
                >
                  JavaScript
                </TabsTrigger>
                <TabsTrigger
                  value="py"
                  className="min-h-11 shrink-0 rounded-sm text-slate-400 data-[state=active]:bg-white/10 data-[state=active]:text-cyan-100"
                >
                  Python
                </TabsTrigger>
                <TabsTrigger
                  value="curl"
                  className="min-h-11 shrink-0 rounded-sm text-slate-400 data-[state=active]:bg-white/10 data-[state=active]:text-cyan-100"
                >
                  cURL
                </TabsTrigger>
                <TabsTrigger
                  value="json"
                  className="min-h-11 shrink-0 rounded-sm text-slate-400 data-[state=active]:bg-white/10 data-[state=active]:text-cyan-100"
                >
                  Response
                </TabsTrigger>
              </TabsList>
              <TabsContent value="js" className="mt-0">
                <pre className="overflow-x-auto p-4 text-[11px] leading-6 sm:p-5 sm:text-xs"><code className="whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">{JS}</code></pre>
              </TabsContent>
              <TabsContent value="py" className="mt-0">
                <pre className="overflow-x-auto p-4 text-[11px] leading-6 sm:p-5 sm:text-xs"><code className="whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">{PY}</code></pre>
              </TabsContent>
              <TabsContent value="curl" className="mt-0">
                <pre className="overflow-x-auto p-4 text-[11px] leading-6 sm:p-5 sm:text-xs"><code className="whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">{CURL}</code></pre>
              </TabsContent>
              <TabsContent value="json" className="mt-0">
                <pre className="overflow-x-auto p-4 text-[11px] leading-6 sm:p-5 sm:text-xs"><code className="whitespace-pre-wrap break-all sm:whitespace-pre sm:break-normal">{RESPONSE}</code></pre>
              </TabsContent>
            </Tabs>
          </div>

          <div className="flex min-w-0 flex-col">
            <p className="text-[11px] font-semibold tracking-[0.22em] text-cyan-200">AI-POWERED</p>
            <h2 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
              AI Data Extraction
            </h2>
            <p className="mt-3 max-w-md text-sm leading-6 text-slate-300">
              Turn images, PDFs and supplier files into structured product data using AI. Every
              suggestion is labelled AI Suggested until the manufacturer confirms, after which it
              becomes Manufacturer Verified.
            </p>
            <Button asChild variant="outline" className="mt-6 h-11 w-full rounded-sm border-white/20 bg-transparent text-white hover:bg-white/10 sm:w-auto">
              <Link href="/dashboard/products/new">See it in action</Link>
            </Button>

            <div className="mt-6 grid min-w-0 flex-1 gap-4 overflow-hidden bg-white p-4 text-slate-900 sm:grid-cols-[auto_1fr] sm:p-5">
              <div className="flex flex-col items-center justify-center bg-slate-50 px-4 py-5">
                <CokeCan size="md" />
                <p className="mt-2 max-w-[9rem] text-center text-[10px] leading-4 text-slate-400">
                  Packaging image · demonstration
                </p>
              </div>
              <ul className="min-w-0 divide-y divide-slate-100">
                {EXTRACTION_FIELDS.map((row) => (
                  <li key={row.field} className="flex items-center justify-between gap-3 py-2.5">
                    <div className="min-w-0">
                      <p className="text-sm text-slate-800">{row.field}</p>
                      <p className="truncate font-mono text-[11px] text-slate-400">{row.value}</p>
                    </div>
                    {row.status === "demo" ? (
                      <span className="inline-flex w-fit shrink-0 bg-sky-50 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-sky-800 ring-1 ring-sky-100">
                        PUBLIC DEMO
                      </span>
                    ) : (
                      <span className="inline-flex w-fit shrink-0 items-center gap-1 bg-slate-100 px-2 py-1 text-[10px] font-semibold tracking-[0.08em] text-slate-500">
                        <Sparkles className="h-3 w-3" />
                        AI SUGGESTED
                      </span>
                    )}
                  </li>
                ))}
                <li className="pt-2 text-xs text-slate-400">And more…</li>
              </ul>
            </div>
            <p className="mt-3 text-xs leading-5 text-slate-400">{DEMO_PRODUCT_DISCLAIMER}</p>
          </div>
        </PageContainer>
      </section>

      <section className="bg-white py-8 sm:py-10">
        <PageContainer>
          <p className="text-[11px] font-semibold tracking-[0.22em] text-cyan-800">
            MANUFACTURER WORKFLOW
          </p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-900 sm:text-3xl">
            Publish once. Distribute everywhere.
          </h2>
          <p className="mt-1 text-sm text-slate-500">Identify → Enrich → Release</p>

          <ol className="mt-6 hidden xl:grid xl:grid-cols-10">
            {WORKFLOW.map((step, index) => (
              <li key={step.n} className="relative px-1 text-center">
                <div className="relative z-10 mx-auto flex h-11 w-11 items-center justify-center rounded-full bg-[#06152b] font-mono text-xs font-semibold text-cyan-200 ring-2 ring-cyan-300/35">
                  {step.n}
                </div>
                {index < WORKFLOW.length - 1 ? (
                  <span
                    aria-hidden
                    className="absolute top-[22px] left-[calc(50%+22px)] right-[-50%] h-0.5 bg-cyan-700/45"
                  />
                ) : null}
                <p className="mt-2.5 text-xs font-semibold text-slate-900">{step.label}</p>
                <p className="mt-0.5 text-[10px] tracking-wide text-slate-400">{step.group}</p>
              </li>
            ))}
          </ol>

          <ol className="mt-6 space-y-0 xl:hidden">
            {WORKFLOW.map((step, index) => (
              <li key={step.n} className="flex gap-3">
                <div className="flex flex-col items-center">
                  <span className="flex h-11 w-11 items-center justify-center rounded-full bg-[#06152b] font-mono text-xs font-semibold text-cyan-200">
                    {step.n}
                  </span>
                  {index < WORKFLOW.length - 1 ? (
                    <span className="h-6 w-px bg-cyan-700/30" aria-hidden />
                  ) : null}
                </div>
                <div className="flex min-h-11 items-center pb-4">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{step.label}</p>
                    <p className="text-xs tracking-wide text-slate-400">{step.group}</p>
                  </div>
                </div>
              </li>
            ))}
          </ol>
        </PageContainer>
      </section>
    </>
  );
}
