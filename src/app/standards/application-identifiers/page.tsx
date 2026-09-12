import { StandardsArticle } from "@/components/marketing/standards-article";

export default function AiStandardPage() {
  return (
    <StandardsArticle title="Application Identifiers">
      <p>
        GS1 element strings are parsed, not concatenated as opaque text. AI 01 is GTIN, 10 batch,
        11 production date, 15 best before, 17 expiry, 21 serial. A scanned 2D payload is decoded
        into those fields before product lookup.
      </p>
    </StandardsArticle>
  );
}
