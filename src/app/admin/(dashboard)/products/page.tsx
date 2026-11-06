"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatNaira } from "@/lib/money";
import MediaUploadButton from "@/components/admin/MediaUploadButton";

interface Variant {
  id: string;
  size: string;
  colorName: string;
  stock: number;
}

interface ProductColor {
  id: string;
  name: string;
  hex: string;
}

interface ProductMedia {
  id: string;
  type: string;
  url: string;
  label: string | null;
  sortOrder?: number;
}

interface CategoryOption {
  id: string;
  name: string;
  parentId: string | null;
  active: boolean;
}

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  fabricCare: string;
  shippingReturnsNote: string;
  gender: string;
  categoryId: string | null;
  category: { id: string; name: string; slug: string } | null;
  priceMinor: number;
  colors: ProductColor[];
  media: ProductMedia[];
  variants: Variant[];
}

interface MediaItemState {
  type: "IMAGE" | "VIDEO";
  url: string;
  label: string;
}

// Curated luxury fashion house presets
const LUXURY_PALETTE_PRESETS = [
  { name: "Imperial Emerald", hex: "#1F5C42" },
  { name: "Midnight Velvet", hex: "#0B132B" },
  { name: "Raw Silk Ivory", hex: "#E7DDC9" },
  { name: "Mulberry Wine", hex: "#5C1D24" },
  { name: "Terracotta Bronze", hex: "#C86D51" },
  { name: "Onyx Noir", hex: "#15130F" },
  { name: "Champagne Gold", hex: "#F7E7CE" },
  { name: "Sapphire Royal", hex: "#1A2A4A" },
  { name: "Dusty Rose", hex: "#C28E8C" },
  { name: "Sage Organza", hex: "#8A9A86" },
  { name: "Rich Ochre", hex: "#C68B29" },
  { name: "Amethyst Dusk", hex: "#4E2A4F" },
  { name: "Silver Chiffon", hex: "#D6D5D2" },
  { name: "Burnt Copper", hex: "#A74828" },
  { name: "Cerulean Crepe", hex: "#264653" },
  { name: "Porcelain White", hex: "#FAF8F5" },
];

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isCreating, setIsCreating] = useState(false);
  const [saving, setSaving] = useState(false);
  const [activeFormTab, setActiveFormTab] = useState<"details" | "media" | "craft" | "colors">("details");

  // Filters & Search
  const [searchTerm, setSearchTerm] = useState("");
  const [genderFilter, setGenderFilter] = useState<"ALL" | "WOMEN" | "MEN">("ALL");
  const [categoryFilter, setCategoryFilter] = useState("ALL");
  const [mediaFilter, setMediaFilter] = useState<"ALL" | "WITH_VIDEO" | "PHOTOS_ONLY">("ALL");

  // Form states
  const [productId, setProductId] = useState("");
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [fabricCare, setFabricCare] = useState("");
  const [shippingReturnsNote, setShippingReturnsNote] = useState("");
  const [gender, setGender] = useState("WOMEN");
  const [categoryId, setCategoryId] = useState("");
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [priceNaira, setPriceNaira] = useState("");

  // Media Gallery Hub state
  const [mediaList, setMediaList] = useState<MediaItemState[]>([
    { type: "IMAGE", url: "/placeholder/front.jpg", label: "Front Look" },
  ]);

  // Dynamic colors list state (name + hex)
  const [colorsList, setColorsList] = useState<{ name: string; hex: string }[]>([
    { name: "Imperial Emerald", hex: "#1F5C42" },
  ]);

  const fetchProducts = async () => {
    try {
      const res = await fetch("/api/admin/products");
      if (res.ok) {
        const data = await res.json();
        setProducts(data.products);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchCategories = async () => {
    try {
      const res = await fetch("/api/admin/categories");
      if (res.ok) {
        const data = await res.json();
        setCategories(data.categories);
      }
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    fetchProducts();
    fetchCategories();
  }, []);

  const totalVideos = useMemo(() => {
    return products.filter((p) => p.media?.some((m) => m.type === "VIDEO")).length;
  }, [products]);

  const totalInventoryUnits = useMemo(() => {
    return products.reduce((acc, p) => {
      const pTotal = p.variants?.reduce((sum, v) => sum + (v.stock || 0), 0) || 0;
      return acc + pTotal;
    }, 0);
  }, [products]);

  // Group categories by department for clean enterprise UX
  const groupedCategories = useMemo(() => {
    const parentMap: Record<string, CategoryOption> = {};
    const childrenMap: Record<string, CategoryOption[]> = {};
    const roots: CategoryOption[] = [];

    for (const cat of categories) {
      if (!cat.parentId) {
        roots.push(cat);
        parentMap[cat.id] = cat;
      }
    }

    for (const cat of categories) {
      if (cat.parentId) {
        if (!childrenMap[cat.parentId]) childrenMap[cat.parentId] = [];
        childrenMap[cat.parentId].push(cat);
      }
    }

    return { roots, childrenMap, parentMap };
  }, [categories]);

  const handleDelete = async (id: string, pieceName: string) => {
    if (!confirm(`Are you sure you want to permanently delete "${pieceName}"? All media references, variants, and stock records will be removed.`)) {
      return;
    }

    try {
      const res = await fetch(`/api/admin/products?id=${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        await fetchProducts();
      } else {
        alert("Delete failed");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openCreateForm = () => {
    setIsEditing(false);
    setIsCreating(true);
    setActiveFormTab("details");
    setName("");
    setDescription("");
    setFabricCare("100% Raw Silk Organza & French Crepe. Specialist atelier dry clean only.");
    setShippingReturnsNote("Tailored on demand in our Lagos atelier. Dispatched via insured courier in 3-5 business days.");
    setGender("WOMEN");
    setCategoryId(categories[0]?.id || "");
    setPriceNaira("");
    setMediaList([
      { type: "IMAGE", url: "/placeholder/front.jpg", label: "Front Look" },
    ]);
    setColorsList([{ name: "Imperial Emerald", hex: "#1F5C42" }]);
  };

  const openEditForm = (p: Product) => {
    setIsCreating(false);
    setIsEditing(true);
    setActiveFormTab("details");
    setProductId(p.id);
    setName(p.name);
    setDescription(p.description);
    setFabricCare(p.fabricCare || "");
    setShippingReturnsNote(p.shippingReturnsNote || "");
    setGender(p.gender);
    setCategoryId(p.categoryId || "");
    setPriceNaira((p.priceMinor / 100).toString());
    setMediaList(
      p.media && p.media.length > 0
        ? p.media.map((m) => ({
            type: m.type === "VIDEO" ? "VIDEO" : "IMAGE",
            url: m.url,
            label: m.label || (m.type === "VIDEO" ? "Runway Lookbook Video" : "Angle Still"),
          }))
        : [{ type: "IMAGE", url: "/placeholder/front.jpg", label: "Front Look" }]
    );
    setColorsList(
      p.colors && p.colors.length > 0
        ? p.colors.map((c) => ({ name: c.name, hex: c.hex }))
        : [{ name: "Imperial Emerald", hex: "#1F5C42" }]
    );
  };

  // Media Hub Actions
  const addMediaItem = (type: "IMAGE" | "VIDEO") => {
    setMediaList((prev) => [
      ...prev,
      {
        type,
        url: "",
        label: type === "VIDEO" ? "Runway Lookbook Video" : `Angle ${prev.length + 1}`,
      },
    ]);
  };

  const updateMediaItem = (index: number, field: keyof MediaItemState, value: string) => {
    setMediaList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeMediaItem = (index: number) => {
    if (mediaList.length <= 1) return;
    setMediaList((prev) => prev.filter((_, i) => i !== index));
  };

  const moveMediaItem = (index: number, direction: "up" | "down") => {
    const targetIdx = direction === "up" ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= mediaList.length) return;
    setMediaList((prev) => {
      const next = [...prev];
      const temp = next[index];
      next[index] = next[targetIdx];
      next[targetIdx] = temp;
      return next;
    });
  };

  // Color Studio Actions
  const updateColor = (index: number, field: "name" | "hex", value: string) => {
    setColorsList((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  };

  const removeColor = (index: number) => {
    if (colorsList.length <= 1) return;
    setColorsList((prev) => prev.filter((_, i) => i !== index));
  };

  const addCustomColor = () => {
    setColorsList((prev) => [
      ...prev,
      { name: `Hue ${prev.length + 1}`, hex: "#8A7D71" },
    ]);
  };

  const addPresetColor = (preset: { name: string; hex: string }) => {
    const exists = colorsList.some(
      (c) => c.name.toLowerCase() === preset.name.toLowerCase()
    );
    if (exists) {
      alert(`"${preset.name}" is already included in this garment's palette.`);
      return;
    }
    setColorsList((prev) => [...prev, { name: preset.name, hex: preset.hex }]);
  };

  const generateRandomAtelierHue = () => {
    const unusedPresets = LUXURY_PALETTE_PRESETS.filter(
      (p) => !colorsList.some((c) => c.name.toLowerCase() === p.name.toLowerCase())
    );

    if (unusedPresets.length > 0) {
      const pick = unusedPresets[Math.floor(Math.random() * unusedPresets.length)];
      setColorsList((prev) => [...prev, { ...pick }]);
    } else {
      const randomTones = [
        { name: "Draped Indigo", hex: "#1C2D42" },
        { name: "Golden Saffron", hex: "#C49A45" },
        { name: "Smoky Mauve", hex: "#7E5C6B" },
        { name: "Forest Brocade", hex: "#1B3B2B" },
        { name: "Crimson Silk", hex: "#7B1123" },
      ];
      const pick = randomTones[Math.floor(Math.random() * randomTones.length)];
      setColorsList((prev) => [
        ...prev,
        { name: `${pick.name} #${prev.length + 1}`, hex: pick.hex },
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (colorsList.length === 0) {
      alert("Please configure at least one colourway for this piece.");
      return;
    }

    const priceMinor = Number(priceNaira) * 100;
    const formattedColors = colorsList.map((c) => ({
      name: c.name.trim() || "Custom Hue",
      hex: c.hex.startsWith("#") ? c.hex.trim() : `#${c.hex.trim()}`,
    }));

    const formattedMedia = mediaList
      .filter((m) => m.url.trim().length > 0)
      .map((m, i) => ({
        type: m.type,
        url: m.url.trim(),
        label: m.label.trim() || (m.type === "VIDEO" ? "Runway Lookbook Video" : `Angle ${i + 1}`),
        sortOrder: i,
      }));

    if (formattedMedia.length === 0) {
      formattedMedia.push({
        type: "IMAGE",
        url: "/placeholder/front.jpg",
        label: "Front Look",
        sortOrder: 0,
      });
    }

    setSaving(true);
    try {
      if (isCreating) {
        const res = await fetch("/api/admin/products", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name,
            description,
            fabricCare,
            shippingReturnsNote,
            gender,
            categoryId,
            priceMinor,
            colors: formattedColors,
            media: formattedMedia,
          }),
        });

        if (res.ok) {
          setIsCreating(false);
          await fetchProducts();
        } else {
          const data = await res.json();
          alert(data.error || "Create failed");
        }
      } else if (isEditing) {
        const res = await fetch("/api/admin/products", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            id: productId,
            name,
            description,
            fabricCare,
            shippingReturnsNote,
            gender,
            categoryId,
            priceMinor,
            colors: formattedColors,
            media: formattedMedia,
          }),
        });

        if (res.ok) {
          setIsEditing(false);
          await fetchProducts();
        } else {
          const data = await res.json();
          alert(data.error || "Update failed");
        }
      }
    } catch (err) {
      console.error(err);
      alert("An unexpected network error occurred");
    } finally {
      setSaving(false);
    }
  };

  // Filtered catalogue logic
  const filteredProducts = useMemo(() => {
    return products.filter((p) => {
      const term = searchTerm.toLowerCase();
      const matchesSearch =
        p.name.toLowerCase().includes(term) ||
        p.slug.toLowerCase().includes(term) ||
        (p.category?.name || "").toLowerCase().includes(term);

      const matchesGender =
        genderFilter === "ALL" || p.gender === genderFilter;

      const matchingCategoryIds =
        categoryFilter === "ALL"
          ? null
          : [categoryFilter, ...(groupedCategories.childrenMap[categoryFilter]?.map((ch) => ch.id) || [])];

      const matchesCategory =
        !matchingCategoryIds || (p.categoryId && matchingCategoryIds.includes(p.categoryId));

      const hasVideo = p.media?.some((m) => m.type === "VIDEO");
      const matchesMedia =
        mediaFilter === "ALL" ||
        (mediaFilter === "WITH_VIDEO" && hasVideo) ||
        (mediaFilter === "PHOTOS_ONLY" && !hasVideo);

      return matchesSearch && matchesGender && matchesCategory && matchesMedia;
    });
  }, [products, searchTerm, genderFilter, categoryFilter, mediaFilter]);

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
    fontFamily: "inherit",
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
      {/* Top Header & Telemetry Badges */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "26px", flexWrap: "wrap", gap: "16px" }}>
        <div>
          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "4px" }}>
            <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "#0F172A", margin: 0, fontWeight: 600 }}>
              Atelier Product Registry
            </h1>
            <span style={{ fontSize: "11.5px", color: "#065F46", background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "2px 9px", borderRadius: "999px", fontWeight: 600, display: "inline-flex", alignItems: "center", gap: "5px" }}>
              <span style={{ width: "6px", height: "6px", borderRadius: "50%", background: "#10B981" }} />
              Catalogue Live
            </span>
          </div>
          <div style={{ fontSize: "13px", color: "#64748B" }}>
            Curate couture garments, lookbook photography, runway video reels, colorway swatches, and size allocations
          </div>
        </div>

        {/* Action Controls & Top Stats */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", flexWrap: "wrap" }}>
          {/* Quick Metrics Badge */}
          <div style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "14px",
            background: "#FFFFFF",
            border: "1px solid #E2E8F0",
            padding: "6px 14px",
            borderRadius: "6px",
            fontSize: "12px",
            color: "#64748B",
            boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
          }}>
            <span><strong style={{ color: "#0F172A" }}>{products.length}</strong> Pieces</span>
            <span style={{ color: "#CBD5E1" }}>•</span>
            <span><strong style={{ color: "#1D4ED8" }}>{totalVideos}</strong> Runway Reels</span>
            <span style={{ color: "#CBD5E1" }}>•</span>
            <span><strong style={{ color: "#059669" }}>{totalInventoryUnits}</strong> Total Units</span>
          </div>

          {!isCreating && !isEditing && (
            <button
              type="button"
              onClick={openCreateForm}
              style={{
                display: "inline-flex",
                alignItems: "center",
                gap: "6px",
                background: "#0F172A",
                color: "#FFFFFF",
                border: "none",
                padding: "8px 16px",
                borderRadius: "6px",
                fontSize: "12.5px",
                fontWeight: 600,
                cursor: "pointer",
                boxShadow: "0 1px 3px rgba(15, 23, 42, 0.15)",
                transition: "all 0.15s ease",
              }}
            >
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              <span>Add Atelier Piece</span>
            </button>
          )}
        </div>
      </div>

      {/* ===================================================================
          MODERN ENTERPRISE FORM: PRODUCT SPECIFICATIONS & MULTI-MEDIA HUB
          =================================================================== */}
      {(isCreating || isEditing) && (
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "10px",
          padding: "28px 32px",
          marginBottom: "32px",
          maxWidth: "1020px",
          boxShadow: "0 4px 20px rgba(15, 23, 42, 0.06)",
        }}>
          {/* Form Header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #F1F5F9" }}>
            <div>
              <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "21px", color: "#0F172A", margin: 0, fontWeight: 600 }}>
                {isCreating ? "New Atelier Piece Specification" : `Edit Specifications: ${name || "Untitled Garment"}`}
              </h2>
              <div style={{ fontSize: "12.5px", color: "#64748B", marginTop: "3px" }}>
                Configure garment metadata, high-resolution photography, runway video, and bespoke palettes
              </div>
            </div>
            <button
              type="button"
              onClick={() => { setIsCreating(false); setIsEditing(false); }}
              style={{
                background: "#F8FAFC",
                border: "1px solid #E2E8F0",
                color: "#64748B",
                cursor: "pointer",
                width: "28px",
                height: "28px",
                borderRadius: "50%",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                fontSize: "13px",
              }}
            >
              ✕
            </button>
          </div>

          {/* Form Section Navigation Tabs */}
          <div style={{
            display: "flex",
            gap: "8px",
            borderBottom: "1px solid #E2E8F0",
            paddingBottom: "10px",
            marginBottom: "24px",
            overflowX: "auto",
          }}>
            {[
              { id: "details", label: "1. Core Garment Specs" },
              { id: "media", label: `2. Media Hub (${mediaList.length} assets)` },
              { id: "craft", label: "3. Fabric, Care & Shipping" },
              { id: "colors", label: `4. Colorway Studio (${colorsList.length} hues)` },
            ].map((tab) => {
              const isSelected = activeFormTab === tab.id;
              return (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveFormTab(tab.id as any)}
                  style={{
                    background: isSelected ? "#0F172A" : "transparent",
                    color: isSelected ? "#FFFFFF" : "#64748B",
                    border: "none",
                    padding: "6px 14px",
                    borderRadius: "6px",
                    fontSize: "12px",
                    fontWeight: isSelected ? 600 : 500,
                    cursor: "pointer",
                    transition: "all 0.15s ease",
                    whiteSpace: "nowrap",
                  }}
                >
                  {tab.label}
                </button>
              );
            })}
          </div>

          <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "22px" }}>
            {/* Tab 1: Core Specs */}
            {activeFormTab === "details" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
                <div style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Garment Title *</label>
                    <input
                      type="text"
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="e.g. Silk Organza Cape Column Gown"
                      style={inputStyle}
                    />
                  </div>

                  <div>
                    <label style={labelStyle}>Merchandising Department &amp; Category *</label>
                    <select
                      value={categoryId}
                      onChange={(e) => setCategoryId(e.target.value)}
                      required
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="" disabled>Select department or category</option>
                      {groupedCategories.roots.map((root) => {
                        const children = groupedCategories.childrenMap[root.id] || [];
                        return (
                          <optgroup key={root.id} label={`── ${root.name.toUpperCase()} DEPARTMENT ──`}>
                            <option value={root.id}>
                              All {root.name} (Top-level)
                            </option>
                            {children.map((sub) => (
                              <option key={sub.id} value={sub.id}>
                                {root.name} → {sub.name}
                              </option>
                            ))}
                          </optgroup>
                        );
                      })}
                    </select>
                  </div>

                  <div>
                    <label style={labelStyle}>Gender Segment *</label>
                    <select
                      value={gender}
                      onChange={(e) => setGender(e.target.value)}
                      style={{ ...inputStyle, cursor: "pointer" }}
                    >
                      <option value="WOMEN">Women's Atelier</option>
                      <option value="MEN">Men's Sartorial</option>
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1.2fr 2fr", gap: "16px" }}>
                  <div>
                    <label style={labelStyle}>Price in Naira (₦) *</label>
                    <div style={{ position: "relative" }}>
                      <span style={{ position: "absolute", left: "11px", top: "9px", color: "#64748B", fontWeight: 700, fontSize: "13px" }}>₦</span>
                      <input
                        type="number"
                        required
                        min="1"
                        step="any"
                        value={priceNaira}
                        onChange={(e) => setPriceNaira(e.target.value)}
                        placeholder="e.g. 185000"
                        style={{ ...inputStyle, paddingLeft: "28px", fontWeight: 600 }}
                      />
                    </div>
                  </div>

                  <div>
                    <label style={labelStyle}>Silhouette &amp; Silhouette Overview</label>
                    <input
                      type="text"
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="e.g. Hand-draped column silhouette featuring hand-stitched beaded hem..."
                      style={inputStyle}
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Tab 2: Atelier Lookbook Imagery & Runway Video Hub */}
            {activeFormTab === "media" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "12px 16px", borderRadius: "8px" }}>
                  <div>
                    <div style={{ fontSize: "13px", fontWeight: 600, color: "#0F172A" }}>
                      Lookbook Imagery &amp; Runway Video Assets
                    </div>
                    <div style={{ fontSize: "12px", color: "#64748B" }}>
                      Upload high-res files directly to storage or paste direct CDN / video URLs (MP4, Vimeo, WebM)
                    </div>
                  </div>

                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={() => addMediaItem("IMAGE")}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        color: "#334155",
                        padding: "6px 12px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                        boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
                      }}
                    >
                      <span>+ Add Photo</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => addMediaItem("VIDEO")}
                      style={{
                        background: "#EFF6FF",
                        border: "1px solid #BFDBFE",
                        color: "#1D4ED8",
                        padding: "6px 12px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 600,
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "5px",
                      }}
                    >
                      <span>▶ Add Runway Video</span>
                    </button>
                  </div>
                </div>

                {/* Media Cards List */}
                <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
                  {mediaList.map((m, idx) => {
                    const isVideo = m.type === "VIDEO";

                    return (
                      <div
                        key={idx}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: "14px",
                          background: isVideo ? "#F8FAFC" : "#FFFFFF",
                          border: isVideo ? "1px solid #BFDBFE" : "1px solid #E2E8F0",
                          borderRadius: "8px",
                          padding: "12px 14px",
                        }}
                      >
                        {/* Visual Thumbnail / Video Player Preview */}
                        <div style={{
                          width: "50px",
                          height: "64px",
                          borderRadius: "6px",
                          background: "#0F172A",
                          overflow: "hidden",
                          position: "relative",
                          flexShrink: 0,
                          border: "1px solid #CBD5E1",
                          display: "flex",
                          alignItems: "center",
                          justifyContent: "center",
                        }}>
                          {isVideo ? (
                            m.url ? (
                              <video
                                src={m.url}
                                muted
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              />
                            ) : (
                              <span style={{ color: "#93C5FD", fontSize: "18px" }}>▶</span>
                            )
                          ) : (
                            <img
                              src={m.url || "/placeholder/front.jpg"}
                              alt={m.label || `Asset ${idx + 1}`}
                              style={{ width: "100%", height: "100%", objectFit: "cover" }}
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = "none";
                              }}
                            />
                          )}

                          {/* Order badge */}
                          <span style={{
                            position: "absolute",
                            top: "2px",
                            left: "2px",
                            background: "rgba(15, 23, 42, 0.75)",
                            color: "#FFFFFF",
                            fontSize: "9px",
                            padding: "1px 4px",
                            borderRadius: "2px",
                            fontWeight: 700,
                          }}>
                            #{idx + 1}
                          </span>
                        </div>

                        {/* Format Toggle Pill */}
                        <select
                          value={m.type}
                          onChange={(e) => updateMediaItem(idx, "type", e.target.value)}
                          style={{
                            background: isVideo ? "#EFF6FF" : "#F8FAFC",
                            border: `1px solid ${isVideo ? "#BFDBFE" : "#CBD5E1"}`,
                            color: isVideo ? "#1D4ED8" : "#0F172A",
                            borderRadius: "6px",
                            fontSize: "12px",
                            padding: "6px 8px",
                            cursor: "pointer",
                            fontWeight: 600,
                          }}
                        >
                          <option value="IMAGE">Photo Still</option>
                          <option value="VIDEO">Runway Video</option>
                        </select>

                        {/* Label descriptor */}
                        <div style={{ width: "180px", flexShrink: 0 }}>
                          <input
                            type="text"
                            value={m.label}
                            onChange={(e) => updateMediaItem(idx, "label", e.target.value)}
                            placeholder={isVideo ? "Runway Lookbook Video" : "e.g. Front View, Fabric Macro"}
                            style={{ ...inputStyle, padding: "7px 10px", fontSize: "12px" }}
                          />
                        </div>

                        {/* URL input */}
                        <div style={{ flex: 1 }}>
                          <input
                            type="text"
                            value={m.url}
                            onChange={(e) => updateMediaItem(idx, "url", e.target.value)}
                            placeholder={isVideo ? "https://cdn.example.com/videos/runway.mp4" : "https://cdn.example.com/images/front.jpg"}
                            style={{ ...inputStyle, padding: "7px 10px", fontSize: "12px", fontFamily: "var(--font-mono)" }}
                          />
                        </div>

                        {/* Direct File Upload integration */}
                        <MediaUploadButton
                          folder="products"
                          accept={isVideo ? "video/*" : "image/*"}
                          label="Upload"
                          variant="light"
                          onUploaded={(publicUrl) => updateMediaItem(idx, "url", publicUrl)}
                        />

                        {/* Reorder and Delete controls */}
                        <div style={{ display: "flex", alignItems: "center", gap: "3px" }}>
                          <button
                            type="button"
                            disabled={idx === 0}
                            onClick={() => moveMediaItem(idx, "up")}
                            title="Move Up in presentation sequence"
                            style={{
                              background: "none",
                              border: "1px solid #E2E8F0",
                              borderRadius: "4px",
                              padding: "5px 7px",
                              color: idx === 0 ? "#CBD5E1" : "#475569",
                              cursor: idx === 0 ? "not-allowed" : "pointer",
                              fontSize: "11px",
                            }}
                          >
                            ▲
                          </button>
                          <button
                            type="button"
                            disabled={idx === mediaList.length - 1}
                            onClick={() => moveMediaItem(idx, "down")}
                            title="Move Down in presentation sequence"
                            style={{
                              background: "none",
                              border: "1px solid #E2E8F0",
                              borderRadius: "4px",
                              padding: "5px 7px",
                              color: idx === mediaList.length - 1 ? "#CBD5E1" : "#475569",
                              cursor: idx === mediaList.length - 1 ? "not-allowed" : "pointer",
                              fontSize: "11px",
                            }}
                          >
                            ▼
                          </button>
                          <button
                            type="button"
                            disabled={mediaList.length <= 1}
                            onClick={() => removeMediaItem(idx)}
                            title="Delete media slot"
                            style={{
                              background: "none",
                              border: "none",
                              color: mediaList.length <= 1 ? "#CBD5E1" : "#EF4444",
                              cursor: mediaList.length <= 1 ? "not-allowed" : "pointer",
                              padding: "5px 8px",
                              fontSize: "14px",
                            }}
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* Tab 3: Fabric & Care */}
            {activeFormTab === "craft" && (
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
                <div>
                  <label style={labelStyle}>Fabric Composition &amp; Garment Care</label>
                  <textarea
                    rows={4}
                    value={fabricCare}
                    onChange={(e) => setFabricCare(e.target.value)}
                    placeholder="e.g. 100% Raw Silk Organza & French Crepe. Specialist atelier dry clean only."
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Bespoke Tailoring &amp; Shipping Dispatch Notes</label>
                  <textarea
                    rows={4}
                    value={shippingReturnsNote}
                    onChange={(e) => setShippingReturnsNote(e.target.value)}
                    placeholder="e.g. Tailored on demand in our Lagos atelier. Dispatched via insured courier in 3-5 business days."
                    style={{ ...inputStyle, resize: "vertical", lineHeight: 1.5 }}
                  />
                </div>
              </div>
            )}

            {/* Tab 4: Colorway Studio */}
            {activeFormTab === "colors" && (
              <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                  <div style={{ fontSize: "12.5px", color: "#64748B" }}>
                    Configure official fabric hues available for selection on the storefront
                  </div>
                  <div style={{ display: "flex", gap: "8px" }}>
                    <button
                      type="button"
                      onClick={addCustomColor}
                      style={{
                        background: "#FFFFFF",
                        border: "1px solid #CBD5E1",
                        color: "#334155",
                        padding: "6px 12px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 500,
                      }}
                    >
                      + Add Swatch
                    </button>
                    <button
                      type="button"
                      onClick={generateRandomAtelierHue}
                      style={{
                        background: "#FFFBEB",
                        border: "1px solid #FDE68A",
                        color: "#B45309",
                        padding: "6px 12px",
                        fontSize: "12px",
                        borderRadius: "6px",
                        cursor: "pointer",
                        fontWeight: 600,
                      }}
                    >
                      ✨ Preset Tone
                    </button>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: "10px" }}>
                  {colorsList.map((color, index) => (
                    <div
                      key={index}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        background: "#F8FAFC",
                        border: "1px solid #E2E8F0",
                        padding: "8px 12px",
                        borderRadius: "6px",
                      }}
                    >
                      <input
                        type="color"
                        value={color.hex.startsWith("#") && color.hex.length === 7 ? color.hex : "#000000"}
                        onChange={(e) => updateColor(index, "hex", e.target.value)}
                        style={{
                          width: "28px",
                          height: "28px",
                          border: "none",
                          borderRadius: "50%",
                          cursor: "pointer",
                          background: "none",
                          padding: 0,
                        }}
                      />
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => updateColor(index, "name", e.target.value)}
                        placeholder="Color Name"
                        style={{ ...inputStyle, padding: "5px 8px", fontSize: "12px" }}
                      />
                      <input
                        type="text"
                        value={color.hex}
                        onChange={(e) => updateColor(index, "hex", e.target.value)}
                        placeholder="#HEX"
                        style={{ ...inputStyle, width: "80px", padding: "5px 8px", fontSize: "12px", fontFamily: "var(--font-mono)" }}
                      />
                      <button
                        type="button"
                        disabled={colorsList.length <= 1}
                        onClick={() => removeColor(index)}
                        style={{
                          background: "none",
                          border: "none",
                          color: colorsList.length <= 1 ? "#CBD5E1" : "#EF4444",
                          cursor: colorsList.length <= 1 ? "not-allowed" : "pointer",
                          fontSize: "14px",
                          padding: "2px 4px",
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Form Actions Footer */}
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderTop: "1px solid #F1F5F9", paddingTop: "18px", marginTop: "10px" }}>
              <div style={{ fontSize: "12px", color: "#64748B" }}>
                All updates automatically generate size inventory allocations (XS - XL) across each configured colourway.
              </div>

              <div style={{ display: "flex", gap: "10px" }}>
                <button
                  type="button"
                  onClick={() => { setIsCreating(false); setIsEditing(false); }}
                  style={{
                    background: "#FFFFFF",
                    color: "#64748B",
                    border: "1px solid #CBD5E1",
                    padding: "9px 18px",
                    fontSize: "12.5px",
                    cursor: "pointer",
                    borderRadius: "6px",
                    fontWeight: 500,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  style={{
                    background: "#0F172A",
                    color: "#FFFFFF",
                    border: "none",
                    padding: "9px 24px",
                    fontSize: "12.5px",
                    cursor: saving ? "wait" : "pointer",
                    borderRadius: "6px",
                    fontWeight: 600,
                    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.15)",
                    opacity: saving ? 0.7 : 1,
                  }}
                >
                  {saving ? "Saving Piece..." : isCreating ? "Publish Piece to Storefront" : "Save Specifications"}
                </button>
              </div>
            </div>
          </form>
        </div>
      )}

      {/* ===================================================================
          ENTERPRISE CATALOGUE DATA GRID WITH ADVANCED FILTER BAR
          =================================================================== */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "10px",
        padding: "20px 24px",
        boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
      }}>
        {/* Search & Filter Toolbar */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px", flexWrap: "wrap", gap: "12px" }}>
          {/* Search bar */}
          <div style={{ position: "relative", minWidth: "280px" }}>
            <input
              type="text"
              placeholder="Search by piece name, category, or slug..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{
                ...inputStyle,
                padding: "8px 12px 8px 34px",
                width: "320px",
                fontSize: "12.5px",
              }}
            />
            <svg
              width="14"
              height="14"
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

          {/* Segment & Category & Media Filter Strip */}
          <div style={{ display: "flex", gap: "8px", alignItems: "center", flexWrap: "wrap" }}>
            {/* Gender Segment Tabs */}
            <div style={{
              display: "inline-flex",
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "6px",
              padding: "2px",
            }}>
              {(["ALL", "WOMEN", "MEN"] as const).map((g) => {
                const isSelected = genderFilter === g;
                return (
                  <button
                    key={g}
                    type="button"
                    onClick={() => setGenderFilter(g)}
                    style={{
                      background: isSelected ? "#0F172A" : "transparent",
                      color: isSelected ? "#FFFFFF" : "#64748B",
                      border: "none",
                      padding: "5px 11px",
                      borderRadius: "4px",
                      fontSize: "11.5px",
                      fontWeight: isSelected ? 600 : 500,
                      cursor: "pointer",
                      transition: "all 0.15s ease",
                    }}
                  >
                    {g === "ALL" ? "All Segments" : g === "WOMEN" ? "Women" : "Men"}
                  </button>
                );
              })}
            </div>

            {/* Media Filter Tabs */}
            <select
              value={mediaFilter}
              onChange={(e) => setMediaFilter(e.target.value as any)}
              style={{
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "6px",
                color: "#334155",
                fontSize: "12px",
                padding: "6px 10px",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="ALL">All Media Types</option>
              <option value="WITH_VIDEO">▶ Has Runway Video</option>
              <option value="PHOTOS_ONLY">📷 Photo Stills Only</option>
            </select>

            {/* Category Dropdown */}
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              style={{
                background: "#FFFFFF",
                border: "1px solid #CBD5E1",
                borderRadius: "6px",
                color: "#334155",
                fontSize: "12px",
                padding: "6px 10px",
                cursor: "pointer",
                outline: "none",
              }}
            >
              <option value="ALL">All Categories &amp; Departments</option>
              {groupedCategories.roots.map((root) => {
                const children = groupedCategories.childrenMap[root.id] || [];
                return (
                  <optgroup key={root.id} label={root.name.toUpperCase()}>
                    <option value={root.id}>All {root.name}</option>
                    {children.map((sub) => (
                      <option key={sub.id} value={sub.id}>
                        {root.name} → {sub.name}
                      </option>
                    ))}
                  </optgroup>
                );
              })}
            </select>
          </div>
        </div>

        {/* Table Data */}
        {loading ? (
          <div style={{ color: "#64748B", padding: "40px 0", textAlign: "center", fontSize: "13.5px" }}>
            Querying atelier garment catalog...
          </div>
        ) : filteredProducts.length === 0 ? (
          <div style={{ color: "#94A3B8", padding: "48px 0", textAlign: "center", fontSize: "13.5px" }}>
            No garment pieces match the specified filter criteria.
          </div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0", background: "#F8FAFC" }}>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Visual Look</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Garment Title</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Category</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Palette</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Media</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Price</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProducts.map((p) => {
                  const firstImage = p.media?.find((m) => m.type === "IMAGE")?.url || "/placeholder/front.jpg";
                  const hasVideo = p.media?.some((m) => m.type === "VIDEO");

                  return (
                    <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                      {/* Visual Look Thumbnail */}
                      <td style={{ padding: "12px 14px" }}>
                        <div style={{ position: "relative", width: "42px", height: "54px", borderRadius: "5px", overflow: "hidden", background: "#F1F5F9", border: "1px solid #E2E8F0" }}>
                          <img
                            src={firstImage}
                            alt={p.name}
                            style={{ width: "100%", height: "100%", objectFit: "cover" }}
                            onError={(e) => {
                              (e.target as HTMLElement).style.display = "none";
                            }}
                          />
                          {hasVideo && (
                            <span
                              title="Features runway lookbook video"
                              style={{
                                position: "absolute",
                                bottom: "2px",
                                right: "2px",
                                background: "#0F172A",
                                color: "#FFFFFF",
                                fontSize: "8.5px",
                                padding: "1px 4px",
                                borderRadius: "2px",
                                fontWeight: 700,
                              }}
                            >
                              ▶
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Title & Slug */}
                      <td style={{ padding: "14px" }}>
                        <div style={{ fontWeight: 600, color: "#0F172A" }}>{p.name}</div>
                        <div style={{ fontSize: "11px", color: "#94A3B8", fontFamily: "var(--font-mono)", marginTop: "2px" }}>
                          {p.slug}
                        </div>
                      </td>

                      {/* Category & Segment */}
                      <td style={{ padding: "14px" }}>
                        <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                          <span style={{ fontSize: "12.5px", color: "#334155", fontWeight: 500 }}>
                            {p.category?.name || "Uncategorised"}
                          </span>
                          <span style={{ fontSize: "10.5px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            {p.gender === "WOMEN" ? "Women's" : "Men's"}
                          </span>
                        </div>
                      </td>

                      {/* Swatches */}
                      <td style={{ padding: "14px" }}>
                        <div style={{ display: "flex", gap: "5px", alignItems: "center", flexWrap: "wrap" }}>
                          {p.colors && p.colors.length > 0 ? (
                            p.colors.map((c) => (
                              <span
                                key={c.id || c.name}
                                title={`${c.name} (${c.hex})`}
                                style={{
                                  width: "14px",
                                  height: "14px",
                                  borderRadius: "50%",
                                  background: c.hex,
                                  display: "inline-block",
                                  border: "1px solid rgba(0,0,0,0.15)",
                                  boxShadow: "0 1px 2px rgba(0,0,0,0.06)",
                                }}
                              />
                            ))
                          ) : (
                            <span style={{ fontSize: "11px", color: "#94A3B8" }}>No colors</span>
                          )}
                        </div>
                      </td>

                      {/* Media Assets Count */}
                      <td style={{ padding: "14px" }}>
                        <div style={{ display: "inline-flex", alignItems: "center", gap: "6px" }}>
                          <span style={{ fontSize: "11.5px", color: "#475569", background: "#F1F5F9", padding: "2px 7px", borderRadius: "4px", fontWeight: 500 }}>
                            📷 {p.media?.filter((m) => m.type === "IMAGE").length || 0}
                          </span>
                          {hasVideo && (
                            <span style={{ fontSize: "11.5px", color: "#1D4ED8", background: "#EFF6FF", border: "1px solid #BFDBFE", padding: "2px 6px", borderRadius: "4px", fontWeight: 600 }}>
                              ▶ Video
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Price */}
                      <td style={{ padding: "14px", fontWeight: 700, color: "#0F172A" }}>
                        {formatNaira(p.priceMinor)}
                      </td>

                      {/* Actions */}
                      <td style={{ padding: "14px", textAlign: "right", whiteSpace: "nowrap" }}>
                        <Link
                          href={`/products/${p.slug}`}
                          target="_blank"
                          title="Preview piece on customer storefront"
                          style={{
                            background: "none",
                            border: "none",
                            color: "#64748B",
                            fontSize: "12px",
                            fontWeight: 500,
                            marginRight: "10px",
                            textDecoration: "none",
                          }}
                        >
                          View ↗
                        </Link>
                        <button
                          type="button"
                          onClick={() => openEditForm(p)}
                          style={{
                            background: "#F8FAFC",
                            border: "1px solid #CBD5E1",
                            color: "#0F172A",
                            padding: "5px 11px",
                            borderRadius: "5px",
                            fontSize: "12px",
                            fontWeight: 600,
                            cursor: "pointer",
                            marginRight: "8px",
                            transition: "all 0.15s ease",
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.borderColor = "#94A3B8";
                            e.currentTarget.style.background = "#FFFFFF";
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.borderColor = "#CBD5E1";
                            e.currentTarget.style.background = "#F8FAFC";
                          }}
                        >
                          Edit
                        </button>
                        <button
                          type="button"
                          onClick={() => handleDelete(p.id, p.name)}
                          style={{
                            background: "#FEF2F2",
                            border: "1px solid #FECACA",
                            color: "#DC2626",
                            padding: "5px 11px",
                            borderRadius: "5px",
                            fontSize: "12px",
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
