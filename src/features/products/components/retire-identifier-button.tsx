"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { retireIdentifierAction } from "@/features/products/actions";

export function RetireIdentifierButton({ identifierId, retired }: { identifierId: string; retired: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  if (retired) {
    return <span className="text-muted-foreground">Retired</span>;
  }

  async function onClick() {
    const reason = window.prompt("Retirement reason (the identifier record is kept):");
    if (!reason) {
      return;
    }
    const form = new FormData();
    form.set("identifierId", identifierId);
    form.set("reason", reason);
    const result = await retireIdentifierAction(form);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <span>
      <button type="button" className="hover:underline" onClick={() => void onClick()}>
        Retire
      </button>
      {error ? <span className="ml-2 text-destructive">{error}</span> : null}
    </span>
  );
}
