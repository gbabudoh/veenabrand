import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

// GET /api/admin/analytics — Dashboard stats
export async function GET(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Core aggregates
    const ordersCount = await db.order.count();
    const customersCount = await db.user.count({ where: { role: "USER" } });

    // Sum revenue for non-cancelled and non-pending orders (actual money captured)
    const paidOrders = await db.order.findMany({
      where: {
        status: { in: ["PAID", "IN_PRODUCTION", "FULFILLED"] },
      },
      select: {
        totalMinor: true,
      },
    });
    const totalRevenueMinor = paidOrders.reduce(
      (sum: number, o: { totalMinor: number }) => sum + o.totalMinor,
      0
    );

    // 2. Order status distribution
    const statusCounts = await db.order.groupBy({
      by: ["status"],
      _count: {
        id: true,
      },
    });

    const statusMap = statusCounts.reduce(
      (acc: Record<string, number>, curr: { status: string; _count: { id: number } }) => {
        acc[curr.status] = curr._count.id;
        return acc;
      },
      {}
    );

    // 3. Top products (ordered by sum of quantity)
    const orderItems = await db.orderItem.findMany({
      include: {
        product: {
          select: { name: true, priceMinor: true },
        },
      },
    });

    const productSalesMap: Record<string, { name: string; quantity: number; revenueMinor: number }> = {};
    for (const item of orderItems) {
      if (!productSalesMap[item.productId]) {
        productSalesMap[item.productId] = {
          name: item.product?.name || "Deleted Product",
          quantity: 0,
          revenueMinor: 0,
        };
      }
      productSalesMap[item.productId].quantity += item.quantity;
      productSalesMap[item.productId].revenueMinor += item.unitPriceMinor * item.quantity;
    }

    const topProducts = Object.values(productSalesMap)
      .sort((a, b) => b.quantity - a.quantity)
      .slice(0, 5);

    // 4. Recent sales trend (last 10 orders)
    const recentOrders = await db.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        totalMinor: true,
        status: true,
        createdAt: true,
        email: true,
      },
    });

    return NextResponse.json({
      metrics: {
        ordersCount,
        customersCount,
        totalRevenueMinor,
      },
      statusDistribution: {
        PENDING_PAYMENT: statusMap["PENDING_PAYMENT"] || 0,
        PAID: statusMap["PAID"] || 0,
        IN_PRODUCTION: statusMap["IN_PRODUCTION"] || 0,
        FULFILLED: statusMap["FULFILLED"] || 0,
        CANCELLED: statusMap["CANCELLED"] || 0,
      },
      topProducts,
      recentOrders,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to fetch analytics" }, { status: 500 });
  }
}
