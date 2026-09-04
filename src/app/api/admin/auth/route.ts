import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { verifyPassword, encryptSession } from "@/lib/auth";

// POST /api/admin/auth — Admin Login
export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Username and password are required" }, { status: 400 });
    }

    const cleanIdentifier = username.trim();

    // Find the user by username or email
    const user = await db.user.findFirst({
      where: {
        OR: [
          { username: cleanIdentifier },
          { email: cleanIdentifier },
          { email: cleanIdentifier.toLowerCase() },
        ],
      },
    });

    if (!user || !user.passwordHash) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Verify password hash
    const isMatch = verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Invalid credentials" }, { status: 401 });
    }

    // Ensure the user has admin role
    if (user.role !== "ADMIN" && user.role !== "SUPERADMIN") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 403 });
    }

    // Create session token
    const token = encryptSession({
      userId: user.id,
      username: user.username || "",
      role: user.role,
    });

    // Set HTTP-only session cookie
    const cookieStore = cookies();
    cookieStore.set({
      name: "veena_admin_session",
      value: token,
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 86400, // 1 day
      path: "/",
    });

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        role: user.role,
        name: user.name,
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Login failed" }, { status: 500 });
  }
}

// DELETE /api/admin/auth — Admin Logout
export async function DELETE() {
  const cookieStore = cookies();
  cookieStore.delete("veena_admin_session");
  return NextResponse.json({ success: true });
}
