import {
  evaluateProductChange,
  type GtinManagementResult,
  type ProductIdentitySnapshot,
} from "@/lib/standards/gs1/gtin-management";

export type PublishGate = {
  allowDirectReplacement: boolean;
  requireSuccessor: boolean;
  warning: boolean;
  result: GtinManagementResult;
};

export function evaluatePublishGate(
  previous: ProductIdentitySnapshot,
  next: ProductIdentitySnapshot,
): PublishGate {
  const result = evaluateProductChange(previous, next);

  if (result.decision === "NEW_GTIN_REQUIRED") {
    return {
      allowDirectReplacement: false,
      requireSuccessor: true,
      warning: false,
      result,
    };
  }

  if (result.decision === "REVIEW_REQUIRED") {
    return {
      allowDirectReplacement: false,
      requireSuccessor: false,
      warning: true,
      result,
    };
  }

  return {
    allowDirectReplacement: true,
    requireSuccessor: false,
    warning: false,
    result,
  };
}
