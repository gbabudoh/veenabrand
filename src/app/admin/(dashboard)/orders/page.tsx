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
        // Refresh selected order references if active
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

  const getStatusColor = (status: string) => {
    switch (status) {
      case "PENDING_PAYMENT": return "#c8a2c8";
      case "PAID": return "#77aaff";
      case "IN_PRODUCTION": return "#ffaa44";
      case "FULFILLED": return "#1F5C42";
      case "CANCELLED": return "#e6746c";
      default: return "#999";
    }
  };

  return (
    <div>
      {/* Page Title */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "34px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "30px", margin: 0, fontWeight: 500 }}>
            Orders Ledger
          </h1>
          <div style={{ fontSize: "13px", color: "rgba(246, 242, 234, 0.5)", marginTop: "4px" }}>
            Track order status and manage client shipping details
          </div>
        </div>
        <input
          type="text"
          placeholder="Search by order ID, email, status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{
            background: "#15130F",
            border: "1px solid rgba(246, 242, 234, 0.12)",
            borderRadius: "3px",
            color: "#F6F2EA",
            padding: "8px 14px",
            fontSize: "13px",
            width: "280px",
            outline: "none"
          }}
        />
      </div>

      <div style={{ display: "grid", gridTemplateColumns: selectedOrder ? "1.4fr 1fr" : "1fr", gap: "28px" }}>
        {/* Orders Table */}
        <div style={{
          background: "#15130F",
          border: "1px solid rgba(246, 242, 234, 0.08)",
          borderRadius: "4px",
          padding: "24px"
        }}>
          {loading ? (
            <div style={{ color: "rgba(246,242,234,0.5)" }}>Querying orders registry...</div>
          ) : filteredOrders.length === 0 ? (
            <div style={{ color: "rgba(246,242,234,0.4)" }}>No matching transactions found.</div>
          ) : (
            <div style={{ overflowX: "auto" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
                <thead>
                  <tr style={{ borderBottom: "1px solid rgba(246,242,234,0.08)" }}>
                    <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Order ID</th>
                    <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Client</th>
                    <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Total</th>
                    <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Status</th>
                    <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)", textAlign: "right" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOrders.map((o) => (
                    <tr
                      key={o.id}
                      onClick={() => setSelectedOrder(o)}
                      style={{
                        borderBottom: "1px solid rgba(246,242,234,0.04)",
                        cursor: "pointer",
                        background: selectedOrder?.id === o.id ? "rgba(246, 242, 234, 0.03)" : "transparent"
                      }}
                    >
                      <td style={{ padding: "14px 10px", fontFamily: "var(--font-mono)", fontWeight: 500 }}>{o.orderNumber}</td>
                      <td style={{ padding: "14px 10px" }}>{o.email}</td>
                      <td style={{ padding: "14px 10px", fontWeight: 600 }}>{formatNaira(o.totalMinor)}</td>
                      <td style={{ padding: "14px 10px" }}>
                        <span style={{
                          color: getStatusColor(o.status),
                          fontSize: "11px",
                          fontWeight: 600,
                          textTransform: "uppercase",
                          letterSpacing: "0.03em"
                        }}>
                          {o.status.replace("_", " ")}
                        </span>
                      </td>
                      <td style={{ padding: "14px 10px", textAlign: "right" }} onClick={(e) => e.stopPropagation()}>
                        <select
                          value={o.status}
                          disabled={updating === o.id}
                          onChange={(e) => handleStatusChange(o.id, e.target.value)}
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
                          <option value="PENDING_PAYMENT">Pending Pay</option>
                          <option value="PAID">Paid</option>
                          <option value="IN_PRODUCTION">Atelier</option>
                          <option value="FULFILLED">Fulfilled</option>
                          <option value="CANCELLED">Cancelled</option>
                        </select>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Selected Order Detail Sidebar Panel */}
        {selectedOrder && (
          <div style={{
            background: "#15130F",
            border: "1px solid rgba(246, 242, 234, 0.08)",
            borderRadius: "4px",
            padding: "24px",
            alignSelf: "start"
          }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid rgba(246,242,234,0.08)", paddingBottom: "12px", marginBottom: "20px" }}>
              <h2 style={{ fontSize: "16px", margin: 0, fontWeight: 600 }}>
                Order Details
              </h2>
              <button
                onClick={() => setSelectedOrder(null)}
                style={{ background: "none", border: "none", color: "rgba(246,242,234,0.4)", cursor: "pointer", fontSize: "16px" }}
              >
                ✕
              </button>
            </div>

            {/* General details */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1.2fr", gap: "10px 0", fontSize: "13px", color: "rgba(246,242,234,0.7)", marginBottom: "24px" }}>
              <span style={{ color: "rgba(246,242,234,0.4)" }}>Number</span>
              <span style={{ fontWeight: 600, fontFamily: "var(--font-mono)" }}>{selectedOrder.orderNumber}</span>

              <span style={{ color: "rgba(246,242,234,0.4)" }}>Date</span>
              <span>{new Date(selectedOrder.createdAt).toLocaleString()}</span>

              <span style={{ color: "rgba(246,242,234,0.4)" }}>Email</span>
              <span>{selectedOrder.email}</span>

              <span style={{ color: "rgba(246,242,234,0.4)" }}>Delivery Method</span>
              <span>{selectedOrder.deliveryMethod.replace(/_/g, " ")}</span>

              <span style={{ color: "rgba(246,242,234,0.4)" }}>Location</span>
              {selectedOrder.deliveryMethod === "PICKUP" ? (
                <span>Flagship VI Store</span>
              ) : (
                <span style={{ fontSize: "12px", lineHeight: 1.4 }}>
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

              <span style={{ color: "rgba(246,242,234,0.4)" }}>Payment Method</span>
              <span>{selectedOrder.paymentMethod.replace(/_/g, " ")}</span>
            </div>

            {/* Items detail list */}
            <div style={{ borderTop: "1px solid rgba(246,242,234,0.08)", paddingTop: "20px" }}>
              <h3 style={{ fontSize: "14px", margin: "0 0 14px", fontWeight: 600 }}>Cart Items</h3>
              <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                {selectedOrder.items.map((it) => (
                  <div key={it.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "12.5px" }}>
                    <div>
                      <div style={{ fontWeight: 500 }}>{it.product?.name}</div>
                      <div style={{ fontSize: "11px", color: "rgba(246,242,234,0.4)", marginTop: "2px" }}>
                        Colour: {it.colorName} · Size: {it.size} · Qty: {it.quantity}
                      </div>
                    </div>
                    <span style={{ fontWeight: 500 }}>{formatNaira(it.unitPriceMinor * it.quantity)}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Pricing aggregates summary */}
            <div style={{ borderTop: "1px solid rgba(246,242,234,0.08)", marginTop: "24px", paddingTop: "16px", display: "flex", flexDirection: "column", gap: "8px", fontSize: "13px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(246,242,234,0.6)" }}>
                <span>Subtotal</span>
                <span>{formatNaira(selectedOrder.subtotalMinor)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", color: "rgba(246,242,234,0.6)" }}>
                <span>Delivery Fee</span>
                <span>{formatNaira(selectedOrder.deliveryFeeMinor)}</span>
              </div>
              <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 600, fontSize: "14px", borderTop: "1px solid rgba(246,242,234,0.04)", paddingTop: "10px", marginTop: "4px" }}>
                <span>Total Amount</span>
                <span style={{ color: "var(--color-emerald)" }}>{formatNaira(selectedOrder.totalMinor)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
