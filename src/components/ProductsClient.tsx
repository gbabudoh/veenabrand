"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useStore } from "@/lib/StoreContext";
import ProductCard from "@/components/ProductCard";
import type { NavCategory } from "@/lib/category-utils";

interface ProductsClientProps {
  products: any[];
  initialGender: "WOMEN" | "MEN";
  categories: NavCategory[];
  activeCategory: { name: string; slug: string } | null;
}

const COLORS = [
  { name: "Ivory", hex: "#e7ddc9" },
  { name: "Emerald", hex: "#1F5C42" },
  { name: "Espresso", hex: "#4a3f31" },
];

export default function ProductsClient({
  products,
  initialGender,
  categories,
  activeCategory,
}: ProductsClientProps) {
  const { gender, setGender } = useStore();
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [filtersOpen, setFiltersOpen] = useState(false);

  // Sync global store gender with initial URL gender
  useEffect(() => {
    if (initialGender !== gender) {
      setGender(initialGender);
    }
  }, [initialGender]);

  // Category filtering happens on the server (so the URL is shareable);
  // colour is a cheap client-side pass over what came back.
  const filteredProducts = products.filter((p) => {
    if (!selectedColor) return true;
    return p.colors.some((c: any) => c.name.toLowerCase() === selectedColor.toLowerCase());
  });

  const genderLabel = gender === "WOMEN" ? "Women" : "Men";
  const href = (slug: string | null) =>
    slug ? `/products?gender=${gender}&category=${slug}` : `/products?gender=${gender}`;

  const categoryRow = (cat: NavCategory, isChild: boolean) => {
    const isActive = activeCategory?.slug === cat.slug;
    return (
      <Link
        key={cat.id}
        href={href(cat.slug)}
        className="vn-plp__filter"
        data-active={isActive}
        style={isChild ? { paddingLeft: "14px", fontSize: "13px" } : undefined}
      >
        {cat.name}
      </Link>
    );
  };

  const filterPanel = (
    <>
      <div className="vn-plp__filter-group">
        <div className="vn-plp__filter-title">Category</div>
        <div style={{ display: "flex", flexDirection: "column" }}>
          <Link href={href(null)} className="vn-plp__filter" data-active={!activeCategory}>
            All
          </Link>
          {categories.map((cat) => (
            <React.Fragment key={cat.id}>
              {categoryRow(cat, false)}
              {cat.children.map((child) => categoryRow(child, true))}
            </React.Fragment>
          ))}
        </div>
      </div>

      <div className="vn-plp__filter-group">
        <div className="vn-plp__filter-title">Color</div>
        <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
          {COLORS.map((c) => {
            const isActive = selectedColor === c.name;
            return (
              <button
                key={c.name}
                onClick={() => setSelectedColor(isActive ? null : c.name)}
                title={c.name}
                aria-label={c.name}
                aria-pressed={isActive}
                style={{
                  width: "30px",
                  height: "30px",
                  borderRadius: "50%",
                  background: c.hex,
                  cursor: "pointer",
                  border: `2px solid ${isActive ? "#15130F" : "rgba(21, 19, 15, 0.15)"}`,
                  boxSizing: "border-box",
                  transition: "all 0.2s ease",
                  padding: 0,
                }}
              />
            );
          })}
        </div>
      </div>

      <div className="vn-plp__filter-group">
        <div className="vn-plp__filter-title">Price</div>
        <div style={{ fontSize: "13px", color: "rgba(21, 19, 15, 0.7)" }}>₦0 — ₦550,000</div>
      </div>
    </>
  );

  return (
    <div className="container-max" style={{ padding: "44px 24px 100px" }}>
      {/* Breadcrumbs */}
      <div style={{ fontSize: "12px", color: "rgba(21, 19, 15, 0.5)", marginBottom: "18px", letterSpacing: "0.02em" }}>
        {genderLabel} / {activeCategory ? activeCategory.name : "All Pieces"}
      </div>

      {/* PLP title header */}
      <div className="vn-plp__head">
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "clamp(26px, 5vw, 36px)", margin: 0, fontWeight: 500 }}>
          {genderLabel}
          {activeCategory ? ` — ${activeCategory.name}` : "'s Collection"}
        </h1>
        <div style={{ fontSize: "13px", color: "rgba(21, 19, 15, 0.6)", whiteSpace: "nowrap" }}>
          {filteredProducts.length} item{filteredProducts.length === 1 ? "" : "s"}
        </div>
      </div>

      {/* Mobile filter toggle */}
      <button
        className="vn-plp__filter-toggle"
        onClick={() => setFiltersOpen((v) => !v)}
        aria-expanded={filtersOpen}
      >
        {filtersOpen ? "Hide filters" : "Filters"}
        {activeCategory ? ` · ${activeCategory.name}` : ""}
      </button>

      <div className="vn-plp">
        <aside className="vn-plp__aside" data-open={filtersOpen}>
          <div className="vn-plp__filter-title" style={{ letterSpacing: "0.08em", textTransform: "uppercase", fontWeight: 600, marginBottom: "16px" }}>
            Filter
          </div>
          {filterPanel}
        </aside>

        <div>
          {filteredProducts.length === 0 ? (
            <div style={{ padding: "60px 0", textAlign: "center", color: "rgba(21,19,15,0.5)" }}>
              No pieces match your current filters.
            </div>
          ) : (
            <div className="vn-plp__grid">
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
