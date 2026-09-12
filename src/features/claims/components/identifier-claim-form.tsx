"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const CLAIM_TYPES = [
  { value: "CLAIM_GTIN", label: "Claim GTIN" },
  { value: "CLAIM_BRAND", label: "Claim brand" },
  { value: "CLAIM_PRODUCT", label: "Claim product" },
  { value: "REPORT_MISASSIGNMENT", label: "Report incorrect assignment" },
  { value: "REPORT_COUNTERFEIT", label: "Report counterfeit" },
  { value: "REPORT_DUPLICATE", label: "Report duplicate" },
] as const;

export function IdentifierClaimForm({
  gtin,
  productId,
  defaultType = "CLAIM_GTIN",
}: {
  gtin?: string;
  productId?: string;
  defaultType?: (typeof CLAIM_TYPES)[number]["value"];
}) {
  const router = useRouter();
  const [type, setType] = useState(defaultType);
  const [note, setNote] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      const response = await fetch("/api/v1/claims", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          gtin,
          productId,
          evidenceNote: note || undefined,
        }),
      });
      const payload = (await response.json()) as { error?: string };
      if (response.status === 401) {
        router.push(`/login?next=/validate?q=${encodeURIComponent(gtin ?? "")}`);
        return;
      }
      if (!response.ok) {
        setError(payload.error ?? "The claim could not be filed.");
        return;
      }
      setDone(true);
    } catch {
      setError("The claim could not be filed.");
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return <Alert>Claim submitted for investigation. First-to-type is not treated as ownership.</Alert>;
  }

  return (
    <form onSubmit={onSubmit} className="space-y-3 rounded-xl border border-border p-4">
      <p className="text-sm font-medium">Ownership and assignment</p>
      <p className="text-xs text-muted-foreground">
        Entering a GTIN does not make your organisation its owner. File a claim with evidence.
      </p>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <select
        value={type}
        onChange={(event) => setType(event.target.value as typeof type)}
        className="h-10 w-full rounded-md border border-input bg-background px-3 text-sm"
      >
        {CLAIM_TYPES.map((item) => (
          <option key={item.value} value={item.value}>
            {item.label}
          </option>
        ))}
      </select>
      <textarea
        value={note}
        onChange={(event) => setNote(event.target.value)}
        placeholder="Evidence notes"
        className="min-h-24 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Submitting…" : "Submit claim"}
      </Button>
    </form>
  );
}
