import { NextResponse } from "next/server";
import { prisma } from "@/database/client";

export async function GET() {
  const categories = await prisma.category.findMany({
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, slug: true, name: true, parentId: true },
  });
  return NextResponse.json({ categories });
}
