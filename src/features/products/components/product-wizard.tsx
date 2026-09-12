"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createProductAction } from "@/features/products/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";
import { gtinIssuanceDisclaimer } from "@/lib/standards/identifiers/namespace";

type Option = { id: string; label: string };

const STEPS = ["Identity", "Identifier", "Content", "Review"] as const;

export function ProductWizard({
  brands,
  manufacturers,
  categories,
  languages,
  countries,
  variantOfProductId,
  variantLabelDefault,
}: {
  brands: Option[];
  manufacturers: Option[];
  categories: Option[];
  languages: Option[];
  countries: Option[];
  variantOfProductId?: string;
  variantLabelDefault?: string;
}) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);
  const [gtinCheck, setGtinCheck] = useState<string | null>(null);
  const [form, setForm] = useState({
    brandId: brands[0]?.id ?? "",
    manufacturerId: manufacturers[0]?.id ?? "",
    categoryId: "",
    originCountryId: "",
    sku: "",
    originalLanguageCode: languages.find((item) => item.id === "en")?.id ?? languages[0]?.id ?? "en",
    originalName: "",
    englishName: "",
    ingredients: "",
    gtin: "",
    netContentValue: "",
    netContentUnit: "G",
    variantLabel: variantLabelDefault ?? "",
  });

  function update<K extends keyof typeof form>(key: K, value: (typeof form)[K]) {
    setForm((current) => ({ ...current, [key]: value }));
  }

  async function validateGtin() {
    if (!form.gtin.trim()) {
      setGtinCheck("No GTIN entered. The product can be saved as a draft without an identifier.");
      return;
    }
    const response = await fetch("/api/v1/barcodes/validate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ value: form.gtin }),
    });
    const payload = (await response.json()) as {
      valid?: boolean;
      checkDigitValid?: boolean;
      detectedType?: string;
      canonicalGTIN14?: string;
      error?: string;
    };
    if (!response.ok) {
      setGtinCheck(payload.error ?? "Validation failed.");
      return;
    }
    setGtinCheck(
      payload.valid
        ? `${payload.detectedType} · check digit valid · canonical ${payload.canonicalGTIN14}. Check digit valid is not official ownership.`
        : "GTIN is not valid. This platform does not invent official identifiers.",
    );
  }

  async function submit() {
    setPending(true);
    setError(null);
    const result = await createProductAction({
      ...form,
      netContentValue: form.netContentValue ? Number(form.netContentValue) : "",
      variantOfProductId: variantOfProductId ?? "",
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.push(`/dashboard/products/${result.data.id}/edit`);
    router.refresh();
  }

  return (
    <div className="max-w-2xl space-y-6">
      <ol className="flex gap-2 text-xs uppercase tracking-wide text-muted-foreground">
        {STEPS.map((label, index) => (
          <li key={label} className={index === step ? "font-semibold text-foreground" : undefined}>
            {index + 1}. {label}
          </li>
        ))}
      </ol>
      {error ? <Alert variant="destructive">{error}</Alert> : null}

      {step === 0 ? (
        <div className="space-y-4">
          {variantOfProductId ? (
            <div className="space-y-2">
              <Label htmlFor="variantLabel">Variant label</Label>
              <Input
                id="variantLabel"
                value={form.variantLabel}
                onChange={(event) => update("variantLabel", event.target.value)}
                required
              />
            </div>
          ) : null}
          <div className="space-y-2">
            <Label htmlFor="brandId">Brand</Label>
            <Select id="brandId" value={form.brandId} onChange={(event) => update("brandId", event.target.value)}>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {brand.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="manufacturerId">Manufacturer</Label>
            <Select
              id="manufacturerId"
              value={form.manufacturerId}
              onChange={(event) => update("manufacturerId", event.target.value)}
            >
              {manufacturers.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="originalLanguageCode">Original language</Label>
            <Select
              id="originalLanguageCode"
              value={form.originalLanguageCode}
              onChange={(event) => update("originalLanguageCode", event.target.value)}
            >
              {languages.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="originalName">Original-language name</Label>
            <Input
              id="originalName"
              value={form.originalName}
              onChange={(event) => update("originalName", event.target.value)}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="englishName">English name</Label>
            <Input
              id="englishName"
              value={form.englishName}
              onChange={(event) => update("englishName", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="sku">SKU (internal, not a GTIN)</Label>
            <Input id="sku" value={form.sku} onChange={(event) => update("sku", event.target.value)} />
          </div>
        </div>
      ) : null}

      {step === 1 ? (
        <div className="space-y-4">
          <p className="text-sm text-muted-foreground">{gtinIssuanceDisclaimer()}</p>
          <div className="space-y-2">
            <Label htmlFor="gtin">Allocated GTIN</Label>
            <Input
              id="gtin"
              value={form.gtin}
              onChange={(event) => update("gtin", event.target.value)}
              placeholder="Optional. Never generated by this platform."
              className="font-mono"
            />
          </div>
          <Button type="button" variant="outline" onClick={() => void validateGtin()}>
            Validate GTIN
          </Button>
          {gtinCheck ? <Alert>{gtinCheck}</Alert> : null}
        </div>
      ) : null}

      {step === 2 ? (
        <div className="grid gap-4 sm:grid-cols-2">
          <div className="space-y-2">
            <Label htmlFor="netContentValue">Net content</Label>
            <Input
              id="netContentValue"
              type="number"
              min="0"
              step="0.01"
              value={form.netContentValue}
              onChange={(event) => update("netContentValue", event.target.value)}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="netContentUnit">Unit</Label>
            <Select
              id="netContentUnit"
              value={form.netContentUnit}
              onChange={(event) => update("netContentUnit", event.target.value)}
            >
              {["G", "KG", "ML", "L", "OZ", "LB", "PIECES"].map((unit) => (
                <option key={unit} value={unit}>
                  {unit}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2 sm:col-span-2">
            <Label htmlFor="ingredients">Ingredients</Label>
            <textarea
              id="ingredients"
              value={form.ingredients}
              onChange={(event) => update("ingredients", event.target.value)}
              className="min-h-24 w-full rounded-md border px-3 py-2 text-sm"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="categoryId">Category</Label>
            <Select
              id="categoryId"
              value={form.categoryId}
              onChange={(event) => update("categoryId", event.target.value)}
            >
              <option value="">None</option>
              {categories.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
          <div className="space-y-2">
            <Label htmlFor="originCountryId">Country of origin</Label>
            <Select
              id="originCountryId"
              value={form.originCountryId}
              onChange={(event) => update("originCountryId", event.target.value)}
            >
              <option value="">Not specified</option>
              {countries.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.label}
                </option>
              ))}
            </Select>
          </div>
        </div>
      ) : null}

      {step === 3 ? (
        <dl className="space-y-2 rounded-xl border border-border p-4 text-sm">
          <div>Name: {form.originalName || "—"}</div>
          <div>English: {form.englishName || "—"}</div>
          <div>GTIN: {form.gtin || "Not assigned yet"}</div>
          <div>
            Net content: {form.netContentValue ? `${form.netContentValue} ${form.netContentUnit}` : "—"}
          </div>
          <p className="text-xs text-muted-foreground">Saved as draft. Publication requires a verified organisation.</p>
        </dl>
      ) : null}

      <div className="flex gap-2">
        {step > 0 ? (
          <Button type="button" variant="outline" onClick={() => setStep((value) => value - 1)}>
            Back
          </Button>
        ) : null}
        {step < STEPS.length - 1 ? (
          <Button type="button" onClick={() => setStep((value) => value + 1)}>
            Continue
          </Button>
        ) : (
          <Button type="button" onClick={() => void submit()} disabled={pending}>
            {pending ? "Saving…" : "Save draft"}
          </Button>
        )}
      </div>
    </div>
  );
}
