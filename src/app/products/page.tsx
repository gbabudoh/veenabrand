import { Suspense } from "react";
import { db } from "@/lib/db";
import ProductsClient from "@/components/ProductsClient";
import { getFilterCategories, getCategoryWithDescendantIds, type NavCategory } from "@/lib/categories";

function findDepartmentForCategory(categorySlug: string, categories: NavCategory[]): string | null {
  for (const root of categories) {
    if (root.slug === categorySlug) return root.slug;
    if (root.children.some((ch) => ch.slug === categorySlug)) {
      return root.slug;
    }
  }
  return null;
}

export default async function ProductsPage({
  searchParams,
}: {
  searchParams: { gender?: string; category?: string; department?: string; search?: string };
}) {
  const genderQuery = searchParams.gender?.toUpperCase() || null;
  const departmentQuery = searchParams.department?.toLowerCase() || null;
  const categorySlug = searchParams.category || null;
  const search = searchParams.search?.trim() || null;

  // Retrieve complete hierarchical categories for the 5 core departments
  const allCategories = await getFilterCategories();

  // Determine active category and active department
  const match = categorySlug ? await getCategoryWithDescendantIds(categorySlug) : null;
  let activeDepartment: string | null = departmentQuery;

  if (!activeDepartment && categorySlug) {
    activeDepartment = findDepartmentForCategory(categorySlug, allCategories);
  }
  if (!activeDepartment && genderQuery === "WOMEN") {
    activeDepartment = "women";
  } else if (!activeDepartment && genderQuery === "MEN") {
    activeDepartment = "men";
  }

  // Build target category IDs
  let categoryIds: string[] | null = null;
  if (categorySlug && match) {
    categoryIds = match.ids;
  } else if (activeDepartment) {
    const root = allCategories.find((r) => r.slug === activeDepartment);
    if (root) {
      const rootMatch = await getCategoryWithDescendantIds(root.slug);
      if (rootMatch) categoryIds = rootMatch.ids;
    }
  }

  // Build where query
  const where: any = {};

  if (categorySlug && categoryIds && categoryIds.length > 0) {
    where.categoryId = { in: categoryIds };
  } else if (activeDepartment === "women" || genderQuery === "WOMEN") {
    if (categoryIds && categoryIds.length > 0) {
      where.OR = [
        { categoryId: { in: categoryIds } },
        { gender: "WOMEN" }
      ];
    } else {
      where.gender = "WOMEN";
    }
  } else if (activeDepartment === "men" || genderQuery === "MEN") {
    if (categoryIds && categoryIds.length > 0) {
      where.OR = [
        { categoryId: { in: categoryIds } },
        { gender: "MEN" }
      ];
    } else {
      where.gender = "MEN";
    }
  } else if (categoryIds && categoryIds.length > 0) {
    where.categoryId = { in: categoryIds };
  }

  if (search) {
    const searchFilter = [
      { name: { contains: search } },
      { description: { contains: search } },
    ];
    if (where.OR) {
      where.AND = [{ OR: where.OR }, { OR: searchFilter }];
      delete where.OR;
    } else {
      where.OR = searchFilter;
    }
  }

  const products = await db.product.findMany({
    where,
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      colors: { orderBy: { sortOrder: "asc" } },
      category: { select: { id: true, name: true, slug: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <Suspense fallback={<div className="container-max" style={{ padding: "100px 24px", textAlign: "center", color: "#64748B" }}>Loading atelier collection...</div>}>
      <ProductsClient
        products={products}
        categories={allCategories}
        activeDepartment={activeDepartment}
        activeCategory={match ? { name: match.category.name, slug: match.category.slug } : null}
        searchQuery={search}
      />
    </Suspense>
  );
}
