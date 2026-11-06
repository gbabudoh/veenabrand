"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleLogout = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/auth", {
        method: "DELETE",
      });
      if (res.ok) {
        router.push("/admin/login");
        router.refresh();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleLogout}
      disabled={loading}
      style={{
        width: "100%",
        background: "transparent",
        color: "#64748B",
        border: "1px solid #E2E8F0",
        padding: "7px 12px",
        fontSize: "11.5px",
        fontWeight: 500,
        cursor: "pointer",
        borderRadius: "6px",
        transition: "all 0.15s ease",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        gap: "6px",
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.color = "#DC2626";
        e.currentTarget.style.borderColor = "#FECACA";
        e.currentTarget.style.background = "#FEF2F2";
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.color = "#64748B";
        e.currentTarget.style.borderColor = "#E2E8F0";
        e.currentTarget.style.background = "transparent";
      }}
    >
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
        <polyline points="16 17 21 12 16 7" />
        <line x1="21" y1="12" x2="9" y2="12" />
      </svg>
      <span>{loading ? "Signing out..." : "Sign Out"}</span>
    </button>
  );
}
