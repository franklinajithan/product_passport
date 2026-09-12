import Link from "next/link";
import { StandardsArticle } from "@/components/marketing/standards-article";
import { Button } from "@/components/ui/button";

export default function TwoDMigrationPage() {
  return (
    <StandardsArticle title="1D to 2D migration">
      <p>
        Retail is moving from linear EAN-13 towards GS1 QR and GS1 DataMatrix while keeping the
        same GTIN. 2D symbols can add batch, expiry, serial and a Digital Link to the product
        passport. Identifiers stay independent of the physical carrier.
      </p>
      <Button asChild className="mt-4">
        <Link href="/tools/digital-link-builder">Build a Digital Link</Link>
      </Button>
    </StandardsArticle>
  );
}
