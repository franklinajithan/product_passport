"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { publishProductAction, updateProductAction } from "@/features/products/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { GtinDecisionBadge } from "@/components/platform/gtin-decision";
import { evaluatePublishGate } from "@/services/product-change.service";
import type { ProductIdentitySnapshot } from "@/lib/standards/gs1/gtin-management";

export function ProductEditForm({
  productId,
  sku,
  originalName,
  originalLanguageCode,
  englishName,
  ingredients,
  netContentValue,
  netContentUnit,
  previous,
  status,
  canPublish,
}: {
  productId: string;
  sku: string;
  originalName: string;
  originalLanguageCode: string;
  englishName: string;
  ingredients: string;
  netContentValue: string;
  netContentUnit: string;
  previous: ProductIdentitySnapshot;
  status: string;
  canPublish: boolean;
}) {
  const router = useRouter();
  const [form, setForm] = useState({
    sku,
    originalName,
    englishName,
    ingredients,
    netContentValue,
    netContentUnit,
  });
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  const nextSnapshot: ProductIdentitySnapshot = {
    ...previous,
    consumerFacingName: form.englishName || form.originalName,
    netContentValue: form.netContentValue ? Number(form.netContentValue) : previous.netContentValue,
    netContentUnit: form.netContentUnit || previous.netContentUnit,
  };
  const gate = evaluatePublishGate(previous, nextSnapshot);

  async function save() {
    setPending(true);
    setError(null);
    const result = await updateProductAction({
      productId,
      sku: form.sku,
      originalName: form.originalName,
      originalLanguageCode,
      englishName: form.englishName,
      ingredients: form.ingredients,
      netContentValue: form.netContentValue ? Number(form.netContentValue) : "",
      netContentUnit: form.netContentUnit,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setMessage(`Saved. Identification decision: ${result.message ?? "SAME_GTIN"}`);
    router.refresh();
  }

  async function publish() {
    const data = new FormData();
    data.set("productId", productId);
    const result = await publishProductAction(data);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-5">
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      {message ? <Alert>{message}</Alert> : null}
      <div className="flex items-center gap-3">
        <GtinDecisionBadge decision={gate.result.decision} />
        <p className="text-sm text-muted-foreground">{gate.result.explanation}</p>
      </div>
      {gate.requireSuccessor ? (
        <Alert variant="warning">
          This change cannot overwrite the current GTIN. Create a variant or successor with a newly allocated identifier.
        </Alert>
      ) : null}
      <div className="space-y-2">
        <Label htmlFor="originalName">Original-language name</Label>
        <Input
          id="originalName"
          value={form.originalName}
          onChange={(event) => setForm((current) => ({ ...current, originalName: event.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="englishName">English name</Label>
        <Input
          id="englishName"
          value={form.englishName}
          onChange={(event) => setForm((current) => ({ ...current, englishName: event.target.value }))}
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="sku">SKU</Label>
        <Input id="sku" value={form.sku} onChange={(event) => setForm((current) => ({ ...current, sku: event.target.value }))} />
      </div>
      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="netContentValue">Net content</Label>
          <Input
            id="netContentValue"
            type="number"
            min="0"
            step="0.01"
            value={form.netContentValue}
            onChange={(event) => setForm((current) => ({ ...current, netContentValue: event.target.value }))}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="netContentUnit">Unit</Label>
          <Select
            id="netContentUnit"
            value={form.netContentUnit}
            onChange={(event) => setForm((current) => ({ ...current, netContentUnit: event.target.value }))}
          >
            {["G", "KG", "ML", "L", "OZ", "LB", "PIECES"].map((unit) => (
              <option key={unit} value={unit}>
                {unit}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="ingredients">Ingredients</Label>
        <textarea
          id="ingredients"
          value={form.ingredients}
          onChange={(event) => setForm((current) => ({ ...current, ingredients: event.target.value }))}
          className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <Button type="button" onClick={() => void save()} disabled={pending || gate.requireSuccessor}>
          {pending ? "Saving…" : "Save changes"}
        </Button>
        {canPublish && status === "DRAFT" ? (
          <Button type="button" variant="secondary" onClick={() => void publish()}>
            Publish
          </Button>
        ) : null}
      </div>
    </div>
  );
}
