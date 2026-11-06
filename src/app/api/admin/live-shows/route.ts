import { NextRequest, NextResponse } from "next/server";
import { randomBytes } from "crypto";
import { z } from "zod";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/category-utils";
import { newLiveRoomName } from "@/lib/livekit";

export const dynamic = "force-dynamic";

const createSchema = z.object({
  title: z.string().trim().min(1).max(160),
  description: z.string().trim().max(2000).optional(),
  posterImage: z.string().trim().max(1000).optional(),
  featured: z.boolean().optional(),
  scheduledAt: z.string().datetime({ offset: true }).optional().or(z.literal("")),
});

// GET /api/admin/live-shows
export async function GET() {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const shows = await db.liveShow.findMany({ orderBy: [{ createdAt: "desc" }] });
  return NextResponse.json({ shows });
}

// POST /api/admin/live-shows — schedule a new show (gets its own room and public /live/<slug> page).
export async function POST(req: NextRequest) {
  if (!getAdminSession()) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const parsed = createSchema.safeParse(await req.json().catch(() => ({})));
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message || "Invalid request" }, { status: 400 });
  }
  const d = parsed.data;

  const show = await db.liveShow.create({
    data: {
      title: d.title,
      // Short random suffix keeps slugs unique even when titles repeat.
      slug: `${slugify(d.title).slice(0, 60) || "show"}-${randomBytes(3).toString("hex")}`,
      room: newLiveRoomName(),
      description: d.description || null,
      posterImage: d.posterImage || null,
      featured: d.featured ?? true,
      scheduledAt: d.scheduledAt ? new Date(d.scheduledAt) : null,
    },
  });
  return NextResponse.json({ show });
}
