import type { GtinDecision, RuleSeverity } from "@/lib/standards/types";
import { DEFAULT_GTIN_MANAGEMENT_RULES } from "./default-rules";
import type {
  GtinManagementResult,
  GtinManagementRule,
  GtinRuleHit,
  ProductIdentitySnapshot,
} from "./types";

const DECISION_RANK: Record<GtinDecision, number> = {
  SAME_GTIN: 0,
  REVIEW_REQUIRED: 1,
  NEW_GTIN_REQUIRED: 2,
};

const SEVERITY_RANK: Record<RuleSeverity, number> = {
  INFO: 0,
  WARNING: 1,
  BLOCKING: 2,
};

function valuesDiffer(left: unknown, right: unknown): boolean {
  if (left === right) {
    return false;
  }
  if (left === null || left === undefined || left === "") {
    return !(right === null || right === undefined || right === "");
  }
  return String(left) !== String(right);
}

function percentChange(previous: number, next: number): number {
  if (previous === 0) {
    return next === 0 ? 0 : 100;
  }
  return (Math.abs(next - previous) / Math.abs(previous)) * 100;
}

function ruleMatches(
  rule: GtinManagementRule,
  previous: ProductIdentitySnapshot,
  next: ProductIdentitySnapshot,
): boolean {
  const before = previous[rule.field];
  const after = next[rule.field];

  if (rule.comparator === "changed") {
    return valuesDiffer(before, after);
  }

  if (typeof before !== "number" || typeof after !== "number") {
    return valuesDiffer(before, after);
  }

  return percentChange(before, after) > (rule.thresholdPercent ?? 0);
}

export function evaluateProductChange(
  previous: ProductIdentitySnapshot,
  next: ProductIdentitySnapshot,
  rules: GtinManagementRule[] = DEFAULT_GTIN_MANAGEMENT_RULES,
): GtinManagementResult {
  const hits: GtinRuleHit[] = rules
    .filter((rule) => rule.enabled)
    .filter((rule) => ruleMatches(rule, previous, next))
    .map((rule) => ({
      id: rule.id,
      field: rule.field,
      decision: rule.decision,
      severity: rule.severity,
      explanation: rule.explanation,
    }));

  let decision: GtinDecision = "SAME_GTIN";
  let severity: RuleSeverity = "INFO";

  for (const hit of hits) {
    if (DECISION_RANK[hit.decision] > DECISION_RANK[decision]) {
      decision = hit.decision;
    }
    if (SEVERITY_RANK[hit.severity] > SEVERITY_RANK[severity]) {
      severity = hit.severity;
    }
  }

  const explanation =
    hits.length === 0
      ? "No identification-impacting fields changed. The existing GTIN may be retained."
      : hits
          .slice()
          .sort((left, right) => DECISION_RANK[right.decision] - DECISION_RANK[left.decision])
          .map((hit) => hit.explanation)
          .join(" ");

  const active = rules.find((rule) => rule.enabled);

  return {
    decision,
    rules: hits,
    explanation,
    severity,
    standardKey: active?.standardKey ?? "GS1_GTIN_MANAGEMENT",
    standardVersion: active?.standardVersion ?? "2.0.1",
  };
}

export { DEFAULT_GTIN_MANAGEMENT_RULES } from "./default-rules";
export type {
  GtinManagementResult,
  GtinManagementRule,
  ProductIdentitySnapshot,
} from "./types";
