import { NextRequest, NextResponse } from "next/server";
import { getNavCategories, categoriesForGender } from "@/lib/categories";

// GET /api/categories?gender=WOMEN — active, nav-visible category tree for the storefront
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const genderParam = searchParams.get("gender")?.toUpperCase();

  try {
    const tree = await getNavCategories();
    const categories =
      genderParam === "WOMEN" || genderParam === "MEN"
        ? categoriesForGender(tree, genderParam)
        : tree;

    return NextResponse.json({ categories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to query categories" }, { status: 500 });
  }
}
