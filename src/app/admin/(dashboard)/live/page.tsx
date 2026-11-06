"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import MediaUploadButton from "@/components/admin/MediaUploadButton";
import { Button, PageHeader, StatusPill, copyText, formatWhen, localInputToIso, ui } from "@/components/admin/ui";

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
  endedAt: string | null;
  peakViewers: number;
}

const EMPTY_FORM = { title: "", description: "", posterImage: "", scheduledAt: "", featured: true };

export default function AdminLiveShowsPage() {
  const [shows, setShows] = useState<LiveShow[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/live-shows", { cache: "no-store" });
      if (res.ok) setShows((await res.json()).shows || []);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  const handleCreate = async () => {
    if (!form.title.trim()) {
      alert("Give the show a title");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/live-shows", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, scheduledAt: localInputToIso(form.scheduledAt) }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not create the show");
        return;
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      load();
    } finally {
      setSaving(false);
    }
  };

  const patch = async (s: LiveShow, body: Record<string, unknown>) => {
    await fetch(`/api/admin/live-shows/${s.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
    });
    load();
  };

  const remove = async (s: LiveShow) => {
    if (!confirm(`Delete "${s.title}"? Its watch page will stop working.`)) return;
    await fetch(`/api/admin/live-shows/${s.id}`, { method: "DELETE" });
    load();
  };

  const watchLink = (s: LiveShow) => `${window.location.origin}/live/${s.slug}`;

  const live = shows.filter((s) => s.status === "LIVE");
  const scheduled = shows.filter((s) => s.status === "SCHEDULED");
  const ended = shows.filter((s) => s.status === "ENDED");

  return (
    <div style={{ maxWidth: "1180px" }}>
      <PageHeader
        title="Live Shows"
        subtitle="Broadcast runway debuts and live shopping events to everyone on the storefront."
        action={
          <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Close" : "+ Schedule a Show"}
          </Button>
        }
      />

      {showForm && (
        <div style={{ ...ui.card, marginBottom: "20px" }}>
          <h2 style={{ fontSize: "15px", margin: "0 0 16px", fontWeight: 700 }}>New live show</h2>
          <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: "14px" }}>
            <div>
              <label style={ui.label}>Title *</label>
              <input style={ui.input} value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} placeholder="Atelier SS27 Runway Debut" />
            </div>
            <div>
              <label style={ui.label}>Date & time</label>
              <input style={ui.input} type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
            </div>
          </div>
          <div style={{ marginTop: "14px" }}>
            <label style={ui.label}>Description</label>
            <textarea style={{ ...ui.input, resize: "vertical" }} rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="What viewers will see…" />
          </div>
          <div style={{ marginTop: "14px" }}>
            <label style={ui.label}>Poster image (shown before the show starts)</label>
            <div style={{ display: "flex", gap: "8px" }}>
              <input style={ui.input} value={form.posterImage} onChange={(e) => setForm({ ...form, posterImage: e.target.value })} placeholder="/images/hero_runway.png" />
              <MediaUploadButton variant="light" folder="live-shows" onUploaded={(url) => setForm((f) => ({ ...f, posterImage: url }))} />
            </div>
          </div>
          <label style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px", fontSize: "13px", color: "#334155" }}>
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            Show a “Live now” bar across the storefront while this show is live
          </label>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <Button variant="primary" onClick={handleCreate} disabled={saving}>
              {saving ? "Creating…" : "Create show"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {loading ? (
        <div style={ui.muted}>Loading shows…</div>
      ) : shows.length === 0 ? (
        <div style={{ ...ui.card, textAlign: "center", padding: "40px", ...ui.muted }}>
          No shows yet. Schedule one, then open its studio to go live.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: "26px" }}>
          {[
            { title: "Live now", list: live },
            { title: "Scheduled", list: scheduled },
            { title: "Past shows", list: ended },
          ]
            .filter((g) => g.list.length)
            .map((g) => (
              <div key={g.title}>
                <div style={{ fontSize: "12px", fontWeight: 700, color: "#64748B", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: "10px" }}>
                  {g.title}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(340px, 1fr))", gap: "16px" }}>
                  {g.list.map((s) => (
                    <div key={s.id} style={{ ...ui.card, padding: 0, overflow: "hidden" }}>
                      <div
                        style={{
                          aspectRatio: "16/7",
                          background: s.posterImage ? `url(${s.posterImage}) center/cover` : "linear-gradient(135deg,#1E293B,#0F172A)",
                          position: "relative",
                        }}
                      >
                        <div style={{ position: "absolute", top: "10px", left: "10px" }}>
                          <StatusPill status={s.status} />
                        </div>
                      </div>
                      <div style={{ padding: "16px" }}>
                        <div style={{ fontWeight: 700, fontSize: "15px", color: "#0F172A" }}>{s.title}</div>
                        <div style={{ fontSize: "12px", color: "#64748B", marginTop: "3px" }}>
                          {s.status === "ENDED"
                            ? `Ended ${formatWhen(s.endedAt)} · peak ${s.peakViewers} viewer${s.peakViewers === 1 ? "" : "s"}`
                            : s.status === "LIVE"
                            ? `Live since ${formatWhen(s.startedAt)}`
                            : `Scheduled ${formatWhen(s.scheduledAt)}`}
                          {s.featured && s.status !== "ENDED" ? " · storefront bar on" : ""}
                        </div>
                        <div style={{ display: "flex", gap: "6px", marginTop: "14px", flexWrap: "wrap" }}>
                          {s.status !== "ENDED" && (
                            <Link href={`/admin/live/${s.id}`} style={{ textDecoration: "none" }}>
                              <Button size="sm" variant={s.status === "LIVE" ? "live" : "primary"}>
                                Open studio
                              </Button>
                            </Link>
                          )}
                          <Button
                            size="sm"
                            onClick={async () => {
                              await copyText(watchLink(s));
                              setCopiedId(s.id);
                              setTimeout(() => setCopiedId((v) => (v === s.id ? null : v)), 2000);
                            }}
                          >
                            {copiedId === s.id ? "Copied ✓" : "Copy watch link"}
                          </Button>
                          {s.status !== "ENDED" && (
                            <Button size="sm" variant="ghost" onClick={() => patch(s, { featured: !s.featured })}>
                              {s.featured ? "Hide bar" : "Show bar"}
                            </Button>
                          )}
                          {s.status === "ENDED" && (
                            <Button size="sm" onClick={() => confirm(`Reopen "${s.title}" to broadcast again?`) && patch(s, { action: "reopen" })}>
                              Reopen
                            </Button>
                          )}
                          {s.status !== "LIVE" && (
                            <Button size="sm" variant="danger" onClick={() => remove(s)}>
                              Delete
                            </Button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}
        </div>
      )}
    </div>
  );
}
