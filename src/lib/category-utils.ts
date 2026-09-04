// Pure category helpers — no database import, so client components can use these
// without pulling Prisma into the browser bundle.

export interface NavCategory {
  id: string;
  name: string;
  slug: string;
  gender: string | null;
  children: NavCategory[];
}

export function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

export type FlatCategory = {
  id: string;
  name: string;
  slug: string;
  gender: string | null;
  parentId: string | null;
};

/**
 * Nests a flat category list by parentId. A category whose parent is missing
 * from the list (inactive, hidden from nav, deleted) is promoted to the top
 * level rather than silently dropped, so nothing disappears from the store.
 */
export function buildCategoryTree(flat: FlatCategory[]): NavCategory[] {
  const nodes = new Map<string, NavCategory>();
  for (const c of flat) {
    nodes.set(c.id, { id: c.id, name: c.name, slug: c.slug, gender: c.gender, children: [] });
  }

  const roots: NavCategory[] = [];
  for (const c of flat) {
    const node = nodes.get(c.id)!;
    const parent = c.parentId ? nodes.get(c.parentId) : null;
    if (parent) {
      parent.children.push(node);
    } else {
      roots.push(node);
    }
  }
  return roots;
}

/** Filters a nav tree down to what a given gender should see (null = shown to both). */
export function categoriesForGender(tree: NavCategory[], gender: "WOMEN" | "MEN"): NavCategory[] {
  return tree
    .filter((c) => !c.gender || c.gender === gender)
    .map((c) => ({ ...c, children: c.children.filter((ch) => !ch.gender || ch.gender === gender) }));
}
