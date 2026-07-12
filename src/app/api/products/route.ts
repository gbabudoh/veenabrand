import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/products?gender=WOMEN&category=New+Arrival
// Backs the Home "New In" grid and the PLP grid/filters.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gender = searchParams.get("gender"); // "WOMEN" | "MEN" | null
  const category = searchParams.get("category");

  const products = await db.product.findMany({
    where: {
      ...(gender ? { gender: gender as any } : {}),
      ...(category ? { category } : {}),
    },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      colors: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}
