import { StandardsArticle } from "@/components/marketing/standards-article";

export default function BarcodesStandardPage() {
  return (
    <StandardsArticle title="Barcode carriers">
      <p>
        A barcode symbol encodes an identifier. EAN-13, UPC-A, ITF-14, GS1-128, GS1 DataMatrix and
        GS1 QR are carriers. Not every GTIN should be drawn as EAN-13. GTIN-14 typically uses
        ITF-14 on outer packs. 2D symbols can carry Application Identifiers and Digital Links.
      </p>
      <p>Generating a symbol is not issuing a GTIN. The UI says “Barcode symbol generated from GTIN …”. </p>
    </StandardsArticle>
  );
}
