"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useStore } from "@/lib/StoreContext";
import { formatNaira } from "@/lib/money";

type Step = "bag" | "delivery" | "payment" | "confirm";
type DeliveryMethod = "PICKUP" | "NEXT_DAY_LAGOS" | "TWO_THREE_DAY_NIGERIA" | "OUT_OF_LAGOS" | "INTERNATIONAL";
type PaymentMethod = "CARD" | "BANK_TRANSFER" | "PAY_ON_DELIVERY";

const DELIVERY_OPTIONS = [
  { key: "PICKUP", label: "Pickup — Veena Flagship, Victoria Island", eta: "Ready in 2 hours", price: 0, text: "Free" },
  { key: "NEXT_DAY_LAGOS", label: "Next-Day Delivery (Lagos)", eta: "Arrives tomorrow", price: 350000, text: "₦3,500" },
  { key: "TWO_THREE_DAY_NIGERIA", label: "2–3 Day Delivery (Nigeria)", eta: "Anywhere else in Nigeria", price: 500000, text: "₦5,000" },
  { key: "OUT_OF_LAGOS", label: "Out-of-Lagos Delivery", eta: "3–5 business days", price: 750000, text: "₦7,500" },
  { key: "INTERNATIONAL", label: "International Delivery", eta: "7–14 business days", price: 0, text: "$45 flat" }
];

