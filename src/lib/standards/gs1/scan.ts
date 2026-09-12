import { parseGS1ElementString } from "@/lib/standards/gs1/application-identifiers";
import { extractGtinFromPayload, parseGS1DigitalLink } from "@/lib/standards/gs1/digital-link";
import { validateGTIN } from "@/lib/standards/gs1/gtin";
import type { BarcodeSymbology } from "@/lib/standards/types";

export type ScanDecodeResult = {
  symbologyHint: BarcodeSymbology | "UNKNOWN";
  rawPayload: string;
  gtin: string | null;
  canonicalGTIN14: string | null;
  checkDigitValid: boolean;
  lot: string | null;
  serial: string | null;
  expiry: string | null;
  bestBefore: string | null;
  productionDate: string | null;
  applicationIdentifiers: Array<{ ai: string; title: string; value: string }>;
  digitalLink: string | null;
};

export function decodeScannedPayload(
  rawPayload: string,
  detectedFormat?: string,
): ScanDecodeResult {
  const trimmed = rawPayload.trim();
  const format = (detectedFormat ?? "").toLowerCase();

  const gtin = extractGtinFromPayload(trimmed);
  const gtinResult = gtin ? validateGTIN(gtin) : null;
  const digital = parseGS1DigitalLink(trimmed);
  const element = parseGS1ElementString(trimmed);

  const ais = element.values.length
    ? element.values
    : digital
      ? [
          ...(digital.gtin14 ? [{ ai: "01", title: "GTIN", value: digital.gtin14 }] : []),
          ...Object.entries(digital.qualifiers).map(([ai, value]) => ({
            ai,
            title: ai,
            value,
          })),
          ...Object.entries(digital.attributes).map(([ai, value]) => ({
            ai,
            title: ai,
            value,
          })),
        ]
      : [];

  const findAi = (...codes: string[]) =>
    ais.find((item) => codes.includes(item.ai))?.value ?? null;

  let symbologyHint: ScanDecodeResult["symbologyHint"] = "UNKNOWN";
  if (format.includes("ean_13") || format.includes("ean-13")) symbologyHint = "EAN_13";
  else if (format.includes("ean_8") || format.includes("ean-8")) symbologyHint = "EAN_8";
  else if (format.includes("upc_a") || format.includes("upc-a")) symbologyHint = "UPC_A";
  else if (format.includes("upc_e")) symbologyHint = "UPC_E";
  else if (format.includes("qr")) symbologyHint = digital ? "GS1_QR_CODE" : "QR_CODE";
  else if (format.includes("data_matrix") || format.includes("datamatrix")) {
    symbologyHint = element.ok ? "GS1_DATAMATRIX" : "DATA_MATRIX";
  } else if (format.includes("code_128") || format.includes("gs1-128")) {
    symbologyHint = "GS1_128";
  } else if (gtinResult?.carrierHint === "EAN_13") symbologyHint = "EAN_13";
  else if (gtinResult?.carrierHint === "UPC_A") symbologyHint = "UPC_A";
  else if (gtinResult?.carrierHint === "EAN_8") symbologyHint = "EAN_8";
  else if (gtinResult?.carrierHint === "ITF_14") symbologyHint = "ITF_14";

  return {
    symbologyHint,
    rawPayload: trimmed,
    gtin: gtinResult?.displayValue ?? null,
    canonicalGTIN14: gtinResult?.canonicalGTIN14 ?? null,
    checkDigitValid: gtinResult?.checkDigitValid ?? false,
    lot: findAi("10"),
    serial: findAi("21"),
    expiry: findAi("17"),
    bestBefore: findAi("15"),
    productionDate: findAi("11"),
    applicationIdentifiers: ais.map((item) => ({
      ai: item.ai,
      title: item.title,
      value: item.value,
    })),
    digitalLink: digital ? trimmed : null,
  };
}
