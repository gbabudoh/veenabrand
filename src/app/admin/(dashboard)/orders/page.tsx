"use client";

import React, { useState, useEffect } from "react";
import { formatNaira } from "@/lib/money";

interface OrderItem {
  id: string;
  productId: string;
  size: string;
  colorName: string;
  quantity: number;
  unitPriceMinor: number;
  product: {
    name: string;
    slug: string;
  };
}

interface Order {
  id: string;
  orderNumber: string;
  email: string;
  subtotalMinor: number;
  deliveryFeeMinor: number;
  totalMinor: number;
  deliveryMethod: string;
  pickupStoreId: string | null;
  shippingAddress: string | null;
  paymentMethod: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
}

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [updating, setUpdating] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState("");

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (res.ok) {
        const data = await res.json();
        setOrders(data.orders);
        if (selectedOrder) {
          const fresh = data.orders.find((o: Order) => o.id === selectedOrder.id);
          if (fresh) setSelectedOrder(fresh);
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    setUpdating(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus }),
      });

      if (res.ok) {
        await fetchOrders();
      } else {
        alert("Failed to update status");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setUpdating(null);
    }
  };

  const filteredOrders = orders.filter((o) => {
    const term = searchTerm.toLowerCase();
    return (
      o.orderNumber.toLowerCase().includes(term) ||
      o.email.toLowerCase().includes(term) ||
      o.status.toLowerCase().includes(term)
    );
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT":
        return { label: "Pending Payment", color: "#7C3AED", bg: "#F5F3FF", border: "#DDD6FE", dot: "#8B5CF6" };
      case "PAID":
        return { label: "Paid", color: "#2563EB", bg: "#EFF6FF", border: "#BFDBFE", dot: "#3B82F6" };
      case "IN_PRODUCTION":
        return { label: "Atelier Production", color: "#D97706", bg: "#FFFBEB", border: "#FDE68A", dot: "#F59E0B" };
      case "FULFILLED":
        return { label: "Fulfilled / Shipped", color: "#059669", bg: "#ECFDF5", border: "#A7F3D0", dot: "#10B981" };
      case "CANCELLED":
        return { label: "Cancelled", color: "#DC2626", bg: "#FEF2F2", border: "#FECACA", dot: "#EF4444" };
      default:
        return { label: status, color: "#64748B", bg: "#F1F5F9", border: "#E2E8F0", dot: "#94A3B8" };
    }
  };

  return (
    <div style={{ maxWidth: "100%" }}>
      {/* Page Title & Search Filter */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "28px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "#0F172A", margin: 0, fontWeight: 600 }}>
            Orders &amp; Sales
          </h1>
          <div style={{ fontSize: "13.5px", color: "#64748B", marginTop: "4px" }}>
            Track order fulfillment pipelines and manage client dispatch details
          </div>
        </div>
        <div style={{ position: "relative" }}>
          <input
            type="text"
            placeholder="Search by order ID, email, status..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            style={{
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: "6px",
              color: "#0F172A",
              padding: "9px 14px 9px 34px",
              fontSize: "13px",
              width: "300px",
              outline: "none",
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
            }}
          />
          <svg
            width="15"
            height="15"
            viewBox="0 0 24 24"
            fill="none"
            stroke="#94A3B8"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{ position: "absolute", left: "11px", top: "11px" }}
          >
            <circle cx="11" cy="11" r="8" />
            <line x1="21" y1="21" x2="16.65" y2="16.65" />
          </svg>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedOrder ? "1.4fr 1fr" : "1fr", gap: "24px", alignItems: "start" }}>
        {/* Orders Table Container */}
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "10px",
          padding: "20px 24px",
          boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
        }}>
          {loading ? (
            <div style={{ color: "#64748B", padding: "40px 0", textAlign: "center", fontSize: "13.5px" }}>
              Querying orders registry...
            </div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ color: "#94A3B8", padding: "48px 0", textAlign: "center", fontSize: "13.5px" }}>
              No matching transactions recorded.
            </div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid #E2E8F0", background: "#F8FAFC" }}>
                    <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Order ID</th>
                    <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Client Email</th>
                    <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Total</th>
                    <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Status</th>
                    <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, textAlign: "right" }}>Update</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => {
                    const badge = getStatusBadge(o.status);
                    const isSelected = selectedOrder?.id === o.id;

                    return (
                      <tr
                        key={o.id}
                        onClick={() => setSelectedOrder(o)}
                        style={{
                          borderBottom: "1px solid #F1F5F9",
                          cursor: "pointer",
                          background: isSelected ? "#F1F5F9" : "transparent",
                          transition: "background 0.1s ease",
                        }}
                      >
                        <td style={{ padding: "14px", fontFamily: "var(--font-mono)", fontSize: "12.5px", fontWeight: 600, color: "#0F172A" }}>
                          {o.orderNumber}
                        </td>
                        <td style={{ padding: "14px", color: "#334155" }}>{o.email}</td>
                        <td style={{ padding: "14px", fontWeight: 700, color: "#0F172A" }}>{formatNaira(o.totalMinor)}</td>
                        <td style={{ padding: "14px" }}>
                          <span style={{
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "5px",
                            background: badge.bg,
                            color: badge.color,
                            border: `1px solid ${badge.border}`,
                            fontSize: "11px",
                            fontWeight: 600,
                            padding: "3px 8px",
                            borderRadius: "4px",
                          }}>
                            <span style={{ width: "5px", height: "5px", borderRadius: "50%", background: badge.dot }} />
                            {badge.label}
                          </span>
                        </td>
                        <td style={{ padding: "14px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                          <select
                            value={o.status}
                            disabled={updating === o.id}
                            onChange={(e) => handleStatusChange(o.id, e.target.value)}
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
                            <option value="PENDING_PAYMENT">Pending Pay</option>
                            <option value="PAID">Paid</option>
                            <option value="IN_PRODUCTION">Atelier</option>
                            <option value="FULFILLED">Fulfilled</option>
                            <option value="CANCELLED">Cancelled</option>
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

        {/* Selected Order Detail Sidebar Panel */}
        {selectedOrder && (
          <div style={{
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            borderRadius: "10px",
            padding: "24px",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", margin: 0, fontWeight: 600, color: "#0F172A" }}>
                Order Summary
              </h2>
              <button
                type="button"
                onClick={() => setSelectedOrder(null)}
                style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: "16px" }}
              >
                ✕
              </button>
            </div>

            {/* General details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "10px 0", fontSize: "12.5px", marginBottom: "24px" }}>
              <span style={{ color: "#64748B" }}>Order ID</span>
              <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)", color: "#0F172A" }}>{selectedOrder.orderNumber}</span>

              <span style={{ color: "#64748B" }}>Placed Date</span>
              <span style={{ color: "#334155" }}>{new Date(selectedOrder.createdAt).toLocaleString()}</span>

              <span style={{ color: "#64748B" }}>Client Email</span>
              <span style={{ color: "#334155" }}>{selectedOrder.email}</span>

              <span style={{ color: "#64748B" }}>Delivery Method</span>
              <span style={{ color: "#334155" }}>{selectedOrder.deliveryMethod.replace(/_/g, " ")}</span>

              <span style={{ color: "#64748B" }}>Destination</span>
              {selectedOrder.deliveryMethod === "PICKUP" ? (
                <span style={{ color: "#334155" }}>Flagship VI Atelier Store</span>
              ) : (
                <span style={{ fontSize: "12px", lineHeight: 1.4, color: "#334155" }}>
                  {(() => {
                    try {
                      const addr = JSON.parse(selectedOrder.shippingAddress || "{}");
                      return `${addr.line1 || ""}, ${addr.city || ""}, ${addr.state || ""}, ${addr.country || ""}`;
                    } catch (e) {
                      return selectedOrder.shippingAddress || "N/A";
                    }
                  })()}
                </span>
              )}

              <span style={{ color: "#64748B" }}>Payment Method</span>
              <span style={{ color: "#334155" }}>{selectedOrder.paymentMethod.replace(/_/g, " ")}</span>
            </div>

            {/* Items detail list */}
            <div style={{ borderTop: "1px solid #F1F5F9", paddingTop: "18px" }}>
              <h3 style={{ fontSize: "13.5px", margin: "0 0 14px", fontWeight: 600, color: "#0F172A" }}>Cart Pieces</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                {selectedOrder.items.map((it) => (
                  <div key={it.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: "12.5px", padding: "8px 10px", background: "#F8FAFC", borderRadius: "6px" }}>
                    <div>
                      <div style={{ fontWeight: 600, color: "#0F172A" }}>{it.product?.name}</div>
                      <div style={{ fontSize: "11px", color: "#64748B", marginTop: "2px" }}>
                        Colour: {it.colorName} · Size: {it.size} · Qty: {it.quantity}
                      </div>
                    </div>
                    <span style={{ fontWeight: 600, color: "#0F172A" }}>{formatNaira(it.unitPriceMinor * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing aggregates summary */}
            <div style={{ borderTop: "1px solid #F1F5F9", marginTop: "20px", paddingTop: "14px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "12.5px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B" }}>
                <span>Subtotal</span>
                <span style={{ color: "#0F172A" }}>{formatNaira(selectedOrder.subtotalMinor)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "#64748B" }}>
                <span>Delivery Fee</span>
                <span style={{ color: "#0F172A" }}>{formatNaira(selectedOrder.deliveryFeeMinor)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: "14px", borderTop: "1px solid #F1F5F9", paddingTop: "10px", marginTop: "4px" }}>
                <span style={{ color: "#0F172A" }}>Total Amount</span>
                <span style={{ color: "#059669" }}>{formatNaira(selectedOrder.totalMinor)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
