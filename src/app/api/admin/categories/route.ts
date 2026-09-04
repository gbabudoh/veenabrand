import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { getAdminSession } from "@/lib/auth";
import { slugify } from "@/lib/categories";

// Builds a slug that is unique across the table, ignoring the row being edited.
async function uniqueSlug(name: string, ignoreId?: string) {
  const base = slugify(name) || "category";
  let candidate = base;
  let n = 2;

  // Names are short and the table is small, so a linear probe is fine here.
  while (true) {
    const clash = await db.category.findUnique({ where: { slug: candidate } });
    if (!clash || clash.id === ignoreId) return candidate;
    candidate = `${base}-${n++}`;
  }
}

// Walks up the parent chain to make sure a move cannot create a loop.
async function wouldCycle(id: string, parentId: string | null) {
  let cursor = parentId;
  for (let depth = 0; cursor && depth < 20; depth++) {
    if (cursor === id) return true;
    const parent: { parentId: string | null } | null = await db.category.findUnique({
      where: { id: cursor },
      select: { parentId: true },
    });
    cursor = parent?.parentId ?? null;
  }
  return false;
}

// GET /api/admin/categories — full flat list, including inactive, with product counts
export async function GET(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const categories = await db.category.findMany({
      orderBy: [{ sortOrder: "asc" }, { name: "asc" }],
      include: {
        parent: { select: { id: true, name: true } },
        _count: { select: { products: true, children: true } },
      },
    });
    return NextResponse.json({ categories });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to query categories" }, { status: 500 });
  }
}

// POST /api/admin/categories — create a category
export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { name, description, gender, parentId, sortOrder, active, showInNav } = await req.json();

    if (!name || !name.trim()) {
      return NextResponse.json({ error: "Name is required" }, { status: 400 });
    }

    if (parentId) {
      const parent = await db.category.findUnique({ where: { id: parentId } });
      if (!parent) {
        return NextResponse.json({ error: "Parent category not found" }, { status: 400 });
      }
    }

    const category = await db.category.create({
      data: {
        name: name.trim(),
        slug: await uniqueSlug(name),
        description: description?.trim() || null,
        gender: gender === "WOMEN" || gender === "MEN" ? gender : null,
        parentId: parentId || null,
        sortOrder: Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : 0,
        active: active !== undefined ? Boolean(active) : true,
        showInNav: showInNav !== undefined ? Boolean(showInNav) : true,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to create category" }, { status: 500 });
  }
}

// PATCH /api/admin/categories — update a category
export async function PATCH(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const { id, name, description, gender, parentId, sortOrder, active, showInNav } = await req.json();

    if (!id) {
      return NextResponse.json({ error: "Category id is required" }, { status: 400 });
    }

    const existing = await db.category.findUnique({ where: { id } });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    const nextParent = parentId === undefined ? existing.parentId : parentId || null;
    if (nextParent === id) {
      return NextResponse.json({ error: "A category cannot be its own parent" }, { status: 400 });
    }
    if (nextParent && (await wouldCycle(id, nextParent))) {
      return NextResponse.json({ error: "That move would nest the category inside itself" }, { status: 400 });
    }

    const renamed = name && name.trim() && name.trim() !== existing.name;

    const category = await db.category.update({
      where: { id },
      data: {
        name: renamed ? name.trim() : undefined,
        // Re-slug on rename so the storefront URL tracks the name.
        slug: renamed ? await uniqueSlug(name, id) : undefined,
        description: description !== undefined ? description?.trim() || null : undefined,
        gender: gender !== undefined ? (gender === "WOMEN" || gender === "MEN" ? gender : null) : undefined,
        parentId: parentId !== undefined ? nextParent : undefined,
        sortOrder: sortOrder !== undefined && Number.isFinite(Number(sortOrder)) ? Number(sortOrder) : undefined,
        active: active !== undefined ? Boolean(active) : undefined,
        showInNav: showInNav !== undefined ? Boolean(showInNav) : undefined,
      },
    });

    return NextResponse.json({ success: true, category });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to update category" }, { status: 500 });
  }
}

// DELETE /api/admin/categories?id=… — delete a category
// Products and child categories are detached (schema uses onDelete: SetNull), never deleted.
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

    const existing = await db.category.findUnique({
      where: { id },
      include: { _count: { select: { products: true, children: true } } },
    });
    if (!existing) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 });
    }

    await db.category.delete({ where: { id } });

    return NextResponse.json({
      success: true,
      detachedProducts: existing._count.products,
      promotedChildren: existing._count.children,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message || "Failed to delete category" }, { status: 500 });
  }
}
