import { NextRequest, NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { createLiveKitToken, isConsultRoomName, isLiveKitConfigured, liveKitUrl } from "@/lib/livekit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Ctx = { params: { room: string } };

async function findByRoom(room: string) {
  if (!isConsultRoomName(room)) return null;
  return db.consultation.findUnique({ where: { room } });
}

// GET /api/consult/:room — what the customer's join page needs (no private notes).
export async function GET(_req: NextRequest, { params }: Ctx) {
  const c = await findByRoom(params.room);
  if (!c) return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
  return NextResponse.json({
    consultation: {
      customerName: c.customerName,
      topic: c.topic,
      status: c.status,
      scheduledAt: c.scheduledAt,
    },
  });
}

const tokenSchema = z.object({ name: z.string().trim().min(1).max(60) });

// POST /api/consult/:room — customer joins the call. The room name in the link
// is the secret; only scheduled or live consultations can be joined.
export async function POST(req: NextRequest, { params }: Ctx) {
  if (!isLiveKitConfigured()) {
    return NextResponse.json({ error: "Video calls are not available right now." }, { status: 503 });
  }
  const c = await findByRoom(params.room);
  if (!c) return NextResponse.json({ error: "Consultation not found" }, { status: 404 });
  if (c.status === "ENDED" || c.status === "CANCELLED") {
    return NextResponse.json({ error: "This consultation is no longer open." }, { status: 410 });
  }

  const parsed = tokenSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Please enter your name." }, { status: 400 });

  const token = await createLiveKitToken({
    room: c.room,
    identity: `guest-${randomUUID()}`,
    name: parsed.data.name,
    metadata: JSON.stringify({ role: "customer" }),
  });
  return NextResponse.json({ url: liveKitUrl(), token });
}