export default function CheckoutPage() {
  const { cart, updateCartItemQty, removeFromCart, refreshCart } = useStore();
  const [step, setStep] = useState<Step>("bag");
  const [deliveryMethod, setDeliveryMethod] = useState<DeliveryMethod>("NEXT_DAY_LAGOS");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("CARD");
  
  // Form states
  const [email, setEmail] = useState("");
  const [addressLine, setAddressLine] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Nigeria");
  const [promoCode, setPromoCode] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<any>(null);

  // Credit Card input states
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry] = useState("");
  const [cvc, setCvc] = useState("");

  const cartItems = cart?.items || [];
  const subtotalMinor = cartItems.reduce((sum, item) => sum + item.product.priceMinor * item.quantity, 0);

  const selectedDelivery = DELIVERY_OPTIONS.find((opt) => opt.key === deliveryMethod) || DELIVERY_OPTIONS[1];
  const deliveryFeeMinor = selectedDelivery.price;

  const totalMinor = subtotalMinor + deliveryFeeMinor;
  const isIntl = deliveryMethod === "INTERNATIONAL";

  const handlePlaceOrder = async () => {
    if (!email) {
      alert("Please enter a valid email address.");
      return;
    }
    
    setSubmitting(true);
    try {
      const payload: any = {
        email,
        deliveryMethod,
        paymentMethod
      };

      if (deliveryMethod === "PICKUP") {
        payload.pickupStoreId = "flagship-vi";
      } else {
        payload.shippingAddress = {
          line1: addressLine || "Victoria Island",
          city: city || "Lagos",
          state: state || "Lagos",
          country: country || "Nigeria"
        };
      }

      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      });

      if (res.ok) {
        const data = await res.json();
        setOrder(data.order);
        setStep("confirm");
        await refreshCart(); // Refresh cart status
      } else {
        const err = await res.json();
        alert(err.error || "Order placement failed.");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleApplyPromo = (e: React.FormEvent) => {
    e.preventDefault();
    alert("Promo code applied successfully!");
  };

  // Header stepper style helper
  const stepItemStyle = (s: Step, active: boolean) => ({
    display: "flex",
    alignItems: "center",
    gap: "10px",
    cursor: "pointer",
    paddingRight: "28px",
    opacity: active ? 1 : 0.5,
    transition: "opacity 0.2s ease"
  });

  const stepDotStyle = (active: boolean) => ({
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12px",
    background: active ? "#15130F" : "transparent",
    color: active ? "#F6F2EA" : "#15130F",
    border: "1px solid #15130F",
    fontWeight: 600
  });

  return (
    <div className="container-checkout" style={{ padding: "50px 24px 120px" }}>
      <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "32px", margin: "0 0 34px", fontWeight: 500 }}>
        Checkout
      </h1>

      {/* Stepper progress */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", marginBottom: "46px" }}>
        {[
          { key: "bag", label: "Bag", num: "1" },
          { key: "delivery", label: "Delivery", num: "2" },
          { key: "payment", label: "Payment", num: "3" },
          { key: "confirm", label: "Confirmation", num: "4" }
        ].map((st) => {
          const active = step === st.key;
          return (
            <div
              key={st.key}
              onClick={() => step !== "confirm" && setStep(st.key as Step)}
              style={stepItemStyle(st.key as Step, active)}
            >
              <span style={stepDotStyle(active)}>{st.num}</span>
              <span style={{ fontSize: "12.5px", letterSpacing: "0.04em", textTransform: "uppercase", fontWeight: 600 }}>
                {st.label}
              </span>
            </div>
          );
        })}
      </div>

      <div style={{
        display: "grid",
        gridTemplateColumns: step === "confirm" ? "1fr" : "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "60px",
        alignItems: "start"
      }}>
        {/* Left Column Forms */}
        <div>
          {/* STEP 1: BAG */}
          {step === "bag" && (
            <div>
              {cartItems.length === 0 ? (
                <div style={{ padding: "40px 0", color: "rgba(21,19,15,0.5)" }}>
                  Your Bag is empty. <Link href="/products" style={{ textDecoration: "underline" }}>Shop our collection</Link>
                </div>
              ) : (
                <div>
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      style={{
                        display: "grid",
                        gridTemplateColumns: "96px 1fr auto",
                        gap: "18px",
                        padding: "20px 0",
                        borderBottom: "1px solid rgba(21, 19, 15, 0.1)",
                        alignItems: "center"
                      }}
                    >
                      <div style={{
                        width: "96px",
                        height: "120px",
                        borderRadius: "3px",
                        background: `linear-gradient(160deg, ${item.product.category === "Runway" ? "#1F5C42" : "#e7ddc9"} 0%, #15130F 180%)`,
                        border: "1px solid rgba(21, 19, 15, 0.1)"
                      }}></div>
                      <div>
                        <div style={{ fontSize: "14.5px", fontWeight: 500, marginBottom: "4px" }}>{item.product.name}</div>
                        <div style={{ fontSize: "12.5px", color: "rgba(21, 19, 15, 0.5)", marginBottom: "12px" }}>
                          {item.colorName} · Size {item.size}
                        </div>
                        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                          <button
                            onClick={() => updateCartItemQty(item.id, Math.max(1, item.quantity - 1))}
                            style={{ width: "26px", height: "26px", border: "1px solid rgba(21, 19, 15, 0.25)", background: "none", cursor: "pointer", borderRadius: "2px" }}
                          >
                            –
                          </button>
                          <span style={{ fontSize: "13px" }}>{item.quantity}</span>
                          <button
                            onClick={() => updateCartItemQty(item.id, item.quantity + 1)}
                            style={{ width: "26px", height: "26px", border: "1px solid rgba(21, 19, 15, 0.25)", background: "none", cursor: "pointer", borderRadius: "2px" }}
                          >
                            +
                          </button>
                          <span
                            onClick={() => removeFromCart(item.id)}
                            style={{ fontSize: "12px", textDecoration: "underline", color: "rgba(21, 19, 15, 0.5)", cursor: "pointer", marginLeft: "8px" }}
                          >
                            Remove
                          </span>
                        </div>
                      </div>
                      <div style={{ fontSize: "14.5px", fontWeight: 500 }}>
                        {formatNaira(item.product.priceMinor * item.quantity)}
                      </div>
                    </div>
                  ))}

                  <form onSubmit={handleApplyPromo} style={{ display: "flex", gap: "10px", marginTop: "24px" }}>
                    <input
                      type="text"
                      placeholder="Promo code"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value)}
                      style={{ flex: 1, border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", outline: "none", background: "#fff" }}
                    />
                    <button
                      type="submit"
                      style={{ border: "1px solid #15130F", background: "none", padding: "12px 20px", fontSize: "12px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px", fontWeight: 600 }}
                    >
                      Apply
                    </button>
                  </form>
                  
                  <button
                    onClick={() => setStep("delivery")}
                    style={{ width: "100%", background: "#15130F", color: "#F6F2EA", border: "none", padding: "16px", fontSize: "12.5px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px", marginTop: "30px", fontWeight: 600 }}
                  >
                    Continue to Delivery
                  </button>
                </div>
              )}
            </div>
          )}

          {/* STEP 2: DELIVERY */}
          {step === "delivery" && (
            <div>
              <div style={{ marginBottom: "24px" }}>
                <input
                  type="email"
                  placeholder="Email address (for order updates)"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  style={{ width: "100%", border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", outline: "none", background: "#fff", marginBottom: "10px" }}
                />
              </div>

              <div style={{ fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(21, 19, 15, 0.5)", marginBottom: "14px", fontWeight: 600 }}>
                Pickup
              </div>
              <div
                onClick={() => setDeliveryMethod("PICKUP")}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  padding: "16px 18px",
                  border: `1px solid ${deliveryMethod === "PICKUP" ? "#15130F" : "rgba(21, 19, 15, 0.15)"}`,
                  background: deliveryMethod === "PICKUP" ? "rgba(21, 19, 15, 0.04)" : "transparent",
                  borderRadius: "3px",
                  cursor: "pointer",
                  marginBottom: "10px",
                  transition: "all 0.2s ease"
                }}
              >
                <div>
                  <div style={{ fontSize: "14px", fontWeight: 500 }}>Pickup — Veena Flagship, Victoria Island</div>
                  <div style={{ fontSize: "12px", color: "rgba(21, 19, 15, 0.5)", marginTop: "3px" }}>Ready in 2 hours</div>
                </div>
                <span style={{ fontSize: "13.5px", fontWeight: 600 }}>Free</span>
              </div>

              <div style={{ fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(21, 19, 15, 0.5)", margin: "30px 0 14px", fontWeight: 600 }}>
                Shipping
              </div>
              {DELIVERY_OPTIONS.filter((opt) => opt.key !== "PICKUP").map((d) => {
                const isActive = deliveryMethod === d.key;
                return (
                  <div
                    key={d.key}
                    onClick={() => setDeliveryMethod(d.key as DeliveryMethod)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 18px",
                      border: `1px solid ${isActive ? "#15130F" : "rgba(21, 19, 15, 0.15)"}`,
                      background: isActive ? "rgba(21, 19, 15, 0.04)" : "transparent",
                      borderRadius: "3px",
                      cursor: "pointer",
                      marginBottom: "10px",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <div>
                      <div style={{ fontSize: "14px", fontWeight: 500 }}>{d.label}</div>
                      <div style={{ fontSize: "12px", color: "rgba(21, 19, 15, 0.5)", marginTop: "3px" }}>{d.eta}</div>
                    </div>
                    <span style={{ fontSize: "13.5px", fontWeight: 600 }}>{d.text}</span>
                  </div>
                );
              })}

              {deliveryMethod !== "PICKUP" && (
                <div style={{ marginTop: "24px", display: "grid", gridTemplateColumns: "1fr", gap: "12px" }}>
                  <div style={{ fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(21, 19, 15, 0.5)", marginBottom: "4px", fontWeight: 600 }}>
                    Shipping Address
                  </div>
                  <input
                    type="text"
                    placeholder="Address Line 1"
                    required
                    value={addressLine}
                    onChange={(e) => setAddressLine(e.target.value)}
                    style={{ border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", outline: "none", background: "#fff" }}
                  />
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                    <input
                      type="text"
                      placeholder="City"
                      required
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      style={{ border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", outline: "none", background: "#fff" }}
                    />
                    <input
                      type="text"
                      placeholder="State"
                      required
                      value={state}
                      onChange={(e) => setState(e.target.value)}
                      style={{ border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", outline: "none", background: "#fff" }}
                    />
                  </div>
                  <input
                    type="text"
                    placeholder="Country"
                    required
                    value={country}
                    onChange={(e) => setCountry(e.target.value)}
                    style={{ border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", outline: "none", background: "#fff" }}
                  />
                </div>
              )}

              <button
                onClick={() => setStep("payment")}
                style={{ width: "100%", background: "#15130F", color: "#F6F2EA", border: "none", padding: "16px", fontSize: "12.5px", letterSpacing: "0.08em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px", marginTop: "30px", fontWeight: 600 }}
              >
                Continue to Payment
              </button>
            </div>
          )}

          {/* STEP 3: PAYMENT */}
          {step === "payment" && (
            <div>
              <div style={{ fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(21, 19, 15, 0.5)", marginBottom: "14px", fontWeight: 600 }}>
                Payment Method
              </div>

              {[
                { key: "CARD", label: "Debit / Credit Card" },
                { key: "BANK_TRANSFER", label: "Bank Transfer" },
                { key: "PAY_ON_DELIVERY", label: "Pay on Delivery (Lagos only)" }
              ].map((pm) => {
                const isActive = paymentMethod === pm.key;
                return (
                  <div
                    key={pm.key}
                    onClick={() => setPaymentMethod(pm.key as PaymentMethod)}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      padding: "16px 18px",
                      border: `1px solid ${isActive ? "#15130F" : "rgba(21, 19, 15, 0.15)"}`,
                      background: isActive ? "rgba(21, 19, 15, 0.04)" : "transparent",
                      borderRadius: "3px",
                      cursor: "pointer",
                      marginBottom: "10px",
                      transition: "all 0.2s ease"
                    }}
                  >
                    <span style={{ fontSize: "14px", fontWeight: 500 }}>{pm.label}</span>
                    <span style={{
                      width: "16px",
                      height: "16px",
                      borderRadius: "50%",
                      border: "1px solid #15130F",
                      display: "inline-block",
                      background: isActive ? "radial-gradient(circle, #15130F 0 40%, transparent 42%)" : "transparent"
                    }}></span>
                  </div>
                );
              })}

              {paymentMethod === "CARD" && (
                <div style={{ marginTop: "26px", display: "grid", gridTemplateColumns: "1fr 1fr", gap: "12px" }}>
                  <input
                    type="text"
                    placeholder="Card number"
                    required
                    value={cardNumber}
                    onChange={(e) => setCardNumber(e.target.value)}
                    style={{ gridColumn: "span 2", border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", outline: "none", background: "#fff" }}
                  />
                  <input
                    type="text"
                    placeholder="MM / YY"
                    required
                    value={expiry}
                    onChange={(e) => setExpiry(e.target.value)}
                    style={{ border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", outline: "none", background: "#fff" }}
                  />
                  <input
                    type="text"
                    placeholder="CVC"
                    required
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    style={{ border: "1px solid rgba(21, 19, 15, 0.2)", padding: "12px 14px", fontSize: "13px", borderRadius: "2px", outline: "none", background: "#fff" }}
                  />
                </div>
              )}

              {paymentMethod === "BANK_TRANSFER" && (
                <div style={{ padding: "18px", background: "rgba(21, 19, 15, 0.04)", border: "1px solid rgba(21, 19, 15, 0.1)", borderRadius: "3px", fontSize: "13px", lineHeight: 1.6, marginTop: "26px" }}>
                  <strong>VEENA BANK TRANSFER DETAIL:</strong><br />
                  GTBank · 0124810245 · Veena Fashion Atelier House<br />
                  Please email transfer slip to billing@veena.fashion.
                </div>
              )}

              <button
                onClick={handlePlaceOrder}
                disabled={submitting}
                style={{
                  width: "100%",
                  background: "#15130F",
                  color: "#F6F2EA",
                  border: "none",
                  padding: "16px",
                  fontSize: "12.5px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  cursor: "pointer",
                  borderRadius: "2px",
                  marginTop: "30px",
                  fontWeight: 600,
                  opacity: submitting ? 0.6 : 1
                }}
              >
                {submitting ? "Placing Order..." : `Place Order — ${formatNaira(totalMinor)}${isIntl ? " + $45" : ""}`}
              </button>
            </div>
          )}

          {/* STEP 4: CONFIRMATION */}
          {step === "confirm" && order && (
            <div style={{ textAlign: "center", padding: "60px 0" }}>
              <div style={{ width: "64px", height: "64px", borderRadius: "50%", background: "#1F5C42", color: "#fff", display: "flex", alignItems: "center", justifyContent: "center", fontSize: "26px", margin: "0 auto 24px" }}>
                ✓
              </div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "26px", margin: "0 0 12px", fontWeight: 500 }}>
                Order confirmed
              </h2>
              <p style={{ fontSize: "14px", color: "rgba(21, 19, 15, 0.6)", margin: "0 0 30px" }}>
                Order #{order.orderNumber} · A confirmation has been sent to {order.email}
              </p>
              <Link
                href="/products"
                style={{
                  fontSize: "12.5px",
                  letterSpacing: "0.06em",
                  textTransform: "uppercase",
                  borderBottom: "1px solid #15130F",
                  paddingBottom: "2px",
                  fontWeight: 600,
                  color: "#15130F"
                }}
              >
                Continue shopping
              </Link>
            </div>
          )}
        </div>

        {/* Right Column Order Summary (Don't show on confirmation step) */}
        {step !== "confirm" && (
          <div style={{ background: "#EEE7D8", borderRadius: "4px", padding: "28px", alignSelf: "flex-start" }}>
            <div style={{ fontSize: "13px", letterSpacing: "0.06em", textTransform: "uppercase", marginBottom: "20px", fontWeight: 600 }}>
              Order Summary
            </div>
            
            {/* Brief list of checkout items */}
            <div style={{ display: "flex", flexDirection: "column", gap: "10px", marginBottom: "18px" }}>
              {cartItems.map((it) => (
                <div key={it.id} style={{ display: "flex", justifyContent: "space-between", fontSize: "13px", color: "rgba(21,19,15,0.7)" }}>
                  <span>{it.product.name} (x{it.quantity})</span>
                  <span>{formatNaira(it.product.priceMinor * it.quantity)}</span>
                </div>
              ))}
            </div>

            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", marginBottom: "10px" }}>
              <span>Subtotal</span>
              <span>{formatNaira(subtotalMinor)}</span>
            </div>
            <div style={{ display: "flex", justifyContent: "space-between", fontSize: "13.5px", marginBottom: "10px" }}>
              <span>Delivery</span>
              <span>{isIntl ? "$45 flat" : formatNaira(deliveryFeeMinor)}</span>
            </div>
            <div style={{ borderTop: "1px solid rgba(21, 19, 15, 0.15)", margin: "14px 0", paddingTop: "14px", display: "flex", justifyContent: "space-between", fontSize: "15px", fontWeight: 600 }}>
              <span>Total</span>
              <span>{formatNaira(totalMinor)}{isIntl ? " + $45" : ""}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
