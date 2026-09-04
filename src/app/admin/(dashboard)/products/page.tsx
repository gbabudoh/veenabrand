"use client";

import React, { useState, useEffect } from "react";
import { formatNaira } from "@/lib/money";

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

  // Dynamic colors list state (name + hex)
  const [colorsList, setColorsList] = useState<{ name: string; hex: string }[]>([
    { name: "Imperial Emerald", hex: "#1F5C42" }
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

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this piece?")) return;

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
    setName("");
    setDescription("");
    setFabricCare("");
    setShippingReturnsNote("");
    setGender("WOMEN");
    setCategoryId(categories[0]?.id || "");
    setPriceNaira("");
    setColorsList([{ name: "Imperial Emerald", hex: "#1F5C42" }]);
  };

  const openEditForm = (p: Product) => {
    setIsCreating(false);
    setIsEditing(true);
    setProductId(p.id);
    setName(p.name);
    setDescription(p.description);
    setFabricCare(p.fabricCare);
    setShippingReturnsNote(p.shippingReturnsNote);
    setGender(p.gender);
    setCategoryId(p.categoryId || "");
    setPriceNaira((p.priceMinor / 100).toString());
    setColorsList(
      p.colors && p.colors.length > 0
        ? p.colors.map((c) => ({ name: c.name, hex: c.hex }))
        : [{ name: "Imperial Emerald", hex: "#1F5C42" }]
    );
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
      { name: `Hue ${prev.length + 1}`, hex: "#8A7D71" }
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
        { name: "Crimson Silk", hex: "#7B1123" }
      ];
      const pick = randomTones[Math.floor(Math.random() * randomTones.length)];
      setColorsList((prev) => [
        ...prev,
        { name: `${pick.name} #${prev.length + 1}`, hex: pick.hex }
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

    if (isCreating) {
      try {
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
            media: [
              { type: "IMAGE", url: "/placeholder/front.jpg", label: "Front" },
              { type: "IMAGE", url: "/placeholder/detail.jpg", label: "Detail" },
            ]
          }),
        });

        if (res.ok) {
          setIsCreating(false);
          await fetchProducts();
        } else {
          const data = await res.json();
          alert(data.error || "Create failed");
        }
      } catch (err) {
        console.error(err);
      }
    } else if (isEditing) {
      try {
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
          }),
        });

        if (res.ok) {
          setIsEditing(false);
          await fetchProducts();
        } else {
          const data = await res.json();
          alert(data.error || "Update failed");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "#0F172A", margin: 0, fontWeight: 600 }}>
            Products Registry
          </h1>
          <div style={{ fontSize: "13.5px", color: "#64748B", marginTop: "4px" }}>
            Manage atelier garments, size allocations, price tiers, and dynamic colorways
          </div>
        </div>
        {!isCreating && !isEditing && (
          <button
            onClick={openCreateForm}
            style={{
              background: "#10B981",
              color: "#FFFFFF",
              border: "none",
              padding: "10px 20px",
              fontSize: "13px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 1px 3px rgba(16, 185, 129, 0.3)",
              transition: "background 0.15s ease",
            }}
          >
            + Create New Piece
          </button>
        )}
      </div>

      {/* Forms Drawer overlay */}
      {(isCreating || isEditing) && (
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          padding: "32px",
          marginBottom: "32px",
          maxWidth: "800px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.05)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "24px", paddingBottom: "16px", borderBottom: "1px solid #F1F5F9" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "#0F172A", margin: 0, fontWeight: 600 }}>
              {isCreating ? "New Product Specifications" : `Edit Specifications: ${name}`}
            </h2>
            <button
              type="button"
              onClick={() => { setIsCreating(false); setIsEditing(false); }}
              style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: "18px" }}
            >
              ✕
            </button>
          </div>
          
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "11.5px", color: "#64748B", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                Garment Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Silk Draped Column Gown"
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "6px",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "11.5px", color: "#64748B", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                Description
              </label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
                placeholder="Detailed atelier fabric, drape, and silhouette description..."
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "6px",
                  outline: "none",
                  resize: "vertical"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11.5px", color: "#64748B", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                Gender Segment
              </label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value)}
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                <option value="WOMEN">Women</option>
                <option value="MEN">Men</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11.5px", color: "#64748B", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                Category
              </label>
              <select
                required
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "6px",
                  cursor: "pointer"
                }}
              >
                <option value="">— Select a category —</option>
                {categories.filter((c) => !c.parentId).map((parent) => (
                  <React.Fragment key={parent.id}>
                    <option value={parent.id}>{parent.name}{parent.active ? "" : " (hidden)"}</option>
                    {categories.filter((c) => c.parentId === parent.id).map((child) => (
                      <option key={child.id} value={child.id}>&nbsp;&nbsp;&nbsp;{child.name}{child.active ? "" : " (hidden)"}</option>
                    ))}
                  </React.Fragment>
                ))}
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11.5px", color: "#64748B", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                Price (NGN Naira)
              </label>
              <input
                type="number"
                required
                value={priceNaira}
                onChange={(e) => setPriceNaira(e.target.value)}
                placeholder="e.g. 145000"
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "6px",
                  outline: "none"
                }}
              />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11.5px", color: "#64748B", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                Fabric &amp; Care Details
              </label>
              <input
                type="text"
                value={fabricCare}
                onChange={(e) => setFabricCare(e.target.value)}
                placeholder="e.g. 100% silk. Dry clean only."
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "6px",
                  outline: "none"
                }}
              />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "11.5px", color: "#64748B", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                Shipping Announcement
              </label>
              <input
                type="text"
                value={shippingReturnsNote}
                onChange={(e) => setShippingReturnsNote(e.target.value)}
                placeholder="e.g. Ships next-day within Lagos."
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "6px",
                  outline: "none"
                }}
              />
            </div>

            {/* ===================================================================
                ATELIER COLORWAYS & PALETTE STUDIO
                =================================================================== */}
            <div style={{
              gridColumn: "span 2",
              marginTop: "8px",
              padding: "20px",
              background: "#F8FAFC",
              border: "1px solid #E2E8F0",
              borderRadius: "8px"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "16px" }}>
                <div>
                  <div style={{ fontSize: "13px", fontWeight: 700, letterSpacing: "0.04em", color: "#0F172A", textTransform: "uppercase" }}>
                    Atelier Colorways &amp; Swatches Studio
                  </div>
                  <div style={{ fontSize: "12px", color: "#64748B", marginTop: "3px" }}>
                    Configure all fabric colorways. All sizes (XS–XL) will automatically be generated in inventory.
                  </div>
                </div>
                <div style={{ fontSize: "12px", color: "#059669", background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "3px 10px", borderRadius: "999px", fontWeight: 600 }}>
                  {colorsList.length} {colorsList.length === 1 ? "Colorway" : "Colorways"}
                </div>
              </div>

              {/* Quick Preset Pills */}
              <div style={{ marginBottom: "18px" }}>
                <div style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "8px", fontWeight: 600 }}>
                  Quick-Generate From Curated Atelier Hues
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "6px" }}>
                  {LUXURY_PALETTE_PRESETS.map((preset) => {
                    const isSelected = colorsList.some(
                      (c) => c.name.toLowerCase() === preset.name.toLowerCase() || c.hex.toLowerCase() === preset.hex.toLowerCase()
                    );
                    return (
                      <button
                        key={preset.name}
                        type="button"
                        onClick={() => addPresetColor(preset)}
                        title={isSelected ? "Already configured" : `Add ${preset.name} (${preset.hex})`}
                        style={{
                          display: "inline-flex",
                          alignItems: "center",
                          gap: "6px",
                          background: isSelected ? "#ECFDF5" : "#FFFFFF",
                          border: isSelected ? "1px solid #10B981" : "1px solid #CBD5E1",
                          color: isSelected ? "#065F46" : "#334155",
                          padding: "4px 10px",
                          borderRadius: "999px",
                          fontSize: "11.5px",
                          cursor: isSelected ? "default" : "pointer",
                          fontWeight: isSelected ? 600 : 500,
                          transition: "all 0.15s ease",
                          boxShadow: "0 1px 2px rgba(0,0,0,0.03)"
                        }}
                      >
                        <span
                          style={{
                            width: "9px",
                            height: "9px",
                            borderRadius: "50%",
                            backgroundColor: preset.hex,
                            border: "1px solid rgba(0,0,0,0.15)"
                          }}
                        />
                        <span>{preset.name}</span>
                        {isSelected && <span style={{ fontSize: "10px", color: "#10B981" }}>✓</span>}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Active Colorway List */}
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {colorsList.map((color, index) => (
                  <div
                    key={index}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      background: "#FFFFFF",
                      border: "1px solid #E2E8F0",
                      borderRadius: "6px",
                      padding: "10px 14px",
                      boxShadow: "0 1px 2px rgba(0,0,0,0.02)"
                    }}
                  >
                    <span style={{ fontSize: "11px", color: "#94A3B8", width: "24px", fontWeight: 700 }}>
                      #{index + 1}
                    </span>

                    {/* Circular Swatch with Native Color Picker Overlay */}
                    <div style={{ position: "relative", width: "32px", height: "32px", flexShrink: 0 }}>
                      <div
                        style={{
                          width: "32px",
                          height: "32px",
                          borderRadius: "50%",
                          backgroundColor: color.hex,
                          border: "2px solid #E2E8F0",
                          boxShadow: "0 2px 4px rgba(0,0,0,0.1)"
                        }}
                      />
                      <input
                        type="color"
                        value={color.hex.startsWith("#") && color.hex.length === 7 ? color.hex : "#1F5C42"}
                        onChange={(e) => updateColor(index, "hex", e.target.value)}
                        title="Open interactive color wheel"
                        style={{
                          position: "absolute",
                          top: 0,
                          left: 0,
                          width: "100%",
                          height: "100%",
                          opacity: 0,
                          cursor: "pointer"
                        }}
                      />
                    </div>

                    {/* Hex input */}
                    <div style={{ width: "110px", flexShrink: 0 }}>
                      <input
                        type="text"
                        value={color.hex}
                        onChange={(e) => updateColor(index, "hex", e.target.value)}
                        placeholder="#HEX"
                        style={{
                          width: "100%",
                          background: "#F8FAFC",
                          border: "1px solid #CBD5E1",
                          color: "#0F172A",
                          padding: "8px 10px",
                          fontSize: "12.5px",
                          borderRadius: "4px",
                          fontFamily: "var(--font-mono)",
                          outline: "none"
                        }}
                      />
                    </div>

                    {/* Name input */}
                    <div style={{ flex: 1 }}>
                      <input
                        type="text"
                        value={color.name}
                        onChange={(e) => updateColor(index, "name", e.target.value)}
                        placeholder="e.g. Imperial Emerald"
                        style={{
                          width: "100%",
                          background: "#F8FAFC",
                          border: "1px solid #CBD5E1",
                          color: "#0F172A",
                          padding: "8px 10px",
                          fontSize: "12.5px",
                          borderRadius: "4px",
                          outline: "none"
                        }}
                      />
                    </div>

                    {/* Delete button */}
                    <button
                      type="button"
                      disabled={colorsList.length <= 1}
                      onClick={() => removeColor(index)}
                      title={colorsList.length <= 1 ? "At least one colourway is required" : "Remove colourway"}
                      style={{
                        background: "none",
                        border: "none",
                        color: colorsList.length <= 1 ? "#CBD5E1" : "#EF4444",
                        cursor: colorsList.length <= 1 ? "not-allowed" : "pointer",
                        padding: "6px 10px",
                        fontSize: "15px",
                        lineHeight: 1
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>

              {/* Action Buttons for Studio */}
              <div style={{ display: "flex", gap: "10px", marginTop: "14px" }}>
                <button
                  type="button"
                  onClick={generateRandomAtelierHue}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#FEF3C7",
                    border: "1px solid #FCD34D",
                    color: "#92400E",
                    padding: "8px 14px",
                    fontSize: "12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 600,
                  }}
                >
                  ✨ Generate Atelier Hue
                </button>
                <button
                  type="button"
                  onClick={addCustomColor}
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    background: "#FFFFFF",
                    border: "1px solid #CBD5E1",
                    color: "#334155",
                    padding: "8px 14px",
                    fontSize: "12px",
                    borderRadius: "6px",
                    cursor: "pointer",
                    fontWeight: 500,
                  }}
                >
                  + Add Custom Swatch
                </button>
              </div>
            </div>

            <div style={{ gridColumn: "span 2", display: "flex", gap: "12px", marginTop: "12px" }}>
              <button
                type="submit"
                style={{
                  background: "#10B981",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "11px 24px",
                  fontSize: "13px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  fontWeight: 600,
                  boxShadow: "0 1px 3px rgba(16, 185, 129, 0.3)"
                }}
              >
                {isCreating ? "Confirm & Seed Piece" : "Save Changes"}
              </button>
              <button
                type="button"
                onClick={() => { setIsCreating(false); setIsEditing(false); }}
                style={{
                  background: "#FFFFFF",
                  color: "#64748B",
                  border: "1px solid #CBD5E1",
                  padding: "11px 24px",
                  fontSize: "13px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  fontWeight: 500
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main product entries table */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "8px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)"
      }}>
        {loading ? (
          <div style={{ color: "#64748B", fontSize: "13.5px" }}>Loading catalog pieces...</div>
        ) : products.length === 0 ? (
          <div style={{ color: "#94A3B8", fontSize: "13.5px" }}>No products found in the database.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid #E2E8F0", background: "#F8FAFC" }}>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Piece Name</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Gender</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Category</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Colours</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>Price</th>
                  <th style={{ padding: "10px 14px", color: "#64748B", fontSize: "11.5px", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600, textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid #F1F5F9" }}>
                    <td style={{ padding: "14px", fontWeight: 600, color: "#0F172A" }}>{p.name}</td>
                    <td style={{ padding: "14px", color: "#64748B" }}>{p.gender}</td>
                    <td style={{ padding: "14px" }}>
                      <span style={{ background: "#F1F5F9", color: "#475569", padding: "3px 9px", borderRadius: "999px", fontSize: "11.5px", fontWeight: 500 }}>
                        {p.category?.name || "Uncategorised"}
                      </span>
                    </td>
                    <td style={{ padding: "14px" }}>
                      <div style={{ display: "flex", gap: "6px", alignItems: "center", flexWrap: "wrap" }}>
                        {p.colors && p.colors.length > 0 ? (
                          p.colors.map((c) => (
                            <span
                              key={c.id || c.name}
                              title={`${c.name} (${c.hex})`}
                              style={{
                                width: "16px",
                                height: "16px",
                                borderRadius: "50%",
                                background: c.hex,
                                display: "inline-block",
                                border: "1px solid rgba(0,0,0,0.15)",
                                boxShadow: "0 1px 2px rgba(0,0,0,0.1)"
                              }}
                            />
                          ))
                        ) : (
                          <span style={{ fontSize: "11.5px", color: "#94A3B8" }}>No colors</span>
                        )}
                        <span style={{ fontSize: "11px", color: "#64748B", marginLeft: "4px", fontWeight: 500 }}>
                          {p.colors?.length || 0}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding: "14px", fontWeight: 600, color: "#059669" }}>{formatNaira(p.priceMinor)}</td>
                    <td style={{ padding: "14px", textAlign: "right" }}>
                      <button
                        onClick={() => openEditForm(p)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#10B981",
                          cursor: "pointer",
                          fontWeight: 600,
                          marginRight: "14px",
                          fontSize: "12.5px"
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#EF4444",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "12.5px"
                        }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
