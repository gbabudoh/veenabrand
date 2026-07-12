import { PrismaClient } from "@prisma/client";
import { hashPassword } from "../src/lib/auth";

const prisma = new PrismaClient();

async function main() {
  // 1. Seed super admin user
  const adminPasswordHash = hashPassword("password2328");
  await prisma.user.upsert({
    where: { email: "superadmin@veena.fashion" },
    update: {
      passwordHash: adminPasswordHash,
      role: "SUPERADMIN",
    },
    create: {
      email: "superadmin@veena.fashion",
      username: "superadmin",
      name: "Super Admin",
      passwordHash: adminPasswordHash,
      role: "SUPERADMIN",
    },
  });
  console.log("Seeded Super Admin credentials (username: superadmin, password: password2328)");

  // 2. Seed default dynamic homepage layouts configuration
  const defaultSlides = [
    {
      eyebrow: "Spring/Summer 2026",
      title: "Tailoring that moves with you",
      cta: "Shop Women",
      tone1: "#c9beac",
      tone2: "#8f8571",
      bgImage: "/images/hero_women.png",
      genderFilter: "WOMEN"
    },
    {
      eyebrow: "Runway Film",
      title: "The AW26 collection, in motion",
      cta: "Watch the Film",
      tone1: "#1c2a24",
      tone2: "#0d1512",
      bgImage: "/images/hero_runway.png",
      actionScroll: "runway-banner"
    },
    {
      eyebrow: "For Him",
      title: "Modern silhouettes, Lagos-made",
      cta: "Shop Men",
      tone1: "#3a3936",
      tone2: "#171613",
      bgImage: "/images/hero_men.png",
      genderFilter: "MEN"
    }
  ];

  await prisma.homepageConfig.upsert({
    where: { key: "hero_slides" },
    update: {},
    create: {
      key: "hero_slides",
      value: JSON.stringify(defaultSlides),
    },
  });

  const defaultRunway = {
    mode: "film", // "film" | "lookbook"
    videoUrl: "/placeholder/runway.mp4"
  };

  await prisma.homepageConfig.upsert({
    where: { key: "runway_switch" },
    update: {},
    create: {
      key: "runway_switch",
      value: JSON.stringify(defaultRunway),
    },
  });

  // 3. Seed default system settings (SEO, Socials)
  const defaultSEO = {
    metaTitle: "Veena — Ready-to-wear & Bespoke Fashion",
    metaDescription: "Women's and men's fashion, ready-to-wear and made-to-measure, from our Lagos atelier.",
    metaKeywords: "Veena, Lagos fashion, bespoke tailoring, ready to wear, Nigeria design"
  };

  await prisma.systemSettings.upsert({
    where: { key: "seo_metadata" },
    update: {},
    create: {
      key: "seo_metadata",
      value: JSON.stringify(defaultSEO),
    },
  });

  const defaultSocials = {
    instagram: "https://instagram.com/veena.fashion",
    facebook: "https://facebook.com/veena.fashion",
    pinterest: "https://pinterest.com/veenafashion"
  };

  await prisma.systemSettings.upsert({
    where: { key: "social_links" },
    update: {},
    create: {
      key: "social_links",
      value: JSON.stringify(defaultSocials),
    },
  });

  // 4. Seed default stores
  const store = await prisma.store.upsert({
    where: { id: "flagship-vi" },
    update: {},
    create: {
      id: "flagship-vi",
      name: "Veena Flagship",
      address: "Victoria Island, Lagos",
      city: "Lagos",
      isPickupAvailable: true,
    },
  });

  // 5. Seed default products
  const products = [
    {
      slug: "silk-wrap-blouse",
      name: "Silk Wrap Blouse",
      gender: "WOMEN",
      category: "New Arrival",
      priceMinor: 14500000,
      description: "A silk piece cut from responsibly sourced fabric, finished by hand in our Lagos atelier.",
      fabricCare: "100% mulberry silk. Dry clean recommended.",
      shippingReturnsNote: "Ships next-day within Lagos. Unworn items returnable within 14 days.",
      colors: [{ name: "Ivory", hex: "#e7ddc9" }],
    },
    {
      slug: "tailored-wide-leg-trouser",
      name: "Tailored Wide-Leg Trouser",
      gender: "WOMEN",
      category: "New Arrival",
      priceMinor: 16800000,
      description: "Tailored wide-leg trouser with a structured waistband.",
      fabricCare: "Wool blend. Dry clean only.",
      shippingReturnsNote: "Ships next-day within Lagos. 14-day returns.",
      colors: [{ name: "Espresso", hex: "#4a3f31" }],
    },
    {
      slug: "emerald-column-gown",
      name: "Emerald Column Gown",
      gender: "WOMEN",
      category: "Runway",
      priceMinor: 42000000,
      description: "Runway column gown in emerald silk crepe.",
      fabricCare: "Silk crepe. Dry clean only.",
      shippingReturnsNote: "Made-to-order — final sale.",
      colors: [{ name: "Emerald", hex: "#1F5C42" }],
    },
    {
      slug: "structured-wool-overcoat",
      name: "Structured Wool Overcoat",
      gender: "MEN",
      category: "New Arrival",
      priceMinor: 39500000,
      description: "Structured overcoat in heavyweight wool.",
      fabricCare: "Wool blend. Dry clean only.",
      shippingReturnsNote: "Ships next-day within Lagos. 14-day returns.",
      colors: [{ name: "Charcoal", hex: "#5a5952" }],
    },
    {
      slug: "double-breasted-blazer",
      name: "Double-Breasted Blazer",
      gender: "MEN",
      category: "New Arrival",
      priceMinor: 28500000,
      description: "Double-breasted blazer, tailored fit.",
      fabricCare: "Wool blend. Dry clean only.",
      shippingReturnsNote: "Ships next-day within Lagos. 14-day returns.",
      colors: [{ name: "Ink", hex: "#3a3c3d" }],
    },
    {
      slug: "signature-agbada-set",
      name: "Signature Agbada Set",
      gender: "MEN",
      category: "Bespoke Favorite",
      priceMinor: 51000000,
      description: "Our signature agbada set, made to order.",
      fabricCare: "Premium cotton blend. Dry clean only.",
      shippingReturnsNote: "Made-to-order — final sale.",
      colors: [{ name: "Ivory", hex: "#efe6d0" }],
    },
  ];

  for (const p of products) {
    const { colors, ...rest } = p;
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        ...rest,
        colors: { create: colors.map((c, i) => ({ ...c, sortOrder: i })) },
        variants: {
          create: ["XS", "S", "M", "L", "XL"].flatMap((size) =>
            colors.map((c) => ({ size, colorName: c.name, stock: 20 }))
          ),
        },
        media: {
          create: [
            { type: "IMAGE", url: "/placeholder/front.jpg", label: "Front", sortOrder: 0 },
            { type: "IMAGE", url: "/placeholder/detail.jpg", label: "Detail", sortOrder: 1 },
            { type: "VIDEO", url: "/placeholder/on-model.mp4", label: "On Model", sortOrder: 2 },
            { type: "VIDEO", url: "/placeholder/fabric.mp4", label: "Fabric Close-up", sortOrder: 3 },
          ],
        },
      },
    });
    console.log("Seeded", product.name);
  }

  console.log("Seeded store:", store.name);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
