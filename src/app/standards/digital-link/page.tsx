import { StandardsArticle } from "@/components/marketing/standards-article";

export default function DigitalLinkStandardPage() {
  return (
    <StandardsArticle title="GS1 Digital Link">
      <p>
        A Digital Link uses Application Identifiers in the URI path, for example
        https://example.com/01/05901234567893. Query-string shortcuts such as ?barcode=123 are not
        Digital Links. This resolver can negotiate language and point to product, ingredients,
        recall and manufacturer information.
      </p>
    </StandardsArticle>
  );
}
