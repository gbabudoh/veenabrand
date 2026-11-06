"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

// Thin "Live now" strip above the header while a featured show is broadcasting.
export default function LiveNowBar() {
  const pathname = usePathname();
  const [show, setShow] = useState<{ slug: string; title: string } | null>(null);

  useEffect(() => {
    let alive = true;
    const check = async () => {
      try {
        const res = await fetch("/api/live/current", { cache: "no-store" });
        if (res.ok && alive) setShow((await res.json()).show);
      } catch {
        // Offline or server hiccup — keep whatever we last showed.
      }
    };
    check();
    const t = setInterval(check, 60000);
    return () => {
      alive = false;
      clearInterval(t);
    };
  }, []);

  if (!show || pathname?.startsWith(`/live/${show.slug}`)) return null;

  return (
    <Link
      href={`/live/${show.slug}`}
      style={{
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "10px",
        background: "#15130F",
        color: "#F6F2EA",
        fontSize: "11.5px",
        letterSpacing: "0.12em",
        textTransform: "uppercase",
        padding: "9px 16px",
        textDecoration: "none",
        textAlign: "center",
      }}
    >
      <span style={{ display: "inline-flex", alignItems: "center", gap: "6px", color: "#FF6B5B", fontWeight: 700 }}>
        <span className="vn-live-dot" /> Live now
      </span>
      <span style={{ overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", maxWidth: "60vw" }}>{show.title}</span>
      <span style={{ fontWeight: 700 }}>Watch →</span>
    </Link>
  );
}
