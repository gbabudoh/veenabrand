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

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: "34px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "30px", margin: 0, fontWeight: 500 }}>
          User Accounts &amp; Permissions
        </h1>
        <div style={{ fontSize: "13px", color: "rgba(246, 242, 234, 0.5)", marginTop: "4px" }}>
          View registered customer accounts and modify staff administrator privileges
        </div>
      </div>

      {errorMsg && (
        <div style={{
          background: "rgba(219, 76, 63, 0.1)",
          border: "1px solid rgba(219, 76, 63, 0.3)",
          color: "#e6746c",
          fontSize: "13.5px",
          padding: "12px 16px",
          borderRadius: "2px",
          marginBottom: "24px",
          maxWidth: "760px"
        }}>
          ⚠️ {errorMsg}
        </div>
      )}

      {/* Main user list table */}
      <div style={{
        background: "#15130F",
        border: "1px solid rgba(246, 242, 234, 0.08)",
        borderRadius: "4px",
        padding: "24px"
      }}>
        <div style={{
          background: "rgba(246, 242, 234, 0.03)",
          padding: "12px 18px",
          borderRadius: "3px",
          fontSize: "12.5px",
          color: "rgba(246,242,234,0.6)",
          marginBottom: "20px",
          borderLeft: "3px solid var(--color-emerald)"
        }}>
          <strong>Security Notice:</strong> Only accounts with the <strong>SUPERADMIN</strong> role have permissions to alter user roles or elevate basic staff to admin status.
        </div>

        {loading ? (
          <div style={{ color: "rgba(246,242,234,0.5)" }}>Querying user databases...</div>
        ) : users.length === 0 ? (
          <div style={{ color: "rgba(246,242,234,0.4)" }}>No accounts found in database.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(246,242,234,0.08)" }}>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Email</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Username</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Full Name</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Role</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)", textAlign: "right" }}>Permissions Check</th>
                </tr>
              </thead>
              <tbody>
                {users.map((u) => (
                  <tr key={u.id} style={{ borderBottom: "1px solid rgba(246,242,234,0.04)" }}>
                    <td style={{ padding: "14px 10px", fontWeight: 500 }}>{u.email}</td>
                    <td style={{ padding: "14px 10px", fontFamily: "var(--font-mono)", color: "rgba(246,242,234,0.7)" }}>
                      {u.username || "—"}
                    </td>
                    <td style={{ padding: "14px 10px" }}>{u.name || "Customer Account"}</td>
                    <td style={{ padding: "14px 10px" }}>
                      <span style={{
                        color: u.role === "SUPERADMIN" ? "#e6746c" : u.role === "ADMIN" ? "var(--color-emerald)" : "rgba(246,242,234,0.6)",
                        fontWeight: 600
                      }}>
                        {u.role}
                      </span>
                    </td>
                    <td style={{ padding: "12px 10px", textAlign: "right" }}>
                      <select
                        value={u.role}
                        disabled={updatingId === u.id}
                        onChange={(e) => handleRoleChange(u.id, e.target.value)}
                        style={{
                          background: "#0F0E0B",
                          color: "#F6F2EA",
                          border: "1px solid rgba(246,242,234,0.15)",
                          borderRadius: "2px",
                          padding: "4px 8px",
                          fontSize: "12px",
                          cursor: "pointer"
                        }}
                      >
                        <option value="USER">Customer (USER)</option>
                        <option value="ADMIN">Atelier Staff (ADMIN)</option>
                        <option value="SUPERADMIN">Developer (SUPERADMIN)</option>
                      </select>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
