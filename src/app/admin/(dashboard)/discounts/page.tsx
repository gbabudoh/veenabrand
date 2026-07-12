"use client";

import React, { useState, useEffect } from "react";

interface DiscountCode {
  id: string;
  code: string;
  discountPercent: number;
  active: boolean;
  createdAt: string;
}

export default function AdminDiscountsPage() {
  const [codes, setCodes] = useState<DiscountCode[]>([]);
  const [loading, setLoading] = useState(true);
  const [code, setCode] = useState("");
  const [discountPercent, setDiscountPercent] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const fetchCodes = async () => {
    try {
      const res = await fetch("/api/admin/discounts");
      if (res.ok) {
        const data = await res.json();
        setCodes(data.codes);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCodes();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!code || !discountPercent) return;
    setSubmitting(true);

    try {
      const res = await fetch("/api/admin/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: code.trim().toUpperCase(),
          discountPercent: Number(discountPercent),
        }),
      });

      if (res.ok) {
        setCode("");
        setDiscountPercent("");
        await fetchCodes();
      } else {
        alert("Failed to save discount code");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Delete this discount code?")) return;

    try {
      const res = await fetch(`/api/admin/discounts?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchCodes();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: "34px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "30px", margin: 0, fontWeight: 500 }}>
          Discount Coupon Codes
        </h1>
        <div style={{ fontSize: "13px", color: "rgba(246, 242, 234, 0.5)", marginTop: "4px" }}>
          Manage checkout promo codes and configure discount percentages
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "28px", alignItems: "start" }}>
        {/* Codes Table List */}
        <div style={{
          background: "#15130F",
          border: "1px solid rgba(246, 242, 234, 0.08)",
          borderRadius: "4px",
          padding: "24px"
        }}>
          {loading ? (
            <div style={{ color: "rgba(246,242,234,0.5)" }}>Querying discounts records...</div>
          ) : codes.length === 0 ? (
            <div style={{ color: "rgba(246,242,234,0.4)" }}>No active codes found.</div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(246,242,234,0.08)" }}>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Coupon Code</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Percentage Off</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Status</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid rgba(246,242,234,0.04)" }}>
                    <td style={{ padding: "14px 10px", fontFamily: "var(--font-mono)", fontWeight: "bold" }}>{c.code}</td>
                    <td style={{ padding: "14px 10px", fontWeight: 600 }}>{c.discountPercent}% OFF</td>
                    <td style={{ padding: "14px 10px" }}>
                      <span style={{
                        color: c.active ? "var(--color-emerald)" : "rgba(246,242,234,0.4)",
                        fontSize: "11px",
                        fontWeight: 600,
                        textTransform: "uppercase"
                      }}>
                        {c.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td style={{ padding: "14px 10px", textAlign: "right" }}>
                      <button
                        onClick={() => handleDelete(c.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#e6746c",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "13px"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* Creation Form Card */}
        <div style={{
          background: "#15130F",
          border: "1px solid rgba(246, 242, 234, 0.08)",
          borderRadius: "4px",
          padding: "24px"
        }}>
          <h2 style={{ fontSize: "15px", margin: "0 0 20px", fontWeight: 600 }}>
            Create New Coupon Code
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "rgba(246,242,234,0.5)", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                Coupon Code
              </label>
              <input
                type="text"
                required
                placeholder="e.g. VEENA15"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ width: "100%", background: "#0F0E0B", border: "1px solid rgba(246,242,234,0.15)", color: "#F6F2EA", padding: "10px 12px", fontSize: "13.5px", borderRadius: "2px", outline: "none" }}
              />
            </div>
            <div>
              <label style={{ display: "block", fontSize: "11px", color: "rgba(246,242,234,0.5)", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                Discount Percentage
              </label>
              <input
                type="number"
                required
                min={1}
                max={100}
                placeholder="e.g. 15"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                style={{ width: "100%", background: "#0F0E0B", border: "1px solid rgba(246,242,234,0.15)", color: "#F6F2EA", padding: "10px 12px", fontSize: "13.5px", borderRadius: "2px", outline: "none" }}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "#F6F2EA",
                color: "#15130F",
                border: "none",
                padding: "12px",
                fontSize: "12px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                cursor: "pointer",
                borderRadius: "2px",
                fontWeight: 600,
                marginTop: "6px",
                opacity: submitting ? 0.6 : 1
              }}
            >
              {submitting ? "Saving..." : "Confirm & Save"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
