"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/lib/StoreContext";

export default function CookieBanner() {
  const { cookieVisible, acceptCookies, rejectCookies } = useStore();

  if (!cookieVisible) return null;

  return (
    <div style={{
      position: "fixed",
      left: "24px",
      right: "24px",
      bottom: "24px",
      maxWidth: "640px",
      margin: "0 auto",
      background: "#15130F",
      color: "#F6F2EA",
      padding: "20px 24px",
      borderRadius: "6px",
      zIndex: 60,
      display: "flex",
      alignItems: "center",
      gap: "20px",
      boxShadow: "0 20px 50px rgba(0,0,0,0.3)",
      flexWrap: "wrap"
    }}>
      <p style={{
        fontSize: "12.5px",
        lineHeight: 1.6,
        margin: 0,
        flex: 1,
        minWidth: "260px"
      }}>
        We use cookies to improve your shopping experience and remember your preferences. Read our{" "}
        <Link href="/legal?tab=cookies" style={{ textDecoration: "underline", color: "#F6F2EA" }}>
          Cookie Policy
        </Link>
        .
      </p>
      
      <div style={{
        display: "flex",
        gap: "10px",
        flexShrink: 0
      }}>
        <button
          onClick={rejectCookies}
          style={{
            background: "none",
            border: "1px solid rgba(246,242,234,0.4)",
            color: "#F6F2EA",
            padding: "9px 14px",
            fontSize: "11.5px",
            letterSpacing: "0.04em",
            cursor: "pointer",
            borderRadius: "2px"
          }}
        >
          Reject
        </button>
        <button
          onClick={acceptCookies}
          style={{
            background: "#F6F2EA",
            border: "none",
            color: "#15130F",
            padding: "9px 16px",
            fontSize: "11.5px",
            letterSpacing: "0.04em",
            cursor: "pointer",
            borderRadius: "2px",
            fontWeight: 500
          }}
        >
          Accept
        </button>
      </div>
    </div>
  );
}
