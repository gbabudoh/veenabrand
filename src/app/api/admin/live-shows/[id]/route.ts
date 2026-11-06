import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { closeRoom, listRoomParticipants } from "@/lib/livekit";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

// GET /api/admin/live-shows/:id — the show plus its live audience size.
export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const show = await db.liveShow.findUnique({ where: { id: params.id } });
  if (!show) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const participants = await listRoomParticipants(show.room);
  const viewers = participants.filter((p) => !p.identity.startsWith("staff-")).length;

  // Track the high-water mark while live.
  if (show.status === "LIVE" && viewers > show.peakViewers) {
    await db.liveShow.update({ where: { id: show.id }, data: { peakViewers: viewers } });
    show.peakViewers = viewers;
  }
  return NextResponse.json({ show, viewers, hosts: participants.length - viewers });
}

const patchSchema = z.object({
  action: z.enum(["start", "end", "reopen"]).optional(),
  title: z.string().trim().min(1).max(160).optional(),
  description: z.string().trim().max(2000).optional(),
  posterImage: z.string().trim().max(1000).optional(),
  featured: z.boolean().optional(),
  scheduledAt: z.string().datetime({ offset: true }).nullable().optional().or(z.literal("")),
});

// PATCH /api/admin/live-shows/:id — edit, or go live / end / reopen.
// Ending closes the room, which disconnects every viewer.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const existing = await db.liveShow.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { action, scheduledAt, ...fields } = parsed.data;
  const data: Record<string, unknown> = { ...fields };
  if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;

  if (action === "start") {
    data.status = "LIVE";
    data.startedAt = existing.startedAt ?? new Date();
    data.endedAt = null;
  } else if (action === "end") {
    data.status = "ENDED";
    data.endedAt = new Date();
  } else if (action === "reopen") {
    data.status = "SCHEDULED";
    data.startedAt = null;
    data.endedAt = null;
    data.peakViewers = 0;
  }

  const show = await db.liveShow.update({ where: { id: params.id }, data });
  if (action === "end") await closeRoom(existing.room);

  return NextResponse.json({ show });
}

// DELETE /api/admin/live-shows/:id
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.liveShow.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await closeRoom(existing.room);
  await db.liveShow.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
