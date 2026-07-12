import crypto from "crypto";
import { cookies } from "next/headers";

const SECRET = process.env.JWT_SECRET || "veena-secret-key-2328-fashion-atelier";

// PBKDF2 Password Hashing
export function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return `${salt}:${hash}`;
}

export function verifyPassword(password: string, storedHash: string): boolean {
  if (!storedHash || !storedHash.includes(":")) return false;
  const [salt, originalHash] = storedHash.split(":");
  const computedHash = crypto
    .pbkdf2Sync(password, salt, 1000, 64, "sha512")
    .toString("hex");
  return computedHash === originalHash;
}

// Custom Signed Session Tokens (HMAC-SHA256)
interface SessionData {
  userId: string;
  username: string;
  role: string;
  exp: number;
}

export function encryptSession(data: Omit<SessionData, "exp">, lifespanSeconds = 86400): string {
  const exp = Math.floor(Date.now() / 1000) + lifespanSeconds;
  const payloadStr = JSON.stringify({ ...data, exp });
  const payloadBase64 = Buffer.from(payloadStr).toString("base64url");
  
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(payloadBase64)
    .digest("base64url");
    
  return `${payloadBase64}.${signature}`;
}

export function decryptSession(token: string): SessionData | null {
  if (!token || !token.includes(".")) return null;
  const [payloadBase64, signature] = token.split(".");
  
  const expectedSignature = crypto
    .createHmac("sha256", SECRET)
    .update(payloadBase64)
    .digest("base64url");
    
  if (signature !== expectedSignature) {
    return null; // Signature verification failed
  }
  
  try {
    const payloadStr = Buffer.from(payloadBase64, "base64url").toString("utf8");
    const data = JSON.parse(payloadStr) as SessionData;
    
    if (data.exp < Math.floor(Date.now() / 1000)) {
      return null; // Token expired
    }
    
    return data;
  } catch (err) {
    return null;
  }
}

export function getAdminSession() {
  const cookieStore = cookies();
  const token = cookieStore.get("veena_admin_session")?.value;
  if (!token) return null;
  const session = decryptSession(token);
  if (!session || (session.role !== "ADMIN" && session.role !== "SUPERADMIN")) {
    return null;
  }
  return session;
}
