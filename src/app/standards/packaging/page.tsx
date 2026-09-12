import { StandardsArticle } from "@/components/marketing/standards-article";
import { PackagingHierarchy } from "@/components/platform/packaging-hierarchy";

export default function PackagingStandardPage() {
  return (
    <StandardsArticle title="Packaging hierarchy">
      <p>
        Consumer unit, inner pack, case, tray, display, pallet and logistic unit are different trade
        items. Each level that needs identification gets its own GTIN. SSCC identifies logistics
        units and is not a GTIN.
      </p>
      <PackagingHierarchy />
    </StandardsArticle>
  );
}
