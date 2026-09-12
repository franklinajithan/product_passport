"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { addPackagingLinkAction } from "@/features/products/actions";
import { Alert } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select } from "@/components/ui/select";

type ProductOption = { id: string; label: string };

export function PackagingForm({ products }: { products: ProductOption[] }) {
  const router = useRouter();
  const [parentProductId, setParentProductId] = useState(products[1]?.id ?? products[0]?.id ?? "");
  const [childProductId, setChildProductId] = useState(products[0]?.id ?? "");
  const [quantity, setQuantity] = useState("6");
  const [parentLevel, setParentLevel] = useState("INNER_PACK");
  const [childLevel, setChildLevel] = useState("CONSUMER_UNIT");
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    setPending(true);
    setError(null);
    const result = await addPackagingLinkAction({
      parentProductId,
      childProductId,
      quantity: Number(quantity),
      parentLevel,
      childLevel,
    });
    setPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    router.refresh();
  }

  if (products.length < 2) {
    return (
      <Alert>
        Create at least two trade items before linking a packaging hierarchy. Each level needs its own GTIN.
      </Alert>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-8 space-y-3 rounded-xl border border-border p-4">
      <h2 className="text-sm font-semibold">Add packaging relationship</h2>
      {error ? <Alert variant="destructive">{error}</Alert> : null}
      <div className="space-y-2">
        <Label htmlFor="parentProductId">Outer pack</Label>
        <Select id="parentProductId" value={parentProductId} onChange={(event) => setParentProductId(event.target.value)}>
          {products.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="space-y-2">
        <Label htmlFor="childProductId">Contained item</Label>
        <Select id="childProductId" value={childProductId} onChange={(event) => setChildProductId(event.target.value)}>
          {products.map((item) => (
            <option key={item.id} value={item.id}>
              {item.label}
            </option>
          ))}
        </Select>
      </div>
      <div className="grid gap-3 sm:grid-cols-3">
        <div className="space-y-2">
          <Label htmlFor="quantity">Quantity contained</Label>
          <Input id="quantity" type="number" min="1" value={quantity} onChange={(event) => setQuantity(event.target.value)} />
        </div>
        <div className="space-y-2">
          <Label htmlFor="parentLevel">Parent level</Label>
          <Select id="parentLevel" value={parentLevel} onChange={(event) => setParentLevel(event.target.value)}>
            {["INNER_PACK", "CASE", "TRAY", "DISPLAY", "PALLET", "LOGISTIC_UNIT"].map((level) => (
              <option key={level} value={level}>
                {level.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="childLevel">Child level</Label>
          <Select id="childLevel" value={childLevel} onChange={(event) => setChildLevel(event.target.value)}>
            {["CONSUMER_UNIT", "INNER_PACK", "CASE", "TRAY", "DISPLAY", "PALLET"].map((level) => (
              <option key={level} value={level}>
                {level.replaceAll("_", " ")}
              </option>
            ))}
          </Select>
        </div>
      </div>
      <Button type="submit" disabled={pending}>
        {pending ? "Saving…" : "Save relationship"}
      </Button>
    </form>
  );
}
