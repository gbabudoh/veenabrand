"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/money";

interface AnalyticsData {
  metrics: {
    ordersCount: number;
    customersCount: number;
    totalRevenueMinor: number;
  };
  statusDistribution: {
    PENDING_PAYMENT: number;
    PAID: number;
    IN_PRODUCTION: number;
    FULFILLED: number;
    CANCELLED: number;
  };
  topProducts: { name: string; quantity: number; revenueMinor: number }[];
  recentOrders: {
    id: string;
    orderNumber: string;
    totalMinor: number;
    status: string;
    createdAt: string;
    email: string;
  }[];
}

export default function AdminDashboard() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeRange, setTimeRange] = useState<"24h" | "7d" | "30d" | "all">("all");

  const fetchAnalytics = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/analytics");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      } else {
        setError("Failed to load analytics data.");
      }
    } catch (err) {
      setError("Network error occurred while fetching analytics.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  if (loading && !data) {
    return (
      <div style={{ padding: "60px 0", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: "14px", color: "#64748B" }}>
        <span style={{
          width: "28px",
          height: "28px",
          borderRadius: "50%",
          border: "2.5px solid #E2E8F0",
          borderTopColor: "#10B981",
          animation: "spin 0.8s linear infinite"
        }} />
        <div style={{ fontSize: "13.5px", fontWeight: 500 }}>Querying enterprise telemetry &amp; live sales records...</div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div style={{ background: "#FEF2F2", border: "1px solid #FECACA", color: "#DC2626", padding: "18px 24px", borderRadius: "8px", fontSize: "13.5px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <span>{error || "Failed to load dashboard metrics."}</span>
        <button
          onClick={fetchAnalytics}
          style={{ background: "#DC2626", color: "#FFFFFF", border: "none", padding: "6px 14px", borderRadius: "4px", fontSize: "12px", cursor: "pointer", fontWeight: 600 }}
        >
          Retry
        </button>
      </div>
    );
  }

  const { metrics, statusDistribution, topProducts, recentOrders } = data;

  // Calculated average order value
  const aovMinor = metrics.ordersCount > 0 ? Math.round(metrics.totalRevenueMinor / metrics.ordersCount) : 0;

  // Total active orders in the pipeline
  const totalPipelineOrders =
    (statusDistribution.PENDING_PAYMENT || 0) +
    (statusDistribution.PAID || 0) +
    (statusDistribution.IN_PRODUCTION || 0) +
    (statusDistribution.FULFILLED || 0) +
    (statusDistribution.CANCELLED || 0);

  const cardStyle: React.CSSProperties = {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "24px",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03), 0 1px 2px rgba(15, 23, 42, 0.02)",
    position: "relative",
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return { text: "Pending Payment", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", dot: "#8B5CF6" };
      case "PAID":
        return { text: "Paid & Queued", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6" };
      case "IN_PRODUCTION":
        return { text: "Atelier Production", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B" };
      case "FULFILLED":
        return { text: "Fulfilled / Shipped", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", dot: "#10B981" };
      case "CANCELLED":
        return { text: "Cancelled", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444" };
      default:
        return { text: status, color: "#64748B", bg: "#F1F5F9", border: "#E2E8F0", dot: "#94A3B8" };
    }
  };

  return (
    <div style={{ maxWidth: "100%" }}>
      {/* Top Executive Header Toolbar */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "#0F172A", margin: 0, fontWeight: 600 }}>
              Executive Overview
            </h1>
            <span style={{ fontSize: "11px", color: "#10B981", background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "2px 8px", borderRadius: "999px", fontWeight: 600 }}>
              Live Telemetry
            </span>
          </div>
          <div style={{ fontSize: "13.5px", color: "#64748B" }}>
            Real-time sales velocity, order fulfillment pipelines, and client telemetry
          </div>
        </div>

        {/* Filter Controls & Action Buttons */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px", flexWrap: "wrap" }}>
          {/* Timeframe Segmented Control */}
          <div style={{
            display: "inline-flex",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "6px",
            padding: "3px",
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
          }}>
            {(["24h", "7d", "30d", "all"] as const).map((range) => {
              const labels = { "24h": "24h", "7d": "7 Days", "30d": "30 Days", all: "All Time" };
              const isSelected = timeRange === range;
              return (
                <button
                  key={range}
                  type="button"
                  onClick={() => setTimeRange(range)}
                  style={{
                    background: isSelected ? "#0F172A" : "transparent",
                    color: isSelected ? "#FFFFFF" : "#64748B",
                    border: "none",
                    padding: "5px 12px",
                    borderRadius: "4px",
                    fontSize: "12px",
                    fontWeight: isSelected ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                  }}
                >
                  {labels[range]}
                </button>
              );
            })}
          </div>

          {/* Quick Actions */}
          <button
            type="button"
            onClick={fetchAnalytics}
            title="Refresh analytics data"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              color: "#334155",
              padding: "7px 12px",
              borderRadius: "6px",
              fontSize: "12.5px",
              cursor: "pointer",
              fontWeight: 500,
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
            }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M23 4v6h-6" />
              <path d="M1 20v-6h6" />
              <path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15" />
            </svg>
            <span>Sync</span>
          </button>

          <Link
            href="/admin/products"
            style={{
              display: "inline-flex",
              alignItems: "center",
              gap: "6px",
              background: "#10B981",
              color: "#FFFFFF",
              border: "none",
              padding: "7px 14px",
              borderRadius: "6px",
              fontSize: "12.5px",
              fontWeight: 600,
              textDecoration: "none",
              boxShadow: "0 1px 3px rgba(16, 185, 129, 0.3)",
            }}
          >
            <span>+ New Piece</span>
          </Link>
        </div>
      </div>

      {/* ===================================================================
          FLAT-FACE KPI METRIC CARDS (4 TILES WITH ENTERPRISE ICONS)
          =================================================================== */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))",
        gap: "20px",
        marginBottom: "32px",
      }}>
        {/* Metric 1: Total Revenue */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748B", letterSpacing: "0.06em", fontWeight: 600 }}>
                Total Revenue
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "30px", fontWeight: 600, color: "#0F172A", marginTop: "8px" }}>
                {formatNaira(metrics.totalRevenueMinor)}
              </div>
            </div>
            {/* Emerald Icon Badge */}
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "#ECFDF5",
              border: "1px solid #A7F3D0",
              color: "#059669",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: "#059669", background: "#ECFDF5", padding: "2px 7px", borderRadius: "999px", fontWeight: 600 }}>
              ● Settled
            </span>
            <span style={{ fontSize: "11.5px", color: "#64748B" }}>Excludes unconfirmed drafts</span>
          </div>
        </div>

        {/* Metric 2: Total Orders */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748B", letterSpacing: "0.06em", fontWeight: 600 }}>
                Total Orders
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "30px", fontWeight: 600, color: "#0F172A", marginTop: "8px" }}>
                {metrics.ordersCount}
              </div>
            </div>
            {/* Sapphire Icon Badge */}
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "#EFF6FF",
              border: "1px solid #BFDBFE",
              color: "#2563EB",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <path d="M16 10a4 4 0 0 1-8 0" />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: "#2563EB", background: "#EFF6FF", padding: "2px 7px", borderRadius: "999px", fontWeight: 600 }}>
              ● All-Time
            </span>
            <span style={{ fontSize: "11.5px", color: "#64748B" }}>Client checkout requests</span>
          </div>
        </div>

        {/* Metric 3: Registered Clients */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748B", letterSpacing: "0.06em", fontWeight: 600 }}>
                Registered Clients
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "30px", fontWeight: 600, color: "#0F172A", marginTop: "8px" }}>
                {metrics.customersCount}
              </div>
            </div>
            {/* Purple Icon Badge */}
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "#F5F3FF",
              border: "1px solid #DDD6FE",
              color: "#7C3AED",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: "#7C3AED", background: "#F5F3FF", padding: "2px 7px", borderRadius: "999px", fontWeight: 600 }}>
              ● Verified
            </span>
            <span style={{ fontSize: "11.5px", color: "#64748B" }}>Storefront accounts active</span>
          </div>
        </div>

        {/* Metric 4: Average Order Value (AOV) */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
            <div>
              <div style={{ fontSize: "11px", textTransform: "uppercase", color: "#64748B", letterSpacing: "0.06em", fontWeight: 600 }}>
                Avg Order Value
              </div>
              <div style={{ fontFamily: "var(--font-serif)", fontSize: "30px", fontWeight: 600, color: "#0F172A", marginTop: "8px" }}>
                {formatNaira(aovMinor)}
              </div>
            </div>
            {/* Amber Icon Badge */}
            <div style={{
              width: "40px",
              height: "40px",
              borderRadius: "8px",
              background: "#FFFBEB",
              border: "1px solid #FDE68A",
              color: "#D97706",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              flexShrink: 0,
            }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <polyline points="12 6 12 12 16 14" />
              </svg>
            </div>
          </div>
          <div style={{ display: "flex", alignItems: "center", gap: "8px", marginTop: "14px", paddingTop: "12px", borderTop: "1px solid #F1F5F9" }}>
            <span style={{ fontSize: "11px", color: "#D97706", background: "#FFFBEB", padding: "2px 7px", borderRadius: "999px", fontWeight: 600 }}>
              ● Atelier Basket
            </span>
            <span style={{ fontSize: "11.5px", color: "#64748B" }}>Per purchase transaction</span>
          </div>
        </div>
      </div>

      {/* ===================================================================
          MIDDLE ROW: ORDER PIPELINE & TOP PERFORMING PIECES
          =================================================================== */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))",
        gap: "24px",
        marginBottom: "32px",
      }}>
        {/* Order Allocation States with Multi-Segment Progress Bar */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #F1F5F9" }}>
            <div>
              <h2 style={{ fontSize: "15px", margin: 0, fontWeight: 600, color: "#0F172A" }}>
                Order Allocation Pipeline
              </h2>
              <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "2px" }}>
                Active fulfillment lifecycle distribution
              </div>
            </div>
            <span style={{ fontSize: "12px", color: "#0F172A", fontWeight: 600 }}>
              {totalPipelineOrders} {totalPipelineOrders === 1 ? "Order" : "Orders"}
            </span>
          </div>

          {/* Composite Multi-Segment Progress Bar */}
          <div style={{ marginBottom: "20px" }}>
            <div style={{
              height: "8px",
              width: "100%",
              borderRadius: "999px",
              background: "#F1F5F9",
              overflow: "hidden",
              display: "flex",
            }}>
              {totalPipelineOrders === 0 ? (
                <div style={{ width: "100%", height: "100%", background: "#E2E8F0" }} title="No active pipeline" />
              ) : (
                <>
                  {statusDistribution.PENDING_PAYMENT > 0 && (
                    <div
                      style={{
                        width: `${(statusDistribution.PENDING_PAYMENT / totalPipelineOrders) * 100}%`,
                        background: "#8B5CF6",
                      }}
                      title={`Pending: ${statusDistribution.PENDING_PAYMENT}`}
                    />
                  )}
                  {statusDistribution.PAID > 0 && (
                    <div
                      style={{
                        width: `${(statusDistribution.PAID / totalPipelineOrders) * 100}%`,
                        background: "#3B82F6",
                      }}
                      title={`Paid: ${statusDistribution.PAID}`}
                    />
                  )}
                  {statusDistribution.IN_PRODUCTION > 0 && (
                    <div
                      style={{
                        width: `${(statusDistribution.IN_PRODUCTION / totalPipelineOrders) * 100}%`,
                        background: "#F59E0B",
                      }}
                      title={`Production: ${statusDistribution.IN_PRODUCTION}`}
                    />
                  )}
                  {statusDistribution.FULFILLED > 0 && (
                    <div
                      style={{
                        width: `${(statusDistribution.FULFILLED / totalPipelineOrders) * 100}%`,
                        background: "#10B981",
                      }}
                      title={`Fulfilled: ${statusDistribution.FULFILLED}`}
                    />
                  )}
                  {statusDistribution.CANCELLED > 0 && (
                    <div
                      style={{
                        width: `${(statusDistribution.CANCELLED / totalPipelineOrders) * 100}%`,
                        background: "#EF4444",
                      }}
                      title={`Cancelled: ${statusDistribution.CANCELLED}`}
                    />
                  )}
                </>
              )}
            </div>
          </div>

          {/* Pipeline Rows */}
          <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
            {[
              { status: "PENDING_PAYMENT", label: "Pending Payment" },
              { status: "PAID", label: "Paid & Awaiting Queue" },
              { status: "IN_PRODUCTION", label: "Atelier Production" },
              { status: "FULFILLED", label: "Fulfilled / Shipped" },
              { status: "CANCELLED", label: "Cancelled / Void" },
            ].map((item) => {
              const count = (statusDistribution as any)[item.status] || 0;
              const meta = statusLabel(item.status);
              const percentage = totalPipelineOrders > 0 ? Math.round((count / totalPipelineOrders) * 100) : 0;

              return (
                <div
                  key={item.status}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "12.5px",
                    padding: "8px 12px",
                    borderRadius: "6px",
                    background: "#F8FAFC",
                    border: "1px solid #F1F5F9",
                  }}
                >
                  <span style={{ display: "flex", alignItems: "center", gap: "9px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: meta.dot }} />
                    <span style={{ color: "#334155", fontWeight: 500 }}>{item.label}</span>
                  </span>
                  <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ fontSize: "11px", color: "#94A3B8" }}>{percentage}%</span>
                    <span style={{
                      fontWeight: 600,
                      background: meta.bg,
                      color: meta.color,
                      border: `1px solid ${meta.border}`,
                      padding: "2px 8px",
                      borderRadius: "4px",
                      fontSize: "11.5px",
                      minWidth: "26px",
                      textAlign: "center",
                    }}>
                      {count}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Performing Pieces with Architectural Skeleton / Empty State */}
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "16px", paddingBottom: "12px", borderBottom: "1px solid #F1F5F9" }}>
            <div>
              <h2 style={{ fontSize: "15px", margin: 0, fontWeight: 600, color: "#0F172A" }}>
                Top Performing Pieces
              </h2>
              <div style={{ fontSize: "11.5px", color: "#64748B", marginTop: "2px" }}>
                Ranked by customer gross revenue volume
              </div>
            </div>
            <Link
              href="/admin/products"
              style={{ fontSize: "12px", color: "#10B981", textDecoration: "none", fontWeight: 600 }}
            >
              View All ↗
            </Link>
          </div>

          {topProducts.length === 0 ? (
            /* Enterprise Architectural Empty State */
            <div style={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              justifyContent: "center",
              padding: "36px 20px",
              textAlign: "center",
              background: "#F8FAFC",
              borderRadius: "8px",
              border: "1px dashed #CBD5E1",
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "10px",
                background: "#FFFFFF",
                border: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                color: "#94A3B8",
                marginBottom: "12px",
                boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <polygon points="12 2 2 7 12 12 22 7 12 2" />
                  <polyline points="2 17 12 22 22 17" />
                  <polyline points="2 12 12 17 22 12" />
                </svg>
              </div>
              <div style={{ fontSize: "13.5px", fontWeight: 600, color: "#0F172A" }}>
                No garment sales recorded yet
              </div>
              <div style={{ fontSize: "12px", color: "#64748B", maxWidth: "280px", margin: "4px 0 16px" }}>
                As customers place orders, top grossing atelier pieces will rank here automatically.
              </div>
              <Link
                href="/admin/products"
                style={{
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "7px 16px",
                  borderRadius: "6px",
                  fontSize: "12px",
                  fontWeight: 600,
                  textDecoration: "none",
                  boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                }}
              >
                + Create Garment
              </Link>
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              {topProducts.map((p, i) => (
                <div
                  key={i}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    fontSize: "13px",
                    padding: "10px 14px",
                    borderRadius: "6px",
                    background: "#F8FAFC",
                    border: "1px solid #F1F5F9",
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                    <div style={{
                      width: "26px",
                      height: "26px",
                      borderRadius: "6px",
                      background: i === 0 ? "#10B981" : "#E2E8F0",
                      color: i === 0 ? "#FFFFFF" : "#475569",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontWeight: 700,
                      fontSize: "11px",
                    }}>
                      #{i + 1}
                    </div>
                    <div>
                      <div style={{ fontWeight: 600, color: "#0F172A" }}>{p.name}</div>
                      <div style={{ fontSize: "11px", color: "#64748B" }}>
                        {p.quantity} {p.quantity === 1 ? "unit sold" : "units sold"}
                      </div>
                    </div>
                  </div>
                  <span style={{ fontWeight: 700, color: "#059669" }}>
                    {formatNaira(p.revenueMinor)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* ===================================================================
          BOTTOM SECTION: LIVE RECENT TRANSACTIONS LEDGER
          =================================================================== */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", paddingBottom: "14px", borderBottom: "1px solid #F1F5F9", flexWrap: "wrap", gap: "10px" }}>
          <div>
            <h2 style={{ fontSize: "15px", margin: 0, fontWeight: 600, color: "#0F172A" }}>
              Live Transactions Ledger
            </h2>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
              Synchronized with customer checkout sessions &amp; payment gateways
            </div>
          </div>
          <Link
            href="/admin/orders"
            style={{ fontSize: "12.5px", color: "#10B981", textDecoration: "none", fontWeight: 600 }}
          >
            Manage All Orders ↗
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          /* Enterprise Ledger Empty State */
          <div style={{
            display: "flex",
            flexDirection: "column",
            alignItems: "center",
            justifyContent: "center",
            padding: "48px 20px",
            textAlign: "center",
            background: "#F8FAFC",
            borderRadius: "8px",
            border: "1px dashed #CBD5E1",
          }}>
            <div style={{
              width: "52px",
              height: "52px",
              borderRadius: "12px",
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: "#94A3B8",
              marginBottom: "14px",
              boxShadow: "0 1px 3px rgba(0,0,0,0.02)"
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <rect x="2" y="5" width="20" height="14" rx="2" />
                <line x1="2" y1="10" x2="22" y2="10" />
              </svg>
            </div>
            <div style={{ fontSize: "14px", fontWeight: 600, color: "#0F172A" }}>
              No transactions logged yet
            </div>
            <div style={{ fontSize: "12px", color: "#64748B", maxWidth: "340px", margin: "4px 0 16px" }}>
              When shoppers complete a checkout order on the storefront, the transaction reference, payment status, and order total will populate this ledger.
            </div>
            <Link
              href="/"
              target="_blank"
              style={{
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                color: "#0F172A",
                padding: "8px 18px",
                borderRadius: "6px",
                fontSize: "12px",
                fontWeight: 600,
                textDecoration: "none",
                boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
              }}
            >
              Test Storefront Checkout ↗
            </Link>
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0", background: "#F8FAFC" }}>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Order ID</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Customer Email</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Date</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Status</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, textAlign: "right" }}>Total Amount</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const meta = statusLabel(o.status);
                  return (
                    <tr key={o.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      <td style={{ padding: "14px", fontFamily: "var(--font-mono)", fontSize: "12.5px", color: "#0F172A", fontWeight: 600 }}>
                        {o.orderNumber}
                      </td>
                      <td style={{ padding: "14px", color: "#334155" }}>{o.email}</td>
                      <td style={{ padding: "14px", color: "#64748B" }}>
                        {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td style={{ padding: "14px" }}>
                        <span style={{
                          color: meta.color,
                          background: meta.bg,
                          border: `1px solid ${meta.border}`,
                          fontSize: "11px",
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                          padding: "3px 9px",
                          borderRadius: "4px",
                          fontWeight: 600,
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "5px",
                        }}>
                          <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: meta.dot }} />
                          {meta.text}
                        </span>
                      </td>
                      <td style={{ padding: "14px", textAlign: "right", fontWeight: 700, color: "#0F172A" }}>
                        {formatNaira(o.totalMinor)}
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
