import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { newConsultRoomName } from "@/lib/livekit";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  customerName: z.string().trim().min(1).max(120),
  customerEmail: z.string().trim().email().max(200).optional().or(z.literal("")),
  customerPhone: z.string().trim().max(40).optional(),
  topic: z.string().trim().max(160).optional(),
  notes: z.string().trim().max(4000).optional(),
  bespokeRequestId: z.string().optional().or(z.literal("")),
  scheduledAt: z.string().datetime({ offset: true }).optional().or(z.literal("")),
});

// GET /api/admin/consultations — all consultations, newest first, plus recent
// bespoke requests so staff can link a call to one.
export async function GET() {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const [consultations, bespokeRequests] = await Promise.all([
    db.consultation.findMany({ orderBy: [{ createdAt: "desc" }] }),
    db.bespokeRequest.findMany({
      orderBy: { createdAt: "desc" },
      take: 50,
      select: { id: true, fabricPreference: true, timeline: true, status: true, createdAt: true },
    }),
  ]);
  return NextResponse.json({ consultations, bespokeRequests });
}

// POST /api/admin/consultations — book a new consultation (creates its private room link).
export async function POST(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid request" }, { status: 400 });
  }
  const d = parsed.data;

  const consultation = await db.consultation.create({
    data: {
      room: newConsultRoomName(),
      customerName: d.customerName,
      customerEmail: d.customerEmail || null,
      customerPhone: d.customerPhone || null,
      topic: d.topic || "Bespoke consultation",
      notes: d.notes || null,
      bespokeRequestId: d.bespokeRequestId || null,
      scheduledAt: d.scheduledAt ? new Date(d.scheduledAt) : null,
    },
  });
  return NextResponse.json({ consultation });
}
