import { NextRequest, NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { buildObjectKey, isStorageConfigured, uploadObject } from "@/lib/storage";

export const runtime = "nodejs";

const ALLOWED: Record<string, { ext: string; maxBytes: number }> = {
  "image/jpeg": { ext: "jpg", maxBytes: 15 * 1024 * 1024 },
  "image/png": { ext: "png", maxBytes: 15 * 1024 * 1024 },
  "image/webp": { ext: "webp", maxBytes: 15 * 1024 * 1024 },
  "image/avif": { ext: "avif", maxBytes: 15 * 1024 * 1024 },
  "image/gif": { ext: "gif", maxBytes: 15 * 1024 * 1024 },
  "image/svg+xml": { ext: "svg", maxBytes: 2 * 1024 * 1024 },
  "video/mp4": { ext: "mp4", maxBytes: 200 * 1024 * 1024 },
  "video/webm": { ext: "webm", maxBytes: 200 * 1024 * 1024 },
};

// POST /api/admin/uploads — multipart form: `file`, optional `folder` (e.g. "mega-menu").
// Stores the file in MinIO and returns its public URL.
export async function POST(req: NextRequest) {
  const session = getAdminSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isStorageConfigured()) {
    return NextResponse.json({ error: "Media storage is not configured on the server." }, { status: 503 });
  }

  try {
    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "uploads");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 });
    }

    const rule = ALLOWED[file.type];
    if (!rule) {
      return NextResponse.json({ error: `Unsupported file type: ${file.type || "unknown"}` }, { status: 415 });
    }
    if (file.size > rule.maxBytes) {
      return NextResponse.json(
        { error: `File too large (max ${Math.round(rule.maxBytes / 1024 / 1024)}MB)` },
        { status: 413 }
      );
    }

    const key = buildObjectKey(folder, file.name, rule.ext);
    const body = Buffer.from(await file.arrayBuffer());
    const result = await uploadObject(key, body, file.type);

    return NextResponse.json({ ...result, contentType: file.type, size: file.size });
  } catch (err: any) {
    console.error("Upload failed:", err);
    return NextResponse.json({ error: err.message || "Upload failed" }, { status: 500 });
  }
}
