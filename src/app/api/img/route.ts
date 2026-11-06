import { NextRequest, NextResponse } from "next/server";
import { imgproxyUrl, isImgproxyConfigured, type ImgproxyOptions } from "@/lib/imgproxy";
import { publicObjectOrigin } from "@/lib/storage";

export const runtime = "nodejs";

// GET /api/img?src=<url>&w=&h=&fit=fill|fit&q=&f=webp
// Signs an imgproxy URL and redirects to it. Only our own media origin is
// allowed as a source so this can't be used as an open image proxy.
export async function GET(req: NextRequest) {
  const p = req.nextUrl.searchParams;
  const src = p.get("src") || "";

  let source: URL;
  try {
    source = new URL(src);
  } catch {
    return NextResponse.json({ error: "Invalid src" }, { status: 400 });
  }

  if (source.origin !== publicObjectOrigin()) {
    return NextResponse.json({ error: "Source not allowed" }, { status: 400 });
  }

  // imgproxy not set up yet — serve the original so images still render.
  if (!isImgproxyConfigured()) {
    return NextResponse.redirect(source.toString(), 302);
  }

  const fit = p.get("fit");
  const f = p.get("f");
  const opts: ImgproxyOptions = {
    width: Number(p.get("w")) || undefined,
    height: Number(p.get("h")) || undefined,
    quality: Number(p.get("q")) || undefined,
    resize: fit === "fill" ? "fill" : "fit",
    format: f === "webp" || f === "avif" || f === "jpg" || f === "png" ? f : undefined,
  };

  const res = NextResponse.redirect(imgproxyUrl(source.toString(), opts), 308);
  res.headers.set("Cache-Control", "public, max-age=86400, s-maxage=31536000");
  return res;
}
