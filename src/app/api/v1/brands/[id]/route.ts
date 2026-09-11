import { NextResponse } from "next/server";
import { prisma } from "@/database/client";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const brand = await prisma.brand.findUnique({
    where: { id },
    include: { organisation: true },
  });

  if (!brand) {
    return NextResponse.json({ error: "Brand not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: brand.id,
    name: brand.name,
    organisation: brand.organisation.name,
  });
}
