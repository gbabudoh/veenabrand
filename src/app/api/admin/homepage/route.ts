import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

// GET /api/admin/homepage — Query homepage banner configurations
export async function GET(req: NextRequest) {
  try {
    const configs = await db.homepageConfig.findMany();
    return NextResponse.json({ configs });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch configurations" }, { status: 500 });
  }
}

// POST /api/admin/homepage — Save homepage banner configurations
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

    const config = await db.homepageConfig.upsert({
      where: { key },
      update: { value },
      create: { key, value },
    });

    return NextResponse.json({ success: true, config });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to save configuration" }, { status: 500 });
  }
}
