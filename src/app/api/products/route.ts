import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getCategoryWithDescendantIds } from "@/lib/categories";

// GET /api/products?gender=WOMEN&category=new-arrival
// `category` is a category slug; a parent slug also returns its children's products.
// Backs the Home "New In" grid and the PLP grid/filters.
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const gender = searchParams.get("gender"); // "WOMEN" | "MEN" | null
  const categorySlug = searchParams.get("category");

  let categoryIds: string[] | null = null;
  if (categorySlug) {
    const match = await getCategoryWithDescendantIds(categorySlug);
    // An unknown slug should return nothing, not the whole catalogue.
    categoryIds = match ? match.ids : [];
  }

  const products = await db.product.findMany({
    where: {
      ...(gender ? { gender: gender as any } : {}),
      ...(categoryIds ? { categoryId: { in: categoryIds } } : {}),
    },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      colors: { orderBy: { sortOrder: "asc" } },
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json({ products });
}
