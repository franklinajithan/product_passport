import type { ReactNode } from "react";

export const TERMINOLOGY: Record<string, string> = {
  GTIN: "Global Trade Item Number — the GS1 identifier for a trade item. It is not a barcode image.",
  "Barcode symbol": "The printed or displayed carrier (EAN-13, UPC-A, GS1 DataMatrix, and so on) that encodes an identifier.",
  "Barcode carrier": "The symbology used to encode an identifier. The same GTIN can be carried by more than one symbol.",
  "Product identifier": "Any identifier attached to a product, including GTINs, SKUs, MPNs and internal codes.",
  "Brand owner": "The party normally responsible for allocating GTINs to a trade item. Not always the manufacturer.",
  Manufacturer: "The party that produces the item. Distinct from the brand owner, importer or retailer.",
  "GS1 Digital Link": "A URI that identifies a product using GS1 Application Identifiers in the path, such as /01/{gtin}.",
  "Internal SKU": "A company-specific stock code. It is not a globally registered GS1 GTIN.",
  "Check digit": "A GS1 Modulo-10 digit that detects typing errors. A valid check digit does not prove official allocation.",
  "Company prefix": "A GS1 prefix licensed to an organisation. It does not identify the country of manufacture.",
};

export function Term({
  term,
  children,
}: {
  term: keyof typeof TERMINOLOGY | string;
  children?: ReactNode;
}) {
  const title = TERMINOLOGY[term] ?? String(term);
  return (
    <abbr title={title} className="cursor-help decoration-dotted underline-offset-2">
      {children ?? term}
    </abbr>
  );
}
