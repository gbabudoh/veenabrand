"use client";

import React, { useCallback, useEffect, useState } from "react";
import dynamic from "next/dynamic";
import Link from "next/link";

const LivePlayer = dynamic(() => import("@/components/live/LivePlayer"), { ssr: false });

interface PublicShow {
  slug: string;
  title: string;
  description: string | null;
  posterImage: string | null;
  status: string;
  scheduledAt: string | null;
}

export default function LiveWatch({ initial }: { initial: PublicShow }) {
  const [show, setShow] = useState(initial);
  const [session, setSession] = useState<{ url: string; token: string } | null>(null);
  const [error, setError] = useState("");

  const refresh = useCallback(async () => {
    try {
      const res = await fetch(`/api/live/${initial.slug}`, { cache: "no-store" });
      if (res.ok) setShow((await res.json()).show);
    } catch {
      // Keep the current state; the next poll will retry.
    }
  }, [initial.slug]);

  // Poll so a waiting viewer is connected the moment the show goes live.
  useEffect(() => {
    if (session) return;
    const t = setInterval(refresh, show.status === "SCHEDULED" ? 10000 : 30000);
    return () => clearInterval(t);
  }, [refresh, session, show.status]);

  // Auto-connect when live. Video plays muted until the viewer taps for sound.
  useEffect(() => {
    if (show.status !== "LIVE" || session) return;
    let cancelled = false;
    (async () => {
      const res = await fetch(`/api/live/${initial.slug}`, { method: "POST" });
      const data = await res.json().catch(() => ({}));
      if (cancelled) return;
      if (res.ok) {
        setSession({ url: data.url, token: data.token });
        setError("");
      } else if (res.status === 409) {
        refresh();
      } else {
        setError(data.error || "We couldn't load the stream.");
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [show.status, session, initial.slug, refresh]);

  return (
    <section style={{ background: "#0F0E0B", color: "#F6F2EA", padding: "32px 16px 64px", minHeight: "70vh" }}>
      <div style={{ maxWidth: "1100px", margin: "0 auto" }}>
        {session ? (
          <LivePlayer
            url={session.url}
            token={session.token}
            onLeave={() => {
              // Room closed (show ended) or connection dropped — re-check status.
              setSession(null);
              refresh();
            }}
          />
        ) : (
          <div
            style={{
              position: "relative",
              aspectRatio: "16/9",
              borderRadius: "6px",
              overflow: "hidden",
              background: show.posterImage ? `url(${show.posterImage}) center/cover` : "linear-gradient(135deg,#2A2620,#0F0E0B)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,0.55)" }} />
            <div style={{ position: "relative", textAlign: "center", padding: "20px" }}>
              {show.status === "SCHEDULED" && (
                <>
                  <div style={eyebrow}>Starting soon</div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(20px, 3vw, 30px)", margin: "10px 0" }}>
                    {show.scheduledAt
                      ? new Date(show.scheduledAt).toLocaleString(undefined, { weekday: "long", day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" })
                      : "We'll be live shortly"}
                  </div>
                  <div style={{ fontSize: "13px", opacity: 0.75 }}>Keep this page open. The show starts here automatically.</div>
                </>
              )}
              {show.status === "LIVE" && <div style={eyebrow}>{error || "Connecting to the show…"}</div>}
              {show.status === "ENDED" && (
                <>
                  <div style={eyebrow}>This show has ended</div>
                  <div style={{ fontSize: "14px", opacity: 0.8, marginTop: "10px" }}>Thank you for watching.</div>
                  <Link href="/products" style={{ display: "inline-block", marginTop: "16px", color: "#F6F2EA", fontSize: "12px", letterSpacing: "0.12em", textTransform: "uppercase", borderBottom: "1px solid currentColor", textDecoration: "none" }}>
                    Shop the collection
                  </Link>
                </>
              )}
            </div>
          </div>
        )}

        <div style={{ marginTop: "22px" }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontWeight: 500, fontSize: "clamp(24px, 3.4vw, 34px)", margin: 0 }}>{show.title}</h1>
          {show.description && <p style={{ fontSize: "15px", lineHeight: 1.7, opacity: 0.75, maxWidth: "720px", marginTop: "10px" }}>{show.description}</p>}
        </div>
      </div>
    </section>
  );
}

const eyebrow: React.CSSProperties = {
  fontSize: "12px",
  letterSpacing: "0.18em",
  textTransform: "uppercase",
  fontWeight: 600,
};
