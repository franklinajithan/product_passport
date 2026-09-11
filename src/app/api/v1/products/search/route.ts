import { NextResponse } from "next/server";
import { searchProducts } from "@/services/product.service";
import { enforceRateLimit } from "@/utilities/rate-limit";
import { RateLimitError } from "@/utilities/errors";
import { searchQuerySchema } from "@/validation/search";

export async function GET(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "anonymous";
    enforceRateLimit({ key: `api-search:${ip}`, limit: 30, windowMs: 60_000 });

    const { searchParams } = new URL(request.url);
    const parsed = searchQuerySchema.safeParse({ q: searchParams.get("q") ?? "" });
    if (!parsed.success) {
      return NextResponse.json({ error: "Query parameter q is required." }, { status: 400 });
    }

    const results = await searchProducts(parsed.data.q);
    return NextResponse.json({ results });
  } catch (error) {
    if (error instanceof RateLimitError) {
      return NextResponse.json({ error: error.message }, { status: 429 });
    }
    throw error;
  }
}
