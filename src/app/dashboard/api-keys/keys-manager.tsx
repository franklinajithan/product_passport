"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";

type KeyRow = {
  id: string;
  name: string;
  keyPrefix: string;
  lastUsedAt: string | null;
  revokedAt: string | null;
  createdAt: string;
};

export function ApiKeysManager({ initialKeys }: { initialKeys: KeyRow[] }) {
  const [keys, setKeys] = useState(initialKeys);
  const [name, setName] = useState("Production");
  const [scopes, setScopes] = useState<string[]>(["products:read"]);
  const [raw, setRaw] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function createKey(event: React.FormEvent) {
    event.preventDefault();
    setError(null);
    const response = await fetch("/api/v1/api-keys", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, scopes }),
    });
    const payload = (await response.json()) as { error?: string; raw?: string; id?: string; prefix?: string };
    if (!response.ok) {
      setError(payload.error ?? "Could not create key.");
      return;
    }
    setRaw(payload.raw ?? null);
    const list = await fetch("/api/v1/api-keys");
    const body = (await list.json()) as { keys: KeyRow[] };
    setKeys(body.keys);
  }

  async function revoke(id: string) {
    await fetch(`/api/v1/api-keys/${id}/revoke`, { method: "POST" });
    setKeys((current) =>
      current.map((key) => (key.id === id ? { ...key, revokedAt: new Date().toISOString() } : key)),
    );
  }

  return (
    <div className="space-y-6">
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {raw ? (
        <Alert>
          Secret (shown once): <span className="font-mono text-xs">{raw}</span>
        </Alert>
      ) : null}
      <form onSubmit={createKey} className="space-y-3">
        <div className="flex gap-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            className="h-10 flex-1 rounded-md border px-3 text-sm"
            placeholder="Key name"
          />
          <Button type="submit">Create API key</Button>
        </div>
        <fieldset className="flex flex-wrap gap-3 text-xs">
          {["products:read", "products:write", "identifiers:read", "webhooks:manage"].map((scope) => (
            <label key={scope} className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={scopes.includes(scope)}
                onChange={(event) => {
                  setScopes((current) =>
                    event.target.checked ? [...current, scope] : current.filter((item) => item !== scope),
                  );
                }}
              />
              {scope}
            </label>
          ))}
        </fieldset>
      </form>
      <div className="divide-y rounded-xl border border-border">
        {keys.map((key) => (
          <div key={key.id} className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 text-sm">
            <div>
              <p className="font-medium">{key.name}</p>
              <p className="font-mono text-xs text-muted-foreground">
                {key.keyPrefix}… · {key.revokedAt ? "Revoked" : "Active"}
              </p>
            </div>
            {!key.revokedAt ? (
              <Button variant="outline" size="sm" onClick={() => void revoke(key.id)}>
                Revoke
              </Button>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
}
