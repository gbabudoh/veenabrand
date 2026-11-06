import { NextResponse } from "next/server";
import { getAdminSession } from "@/lib/auth";
import { getBucket, getStorageClient, isStorageConfigured } from "@/lib/storage";
import { isImgproxyConfigured } from "@/lib/imgproxy";
import { getRoomService, isLiveKitConfigured } from "@/lib/livekit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type Check = { configured: boolean; ok: boolean; detail: string };

function withTimeout<T>(p: Promise<T>, ms = 6000): Promise<T> {
  return Promise.race([
    p,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`timed out after ${ms / 1000}s`)), ms)),
  ]);
}

async function checkStorage(): Promise<Check> {
  if (!isStorageConfigured()) return { configured: false, ok: false, detail: "S3_* variables missing" };
  try {
    const exists = await withTimeout(getStorageClient().bucketExists(getBucket()));
    return exists
      ? { configured: true, ok: true, detail: `Bucket "${getBucket()}" reachable` }
      : { configured: true, ok: false, detail: `Bucket "${getBucket()}" does not exist` };
  } catch (err: any) {
    return { configured: true, ok: false, detail: err.message || "Connection failed" };
  }
}

async function checkImgproxy(): Promise<Check> {
  if (!isImgproxyConfigured()) return { configured: false, ok: false, detail: "IMGPROXY_URL missing" };
  const signed = !!(process.env.IMGPROXY_KEY && process.env.IMGPROXY_SALT);
  try {
    const res = await withTimeout(fetch(`${process.env.IMGPROXY_URL!.replace(/\/+$/, "")}/health`, { cache: "no-store" }));
    return {
      configured: true,
      ok: res.ok,
      detail: res.ok
        ? `Healthy${signed ? " · signed URLs" : " · UNSIGNED (set IMGPROXY_KEY/SALT)"}`
        : `Health check returned ${res.status}`,
    };
  } catch (err: any) {
    return { configured: true, ok: false, detail: err.message || "Connection failed" };
  }
}

async function checkLiveKit(): Promise<Check> {
  if (!isLiveKitConfigured()) return { configured: false, ok: false, detail: "LIVEKIT_* variables missing" };
  try {
    const rooms = await withTimeout(getRoomService().listRooms());
    return { configured: true, ok: true, detail: `Connected · ${rooms.length} active room(s)` };
  } catch (err: any) {
    return { configured: true, ok: false, detail: err.message || "Connection failed" };
  }
}

// GET /api/admin/integrations — live connectivity check for MinIO, imgproxy and LiveKit.
export async function GET() {
  if (!getAdminSession()) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const [storage, imgproxy, livekit] = await Promise.all([checkStorage(), checkImgproxy(), checkLiveKit()]);
  return NextResponse.json({ storage, imgproxy, livekit });
}
