"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function GtinValidatorTool() {
  const [value, setValue] = useState("5901234567893");
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/v1/barcodes/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value }),
    });
    const payload = (await response.json()) as Record<string, unknown>;
    if (!response.ok) {
      setError(typeof payload.error === "string" ? payload.error : "Validation failed.");
      return;
    }
    setResult(payload);
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <input
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="h-11 w-full rounded-md border border-input bg-background px-3 font-mono text-sm"
        aria-label="Identifier"
      />
      <Button type="submit">Validate</Button>
      {result ? (
        <dl className="space-y-2 rounded-xl border border-border p-4 text-sm">
          <div>Detected type: {String(result.detectedType)}</div>
          <div>Format valid: {String(result.valid)}</div>
          <div>Check digit valid: {String(result.checkDigitValid)}</div>
          <div>Canonical GTIN-14: {String(result.canonicalGTIN14 ?? "—")}</div>
          <div>Carrier hint: {String(result.carrierHint ?? "—")}</div>
        </dl>
      ) : null}
    </form>
  );
}
