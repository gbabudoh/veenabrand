"use client";

import React, { useState, useMemo } from "react";
import Link from "next/link";
import ProductCard from "@/components/ProductCard";
import type { NavCategory } from "@/lib/category-utils";

interface ProductsClientProps {
  products: any[];
  categories: NavCategory[];
  activeDepartment?: string | null;
  activeCategory: { name: string; slug: string } | null;
  searchQuery?: string | null;
}

const LUXURY_COLORS = [
  { name: "Ivory", hex: "#E7DDC9" },
  { name: "Emerald", hex: "#1F5C42" },
  { name: "Espresso", hex: "#4A3F31" },
  { name: "Obsidian", hex: "#111827" },
  { name: "Gold", hex: "#D4AF37" },
  { name: "Terracotta", hex: "#C26343" },
  { name: "Navy", hex: "#1E293B" },
  { name: "Rose", hex: "#E2B4BD" },
];

const PRICE_TIERS = [
  { id: "all", label: "All Prices", min: 0, max: Infinity },
  { id: "under-100", label: "Under ₦100,000", min: 0, max: 10000000 },
  { id: "100-250", label: "₦100,000 — ₦250,000", min: 10000000, max: 25000000 },
  { id: "250-450", label: "₦250,000 — ₦450,000", min: 25000000, max: 45000000 },
  { id: "450-plus", label: "₦450,000 & Above", min: 45000000, max: Infinity },
];

const CORE_DEPARTMENTS = [
  { id: "women", label: "Women", slug: "women" },
  { id: "men", label: "Men", slug: "men" },
  { id: "accessories", label: "Accessories", slug: "accessories" },
  { id: "lifestyle", label: "Lifestyle", slug: "lifestyle" },
  { id: "bespoke", label: "Bespoke", slug: "bespoke" },
];

