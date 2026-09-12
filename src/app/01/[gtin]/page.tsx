import Link from "next/link";
import { headers } from "next/headers";
import { findProductByGtin } from "@/services/product.service";
import { validateGTIN } from "@/lib/standards/gs1/gtin";
import {
  buildResolverLinks,
  pickTranslationLanguage,
  preferredLanguagesFromRequest,
} from "@/lib/standards/gs1/resolver";
import { gtinIssuanceDisclaimer } from "@/lib/standards/identifiers/namespace";

export default async function DigitalLinkResolverPage({
  params,
  searchParams,
}: {
  params: Promise<{ gtin: string }>;
  searchParams: Promise<{ lang?: string }>;
}) {
  const { gtin } = await params;
  const { lang } = await searchParams;
  const parsed = validateGTIN(gtin);
  const product = parsed.valid ? await findProductByGtin(gtin) : null;
  const headerList = await headers();
  const appUrl = process.env.APP_URL ?? "http://localhost:3000";
  const available = product?.translations.map((item) => item.languageCode) ?? ["en"];
  const language = pickTranslationLanguage(
    available,
    preferredLanguagesFromRequest({
      queryLanguage: lang,
      acceptLanguage: headerList.get("accept-language"),
    }),
  );
  const translation = product?.translations.find((item) => item.languageCode === language);
  const displayGtin = parsed.displayValue || gtin;
  const links = product
    ? buildResolverLinks({
        appUrl,
        gtin: displayGtin,
        language,
        hasRecall: Boolean(product.recalls[0]),
      })
    : [];

  return (
    <div className="mx-auto w-full max-w-2xl px-4 py-12 space-y-6">
      <p className="text-xs font-medium uppercase tracking-wide text-muted-foreground">
        GS1 Digital Link resolver
      </p>
      <h1 className="text-2xl font-semibold tracking-tight">
        {translation?.productName ?? (product ? product.brand.name : "Identifier not in registry")}
      </h1>
      <p className="text-sm text-muted-foreground">
        Primary identifier AI 01 · GTIN {displayGtin}
        {parsed.canonicalGTIN14 ? ` · canonical ${parsed.canonicalGTIN14}` : ""}
      </p>
      <p className="text-sm">Selected language: {language.toUpperCase()}</p>
      {product ? (
        <ul className="divide-y rounded-xl border border-border">
          {links.map((link) => (
            <li key={link.rel}>
              <Link href={link.href} className="block px-4 py-3 text-sm hover:bg-muted/40">
                {link.title}
              </Link>
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-sm text-muted-foreground">
          This URI follows GS1 Digital Link syntax, but no product record is linked yet.
        </p>
      )}
      <p className="text-xs leading-5 text-muted-foreground">{gtinIssuanceDisclaimer()}</p>
    </div>
  );
}
