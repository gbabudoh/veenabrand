"use client";

// Light enterprise admin primitives (matches the Banners / Dashboard pages).
import React from "react";

export const ui = {
  card: {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "8px",
    padding: "22px",
    boxShadow: "0 1px 2px rgba(15,23,42,0.04)",
  } as React.CSSProperties,
  label: {
    display: "block",
    fontSize: "11.5px",
    fontWeight: 600,
    color: "#475569",
    marginBottom: "6px",
  } as React.CSSProperties,
  input: {
    width: "100%",
    background: "#FFFFFF",
    border: "1px solid #CBD5E1",
    color: "#0F172A",
    padding: "9px 11px",
    fontSize: "13px",
    borderRadius: "6px",
    outline: "none",
    boxSizing: "border-box",
    fontFamily: "inherit",
  } as React.CSSProperties,
  muted: { fontSize: "12.5px", color: "#64748B" } as React.CSSProperties,
};

type BtnVariant = "primary" | "secondary" | "danger" | "ghost" | "live";

const BTN: Record<BtnVariant, React.CSSProperties> = {
  primary: { background: "#0F172A", color: "#FFFFFF", border: "1px solid #0F172A" },
  secondary: { background: "#FFFFFF", color: "#0F172A", border: "1px solid #CBD5E1" },
  danger: { background: "#FFFFFF", color: "#B91C1C", border: "1px solid #FECACA" },
  ghost: { background: "transparent", color: "#334155", border: "1px solid transparent" },
  live: { background: "#DC2626", color: "#FFFFFF", border: "1px solid #DC2626" },
};

export function Button({
  variant = "secondary",
  size = "md",
  style,
  ...props
}: React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: BtnVariant; size?: "sm" | "md" }) {
  return (
    <button
      type="button"
      {...props}
      style={{
        ...BTN[variant],
        padding: size === "sm" ? "5px 10px" : "8px 16px",
        fontSize: size === "sm" ? "12px" : "13px",
        fontWeight: 600,
        borderRadius: "6px",
        cursor: props.disabled ? "default" : "pointer",
        opacity: props.disabled ? 0.55 : 1,
        whiteSpace: "nowrap",
        fontFamily: "inherit",
        ...style,
      }}
    />
  );
}

const STATUS: Record<string, { bg: string; fg: string; border: string; label: string }> = {
  SCHEDULED: { bg: "#EFF6FF", fg: "#1D4ED8", border: "#BFDBFE", label: "Scheduled" },
  LIVE: { bg: "#FEF2F2", fg: "#B91C1C", border: "#FECACA", label: "Live" },
  ENDED: { bg: "#F1F5F9", fg: "#475569", border: "#E2E8F0", label: "Ended" },
  CANCELLED: { bg: "#FFF7ED", fg: "#C2410C", border: "#FED7AA", label: "Cancelled" },
};

export function StatusPill({ status }: { status: string }) {
  const s = STATUS[status] || STATUS.ENDED;
  return (
    <span
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "6px",
        background: s.bg,
        color: s.fg,
        border: `1px solid ${s.border}`,
        padding: "2px 9px",
        borderRadius: "999px",
        fontSize: "11px",
        fontWeight: 600,
      }}
    >
      {status === "LIVE" && <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#DC2626" }} />}
      {s.label}
    </span>
  );
}

export function PageHeader({ title, subtitle, action }: { title: string; subtitle?: string; action?: React.ReactNode }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", gap: "16px", marginBottom: "24px", flexWrap: "wrap" }}>
      <div>
        <h1 style={{ fontSize: "24px", fontWeight: 700, margin: 0, color: "#0F172A" }}>{title}</h1>
        {subtitle && <div style={{ ...ui.muted, marginTop: "4px" }}>{subtitle}</div>}
      </div>
      {action}
    </div>
  );
}

/** "Mon 6 Oct, 14:30" in the viewer's locale; "—" for null. */
export function formatWhen(value: string | Date | null | undefined) {
  if (!value) return "—";
  const d = new Date(value);
  return d.toLocaleString(undefined, { weekday: "short", day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
}

/** Converts a <input type="datetime-local"> value to ISO (or "" when empty). */
export function localInputToIso(value: string) {
  return value ? new Date(value).toISOString() : "";
}

/** ISO → value for <input type="datetime-local"> in local time. */
export function isoToLocalInput(value: string | null | undefined) {
  if (!value) return "";
  const d = new Date(value);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    window.prompt("Copy this link:", text);
    return false;
  }
}
