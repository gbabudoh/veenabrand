"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Button, PageHeader, StatusPill, copyText, formatWhen, localInputToIso, ui } from "@/components/admin/ui";

interface Consultation {
  id: string;
  room: string;
  customerName: string;
  customerEmail: string | null;
  customerPhone: string | null;
  topic: string;
  notes: string | null;
  bespokeRequestId: string | null;
  status: string;
  scheduledAt: string | null;
  startedAt: string | null;
  endedAt: string | null;
  createdAt: string;
}

interface BespokeOption {
  id: string;
  fabricPreference: string;
  timeline: string;
  status: string;
  createdAt: string;
}

type Tab = "upcoming" | "past";

const EMPTY_FORM = {
  customerName: "",
  customerEmail: "",
  customerPhone: "",
  topic: "Bespoke consultation",
  scheduledAt: "",
  bespokeRequestId: "",
  notes: "",
};

export default function AdminConsultationsPage() {
  const [items, setItems] = useState<Consultation[]>([]);
  const [bespoke, setBespoke] = useState<BespokeOption[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<Tab>("upcoming");
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const load = async () => {
    try {
      const res = await fetch("/api/admin/consultations", { cache: "no-store" });
      if (res.ok) {
        const data = await res.json();
        setItems(data.consultations || []);
        setBespoke(data.bespokeRequests || []);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
    // Keep "Live" status fresh while the page is open.
    const t = setInterval(load, 20000);
    return () => clearInterval(t);
  }, []);

  const visible = useMemo(() => {
    const upcoming = items.filter((c) => c.status === "SCHEDULED" || c.status === "LIVE");
    const past = items.filter((c) => c.status === "ENDED" || c.status === "CANCELLED");
    if (tab === "past") return past;
    // Live first, then soonest scheduled, unscheduled last.
    return upcoming.sort((a, b) => {
      if (a.status !== b.status) return a.status === "LIVE" ? -1 : 1;
      const ta = a.scheduledAt ? new Date(a.scheduledAt).getTime() : Infinity;
      const tb = b.scheduledAt ? new Date(b.scheduledAt).getTime() : Infinity;
      return ta - tb;
    });
  }, [items, tab]);

  const counts = useMemo(
    () => ({
      live: items.filter((c) => c.status === "LIVE").length,
      upcoming: items.filter((c) => c.status === "SCHEDULED" || c.status === "LIVE").length,
      past: items.filter((c) => c.status === "ENDED" || c.status === "CANCELLED").length,
    }),
    [items]
  );

  const customerLink = (c: Consultation) => `${window.location.origin}/consult/${c.room}`;

  const handleCreate = async () => {
    if (!form.customerName.trim()) {
      alert("Customer name is required");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/admin/consultations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, scheduledAt: localInputToIso(form.scheduledAt) }),
      });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not create consultation");
        return;
      }
      setForm(EMPTY_FORM);
      setShowForm(false);
      setTab("upcoming");
      await load();
    } finally {
      setSaving(false);
    }
  };

  const act = async (c: Consultation, action: "end" | "cancel" | "reopen") => {
    const msg = {
      end: `End the call with ${c.customerName}? Everyone in the room will be disconnected.`,
      cancel: `Cancel the consultation with ${c.customerName}? Their link will stop working.`,
      reopen: `Reopen the consultation with ${c.customerName}? Their link will work again.`,
    }[action];
    if (!confirm(msg)) return;
    await fetch(`/api/admin/consultations/${c.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action }),
    });
    load();
  };

  const remove = async (c: Consultation) => {
    if (!confirm(`Delete the consultation record for ${c.customerName}? This cannot be undone.`)) return;
    await fetch(`/api/admin/consultations/${c.id}`, { method: "DELETE" });
    load();
  };

  const copy = async (c: Consultation) => {
    await copyText(customerLink(c));
    setCopiedId(c.id);
    setTimeout(() => setCopiedId((v) => (v === c.id ? null : v)), 2000);
  };

  return (
    <div style={{ maxWidth: "1180px" }}>
      <PageHeader
        title="Video Consultations"
        subtitle="Private one-to-one video calls with customers for fittings, measurements and bespoke styling."
        action={
          <Button variant="primary" onClick={() => setShowForm((v) => !v)}>
            {showForm ? "Close" : "+ New Consultation"}
          </Button>
        }
      />

      {/* Summary */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px", marginBottom: "20px" }}>
        <Stat label="Live now" value={counts.live} accent={counts.live > 0 ? "#DC2626" : undefined} />
        <Stat label="Upcoming" value={counts.upcoming} />
        <Stat label="Completed / cancelled" value={counts.past} />
      </div>

      {/* Create form */}
      {showForm && (
        <div style={{ ...ui.card, marginBottom: "20px" }}>
          <h2 style={{ fontSize: "15px", margin: "0 0 16px", fontWeight: 700 }}>Book a consultation</h2>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "14px" }}>
            <Field label="Customer name *">
              <input style={ui.input} value={form.customerName} onChange={(e) => setForm({ ...form, customerName: e.target.value })} placeholder="Adaeze Okafor" />
            </Field>
            <Field label="Email">
              <input style={ui.input} type="email" value={form.customerEmail} onChange={(e) => setForm({ ...form, customerEmail: e.target.value })} placeholder="customer@email.com" />
            </Field>
            <Field label="Phone / WhatsApp">
              <input style={ui.input} value={form.customerPhone} onChange={(e) => setForm({ ...form, customerPhone: e.target.value })} placeholder="+234 …" />
            </Field>
            <Field label="Topic">
              <input style={ui.input} value={form.topic} onChange={(e) => setForm({ ...form, topic: e.target.value })} />
            </Field>
            <Field label="Date & time">
              <input style={ui.input} type="datetime-local" value={form.scheduledAt} onChange={(e) => setForm({ ...form, scheduledAt: e.target.value })} />
            </Field>
            <Field label="Linked bespoke request">
              <select style={ui.input} value={form.bespokeRequestId} onChange={(e) => setForm({ ...form, bespokeRequestId: e.target.value })}>
                <option value="">None</option>
                {bespoke.map((b) => (
                  <option key={b.id} value={b.id}>
                    #{b.id.slice(-6)} · {b.fabricPreference} · {b.timeline} ({new Date(b.createdAt).toLocaleDateString()})
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div style={{ marginTop: "14px" }}>
            <Field label="Internal notes (staff only)">
              <textarea style={{ ...ui.input, resize: "vertical" }} rows={2} value={form.notes} onChange={(e) => setForm({ ...form, notes: e.target.value })} placeholder="Measurements to confirm, fabrics to show…" />
            </Field>
          </div>
          <div style={{ display: "flex", gap: "10px", marginTop: "16px" }}>
            <Button variant="primary" onClick={handleCreate} disabled={saving}>
              {saving ? "Creating…" : "Create & get link"}
            </Button>
            <Button variant="ghost" onClick={() => setShowForm(false)}>
              Cancel
            </Button>
          </div>
        </div>
      )}

      {/* List */}
      <div style={{ ...ui.card, padding: 0 }}>
        <div style={{ display: "flex", gap: "4px", padding: "12px 14px", borderBottom: "1px solid #E2E8F0" }}>
          {(["upcoming", "past"] as Tab[]).map((t) => (
            <button
              key={t}
              onClick={() => setTab(t)}
              style={{
                background: tab === t ? "#F1F5F9" : "transparent",
                border: "none",
                padding: "6px 12px",
                borderRadius: "6px",
                fontSize: "12.5px",
                fontWeight: 600,
                color: tab === t ? "#0F172A" : "#64748B",
                cursor: "pointer",
              }}
            >
              {t === "upcoming" ? `Upcoming (${counts.upcoming})` : `Past (${counts.past})`}
            </button>
          ))}
        </div>

        {loading ? (
          <div style={{ padding: "28px", ...ui.muted }}>Loading consultations…</div>
        ) : visible.length === 0 ? (
          <div style={{ padding: "36px", textAlign: "center", ...ui.muted }}>
            {tab === "upcoming" ? "No upcoming consultations. Book one to generate a private video link." : "No past consultations yet."}
          </div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px" }}>
            <thead>
              <tr style={{ textAlign: "left", color: "#64748B", fontSize: "11.5px" }}>
                <th style={th}>Customer</th>
                <th style={th}>Topic</th>
                <th style={th}>When</th>
                <th style={th}>Status</th>
                <th style={{ ...th, textAlign: "right" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {visible.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid #F1F5F9" }}>
                  <td style={td}>
                    <div style={{ fontWeight: 600, color: "#0F172A" }}>{c.customerName}</div>
                    <div style={{ fontSize: "11.5px", color: "#64748B" }}>
                      {[c.customerEmail, c.customerPhone].filter(Boolean).join(" · ") || "No contact details"}
                    </div>
                  </td>
                  <td style={td}>
                    {c.topic}
                    {c.bespokeRequestId && (
                      <div style={{ fontSize: "11.5px", color: "#64748B" }}>Bespoke #{c.bespokeRequestId.slice(-6)}</div>
                    )}
                  </td>
                  <td style={td}>
                    {c.status === "ENDED" ? (
                      <span>Ended {formatWhen(c.endedAt)}</span>
                    ) : (
                      formatWhen(c.scheduledAt)
                    )}
                  </td>
                  <td style={td}>
                    <StatusPill status={c.status} />
                  </td>
                  <td style={{ ...td, textAlign: "right" }}>
                    <div style={{ display: "inline-flex", gap: "6px", flexWrap: "wrap", justifyContent: "flex-end" }}>
                      {(c.status === "SCHEDULED" || c.status === "LIVE") && (
                        <>
                          <Button size="sm" onClick={() => copy(c)}>
                            {copiedId === c.id ? "Copied ✓" : "Copy customer link"}
                          </Button>
                          <Link href={`/admin/consultations/${c.id}`} style={{ textDecoration: "none" }}>
                            <Button size="sm" variant={c.status === "LIVE" ? "live" : "primary"}>
                              {c.status === "LIVE" ? "Rejoin call" : "Start call"}
                            </Button>
                          </Link>
                          {c.status === "LIVE" ? (
                            <Button size="sm" variant="danger" onClick={() => act(c, "end")}>
                              End
                            </Button>
                          ) : (
                            <Button size="sm" variant="danger" onClick={() => act(c, "cancel")}>
                              Cancel
                            </Button>
                          )}
                        </>
                      )}
                      {(c.status === "ENDED" || c.status === "CANCELLED") && (
                        <>
                          <Button size="sm" onClick={() => act(c, "reopen")}>
                            Reopen
                          </Button>
                          <Button size="sm" variant="danger" onClick={() => remove(c)}>
                            Delete
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label style={ui.label}>{label}</label>
      {children}
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: string }) {
  return (
    <div style={{ ...ui.card, padding: "16px 18px" }}>
      <div style={{ fontSize: "11.5px", color: "#64748B", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: "24px", fontWeight: 700, color: accent || "#0F172A", marginTop: "4px" }}>{value}</div>
    </div>
  );
}

const th: React.CSSProperties = { padding: "10px 16px", fontWeight: 600 };
const td: React.CSSProperties = { padding: "12px 16px", verticalAlign: "middle", color: "#334155" };
