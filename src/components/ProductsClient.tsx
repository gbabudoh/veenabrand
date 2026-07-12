"use client";

import React, { useState, useEffect } from "react";
import { useStore } from "@/lib/StoreContext";
import ProductCard from "@/components/ProductCard";

interface ProductsClientProps {
  products: any[];
  initialGender: "WOMEN" | "MEN";
}

const CATEGORIES = ["All", "Tops", "Outerwear", "Bottoms"];
const COLORS = [
  { name: "Ivory", hex: "#e7ddc9" },
  { name: "Emerald", hex: "#1F5C42" },
  { name: "Espresso", hex: "#4a3f31" },
];

export default function ProductsClient({ products, initialGender }: ProductsClientProps) {
  const { gender, setGender } = useStore();
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [selectedColor, setSelectedColor] = useState<string | null>(null);

  // Sync global store gender with initial URL gender
  useEffect(() => {
    if (initialGender !== gender) {
      setGender(initialGender);
    }
  }, [initialGender]);

  // Client-side filtering logic
  const filteredProducts = products.filter((p) => {
    // 1. Category Filter
    if (selectedCategory !== "All") {
      const nameLower = p.name.toLowerCase();
      if (selectedCategory === "Tops") {
        const isTop = nameLower.includes("blouse") || nameLower.includes("blazer") || nameLower.includes("agbada");
        if (!isTop) return false;
      } else if (selectedCategory === "Outerwear") {
        const isOuter = nameLower.includes("overcoat") || nameLower.includes("blazer");
        if (!isOuter) return false;
      } else if (selectedCategory === "Bottoms") {
        const isBottom = nameLower.includes("trouser");
        if (!isBottom) return false;
      }
    }

    // 2. Color Filter
    if (selectedColor) {
      const hasColor = p.colors.some((c: any) => c.name.toLowerCase() === selectedColor.toLowerCase());
      if (!hasColor) return false;
    }

    return true;
  });

  return (
    <div className="container-max" style={{ padding: "44px 24px 100px" }}>
      {/* Breadcrumbs */}
      <div style={{ fontSize: "12px", color: "rgba(21, 19, 15, 0.5)", marginBottom: "18px", letterSpacing: "0.02em" }}>
        {gender === "WOMEN" ? "Women" : "Men"} / New Arrivals
      </div>

      {/* PLP Title Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "40px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "36px", margin: 0, fontWeight: 500 }}>
          {gender === "WOMEN" ? "Women" : "Men"}'s New Arrivals
        </h1>
        <div style={{ fontSize: "13px", color: "rgba(21, 19, 15, 0.6)" }}>
          {filteredProducts.length} items
        </div>
      </div>

      {/* Main Grid: Sidebar + Product Grid */}
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "48px" }}>
        {/* Filter Sidebar */}
        <aside style={{ maxWidth: "240px" }}>
          <div style={{ fontSize: "12px", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: "16px", fontWeight: 600 }}>
            Filter
          </div>

          {/* Category Filters */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "12.5px", color: "rgba(21, 19, 15, 0.5)", marginBottom: "10px", fontWeight: 500 }}>
              Category
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
              {CATEGORIES.map((cat) => {
                const isActive = selectedCategory === cat;
                return (
                  <div
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    style={{
                      fontSize: "13.5px",
                      cursor: "pointer",
                      color: isActive ? "var(--color-emerald)" : "rgba(21, 19, 15, 0.75)",
                      fontWeight: isActive ? 600 : 400,
                      transition: "color 0.2s ease"
                    }}
                  >
                    {cat}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Color Filters */}
          <div style={{ marginBottom: "28px" }}>
            <div style={{ fontSize: "12.5px", color: "rgba(21, 19, 15, 0.5)", marginBottom: "10px", fontWeight: 500 }}>
              Color
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "8px" }}>
              {COLORS.map((c) => {
                const isActive = selectedColor === c.name;
                return (
                  <span
                    key={c.name}
                    onClick={() => setSelectedColor(isActive ? null : c.name)}
                    title={c.name}
                    style={{
                      width: "24px",
                      height: "24px",
                      borderRadius: "50%",
                      background: c.hex,
                      display: "inline-block",
                      cursor: "pointer",
                      border: `2px solid ${isActive ? "#15130F" : "rgba(21, 19, 15, 0.15)"}`,
                      boxSizing: "border-box",
                      transition: "all 0.2s ease"
                    }}
                  ></span>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter (Display Only) */}
          <div>
            <div style={{ fontSize: "12.5px", color: "rgba(21, 19, 15, 0.5)", marginBottom: "10px", fontWeight: 500 }}>
              Price
            </div>
            <div style={{ fontSize: "13px", color: "rgba(21, 19, 15, 0.7)" }}>
              ₦0 — ₦550,000
            </div>
          </div>
        </aside>

        {/* Product Grid */}
        <div style={{ gridColumn: "span 3" }}>
          {filteredProducts.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "rgba(21,19,15,0.5)" }}>
              No pieces match your current filters.
            </div>
          ) : (
            <div style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(250px, 1fr))",
              gap: "28px"
            }}>
              {filteredProducts.map((p) => (
                <div key={p.id} style={{ position: "relative" }}>
                  <ProductCard product={p} />
                  {/* Hover visual tag for Image + Video format */}
                  <span style={{
                    position: "absolute",
                    top: "14px",
                    right: "14px",
                    background: "rgba(246, 242, 234, 0.9)",
                    borderRadius: "999px",
                    padding: "5px 9px",
                    fontSize: "9.5px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    pointerEvents: "none",
                    border: "1px solid rgba(21, 19, 15, 0.08)",
                    fontWeight: 500
                  }}>
                    Image + Video
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
