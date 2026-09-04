import { db } from "@/lib/db";

export interface NewInConfig {
  title?: string;
  eyebrow?: string;
  limit?: number;
  viewAllText?: string;
  viewAllHref?: string;
  active?: boolean;
}

export interface LookbookTile {
  label: string;
  image?: string;
  tone1?: string;
  tone2?: string;
}

export interface RunwayConfig {
  active?: boolean;
  eyebrow?: string;
  title?: string;
  mode: "film" | "lookbook";
  videoUrl?: string;
  posterImage?: string;
  videoLabel?: string;
  quote?: string;
  lookbookTiles?: LookbookTile[];
}

export interface BespokeTeaserConfig {
  active?: boolean;
  eyebrow?: string;
  title?: string;
  description?: string;
  ctaText?: string;
  ctaAction?: "modal" | "link";
  ctaHref?: string;
  image?: string;
}

export interface DepartmentMegaConfig {
  overviewLabel?: string;
  col1Title?: string;
  col2Title?: string;
  editorial?: {
    eyebrow?: string;
    title?: string;
    image?: string;
    href?: string;
    cta?: string;
  };
}

export type MegaMenuConfig = Record<string, DepartmentMegaConfig>;

// Shared loader for the two gender home routes (/women, /men). Both segments
// render the same experience against the same data; only the segment differs.
export async function getHomeData() {
  const [products, slidesConfig, runwayConfig, newInConfig, bespokeConfig] = await Promise.all([
    db.product.findMany({
      include: {
        media: { orderBy: { sortOrder: "asc" } },
        colors: { orderBy: { sortOrder: "asc" } },
        category: { select: { id: true, name: true, slug: true } },
      },
      orderBy: { createdAt: "desc" },
    }),
    db.homepageConfig.findUnique({ where: { key: "hero_slides" } }),
    db.homepageConfig.findUnique({ where: { key: "runway_switch" } }),
    db.homepageConfig.findUnique({ where: { key: "new_in_config" } }),
    db.homepageConfig.findUnique({ where: { key: "bespoke_teaser_config" } }),
  ]);

  return {
    products,
    initialSlides: slidesConfig ? JSON.parse(slidesConfig.value) : null,
    initialRunway: runwayConfig ? JSON.parse(runwayConfig.value) as RunwayConfig : null,
    initialNewIn: newInConfig ? JSON.parse(newInConfig.value) as NewInConfig : null,
    initialBespoke: bespokeConfig ? JSON.parse(bespokeConfig.value) as BespokeTeaserConfig : null,
  };
}

export async function getMegaMenuConfig(): Promise<MegaMenuConfig | null> {
  try {
    const config = await db.homepageConfig.findUnique({ where: { key: "mega_menu_config" } });
    return config ? JSON.parse(config.value) : null;
  } catch (err) {
    console.error("Failed to load mega_menu_config:", err);
    return null;
  }
}

