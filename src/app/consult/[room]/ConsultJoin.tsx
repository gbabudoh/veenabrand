"use client";

import "@livekit/components-styles";
import React, { useState } from "react";
import dynamic from "next/dynamic";
import type { LocalUserChoices } from "@livekit/components-react";

const PreJoin = dynamic(() => import("@livekit/components-react").then((m) => m.PreJoin), { ssr: false });
const VideoCall = dynamic(() => import("@/components/live/VideoCall"), { ssr: false });

interface ConsultJoinProps {
  room: string;
  customerName: string;
  topic: string;
  status: string;
  scheduledAt: string | null;
}

export default function ConsultJoin({ room, customerName, topic, status, scheduledAt }: ConsultJoinProps) {
  const [choices, setChoices] = useState<LocalUserChoices | null>(null);
  const [session, setSession] = useState<{ url: string; token: string } | null>(null);
  const [error, setError] = useState("");
  const [left, setLeft] = useState(false);

  const closed = status === "ENDED" || status === "CANCELLED";

  const join = async (values: LocalUserChoices) => {
    setError("");
    const res = await fetch(`/api/consult/${room}`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: values.username || customerName }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      setError(data.error || "We couldn't connect you. Please try again.");
      return;
    }
    setChoices(values);
    setSession({ url: data.url, token: data.token });
  };

  return (
    <section style={{ background: "#F6F2EA", minHeight: "70vh", padding: "40px 16px 64px" }}>
      <div style={{ maxWidth: session ? "1200px" : "720px", margin: "0 auto" }}>
        <div style={{ textAlign: "center", marginBottom: "26px" }}>
          <div style={{ fontSize: "11px", letterSpacing: "0.18em", textTransform: "uppercase", color: "var(--color-emerald)", fontWeight: 600 }}>
            Veena Atelier · Private consultation
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 4vw, 36px)", fontWeight: 500, margin: "10px 0 6px" }}>{topic}</h1>
          {scheduledAt && !session && (
            <div style={{ fontSize: "14px", color: "rgba(21,19,15,0.6)" }}>
              {new Date(scheduledAt).toLocaleString(undefined, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })}
            </div>
          )}
        </div>

        {closed ? (
          <Notice title="This consultation has finished" body="Thank you for meeting with the atelier. If you need another session, reply to your stylist and they'll send a new link." />
        ) : left ? (
          <Notice
            title="You've left the call"
            body="You can rejoin at any time while the consultation is open."
            action={
              <button onClick={() => setLeft(false)} style={primaryBtn}>
                Rejoin
              </button>
            }
          />
        ) : session && choices ? (
          <VideoCall
            url={session.url}
            token={session.token}
            videoEnabled={choices.videoEnabled}
            audioEnabled={choices.audioEnabled}
            videoDeviceId={choices.videoDeviceId}
            audioDeviceId={choices.audioDeviceId}
            onLeave={() => {
              setSession(null);
              setLeft(true);
            }}
          />
        ) : (
          <>
            <p style={{ textAlign: "center", fontSize: "14px", color: "rgba(21,19,15,0.65)", margin: "0 auto 20px", maxWidth: "520px", lineHeight: 1.6 }}>
              Check your camera and microphone, then join. Your stylist will be with you shortly. If they're not there yet, stay on the call and they'll join you.
            </p>
            <div data-lk-theme="default" style={{ background: "#15130F", borderRadius: "8px", padding: "20px", display: "flex", justifyContent: "center" }}>
              <PreJoin
                defaults={{ username: customerName, videoEnabled: true, audioEnabled: true }}
                joinLabel="Join consultation"
                userLabel="Your name"
                persistUserChoices={false}
                onSubmit={join}
                onError={(e) => setError(e.message.includes("Permission") ? "Please allow camera and microphone access in your browser." : e.message)}
              />
            </div>
            {error && <div style={{ textAlign: "center", color: "#B42318", fontSize: "13px", marginTop: "12px" }}>{error}</div>}
          </>
        )}
      </div>
    </section>
  );
}

function Notice({ title, body, action }: { title: string; body: string; action?: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid rgba(21,19,15,0.08)", borderRadius: "6px", padding: "36px 24px", textAlign: "center" }}>
      <h2 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: "22px", margin: "0 0 8px" }}>{title}</h2>
      <p style={{ fontSize: "14px", color: "rgba(21,19,15,0.65)", margin: 0, lineHeight: 1.6 }}>{body}</p>
      {action && <div style={{ marginTop: "18px" }}>{action}</div>}
    </div>
  );
}

const primaryBtn: React.CSSProperties = {
  background: "#15130F",
  color: "#F6F2EA",
  border: "none",
  padding: "11px 26px",
  fontSize: "12px",
  letterSpacing: "0.12em",
  textTransform: "uppercase",
  cursor: "pointer",
};
