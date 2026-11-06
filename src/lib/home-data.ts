import { db } from "@/lib/db";
import { NAV_MENU_KEY } from "@/lib/mega-menu";

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

export interface FooterLink {
  label: string;
  href: string;
}

export interface FooterColumn {
  title: string;
  links: FooterLink[];
}

export interface FooterConfig {
  logoImage?: string;
  tagline?: string;
  columns?: FooterColumn[];
  newsletter?: {
    active?: boolean;
    title?: string;
    description?: string;
    placeholder?: string;
  };
  copyright?: string;
  bottomLinks?: FooterLink[];
}

export const DEFAULT_FOOTER_CONFIG: FooterConfig = {
  logoImage: "/images/logo.png",
  tagline: "Ready-to-wear and bespoke fashion, cut and finished in Lagos.",
  columns: [
    {
      title: "Shop",
      links: [
        { label: "New Arrivals", href: "/products" },
        { label: "Bespoke", href: "/products/signature-agbada-set" },
        { label: "Runway", href: "/#runway-banner" },
      ],
    },
    {
      title: "Company",
      links: [
        { label: "About Veena", href: "/about" },
        { label: "Terms & Policies", href: "/legal?tab=terms" },
      ],
    },
  ],
  newsletter: {
    active: true,
    title: "Newsletter",
    description: "Subscribe for runway debuts and private previews.",
    placeholder: "Email address",
  },
  copyright: "© 2026 Veena Fashion House. All rights reserved.",
  bottomLinks: [
    { label: "Terms", href: "/legal?tab=terms" },
    { label: "Privacy", href: "/legal?tab=privacy" },
    { label: "Payment Terms", href: "/legal?tab=payment" },
  ],
};


// Shared loader for the two gender home routes (/ for women, /men). Both segments
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

// Returns the raw stored nav document; the Header resolves it (and any legacy
// shape) through resolveNavMenu in "@/lib/mega-menu".
export async function getMegaMenuConfig(): Promise<unknown> {
  try {
    const config = await db.homepageConfig.findUnique({ where: { key: NAV_MENU_KEY } });
    return config ? JSON.parse(config.value) : null;
  } catch (err) {
    console.error("Failed to load mega_menu_config:", err);
    return null;
  }
}

export async function getFooterConfig(): Promise<FooterConfig | null> {
  try {
    const config = await db.homepageConfig.findUnique({ where: { key: "footer_config" } });
    return config ? JSON.parse(config.value) : null;
  } catch (err) {
    console.error("Failed to load footer_config:", err);
    return null;
  }
}

