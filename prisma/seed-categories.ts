import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const TAXONOMY = [
  {
    name: "Women",
    slug: "women",
    gender: "WOMEN",
    sortOrder: 0,
    children: [
      { name: "Tops", slug: "women-tops" },
      { name: "Trousers", slug: "women-trousers" },
      { name: "Bubu", slug: "women-bubu" },
      { name: "Shirts", slug: "women-shirts" },
      { name: "Dresses", slug: "women-dresses" },
      { name: "Skirts", slug: "women-skirts" },
      { name: "Shorts", slug: "women-shorts" },
      { name: "Scarves", slug: "women-scarves" },
      { name: "Suits", slug: "women-suits" },
      { name: "Two Piece Sets", slug: "women-two-piece-sets" },
    ],
  },
  {
    name: "Men",
    slug: "men",
    gender: "MEN",
    sortOrder: 1,
    children: [
      { name: "Tops", slug: "men-tops" },
      { name: "Trousers", slug: "men-trousers" },
      { name: "Shirts", slug: "men-shirts" },
      { name: "Shorts", slug: "men-shorts" },
      { name: "Suits", slug: "men-suits" },
      { name: "Two Piece Set", slug: "men-two-piece-set" },
    ],
  },
  {
    name: "Accessories",
    slug: "accessories",
    gender: null,
    sortOrder: 2,
    children: [
      { name: "Earrings", slug: "earrings" },
      { name: "Necklaces", slug: "necklaces" },
      { name: "Bags", slug: "bags" },
      { name: "Sleepers", slug: "sleepers" },
    ],
  },
  {
    name: "Lifestyle",
    slug: "lifestyle",
    gender: null,
    sortOrder: 3,
    children: [
      { name: "Home Accessories", slug: "home-accessories" },
      { name: "Pillows", slug: "pillows" },
      { name: "Sheets", slug: "sheets" },
      { name: "Candles", slug: "candles" },
      { name: "Tablemats", slug: "tablemats" },
      { name: "Chair Covers", slug: "chair-covers" },
      { name: "Flower Vase", slug: "flower-vase" },
      { name: "Throws", slug: "throws" },
    ],
  },
];

async function main() {
  console.log("Seeding comprehensive department & mega menu categories...");

  for (const dept of TAXONOMY) {
    const parent = await prisma.category.upsert({
      where: { slug: dept.slug },
      update: {
        name: dept.name,
        gender: dept.gender,
        sortOrder: dept.sortOrder,
        active: true,
        showInNav: true,
      },
      create: {
        name: dept.name,
        slug: dept.slug,
        gender: dept.gender,
        sortOrder: dept.sortOrder,
        active: true,
        showInNav: true,
      },
    });

    console.log(`✓ Department: ${parent.name} (${parent.slug})`);

    for (const [idx, child] of dept.children.entries()) {
      await prisma.category.upsert({
        where: { slug: child.slug },
        update: {
          name: child.name,
          parentId: parent.id,
          gender: dept.gender,
          sortOrder: idx,
          active: true,
          showInNav: true,
        },
        create: {
          name: child.name,
          slug: child.slug,
          parentId: parent.id,
          gender: dept.gender,
          sortOrder: idx,
          active: true,
          showInNav: true,
        },
      });
      console.log(`   └─ ${child.name} (${child.slug})`);
    }
  }

  console.log("All categories successfully seeded!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
