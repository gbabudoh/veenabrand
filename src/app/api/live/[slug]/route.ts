import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { db } from "@/lib/db";
import { createLiveKitToken, isLiveKitConfigured, liveKitUrl } from "@/lib/livekit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { slug: string } };

function publicShow(s: {
  slug: string;
  title: string;
  description: string | null;
  posterImage: string | null;
  status: string;
  scheduledAt: Date | null;
  startedAt: Date | null;
}) {
  return {
    slug: s.slug,
    title: s.title,
    description: s.description,
    posterImage: s.posterImage,
    status: s.status,
    scheduledAt: s.scheduledAt,
    startedAt: s.startedAt,
  };
}

// GET /api/live/:slug — public show details and status (the watch page polls this).
export async function GET(_req: NextRequest, { params }: Ctx) {
  const show = await db.liveShow.findUnique({ where: { slug: params.slug } });
  if (!show) return NextResponse.json({ error: "Show not found" }, { status: 404 });
  return NextResponse.json({ show: publicShow(show) });
}

// POST /api/live/:slug — watch-only viewer token. Only issued while the show is live.
export async function POST(_req: NextRequest, { params }: Ctx) {
  if (!isLiveKitConfigured()) {
    return NextResponse.json({ error: "Live video is not available right now." }, { status: 503 });
  }
  const show = await db.liveShow.findUnique({ where: { slug: params.slug } });
  if (!show) return NextResponse.json({ error: "Show not found" }, { status: 404 });
  if (show.status !== "LIVE") {
    return NextResponse.json({ error: "This show is not live.", status: show.status }, { status: 409 });
  }

  const token = await createLiveKitToken({
    room: show.room,
    identity: `viewer-${randomUUID()}`,
    name: "Viewer",
    canPublish: false,
    canPublishData: false,
    ttlSeconds: 60 * 60 * 6,
  });
  return NextResponse.json({ url: liveKitUrl(), token });
}
