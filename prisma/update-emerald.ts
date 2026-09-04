import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  const product = await prisma.product.findUnique({
    where: { slug: "emerald-column-gown" },
    include: { media: true },
  });

  if (!product) {
    console.log("Product emerald-column-gown not found");
    return;
  }

  // Remove existing placeholder media
  await prisma.productMedia.deleteMany({
    where: { productId: product.id },
  });

  // Create real high-fashion editorial media
  await prisma.productMedia.createMany({
    data: [
      {
        productId: product.id,
        type: "IMAGE",
        url: "/images/emerald_gown_runway.jpg",
        label: "Runway Look 03",
        sortOrder: 0,
      },
      {
        productId: product.id,
        type: "IMAGE",
        url: "/images/emerald_gown_detail.jpg",
        label: "Silk Crepe Craft",
        sortOrder: 1,
      },
      {
        productId: product.id,
        type: "IMAGE",
        url: "/images/emerald_gown_studio.jpg",
        label: "Draped Profile",
        sortOrder: 2,
      },
      {
        productId: product.id,
        type: "VIDEO",
        url: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-runway-show-41843-large.mp4",
        label: "Runway Motion",
        sortOrder: 3,
      },
    ],
  });

  console.log("Updated media for Emerald Column Gown successfully!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
