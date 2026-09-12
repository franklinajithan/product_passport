"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const SYMBOLOGIES = [
  "EAN_13",
  "EAN_8",
  "UPC_A",
  "ITF_14",
  "GS1_128",
  "GS1_DATAMATRIX",
  "GS1_QR_CODE",
] as const;

export function BarcodeGeneratorTool() {
  const [value, setValue] = useState("5901234567893");
  const [symbology, setSymbology] = useState<(typeof SYMBOLOGIES)[number]>("EAN_13");
  const [message, setMessage] = useState<string | null>(null);
  const [svg, setSvg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/v1/barcodes/render", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value, symbology, format: "svg" }),
    });
    const payload = (await response.json()) as {
      ok?: boolean;
      message?: string;
      body?: string;
      errors?: string[];
    };
    if (!response.ok || !payload.ok) {
      setSvg(null);
      setError(payload.errors?.[0] ?? "Symbol could not be rendered from this identifier.");
      return;
    }
    setMessage(payload.message ?? null);
    setSvg(payload.body ?? null);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <p className="text-sm text-muted-foreground">
        This generates a barcode <strong>symbol</strong> from an existing identifier. It does not
        create an official GTIN.
      </p>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="h-11 w-full rounded-md border border-input px-3 font-mono text-sm"
        aria-label="Identifier"
      />
      <select
        value={symbology}
        onChange={(event) => setSymbology(event.target.value as (typeof SYMBOLOGIES)[number])}
        className="h-11 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        {SYMBOLOGIES.map((item) => (
          <option key={item} value={item}>
            {item.replaceAll("_", " ")}
          </option>
        ))}
      </select>
      <Button type="submit">Generate symbol</Button>
      {message ? <p className="text-sm">{message}</p> : null}
      {svg ? (
        <div
          className="rounded-xl border border-border bg-white p-4 dark:bg-zinc-100"
          dangerouslySetInnerHTML={{ __html: svg }}
        />
      ) : null}
    </form>
  );
}
