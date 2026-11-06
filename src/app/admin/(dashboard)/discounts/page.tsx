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

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#FFFFFF",
    border: "1px solid #CBD5E1",
    color: "#0F172A",
    padding: "9px 12px",
    fontSize: "13px",
    borderRadius: "6px",
    outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    color: "#64748B",
    marginBottom: "5px",
    textTransform: "uppercase",
    fontWeight: 600,
    letterSpacing: "0.05em",
  };

  return (
    <div style={{ maxWidth: "100%" }}>
      {/* Title */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "#0F172A", margin: 0, fontWeight: 600 }}>
          Promo Codes &amp; Discount Vouchers
        </h1>
        <div style={{ fontSize: "13.5px", color: "#64748B", marginTop: "4px" }}>
          Configure checkout promotional codes and percentage reductions
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: "24px", alignItems: "start" }}>
        {/* Codes Table List */}
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "10px",
          padding: "20px 24px",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
        }}>
          {loading ? (
            <div style={{ color: "#64748B", padding: "40px 0", textAlign: "center", fontSize: "13.5px" }}>
              Querying promotional voucher records...
            </div>
          ) : codes.length === 0 ? (
            <div style={{ color: "#94A3B8", padding: "48px 0", textAlign: "center", fontSize: "13.5px" }}>
              No active promotional codes configured.
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0", background: "#F8FAFC" }}>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Coupon Code</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Reduction</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {codes.map((c) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px", fontFamily: "var(--font-mono)", fontWeight: 700, color: "#0F172A", fontSize: "13px" }}>
                      {c.code}
                    </td>
                    <td style={{ padding: "14px", fontWeight: 700, color: "#059669" }}>
                      {c.discountPercent}% OFF
                    </td>
                    <td style={{ padding: "14px" }}>
                      <span style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        background: c.active ? "#ECFDF5" : "#F8FAFC",
                        color: c.active ? "#065F46" : "#64748B",
                        border: `1px solid ${c.active ? "#A7F3D0" : "#CBD5E1"}`,
                        fontSize: "11px",
                        fontWeight: 600,
                        padding: "3px 8px",
                        borderRadius: "999px",
                      }}>
                        <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: c.active ? "#10B981" : "#94A3B8" }} />
                        {c.active ? "Active" : "Disabled"}
                      </span>
                    </td>
                    <td style={{ padding: "14px", textAlign: "right" }}>
                      <button
                        type="button"
                        onClick={() => handleDelete(c.id)}
                        style={{
                          background: "#FEF2F2",
                          border: "1px solid #FECACA",
                          color: "#DC2626",
                          padding: "4px 10px",
                          borderRadius: "4px",
                          fontSize: "11.5px",
                          fontWeight: 600,
                          cursor: "pointer",
                          transition: "all 0.15s ease",
                        }}
                        onMouseEnter={(e) => {
                          e.currentTarget.style.background = "#FEE2E2";
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.style.background = "#FEF2F2";
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
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "10px",
          padding: "24px",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
        }}>
          <h2 style={{ fontSize: "16px", margin: "0 0 16px", fontWeight: 600, color: "#0F172A", borderBottom: "1px solid #F1F5F9", paddingBottom: "12px" }}>
            Create New Coupon Code
          </h2>
          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Coupon Code</label>
              <input
                type="text"
                required
                placeholder="e.g. VEENA15"
                value={code}
                onChange={(e) => setCode(e.target.value)}
                style={{ ...inputStyle, fontFamily: "var(--font-mono)" }}
              />
            </div>
            <div>
              <label style={labelStyle}>Discount Percentage (1 - 100)%</label>
              <input
                type="number"
                required
                min={1}
                max={100}
                placeholder="e.g. 15"
                value={discountPercent}
                onChange={(e) => setDiscountPercent(e.target.value)}
                style={inputStyle}
              />
            </div>

            <button
              type="submit"
              disabled={submitting}
              style={{
                background: "#0F172A",
                color: "#FFFFFF",
                border: "none",
                padding: "10px 16px",
                fontSize: "12.5px",
                cursor: submitting ? "wait" : "pointer",
                borderRadius: "6px",
                fontWeight: 600,
                marginTop: "4px",
                opacity: submitting ? 0.6 : 1,
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.15)",
                transition: "all 0.15s ease",
              }}
            >
              {submitting ? "Saving..." : "Create & Activate Promo"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
