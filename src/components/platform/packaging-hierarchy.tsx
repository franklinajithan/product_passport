import { DEMO_PACKAGING } from "@/data/demo-showcase";
import { cn } from "@/utilities/cn";

export function PackagingHierarchy({
  nodes = DEMO_PACKAGING,
  className,
}: {
  nodes?: typeof DEMO_PACKAGING;
  className?: string;
}) {
  return (
    <ol className={cn("space-y-0", className)}>
      {nodes.map((node, index) => (
        <li key={node.gtin + node.level}>
          {index > 0 ? (
            <p className="py-3 pl-4 text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
              ↓ {node.quantityFromChild} × previous level
            </p>
          ) : null}
          <article className="rounded-xl border border-border bg-background p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">{node.level}</p>
            <p className="mt-1 font-mono text-sm">{node.gtin}</p>
            <p className="mt-2 text-sm text-muted-foreground">
              Carrier: {node.carrier}
              {node.note ? ` · ${node.note}` : null}
            </p>
          </article>
        </li>
      ))}
    </ol>
  );
}
