"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
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
        setError(data.error || "Invalid credentials. Please verify your email/username and password.");
      }
    } catch (err) {
      setError("An unexpected network error occurred. Please try again.");
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
      background: "radial-gradient(1200px 700px at 50% -5%, #FFFFFF 0%, #F8FAFC 60%, #EEF2F6 100%)",
      fontFamily: "var(--font-sans)",
      padding: "24px",
      position: "relative",
    }}>
      {/* Autofill styling override to prevent the yellow box */}
      <style>{`
        input:-webkit-autofill,
        input:-webkit-autofill:hover,
        input:-webkit-autofill:focus,
        input:-webkit-autofill:active {
          -webkit-box-shadow: 0 0 0 40px #FFFFFF inset !important;
          -webkit-text-fill-color: #0F172A !important;
          caret-color: #0F172A !important;
          transition: background-color 5000s ease-in-out 0s;
        }
        .admin-login-input:focus {
          border-color: #10B981 !important;
          box-shadow: 0 0 0 3px rgba(16, 185, 129, 0.12) !important;
        }
        .admin-login-btn:hover:not(:disabled) {
          background: #1E293B !important;
          transform: translateY(-1px);
          box-shadow: 0 6px 16px rgba(15, 23, 42, 0.18) !important;
        }
      `}</style>

      {/* Elevated Flat-Face Display Card */}
      <div style={{
        width: "100%",
        maxWidth: "440px",
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "12px",
        padding: "44px 36px",
        boxShadow: "0 20px 35px -10px rgba(15, 23, 42, 0.07), 0 8px 12px -6px rgba(15, 23, 42, 0.03)",
        position: "relative",
      }}>
        {/* Atelier Brand Header */}
        <div style={{ textAlign: "center", marginBottom: "32px" }}>
          <div style={{
            width: "60px",
            height: "60px",
            borderRadius: "12px",
            background: "#FAF7F2",
            border: "1px solid #EBE4D8",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            margin: "0 auto 16px",
            boxShadow: "0 2px 8px rgba(0, 0, 0, 0.03)"
          }}>
            <img
              src="/images/logo.png"
              alt="Veena"
              width={42}
              height={41}
              style={{ height: "40px", width: "auto", display: "block" }}
            />
          </div>

          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "22px",
            color: "#0F172A",
            margin: "0 0 4px",
            fontWeight: 600,
            letterSpacing: "0.03em"
          }}>
            VEENA ATELIER
          </h1>

          <div style={{
            fontSize: "11px",
            color: "#64748B",
            textTransform: "uppercase",
            letterSpacing: "0.1em",
            fontWeight: 600,
            marginBottom: "12px"
          }}>
            Executive Management Console
          </div>

          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            background: "#ECFDF5",
            border: "1px solid #A7F3D0",
            color: "#065F46",
            padding: "3px 10px",
            borderRadius: "999px",
            fontSize: "11px",
            fontWeight: 600,
            letterSpacing: "0.02em"
          }}>
            <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
            256-Bit Encrypted Terminal
          </div>
        </div>

        {/* Error Alert Box */}
        {error && (
          <div style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "10px",
            background: "#FEF2F2",
            border: "1px solid #FECACA",
            color: "#DC2626",
            fontSize: "13px",
            padding: "12px 14px",
            borderRadius: "6px",
            marginBottom: "24px",
            lineHeight: 1.4,
          }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0, marginTop: "1px" }}>
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <span>{error}</span>
          </div>
        )}

        {/* Form Fields */}
        <form onSubmit={handleLogin}>
          {/* Email or Username */}
          <div style={{ marginBottom: "20px" }}>
            <label style={{
              display: "block",
              fontSize: "12px",
              color: "#334155",
              marginBottom: "7px",
              fontWeight: 600,
              letterSpacing: "0.01em",
            }}>
              Email or Username
            </label>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              {/* Mail / User Icon */}
              <span style={{ position: "absolute", left: "14px", color: "#94A3B8", display: "flex", pointerEvents: "none" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </span>
              <input
                type="text"
                required
                placeholder="superadmin@veenafashion.com"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="admin-login-input"
                style={{
                  width: "100%",
                  height: "46px",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "6px",
                  color: "#0F172A",
                  padding: "0 14px 0 42px",
                  fontSize: "13.5px",
                  outline: "none",
                  transition: "all 0.15s ease",
                }}
              />
            </div>
          </div>

          {/* Password with Eye Toggle */}
          <div style={{ marginBottom: "26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "7px" }}>
              <label style={{
                fontSize: "12px",
                color: "#334155",
                fontWeight: 600,
                letterSpacing: "0.01em",
              }}>
                Security Password
              </label>
            </div>
            <div style={{ position: "relative", display: "flex", alignItems: "center" }}>
              {/* Lock Icon */}
              <span style={{ position: "absolute", left: "14px", color: "#94A3B8", display: "flex", pointerEvents: "none" }}>
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              </span>
              <input
                type={showPassword ? "text" : "password"}
                required
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="admin-login-input"
                style={{
                  width: "100%",
                  height: "46px",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  borderRadius: "6px",
                  color: "#0F172A",
                  padding: "0 44px 0 42px",
                  fontSize: "13.5px",
                  outline: "none",
                  transition: "all 0.15s ease",
                }}
              />
              {/* Interactive Eye Button */}
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                title={showPassword ? "Hide password" : "Show password"}
                style={{
                  position: "absolute",
                  right: "12px",
                  background: "none",
                  border: "none",
                  color: "#64748B",
                  cursor: "pointer",
                  padding: "4px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                {showPassword ? (
                  /* Eye Off */
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                    <line x1="1" y1="1" x2="23" y2="23" />
                  </svg>
                ) : (
                  /* Eye */
                  <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                    <circle cx="12" cy="12" r="3" />
                  </svg>
                )}
              </button>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            className="admin-login-btn"
            style={{
              width: "100%",
              height: "48px",
              background: "#0F172A",
              color: "#FFFFFF",
              border: "none",
              fontSize: "13px",
              letterSpacing: "0.06em",
              textTransform: "uppercase",
              cursor: loading ? "not-allowed" : "pointer",
              borderRadius: "6px",
              fontWeight: 600,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "8px",
              boxShadow: "0 4px 12px rgba(15, 23, 42, 0.12)",
              transition: "all 0.15s ease",
            }}
          >
            {loading ? (
              <>
                <span style={{
                  width: "14px",
                  height: "14px",
                  borderRadius: "50%",
                  border: "2px solid rgba(255,255,255,0.3)",
                  borderTopColor: "#FFFFFF",
                  animation: "spin 1s linear infinite"
                }} />
                <span>Authenticating...</span>
              </>
            ) : (
              <span>Sign In to Console</span>
            )}
          </button>
        </form>

        {/* Security & System Marker */}
        <div style={{
          marginTop: "28px",
          paddingTop: "20px",
          borderTop: "1px solid #F1F5F9",
          textAlign: "center",
        }}>
          <div style={{
            fontSize: "11px",
            color: "#94A3B8",
            display: "inline-flex",
            alignItems: "center",
            gap: "5px"
          }}>
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
              <path d="M7 11V7a5 5 0 0 1 10 0v4" />
            </svg>
            <span>Veena Fashion Technologies • Internal Operations Only</span>
          </div>
        </div>
      </div>
    </div>
  );
}
