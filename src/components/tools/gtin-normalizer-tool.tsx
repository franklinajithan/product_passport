"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { validateGTIN, displayGTIN, toCanonicalGTIN14 } from "@/lib/standards/gs1/gtin";

export function GtinNormalizerTool() {
  const [value, setValue] = useState("590 1234 567893");
  const [out, setOut] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const parsed = validateGTIN(value);
    if (!parsed.canonicalGTIN14) {
      setOut(parsed.issues[0]?.message ?? "Not a GTIN.");
      return;
    }
    setOut(
      `Printed form: ${displayGTIN(parsed.canonicalGTIN14)}\nCanonical GTIN-14: ${toCanonicalGTIN14(parsed.displayValue)}`,
    );
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <textarea
        value={value}
        onChange={(event) => setValue(event.target.value)}
        className="min-h-24 w-full rounded-md border border-input px-3 py-2 font-mono text-sm"
      />
      <Button type="submit">Normalise</Button>
      {out ? <pre className="rounded-xl border border-border p-4 text-sm">{out}</pre> : null}
    </form>
  );
}
