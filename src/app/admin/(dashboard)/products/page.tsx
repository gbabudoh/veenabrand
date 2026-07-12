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

interface Product {
  id: string;
  slug: string;
  name: string;
  description: string;
  fabricCare: string;
  shippingReturnsNote: string;
  gender: string;
  category: string;
  priceMinor: number;
  colors: ProductColor[];
  media: ProductMedia[];
  variants: Variant[];
}

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
  const [category, setCategory] = useState("New Arrival");
  const [priceNaira, setPriceNaira] = useState("");
  
  // Custom Color inputs state for creation
  const [colorNameInput, setColorNameInput] = useState("Emerald");
  const [colorHexInput, setColorHexInput] = useState("#1F5C42");

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

  useEffect(() => {
    fetchProducts();
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
    setCategory("New Arrival");
    setPriceNaira("");
    setColorNameInput("Emerald");
    setColorHexInput("#1F5C42");
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
    setCategory(p.category);
    setPriceNaira((p.priceMinor / 100).toString());
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const priceMinor = Number(priceNaira) * 100;

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
            category,
            priceMinor,
            colors: [{ name: colorNameInput, hex: colorHexInput }],
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
            category,
            priceMinor,
          }),
        });

        if (res.ok) {
          setIsEditing(false);
          await fetchProducts();
        } else {
          alert("Update failed");
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  return (
    <div>
      {/* Page header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: "34px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "30px", margin: 0, fontWeight: 500 }}>
            Products Registry
          </h1>
          <div style={{ fontSize: "13px", color: "rgba(246, 242, 234, 0.5)", marginTop: "4px" }}>
            Add new garments and customize variants, descriptions and price tiers
          </div>
        </div>
        {!isCreating && !isEditing && (
          <button
            onClick={openCreateForm}
            style={{
              background: "var(--color-emerald)",
              color: "#F6F2EA",
              border: "none",
              padding: "9px 18px",
              fontSize: "12.5px",
              borderRadius: "2px",
              cursor: "pointer",
              fontWeight: 600,
              letterSpacing: "0.03em"
            }}
          >
            + Create New Piece
          </button>
        )}
      </div>

      {/* Forms Drawer overlay */}
      {(isCreating || isEditing) && (
        <div style={{
          background: "#15130F",
          border: "1px solid rgba(246, 242, 234, 0.08)",
          borderRadius: "4px",
          padding: "30px",
          marginBottom: "32px",
          maxWidth: "680px"
        }}>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "18px", margin: "0 0 20px", fontWeight: 500 }}>
            {isCreating ? "New Product Specifications" : `Edit Specifications: ${name}`}
          </h2>
          
          <form onSubmit={handleSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "11px", color: "rgba(246,242,234,0.5)", marginBottom: "6px", textTransform: "uppercase" }}>Garment Name</label>
              <input type="text" required value={name} onChange={(e) => setName(e.target.value)} style={{ width: "100%", background: "#0F0E0B", border: "1px solid rgba(246,242,234,0.15)", color: "#F6F2EA", padding: "10px 12px", fontSize: "13.5px", borderRadius: "2px", outline: "none" }} />
            </div>

            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "11px", color: "rgba(246,242,234,0.5)", marginBottom: "6px", textTransform: "uppercase" }}>Description</label>
              <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} style={{ width: "100%", background: "#0F0E0B", border: "1px solid rgba(246,242,234,0.15)", color: "#F6F2EA", padding: "10px 12px", fontSize: "13.5px", borderRadius: "2px", outline: "none", resize: "none" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", color: "rgba(246,242,234,0.5)", marginBottom: "6px", textTransform: "uppercase" }}>Gender Segment</label>
              <select value={gender} onChange={(e) => setGender(e.target.value)} style={{ width: "100%", background: "#0F0E0B", border: "1px solid rgba(246,242,234,0.15)", color: "#F6F2EA", padding: "10px 12px", fontSize: "13.5px", borderRadius: "2px", cursor: "pointer" }}>
                <option value="WOMEN">Women</option>
                <option value="MEN">Men</option>
              </select>
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", color: "rgba(246,242,234,0.5)", marginBottom: "6px", textTransform: "uppercase" }}>Showcase Category</label>
              <input type="text" required value={category} onChange={(e) => setCategory(e.target.value)} placeholder="e.g. New Arrival, Runway" style={{ width: "100%", background: "#0F0E0B", border: "1px solid rgba(246,242,234,0.15)", color: "#F6F2EA", padding: "10px 12px", fontSize: "13.5px", borderRadius: "2px", outline: "none" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", color: "rgba(246,242,234,0.5)", marginBottom: "6px", textTransform: "uppercase" }}>Price (NGN Naira)</label>
              <input type="number" required value={priceNaira} onChange={(e) => setPriceNaira(e.target.value)} placeholder="e.g. 145000" style={{ width: "100%", background: "#0F0E0B", border: "1px solid rgba(246,242,234,0.15)", color: "#F6F2EA", padding: "10px 12px", fontSize: "13.5px", borderRadius: "2px", outline: "none" }} />
            </div>

            {isCreating && (
              <div>
                <label style={{ display: "block", fontSize: "11px", color: "rgba(246,242,234,0.5)", marginBottom: "6px", textTransform: "uppercase" }}>Initial Color (Swatches)</label>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                  <input type="text" placeholder="Emerald" value={colorNameInput} onChange={(e) => setColorNameInput(e.target.value)} style={{ width: "100%", background: "#0F0E0B", border: "1px solid rgba(246,242,234,0.15)", color: "#F6F2EA", padding: "10px 12px", fontSize: "13.5px", borderRadius: "2px" }} />
                  <input type="text" placeholder="#1F5C42" value={colorHexInput} onChange={(e) => setColorHexInput(e.target.value)} style={{ width: "100%", background: "#0F0E0B", border: "1px solid rgba(246,242,234,0.15)", color: "#F6F2EA", padding: "10px 12px", fontSize: "13.5px", borderRadius: "2px" }} />
                </div>
              </div>
            )}

            <div>
              <label style={{ display: "block", fontSize: "11px", color: "rgba(246,242,234,0.5)", marginBottom: "6px", textTransform: "uppercase" }}>Fabric &amp; Care Details</label>
              <input type="text" value={fabricCare} onChange={(e) => setFabricCare(e.target.value)} placeholder="e.g. 100% silk. Dry clean only." style={{ width: "100%", background: "#0F0E0B", border: "1px solid rgba(246,242,234,0.15)", color: "#F6F2EA", padding: "10px 12px", fontSize: "13.5px", borderRadius: "2px", outline: "none" }} />
            </div>

            <div>
              <label style={{ display: "block", fontSize: "11px", color: "rgba(246,242,234,0.5)", marginBottom: "6px", textTransform: "uppercase" }}>Shipping Announcement</label>
              <input type="text" value={shippingReturnsNote} onChange={(e) => setShippingReturnsNote(e.target.value)} placeholder="e.g. Ships next-day within Lagos." style={{ width: "100%", background: "#0F0E0B", border: "1px solid rgba(246,242,234,0.15)", color: "#F6F2EA", padding: "10px 12px", fontSize: "13.5px", borderRadius: "2px", outline: "none" }} />
            </div>

            <div style={{ gridColumn: "span 2", display: "flex", gap: "10px", marginTop: "14px" }}>
              <button type="submit" style={{ background: "#F6F2EA", color: "#15130F", border: "none", padding: "11px 24px", fontSize: "12.5px", cursor: "pointer", borderRadius: "2px", fontWeight: 600 }}>
                {isCreating ? "Confirm & Seed" : "Save Changes"}
              </button>
              <button type="button" onClick={() => { setIsCreating(false); setIsEditing(false); }} style={{ background: "none", color: "rgba(246,242,234,0.6)", border: "1px solid rgba(246,242,234,0.15)", padding: "11px 24px", fontSize: "12.5px", cursor: "pointer", borderRadius: "2px" }}>
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main product entries checklist */}
      <div style={{
        background: "#15130F",
        border: "1px solid rgba(246, 242, 234, 0.08)",
        borderRadius: "4px",
        padding: "24px"
      }}>
        {loading ? (
          <div style={{ color: "rgba(246,242,234,0.5)" }}>Querying catalog records...</div>
        ) : products.length === 0 ? (
          <div style={{ color: "rgba(246,242,234,0.4)" }}>No products found.</div>
        ) : (
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "13.5px", textAlign: "left" }}>
              <thead>
                <tr style={{ borderBottom: "1px solid rgba(246,242,234,0.08)" }}>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Piece Name</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Gender</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Category</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Colours</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)" }}>Price</th>
                  <th style={{ padding: "10px", color: "rgba(246,242,234,0.45)", textAlign: "right" }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {products.map((p) => (
                  <tr key={p.id} style={{ borderBottom: "1px solid rgba(246,242,234,0.04)" }}>
                    <td style={{ padding: "14px 10px", fontWeight: 600 }}>{p.name}</td>
                    <td style={{ padding: "14px 10px", color: "rgba(246,242,234,0.6)" }}>{p.gender}</td>
                    <td style={{ padding: "14px 10px" }}>
                      <span style={{ background: "rgba(246,242,234,0.05)", padding: "2px 8px", borderRadius: "999px", fontSize: "11.5px" }}>
                        {p.category}
                      </span>
                    </td>
                    <td style={{ padding: "14px 10px" }}>
                      <div style={{ display: "flex", gap: "6px" }}>
                        {p.colors.map((c) => (
                          <span
                            key={c.id}
                            title={c.name}
                            style={{
                              width: "14px",
                              height: "14px",
                              borderRadius: "50%",
                              background: c.hex,
                              display: "inline-block",
                              border: "1px solid rgba(246,242,234,0.3)"
                            }}
                          ></span>
                        ))}
                      </div>
                    </td>
                    <td style={{ padding: "14px 10px", fontWeight: 600, color: "var(--color-emerald)" }}>{formatNaira(p.priceMinor)}</td>
                    <td style={{ padding: "14px 10px", textAlign: "right" }}>
                      <button
                        onClick={() => openEditForm(p)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "var(--color-emerald)",
                          cursor: "pointer",
                          fontWeight: 600,
                          marginRight: "14px",
                          fontSize: "13px"
                        }}
                      >
                        Edit
                      </button>
                      <button
                        onClick={() => handleDelete(p.id)}
                        style={{
                          background: "none",
                          border: "none",
                          color: "#e6746c",
                          cursor: "pointer",
                          fontWeight: 600,
                          fontSize: "13px"
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
