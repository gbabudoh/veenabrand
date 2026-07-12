import { db } from "@/lib/db";
import HomeClient from "@/components/HomeClient";

export default async function HomePage() {
  // Fetch all products from the SQLite database with their colors and media
  const products = await db.product.findMany({
    include: {
      media: { orderBy: { sortOrder: "asc" } },
      colors: { orderBy: { sortOrder: "asc" } },
    },
    orderBy: { createdAt: "desc" },
  });

  // Query dynamic homepage config keys
  const slidesConfig = await db.homepageConfig.findUnique({ where: { key: "hero_slides" } });
  const runwayConfig = await db.homepageConfig.findUnique({ where: { key: "runway_switch" } });

  const initialSlides = slidesConfig ? JSON.parse(slidesConfig.value) : null;
  const initialRunway = runwayConfig ? JSON.parse(runwayConfig.value) : null;

  return (
    <HomeClient
      products={products}
      initialSlides={initialSlides}
      initialRunway={initialRunway}
    />
  );
}
