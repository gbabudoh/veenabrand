import { Suspense } from "react";
import { db } from "@/lib/db";
import ProductsClient from "@/components/ProductsClient";
import { getFilterCategories, getCategoryWithDescendantIds, categoriesForGender } from "@/lib/categories";

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { gender?: string; category?: string; search?: string };
}) {
  const genderQuery = searchParams.gender?.toUpperCase();
  const categorySlug = searchParams.category || null;
  const search = searchParams.search?.trim() || null;

  // A parent category also shows everything filed under its children.
  const match = categorySlug ? await getCategoryWithDescendantIds(categorySlug) : null;
  const categoryIds = categorySlug ? (match ? match.ids : []) : null;

  // Determine gender filter
  let activeGender: "WOMEN" | "MEN" = "WOMEN";
  if (genderQuery === "MEN" || match?.category.gender === "MEN") {
    activeGender = "MEN";
  }

  // Build where query
  const where: any = {};
  if (genderQuery === "MEN" || genderQuery === "WOMEN") {
    where.gender = genderQuery;
  } else if (match?.category.gender) {
    where.gender = match.category.gender;
  }

  if (categoryIds && categoryIds.length > 0) {
    where.categoryId = { in: categoryIds };
  }

  if (search) {
    where.OR = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
  }

  const [products, allCategories] = await Promise.all([
    db.product.findMany({
      where,
      include: {
        media: { orderBy: { sortOrder: "asc" } },
        colors: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    getFilterCategories(),
  ]);

  return (
    <Suspense fallback={<div className="container-max" style={{ padding: "100px 24px", textAlign: "center" }}>Loading collection...</div>}>
      <ProductsClient
        products={products}
        initialGender={activeGender}
        categories={categoriesForGender(allCategories, activeGender)}
        activeCategory={match ? { name: match.category.name, slug: match.category.slug } : null}
      />
    </Suspense>
  );
}
