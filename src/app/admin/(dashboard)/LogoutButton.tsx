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
        background: "rgba(219, 76, 63, 0.15)",
        color: "#e6746c",
        border: "1px solid rgba(219, 76, 63, 0.25)",
        padding: "8px 12px",
        fontSize: "12px",
        letterSpacing: "0.04em",
        textTransform: "uppercase",
        cursor: "pointer",
        borderRadius: "2px",
        fontWeight: 600,
        transition: "all 0.2s ease",
      }}
    >
      {loading ? "Signing out..." : "Sign Out"}
    </button>
  );
}
