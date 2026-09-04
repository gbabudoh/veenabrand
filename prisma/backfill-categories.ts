/**
 * One-off migration: Product.category (free-text string) -> Category relation.
 *
 * The old string column was captured to prisma/.category-snapshot.json before
 * `prisma db push` dropped it. This reads that snapshot, creates a Category row
 * per distinct value, and links each product back to it.
 *
 * Safe to re-run: categories are upserted by slug and products are only relinked
 * when they currently have no category.
 *
 *   npx tsx prisma/backfill-categories.ts
 */
import fs from "fs";
import path from "path";
import { PrismaClient } from "@prisma/client";

const db = new PrismaClient();

const SNAPSHOT = path.join(__dirname, ".category-snapshot.json");

interface SnapshotRow {
  id: string;
  slug: string;
  name: string;
  gender: string;
  category: string;
}

function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  if (!fs.existsSync(SNAPSHOT)) {
    console.log("No snapshot found at prisma/.category-snapshot.json — nothing to backfill.");
    return;
  }

  const rows: SnapshotRow[] = JSON.parse(fs.readFileSync(SNAPSHOT, "utf8"));
  const names = Array.from(new Set(rows.map((r) => r.category).filter(Boolean)));

  console.log(`Snapshot has ${rows.length} products across ${names.length} categories.`);

  // The legacy values ("New Arrival", "Runway", "Bespoke Favorite") were used across
  // both genders, so they carry over as gender-neutral top-level categories.
  const byName = new Map<string, string>();
  for (const [i, name] of names.entries()) {
    const category = await db.category.upsert({
      where: { slug: slugify(name) },
      update: {},
      create: { name, slug: slugify(name), sortOrder: i, gender: null },
    });
    byName.set(name, category.id);
    console.log(`  category: ${name} -> ${category.slug}`);
  }

  let linked = 0;
  for (const row of rows) {
    const categoryId = byName.get(row.category);
    if (!categoryId) continue;

    const product = await db.product.findUnique({ where: { id: row.id } });
    if (!product) {
      console.log(`  skip (product gone): ${row.name}`);
      continue;
    }
    if (product.categoryId) continue; // already linked

    await db.product.update({ where: { id: row.id }, data: { categoryId } });
    linked++;
  }

  const orphans = await db.product.count({ where: { categoryId: null } });
  console.log(`Linked ${linked} products. ${orphans} product(s) still uncategorised.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
