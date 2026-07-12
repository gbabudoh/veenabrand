import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

// GET /api/admin/discounts — Query discount codes
export async function GET(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const codes = await db.discountCode.findMany({
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ codes });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to query discount codes" }, { status: 500 });
  }
}

// POST /api/admin/discounts — Create discount code
export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { code, discountPercent, active } = await req.json();

    if (!code || discountPercent === undefined) {
      return NextResponse.json({ error: "Code and discountPercent are required" }, { status: 400 });
    }

    const discountCode = await db.discountCode.upsert({
      where: { code: code.toUpperCase() },
      update: {
        discountPercent: Number(discountPercent),
        active: active !== undefined ? active : true,
      },
      create: {
        code: code.toUpperCase(),
        discountPercent: Number(discountPercent),
        active: active !== undefined ? active : true,
      },
    });

    return NextResponse.json({ success: true, discountCode });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create discount code" }, { status: 500 });
  }
}

// DELETE /api/admin/discounts — Delete discount code
export async function DELETE(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "id is required" }, { status: 400 });
    }

    await db.discountCode.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete discount code" }, { status: 500 });
  }
}
