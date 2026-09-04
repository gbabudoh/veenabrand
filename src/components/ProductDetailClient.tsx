"use client";

import React, { useState } from "react";
import { useStore } from "@/lib/StoreContext";
import { formatNaira } from "@/lib/money";

interface ProductDetailClientProps {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    fabricCare: string;
    shippingReturnsNote: string;
    priceMinor: number;
    category: { id: string; name: string; slug: string } | null;
    gender: string;
    colors: { name: string; hex: string }[];
    media: { url: string; label: string | null; type: string }[];
    reviews: { id: string; authorName: string; rating: number; text: string; createdAt: Date }[];
  };
}

const SIZES = ["XS", "S", "M", "L", "XL"];

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart, openModal, toggleChat } = useStore();

  // Media view states
  const [mediaIdx, setMediaIdx] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string | null>("description");

  const selectedColor = product.colors[colorIdx] || product.colors[0];
  const activeMedia = product.media[mediaIdx] || product.media[0];

  const handleAddToBag = () => {
    const size = selectedSize || "M"; // Default to M if not chosen
    addToCart(product.id, size, selectedColor?.name || "Ivory");
    
    // Smoothly open checkout bag or show success
    alert(`Added ${product.name} (Size ${size}, ${selectedColor?.name}) to your Bag!`);
  };

  const handleTabToggle = (tab: string) => {
    setActiveTab((prev) => (prev === tab ? null : tab));
  };

  const swatchStyle = (hex: string, active: boolean) => ({
    width: "26px",
    height: "26px",
    borderRadius: "50%",
    background: hex,
    display: "inline-block",
    cursor: "pointer",
    border: `2px solid ${active ? "#15130F" : "rgba(21, 19, 15, 0.15)"}`,
    boxSizing: "border-box" as const,
    transition: "all 0.2s ease"
  });

  const sizeStyle = (size: string, active: boolean) => ({
    width: "38px",
    height: "38px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    fontSize: "12.5px",
    border: `1px solid ${active ? "#15130F" : "rgba(21, 19, 15, 0.25)"}`,
    background: active ? "#15130F" : "transparent",
    color: active ? "#F6F2EA" : "#15130F",
    cursor: "pointer",
    borderRadius: "2px",
    transition: "all 0.2s ease"
  });

  return (
    <div className="container-max" style={{ padding: "36px 24px 110px" }}>
      {/* Breadcrumbs */}
      <div style={{ fontSize: "12px", color: "rgba(21, 19, 15, 0.5)", marginBottom: "24px", letterSpacing: "0.02em" }}>
        {product.gender === "WOMEN" ? "Women" : "Men"} / {product.category?.name || "All Pieces"} / {product.name}
      </div>

      {/* Main PDP Grid */}
      <div style={{
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
        gap: "40px",
        alignItems: "start"
      }}>
        {/* Left Gallery Section: Thumbnail rail + main viewer */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "64px 1fr",
          gap: "16px"
        }}>
          {/* Thumbnails list */}
          <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
            {product.media.map((m, i) => {
              const isVideo = m.type === "VIDEO";
              const isSelected = i === mediaIdx;
              const colorHex = selectedColor?.hex || "#EEE7D8";

              return (
                <div
                  key={m.label}
                  onClick={() => setMediaIdx(i)}
                  style={{
                    position: "relative",
                    aspectRatio: "1/1",
                    borderRadius: "2px",
                    cursor: "pointer",
                    background: `linear-gradient(160deg, ${colorHex} 0%, #15130F 180%)`,
                    outline: isSelected ? "2px solid #15130F" : "none",
                    outlineOffset: "2px",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    border: "1px solid rgba(21, 19, 15, 0.15)",
                    transition: "all 0.2s ease"
                  }}
                >
                  <span style={{ fontSize: "8px", color: "rgba(21, 19, 15, 0.45)", fontWeight: "bold" }}>
                    {isVideo ? "VID" : "IMG"} {i + 1}
                  </span>
                  {isVideo && (
                    <div style={{ position: "absolute", bottom: "3px", right: "3px", fontSize: "8px", background: "#15130F", color: "#fff", borderRadius: "2px", padding: "1px 3px" }}>
                      ▶
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Main Visual Viewer Panel */}
          <div style={{
            position: "relative",
            aspectRatio: "4/5",
            borderRadius: "3px",
            overflow: "hidden",
            background: `linear-gradient(160deg, ${selectedColor?.hex || "#EEE7D8"} 0%, #15130F 180%)`,
            border: "1px solid rgba(21, 19, 15, 0.1)"
          }}>
            <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(120deg, rgba(21, 19, 15, 0.04) 0 2px, transparent 2px 26px)" }}></div>
            
            {/* Viewer labels */}
            <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "8px", color: "rgba(21, 19, 15, 0.4)", fontFamily: "var(--font-mono)", fontSize: "12px", fontWeight: "bold" }}>
              <span>{(activeMedia?.label || "").toUpperCase()}</span>
            </div>

            {activeMedia?.type === "VIDEO" && (
              <button style={{ position: "absolute", top: "50%", left: "50%", transform: "translate(-50%, -50%)", width: "64px", height: "64px", borderRadius: "50%", background: "rgba(246, 242, 234, 0.92)", border: "none", fontSize: "20px", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center", paddingLeft: "4px", boxShadow: "0 8px 24px rgba(0,0,0,0.15)" }}>
                ▶
              </button>
            )}

            <span style={{ position: "absolute", top: "16px", left: "16px", background: "rgba(246, 242, 234, 0.92)", fontSize: "10px", letterSpacing: "0.06em", textTransform: "uppercase", padding: "5px 10px", borderRadius: "999px", fontWeight: 500, border: "1px solid rgba(21, 19, 15, 0.08)" }}>
              {activeMedia?.type === "VIDEO" ? "Video Teaser" : "Photography"}
            </span>
          </div>
        </div>

        {/* Right Info Section */}
        <div style={{ maxWidth: "460px" }}>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", margin: "0 0 8px", fontWeight: 500 }}>
            {product.name}
          </h1>
          <div style={{ fontSize: "17px", color: "rgba(21, 19, 15, 0.75)", marginBottom: "20px", fontWeight: 500 }}>
            {formatNaira(product.priceMinor)}
          </div>

          {/* Color swatches selector */}
          <div style={{ marginBottom: "22px" }}>
            <div style={{ fontSize: "12.5px", color: "rgba(21, 19, 15, 0.5)", marginBottom: "10px", fontWeight: 500 }}>
              Colour — {selectedColor?.name}
            </div>
            <div style={{ display: "flex", gap: "9px" }}>
              {product.colors.map((c, i) => (
                <span
                  key={c.name}
                  onClick={() => setColorIdx(i)}
                  style={swatchStyle(c.hex, i === colorIdx)}
                  title={c.name}
                ></span>
              ))}
            </div>
          </div>

          {/* Size selector swatches */}
          <div style={{ marginBottom: "26px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px", fontSize: "12.5px" }}>
              <span style={{ color: "rgba(21, 19, 15, 0.5)", fontWeight: 500 }}>Size</span>
              <span style={{ textDecoration: "underline", cursor: "pointer", color: "rgba(21, 19, 15, 0.6)" }}>
                Size guide
              </span>
            </div>
            <div style={{ display: "flex", gap: "8px" }}>
              {SIZES.map((sz) => (
                <span
                  key={sz}
                  onClick={() => setSelectedSize(sz)}
                  style={sizeStyle(sz, selectedSize === sz)}
                >
                  {sz}
                </span>
              ))}
            </div>
          </div>

          {/* Checkout/ATC action button */}
          <button
            onClick={handleAddToBag}
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
              marginBottom: "12px",
              fontWeight: 600
            }}
          >
            Add to Bag — {formatNaira(product.priceMinor)}
          </button>

          {/* Custom Modals Hooks Triggers */}
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px", marginBottom: "26px" }}>
            <button
              onClick={() => openModal("tryon", { productId: product.id })}
              style={{ border: "1px solid #15130F", background: "none", padding: "13px", fontSize: "11.5px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px", fontWeight: 600 }}
            >
              Try It On
            </button>
            <button
              onClick={() => openModal("adjustment", { productId: product.id })}
              style={{ border: "1px solid #15130F", background: "none", padding: "13px", fontSize: "11.5px", letterSpacing: "0.05em", textTransform: "uppercase", cursor: "pointer", borderRadius: "2px", fontWeight: 600 }}
            >
              Request Adjustment
            </button>
          </div>
          
          <div
            onClick={() => openModal("bespoke", { productId: product.id })}
            style={{
              border: "1px dashed #1F5C42",
              color: "#1F5C42",
              padding: "14px",
              fontSize: "12px",
              textAlign: "center",
              cursor: "pointer",
              borderRadius: "2px",
              marginBottom: "26px",
              fontWeight: 500,
              background: "rgba(31, 92, 66, 0.02)"
            }}
          >
            Want this reimagined in your own fabric or fit? <u>Request Bespoke →</u>
          </div>

          {/* Accordion Tabs */}
          <div style={{ borderTop: "1px solid rgba(21, 19, 15, 0.12)" }}>
            {[
              { id: "description", label: "Description", text: product.description },
              { id: "fabric", label: "Fabric & Care", text: product.fabricCare },
              { id: "shipping", label: "Shipping & Returns", text: product.shippingReturnsNote }
            ].map((tab) => {
              const isOpen = activeTab === tab.id;
              return (
                <div key={tab.id}>
                  <div
                    onClick={() => handleTabToggle(tab.id)}
                    style={{ display: "flex", justifyContent: "space-between", padding: "16px 0", cursor: "pointer", fontSize: "13.5px", fontWeight: 500 }}
                  >
                    <span>{tab.label}</span>
                    <span>{isOpen ? "−" : "+"}</span>
                  </div>
                  {isOpen && (
                    <div style={{ padding: "0 0 16px", fontSize: "13px", lineHeight: 1.7, color: "rgba(21, 19, 15, 0.65)" }}>
                      {tab.text}
                    </div>
                  )}
                  <div style={{ borderBottom: "1px solid rgba(21, 19, 15, 0.12)" }}></div>
                </div>
              );
            })}
          </div>

          {/* Chat shortcut */}
          <div
            onClick={toggleChat}
            style={{ marginTop: "22px", fontSize: "12.5px", color: "var(--color-emerald)", cursor: "pointer", fontWeight: 500 }}
          >
            💬 Ask Veena about this piece
          </div>
        </div>
      </div>

      {/* Customer Reviews Section */}
      <section style={{ marginTop: "90px", maxWidth: "820px" }}>
        <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "24px", margin: "0 0 26px", fontWeight: 500 }}>
          Customer fittings &amp; reviews
        </h2>
        {product.reviews.length === 0 ? (
          <div style={{ color: "rgba(21,19,15,0.5)", fontSize: "13.5px" }}>
            No reviews yet. Be the first to share your fit!
          </div>
        ) : (
          product.reviews.map((r) => (
            <div key={r.id} style={{ padding: "20px 0", borderBottom: "1px solid rgba(21, 19, 15, 0.1)" }}>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "8px", fontSize: "13.5px" }}>
                <span style={{ fontWeight: 600 }}>{r.authorName}</span>
                <span style={{ color: "var(--color-emerald)" }}>{"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}</span>
              </div>
              <p style={{ fontSize: "13.5px", lineHeight: 1.7, color: "rgba(21, 19, 15, 0.7)", margin: 0 }}>
                {r.text}
              </p>
            </div>
          ))
        )}
      </section>
    </div>
  );
}
