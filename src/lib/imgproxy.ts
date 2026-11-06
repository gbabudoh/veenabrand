// imgproxy URL signing. Server-only — IMGPROXY_KEY/SALT must never reach the browser.
// Client components go through /api/img (see "@/lib/image-url"), which signs here.
import crypto from "crypto";

export interface ImgproxyOptions {
  width?: number;
  height?: number;
  /** fill = crop to exact box, fit = keep whole image inside the box. */
  resize?: "fill" | "fit";
  quality?: number;
  format?: "webp" | "avif" | "jpg" | "png";
}

export function isImgproxyConfigured() {
  return !!process.env.IMGPROXY_URL;
}

function sign(path: string) {
  const key = process.env.IMGPROXY_KEY;
  const salt = process.env.IMGPROXY_SALT;
  // Without a key/salt pair the server must run with signatures disabled.
  if (!key || !salt) return "insecure";
  return crypto
    .createHmac("sha256", Buffer.from(key, "hex"))
    .update(Buffer.from(salt, "hex"))
    .update(path)
    .digest("base64url");
}

/** Signed imgproxy URL for an absolute source URL. Returns the source unchanged if imgproxy is off. */
export function imgproxyUrl(sourceUrl: string, opts: ImgproxyOptions = {}) {
  const base = process.env.IMGPROXY_URL;
  if (!base || !/^https?:\/\//i.test(sourceUrl)) return sourceUrl;

  const clamp = (n: number | undefined, max: number) =>
    n && Number.isFinite(n) ? Math.max(0, Math.min(Math.round(n), max)) : 0;
  const w = clamp(opts.width, 4000);
  const h = clamp(opts.height, 4000);
  const q = clamp(opts.quality, 100) || 80;

  const parts = [`rs:${opts.resize || "fit"}:${w}:${h}`, `q:${q}`];
  if (opts.format) parts.push(`f:${opts.format}`);

  const path = `/${parts.join("/")}/${Buffer.from(sourceUrl).toString("base64url")}`;
  return `${base.replace(/\/+$/, "")}/${sign(path)}${path}`;
}
