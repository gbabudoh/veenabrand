import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { z } from "zod";
import { DELIVERY_FEES_MINOR, generateOrderNumber } from "@/lib/money";

const checkoutSchema = z.object({
  email: z.string().email(),
  deliveryMethod: z.enum([
    "PICKUP",
    "NEXT_DAY_LAGOS",
    "TWO_THREE_DAY_NIGERIA",
    "OUT_OF_LAGOS",
    "INTERNATIONAL",
  ]),
  pickupStoreId: z.string().optional(),
  shippingAddress: z
    .object({
      line1: z.string(),
      city: z.string(),
      state: z.string(),
      country: z.string(),
    })
    .optional(),
  paymentMethod: z.enum(["CARD", "BANK_TRANSFER", "PAY_ON_DELIVERY"]),
});

// POST /api/checkout — creates the Order from the current cart. Wire your payment
// provider (Paystack/Flutterwave/Stripe) BEFORE marking status PAID; this stub
// creates the order as PENDING_PAYMENT and returns it for the Confirmation step.
export async function POST(req: NextRequest) {
  const body = checkoutSchema.parse(await req.json());
  const token = cookies().get("veena_guest_cart")?.value;
  if (!token) return NextResponse.json({ error: "No active cart" }, { status: 400 });

  const cart = await db.cart.findUnique({
    where: { guestToken: token },
    include: { items: { include: { product: true } } },
  });
  if (!cart || cart.items.length === 0) {
    return NextResponse.json({ error: "Cart is empty" }, { status: 400 });
  }

  if (body.deliveryMethod === "PAY_ON_DELIVERY" as any) {
    // guard example — pay on delivery should only be allowed for Lagos next-day
  }

  const subtotalMinor = cart.items.reduce(
    (sum: number, it: { product: { priceMinor: number }; quantity: number }) =>
      sum + it.product.priceMinor * it.quantity,
    0
  );
  const deliveryFeeMinor = DELIVERY_FEES_MINOR[body.deliveryMethod] ?? 0;

  const order = await db.order.create({
    data: {
      orderNumber: generateOrderNumber(),
      email: body.email,
      subtotalMinor,
      deliveryFeeMinor,
      totalMinor: subtotalMinor + deliveryFeeMinor,
      deliveryMethod: body.deliveryMethod,
      pickupStoreId: body.pickupStoreId,
      shippingAddress: body.shippingAddress ? JSON.stringify(body.shippingAddress) : undefined,
      paymentMethod: body.paymentMethod,
      status: "PENDING_PAYMENT",
      items: {
        create: cart.items.map((it: { productId: string; size: string; colorName: string; quantity: number; product: { priceMinor: number } }) => ({
          productId: it.productId,
          size: it.size,
          colorName: it.colorName,
          quantity: it.quantity,
          unitPriceMinor: it.product.priceMinor,
        })),
      },
    },
    include: { items: true },
  });

  // TODO: kick off payment intent with your provider here, then clear the cart
  // once payment is confirmed (webhook), not immediately on order creation.
  await db.cartItem.deleteMany({ where: { cartId: cart.id } });

  return NextResponse.json({ order });
}
