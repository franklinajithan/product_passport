import { StandardsArticle } from "@/components/marketing/standards-article";

export default function GtinStandardPage() {
  return (
    <StandardsArticle title="GTIN">
      <p>
        A GTIN is a GS1 identifier for a trade item. It is not a barcode image, SKU, QR code or
        product database row. This platform stores a printed form and a canonical GTIN-14 for
        comparison. Printing still uses the carrier-appropriate representation.
      </p>
      <p>
        Example: GTIN-13 5901234123457 is stored as canonical 05901234123457. That padding does
        not change the barcode printed on the pack.
      </p>
      <p>
        Official GTINs are allocated through a GS1 Member Organisation. This application validates,
        stores and manages allocated values. It does not invent official numbers.
      </p>
    </StandardsArticle>
  );
}
