// LiveKit access tokens and room admin. Server-only — uses the API secret.
import { randomUUID } from "crypto";
import { AccessToken, RoomServiceClient } from "livekit-server-sdk";

export function isLiveKitConfigured() {
  return !!(process.env.LIVEKIT_URL && process.env.LIVEKIT_API_KEY && process.env.LIVEKIT_API_SECRET);
}

/** The wss:// URL browsers connect to. */
export function liveKitUrl() {
  return process.env.LIVEKIT_URL || "";
}

/** Customer-joinable rooms carry this prefix plus an unguessable suffix. */
export const CONSULT_ROOM_PREFIX = "consult-";

export function newConsultRoomName() {
  return `${CONSULT_ROOM_PREFIX}${randomUUID()}`;
}

export function isConsultRoomName(room: string) {
  return /^consult-[0-9a-f-]{36}$/.test(room);
}

export function newLiveRoomName() {
  return `live-${randomUUID()}`;
}

/** Closes a room and disconnects everyone in it. Safe to call if it doesn't exist. */
export async function closeRoom(room: string) {
  try {
    await getRoomService().deleteRoom(room);
  } catch {
    // Room already gone (or never created) — nothing to close.
  }
}

/** Participants currently in a room (empty if the room doesn't exist). */
export async function listRoomParticipants(room: string) {
  try {
    return await getRoomService().listParticipants(room);
  } catch {
    return [];
  }
}

export async function createLiveKitToken(opts: {
  room: string;
  identity: string;
  name?: string;
  /** Staff: may moderate the room (mute/remove participants). */
  roomAdmin?: boolean;
  /** false = watch-only (livestream viewers). Defaults to true. */
  canPublish?: boolean;
  /** false = may not send chat/data messages. Defaults to canPublish. */
  canPublishData?: boolean;
  /** Stored on the participant, readable by everyone in the room (e.g. {"role":"host"}). */
  metadata?: string;
  ttlSeconds?: number;
}) {
  if (!isLiveKitConfigured()) {
    throw new Error("LiveKit is not configured (LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET).");
  }
  const at = new AccessToken(process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET, {
    identity: opts.identity,
    name: opts.name,
    ttl: opts.ttlSeconds ?? 60 * 60 * 2,
    metadata: opts.metadata,
  });
  const canPublish = opts.canPublish ?? true;
  at.addGrant({
    room: opts.room,
    roomJoin: true,
    canPublish,
    canSubscribe: true,
    canPublishData: opts.canPublishData ?? canPublish,
    roomAdmin: !!opts.roomAdmin,
  });
  return at.toJwt();
}

/** Server-side room management (list/close rooms). Uses the HTTPS form of LIVEKIT_URL. */
export function getRoomService() {
  const httpUrl = liveKitUrl().replace(/^ws(s?):\/\//, "http$1://");
  return new RoomServiceClient(httpUrl, process.env.LIVEKIT_API_KEY, process.env.LIVEKIT_API_SECRET);
}
