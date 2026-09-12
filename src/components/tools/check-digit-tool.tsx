"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Alert } from "@/components/ui/alert";
import { calculateGTINCheckDigit } from "@/lib/standards/gs1/check-digit";

export function CheckDigitTool() {
  const [payload, setPayload] = useState("590123456789");
  const [digit, setDigit] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    try {
      setDigit(calculateGTINCheckDigit(payload.replace(/\D/g, "")));
      setError(null);
    } catch (caught) {
      setDigit(null);
      setError(caught instanceof Error ? caught.message : "Could not calculate.");
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <label className="block text-sm">
        Payload without check digit
        <input
          value={payload}
          onChange={(event) => setPayload(event.target.value)}
          className="mt-1 h-11 w-full rounded-md border border-input bg-background px-3 font-mono text-sm"
        />
      </label>
      <Button type="submit">Calculate</Button>
      {digit ? (
        <p className="text-sm">
          Check digit <strong>{digit}</strong> · full value{" "}
          <span className="font-mono">{payload.replace(/\D/g, "") + digit}</span>
        </p>
      ) : null}
    </form>
  );
}
