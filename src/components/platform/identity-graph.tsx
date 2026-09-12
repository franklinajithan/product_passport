import { cn } from "@/utilities/cn";

const NODES = [
  { id: "owner", label: "Brand owner", className: "lg:col-start-2" },
  { id: "mfr", label: "Manufacturer", className: "lg:col-start-2" },
  { id: "product", label: "Product / GTIN", className: "lg:col-start-2" },
  { id: "each", label: "Each", className: "lg:col-start-1" },
  { id: "case", label: "Case", className: "lg:col-start-2" },
  { id: "pallet", label: "Pallet", className: "lg:col-start-3" },
  { id: "importer", label: "Importer", className: "lg:col-start-2" },
  { id: "distributor", label: "Distributor", className: "lg:col-start-2" },
  { id: "retailer", label: "Retailer", className: "lg:col-start-2" },
  { id: "countries", label: "Countries of sale", className: "lg:col-start-2" },
];

export function IdentityGraph({ className }: { className?: string }) {
  return (
    <div className={cn("grid grid-cols-1 gap-3 text-center lg:grid-cols-3", className)}>
      {NODES.map((node) => (
        <div key={node.id} className={cn("flex flex-col items-center", node.className)}>
          {node.id !== "owner" ? (
            <span className="mb-2 h-4 w-px bg-border" aria-hidden />
          ) : null}
          <div className="w-full max-w-xs rounded-lg border border-border bg-background px-4 py-3 text-sm font-medium">
            {node.label}
          </div>
        </div>
      ))}
      <p className="text-xs text-muted-foreground lg:col-span-3">
        Brand owner, manufacturer and importer are separate parties. Packaging levels are separate trade items.
      </p>
    </div>
  );
}