export default function ProductsClient({
  products,
  categories,
  activeDepartment,
  activeCategory,
  searchQuery,
}: ProductsClientProps) {
  const [selectedColor, setSelectedColor] = useState<string | null>(null);
  const [selectedPriceTier, setSelectedPriceTier] = useState<string>("all");
  const [sortBy, setSortBy] = useState<"NEWEST" | "PRICE_ASC" | "PRICE_DESC" | "NAME">("NEWEST");
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [expandedDepts, setExpandedDepts] = useState<Record<string, boolean>>({
    women: true,
    men: true,
    accessories: true,
    lifestyle: true,
    bespoke: true,
  });

  const toggleDeptExpand = (id: string) => {
    setExpandedDepts((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  // Filter products by selected color & price tier
  const filteredProducts = useMemo(() => {
    let result = products.filter((p) => {
      // Color filter
      if (selectedColor) {
        const matchesColor = p.colors?.some((c: any) =>
          c.name?.toLowerCase().includes(selectedColor.toLowerCase())
        );
        if (!matchesColor) return false;
      }

      // Price filter
      const activeTier = PRICE_TIERS.find((t) => t.id === selectedPriceTier);
      if (activeTier && activeTier.id !== "all") {
        const price = p.priceMinor || 0;
        if (price < activeTier.min || price > activeTier.max) return false;
      }

      return true;
    });

    // Sorting
    result = [...result].sort((a, b) => {
      if (sortBy === "PRICE_ASC") return (a.priceMinor || 0) - (b.priceMinor || 0);
      if (sortBy === "PRICE_DESC") return (b.priceMinor || 0) - (a.priceMinor || 0);
      if (sortBy === "NAME") return a.name.localeCompare(b.name);
      return new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime();
    });

    return result;
  }, [products, selectedColor, selectedPriceTier, sortBy]);

  // Dynamic editorial headline & subtitle
  const departmentInfo = useMemo(() => {
    switch (activeDepartment) {
      case "women":
        return {
          title: activeCategory ? `Women — ${activeCategory.name}` : "Women's Collection",
          eyebrow: "Women's Atelier",
          desc: "Fluid silhouettes, ceremonial bubus, and structured silk tailoring.",
        };
      case "men":
        return {
          title: activeCategory ? `Men — ${activeCategory.name}` : "Men's Collection",
          eyebrow: "Men's Atelier",
          desc: "Architectural two-piece sets, artisanal suits, and relaxed luxury cuts.",
        };
      case "accessories":
        return {
          title: activeCategory ? `Accessories — ${activeCategory.name}` : "Accessories Atelier",
          eyebrow: "Finishing Accents",
          desc: "Handcrafted brass adornments, sculptural earrings, and bespoke leather goods.",
        };
      case "lifestyle":
        return {
          title: activeCategory ? `Lifestyle — ${activeCategory.name}` : "Lifestyle & Sanctuary",
          eyebrow: "Living with Veena",
          desc: "Artisanal woven throws, decorative pillows, and hand-poured atelier candles.",
        };
      case "bespoke":
        return {
          title: activeCategory ? `Bespoke — ${activeCategory.name}` : "Bespoke Atelier",
          eyebrow: "Private Commissions",
          desc: "One-of-one ceremonial pieces, bridal couture, and custom-tailored silhouettes.",
        };
      default:
        return {
          title: activeCategory ? activeCategory.name : "The Complete Atelier",
          eyebrow: "Veena Collection",
          desc: "Explore handcrafted garments, adornments, and lifestyle pieces.",
        };
    }
  }, [activeDepartment, activeCategory]);

  // Construct href helper
  const getDeptHref = (deptSlug: string | null) => {
    if (!deptSlug) return "/products";
    return `/products?department=${deptSlug}`;
  };

  const getCategoryHref = (deptSlug: string, catSlug: string) => {
    return `/products?department=${deptSlug}&category=${catSlug}`;
  };

  // Find department roots in categories tree
  const departmentTrees = useMemo(() => {
    const map: Record<string, NavCategory> = {};
    for (const root of categories) {
      map[root.slug.toLowerCase()] = root;
    }
    return map;
  }, [categories]);

  const hasActiveFilters = Boolean(
    activeDepartment ||
    activeCategory ||
    selectedColor ||
    selectedPriceTier !== "all" ||
    searchQuery
  );

  return (
    <div className="container-max" style={{ padding: "40px 24px 100px" }}>
      {/* Editorial Breadcrumbs */}
      <nav aria-label="Breadcrumb" style={{ marginBottom: "16px" }}>
        <ol style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          listStyle: "none",
          padding: 0,
          margin: 0,
          fontSize: "12px",
          color: "rgba(21, 19, 15, 0.5)",
          letterSpacing: "0.04em",
          textTransform: "uppercase"
        }}>
          <li>
            <Link href="/" style={{ color: "inherit", textDecoration: "none" }} className="hover:underline">
              Home
            </Link>
          </li>
          <li>/</li>
          <li>
            <Link href="/products" style={{ color: activeDepartment ? "inherit" : "var(--color-ink)", fontWeight: activeDepartment ? 400 : 600 }}>
              Atelier
            </Link>
          </li>
          {activeDepartment && (
            <>
              <li>/</li>
              <li>
                <Link
                  href={getDeptHref(activeDepartment)}
                  style={{ color: activeCategory ? "inherit" : "var(--color-ink)", fontWeight: activeCategory ? 400 : 600 }}
                >
                  {activeDepartment.toUpperCase()}
                </Link>
              </li>
            </>
          )}
          {activeCategory && (
            <>
              <li>/</li>
              <li style={{ color: "var(--color-emerald)", fontWeight: 600 }}>
                {activeCategory.name}
              </li>
            </>
          )}
        </ol>
      </nav>

      {/* PLP Hero Header */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "flex-end",
        borderBottom: "1px solid rgba(21, 19, 15, 0.08)",
        paddingBottom: "24px",
        marginBottom: "32px",
        flexWrap: "wrap",
        gap: "18px"
      }}>
        <div>
          <div style={{
            fontSize: "11px",
            letterSpacing: "0.12em",
            textTransform: "uppercase",
            color: "var(--color-emerald)",
            fontWeight: 600,
            marginBottom: "6px"
          }}>
            {departmentInfo.eyebrow}
          </div>
          <h1 style={{
            fontFamily: "var(--font-serif)",
            fontSize: "clamp(28px, 4vw, 40px)",
            color: "var(--color-ink)",
            margin: "0 0 8px 0",
            fontWeight: 500,
            lineHeight: 1.15
          }}>
            {departmentInfo.title}
          </h1>
          <p style={{
            fontSize: "13.5px",
            color: "rgba(21, 19, 15, 0.65)",
            margin: 0,
            maxWidth: "600px"
          }}>
            {departmentInfo.desc}
          </p>
        </div>

        {/* View Controls & Sort */}
        <div style={{ display: "flex", alignItems: "center", gap: "16px", flexWrap: "wrap" }}>
          <div style={{
            fontSize: "12.5px",
            color: "rgba(21, 19, 15, 0.55)",
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            padding: "6px 12px",
            borderRadius: "999px",
            fontWeight: 500
          }}>
            {filteredProducts.length} {filteredProducts.length === 1 ? "Piece" : "Pieces"}
          </div>

          {/* Sorter */}
          <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
            <label htmlFor="plp-sort" style={{ fontSize: "12px", color: "rgba(21, 19, 15, 0.55)", textTransform: "uppercase", letterSpacing: "0.04em" }}>
              Sort:
            </label>
            <select
              id="plp-sort"
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              style={{
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "4px",
                padding: "6px 10px",
                fontSize: "12.5px",
                color: "#0F172A",
                cursor: "pointer",
                outline: "none"
              }}
            >
              <option value="NEWEST">Newest Additions</option>
              <option value="PRICE_ASC">Price: Low to High</option>
              <option value="PRICE_DESC">Price: High to Low</option>
              <option value="NAME">Name: A to Z</option>
            </select>
          </div>
        </div>
      </div>

      {/* Mobile Filter Toggle */}
      <button
        className="vn-plp__filter-toggle"
        onClick={() => setFiltersOpen((v) => !v)}
        aria-expanded={filtersOpen}
        style={{
          display: "none",
          width: "100%",
          padding: "12px",
          background: "#FFFFFF",
          border: "1px solid #CBD5E1",
          borderRadius: "6px",
          fontWeight: 600,
          fontSize: "13px",
          marginBottom: "20px",
          cursor: "pointer"
        }}
      >
        <span>{filtersOpen ? "Hide Filters" : "Filter Collection"}</span>
        <span style={{ marginLeft: "8px", color: "var(--color-emerald)" }}>
          ({filteredProducts.length})
        </span>
      </button>

      {/* Main PLP Layout */}
      <div className="vn-plp">
        {/* =========================================================================
            ENTERPRISE STORE SIDEBAR FILTERS
            ========================================================================= */}
        <aside className="vn-plp__aside" data-open={filtersOpen}>
          {/* Active Filter Chips Strip */}
          {hasActiveFilters && (
            <div style={{
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "6px",
              padding: "12px",
              marginBottom: "24px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "8px" }}>
                <span style={{ fontSize: "11px", textTransform: "uppercase", letterSpacing: "0.06em", color: "#64748B", fontWeight: 600 }}>
                  Active Filters
                </span>
                <Link
                  href="/products"
                  onClick={() => {
                    setSelectedColor(null);
                    setSelectedPriceTier("all");
                  }}
                  style={{ fontSize: "11.5px", color: "#EF4444", textDecoration: "none", fontWeight: 500 }}
                >
                  Clear All
                </Link>
              </div>

              <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                {activeDepartment && (
                  <Link
                    href="/products"
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "999px",
                      padding: "2px 8px",
                      fontSize: "11.5px",
                      color: "#0F172A",
                      textDecoration: "none"
                    }}
                  >
                    <span>Dept: {activeDepartment}</span>
                    <span style={{ color: "#94A3B8" }}>×</span>
                  </Link>
                )}

                {activeCategory && (
                  <Link
                    href={getDeptHref(activeDepartment || null)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#ECFDF5",
                      border: "1px solid #A7F3D0",
                      borderRadius: "999px",
                      padding: "2px 8px",
                      fontSize: "11.5px",
                      color: "#065F46",
                      textDecoration: "none",
                      fontWeight: 500
                    }}
                  >
                    <span>{activeCategory.name}</span>
                    <span style={{ color: "#059669" }}>×</span>
                  </Link>
                )}

                {selectedColor && (
                  <button
                    type="button"
                    onClick={() => setSelectedColor(null)}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "999px",
                      padding: "2px 8px",
                      fontSize: "11.5px",
                      color: "#0F172A",
                      cursor: "pointer"
                    }}
                  >
                    <span>Color: {selectedColor}</span>
                    <span style={{ color: "#94A3B8" }}>×</span>
                  </button>
                )}

                {selectedPriceTier !== "all" && (
                  <button
                    type="button"
                    onClick={() => setSelectedPriceTier("all")}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      background: "#FFFFFF",
                      border: "1px solid #CBD5E1",
                      borderRadius: "999px",
                      padding: "2px 8px",
                      fontSize: "11.5px",
                      color: "#0F172A",
                      cursor: "pointer"
                    }}
                  >
                    <span>{PRICE_TIERS.find((t) => t.id === selectedPriceTier)?.label}</span>
                    <span style={{ color: "#94A3B8" }}>×</span>
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Department Taxonomy Hierarchy */}
          <div className="vn-plp__filter-group">
            <div style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "12px",
              paddingBottom: "6px",
              borderBottom: "1px solid rgba(21, 19, 15, 0.08)"
            }}>
              <span style={{
                fontSize: "11.5px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                color: "#0F172A",
                fontWeight: 600
              }}>
                Departments
              </span>
              <Link
                href="/products"
                style={{
                  fontSize: "11.5px",
                  color: !activeDepartment && !activeCategory ? "var(--color-emerald)" : "#64748B",
                  fontWeight: !activeDepartment && !activeCategory ? 600 : 400,
                  textDecoration: "none"
                }}
              >
                All Pieces
              </Link>
            </div>

            {/* Core Department Branches */}
            <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
              {CORE_DEPARTMENTS.map((dept) => {
                const isDeptActive = activeDepartment === dept.slug;
                const isExpanded = expandedDepts[dept.slug] ?? true;
                const deptTree = departmentTrees[dept.slug];
                const subCategories = deptTree?.children || [];

                return (
                  <div
                    key={dept.id}
                    style={{
                      background: isDeptActive ? "#FFFFFF" : "transparent",
                      border: isDeptActive ? "1px solid #E2E8F0" : "1px solid transparent",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      transition: "all 0.15s ease"
                    }}
                  >
                    {/* Department Header Row */}
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                      <Link
                        href={getDeptHref(dept.slug)}
                        style={{
                          fontSize: "13.5px",
                          fontWeight: isDeptActive ? 600 : 500,
                          color: isDeptActive ? "var(--color-emerald)" : "var(--color-ink)",
                          textDecoration: "none",
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          padding: "4px 0"
                        }}
                      >
                        {isDeptActive && (
                          <span style={{
                            width: "5px",
                            height: "5px",
                            borderRadius: "50%",
                            background: "var(--color-emerald)"
                          }} />
                        )}
                        <span>{dept.label}</span>
                      </Link>

                      {subCategories.length > 0 && (
                        <button
                          type="button"
                          onClick={() => toggleDeptExpand(dept.slug)}
                          aria-label={`Toggle ${dept.label} subcategories`}
                          style={{
                            background: "none",
                            border: "none",
                            cursor: "pointer",
                            padding: "4px",
                            color: "#94A3B8",
                            display: "inline-flex",
                            alignItems: "center"
                          }}
                        >
                          <svg
                            width="10"
                            height="10"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            style={{
                              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
                              transition: "transform 0.15s ease"
                            }}
                          >
                            <polyline points="6 9 12 15 18 9" />
                          </svg>
                        </button>
                      )}
                    </div>

                    {/* Subcategories Tree */}
                    {isExpanded && subCategories.length > 0 && (
                      <div style={{
                        display: "flex",
                        flexDirection: "column",
                        gap: "2px",
                        paddingLeft: "12px",
                        marginTop: "4px",
                        marginBottom: "6px",
                        borderLeft: `1.5px solid ${isDeptActive ? "var(--color-emerald)" : "#E2E8F0"}`
                      }}>
                        {subCategories.map((sub) => {
                          const isCatActive = activeCategory?.slug === sub.slug;
                          return (
                            <Link
                              key={sub.id}
                              href={getCategoryHref(dept.slug, sub.slug)}
                              style={{
                                fontSize: "12.5px",
                                padding: "3px 6px",
                                borderRadius: "3px",
                                color: isCatActive ? "var(--color-emerald)" : "rgba(21, 19, 15, 0.7)",
                                fontWeight: isCatActive ? 600 : 400,
                                background: isCatActive ? "rgba(31, 92, 66, 0.06)" : "transparent",
                                textDecoration: "none",
                                display: "flex",
                                justifyContent: "space-between",
                                alignItems: "center",
                                transition: "all 0.12s ease"
                              }}
                            >
                              <span>{sub.name}</span>
                              {sub.name.toLowerCase() === "bubu" && (
                                <span style={{
                                  fontSize: "9px",
                                  textTransform: "uppercase",
                                  letterSpacing: "0.04em",
                                  background: "#ECFDF5",
                                  color: "#065F46",
                                  padding: "1px 5px",
                                  borderRadius: "4px",
                                  fontWeight: 600
                                }}>
                                  Signature
                                </span>
                              )}
                            </Link>
                          );
                        })}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>

          {/* Colorway Palette Filter */}
          <div className="vn-plp__filter-group">
            <div style={{
              fontSize: "11.5px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#0F172A",
              fontWeight: 600,
              marginBottom: "12px",
              paddingBottom: "6px",
              borderBottom: "1px solid rgba(21, 19, 15, 0.08)"
            }}>
              Colorway Palette
            </div>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "9px" }}>
              {LUXURY_COLORS.map((c) => {
                const isActive = selectedColor === c.name;
                return (
                  <button
                    key={c.name}
                    type="button"
                    onClick={() => setSelectedColor(isActive ? null : c.name)}
                    title={c.name}
                    aria-label={`Filter by color ${c.name}`}
                    aria-pressed={isActive}
                    style={{
                      width: "28px",
                      height: "28px",
                      borderRadius: "50%",
                      background: c.hex,
                      cursor: "pointer",
                      border: isActive ? "2px solid #0F172A" : "1px solid rgba(15, 23, 42, 0.15)",
                      boxShadow: isActive ? "0 0 0 2px rgba(15, 23, 42, 0.2)" : "none",
                      padding: 0,
                      position: "relative",
                      transition: "transform 0.15s ease, box-shadow 0.15s ease"
                    }}
                  >
                    {isActive && (
                      <span style={{
                        position: "absolute",
                        inset: 0,
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "center",
                        color: ["Obsidian", "Emerald", "Espresso", "Navy"].includes(c.name) ? "#FFFFFF" : "#0F172A",
                        fontSize: "12px",
                        fontWeight: "bold"
                      }}>
                        ✓
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Price Range Filter */}
          <div className="vn-plp__filter-group">
            <div style={{
              fontSize: "11.5px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "#0F172A",
              fontWeight: 600,
              marginBottom: "12px",
              paddingBottom: "6px",
              borderBottom: "1px solid rgba(21, 19, 15, 0.08)"
            }}>
              Price Range
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "5px" }}>
              {PRICE_TIERS.map((tier) => {
                const isSelected = selectedPriceTier === tier.id;
                return (
                  <button
                    key={tier.id}
                    type="button"
                    onClick={() => setSelectedPriceTier(tier.id)}
                    style={{
                      background: isSelected ? "#F1F5F9" : "transparent",
                      border: "none",
                      padding: "6px 8px",
                      borderRadius: "4px",
                      fontSize: "12.5px",
                      color: isSelected ? "#0F172A" : "#64748B",
                      fontWeight: isSelected ? 600 : 400,
                      textAlign: "left",
                      cursor: "pointer",
                      display: "flex",
                      alignItems: "center",
                      gap: "8px",
                      transition: "background 0.12s ease"
                    }}
                  >
                    <span style={{
                      width: "12px",
                      height: "12px",
                      borderRadius: "50%",
                      border: isSelected ? "4px solid var(--color-emerald)" : "1.5px solid #CBD5E1",
                      background: "#FFFFFF",
                      boxSizing: "border-box"
                    }} />
                    <span>{tier.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Atelier Services Mini Banner */}
          <div style={{
            background: "#F8FAFC",
            border: "1px solid #E2E8F0",
            borderRadius: "6px",
            padding: "14px",
            marginTop: "16px",
            fontSize: "12px",
            color: "#475569",
            lineHeight: 1.5
          }}>
            <div style={{ fontWeight: 600, color: "#0F172A", marginBottom: "4px" }}>
              Atelier Guarantee
            </div>
            Complimentary delivery in Lagos over ₦150,000. Each piece is crafted in limited batches to preserve bespoke artisanal integrity.
          </div>
        </aside>

        {/* =========================================================================
            PRODUCTS GRID & EMPTY STATES
            ========================================================================= */}
        <div>
          {filteredProducts.length === 0 ? (
            <div style={{
              background: "#FFFFFF",
              border: "1px solid #E2E8F0",
              borderRadius: "8px",
              padding: "72px 24px",
              textAlign: "center"
            }}>
              <div style={{
                width: "48px",
                height: "48px",
                borderRadius: "50%",
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                display: "inline-flex",
                alignItems: "center",
                justifyContent: "center",
                marginBottom: "16px",
                color: "#94A3B8"
              }}>
                <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                  <path d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                </svg>
              </div>
              <h3 style={{
                fontFamily: "var(--font-serif)",
                fontSize: "20px",
                color: "#0F172A",
                margin: "0 0 8px 0"
              }}>
                No Atelier Pieces Found
              </h3>
              <p style={{
                fontSize: "13.5px",
                color: "#64748B",
                maxWidth: "420px",
                margin: "0 auto 20px auto"
              }}>
                We couldn't find pieces matching the selected filters. Try broadening your category or clearing specific color and price selections.
              </p>
              <Link
                href="/products"
                onClick={() => {
                  setSelectedColor(null);
                  setSelectedPriceTier("all");
                }}
                style={{
                  display: "inline-block",
                  background: "#0F172A",
                  color: "#FFFFFF",
                  padding: "9px 20px",
                  borderRadius: "6px",
                  fontSize: "13px",
                  fontWeight: 600,
                  textDecoration: "none"
                }}
              >
                Browse All Pieces
              </Link>
            </div>
          ) : (
            <div className="vn-plp__grid">
              {filteredProducts.map((p) => {
                const hasVideo = p.media?.some((m: any) => m.type === "VIDEO");
                return (
                  <div key={p.id} style={{ position: "relative" }}>
                    <ProductCard product={p} />
                    {/* Visual Media Format Badge */}
                    <span style={{
                      position: "absolute",
                      top: "12px",
                      right: "12px",
                      background: "rgba(255, 255, 255, 0.92)",
                      backdropFilter: "blur(4px)",
                      borderRadius: "999px",
                      padding: "3px 8px",
                      fontSize: "9.5px",
                      letterSpacing: "0.06em",
                      textTransform: "uppercase",
                      pointerEvents: "none",
                      border: "1px solid rgba(15, 23, 42, 0.08)",
                      fontWeight: 600,
                      color: "#0F172A",
                      display: "inline-flex",
                      alignItems: "center",
                      gap: "4px",
                      boxShadow: "0 2px 6px rgba(0,0,0,0.04)"
                    }}>
                      {hasVideo ? (
                        <>
                          <span style={{ color: "var(--color-emerald)" }}>▶</span>
                          <span>Image + Video</span>
                        </>
                      ) : (
                        <span>Image</span>
                      )}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
