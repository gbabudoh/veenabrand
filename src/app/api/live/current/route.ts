import { NextResponse } from "next/server";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

// GET /api/live/current — the featured show that is live right now, if any.
// Drives the storefront "Live now" bar.
export async function GET() {
  try {
    const show = await db.liveShow.findFirst({
      where: { status: "LIVE", featured: true },
      orderBy: { startedAt: "desc" },
      select: { slug: true, title: true },
    });
    return NextResponse.json({ show });
  } catch {
    return NextResponse.json({ show: null });
  }
}
