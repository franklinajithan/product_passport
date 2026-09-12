import { parseGS1ElementString } from "@/lib/standards/gs1/application-identifiers";
import { toCanonicalGTIN14, validateGTIN } from "@/lib/standards/gs1/gtin";
import { getStandard } from "@/lib/standards/versions";

export type DigitalLinkQualifiers = {
  lot?: string;
  serial?: string;
  cpv?: string;
};

export type DigitalLinkAttributes = {
  expiry?: string;
  bestBefore?: string;
  productionDate?: string;
  netWeight?: string;
};

export type DigitalLinkInput = {
  domain: string;
  gtin: string;
  qualifiers?: DigitalLinkQualifiers;
  attributes?: DigitalLinkAttributes;
};

export type DigitalLinkResult = {
  uri: string;
  primaryIdentifier: string;
  gtin14: string;
  standardVersion: string;
};

function stripTrailingSlash(domain: string): string {
  return domain.replace(/\/+$/, "");
}

function encodePathSegment(value: string): string {
  return encodeURIComponent(value);
}

export function buildGS1DigitalLink(input: DigitalLinkInput): DigitalLinkResult {
  const gtin = validateGTIN(input.gtin);
  if (!gtin.valid || !gtin.canonicalGTIN14) {
    throw new Error("A GS1 Digital Link requires a valid GTIN as the primary identifier.");
  }

  const domain = stripTrailingSlash(input.domain);
  if (!/^https?:\/\//i.test(domain)) {
    throw new Error("Digital Link domain must be an absolute http(s) origin.");
  }

  const segments = ["01", gtin.canonicalGTIN14];
  const qualifiers = input.qualifiers ?? {};

  if (qualifiers.lot) {
    segments.push("10", encodePathSegment(qualifiers.lot));
  }
  if (qualifiers.cpv) {
    segments.push("22", encodePathSegment(qualifiers.cpv));
  }
  if (qualifiers.serial) {
    segments.push("21", encodePathSegment(qualifiers.serial));
  }

  const query = new URLSearchParams();
  const attributes = input.attributes ?? {};
  if (attributes.expiry) query.set("17", attributes.expiry);
  if (attributes.bestBefore) query.set("15", attributes.bestBefore);
  if (attributes.productionDate) query.set("11", attributes.productionDate);
  if (attributes.netWeight) query.set("3103", attributes.netWeight);

  const path = `${domain}/${segments.join("/")}`;
  const uri = query.size > 0 ? `${path}?${query.toString()}` : path;
  const standard = getStandard("GS1_DIGITAL_LINK");

  return {
    uri,
    primaryIdentifier: "01",
    gtin14: gtin.canonicalGTIN14,
    standardVersion: standard?.version ?? "unknown",
  };
}

export type ParsedDigitalLink = {
  gtin14: string | null;
  qualifiers: Record<string, string>;
  attributes: Record<string, string>;
};

export function parseGS1DigitalLink(uri: string): ParsedDigitalLink | null {
  let parsed: URL;
  try {
    parsed = new URL(uri);
  } catch {
    return null;
  }

  const parts = parsed.pathname.split("/").filter(Boolean);
  const qualifiers: Record<string, string> = {};
  let gtin14: string | null = null;

  for (let index = 0; index < parts.length; index += 2) {
    const ai = parts[index];
    const value = parts[index + 1] ? decodeURIComponent(parts[index + 1]) : "";
    if (!ai || !value) {
      continue;
    }
    if (ai === "01") {
      const digits = value.replace(/\D/g, "");
      gtin14 = digits.length >= 8 && digits.length <= 14 ? toCanonicalGTIN14(digits) : digits;
    } else {
      qualifiers[ai] = value;
    }
  }

  const attributes: Record<string, string> = {};
  parsed.searchParams.forEach((value, key) => {
    attributes[key] = value;
  });

  if (!gtin14 && parsed.searchParams.get("barcode")) {
    return null;
  }

  return { gtin14, qualifiers, attributes };
}

export function extractGtinFromPayload(payload: string): string | null {
  const trimmed = payload.trim();
  const asGtin = validateGTIN(trimmed);
  if (asGtin.valid) {
    return asGtin.displayValue;
  }

  const digital = parseGS1DigitalLink(trimmed);
  if (digital?.gtin14 && validateGTIN(digital.gtin14).valid) {
    return digital.gtin14;
  }

  const element = parseGS1ElementString(trimmed);
  const gtinAi = element.values.find((item) => item.ai === "01");
  if (gtinAi) {
    const nested = validateGTIN(gtinAi.value);
    if (nested.valid) {
      return nested.displayValue;
    }
  }

  return null;
}
