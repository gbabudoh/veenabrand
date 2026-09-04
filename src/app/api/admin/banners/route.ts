import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

const DEFAULT_BANNERS = [
  {
    id: "banner-1",
    eyebrow: "Spring/Summer 2026",
    title: "Tailoring that moves with you",
    cta: "Shop Women",
    link: "/products?gender=WOMEN",
    genderFilter: "WOMEN",
    tone1: "#c9beac",
    tone2: "#8f8571",
    bgImage: "/images/hero_women.png",
    active: true,
  },
  {
    id: "banner-2",
    eyebrow: "Runway Film",
    title: "The AW26 collection, in motion",
    cta: "Watch the Film",
    link: "#runway-banner",
    actionScroll: "runway-banner",
    tone1: "#1c2a24",
    tone2: "#0d1512",
    bgImage: "/images/hero_runway.png",
    active: true,
  },
  {
    id: "banner-3",
    eyebrow: "For Him",
    title: "Modern silhouettes, Lagos-made",
    cta: "Shop Men",
    link: "/products?gender=MEN",
    genderFilter: "MEN",
    tone1: "#3a3936",
    tone2: "#171613",
    bgImage: "/images/hero_men.png",
    active: true,
  },
];

// GET /api/admin/banners — Fetch all homepage hero banners
export async function GET(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const config = await db.homepageConfig.findUnique({
      where: { key: "hero_slides" },
    });

    if (!config || !config.value) {
      return NextResponse.json({ banners: DEFAULT_BANNERS });
    }

    try {
      const parsed = JSON.parse(config.value);
      // Ensure every slide has an id and active flag
      const sanitized = (Array.isArray(parsed) ? parsed : DEFAULT_BANNERS).map(
        (b: any, index: number) => ({
          id: b.id || `banner-${index + 1}`,
          eyebrow: b.eyebrow || "Atelier Edition",
          title: b.title || "Tailoring that moves with you",
          cta: b.cta || "Explore Collection",
          link: b.link || (b.genderFilter ? `/products?gender=${b.genderFilter}` : "/products"),
          genderFilter: b.genderFilter || "ALL",
          actionScroll: b.actionScroll || "",
          tone1: b.tone1 || "#c9beac",
          tone2: b.tone2 || "#8f8571",
          bgImage: b.bgImage || "/images/hero_women.png",
          active: b.active !== false,
        })
      );
      return NextResponse.json({ banners: sanitized });
    } catch (e) {
      return NextResponse.json({ banners: DEFAULT_BANNERS });
    }
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to fetch banners" },
      { status: 500 }
    );
  }
}

// POST /api/admin/banners — Update all homepage hero banners
export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { banners } = body;

    if (!banners || !Array.isArray(banners)) {
      return NextResponse.json(
        { error: "Banners array is required" },
        { status: 400 }
      );
    }

    if (banners.length === 0) {
      return NextResponse.json(
        { error: "At least one banner must be configured" },
        { status: 400 }
      );
    }

    // Clean and validate banners
    const sanitizedBanners = banners.map((b: any, index: number) => ({
      id: b.id || `banner-${Date.now()}-${index}`,
      eyebrow: (b.eyebrow || "Atelier Edition").trim(),
      title: (b.title || "New Atelier Silhouette").trim(),
      cta: (b.cta || "Discover Now").trim(),
      link: (b.link || "/products").trim(),
      genderFilter: b.genderFilter || "ALL",
      actionScroll: b.actionScroll || "",
      tone1: b.tone1 || "#c9beac",
      tone2: b.tone2 || "#8f8571",
      bgImage: (b.bgImage || "/images/hero_women.png").trim(),
      active: b.active !== false,
    }));

    const config = await db.homepageConfig.upsert({
      where: { key: "hero_slides" },
      update: { value: JSON.stringify(sanitizedBanners) },
      create: { key: "hero_slides", value: JSON.stringify(sanitizedBanners) },
    });

    return NextResponse.json({ success: true, banners: sanitizedBanners, config });
  } catch (err: any) {
    return NextResponse.json(
      { error: err.message || "Failed to save banners" },
      { status: 500 }
    );
  }
}
