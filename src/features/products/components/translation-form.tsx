"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { upsertTranslationAction } from "@/features/products/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type Option = { id: string; label: string };

export function TranslationForm({
  products,
  languages,
}: {
  products: Option[];
  languages: Option[];
}) {
  const router = useRouter();
  const [productId, setProductId] = useState(products[0]?.id ?? "");
  const [languageCode, setLanguageCode] = useState(languages[0]?.id ?? "en");
  const [productName, setProductName] = useState("");
  const [ingredients, setIngredients] = useState("");
  const [translationSource, setTranslationSource] = useState("MANUFACTURER");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    const result = await upsertTranslationAction({
      productId,
      languageCode,
      productName,
      ingredients,
      translationSource,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setProductName("");
    setIngredients("");
    router.refresh();
  }

  if (products.length === 0) {
    return null;
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-3 rounded-xl border border-border p-4">
      <h2 className="text-sm font-semibold">Add or update a translation</h2>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <div className="grid gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="productId">Product</Label>
          <Select id="productId" value={productId} onChange={(event) => setProductId(event.target.value)}>
            {products.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="languageCode">Language</Label>
          <Select id="languageCode" value={languageCode} onChange={(event) => setLanguageCode(event.target.value)}>
            {languages.map((item) => (
              <option key={item.id} value={item.id}>
                {item.label}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="productName">Product name</Label>
        <Input id="productName" value={productName} onChange={(event) => setProductName(event.target.value)} required />
      </div>
      <div className="space-y-2">
        <Label htmlFor="ingredients">Ingredients</Label>
        <textarea
          id="ingredients"
          value={ingredients}
          onChange={(event) => setIngredients(event.target.value)}
          className="min-h-20 w-full rounded-md border px-3 py-2 text-sm"
        />
      </div>
      <div className="space-y-2">
        <Label htmlFor="translationSource">Source</Label>
        <Select
          id="translationSource"
          value={translationSource}
          onChange={(event) => setTranslationSource(event.target.value)}
        >
          <option value="MANUFACTURER">Manufacturer verified</option>
          <option value="HUMAN_VERIFIED">Human verified</option>
          <option value="MACHINE">Machine translated</option>
        </Select>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save translation"}
      </Button>
    </form>
  );
}
