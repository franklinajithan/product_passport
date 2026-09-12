"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

const EVENTS = [
  "product.created",
  "product.updated",
  "product.recalled",
  "identifier.retired",
  "packaging.updated",
  "translation.updated",
  "certification.expired",
];

export function WebhookManager() {
  const router = useRouter();
  const [endpoint, setEndpoint] = useState("https://example.com/webhooks/gpr");
  const [selected, setSelected] = useState<string[]>(["product.updated", "product.recalled"]);
  const [secret, setSecret] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const response = await fetch("/api/v1/webhooks", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ endpoint, events: selected }),
    });
    const payload = (await response.json()) as { error?: string; secret?: string };
    if (!response.ok) {
      setError(payload.error ?? "Could not create webhook.");
      return;
    }
    setSecret(payload.secret ?? null);
    setError(null);
    router.refresh();
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {secret ? <Alert>Signing secret (shown once): {secret}</Alert> : null}
      <input
        value={endpoint}
        onChange={(event) => setEndpoint(event.target.value)}
        className="h-10 w-full rounded-md border px-3 text-sm"
        aria-label="Endpoint"
      />
      <fieldset className="grid gap-2 sm:grid-cols-2">
        {EVENTS.map((eventName) => (
          <label key={eventName} className="flex items-center gap-2 text-sm">
            <input
              type="checkbox"
              checked={selected.includes(eventName)}
              onChange={(change) => {
                setSelected((current) =>
                  change.target.checked
                    ? [...current, eventName]
                    : current.filter((item) => item !== eventName),
                );
              }}
            />
            {eventName}
          </label>
        ))}
      </fieldset>
      <Button type="submit">Create webhook</Button>
    </form>
  );
}
