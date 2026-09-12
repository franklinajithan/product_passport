"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { buildGS1DigitalLink } from "@/lib/standards/gs1/digital-link";

export function DigitalLinkBuilderTool() {
  const [gtin, setGtin] = useState("5901234567893");
  const [domain, setDomain] = useState("https://example.com");
  const [lot, setLot] = useState("");
  const [uri, setUri] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      const result = buildGS1DigitalLink({
        domain,
        gtin,
        qualifiers: lot ? { lot } : undefined,
      });
      setUri(result.uri);
      setError(null);
    } catch (caught) {
      setUri(null);
      setError(caught instanceof Error ? caught.message : "Could not build URI.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3">
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <input value={domain} onChange={(event) => setDomain(event.target.value)} className="h-11 w-full rounded-md border px-3 text-sm" aria-label="Domain" />
      <input value={gtin} onChange={(event) => setGtin(event.target.value)} className="h-11 w-full rounded-md border px-3 font-mono text-sm" aria-label="GTIN" />
      <input value={lot} onChange={(event) => setLot(event.target.value)} placeholder="Optional lot (AI 10)" className="h-11 w-full rounded-md border px-3 text-sm" />
      <Button type="submit">Build URI</Button>
      {uri ? <p className="break-all font-mono text-sm">{uri}</p> : null}
    </form>
  );
}
