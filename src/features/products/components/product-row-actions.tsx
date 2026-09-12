"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { duplicateProductAction, retireProductAction } from "@/features/products/actions";

export function ProductRowActions({
  productId,
  publicPath,
  canEdit,
  retired,
}: {
  productId: string;
  publicPath: string;
  canEdit: boolean;
  retired: boolean;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function duplicate() {
    setPending(true);
    const form = new FormData();
    form.set("productId", productId);
    const result = await duplicateProductAction(form);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/dashboard/products/${result.data.id}/edit`);
    router.refresh();
  }

  async function retire() {
    const reason = window.prompt("Retirement reason (identifier history is kept):");
    if (!reason) {
      return;
    }
    setPending(true);
    const form = new FormData();
    form.set("productId", productId);
    form.set("reason", reason);
    const result = await retireProductAction(form);
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="space-y-1">
      <div className="flex flex-wrap gap-2 text-xs">
        <Link href={publicPath} className="hover:underline">
          View
        </Link>
        {canEdit ? (
          <>
            <Link href={`/dashboard/products/${productId}/edit`} className="hover:underline">
              Edit
            </Link>
            <button type="button" className="hover:underline" disabled={pending} onClick={() => void duplicate()}>
              Duplicate
            </button>
            <Link href={`/dashboard/products/new?variantOf=${productId}`} className="hover:underline">
              Create variant
            </Link>
            <Link href={`/dashboard/packaging`} className="hover:underline">
              Add packaging
            </Link>
            <Link href={`${publicPath}`} className="hover:underline">
              History
            </Link>
            {!retired ? (
              <button type="button" className="hover:underline" disabled={pending} onClick={() => void retire()}>
                Retire
              </button>
            ) : null}
          </>
        ) : null}
      </div>
      {error ? <p className="text-xs text-destructive">{error}</p> : null}
    </div>
  );
}
