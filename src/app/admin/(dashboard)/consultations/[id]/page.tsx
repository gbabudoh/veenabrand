"use client";

import React, { useCallback, useEffect, useState } from "react";
import Link from "next/link";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { Button, StatusPill, copyText, formatWhen, ui } from "@/components/admin/ui";

// LiveKit touches browser media APIs, so it is loaded client-side only.
const VideoCall = dynamic(() => import("@/components/live/VideoCall"), { ssr: false });

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
}

interface Participant {
  identity: string;
  name: string;
}

export default function AdminConsultationCallPage({ params }: { params: { id: string } }) {
  const router = useRouter();
  const [consultation, setConsultation] = useState<Consultation | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [notFound, setNotFound] = useState(false);
  const [session, setSession] = useState<{ url: string; token: string } | null>(null);
  const [joining, setJoining] = useState(false);
  const [notes, setNotes] = useState("");
  const [notesSaved, setNotesSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  const load = useCallback(async () => {
    const res = await fetch(`/api/admin/consultations/${params.id}`, { cache: "no-store" });
    if (res.status === 404) {
      setNotFound(true);
      return;
    }
    if (!res.ok) return;
    const data = await res.json();
    setConsultation((prev) => {
      if (!prev) setNotes(data.consultation.notes || "");
      return data.consultation;
    });
    setParticipants(data.participants || []);
  }, [params.id]);

  useEffect(() => {
    load();
    const t = setInterval(load, 8000);
    return () => clearInterval(t);
  }, [load]);

  const join = async () => {
    setJoining(true);
    try {
      const res = await fetch(`/api/admin/consultations/${params.id}/token`, { method: "POST" });
      const data = await res.json();
      if (!res.ok) {
        alert(data.error || "Could not join the call");
        return;
      }
      setSession({ url: data.url, token: data.token });
      load();
    } finally {
      setJoining(false);
    }
  };

  const endForEveryone = async () => {
    if (!confirm("End this consultation for everyone? The customer's link will stop working.")) return;
    await fetch(`/api/admin/consultations/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "end" }),
    });
    setSession(null);
    router.push("/admin/consultations");
  };

  const saveNotes = async () => {
    await fetch(`/api/admin/consultations/${params.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ notes }),
    });
    setNotesSaved(true);
    setTimeout(() => setNotesSaved(false), 2000);
  };

  if (notFound) {
    return (
      <div style={ui.card}>
        Consultation not found. <Link href="/admin/consultations">Back to consultations</Link>
      </div>
    );
  }
  if (!consultation) return <div style={ui.muted}>Loading…</div>;

  const link = typeof window !== "undefined" ? `${window.location.origin}/consult/${consultation.room}` : "";
  const customersInRoom = participants.filter((p) => !p.identity.startsWith("staff-"));
  const closed = consultation.status === "ENDED" || consultation.status === "CANCELLED";

  return (
    <div style={{ maxWidth: "1400px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", gap: "12px", flexWrap: "wrap" }}>
        <div>
          <Link href="/admin/consultations" style={{ fontSize: "12.5px", color: "#64748B", textDecoration: "none" }}>
            ← All consultations
          </Link>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "6px" }}>
            <h1 style={{ fontSize: "22px", fontWeight: 700, margin: 0 }}>{consultation.customerName}</h1>
            <StatusPill status={consultation.status} />
          </div>
        </div>
        {!closed && (
          <Button variant="danger" onClick={endForEveryone}>
            End consultation
          </Button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: "20px", alignItems: "start" }}>
        {/* Call area */}
        <div>
          {session ? (
            <VideoCall url={session.url} token={session.token} onLeave={() => setSession(null)} />
          ) : (
            <div
              style={{
                ...ui.card,
                height: "60vh",
                minHeight: "380px",
                display: "flex",
                flexDirection: "column",
                alignItems: "center",
                justifyContent: "center",
                textAlign: "center",
                gap: "14px",
                background: "#0F172A",
                color: "#F8FAFC",
                border: "none",
              }}
            >
              {closed ? (
                <>
                  <div style={{ fontSize: "16px", fontWeight: 600 }}>This consultation is {consultation.status.toLowerCase()}.</div>
                  <div style={{ fontSize: "13px", color: "#94A3B8" }}>Reopen it from the list to call again.</div>
                </>
              ) : (
                <>
                  <div style={{ fontSize: "17px", fontWeight: 600 }}>
                    {customersInRoom.length > 0
                      ? `${customersInRoom.map((p) => p.name || "Customer").join(", ")} is waiting in the room`
                      : "Ready when you are"}
                  </div>
                  <div style={{ fontSize: "13px", color: "#94A3B8", maxWidth: "420px" }}>
                    Your browser will ask for camera and microphone access. Send the customer their link if you haven't already.
                  </div>
                  <Button variant="live" onClick={join} disabled={joining} style={{ padding: "11px 26px", fontSize: "14px" }}>
                    {joining ? "Connecting…" : consultation.status === "LIVE" ? "Rejoin call" : "Start call"}
                  </Button>
                </>
              )}
            </div>
          )}
        </div>

        {/* Side panel */}
        <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
          <div style={ui.card}>
            <div style={{ ...ui.label, marginBottom: "10px" }}>Customer link</div>
            <div style={{ fontSize: "11.5px", color: "#334155", background: "#F8FAFC", border: "1px solid #E2E8F0", borderRadius: "6px", padding: "8px", wordBreak: "break-all" }}>
              {link}
            </div>
            <Button
              size="sm"
              style={{ marginTop: "10px", width: "100%" }}
              disabled={closed}
              onClick={async () => {
                await copyText(link);
                setCopied(true);
                setTimeout(() => setCopied(false), 2000);
              }}
            >
              {copied ? "Copied ✓" : "Copy link"}
            </Button>
            <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "8px" }}>
              Send this by email or WhatsApp. No account needed, it works on phone or laptop.
            </div>
          </div>

          <div style={ui.card}>
            <div style={{ ...ui.label, marginBottom: "10px" }}>Details</div>
            <Detail k="Topic" v={consultation.topic} />
            <Detail k="Scheduled" v={formatWhen(consultation.scheduledAt)} />
            <Detail k="Email" v={consultation.customerEmail || "—"} />
            <Detail k="Phone" v={consultation.customerPhone || "—"} />
            {consultation.bespokeRequestId && <Detail k="Bespoke request" v={`#${consultation.bespokeRequestId.slice(-6)}`} />}
            <Detail k="In the room" v={participants.length ? participants.map((p) => p.name || p.identity).join(", ") : "Nobody yet"} />
          </div>

          <div style={ui.card}>
            <div style={{ ...ui.label, marginBottom: "8px" }}>Staff notes</div>
            <textarea
              style={{ ...ui.input, resize: "vertical" }}
              rows={6}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Measurements, fabric choices, follow-ups…"
            />
            <Button size="sm" style={{ marginTop: "8px" }} onClick={saveNotes}>
              {notesSaved ? "Saved ✓" : "Save notes"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Detail({ k, v }: { k: string; v: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", gap: "10px", fontSize: "12.5px", padding: "5px 0", borderBottom: "1px solid #F1F5F9" }}>
      <span style={{ color: "#64748B" }}>{k}</span>
      <span style={{ color: "#0F172A", textAlign: "right", wordBreak: "break-word" }}>{v}</span>
    </div>
  );
}
