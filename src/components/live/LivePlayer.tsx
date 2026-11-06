"use client";

import "@livekit/components-styles";
import React from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  StartAudio,
  VideoTrack,
  useConnectionState,
  useParticipants,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";

interface LivePlayerProps {
  url: string;
  token: string;
  onLeave?: () => void;
}

// Watch-only player for a live show. Connects without camera/mic and plays the
// host's screen share (main) and camera (picture-in-picture when both are on).
export default function LivePlayer({ url, token, onLeave }: LivePlayerProps) {
  return (
    <div data-lk-theme="default" style={{ position: "relative", width: "100%", aspectRatio: "16/9", background: "#0b0b0b", borderRadius: "6px", overflow: "hidden" }}>
      <LiveKitRoom serverUrl={url} token={token} connect audio={false} video={false} onDisconnected={onLeave} style={{ height: "100%" }}>
        <Feed />
        <RoomAudioRenderer />
        <StartAudio
          label="Tap to turn on sound"
          style={{ position: "absolute", left: "50%", bottom: "20px", transform: "translateX(-50%)", zIndex: 3 }}
        />
      </LiveKitRoom>
    </div>
  );
}

function Feed() {
  const state = useConnectionState();
  const participants = useParticipants();
  const watching = participants.filter((p) => p.identity.startsWith("viewer-")).length;

  const tracks = useTracks([Track.Source.ScreenShare, Track.Source.Camera], { onlySubscribed: true }).filter((t) =>
    t.participant.identity.startsWith("staff-")
  );
  const screen = tracks.find((t) => t.source === Track.Source.ScreenShare);
  const camera = tracks.find((t) => t.source === Track.Source.Camera);
  const main = screen ?? camera;
  const pip = screen ? camera : undefined;

  return (
    <>
      {main ? (
        <VideoTrack trackRef={main} style={{ width: "100%", height: "100%", objectFit: "contain" }} />
      ) : (
        <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.65)", fontSize: "14px", textAlign: "center", padding: "20px" }}>
          {state === ConnectionState.Connected ? "The show will appear here in a moment…" : "Connecting…"}
        </div>
      )}

      {pip && (
        <div style={{ position: "absolute", right: "14px", bottom: "14px", width: "22%", minWidth: "120px", aspectRatio: "16/9", borderRadius: "4px", overflow: "hidden", boxShadow: "0 4px 18px rgba(0,0,0,0.45)" }}>
          <VideoTrack trackRef={pip} style={{ width: "100%", height: "100%", objectFit: "cover" }} />
        </div>
      )}

      <div style={{ position: "absolute", top: "14px", left: "14px", display: "flex", gap: "8px", zIndex: 2 }}>
        <span style={{ background: "#D92D20", color: "#fff", fontSize: "11px", fontWeight: 700, letterSpacing: "0.08em", padding: "4px 9px", borderRadius: "3px" }}>
          ● LIVE
        </span>
        {state === ConnectionState.Connected && (
          <span style={{ background: "rgba(0,0,0,0.55)", color: "#fff", fontSize: "11px", padding: "4px 9px", borderRadius: "3px" }}>
            {watching} watching
          </span>
        )}
      </div>
    </>
  );
}
