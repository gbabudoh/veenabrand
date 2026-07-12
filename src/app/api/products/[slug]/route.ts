import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/products/[slug] — backs the PDP: media, colors, variants (sizes+stock), reviews.
export async function GET(_req: NextRequest, { params }: { params: { slug: string } }) {
  const product = await db.product.findUnique({
    where: { slug: params.slug },
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      colors: { orderBy: { sortOrder: "asc" } },
      variants: true,
      reviews: { orderBy: { createdAt: "desc" } },
    },
  });

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }
  return NextResponse.json({ product });
}
