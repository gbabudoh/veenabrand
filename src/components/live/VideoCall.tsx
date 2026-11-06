"use client";

import "@livekit/components-styles";
import React from "react";
import { LiveKitRoom, VideoConference } from "@livekit/components-react";

interface VideoCallProps {
  url: string;
  token: string;
  /** Devices picked on the pre-join screen, if any. */
  videoEnabled?: boolean;
  audioEnabled?: boolean;
  videoDeviceId?: string;
  audioDeviceId?: string;
  onLeave?: () => void;
  height?: string;
}

// Two-way video call (consultations): camera, mic, screen share, chat, and a
// grid/focus layout, all from LiveKit's prebuilt conference UI.
export default function VideoCall({
  url,
  token,
  videoEnabled = true,
  audioEnabled = true,
  videoDeviceId,
  audioDeviceId,
  onLeave,
  height = "72vh",
}: VideoCallProps) {
  return (
    <div
      data-lk-theme="default"
      style={{ height, minHeight: "420px", borderRadius: "8px", overflow: "hidden", background: "#111" }}
    >
      <LiveKitRoom
        serverUrl={url}
        token={token}
        connect
        video={videoEnabled ? (videoDeviceId ? { deviceId: videoDeviceId } : true) : false}
        audio={audioEnabled ? (audioDeviceId ? { deviceId: audioDeviceId } : true) : false}
        onDisconnected={onLeave}
        style={{ height: "100%" }}
      >
        <VideoConference />
      </LiveKitRoom>
    </div>
  );
}
