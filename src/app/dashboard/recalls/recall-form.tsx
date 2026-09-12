"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

export function RecallForm() {
  const router = useRouter();
  const [gtin, setGtin] = useState("");
  const [reason, setReason] = useState("");
  const [batchNumbers, setBatchNumbers] = useState("");
  const [consumerInstructions, setConsumerInstructions] = useState("");
  const [retailerInstructions, setRetailerInstructions] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const response = await fetch("/api/v1/recalls", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        gtin,
        reason,
        batchNumbers: batchNumbers || undefined,
        consumerInstructions,
        retailerInstructions: retailerInstructions || undefined,
      }),
    });
    const payload = (await response.json()) as { error?: string };
    setPending(false);
    if (!response.ok) {
      setError(payload.error ?? "Could not publish recall.");
      return;
    }
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-3 rounded-xl border border-border p-4">
      <h2 className="text-sm font-semibold">Create recall</h2>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <input
        value={gtin}
        onChange={(event) => setGtin(event.target.value)}
        placeholder="GTIN"
        className="h-10 w-full rounded-md border px-3 font-mono text-sm"
        required
      />
      <input
        value={batchNumbers}
        onChange={(event) => setBatchNumbers(event.target.value)}
        placeholder="Affected batches (optional)"
        className="h-10 w-full rounded-md border px-3 text-sm"
      />
      <textarea
        value={reason}
        onChange={(event) => setReason(event.target.value)}
        placeholder="Reason"
        className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
        required
      />
      <textarea
        value={consumerInstructions}
        onChange={(event) => setConsumerInstructions(event.target.value)}
        placeholder="Consumer instructions"
        className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
        required
      />
      <textarea
        value={retailerInstructions}
        onChange={(event) => setRetailerInstructions(event.target.value)}
        placeholder="Retailer instructions (optional)"
        className="min-h-16 w-full rounded-md border px-3 py-2 text-sm"
      />
      <Button type="submit" disabled={pending}>
        {pending ? "Publishing…" : "Publish recall"}
      </Button>
    </form>
  );
}
