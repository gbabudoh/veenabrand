import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import AdminSidebar from "./AdminSidebar";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = getAdminSession();

  // Protect layout on server-side
  if (!session) {
    redirect("/admin/login");
  }

  return (
    <div className="admin-theme" style={{
      minHeight: "100vh",
      background: "#F8FAFC", // Light enterprise canvas
      color: "#0F172A",     // Slate 900 high-contrast typography
      fontFamily: "var(--font-admin)",
      position: "relative",
    }}>
      {/* Standalone Enterprise Sidebar (Strictly Fixed) */}
      <AdminSidebar
        username={session.username || "Super Admin"}
        role={session.role}
      />

      {/* Main Workspace Area Offset by Fixed Sidebar (256px) */}
      <div style={{
        marginLeft: "256px",
        minHeight: "100vh",
        display: "flex",
        flexDirection: "column",
        minWidth: 0, // Prevents flex child overflow
        background: "#F8FAFC",
      }}>
        {/* Top Executive Header */}
        <header style={{
          height: "62px",
          background: "#FFFFFF",
          borderBottom: "1px solid #E2E8F0",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 36px",
          flexShrink: 0,
          position: "sticky",
          top: 0,
          zIndex: 20,
          boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
        }}>
          <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
            <span style={{ fontSize: "12px", color: "#64748B", fontWeight: 500, letterSpacing: "0.02em" }}>
              Veena Atelier Operations
            </span>
            <span style={{ color: "#CBD5E1" }}>/</span>
            <span style={{ fontSize: "12.5px", color: "#0F172A", fontWeight: 600 }}>
              Management Console v2.0
            </span>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
            <div style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#ECFDF5",
              color: "#065F46",
              border: "1px solid #A7F3D0",
              padding: "4px 11px",
              borderRadius: "999px",
              fontSize: "11.5px",
              fontWeight: 600,
              letterSpacing: "0.02em",
            }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
              Active Console Session
            </div>
          </div>
        </header>

        {/* Workspace Body */}
        <main style={{ flex: 1, padding: "32px 36px", width: "100%", maxWidth: "1440px", boxSizing: "border-box" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
