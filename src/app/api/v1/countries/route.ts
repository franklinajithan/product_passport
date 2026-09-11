import { NextResponse } from "next/server";
import { prisma } from "@/database/client";

export async function GET() {
  const countries = await prisma.country.findMany({
    orderBy: { name: "asc" },
    select: { id: true, iso2: true, iso3: true, name: true },
  });
  return NextResponse.json({ countries });
}
