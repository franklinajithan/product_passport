export type ResolverLinkRel =
  | "product"
  | "ingredients"
  | "nutrition"
  | "instructions"
  | "safety"
  | "recall"
  | "traceability"
  | "sustainability"
  | "manufacturer";

export type ResolverLink = {
  rel: ResolverLinkRel;
  href: string;
  title: string;
};

function parseAcceptLanguage(header: string | null | undefined): string[] {
  if (!header) {
    return [];
  }

  return header
    .split(",")
    .map((part) => {
      const [tag, ...params] = part.trim().split(";");
      const q = params.find((item) => item.trim().startsWith("q="));
      const quality = q ? Number(q.trim().slice(2)) : 1;
      return { tag: tag.trim().toLowerCase(), quality: Number.isFinite(quality) ? quality : 1 };
    })
    .filter((item) => item.tag)
    .sort((left, right) => right.quality - left.quality)
    .map((item) => item.tag);
}

export function pickTranslationLanguage(
  available: string[],
  preferred: string[],
  fallback = "en",
): string {
  const normalisedAvailable = available.map((code) => code.toLowerCase());

  for (const tag of preferred) {
    const exact = normalisedAvailable.find((code) => code === tag);
    if (exact) {
      return exact;
    }
    const prefix = tag.split("-")[0];
    const language = normalisedAvailable.find((code) => code === prefix || code.startsWith(`${prefix}-`));
    if (language) {
      return language;
    }
  }

  if (normalisedAvailable.includes(fallback)) {
    return fallback;
  }

  return normalisedAvailable[0] ?? fallback;
}

export function preferredLanguagesFromRequest(options: {
  queryLanguage?: string | null;
  acceptLanguage?: string | null;
}): string[] {
  const query = options.queryLanguage?.trim().toLowerCase();
  return [query, ...parseAcceptLanguage(options.acceptLanguage)].filter(
    (item): item is string => Boolean(item),
  );
}

export function buildResolverLinks(options: {
  appUrl: string;
  gtin: string;
  language: string;
  hasRecall?: boolean;
}): ResolverLink[] {
  const base = `${options.appUrl.replace(/\/+$/, "")}/product/${options.gtin}`;
  const lang = `lang=${encodeURIComponent(options.language)}`;

  const links: ResolverLink[] = [
    { rel: "product", href: `${base}?${lang}`, title: "Product information" },
    { rel: "ingredients", href: `${base}?${lang}#ingredients`, title: "Ingredients" },
    { rel: "nutrition", href: `${base}?${lang}#nutrition`, title: "Nutrition" },
    { rel: "instructions", href: `${base}?${lang}#usage`, title: "Instructions" },
    { rel: "safety", href: `${base}?${lang}#warnings`, title: "Safety information" },
    { rel: "traceability", href: `${base}?${lang}#traceability`, title: "Traceability information" },
    { rel: "sustainability", href: `${base}?${lang}#packaging`, title: "Sustainability information" },
    { rel: "manufacturer", href: `${base}?${lang}#manufacturer`, title: "Manufacturer website" },
  ];

  if (options.hasRecall) {
    links.splice(5, 0, {
      rel: "recall",
      href: `${base}?${lang}#recall`,
      title: "Recall information",
    });
  }

  return links;
}
