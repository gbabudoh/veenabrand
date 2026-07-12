import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

// GET /api/admin/orders — List all orders
export async function GET(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const orders = await db.order.findMany({
      include: {
        items: {
          include: {
            product: {
              select: { name: true, slug: true }
            }
          }
        }
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ orders });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to query orders" }, { status: 500 });
  }
}

// PATCH /api/admin/orders — Update order status
export async function PATCH(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { orderId, status } = await req.json();

    if (!orderId || !status) {
      return NextResponse.json({ error: "orderId and status are required" }, { status: 400 });
    }

    const updated = await db.order.update({
      where: { id: orderId },
      data: { status },
    });

    return NextResponse.json({ success: true, order: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update order status" }, { status: 500 });
  }
}
