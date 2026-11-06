"use client";

import React, { useEffect, useState } from "react";

type Check = { configured: boolean; ok: boolean; detail: string };
type Status = { storage: Check; imgproxy: Check; livekit: Check };

const ROWS: { key: keyof Status; name: string; role: string }[] = [
  { key: "storage", name: "MinIO", role: "Media storage & uploads" },
  { key: "imgproxy", name: "imgproxy", role: "Image resizing & optimisation" },
  { key: "livekit", name: "LiveKit", role: "Live video sessions" },
];

// Live connectivity check for the media/video services configured in .env.local.
export default function IntegrationsStatus() {
  const [status, setStatus] = useState<Status | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const run = async () => {
    setLoading(true);
    setError("");
    try {
      const res = await fetch("/api/admin/integrations", { cache: "no-store" });
      if (!res.ok) throw new Error(`Status check failed (${res.status})`);
      setStatus(await res.json());
    } catch (err: any) {
      setError(err.message || "Status check failed");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    run();
  }, []);

  return (
    <div>
      <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
        {ROWS.map((r) => {
          const c = status?.[r.key];
          const color = !c ? "rgba(246,242,234,0.3)" : c.ok ? "#4CAF7A" : c.configured ? "#E07A6A" : "#E8C27A";
          const state = !c ? (loading ? "Checking" : "-") : c.ok ? "Connected" : c.configured ? "Error" : "Not configured";
          return (
            <div
              key={r.key}
              style={{
                display: "grid",
                gridTemplateColumns: "12px 140px 1fr auto",
                gap: "12px",
                alignItems: "center",
                background: "#0F0E0B",
                border: "1px solid rgba(246,242,234,0.08)",
                borderRadius: "3px",
                padding: "12px 14px",
              }}
            >
              <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: color }} />
              <div>
                <div style={{ fontSize: "13px", fontWeight: 600 }}>{r.name}</div>
                <div style={{ fontSize: "11px", color: "rgba(246,242,234,0.45)" }}>{r.role}</div>
              </div>
              <div style={{ fontSize: "12px", color: "rgba(246,242,234,0.6)", overflow: "hidden", textOverflow: "ellipsis" }}>
                {c?.detail}
              </div>
              <div style={{ fontSize: "11px", fontWeight: 600, color, textTransform: "uppercase", letterSpacing: "0.05em" }}>
                {state}
              </div>
            </div>
          );
        })}
      </div>
      {error && <div style={{ fontSize: "12px", color: "#E07A6A", marginTop: "10px" }}>{error}</div>}
      <button
        type="button"
        onClick={run}
        disabled={loading}
        style={{
          marginTop: "14px",
          background: "#0F0E0B",
          border: "1px solid rgba(246,242,234,0.2)",
          color: "#F6F2EA",
          padding: "6px 14px",
          fontSize: "12px",
          borderRadius: "2px",
          cursor: "pointer",
        }}
      >
        {loading ? "Checking..." : "Re-check"}
      </button>
    </div>
  );
}
