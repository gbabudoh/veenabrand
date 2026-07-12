import { NextRequest, NextResponse } from "next/server";
import { cookies } from "next/headers";
import { db } from "@/lib/db";
import { z } from "zod";

const GUEST_COOKIE = "veena_guest_cart";

async function getOrCreateCart() {
  const jar = cookies();
  let token = jar.get(GUEST_COOKIE)?.value;

  let cart = token
    ? await db.cart.findUnique({ where: { guestToken: token }, include: { items: { include: { product: true } } } })
    : null;

  if (!cart) {
    token = crypto.randomUUID();
    cart = await db.cart.create({
      data: { guestToken: token },
      include: { items: { include: { product: true } } },
    });
    jar.set(GUEST_COOKIE, token, { httpOnly: true, sameSite: "lax", maxAge: 60 * 60 * 24 * 30 });
  }
  return cart;
}

// GET /api/cart — current bag contents, for the nav "Bag (n)" pill + checkout Bag step
export async function GET() {
  const cart = await getOrCreateCart();
  return NextResponse.json({ cart });
}

const addItemSchema = z.object({
  productId: z.string(),
  size: z.string(),
  colorName: z.string(),
  quantity: z.number().int().min(1).default(1),
});

// POST /api/cart — add to bag (PDP "Add to Bag" button)
export async function POST(req: NextRequest) {
  const body = addItemSchema.parse(await req.json());
  const cart = await getOrCreateCart();

  const item = await db.cartItem.upsert({
    where: {
      cartId_productId_size_colorName: {
        cartId: cart.id,
        productId: body.productId,
        size: body.size,
        colorName: body.colorName,
      },
    },
    update: { quantity: { increment: body.quantity } },
    create: { cartId: cart.id, ...body },
  });

  return NextResponse.json({ item });
}

const updateItemSchema = z.object({
  itemId: z.string(),
  quantity: z.number().int().min(0), // 0 removes the item
});

// PATCH /api/cart — qty stepper / remove in the Bag step
export async function PATCH(req: NextRequest) {
  const body = updateItemSchema.parse(await req.json());

  if (body.quantity === 0) {
    await db.cartItem.delete({ where: { id: body.itemId } });
    return NextResponse.json({ removed: true });
  }
  const item = await db.cartItem.update({ where: { id: body.itemId }, data: { quantity: body.quantity } });
  return NextResponse.json({ item });
}
