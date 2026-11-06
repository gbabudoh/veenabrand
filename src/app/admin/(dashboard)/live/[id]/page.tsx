"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button, StatusPill, copyText, formatWhen, ui } from "@/components/admin/ui";

const BroadcastStudio = dynamic(() => import("@/components/live/BroadcastStudio"), { ssr: false });

interface LiveShow {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  posterImage: string | null;
  featured: boolean;
  status: string;
  scheduledAt: string | null;
  startedAt: string | null;
  peakViewers: number;
}

export default function AdminLiveStudioPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [show, setShow] = useState<LiveShow | null>(null);
  const [notFound, setNotFound] = useState(false);
  const [session, setSession] = useState<{ url: string; token: string } | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [viewers, setViewers] = useState(0);
  const [busy, setBusy] = useState(false);
  const [copied, setCopied] = useState(false);
  const [elapsed, setElapsed] = useState("");

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/live-shows/${params.id}`, { cache: "no-store" });
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    if (res.ok) setShow((await res.json()).show);
  }, [params.id]);

  // Polling also records the peak audience server-side while live.
  useEffect(() => {
    load();
    const t = setInterval(load, 15000);
    return () => clearInterval(t);
  }, [load]);

  // On-air clock.
  useEffect(() => {
    if (show?.status !== "LIVE" || !show.startedAt) {
      setElapsed("");
      return;
    }
    const start = new Date(show.startedAt).getTime();
    const tick = () => {
      const s = Math.max(0, Math.floor((Date.now() - start) / 1000));
      const h = Math.floor(s / 3600);
      const m = Math.floor((s % 3600) / 60);
      const sec = s % 60;
      setElapsed(`${h ? `${h}:` : ""}${String(m).padStart(h ? 2 : 1, "0")}:${String(sec).padStart(2, "0")}`);
    };
    tick();
    const t = setInterval(tick, 1000);
    return () => clearInterval(t);
  }, [show?.status, show?.startedAt]);

  const connect = async () => {
    setConnecting(true);
    try {
      const res = await fetch(`/api/admin/live-shows/${params.id}/token`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not open the studio");
        return;
      }
      setSession({ url: data.url, token: data.token });
    } finally {
      setConnecting(false);
    }
  };

  const action = async (a: "start" | "end") => {
    if (a === "start" && !confirm("Go live now? Viewers will be able to watch immediately.")) return;
    if (a === "end" && !confirm("End the show? All viewers will be disconnected.")) return;
    setBusy(true);
    try {
      await fetch(`/api/admin/live-shows/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: a }),
      });
      if (a === "end") {
        setSession(null);
        router.push("/admin/live");
        return;
      }
      load();
    } finally {
      setBusy(false);
    }
  };

  const onAudienceChange = useCallback((n: number) => setViewers(n), []);

  if (notFound) {
    return (
      <div style={ui.card}>
        Show not found. <Link href="/admin/live">Back to live shows</Link>
      </div>
    );
  }
  if (!show) return <div style={ui.muted}>Loading…</div>;

  const isLive = show.status === "LIVE";
  const watchUrl = typeof window !== "undefined" ? `${window.location.origin}/live/${show.slug}` : "";

  return (
    <div style={{ maxWidth: "1400px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <Link href="/admin/live" style={{ fontSize: "12.5px", color: "#64748B", textDecoration: "none" }}>
            ← All live shows
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>{show.title}</h1>
            <StatusPill status={show.status} />
            {elapsed && <span style={{ fontSize: "13px", fontWeight: 700, color: "#DC2626", fontVariantNumeric: "tabular-nums" }}>{elapsed}</span>}
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px" }}>
          {show.status === "SCHEDULED" && (
            <Button variant="live" onClick={() => action("start")} disabled={busy || !session} title={!session ? "Open the studio and turn on your camera first" : undefined}>
              ● Go live
            </Button>
          )}
          {isLive && (
            <Button variant="danger" onClick={() => action("end")} disabled={busy}>
              End show
            </Button>
          )}
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: "20px", alignItems: "start" }}>
        <div>
          {session ? (
            <BroadcastStudio url={session.url} token={session.token} onLeave={() => setSession(null)} onAudienceChange={onAudienceChange} />
          ) : (
            <div
              style={{
                ...ui.card,
                height: "56vh",
                minHeight: "360px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                gap: "14px",
                textAlign: "center",
                background: "#0F172A",
                color: "#F8FAFC",
                border: "none",
              }}
            >
              <div style={{ fontSize: "17px", fontWeight: 600 }}>{isLive ? "You're live, but not in the studio" : "Set up before you go live"}</div>
              <div style={{ fontSize: "13px", color: "#94A3B8", maxWidth: "440px" }}>
                {isLive
                  ? "Viewers are waiting. Rejoin to keep broadcasting."
                  : "Open the studio to check your camera, microphone and screen share. Viewers can't see anything until you press Go live."}
              </div>
              <Button variant="live" onClick={connect} disabled={connecting} style={{ padding: "11px 26px", fontSize: "14px" }}>
                {connecting ? "Opening…" : isLive ? "Rejoin studio" : "Open studio"}
              </Button>
            </div>
          )}
          {session && show.status === "SCHEDULED" && (
            <div style={{ marginTop: "12px", fontSize: "12.5px", color: "#475569", background: "#EFF6FF", border: "1px solid #BFDBFE", borderRadius: "6px", padding: "10px 12px" }}>
              Preview only: viewers can't see this yet. Press <b>Go live</b> when you're ready.
            </div>
          )}
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={ui.card}>
            <div style={{ fontSize: "11.5px", color: "#64748B", fontWeight: 600 }}>Watching now</div>
            <div style={{ fontSize: "30px", fontWeight: 700, color: isLive ? "#DC2626" : "#0F172A" }}>{isLive ? viewers : "—"}</div>
            <div style={{ fontSize: "12px", color: "#64748B" }}>Peak: {show.peakViewers}</div>
          </div>

          <div style={ui.card}>
            <div style={{ ...ui.label, marginBottom: "8px" }}>Public watch page</div>
            <div style={{ fontSize: "11.5px", color: "#334155", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "6px", padding: "8px", wordBreak: "break-all" }}>
              {watchUrl}
            </div>
            <div style={{ display: "flex", gap: "6px", marginTop: "10px" }}>
              <Button
                size="sm"
                onClick={async () => {
                  await copyText(watchUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
              >
                {copied ? "Copied ✓" : "Copy link"}
              </Button>
              <a href={watchUrl} target="_blank" rel="noreferrer" style={{ textDecoration: "none" }}>
                <Button size="sm" variant="ghost">
                  Open ↗
                </Button>
              </a>
            </div>
            <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "8px" }}>
              {show.featured ? "A “Live now” bar will appear across the storefront while you're live." : "The storefront “Live now” bar is off for this show."}
            </div>
          </div>

          <div style={ui.card}>
            <div style={{ ...ui.label, marginBottom: "8px" }}>Broadcast tips</div>
            <ul style={{ margin: 0, paddingLeft: "18px", fontSize: "12.5px", color: "#475569", lineHeight: 1.6 }}>
              <li>Share your screen or a capture window to stream the runway feed; your camera becomes picture-in-picture.</li>
              <li>Use a wired connection for best quality.</li>
              <li>Scheduled: {formatWhen(show.scheduledAt)}</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
