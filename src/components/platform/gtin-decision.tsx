import { cn } from "@/utilities/cn";
import type { GtinDecision } from "@/lib/standards/types";

const STYLES: Record<GtinDecision, string> = {
  SAME_GTIN: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  REVIEW_REQUIRED: "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
  NEW_GTIN_REQUIRED: "border-red-200 bg-red-50 text-red-900 dark:border-red-900 dark:bg-red-950 dark:text-red-100",
};

const LABELS: Record<GtinDecision, string> = {
  SAME_GTIN: "SAME GTIN",
  REVIEW_REQUIRED: "REVIEW REQUIRED",
  NEW_GTIN_REQUIRED: "NEW GTIN REQUIRED",
};

export function GtinDecisionBadge({
  decision,
  className,
}: {
  decision: GtinDecision;
  className?: string;
}) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide",
        STYLES[decision],
        className,
      )}
    >
      {LABELS[decision]}
    </span>
  );
}
