import type { GtinDecision, RuleSeverity } from "@/lib/standards/types";

export type ProductIdentitySnapshot = {
  gtin?: string | null;
  brand?: string | null;
  primaryBrand?: string | null;
  consumerFacingName?: string | null;
  netContentValue?: number | null;
  netContentUnit?: string | null;
  packQuantity?: number | null;
  packagingLevel?: string | null;
  grossWeightValue?: number | null;
  formulationKey?: string | null;
  functionality?: string | null;
  regulatoryDeclaration?: string | null;
  lengthMm?: number | null;
  widthMm?: number | null;
  heightMm?: number | null;
};

export type GtinManagementRule = {
  id: string;
  field: keyof ProductIdentitySnapshot;
  comparator: "changed" | "changedBeyondPercent";
  thresholdPercent?: number;
  decision: GtinDecision;
  severity: RuleSeverity;
  explanation: string;
  enabled: boolean;
  standardKey: string;
  standardVersion: string;
};

export type GtinRuleHit = {
  id: string;
  field: string;
  decision: GtinDecision;
  severity: RuleSeverity;
  explanation: string;
};

export type GtinManagementResult = {
  decision: GtinDecision;
  rules: GtinRuleHit[];
  explanation: string;
  severity: RuleSeverity;
  standardKey: string;
  standardVersion: string;
};
