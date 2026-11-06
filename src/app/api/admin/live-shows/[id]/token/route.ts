import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { createLiveKitToken, isLiveKitConfigured, liveKitUrl } from "@/lib/livekit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/live-shows/:id/token — staff joins the studio as broadcaster.
// Staff can set up camera/mic before going live; viewers can only join once
// the show is LIVE.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isLiveKitConfigured()) {
    return NextResponse.json({ error: "Live video is not configured on the server." }, { status: 503 });
  }

  const show = await db.liveShow.findUnique({ where: { id: params.id } });
  if (!show) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (show.status === "ENDED") {
    return NextResponse.json({ error: "This show has ended. Reopen it to broadcast again." }, { status: 409 });
  }

  const token = await createLiveKitToken({
    room: show.room,
    identity: `staff-${session.userId}`,
    name: `${session.username} · Veena`,
    roomAdmin: true,
    metadata: JSON.stringify({ role: "host" }),
    ttlSeconds: 60 * 60 * 6,
  });
  return NextResponse.json({ url: liveKitUrl(), token, room: show.room });
}
