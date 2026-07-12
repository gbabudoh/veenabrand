import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";

// Helper to generate a URL slug
function slugify(text: string) {
  return text
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// GET /api/admin/products — List all products
export async function GET(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const products = await db.product.findMany({
      include: {
        colors: { orderBy: { sortOrder: "asc" } },
        media: { orderBy: { sortOrder: "asc" } },
        variants: true
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({ products });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to query products" }, { status: 500 });
  }
}

// POST /api/admin/products — Create product
export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { name, description, fabricCare, shippingReturnsNote, gender, category, priceMinor, colors, media } = body;

    if (!name || !priceMinor || !gender || !category) {
      return NextResponse.json({ error: "Name, price, gender, and category are required" }, { status: 400 });
    }

    const slug = `${slugify(name)}-${Date.now().toString().slice(-4)}`;

    const productColors = colors || [{ name: "Ivory", hex: "#e7ddc9" }];
    const productMedia = media || [
      { type: "IMAGE", url: "/placeholder/front.jpg", label: "Front" }
    ];

    const newProduct = await db.product.create({
      data: {
        name,
        slug,
        description: description || "",
        fabricCare: fabricCare || "",
        shippingReturnsNote: shippingReturnsNote || "",
        gender,
        category,
        priceMinor: Number(priceMinor),
        colors: {
          create: productColors.map((c: any, i: number) => ({
            name: c.name,
            hex: c.hex,
            sortOrder: i,
          })),
        },
        media: {
          create: productMedia.map((m: any, i: number) => ({
            type: m.type,
            url: m.url,
            label: m.label || "",
            sortOrder: i,
          })),
        },
        variants: {
          create: ["XS", "S", "M", "L", "XL"].flatMap((size) =>
            productColors.map((c: any) => ({
              size,
              colorName: c.name,
              stock: 20, // default stock allocation
            }))
          ),
        },
      },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create product" }, { status: 500 });
  }
}

// PATCH /api/admin/products — Update product
export async function PATCH(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await req.json();
    const { id, name, description, fabricCare, shippingReturnsNote, gender, category, priceMinor } = body;

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const updated = await db.product.update({
      where: { id },
      data: {
        name,
        description,
        fabricCare,
        shippingReturnsNote,
        gender,
        category,
        priceMinor: priceMinor ? Number(priceMinor) : undefined,
      },
    });

    return NextResponse.json({ success: true, product: updated });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update product" }, { status: 500 });
  }
}

// DELETE /api/admin/products — Delete product
export async function DELETE(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { searchParams } = new URL(req.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    await db.product.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete product" }, { status: 500 });
  }
}
