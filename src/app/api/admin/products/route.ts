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
        variants: true,
        category: { select: { id: true, name: true, slug: true } }
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
    const { name, description, fabricCare, shippingReturnsNote, gender, categoryId, priceMinor, colors, media } = body;

    if (!name || !priceMinor || !gender || !categoryId) {
      return NextResponse.json({ error: "Name, price, gender, and category are required" }, { status: 400 });
    }

    const categoryExists = await db.category.findUnique({ where: { id: categoryId } });
    if (!categoryExists) {
      return NextResponse.json({ error: "Selected category no longer exists" }, { status: 400 });
    }

    const slug = `${slugify(name)}-${Date.now().toString().slice(-4)}`;

    const productColors = colors && colors.length > 0 ? colors : [{ name: "Ivory", hex: "#e7ddc9" }];
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
        categoryId,
        priceMinor: Number(priceMinor),
        colors: {
          create: productColors.map((c: any, i: number) => ({
            name: (c.name || "Custom").trim(),
            hex: (c.hex || "#000000").trim(),
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
              colorName: (c.name || "Custom").trim(),
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
    const { id, name, description, fabricCare, shippingReturnsNote, gender, categoryId, priceMinor, colors } = body;

    if (!id) {
      return NextResponse.json({ error: "Product id is required" }, { status: 400 });
    }

    const STANDARD_SIZES = ["XS", "S", "M", "L", "XL"];

    const updated = await db.$transaction(async (tx) => {
      // 1. Update basic product fields
      const prod = await tx.product.update({
        where: { id },
        data: {
          name,
          description,
          fabricCare,
          shippingReturnsNote,
          gender,
          categoryId: categoryId || undefined,
          priceMinor: priceMinor ? Number(priceMinor) : undefined,
        },
      });

      // 2. Update colors if supplied
      if (colors && Array.isArray(colors) && colors.length > 0) {
        // Remove existing colors
        await tx.productColor.deleteMany({
          where: { productId: id },
        });

        // Insert updated colors
        await tx.productColor.createMany({
          data: colors.map((c: any, i: number) => ({
            productId: id,
            name: (c.name || "Custom").trim(),
            hex: (c.hex || "#000000").trim(),
            sortOrder: i,
          })),
        });

        // 3. Synchronize variants
        const existingVariants = await tx.productVariant.findMany({
          where: { productId: id },
        });

        const activeColorNamesLower = colors.map((c: any) => (c.name || "").trim().toLowerCase());

        // Create variants for new colors
        const variantsToCreate: { productId: string; size: string; colorName: string; stock: number }[] = [];
        for (const c of colors) {
          const trimmedColor = (c.name || "Custom").trim();
          for (const size of STANDARD_SIZES) {
            const exists = existingVariants.some(
              (v) => v.size === size && v.colorName.toLowerCase() === trimmedColor.toLowerCase()
            );
            if (!exists) {
              variantsToCreate.push({
                productId: id,
                size,
                colorName: trimmedColor,
                stock: 20,
              });
            }
          }
        }

        if (variantsToCreate.length > 0) {
          await tx.productVariant.createMany({
            data: variantsToCreate,
          });
        }

        // Delete variants for removed colors
        const removedVariantIds = existingVariants
          .filter((v) => !activeColorNamesLower.includes(v.colorName.toLowerCase()))
          .map((v) => v.id);

        if (removedVariantIds.length > 0) {
          await tx.productVariant.deleteMany({
            where: { id: { in: removedVariantIds } },
          });
        }
      }

      return tx.product.findUnique({
        where: { id },
        include: {
          colors: { orderBy: { sortOrder: "asc" } },
          variants: true,
          media: { orderBy: { sortOrder: "asc" } },
          category: true,
        },
      });
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
