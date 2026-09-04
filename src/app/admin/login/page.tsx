"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      if (res.ok) {
        router.push("/admin");
        router.refresh();
      } else {
        const data = await res.json();
        setError(data.error || "Login failed. Invalid credentials.");
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#15130F",
      fontFamily: "var(--font-sans)",
      padding: "24px",
    }}>
      <div style={{
        width: "100%",
        maxWidth: "400px",
        background: "#1C1A16",
        border: "1px solid rgba(246, 242, 234, 0.12)",
        borderRadius: "4px",
        padding: "40px 32px",
        boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
      }}>
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <img
            src="/images/logo.png"
            alt="Veena"
            width={78}
            height={76}
            style={{ height: "76px", width: "auto", display: "block", margin: "0 auto" }}
          />
          <div style={{
            fontSize: "11px",
            color: "rgba(246, 242, 234, 0.5)",
            textTransform: "uppercase",
            letterSpacing: "0.14em",
            marginTop: "6px",
            fontWeight: 600,
          }}>
            Management Terminal
          </div>
        </div>

        {error && (
          <div style={{
            background: "rgba(219, 76, 63, 0.1)",
            border: "1px solid rgba(219, 76, 63, 0.3)",
            color: "#e6746c",
            fontSize: "13px",
            padding: "12px 14px",
            borderRadius: "2px",
            marginBottom: "24px",
            lineHeight: 1.5,
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin}>
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "11px",
              color: "rgba(246, 242, 234, 0.6)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "8px",
              fontWeight: 600,
            }}>
              Username
            </label>
            <input
              type="text"
              required
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(21, 19, 15, 0.4)",
                border: "1px solid rgba(246, 242, 234, 0.15)",
                borderRadius: "2px",
                color: "#F6F2EA",
                padding: "12px 14px",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
            />
          </div>

          <div style={{ marginBottom: "28px" }}>
            <label style={{
              display: "block",
              fontSize: "11px",
              color: "rgba(246, 242, 234, 0.6)",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              marginBottom: "8px",
              fontWeight: 600,
            }}>
              Password
            </label>
            <input
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              style={{
                width: "100%",
                background: "rgba(21, 19, 15, 0.4)",
                border: "1px solid rgba(246, 242, 234, 0.15)",
                borderRadius: "2px",
                color: "#F6F2EA",
                padding: "12px 14px",
                fontSize: "14px",
                outline: "none",
                transition: "border-color 0.2s ease",
              }}
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            style={{
              width: "100%",
              background: "#F6F2EA",
              color: "#15130F",
              border: "none",
              padding: "14px",
              fontSize: "12.5px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              cursor: "pointer",
              borderRadius: "2px",
              fontWeight: 600,
              opacity: loading ? 0.6 : 1,
              transition: "opacity 0.2s ease",
            }}
          >
            {loading ? "Verifying..." : "Sign In"}
          </button>
        </form>
      </div>
    </div>
  );
}
