"use client";

import "@livekit/components-styles";
import React, { useEffect } from "react";
import {
  ControlBar,
  LiveKitRoom,
  ParticipantTile,
  RoomAudioRenderer,
  useConnectionState,
  useParticipants,
  useTracks,
} from "@livekit/components-react";
import { ConnectionState, Track } from "livekit-client";

interface BroadcastStudioProps {
  url: string;
  token: string;
  onLeave?: () => void;
  onAudienceChange?: (viewers: number) => void;
  height?: string;
}

// Broadcaster view for a live show: preview of what viewers see (screen share
// takes the main stage, camera goes picture-in-picture), plus camera / mic /
// screen-share controls. Viewers are watch-only, so there is nothing to show of them.
export default function BroadcastStudio({ url, token, onLeave, onAudienceChange, height = "64vh" }: BroadcastStudioProps) {
  return (
    <div
      data-lk-theme="default"
      style={{ height, minHeight: "380px", borderRadius: "8px", overflow: "hidden", background: "#111", display: "flex", flexDirection: "column" }}
    >
      <LiveKitRoom serverUrl={url} token={token} connect video audio onDisconnected={onLeave} style={{ height: "100%", display: "flex", flexDirection: "column" }}>
        <Stage onAudienceChange={onAudienceChange} />
        <RoomAudioRenderer />
        <ControlBar
          variation="verbose"
          controls={{ camera: true, microphone: true, screenShare: true, chat: false, leave: true }}
          style={{ borderTop: "1px solid rgba(255,255,255,0.08)" }}
        />
      </LiveKitRoom>
    </div>
  );
}

function Stage({ onAudienceChange }: { onAudienceChange?: (viewers: number) => void }) {
  const state = useConnectionState();
  const participants = useParticipants();
  const viewers = participants.filter((p) => !p.identity.startsWith("staff-")).length;

  useEffect(() => {
    onAudienceChange?.(viewers);
  }, [viewers, onAudienceChange]);

  const tracks = useTracks(
    [
      { source: Track.Source.ScreenShare, withPlaceholder: false },
      { source: Track.Source.Camera, withPlaceholder: true },
    ],
    { onlySubscribed: false }
  ).filter((t) => t.participant.identity.startsWith("staff-"));

  const screen = tracks.find((t) => t.source === Track.Source.ScreenShare);
  const cameras = tracks.filter((t) => t.source === Track.Source.Camera);
  const main = screen ?? cameras[0];
  const pip = screen ? cameras[0] : undefined;

  return (
    <div style={{ flex: 1, position: "relative", minHeight: 0 }}>
      {state !== ConnectionState.Connected ? (
        <div style={centered}>{state === ConnectionState.Connecting ? "Connecting to studio…" : String(state)}</div>
      ) : main ? (
        <ParticipantTile trackRef={main} style={{ height: "100%" }} />
      ) : (
        <div style={centered}>Turn on your camera or share your screen to start the broadcast feed.</div>
      )}
      {pip && (
        <div style={{ position: "absolute", right: "16px", bottom: "16px", width: "24%", minWidth: "160px", aspectRatio: "16/9", borderRadius: "6px", overflow: "hidden", boxShadow: "0 4px 18px rgba(0,0,0,0.4)" }}>
          <ParticipantTile trackRef={pip} style={{ height: "100%" }} />
        </div>
      )}
    </div>
  );
}

const centered: React.CSSProperties = {
  position: "absolute",
  inset: 0,
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  textAlign: "center",
  padding: "24px",
  color: "rgba(255,255,255,0.6)",
  fontSize: "14px",
};
