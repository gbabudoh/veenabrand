"use client";

import React, { useState, useEffect } from "react";

interface BannerSlide {
  id: string;
  eyebrow: string;
  title: string;
  cta: string;
  link: string;
  genderFilter?: string;
  actionScroll?: string;
  tone1?: string;
  tone2?: string;
  bgImage: string;
  active: boolean;
}

const PRESET_ASSETS = [
  { label: "Women SS26 Editorial", url: "/images/hero_women.png" },
  { label: "Men Atelier Tailoring", url: "/images/hero_men.png" },
  { label: "Runway Motion Stage", url: "/images/hero_runway.png" },
  { label: "Private Atelier Studio", url: "/images/atelier.png" },
  { label: "Fine Accessories", url: "/images/accessories.png" },
  { label: "Emerald Silk Runway", url: "/images/emerald_gown_runway.jpg" },
  { label: "Studio Draped Profile", url: "/images/emerald_gown_studio.jpg" },
];

const PRESET_DESTINATIONS = [
  { label: "Shop Women", link: "/products?gender=WOMEN" },
  { label: "Shop Men", link: "/products?gender=MEN" },
  { label: "All Catalog", link: "/products" },
  { label: "Bespoke Request", link: "/bespoke" },
  { label: "Watch Runway Film", link: "#runway-banner" },
];

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<BannerSlide[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  // Drawer modal state
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  // Form states
  const [formEyebrow, setFormEyebrow] = useState("");
  const [formTitle, setFormTitle] = useState("");
  const [formCta, setFormCta] = useState("");
  const [formLink, setFormLink] = useState("");
  const [formGenderFilter, setFormGenderFilter] = useState("ALL");
  const [formBgImage, setFormBgImage] = useState("");
  const [formActive, setFormActive] = useState(true);

  // Fetch banners from API
  const fetchBanners = async () => {
    try {
      const res = await fetch("/api/admin/banners");
      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners || []);
      }
    } catch (err) {
      console.error("Failed to load banners:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  // Save changes to backend
  const saveBanners = async (updatedList: BannerSlide[]) => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/banners", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ banners: updatedList }),
      });

      if (res.ok) {
        const data = await res.json();
        setBanners(data.banners);
        setSaveSuccess(true);
        setTimeout(() => setSaveSuccess(false), 2500);
      } else {
        const err = await res.json();
        alert(err.error || "Failed to save banners");
      }
    } catch (err) {
      console.error(err);
      alert("Error saving banners");
    } finally {
      setSaving(false);
    }
  };

  // Open Create Drawer
  const openCreateDrawer = () => {
    setEditingIndex(null);
    setFormEyebrow("SS26 Runway Edition");
    setFormTitle("Tailoring that moves with you");
    setFormCta("Explore Collection");
    setFormLink("/products?gender=WOMEN");
    setFormGenderFilter("WOMEN");
    setFormBgImage("/images/hero_women.png");
    setFormActive(true);
    setIsDrawerOpen(true);
  };

  // Open Edit Drawer
  const openEditDrawer = (index: number) => {
    const banner = banners[index];
    if (!banner) return;
    setEditingIndex(index);
    setFormEyebrow(banner.eyebrow);
    setFormTitle(banner.title);
    setFormCta(banner.cta);
    setFormLink(banner.link || "");
    setFormGenderFilter(banner.genderFilter || "ALL");
    setFormBgImage(banner.bgImage);
    setFormActive(banner.active !== false);
    setIsDrawerOpen(true);
  };

  // Handle Form Submit
  const handleDrawerSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const bannerData: BannerSlide = {
      id: editingIndex !== null ? banners[editingIndex].id : `banner-${Date.now()}`,
      eyebrow: formEyebrow.trim(),
      title: formTitle.trim(),
      cta: formCta.trim(),
      link: formLink.trim(),
      genderFilter: formGenderFilter,
      actionScroll: formLink.startsWith("#") ? formLink.replace("#", "") : "",
      bgImage: formBgImage.trim(),
      active: formActive,
    };

    let updated: BannerSlide[];
    if (editingIndex !== null) {
      updated = [...banners];
      updated[editingIndex] = bannerData;
    } else {
      updated = [...banners, bannerData];
    }

    setIsDrawerOpen(false);
    await saveBanners(updated);
  };

  // Toggle active status in place
  const toggleActive = async (index: number) => {
    const updated = [...banners];
    updated[index] = { ...updated[index], active: !updated[index].active };
    await saveBanners(updated);
  };

  // Move banner Up
  const moveUp = async (index: number) => {
    if (index === 0) return;
    const updated = [...banners];
    const temp = updated[index];
    updated[index] = updated[index - 1];
    updated[index - 1] = temp;
    await saveBanners(updated);
  };

  // Move banner Down
  const moveDown = async (index: number) => {
    if (index === banners.length - 1) return;
    const updated = [...banners];
    const temp = updated[index];
    updated[index] = updated[index + 1];
    updated[index + 1] = temp;
    await saveBanners(updated);
  };

  // Delete banner
  const deleteBanner = async (index: number) => {
    if (banners.length <= 1) {
      alert("At least one banner must remain on the homepage.");
      return;
    }

    if (!confirm(`Are you sure you want to remove "${banners[index].title}"?`)) {
      return;
    }

    const updated = banners.filter((_, i) => i !== index);
    await saveBanners(updated);
  };

  return (
    <div>
      {/* Page Header */}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: "32px" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "#0F172A", margin: 0, fontWeight: 600 }}>
            Homepage Banners Manager
          </h1>
          <div style={{ fontSize: "13.5px", color: "#64748B", marginTop: "4px" }}>
            Create, sequence, edit, and toggle rotating hero carousel banners displayed on the storefront
          </div>
        </div>
        <div style={{ display: "flex", gap: "10px", alignItems: "center" }}>
          {saveSuccess && (
            <span style={{ fontSize: "12px", color: "#059669", background: "#ECFDF5", border: "1px solid #A7F3D0", padding: "6px 12px", borderRadius: "6px", fontWeight: 600 }}>
              Live Store Updated ✓
            </span>
          )}
          <button
            onClick={openCreateDrawer}
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
              display: "flex",
              alignItems: "center",
              gap: "6px",
            }}
          >
            <span>+</span>
            <span>Add New Banner</span>
          </button>
        </div>
      </div>

      {/* Drawer Overlay for Create/Edit */}
      {isDrawerOpen && (
        <div style={{
          background: "#FFFFFF",
          border: "1px solid #E2E8F0",
          borderRadius: "8px",
          padding: "32px",
          marginBottom: "32px",
          maxWidth: "820px",
          boxShadow: "0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01)",
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "22px", paddingBottom: "14px", borderBottom: "1px solid #F1F5F9" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "20px", color: "#0F172A", margin: 0, fontWeight: 600 }}>
              {editingIndex !== null ? `Edit Banner #${editingIndex + 1}` : "Create New Homepage Banner"}
            </h2>
            <button
              type="button"
              onClick={() => setIsDrawerOpen(false)}
              style={{ background: "none", border: "none", color: "#64748B", cursor: "pointer", fontSize: "18px" }}
            >
              ✕
            </button>
          </div>

          <form onSubmit={handleDrawerSubmit} style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "18px" }}>
            {/* Eyebrow */}
            <div>
              <label style={{ display: "block", fontSize: "11.5px", color: "#64748B", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                Eyebrow Text
              </label>
              <input
                type="text"
                required
                value={formEyebrow}
                onChange={(e) => setFormEyebrow(e.target.value)}
                placeholder="e.g. SS26 Runway Edition"
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
            </div>

            {/* Headline Title */}
            <div>
              <label style={{ display: "block", fontSize: "11.5px", color: "#64748B", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                Main Headline
              </label>
              <input
                type="text"
                required
                value={formTitle}
                onChange={(e) => setFormTitle(e.target.value)}
                placeholder="e.g. Tailoring that moves with you"
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
            </div>

            {/* CTA Label */}
            <div>
              <label style={{ display: "block", fontSize: "11.5px", color: "#64748B", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                CTA Button Text
              </label>
              <input
                type="text"
                required
                value={formCta}
                onChange={(e) => setFormCta(e.target.value)}
                placeholder="e.g. Shop Women"
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "6px",
                  outline: "none",
                }}
              />
            </div>

            {/* Target Segment */}
            <div>
              <label style={{ display: "block", fontSize: "11.5px", color: "#64748B", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                Target Audience Segment
              </label>
              <select
                value={formGenderFilter}
                onChange={(e) => setFormGenderFilter(e.target.value)}
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "6px",
                  cursor: "pointer",
                }}
              >
                <option value="ALL">All Shoppers (Both Men &amp; Women)</option>
                <option value="WOMEN">Women&#39;s Segment</option>
                <option value="MEN">Men&#39;s Segment</option>
              </select>
            </div>

            {/* Destination Link */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "11.5px", color: "#64748B", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                Click Destination / Route Link
              </label>
              <input
                type="text"
                required
                value={formLink}
                onChange={(e) => setFormLink(e.target.value)}
                placeholder="e.g. /products?gender=WOMEN or #runway-banner"
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "6px",
                  outline: "none",
                  fontFamily: "var(--font-mono)",
                }}
              />
              {/* Quick destination presets */}
              <div style={{ display: "flex", gap: "6px", marginTop: "8px", flexWrap: "wrap" }}>
                {PRESET_DESTINATIONS.map((dest) => (
                  <button
                    key={dest.label}
                    type="button"
                    onClick={() => setFormLink(dest.link)}
                    style={{
                      background: formLink === dest.link ? "#EFF6FF" : "#F8FAFC",
                      border: formLink === dest.link ? "1px solid #3B82F6" : "1px solid #E2E8F0",
                      color: formLink === dest.link ? "#1D4ED8" : "#64748B",
                      padding: "3px 9px",
                      borderRadius: "4px",
                      fontSize: "11px",
                      cursor: "pointer",
                      fontWeight: 500,
                    }}
                  >
                    {dest.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Background Image Asset */}
            <div style={{ gridColumn: "span 2" }}>
              <label style={{ display: "block", fontSize: "11.5px", color: "#64748B", marginBottom: "6px", textTransform: "uppercase", fontWeight: 600 }}>
                Banner Background Image Path / URL
              </label>
              <input
                type="text"
                required
                value={formBgImage}
                onChange={(e) => setFormBgImage(e.target.value)}
                placeholder="e.g. /images/hero_women.png or full HTTPS URL"
                style={{
                  width: "100%",
                  background: "#FFFFFF",
                  border: "1px solid #CBD5E1",
                  color: "#0F172A",
                  padding: "10px 14px",
                  fontSize: "13.5px",
                  borderRadius: "6px",
                  outline: "none",
                  fontFamily: "var(--font-mono)",
                }}
              />

              {/* Quick Preset Asset Chips */}
              <div style={{ marginTop: "10px" }}>
                <div style={{ fontSize: "11px", color: "#64748B", marginBottom: "6px", fontWeight: 500 }}>
                  Quick-Select Atelier Photography:
                </div>
                <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
                  {PRESET_ASSETS.map((asset) => (
                    <button
                      key={asset.url}
                      type="button"
                      onClick={() => setFormBgImage(asset.url)}
                      style={{
                        display: "inline-flex",
                        alignItems: "center",
                        gap: "6px",
                        background: formBgImage === asset.url ? "#ECFDF5" : "#F8FAFC",
                        border: formBgImage === asset.url ? "1px solid #10B981" : "1px solid #E2E8F0",
                        color: formBgImage === asset.url ? "#065F46" : "#475569",
                        padding: "4px 10px",
                        borderRadius: "999px",
                        fontSize: "11px",
                        cursor: "pointer",
                        fontWeight: formBgImage === asset.url ? 600 : 500,
                      }}
                    >
                      <span>{asset.label}</span>
                      {formBgImage === asset.url && <span style={{ color: "#10B981" }}>✓</span>}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Live Visual Preview Card */}
            <div style={{ gridColumn: "span 2", marginTop: "6px" }}>
              <div style={{ fontSize: "11px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: "6px", fontWeight: 600 }}>
                Live Hero Banner Preview
              </div>
              <div style={{
                position: "relative",
                height: "180px",
                borderRadius: "6px",
                overflow: "hidden",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundImage: `url(${formBgImage || "/images/hero_women.png"})`,
                border: "1px solid #E2E8F0",
                display: "flex",
                alignItems: "flex-end",
                padding: "20px 24px",
              }}>
                <div style={{
                  position: "absolute",
                  inset: 0,
                  background: "linear-gradient(0deg, rgba(15, 23, 42, 0.8) 0%, rgba(15, 23, 42, 0.2) 60%, rgba(15, 23, 42, 0.4) 100%)",
                }} />
                <div style={{ position: "relative", zIndex: 2, color: "#FFFFFF" }}>
                  <div style={{ fontSize: "9.5px", letterSpacing: "0.12em", textTransform: "uppercase", opacity: 0.85, fontWeight: 600 }}>
                    {formEyebrow || "EYEBROW TITLE"}
                  </div>
                  <div style={{ fontFamily: "var(--font-serif)", fontSize: "20px", fontWeight: 500, margin: "2px 0 8px" }}>
                    {formTitle || "Main Banner Headline"}
                  </div>
                  <span style={{
                    background: "#FFFFFF",
                    color: "#0F172A",
                    fontSize: "10.5px",
                    fontWeight: 700,
                    padding: "4px 12px",
                    borderRadius: "2px",
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    display: "inline-block",
                  }}>
                    {formCta || "CTA Button"}
                  </span>
                </div>
              </div>
            </div>

            {/* Active Toggle */}
            <div style={{ gridColumn: "span 2", display: "flex", alignItems: "center", gap: "10px", marginTop: "4px" }}>
              <input
                type="checkbox"
                id="formActive"
                checked={formActive}
                onChange={(e) => setFormActive(e.target.checked)}
                style={{ width: "16px", height: "16px", cursor: "pointer", accentColor: "#10B981" }}
              />
              <label htmlFor="formActive" style={{ fontSize: "13px", color: "#334155", cursor: "pointer", fontWeight: 500 }}>
                Publish live immediately to storefront carousel
              </label>
            </div>

            {/* Form Actions */}
            <div style={{ gridColumn: "span 2", display: "flex", gap: "12px", marginTop: "12px" }}>
              <button
                type="submit"
                disabled={saving}
                style={{
                  background: "#10B981",
                  color: "#FFFFFF",
                  border: "none",
                  padding: "11px 24px",
                  fontSize: "13px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  fontWeight: 600,
                  boxShadow: "0 1px 3px rgba(16, 185, 129, 0.3)",
                }}
              >
                {saving ? "Saving Changes..." : editingIndex !== null ? "Update Banner" : "Create & Save Banner"}
              </button>
              <button
                type="button"
                onClick={() => setIsDrawerOpen(false)}
                style={{
                  background: "#FFFFFF",
                  color: "#64748B",
                  border: "1px solid #CBD5E1",
                  padding: "11px 24px",
                  fontSize: "13px",
                  cursor: "pointer",
                  borderRadius: "6px",
                  fontWeight: 500,
                }}
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Main Banner List Table & Cards */}
      <div style={{
        background: "#FFFFFF",
        border: "1px solid #E2E8F0",
        borderRadius: "8px",
        padding: "24px",
        boxShadow: "0 1px 3px rgba(0,0,0,0.03)",
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "18px", paddingBottom: "14px", borderBottom: "1px solid #F1F5F9" }}>
          <div>
            <h2 style={{ fontSize: "15px", margin: 0, fontWeight: 600, color: "#0F172A" }}>
              Active Carousel Slides ({banners.length})
            </h2>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
              Banners rotate every 6 seconds on the homepage hero
            </div>
          </div>
          <div style={{ fontSize: "12px", color: "#64748B", background: "#F8FAFC", border: "1px solid #E2E8F0", padding: "4px 10px", borderRadius: "6px" }}>
            Reorder controls adjust live sequence
          </div>
        </div>

        {loading ? (
          <div style={{ padding: "30px", color: "#64748B", textAlign: "center", fontSize: "13.5px" }}>
            Loading homepage hero banners...
          </div>
        ) : banners.length === 0 ? (
          <div style={{ padding: "40px", textAlign: "center", color: "#94A3B8" }}>
            No banners configured. Click &quot;Add New Banner&quot; above to create one.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            {banners.map((banner, index) => (
              <div
                key={banner.id || index}
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  gap: "20px",
                  padding: "16px",
                  background: banner.active ? "#FFFFFF" : "#F8FAFC",
                  border: banner.active ? "1px solid #E2E8F0" : "1px dashed #CBD5E1",
                  borderRadius: "8px",
                  boxShadow: banner.active ? "0 1px 3px rgba(0,0,0,0.02)" : "none",
                  opacity: banner.active ? 1 : 0.7,
                }}
              >
                {/* Left Thumbnail + Meta */}
                <div style={{ display: "flex", alignItems: "center", gap: "18px", flex: 1, minWidth: 0 }}>
                  {/* Sequence Badge */}
                  <div style={{
                    width: "32px",
                    height: "32px",
                    borderRadius: "6px",
                    background: index === 0 ? "#10B981" : "#F1F5F9",
                    color: index === 0 ? "#FFFFFF" : "#475569",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    fontWeight: 700,
                    fontSize: "12px",
                    flexShrink: 0,
                  }}>
                    #{index + 1}
                  </div>

                  {/* Thumbnail */}
                  <div style={{
                    width: "120px",
                    height: "70px",
                    borderRadius: "6px",
                    overflow: "hidden",
                    backgroundImage: `url(${banner.bgImage})`,
                    backgroundSize: "cover",
                    backgroundPosition: "center",
                    flexShrink: 0,
                    border: "1px solid #E2E8F0",
                    position: "relative",
                  }}>
                    <div style={{
                      position: "absolute",
                      inset: 0,
                      background: "rgba(15, 23, 42, 0.3)",
                    }} />
                  </div>

                  {/* Copy Details */}
                  <div style={{ minWidth: 0, flex: 1 }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "8px", marginBottom: "4px" }}>
                      <span style={{ fontSize: "10.5px", letterSpacing: "0.06em", textTransform: "uppercase", color: "#64748B", fontWeight: 600 }}>
                        {banner.eyebrow}
                      </span>
                      <span style={{
                        fontSize: "10.5px",
                        padding: "1px 7px",
                        borderRadius: "999px",
                        fontWeight: 600,
                        background: banner.active ? "#ECFDF5" : "#F1F5F9",
                        color: banner.active ? "#065F46" : "#64748B",
                        border: banner.active ? "1px solid #A7F3D0" : "1px solid #E2E8F0",
                      }}>
                        {banner.active ? "● Live on Site" : "○ Draft / Hidden"}
                      </span>
                      <span style={{
                        fontSize: "10px",
                        padding: "1px 6px",
                        borderRadius: "4px",
                        background: "#F1F5F9",
                        color: "#475569",
                      }}>
                        {banner.genderFilter || "ALL"}
                      </span>
                    </div>

                    <div style={{ fontFamily: "var(--font-serif)", fontSize: "17px", fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                      {banner.title}
                    </div>

                    <div style={{ fontSize: "12px", color: "#64748B", marginTop: "3px", display: "flex", gap: "10px", alignItems: "center" }}>
                      <span>CTA: <strong style={{ color: "#334155" }}>{banner.cta}</strong></span>
                      <span>•</span>
                      <span style={{ fontFamily: "var(--font-mono)", fontSize: "11px" }}>Link: {banner.link || "—"}</span>
                    </div>
                  </div>
                </div>

                {/* Right Actions: Reorder + Toggle + Edit + Delete */}
                <div style={{ display: "flex", alignItems: "center", gap: "8px", flexShrink: 0 }}>
                  {/* Move Up / Down */}
                  <button
                    type="button"
                    disabled={index === 0}
                    onClick={() => moveUp(index)}
                    title="Move slide earlier in rotation"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      color: index === 0 ? "#CBD5E1" : "#475569",
                      cursor: index === 0 ? "not-allowed" : "pointer",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    ▲
                  </button>
                  <button
                    type="button"
                    disabled={index === banners.length - 1}
                    onClick={() => moveDown(index)}
                    title="Move slide later in rotation"
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #E2E8F0",
                      color: index === banners.length - 1 ? "#CBD5E1" : "#475569",
                      cursor: index === banners.length - 1 ? "not-allowed" : "pointer",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      fontWeight: 600,
                    }}
                  >
                    ▼
                  </button>

                  {/* Toggle Active */}
                  <button
                    type="button"
                    onClick={() => toggleActive(index)}
                    style={{
                      background: banner.active ? "#FEF3C7" : "#ECFDF5",
                      border: banner.active ? "1px solid #FCD34D" : "1px solid #A7F3D0",
                      color: banner.active ? "#92400E" : "#065F46",
                      padding: "6px 12px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    {banner.active ? "Hide" : "Publish"}
                  </button>

                  {/* Edit */}
                  <button
                    type="button"
                    onClick={() => openEditDrawer(index)}
                    style={{
                      background: "#F8FAFC",
                      border: "1px solid #CBD5E1",
                      color: "#0F172A",
                      padding: "6px 14px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: "pointer",
                      fontWeight: 600,
                    }}
                  >
                    Edit
                  </button>

                  {/* Delete */}
                  <button
                    type="button"
                    onClick={() => deleteBanner(index)}
                    title="Delete banner"
                    style={{
                      background: "none",
                      border: "1px solid #FEE2E2",
                      color: "#EF4444",
                      padding: "6px 10px",
                      borderRadius: "4px",
                      fontSize: "12px",
                      cursor: "pointer",
                    }}
                  >
                    Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
