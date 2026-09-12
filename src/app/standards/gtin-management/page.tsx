import { StandardsArticle } from "@/components/marketing/standards-article";
import { GtinDecisionBadge } from "@/components/platform/gtin-decision";

export default function GtinManagementStandardPage() {
  return (
    <StandardsArticle title="GTIN management">
      <p>
        Declared net content, pack quantity, packaging level, primary brand and formulation are
        examples of fields that can require a new GTIN. Marketing copy may not. The engine returns
        SAME_GTIN, REVIEW_REQUIRED or NEW_GTIN_REQUIRED with an explanation. Rules are data, not
        hardcoded “any edit = new GTIN”.
      </p>
      <div className="flex flex-wrap gap-2 pt-2">
        <GtinDecisionBadge decision="SAME_GTIN" />
        <GtinDecisionBadge decision="REVIEW_REQUIRED" />
        <GtinDecisionBadge decision="NEW_GTIN_REQUIRED" />
      </div>
    </StandardsArticle>
  );
}
