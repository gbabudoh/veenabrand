import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { closeRoom, listRoomParticipants } from "@/lib/livekit";

export const dynamic = "force-dynamic";

type Ctx = { params: { id: string } };

// GET /api/admin/consultations/:id — one consultation plus who is in the room right now.
export async function GET(_req: NextRequest, { params }: Ctx) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const consultation = await db.consultation.findUnique({ where: { id: params.id } });
  if (!consultation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const participants = await listRoomParticipants(consultation.room);
  return NextResponse.json({
    consultation,
    participants: participants.map((p) => ({ identity: p.identity, name: p.name })),
  });
}

const patchSchema = z.object({
  action: z.enum(["end", "cancel", "reopen"]).optional(),
  customerName: z.string().trim().min(1).max(120).optional(),
  customerEmail: z.string().trim().max(200).optional(),
  customerPhone: z.string().trim().max(40).optional(),
  topic: z.string().trim().max(160).optional(),
  notes: z.string().trim().max(4000).optional(),
  scheduledAt: z.string().datetime({ offset: true }).nullable().optional().or(z.literal("")),
});

// PATCH /api/admin/consultations/:id — edit details, or end / cancel / reopen.
// Ending or cancelling closes the video room, disconnecting everyone in it.
export async function PATCH(req: NextRequest, { params }: Ctx) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = patchSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) return NextResponse.json({ error: "Invalid request" }, { status: 400 });

  const existing = await db.consultation.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const { action, scheduledAt, ...fields } = parsed.data;
  const data: Record<string, unknown> = { ...fields };
  if (scheduledAt !== undefined) data.scheduledAt = scheduledAt ? new Date(scheduledAt) : null;

  if (action === "end") {
    data.status = "ENDED";
    data.endedAt = new Date();
  } else if (action === "cancel") {
    data.status = "CANCELLED";
  } else if (action === "reopen") {
    data.status = "SCHEDULED";
    data.endedAt = null;
  }

  const consultation = await db.consultation.update({ where: { id: params.id }, data });
  if (action === "end" || action === "cancel") await closeRoom(existing.room);

  return NextResponse.json({ consultation });
}

// DELETE /api/admin/consultations/:id
export async function DELETE(_req: NextRequest, { params }: Ctx) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const existing = await db.consultation.findUnique({ where: { id: params.id } });
  if (!existing) return NextResponse.json({ error: "Not found" }, { status: 404 });

  await closeRoom(existing.room);
  await db.consultation.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
