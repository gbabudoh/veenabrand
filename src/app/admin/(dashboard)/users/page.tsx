"use client";

import React, { useState, useEffect } from "react";

interface User {
  id: string;
  email: string;
  username: string | null;
  name: string | null;
  role: string;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");

  const fetchUsers = async () => {
    try {
      const res = await fetch("/api/admin/users");
      if (res.ok) {
        const data = await res.json();
        setUsers(data.users);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const handleRoleChange = async (userId: string, newRole: string) => {
    setUpdatingId(userId);
    setErrorMsg("");

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId, role: newRole }),
      });

      if (res.ok) {
        await fetchUsers();
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "Failed to update role. Permission denied.");
      }
    } catch (err) {
      setErrorMsg("Network error occurred.");
    } finally {
      setUpdatingId(null);
    }
  };

  const getRoleBadge = (role: string) => {
    switch (role) {
      case "SUPERADMIN":
        return { label: "Super Admin", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE" };
      case "ADMIN":
        return { label: "Atelier Staff", color: "#065F46", bg: "#ECFDF5", border: "#A7F3D0" };
      default:
        return { label: "Client", color: "#334155", bg: "#F1F5F9", border: "#E2E8F0" };
    }
  };

  return (
    <div style={{ maxWidth: "100%" }}>
      {/* Title */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "#0F172A", margin: 0, fontWeight: 600 }}>
          User Accounts &amp; Staff Roles
        </h1>
        <div style={{ fontSize: "13.5px", color: "#64748B", marginTop: "4px" }}>
          Manage client profiles and assign staff access levels
        </div>
      </div>

      {errorMsg && (
        <div style={{
          background: "#FEF2F2",
          border: "1px solid #FECACA",
          color: "#DC2626",
          fontSize: "13px",
          padding: "12px 16px",
          borderRadius: "6px",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span>⚠️ {errorMsg}</span>
        </div>
      )}

      {/* Main user list table card */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "10px",
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
      }}>
        <div style={{
          background: "#F8FAFC",
          border: "1px solid #E2E8F0",
          padding: "12px 16px",
          borderRadius: "6px",
          fontSize: "12.5px",
          color: "#475569",
          marginBottom: "20px",
          display: "flex",
          alignItems: "center",
          gap: "8px",
        }}>
          <span style={{ color: "#059669", fontWeight: 600 }}>🔒 Security Notice:</span>
          <span>Only authenticated accounts with the <strong>SUPERADMIN</strong> role possess authority to elevate or revoke staff roles.</span>
        </div>

        {loading ? (
          <div style={{ color: "#64748B", padding: "40px 0", textAlign: "center", fontSize: "13.5px" }}>
            Querying user directory...
          </div>
        ) : users.length === 0 ? (
          <div style={{ color: "#94A3B8", padding: "48px 0", textAlign: "center", fontSize: "13.5px" }}>
            No registered users found in the database.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0", background: "#F8FAFC" }}>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Account Email</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Username</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Full Name</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Current Role</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, textAlign: "right" }}>Permissions</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => {
                  const badge = getRoleBadge(u.role);
                  return (
                    <tr key={u.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "14px", fontWeight: 600, color: "#0F172A" }}>{u.email}</td>
                      <td style={{ padding: "14px", fontFamily: "var(--font-mono)", color: "#64748B", fontSize: "12.5px" }}>
                        {u.username || "—"}
                      </td>
                      <td style={{ padding: "14px", color: "#334155" }}>{u.name || "Customer Account"}</td>
                      <td style={{ padding: "14px" }}>
                        <span style={{
                          display: "inline-flex",
                          alignItems: "center",
                          background: badge.bg,
                          color: badge.color,
                          border: `1px solid ${badge.border}`,
                          fontSize: "11px",
                          fontWeight: 600,
                          padding: "3px 9px",
                          borderRadius: "4px",
                        }}>
                          {badge.label}
                        </span>
                      </td>
                      <td style={{ padding: "12px 14px", textAlign: "right" }}>
                        <select
                          value={u.role}
                          disabled={updatingId === u.id}
                          onChange={(e) => handleRoleChange(u.id, e.target.value)}
                          style={{
                            background: "#FFFFFF",
                            color: "#0F172A",
                            border: "1px solid #CBD5E1",
                            borderRadius: "4px",
                            padding: "4px 8px",
                            fontSize: "12px",
                            cursor: "pointer",
                            outline: "none",
                            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                          }}
                        >
                          <option value="USER">Customer (USER)</option>
                          <option value="ADMIN">Atelier Staff (ADMIN)</option>
                          <option value="SUPERADMIN">Developer (SUPERADMIN)</option>
                        </select>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
