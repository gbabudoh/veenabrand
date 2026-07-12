import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";

// GET /api/orders/[orderNumber] — backs the Checkout "Confirmation" step and any
// future order-status / tracking page.
export async function GET(_req: NextRequest, { params }: { params: { orderNumber: string } }) {
  const order = await db.order.findUnique({
    where: { orderNumber: params.orderNumber },
    include: { items: { include: { product: true } } },
  });
  if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
  return NextResponse.json({ order });
}
