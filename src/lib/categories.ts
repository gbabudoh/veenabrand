import { db } from "@/lib/db";
import { buildCategoryTree, type NavCategory } from "@/lib/category-utils";

// Server-side category queries. The pure helpers live in category-utils so that
// client components can import them without pulling Prisma into the bundle.
export {
  slugify,
  buildCategoryTree,
  categoriesForGender,
  type NavCategory,
  type FlatCategory,
} from "@/lib/category-utils";

/** Active, nav-visible categories as a tree — backs the storefront navbar. */
export async function getNavCategories(): Promise<NavCategory[]> {
  const flat = await db.category.findMany({
    where: { active: true, showInNav: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, gender: true, parentId: true },
  });
  return buildCategoryTree(flat);
}

/** Every active category (regardless of nav visibility) — backs the PLP filters. */
export async function getFilterCategories(): Promise<NavCategory[]> {
  const flat = await db.category.findMany({
    where: { active: true },
    orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
    select: { id: true, name: true, slug: true, gender: true, parentId: true },
  });
  return buildCategoryTree(flat);
}

/** A category plus every descendant id — so a parent page lists its children's products. */
export async function getCategoryWithDescendantIds(slug: string) {
  const root = await db.category.findUnique({ where: { slug } });
  if (!root) return null;

  const all = await db.category.findMany({ select: { id: true, parentId: true } });
  const ids = [root.id];
  let frontier = [root.id];

  // Bounded walk — depth is capped so a bad parent cycle can never spin forever.
  for (let depth = 0; depth < 10 && frontier.length; depth++) {
    const next = all.filter((c) => c.parentId && frontier.includes(c.parentId)).map((c) => c.id);
    const fresh = next.filter((id) => !ids.includes(id));
    ids.push(...fresh);
    frontier = fresh;
  }

  return { category: root, ids };
}
