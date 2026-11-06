// MinIO / S3 object storage. Server-only — it reads secret keys from the env.
import crypto from "crypto";
import { Client } from "minio";

function readConfig() {
  const endpoint = process.env.S3_ENDPOINT || "";
  return {
    endpoint,
    region: process.env.S3_REGION || "us-east-1",
    accessKey: process.env.S3_ACCESS_KEY || "",
    secretKey: process.env.S3_SECRET_KEY || "",
    bucket: process.env.S3_BUCKET || "",
    pathStyle: (process.env.S3_FORCE_PATH_STYLE ?? "true") !== "false",
    publicUrl: process.env.S3_PUBLIC_URL || "",
  };
}

export function isStorageConfigured() {
  const c = readConfig();
  return !!(c.endpoint && c.accessKey && c.secretKey && c.bucket);
}

let client: Client | null = null;

export function getStorageClient(): Client {
  if (client) return client;
  const c = readConfig();
  if (!isStorageConfigured()) {
    throw new Error("Object storage is not configured (S3_ENDPOINT, S3_ACCESS_KEY, S3_SECRET_KEY, S3_BUCKET).");
  }
  // The minio client wants host/port/ssl separately, not a URL.
  const url = new URL(c.endpoint);
  const useSSL = url.protocol === "https:";
  client = new Client({
    endPoint: url.hostname,
    port: url.port ? Number(url.port) : useSSL ? 443 : 80,
    useSSL,
    accessKey: c.accessKey,
    secretKey: c.secretKey,
    region: c.region,
    pathStyle: c.pathStyle,
  });
  return client;
}

export function getBucket() {
  return readConfig().bucket;
}

/** Public URL for an object. The bucket (or the key's prefix) must allow anonymous read. */
export function publicObjectUrl(key: string) {
  const c = readConfig();
  const encodedKey = key.split("/").map(encodeURIComponent).join("/");
  if (c.publicUrl) return `${c.publicUrl.replace(/\/+$/, "")}/${encodedKey}`;
  const base = new URL(c.endpoint);
  return c.pathStyle
    ? `${base.origin}/${c.bucket}/${encodedKey}`
    : `${base.protocol}//${c.bucket}.${base.host}/${encodedKey}`;
}

/** The public origin objects are served from — used to allow-list imgproxy sources. */
export function publicObjectOrigin() {
  try {
    return new URL(publicObjectUrl("x")).origin;
  } catch {
    return null;
  }
}

function safeName(name: string) {
  return (
    name
      .toLowerCase()
      .replace(/\.[^.]+$/, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "")
      .slice(0, 60) || "file"
  );
}

/** Builds a unique, readable key: `<folder>/<yyyy>/<mm>/<id>-<name>.<ext>`. */
export function buildObjectKey(folder: string, originalName: string, ext: string) {
  const now = new Date();
  const yyyy = now.getUTCFullYear();
  const mm = String(now.getUTCMonth() + 1).padStart(2, "0");
  const id = crypto.randomBytes(6).toString("hex");
  const cleanFolder = folder.replace(/[^a-z0-9/-]/gi, "").replace(/^\/+|\/+$/g, "") || "uploads";
  return `${cleanFolder}/${yyyy}/${mm}/${id}-${safeName(originalName)}.${ext}`;
}

export async function uploadObject(key: string, body: Buffer, contentType: string) {
  const s3 = getStorageClient();
  await s3.putObject(getBucket(), key, body, body.length, {
    "Content-Type": contentType,
    "Cache-Control": "public, max-age=31536000, immutable",
  });
  return { key, url: publicObjectUrl(key) };
}

export async function deleteObject(key: string) {
  await getStorageClient().removeObject(getBucket(), key);
}
