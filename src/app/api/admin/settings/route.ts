import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

// GET /api/admin/settings — Query system configurations (SEO, Socials)
export async function GET(req: NextRequest) {
  try {
    const settings = await db.systemSettings.findMany();
    return NextResponse.json({ settings });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch settings" }, { status: 500 });
  }
}

// POST /api/admin/settings — Save system configurations
export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { key, value } = await req.json();

    if (!key || value === undefined) {
      return NextResponse.json({ error: "Key and value are required" }, { status: 400 });
    }

    const setting = await db.systemSettings.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json({ success: true, setting });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save setting" }, { status: 500 });
  }
}
