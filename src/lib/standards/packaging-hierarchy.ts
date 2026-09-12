import type { PackagingLevel } from "@/lib/standards/types";

const RANK: Record<PackagingLevel, number> = {
  CONSUMER_UNIT: 10,
  INNER_PACK: 20,
  CASE: 30,
  TRAY: 30,
  DISPLAY: 40,
  PALLET: 50,
  LOGISTIC_UNIT: 60,
};

export type HierarchyCandidate = {
  parentProductId: string;
  childProductId: string;
  parentGtin: string | null;
  childGtin: string | null;
  parentLevel: PackagingLevel;
  childLevel: PackagingLevel;
  quantity: number;
};

export type HierarchyValidation = {
  ok: boolean;
  errors: string[];
};

export function packagingLevelRank(level: PackagingLevel): number {
  return RANK[level];
}

export function validatePackagingHierarchy(link: HierarchyCandidate): HierarchyValidation {
  const errors: string[] = [];

  if (link.parentProductId === link.childProductId) {
    errors.push("A packaging node cannot contain itself.");
  }

  if (!Number.isInteger(link.quantity) || link.quantity < 1) {
    errors.push("Contained quantity must be an integer of at least 1.");
  }

  if (packagingLevelRank(link.parentLevel) <= packagingLevelRank(link.childLevel)) {
    errors.push(
      "The parent packaging level must be higher than the contained item. Do not reuse a consumer-unit GTIN for a case, pallet or other logistic level.",
    );
  }

  if (link.parentGtin && link.childGtin && link.parentGtin === link.childGtin) {
    errors.push(
      "Each packaging level needs its own GTIN. The contained trade item GTIN must not be reused on the parent pack.",
    );
  }

  return { ok: errors.length === 0, errors };
}
