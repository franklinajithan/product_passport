import { NextResponse } from "next/server";
import { z } from "zod";
import { renderBarcodeSymbol } from "@/lib/barcodes/render";
import type { BarcodeSymbology } from "@/lib/standards/types";
import { enforceRateLimit } from "@/utilities/rate-limit";
import { RateLimitError } from "@/utilities/errors";

const bodySchema = z.object({
  value: z.string().min(1),
  symbology: z.enum([
    "EAN_8",
    "EAN_13",
    "UPC_A",
    "UPC_E",
    "ITF_14",
    "GS1_128",
    "GS1_DATABAR",
    "GS1_DATAMATRIX",
    "GS1_QR_CODE",
    "QR_CODE",
    "DATA_MATRIX",
  ]),
  format: z.enum(["svg", "png"]).default("svg"),
});

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    enforceRateLimit({ key: `barcode-render:${ip}`, limit: 30, windowMs: 60_000 });

    const parsed = bodySchema.safeParse(await request.json());
    if (!parsed.success) {
      return NextResponse.json({ error: "value and a supported symbology are required." }, { status: 400 });
    }

    const result = await renderBarcodeSymbol({
      value: parsed.data.value,
      symbology: parsed.data.symbology as BarcodeSymbology,
      format: parsed.data.format,
    });

    if (!result.ok) {
      return NextResponse.json(result, { status: 422 });
    }

    return NextResponse.json(result);
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    throw error;
  }
}
