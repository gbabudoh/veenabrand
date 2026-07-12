import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

// GET /api/admin/users — Query all users / customers / staff
export async function GET(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const users = await db.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
        createdAt: true,
      },
    });
    return NextResponse.json({ users });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to query users" }, { status: 500 });
  }
}

// PATCH /api/admin/users — Update user role (SUPERADMIN only)
export async function PATCH(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Strict role check: Only SUPERADMIN can update roles
  if (session.role !== "SUPERADMIN") {
    return NextResponse.json({ error: "Forbidden: Only Super Admins can update user roles" }, { status: 403 });
  }

  try {
    const { userId, role } = await req.json();

    if (!userId || !role) {
      return NextResponse.json({ error: "userId and role are required" }, { status: 400 });
    }

    if (!["USER", "ADMIN", "SUPERADMIN"].includes(role)) {
      return NextResponse.json({ error: "Invalid role value" }, { status: 400 });
    }

    // Don't allow self-demotion of the super admin if that's the only one
    if (userId === session.userId && role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Cannot demote yourself from Super Admin status" }, { status: 400 });
    }

    const updated = await db.user.update({
      where: { id: userId },
      data: { role },
      select: {
        id: true,
        email: true,
        username: true,
        name: true,
        role: true,
      },
    });

    return NextResponse.json({ success: true, user: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update user role" }, { status: 500 });
  }
}
