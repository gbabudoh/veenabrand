// Client-safe image URL helper. Absolute (uploaded) images are routed through
// /api/img, which signs an imgproxy URL server-side and redirects to it.
// Local /public paths are returned as-is.

export interface ImageUrlOptions {
  width?: number;
  height?: number;
  resize?: "fill" | "fit";
  quality?: number;
  format?: "webp" | "avif" | "jpg" | "png";
}

export function imageUrl(src: string | null | undefined, opts: ImageUrlOptions = {}) {
  if (!src) return "";
  if (!/^https?:\/\//i.test(src)) return src;

  const params = new URLSearchParams({ src });
  if (opts.width) params.set("w", String(opts.width));
  if (opts.height) params.set("h", String(opts.height));
  if (opts.resize) params.set("fit", opts.resize);
  if (opts.quality) params.set("q", String(opts.quality));
  if (opts.format) params.set("f", opts.format);
  return `/api/img?${params.toString()}`;
}
