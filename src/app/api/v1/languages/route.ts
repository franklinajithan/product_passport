import { NextResponse } from "next/server";
import { prisma } from "@/database/client";

export async function GET() {
  const languages = await prisma.language.findMany({
    orderBy: { name: "asc" },
    select: { code: true, name: true, nativeName: true, isRecommended: true },
  });
  return NextResponse.json({ languages });
}
