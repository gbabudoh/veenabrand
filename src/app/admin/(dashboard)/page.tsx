"use client";

import React, { useState, useEffect } from "react";
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

  useEffect(() => {
    async function fetchAnalytics() {
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
    }
    fetchAnalytics();
  }, []);

  if (loading) {
    return <div style={{ color: "rgba(246,242,234,0.6)", fontSize: "14px" }}>Loading system analytics...</div>;
  }

  if (error || !data) {
    return <div style={{ color: "#e6746c", fontSize: "14px" }}>{error || "Failed to load dashboard"}</div>;
  }

  const { metrics, statusDistribution, topProducts, recentOrders } = data;

  const cardStyle = {
    background: "#15130F",
    border: "1px solid rgba(246, 242, 234, 0.08)",
    borderRadius: "4px",
    padding: "24px",
  };

  const statusLabel = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT": return { text: "Pending Pay", color: "#c8a2c8" };
      case "PAID": return { text: "Paid", color: "#77aaff" };
      case "IN_PRODUCTION": return { text: "In Production", color: "#ffaa44" };
      case "FULFILLED": return { text: "Fulfilled", color: "#1F5C42" };
      case "CANCELLED": return { text: "Cancelled", color: "#e6746c" };
      default: return { text: status, color: "#999" };
    }
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: "34px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "30px", margin: 0, fontWeight: 500 }}>
          Overview
        </h1>
        <div style={{ fontSize: "13px", color: "rgba(246, 242, 234, 0.5)", marginTop: "4px" }}>
          Real-time platform sales performance and operational logs
        </div>
      </div>

      {/* Aggregate metrics grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: "20px", marginBottom: "40px" }}>
        <div style={cardStyle}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", color: "rgba(246, 242, 234, 0.45)", letterSpacing: "0.06em", fontWeight: 600 }}>
            Total Revenue
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "32px", fontWeight: 500, color: "var(--color-emerald)", marginTop: "10px" }}>
            {formatNaira(metrics.totalRevenueMinor)}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(246, 242, 234, 0.35)", marginTop: "8px" }}>
            Excludes pending &amp; cancelled sales
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", color: "rgba(246, 242, 234, 0.45)", letterSpacing: "0.06em", fontWeight: 600 }}>
            Total Orders
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "32px", fontWeight: 500, color: "#F6F2EA", marginTop: "10px" }}>
            {metrics.ordersCount}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(246, 242, 234, 0.35)", marginTop: "8px" }}>
            All lifetime customer requests
          </div>
        </div>

        <div style={cardStyle}>
          <div style={{ fontSize: "11px", textTransform: "uppercase", color: "rgba(246, 242, 234, 0.45)", letterSpacing: "0.06em", fontWeight: 600 }}>
            Registered Customers
          </div>
          <div style={{ fontFamily: "var(--font-serif)", fontSize: "32px", fontWeight: 500, color: "#F6F2EA", marginTop: "10px" }}>
            {metrics.customersCount}
          </div>
          <div style={{ fontSize: "11px", color: "rgba(246, 242, 234, 0.35)", marginTop: "8px" }}>
            Excludes backend administration accounts
          </div>
        </div>
      </div>

      {/* Main analytics panels */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: "28px", marginBottom: "40px" }}>
        
        {/* Status Distribution Breakdown */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: "16px", margin: "0 0 20px", fontWeight: 600, borderBottom: "1px solid rgba(246,242,234,0.08)", paddingBottom: "12px" }}>
            Order States Allocation
          </h2>
          <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
            {[
              { status: "PENDING_PAYMENT", label: "Pending Payment" },
              { status: "PAID", label: "Paid Orders" },
              { status: "IN_PRODUCTION", label: "Atelier Production" },
              { status: "FULFILLED", label: "Fulfilled / Shipped" },
              { status: "CANCELLED", label: "Cancelled" },
            ].map((item) => {
              const count = (statusDistribution as any)[item.status] || 0;
              const meta = statusLabel(item.status);
              return (
                <div key={item.status} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13.5px" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: "8px" }}>
                    <span style={{ width: "8px", height: "8px", borderRadius: "50%", background: meta.color }}></span>
                    <span>{item.label}</span>
                  </span>
                  <span style={{ fontWeight: "bold", background: "rgba(246,242,234,0.06)", padding: "2px 8px", borderRadius: "3px" }}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Top Selling Products */}
        <div style={cardStyle}>
          <h2 style={{ fontSize: "16px", margin: "0 0 20px", fontWeight: 600, borderBottom: "1px solid rgba(246,242,234,0.08)", paddingBottom: "12px" }}>
            Top Selling Pieces
          </h2>
          {topProducts.length === 0 ? (
            <div style={{ fontSize: "13px", color: "rgba(246,242,234,0.4)", padding: "10px 0" }}>No records yet. Place an order to generate metrics.</div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              {topProducts.map((p, i) => (
                <div key={i} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "13.5px" }}>
                  <div>
                    <div style={{ fontWeight: 500 }}>{p.name}</div>
                    <div style={{ fontSize: "11px", color: "rgba(246, 242, 234, 0.4)", marginTop: "2px" }}>
                      Qty: {p.quantity} units
                    </div>
                  </div>
                  <span style={{ fontWeight: 600, color: "var(--color-emerald)" }}>
                    {formatNaira(p.revenueMinor)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

      </div>

      {/* Recent Orders Log Sheet */}
      <div style={cardStyle}>
        <h2 style={{ fontSize: "16px", margin: "0 0 20px", fontWeight: 600, borderBottom: "1px solid rgba(246,242,234,0.08)", paddingBottom: "12px" }}>
          Recent Transactions
        </h2>
        {recentOrders.length === 0 ? (
          <div style={{ fontSize: "13px", color: "rgba(246,242,234,0.4)", padding: "20px 0", textAlign: "center" }}>No transactions logged.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(246,242,234,0.08)" }}>
                  <th style={{ padding: "12px 10px", color: "rgba(246,242,234,0.45)" }}>Order ID</th>
                  <th style={{ padding: "12px 10px", color: "rgba(246,242,234,0.45)" }}>Customer Email</th>
                  <th style={{ padding: "12px 10px", color: "rgba(246,242,234,0.45)" }}>Date</th>
                  <th style={{ padding: "12px 10px", color: "rgba(246,242,234,0.45)" }}>Status</th>
                  <th style={{ padding: "12px 10px", color: "rgba(246,242,234,0.45)", textAlign: "right" }}>Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.map((o) => {
                  const meta = statusLabel(o.status);
                  return (
                    <tr key={o.id} style={{ borderBottom: "1px solid rgba(246,242,234,0.04)" }}>
                      <td style={{ padding: "14px 10px", fontFamily: "var(--font-mono)", fontSize: "12.5px" }}>{o.orderNumber}</td>
                      <td style={{ padding: "14px 10px" }}>{o.email}</td>
                      <td style={{ padding: "14px 10px", color: "rgba(246,242,234,0.6)" }}>
                        {new Date(o.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                      </td>
                      <td style={{ padding: "14px 10px" }}>
                        <span style={{
                          color: meta.color,
                          background: `rgba(246, 242, 234, 0.05)`,
                          fontSize: "11px",
                          letterSpacing: "0.03em",
                          textTransform: "uppercase",
                          padding: "3px 8px",
                          borderRadius: "2px",
                          fontWeight: 600,
                          border: `1px solid ${meta.color}33`,
                        }}>
                          {meta.text}
                        </span>
                      </td>
                      <td style={{ padding: "14px 10px", textAlign: "right", fontWeight: 600 }}>{formatNaira(o.totalMinor)}</td>
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
