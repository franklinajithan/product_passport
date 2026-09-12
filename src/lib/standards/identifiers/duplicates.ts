export const GTIN_ALREADY_EXISTS = "GTIN already exists.";

export const DUPLICATE_GTIN_ACTIONS = [
  "View Product",
  "Request Ownership",
  "Report Incorrect Assignment",
] as const;

export function duplicateGtinError(existing: { id: string; productId: string | null }) {
  return {
    ok: false as const,
    error: GTIN_ALREADY_EXISTS,
    identifierId: existing.id,
    productId: existing.productId,
    actions: [...DUPLICATE_GTIN_ACTIONS],
  };
}
