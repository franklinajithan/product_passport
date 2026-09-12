import bwipjs from "bwip-js/node";
import type { BarcodeSymbology } from "@/lib/standards/types";
import { barcodeGeneratedMessage } from "@/lib/standards/identifiers/namespace";
import { validateSymbologyPayload } from "@/lib/standards/gs1/symbologies";

const BCID: Record<BarcodeSymbology, string> = {
  EAN_8: "ean8",
  EAN_13: "ean13",
  UPC_A: "upca",
  UPC_E: "upce",
  ITF_14: "itf14",
  GS1_128: "gs1-128",
  GS1_DATABAR: "databaromni",
  GS1_DATAMATRIX: "gs1datamatrix",
  GS1_QR_CODE: "gs1qrcode",
  QR_CODE: "qrcode",
  DATA_MATRIX: "datamatrix",
};

export type RenderRequest = {
  value: string;
  symbology: BarcodeSymbology;
  format: "svg" | "png";
  scale?: number;
  height?: number;
  includeText?: boolean;
};

export type RenderResult = {
  ok: boolean;
  errors: string[];
  warnings: string[];
  message: string | null;
  mimeType: "image/svg+xml" | "image/png" | null;
  body: string | null;
  encodedData: string | null;
  humanReadableText: string | null;
};

export async function renderBarcodeSymbol(request: RenderRequest): Promise<RenderResult> {
  const scale = request.scale ?? 3;
  const validation = validateSymbologyPayload(request.symbology, request.value, {
    magnification: scale / 3,
  });

  if (!validation.ok) {
    return {
      ok: false,
      errors: validation.errors,
      warnings: validation.warnings,
      message: null,
      mimeType: null,
      body: null,
      encodedData: null,
      humanReadableText: null,
    };
  }

  const options = {
    bcid: BCID[request.symbology],
    text: validation.encodedData,
    scale,
    height: request.height ?? 16,
    includetext: request.includeText ?? true,
    textxalign: "center" as const,
  };

  try {
    if (request.format === "svg") {
      const svg = bwipjs.toSVG(options);
      return {
        ok: true,
        errors: [],
        warnings: validation.warnings,
        message: barcodeGeneratedMessage(validation.humanReadableText),
        mimeType: "image/svg+xml",
        body: svg,
        encodedData: validation.encodedData,
        humanReadableText: validation.humanReadableText,
      };
    }

    const png = await bwipjs.toBuffer(options);
    return {
      ok: true,
      errors: [],
      warnings: validation.warnings,
      message: barcodeGeneratedMessage(validation.humanReadableText),
      mimeType: "image/png",
      body: png.toString("base64"),
      encodedData: validation.encodedData,
      humanReadableText: validation.humanReadableText,
    };
  } catch (error) {
    return {
      ok: false,
      errors: [error instanceof Error ? error.message : "Symbol encoding failed."],
      warnings: validation.warnings,
      message: null,
      mimeType: null,
      body: null,
      encodedData: validation.encodedData,
      humanReadableText: validation.humanReadableText,
    };
  }
}
