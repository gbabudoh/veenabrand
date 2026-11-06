import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { createLiveKitToken, isLiveKitConfigured, liveKitUrl } from "@/lib/livekit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POST /api/admin/consultations/:id/token — staff joins the call as host.
// Joining marks the consultation LIVE so the customer's page knows it has started.
export async function POST(_req: NextRequest, { params }: { params: { id: string } }) {
  const session = getAdminSession();
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  if (!isLiveKitConfigured()) {
    return NextResponse.json({ error: "Live video is not configured on the server." }, { status: 503 });
  }

  const consultation = await db.consultation.findUnique({ where: { id: params.id } });
  if (!consultation) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (consultation.status === "CANCELLED") {
    return NextResponse.json({ error: "This consultation was cancelled. Reopen it first." }, { status: 409 });
  }

  if (consultation.status !== "LIVE") {
    await db.consultation.update({
      where: { id: consultation.id },
      data: { status: "LIVE", startedAt: consultation.startedAt ?? new Date(), endedAt: null },
    });
  }

  const token = await createLiveKitToken({
    room: consultation.room,
    identity: `staff-${session.userId}`,
    name: `${session.username} · Veena Atelier`,
    roomAdmin: true,
    metadata: JSON.stringify({ role: "host" }),
  });
  return NextResponse.json({ url: liveKitUrl(), token, room: consultation.room });
}
