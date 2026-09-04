"use client";

import React, { useState, useEffect } from "react";
import type {
  NewInConfig,
  MegaMenuConfig,
  DepartmentMegaConfig,
  RunwayConfig,
  LookbookTile,
  BespokeTeaserConfig,
} from "@/lib/home-data";

interface Slide {
  eyebrow: string;
  title: string;
  cta: string;
  tone1: string;
  tone2: string;
  bgImage: string;
  genderFilter?: string;
  actionScroll?: string;
}

const DEFAULT_RUNWAY: RunwayConfig = {
  active: true,
  eyebrow: "Autumn/Winter Collection",
  title: "See it move on the runway",
  mode: "film",
  videoUrl: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-runway-show-41843-large.mp4",
  posterImage: "/images/hero_runway.png",
  videoLabel: 'RUNWAY FILM — "VEENA AW26" — 02:14',
  quote: '"Movement is the true test of a garment."',
  lookbookTiles: [
    { label: "LOOK 01", image: "/images/hero_women.png", tone1: "#d8cdb6", tone2: "#a99c7d" },
    { label: "LOOK 02", image: "/images/hero_men.png", tone1: "#5a5952", tone2: "#2b2a26" },
    { label: "LOOK 03", image: "/images/atelier.png", tone1: "#2f5c48", tone2: "#123024" },
    { label: "LOOK 04", image: "/images/hero_runway.png", tone1: "#efe6d0", tone2: "#cbbf9c" },
  ],
};

const DEFAULT_NEW_IN: NewInConfig = {
  active: true,
  title: "New in",
  eyebrow: "Autumn/Winter Collection",
  limit: 3,
  viewAllText: "View all",
  viewAllHref: "/products",
};

const DEFAULT_BESPOKE: BespokeTeaserConfig = {
  active: true,
  eyebrow: "Made to Measure",
  title: "A garment built around you",
  description:
    "From a single alteration to a fully bespoke piece, our atelier works with your measurements, fabric preferences and timeline.",
  ctaText: "Start a bespoke request",
  ctaAction: "modal",
  ctaHref: "/bespoke",
  image: "/images/atelier.png",
};

const DEFAULT_MEGA: MegaMenuConfig = {
  women: {
    overviewLabel: "All Women's Collection",
    col1Title: "Signature Pieces",
    col2Title: "Dresses & Atelier",
    editorial: {
      eyebrow: "Signature Atelier",
      title: "The Bubu Silhouette & Hand-Woven Silks",
      image: "/images/hero_women.png",
      href: "/products?gender=WOMEN&category=women-bubu",
      cta: "Explore Atelier Women",
    },
  },
  men: {
    overviewLabel: "All Men's Collection",
    col1Title: "Tailoring & Sets",
    col2Title: "Casuals & Tops",
    editorial: {
      eyebrow: "Atelier Tailoring",
      title: "Architectural Precision & Modern Cuts",
      image: "/images/hero_men.png",
      href: "/products?gender=MEN",
      cta: "Explore Atelier Men",
    },
  },
  accessories: {
    overviewLabel: "All Accessories",
    col1Title: "Adornments & Jewelry",
    col2Title: "Leather & Daily Luxury",
    editorial: {
      eyebrow: "Fine Accents",
      title: "Handcrafted Bags & Sculptural Jewelry",
      image: "/images/accessories.png",
      href: "/products?category=accessories",
      cta: "Shop Accessories",
    },
  },
  lifestyle: {
    overviewLabel: "All Lifestyle",
    col1Title: "Soft Furnishings & Living",
    col2Title: "Dining & Accents",
    editorial: {
      eyebrow: "Living with Veena",
      title: "Artisanal Comfort for Inspired Living",
      image: "/images/atelier.png",
      href: "/products?category=lifestyle",
      cta: "Explore Lifestyle",
    },
  },
};

const DEPARTMENTS = [
  { id: "women", name: "Women" },
  { id: "men", name: "Men" },
  { id: "accessories", name: "Accessories" },
  { id: "lifestyle", name: "Lifestyle" },
];

export default function AdminHomepageConfigPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [runway, setRunway] = useState<RunwayConfig>(DEFAULT_RUNWAY);
  const [runwaySubTab, setRunwaySubTab] = useState<"video" | "lookbook">("video");
  const [newIn, setNewIn] = useState<NewInConfig>(DEFAULT_NEW_IN);
  const [bespoke, setBespoke] = useState<BespokeTeaserConfig>(DEFAULT_BESPOKE);
  const [megaMenu, setMegaMenu] = useState<MegaMenuConfig>(DEFAULT_MEGA);
  const [activeDept, setActiveDept] = useState<string>("women");

  const [loading, setLoading] = useState(true);
  const [savingKey, setSavingKey] = useState<string | null>(null);
  const [savedKey, setSavedKey] = useState<string | null>(null);

  useEffect(() => {
    async function fetchConfigs() {
      try {
        const res = await fetch("/api/admin/homepage");
        if (res.ok) {
          const data = await res.json();
          const slideConfig = data.configs?.find((c: any) => c.key === "hero_slides");
          const runwayConfig = data.configs?.find((c: any) => c.key === "runway_switch");
          const newInConfig = data.configs?.find((c: any) => c.key === "new_in_config");
          const bespokeConfig = data.configs?.find((c: any) => c.key === "bespoke_teaser_config");
          const megaConfig = data.configs?.find((c: any) => c.key === "mega_menu_config");

          if (slideConfig) {
            try {
              setSlides(JSON.parse(slideConfig.value));
            } catch (e) {
              console.error(e);
            }
          }

          if (runwayConfig) {
            try {
              const parsed = JSON.parse(runwayConfig.value);
              setRunway({
                ...DEFAULT_RUNWAY,
                ...parsed,
                lookbookTiles:
                  parsed.lookbookTiles && parsed.lookbookTiles.length > 0
                    ? parsed.lookbookTiles
                    : DEFAULT_RUNWAY.lookbookTiles,
              });
            } catch (e) {
              console.error(e);
            }
          }

          if (newInConfig) {
            try {
              const parsed = JSON.parse(newInConfig.value);
              setNewIn({ ...DEFAULT_NEW_IN, ...parsed });
            } catch (e) {
              console.error(e);
            }
          }

          if (bespokeConfig) {
            try {
              const parsed = JSON.parse(bespokeConfig.value);
              setBespoke({ ...DEFAULT_BESPOKE, ...parsed });
            } catch (e) {
              console.error(e);
            }
          }

          if (megaConfig) {
            try {
              const parsed = JSON.parse(megaConfig.value);
              setMegaMenu({
                women: { ...DEFAULT_MEGA.women, ...(parsed.women || {}) },
                men: { ...DEFAULT_MEGA.men, ...(parsed.men || {}) },
                accessories: { ...DEFAULT_MEGA.accessories, ...(parsed.accessories || {}) },
                lifestyle: { ...DEFAULT_MEGA.lifestyle, ...(parsed.lifestyle || {}) },
              });
            } catch (e) {
              console.error(e);
            }
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchConfigs();
  }, []);

  const handleSlideChange = (index: number, field: keyof Slide, value: string) => {
    const updated = [...slides];
    updated[index] = { ...updated[index], [field]: value };
    setSlides(updated);
  };

  const handleRunwayChange = (field: keyof RunwayConfig, value: any) => {
    setRunway((prev) => ({ ...prev, [field]: value }));
  };

  const handleLookbookTileChange = (index: number, field: keyof LookbookTile, value: string) => {
    setRunway((prev) => {
      const currentTiles = [...(prev.lookbookTiles || DEFAULT_RUNWAY.lookbookTiles || [])];
      currentTiles[index] = {
        ...currentTiles[index],
        [field]: value,
      };
      return { ...prev, lookbookTiles: currentTiles };
    });
  };

  const handleNewInChange = (field: keyof NewInConfig, value: any) => {
    setNewIn((prev) => ({ ...prev, [field]: value }));
  };

  const handleBespokeChange = (field: keyof BespokeTeaserConfig, value: any) => {
    setBespoke((prev) => ({ ...prev, [field]: value }));
  };

  const handleMegaDeptChange = (
    deptId: string,
    field: "overviewLabel" | "col1Title" | "col2Title",
    value: string
  ) => {
    setMegaMenu((prev) => ({
      ...prev,
      [deptId]: {
        ...prev[deptId],
        [field]: value,
      },
    }));
  };

  const handleMegaEditorialChange = (
    deptId: string,
    field: "eyebrow" | "title" | "image" | "href" | "cta",
    value: string
  ) => {
    setMegaMenu((prev) => ({
      ...prev,
      [deptId]: {
        ...prev[deptId],
        editorial: {
          ...(prev[deptId]?.editorial || {}),
          [field]: value,
        },
      },
    }));
  };

  const handleSave = async (
    key: "hero_slides" | "runway_switch" | "new_in_config" | "mega_menu_config" | "bespoke_teaser_config"
  ) => {
    setSavingKey(key);
    let value = "";
    if (key === "hero_slides") value = JSON.stringify(slides);
    else if (key === "runway_switch") value = JSON.stringify(runway);
    else if (key === "new_in_config") value = JSON.stringify(newIn);
    else if (key === "mega_menu_config") value = JSON.stringify(megaMenu);
    else if (key === "bespoke_teaser_config") value = JSON.stringify(bespoke);

    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      if (res.ok) {
        setSavedKey(key);
        setTimeout(() => setSavedKey((cur) => (cur === key ? null : cur)), 2500);
      } else {
        alert("Failed to save configuration");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving configuration");
    } finally {
      setSavingKey(null);
    }
  };

  if (loading) {
    return (
      <div style={{ color: "rgba(246,242,234,0.5)", padding: "20px" }}>
        Loading homepage configurations...
      </div>
    );
  }

  const cardStyle: React.CSSProperties = {
    background: "#15130F",
    border: "1px solid rgba(246, 242, 234, 0.08)",
    borderRadius: "4px",
    padding: "26px",
    marginBottom: "32px",
  };

  const labelStyle: React.CSSProperties = {
    display: "block",
    fontSize: "11px",
    color: "rgba(246,242,234,0.5)",
    marginBottom: "6px",
    textTransform: "uppercase",
    fontWeight: 600,
    letterSpacing: "0.04em",
  };

  const inputStyle: React.CSSProperties = {
    width: "100%",
    background: "#0F0E0B",
    border: "1px solid rgba(246,242,234,0.15)",
    color: "#F6F2EA",
    padding: "10px 12px",
    fontSize: "13.5px",
    borderRadius: "2px",
    outline: "none",
  };

  const currentDeptConfig: DepartmentMegaConfig =
    megaMenu[activeDept] || DEFAULT_MEGA[activeDept] || {};
  const currentEditorial = currentDeptConfig.editorial || {};

  return (
    <div style={{ maxWidth: "1120px" }}>
      {/* Title Header */}
      <div style={{ marginBottom: "34px" }}>
        <h1
          style={{
            fontFamily: "var(--font-serif)",
            fontSize: "30px",
            margin: 0,
            fontWeight: 500,
          }}
        >
          Homepage & Navigation Customizer
        </h1>
        <div
          style={{
            fontSize: "13px",
            color: "rgba(246, 242, 234, 0.5)",
            marginTop: "4px",
          }}
        >
          Manage live carousel slides, Runway video/lookbook media, New In arrivals, Bespoke Atelier teasers, and Mega Menu navigation.
        </div>
      </div>

      {/* 1. HERO SLIDES EDITOR */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(246,242,234,0.08)",
            paddingBottom: "14px",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "16px", margin: 0, fontWeight: 600 }}>
              Hero Carousel Slides
            </h2>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(246,242,234,0.45)",
                marginTop: "2px",
              }}
            >
              Top rotating luxury banners
            </div>
          </div>
          <button
            onClick={() => handleSave("hero_slides")}
            disabled={savingKey === "hero_slides"}
            style={{
              background:
                savedKey === "hero_slides" ? "var(--color-emerald)" : "#F6F2EA",
              color: savedKey === "hero_slides" ? "#F6F2EA" : "#15130F",
              border: "none",
              padding: "7px 16px",
              fontSize: "12px",
              borderRadius: "2px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
          >
            {savingKey === "hero_slides"
              ? "Saving..."
              : savedKey === "hero_slides"
              ? "Saved ✓"
              : "Save Slides"}
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {slides.map((slide, i) => (
            <div
              key={i}
              style={{
                borderBottom:
                  i < slides.length - 1
                    ? "1px dashed rgba(246,242,234,0.08)"
                    : "none",
                paddingBottom: i < slides.length - 1 ? "24px" : 0,
              }}
            >
              <h3
                style={{
                  fontSize: "13px",
                  margin: "0 0 16px",
                  color: "var(--color-emerald)",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
                }}
              >
                Slide 0{i + 1}
              </h3>
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr",
                  gap: "16px",
                }}
              >
                <div>
                  <label style={labelStyle}>Eyebrow text</label>
                  <input
                    type="text"
                    value={slide.eyebrow}
                    onChange={(e) =>
                      handleSlideChange(i, "eyebrow", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Headline text</label>
                  <input
                    type="text"
                    value={slide.title}
                    onChange={(e) =>
                      handleSlideChange(i, "title", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>CTA Button Label</label>
                  <input
                    type="text"
                    value={slide.cta}
                    onChange={(e) => handleSlideChange(i, "cta", e.target.value)}
                    style={inputStyle}
                  />
                </div>
                <div>
                  <label style={labelStyle}>Asset Background Path</label>
                  <input
                    type="text"
                    value={slide.bgImage}
                    onChange={(e) =>
                      handleSlideChange(i, "bgImage", e.target.value)
                    }
                    style={inputStyle}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. RUNWAY & LOOKBOOK EXPERIENCE CONFIG */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(246,242,234,0.08)",
            paddingBottom: "14px",
            marginBottom: "24px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "16px", margin: 0, fontWeight: 600 }}>
                Runway & Lookbook Experience (Video / Image)
              </h2>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  background:
                    runway.active !== false
                      ? "rgba(47, 92, 72, 0.2)"
                      : "rgba(255,255,255,0.08)",
                  color:
                    runway.active !== false
                      ? "#81c784"
                      : "rgba(246,242,234,0.5)",
                  border: `1px solid ${
                    runway.active !== false
                      ? "rgba(47, 92, 72, 0.4)"
                      : "rgba(255,255,255,0.1)"
                  }`,
                }}
              >
                {runway.active !== false ? "Visible on Homepage" : "Hidden"}
              </span>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(246,242,234,0.45)",
                marginTop: "2px",
              }}
            >
              Manage runway video stream, cover image, editorial quotes, and lookbook gallery images
            </div>
          </div>
          <button
            onClick={() => handleSave("runway_switch")}
            disabled={savingKey === "runway_switch"}
            style={{
              background:
                savedKey === "runway_switch"
                  ? "var(--color-emerald)"
                  : "#F6F2EA",
              color: savedKey === "runway_switch" ? "#F6F2EA" : "#15130F",
              border: "none",
              padding: "7px 16px",
              fontSize: "12px",
              borderRadius: "2px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
          >
            {savingKey === "runway_switch"
              ? "Saving..."
              : savedKey === "runway_switch"
              ? "Saved ✓"
              : "Save Runway Config"}
          </button>
        </div>

        {/* General Section Controls */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr 1fr 1fr",
            gap: "16px",
            marginBottom: "24px",
            paddingBottom: "20px",
            borderBottom: "1px dashed rgba(246,242,234,0.08)",
          }}
        >
          <div>
            <label style={labelStyle}>Section Display Status</label>
            <div
              onClick={() =>
                handleRunwayChange("active", runway.active === false ? true : false)
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "10px",
                background: "#0F0E0B",
                border: "1px solid rgba(246,242,234,0.15)",
                padding: "8px 12px",
                borderRadius: "2px",
                cursor: "pointer",
                height: "40px",
              }}
            >
              <div
                style={{
                  width: "32px",
                  height: "18px",
                  borderRadius: "10px",
                  background:
                    runway.active !== false
                      ? "var(--color-emerald)"
                      : "rgba(255,255,255,0.15)",
                  position: "relative",
                  transition: "background 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "14px",
                    height: "14px",
                    borderRadius: "50%",
                    background: "#F6F2EA",
                    position: "absolute",
                    top: "2px",
                    left: runway.active !== false ? "16px" : "2px",
                    transition: "left 0.2s ease",
                  }}
                />
              </div>
              <span style={{ fontSize: "12px", color: "#F6F2EA" }}>
                {runway.active !== false ? "Visible" : "Hidden"}
              </span>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Default Mode for Visitors</label>
            <select
              value={runway.mode}
              onChange={(e) => handleRunwayChange("mode", e.target.value)}
              style={{ ...inputStyle, height: "40px" }}
            >
              <option value="film">Runway Film (Video & Cover)</option>
              <option value="lookbook">Static Grid Lookbook (Images)</option>
            </select>
          </div>

          <div>
            <label style={labelStyle}>Eyebrow text</label>
            <input
              type="text"
              value={runway.eyebrow || ""}
              onChange={(e) => handleRunwayChange("eyebrow", e.target.value)}
              placeholder="Autumn/Winter Collection"
              style={{ ...inputStyle, height: "40px" }}
            />
          </div>

          <div>
            <label style={labelStyle}>Section Title</label>
            <input
              type="text"
              value={runway.title || ""}
              onChange={(e) => handleRunwayChange("title", e.target.value)}
              placeholder="See it move on the runway"
              style={{ ...inputStyle, height: "40px" }}
            />
          </div>
        </div>

        {/* Media Tabs: Video vs Lookbook */}
        <div style={{ display: "flex", gap: "8px", marginBottom: "20px" }}>
          <button
            onClick={() => setRunwaySubTab("video")}
            style={{
              padding: "7px 16px",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
              border:
                runwaySubTab === "video"
                  ? "1px solid var(--color-emerald)"
                  : "1px solid rgba(246,242,234,0.12)",
              background:
                runwaySubTab === "video"
                  ? "rgba(47, 92, 72, 0.2)"
                  : "#0F0E0B",
              color:
                runwaySubTab === "video" ? "#F6F2EA" : "rgba(246,242,234,0.6)",
              borderRadius: "2px",
              cursor: "pointer",
            }}
          >
            1. Runway Video & Poster Cover
          </button>
          <button
            onClick={() => setRunwaySubTab("lookbook")}
            style={{
              padding: "7px 16px",
              fontSize: "12px",
              textTransform: "uppercase",
              letterSpacing: "0.06em",
              fontWeight: 600,
              border:
                runwaySubTab === "lookbook"
                  ? "1px solid var(--color-emerald)"
                  : "1px solid rgba(246,242,234,0.12)",
              background:
                runwaySubTab === "lookbook"
                  ? "rgba(47, 92, 72, 0.2)"
                  : "#0F0E0B",
              color:
                runwaySubTab === "lookbook"
                  ? "#F6F2EA"
                  : "rgba(246,242,234,0.6)",
              borderRadius: "2px",
              cursor: "pointer",
            }}
          >
            2. Lookbook Gallery Images (4 Tiles)
          </button>
        </div>

        {runwaySubTab === "video" ? (
          /* VIDEO & COVER IMAGE SETTINGS */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "1.2fr 1fr",
              gap: "24px",
              alignItems: "start",
            }}
          >
            <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Runway Video Stream / MP4 URL</label>
                <input
                  type="text"
                  value={runway.videoUrl || ""}
                  onChange={(e) => handleRunwayChange("videoUrl", e.target.value)}
                  placeholder="https://assets.mixkit.co/... or /videos/runway.mp4"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Video Cover / Poster Image URL</label>
                <input
                  type="text"
                  value={runway.posterImage || ""}
                  onChange={(e) =>
                    handleRunwayChange("posterImage", e.target.value)
                  }
                  placeholder="/images/hero_runway.png"
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Video Subtitle / Timestamp Badge</label>
                <input
                  type="text"
                  value={runway.videoLabel || ""}
                  onChange={(e) =>
                    handleRunwayChange("videoLabel", e.target.value)
                  }
                  placeholder='RUNWAY FILM — "VEENA AW26" — 02:14'
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>Editorial Italic Quote</label>
                <input
                  type="text"
                  value={runway.quote || ""}
                  onChange={(e) => handleRunwayChange("quote", e.target.value)}
                  placeholder='"Movement is the true test of a garment."'
                  style={inputStyle}
                />
              </div>
            </div>

            {/* Live Video Cover Preview */}
            <div
              style={{
                background: "#0F0E0B",
                border: "1px solid rgba(246, 242, 234, 0.1)",
                borderRadius: "4px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  fontSize: "11px",
                  textTransform: "uppercase",
                  letterSpacing: "0.08em",
                  color: "rgba(246,242,234,0.45)",
                  marginBottom: "12px",
                  fontWeight: 600,
                }}
              >
                Live Video Banner Preview
              </div>

              <div
                style={{
                  position: "relative",
                  aspectRatio: "16/9",
                  borderRadius: "3px",
                  overflow: "hidden",
                  backgroundImage: `url(${
                    runway.posterImage || "/images/hero_runway.png"
                  })`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "center",
                  justifyContent: "center",
                  boxShadow: "0 8px 24px rgba(0,0,0,0.5)",
                }}
              >
                <div
                  style={{
                    position: "absolute",
                    inset: 0,
                    background: "rgba(15, 14, 11, 0.45)",
                  }}
                />

                <div
                  style={{
                    position: "relative",
                    zIndex: 1,
                    display: "flex",
                    flexDirection: "column",
                    alignItems: "center",
                    gap: "8px",
                  }}
                >
                  <div
                    style={{
                      width: "44px",
                      height: "44px",
                      borderRadius: "50%",
                      background: "rgba(246, 242, 234, 0.92)",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      fontSize: "15px",
                      color: "#15130F",
                      paddingLeft: "3px",
                    }}
                  >
                    ▶
                  </div>
                  <span
                    style={{
                      fontFamily: "var(--font-mono, monospace)",
                      fontSize: "9px",
                      letterSpacing: "0.06em",
                      color: "rgba(246, 242, 234, 0.75)",
                    }}
                  >
                    {runway.videoLabel || 'RUNWAY FILM — "VEENA AW26"'}
                  </span>
                </div>

                {runway.quote && (
                  <div
                    style={{
                      position: "absolute",
                      left: "14px",
                      bottom: "10px",
                      color: "#F6F2EA",
                      fontFamily: "var(--font-serif, serif)",
                      fontSize: "12px",
                      fontStyle: "italic",
                      opacity: 0.85,
                      zIndex: 1,
                    }}
                  >
                    {runway.quote}
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* LOOKBOOK TILES SETTINGS */
          <div>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(4, 1fr)",
                gap: "16px",
                marginBottom: "20px",
              }}
            >
              {(
                runway.lookbookTiles || DEFAULT_RUNWAY.lookbookTiles || []
              ).map((tile, i) => (
                <div
                  key={i}
                  style={{
                    background: "#0F0E0B",
                    border: "1px solid rgba(246, 242, 234, 0.1)",
                    borderRadius: "4px",
                    padding: "14px",
                  }}
                >
                  <h4
                    style={{
                      fontSize: "12px",
                      margin: "0 0 10px",
                      color: "var(--color-emerald)",
                      fontWeight: 600,
                    }}
                  >
                    Look Tile 0{i + 1}
                  </h4>

                  <div style={{ marginBottom: "10px" }}>
                    <label style={labelStyle}>Label</label>
                    <input
                      type="text"
                      value={tile.label}
                      onChange={(e) =>
                        handleLookbookTileChange(i, "label", e.target.value)
                      }
                      style={{ ...inputStyle, fontSize: "12px", padding: "6px 8px" }}
                    />
                  </div>

                  <div style={{ marginBottom: "12px" }}>
                    <label style={labelStyle}>Image URL</label>
                    <input
                      type="text"
                      value={tile.image || ""}
                      onChange={(e) =>
                        handleLookbookTileChange(i, "image", e.target.value)
                      }
                      placeholder="/images/hero_women.png"
                      style={{ ...inputStyle, fontSize: "12px", padding: "6px 8px" }}
                    />
                  </div>

                  <div
                    style={{
                      aspectRatio: "3/4",
                      borderRadius: "2px",
                      backgroundImage: tile.image ? `url(${tile.image})` : undefined,
                      background: tile.image
                        ? undefined
                        : `linear-gradient(160deg, ${tile.tone1 || "#3c3b36"} 0%, ${
                            tile.tone2 || "#191815"
                          } 100%)`,
                      backgroundSize: "cover",
                      backgroundPosition: "center",
                      position: "relative",
                      overflow: "hidden",
                    }}
                  >
                    <div
                      style={{
                        position: "absolute",
                        inset: 0,
                        background:
                          "linear-gradient(180deg, rgba(15,14,11,0.1) 0%, rgba(15,14,11,0.7) 100%)",
                      }}
                    />
                    <div
                      style={{
                        position: "absolute",
                        left: "10px",
                        bottom: "8px",
                        color: "#F6F2EA",
                        fontFamily: "var(--font-mono, monospace)",
                        fontSize: "9px",
                        letterSpacing: "0.08em",
                        fontWeight: 600,
                      }}
                    >
                      {tile.label}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* 3. NEW IN HOMEPAGE SECTION CONFIG */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(246,242,234,0.08)",
            paddingBottom: "14px",
            marginBottom: "24px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "16px", margin: 0, fontWeight: 600 }}>
                Homepage [ New In ] Section
              </h2>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  background:
                    newIn.active !== false
                      ? "rgba(47, 92, 72, 0.2)"
                      : "rgba(255,255,255,0.08)",
                  color:
                    newIn.active !== false
                      ? "#81c784"
                      : "rgba(246,242,234,0.5)",
                  border: `1px solid ${
                    newIn.active !== false
                      ? "rgba(47, 92, 72, 0.4)"
                      : "rgba(255,255,255,0.1)"
                  }`,
                }}
              >
                {newIn.active !== false ? "Visible on Homepage" : "Hidden"}
              </span>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(246,242,234,0.45)",
                marginTop: "2px",
              }}
            >
              Control new arrival headlines, product count limits, and link destination
            </div>
          </div>
          <button
            onClick={() => handleSave("new_in_config")}
            disabled={savingKey === "new_in_config"}
            style={{
              background:
                savedKey === "new_in_config"
                  ? "var(--color-emerald)"
                  : "#F6F2EA",
              color: savedKey === "new_in_config" ? "#F6F2EA" : "#15130F",
              border: "none",
              padding: "7px 16px",
              fontSize: "12px",
              borderRadius: "2px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
          >
            {savingKey === "new_in_config"
              ? "Saving..."
              : savedKey === "new_in_config"
              ? "Saved ✓"
              : "Save New In Config"}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "20px",
          }}
        >
          <div>
            <label style={labelStyle}>Section Display Status</label>
            <div
              onClick={() =>
                handleNewInChange("active", newIn.active === false ? true : false)
              }
              style={{
                display: "flex",
                alignItems: "center",
                gap: "12px",
                background: "#0F0E0B",
                border: "1px solid rgba(246,242,234,0.15)",
                padding: "8px 12px",
                borderRadius: "2px",
                cursor: "pointer",
              }}
            >
              <div
                style={{
                  width: "36px",
                  height: "20px",
                  borderRadius: "10px",
                  background:
                    newIn.active !== false
                      ? "var(--color-emerald)"
                      : "rgba(255,255,255,0.15)",
                  position: "relative",
                  transition: "background 0.2s ease",
                }}
              >
                <div
                  style={{
                    width: "16px",
                    height: "16px",
                    borderRadius: "50%",
                    background: "#F6F2EA",
                    position: "absolute",
                    top: "2px",
                    left: newIn.active !== false ? "18px" : "2px",
                    transition: "left 0.2s ease",
                  }}
                />
              </div>
              <span style={{ fontSize: "13px", color: "#F6F2EA" }}>
                {newIn.active !== false
                  ? "Section is Active & Visible"
                  : "Section is Disabled / Hidden"}
              </span>
            </div>
          </div>

          <div>
            <label style={labelStyle}>
              Display Count Limit (Products to Show)
            </label>
            <input
              type="number"
              min={1}
              max={12}
              value={newIn.limit || 3}
              onChange={(e) =>
                handleNewInChange("limit", parseInt(e.target.value, 10) || 3)
              }
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Eyebrow Subheading</label>
            <input
              type="text"
              placeholder="e.g. Autumn/Winter Collection"
              value={newIn.eyebrow || ""}
              onChange={(e) => handleNewInChange("eyebrow", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Main Section Title</label>
            <input
              type="text"
              placeholder="e.g. New in — Women"
              value={newIn.title || ""}
              onChange={(e) => handleNewInChange("title", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>View All Link Label</label>
            <input
              type="text"
              placeholder="View all"
              value={newIn.viewAllText || ""}
              onChange={(e) => handleNewInChange("viewAllText", e.target.value)}
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>View All Destination URL</label>
            <input
              type="text"
              placeholder="/products"
              value={newIn.viewAllHref || ""}
              onChange={(e) => handleNewInChange("viewAllHref", e.target.value)}
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* 4. MEGA MENU & EDITORIAL SPOTLIGHT CONFIG */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(246,242,234,0.08)",
            paddingBottom: "14px",
            marginBottom: "24px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "16px", margin: 0, fontWeight: 600 }}>
              Mega Menu & Editorial Spotlight Config
            </h2>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(246,242,234,0.45)",
                marginTop: "2px",
              }}
            >
              Customize column header titles, overview links, and editorial showcase cards per department
            </div>
          </div>
          <button
            onClick={() => handleSave("mega_menu_config")}
            disabled={savingKey === "mega_menu_config"}
            style={{
              background:
                savedKey === "mega_menu_config"
                  ? "var(--color-emerald)"
                  : "#F6F2EA",
              color: savedKey === "mega_menu_config" ? "#F6F2EA" : "#15130F",
              border: "none",
              padding: "7px 16px",
              fontSize: "12px",
              borderRadius: "2px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
          >
            {savingKey === "mega_menu_config"
              ? "Saving..."
              : savedKey === "mega_menu_config"
              ? "Saved ✓"
              : "Save Mega Menu Config"}
          </button>
        </div>

        {/* Department Switcher Tabs */}
        <div
          style={{
            display: "flex",
            gap: "8px",
            borderBottom: "1px solid rgba(246,242,234,0.1)",
            paddingBottom: "12px",
            marginBottom: "24px",
          }}
        >
          {DEPARTMENTS.map((dept) => {
            const isSelected = activeDept === dept.id;
            return (
              <button
                key={dept.id}
                onClick={() => setActiveDept(dept.id)}
                style={{
                  padding: "8px 18px",
                  fontSize: "12.5px",
                  textTransform: "uppercase",
                  letterSpacing: "0.06em",
                  fontWeight: 600,
                  border: isSelected
                    ? "1px solid var(--color-emerald)"
                    : "1px solid rgba(246,242,234,0.12)",
                  background: isSelected
                    ? "rgba(47, 92, 72, 0.2)"
                    : "#0F0E0B",
                  color: isSelected ? "#F6F2EA" : "rgba(246,242,234,0.6)",
                  borderRadius: "2px",
                  cursor: "pointer",
                  transition: "all 0.15s ease",
                }}
              >
                {dept.name}
              </button>
            );
          })}
        </div>

        {/* Tab Content */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "28px",
            alignItems: "start",
          }}
        >
          {/* Edit Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <h3
              style={{
                fontSize: "13px",
                margin: "0 0 6px",
                color: "var(--color-emerald)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              {DEPARTMENTS.find((d) => d.id === activeDept)?.name} — Column & Link Labels
            </h3>

            <div>
              <label style={labelStyle}>Department Overview Link Label</label>
              <input
                type="text"
                placeholder="e.g. All Women's Collection"
                value={currentDeptConfig.overviewLabel || ""}
                onChange={(e) =>
                  handleMegaDeptChange(activeDept, "overviewLabel", e.target.value)
                }
                style={inputStyle}
              />
            </div>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <div>
                <label style={labelStyle}>Column 1 Header Title</label>
                <input
                  type="text"
                  placeholder="e.g. Signature Pieces"
                  value={currentDeptConfig.col1Title || ""}
                  onChange={(e) =>
                    handleMegaDeptChange(activeDept, "col1Title", e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>Column 2 Header Title</label>
                <input
                  type="text"
                  placeholder="e.g. Dresses & Atelier"
                  value={currentDeptConfig.col2Title || ""}
                  onChange={(e) =>
                    handleMegaDeptChange(activeDept, "col2Title", e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
            </div>

            <h3
              style={{
                fontSize: "13px",
                margin: "16px 0 6px",
                color: "var(--color-emerald)",
                fontWeight: 600,
                textTransform: "uppercase",
                letterSpacing: "0.05em",
              }}
            >
              Editorial Spotlight Card (Right 30% Column)
            </h3>

            <div
              style={{
                display: "grid",
                gridTemplateColumns: "1fr 1fr",
                gap: "14px",
              }}
            >
              <div>
                <label style={labelStyle}>Spotlight Eyebrow</label>
                <input
                  type="text"
                  placeholder="e.g. Signature Atelier"
                  value={currentEditorial.eyebrow || ""}
                  onChange={(e) =>
                    handleMegaEditorialChange(activeDept, "eyebrow", e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
              <div>
                <label style={labelStyle}>CTA Button Label</label>
                <input
                  type="text"
                  placeholder="e.g. Explore Atelier Women"
                  value={currentEditorial.cta || ""}
                  onChange={(e) =>
                    handleMegaEditorialChange(activeDept, "cta", e.target.value)
                  }
                  style={inputStyle}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Spotlight Headline Title</label>
              <input
                type="text"
                placeholder="e.g. The Bubu Silhouette & Hand-Woven Silks"
                value={currentEditorial.title || ""}
                onChange={(e) =>
                  handleMegaEditorialChange(activeDept, "title", e.target.value)
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Spotlight Image URL</label>
              <input
                type="text"
                placeholder="/images/hero_women.png"
                value={currentEditorial.image || ""}
                onChange={(e) =>
                  handleMegaEditorialChange(activeDept, "image", e.target.value)
                }
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Destination Link URL</label>
              <input
                type="text"
                placeholder="/products?gender=WOMEN&category=women-bubu"
                value={currentEditorial.href || ""}
                onChange={(e) =>
                  handleMegaEditorialChange(activeDept, "href", e.target.value)
                }
                style={inputStyle}
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div
            style={{
              background: "#0F0E0B",
              border: "1px solid rgba(246, 242, 234, 0.1)",
              borderRadius: "4px",
              padding: "18px",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "rgba(246,242,234,0.45)",
                marginBottom: "14px",
                fontWeight: 600,
              }}
            >
              Live Dropdown Card Preview
            </div>

            <div
              style={{
                position: "relative",
                aspectRatio: "4/3",
                borderRadius: "3px",
                overflow: "hidden",
                backgroundImage: `url(${
                  currentEditorial.image || "/images/hero_women.png"
                })`,
                backgroundSize: "cover",
                backgroundPosition: "center",
                display: "flex",
                flexDirection: "column",
                justifyContent: "flex-end",
                padding: "20px",
                boxShadow: "0 10px 30px rgba(0,0,0,0.5)",
              }}
            >
              {/* Gradient Scrim */}
              <div
                style={{
                  position: "absolute",
                  inset: 0,
                  background:
                    "linear-gradient(180deg, rgba(21,19,15,0.1) 0%, rgba(21,19,15,0.85) 100%)",
                }}
              />

              {/* Text Overlays */}
              <div style={{ position: "relative", zIndex: 1 }}>
                <span
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "9.5px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "rgba(246,242,234,0.85)",
                    display: "block",
                    marginBottom: "6px",
                  }}
                >
                  {currentEditorial.eyebrow || "Spotlight"}
                </span>
                <div
                  style={{
                    fontFamily: "var(--font-serif, serif)",
                    fontSize: "16px",
                    fontWeight: 500,
                    color: "#F6F2EA",
                    lineHeight: 1.25,
                    marginBottom: "12px",
                  }}
                >
                  {currentEditorial.title || "Featured Atelier Piece"}
                </div>
                <div
                  style={{
                    display: "inline-flex",
                    alignItems: "center",
                    gap: "6px",
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.06em",
                    textTransform: "uppercase",
                    color: "#F6F2EA",
                    borderBottom: "1px solid #F6F2EA",
                    paddingBottom: "2px",
                  }}
                >
                  {currentEditorial.cta || "Explore"} →
                </div>
              </div>
            </div>

            <div
              style={{
                marginTop: "14px",
                fontSize: "11.5px",
                color: "rgba(246,242,234,0.4)",
                lineHeight: 1.5,
              }}
            >
              Links to:{" "}
              <code style={{ color: "var(--color-emerald)", fontSize: "11px" }}>
                {currentEditorial.href || "—"}
              </code>
            </div>
          </div>
        </div>
      </div>

      {/* 5. BESPOKE ATELIER & MADE TO MEASURE TEASER CONFIG */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(246,242,234,0.08)",
            paddingBottom: "14px",
            marginBottom: "24px",
          }}
        >
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
              <h2 style={{ fontSize: "16px", margin: 0, fontWeight: 600 }}>
                Bespoke Atelier / Made to Measure Teaser
              </h2>
              <span
                style={{
                  fontSize: "10px",
                  padding: "2px 8px",
                  borderRadius: "999px",
                  fontWeight: 600,
                  textTransform: "uppercase",
                  background:
                    bespoke.active !== false
                      ? "rgba(47, 92, 72, 0.2)"
                      : "rgba(255,255,255,0.08)",
                  color:
                    bespoke.active !== false
                      ? "#81c784"
                      : "rgba(246,242,234,0.5)",
                  border: `1px solid ${
                    bespoke.active !== false
                      ? "rgba(47, 92, 72, 0.4)"
                      : "rgba(255,255,255,0.1)"
                  }`,
                }}
              >
                {bespoke.active !== false ? "Visible on Homepage" : "Hidden"}
              </span>
            </div>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(246,242,234,0.45)",
                marginTop: "2px",
              }}
            >
              Manage copy, atelier photography, and action buttons for the bespoke made-to-measure section
            </div>
          </div>
          <button
            onClick={() => handleSave("bespoke_teaser_config")}
            disabled={savingKey === "bespoke_teaser_config"}
            style={{
              background:
                savedKey === "bespoke_teaser_config"
                  ? "var(--color-emerald)"
                  : "#F6F2EA",
              color:
                savedKey === "bespoke_teaser_config" ? "#F6F2EA" : "#15130F",
              border: "none",
              padding: "7px 16px",
              fontSize: "12px",
              borderRadius: "2px",
              cursor: "pointer",
              fontWeight: 600,
              transition: "all 0.2s ease",
            }}
          >
            {savingKey === "bespoke_teaser_config"
              ? "Saving..."
              : savedKey === "bespoke_teaser_config"
              ? "Saved ✓"
              : "Save Bespoke Config"}
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "1.2fr 1fr",
            gap: "28px",
            alignItems: "start",
          }}
        >
          {/* Edit Form */}
          <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>Section Display Status</label>
                <div
                  onClick={() =>
                    handleBespokeChange("active", bespoke.active === false ? true : false)
                  }
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "10px",
                    background: "#0F0E0B",
                    border: "1px solid rgba(246,242,234,0.15)",
                    padding: "8px 12px",
                    borderRadius: "2px",
                    cursor: "pointer",
                    height: "40px",
                  }}
                >
                  <div
                    style={{
                      width: "32px",
                      height: "18px",
                      borderRadius: "10px",
                      background:
                        bespoke.active !== false
                          ? "var(--color-emerald)"
                          : "rgba(255,255,255,0.15)",
                      position: "relative",
                      transition: "background 0.2s ease",
                    }}
                  >
                    <div
                      style={{
                        width: "14px",
                        height: "14px",
                        borderRadius: "50%",
                        background: "#F6F2EA",
                        position: "absolute",
                        top: "2px",
                        left: bespoke.active !== false ? "16px" : "2px",
                        transition: "left 0.2s ease",
                      }}
                    />
                  </div>
                  <span style={{ fontSize: "12px", color: "#F6F2EA" }}>
                    {bespoke.active !== false ? "Visible" : "Hidden"}
                  </span>
                </div>
              </div>

              <div>
                <label style={labelStyle}>Eyebrow Subheading</label>
                <input
                  type="text"
                  placeholder="Made to Measure"
                  value={bespoke.eyebrow || ""}
                  onChange={(e) => handleBespokeChange("eyebrow", e.target.value)}
                  style={{ ...inputStyle, height: "40px" }}
                />
              </div>
            </div>

            <div>
              <label style={labelStyle}>Main Headline Title</label>
              <input
                type="text"
                placeholder="A garment built around you"
                value={bespoke.title || ""}
                onChange={(e) => handleBespokeChange("title", e.target.value)}
                style={inputStyle}
              />
            </div>

            <div>
              <label style={labelStyle}>Description / Body Copy</label>
              <textarea
                rows={3}
                placeholder="From a single alteration to a fully bespoke piece, our atelier works with your measurements, fabric preferences and timeline."
                value={bespoke.description || ""}
                onChange={(e) => handleBespokeChange("description", e.target.value)}
                style={{
                  ...inputStyle,
                  resize: "vertical",
                  fontFamily: "inherit",
                  lineHeight: 1.5,
                }}
              />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
              <div>
                <label style={labelStyle}>CTA Button Label</label>
                <input
                  type="text"
                  placeholder="Start a bespoke request"
                  value={bespoke.ctaText || ""}
                  onChange={(e) => handleBespokeChange("ctaText", e.target.value)}
                  style={inputStyle}
                />
              </div>

              <div>
                <label style={labelStyle}>CTA Button Action</label>
                <select
                  value={bespoke.ctaAction || "modal"}
                  onChange={(e) => handleBespokeChange("ctaAction", e.target.value)}
                  style={inputStyle}
                >
                  <option value="modal">Open Interactive Bespoke Modal</option>
                  <option value="link">Navigate to Destination URL</option>
                </select>
              </div>
            </div>

            {bespoke.ctaAction === "link" && (
              <div>
                <label style={labelStyle}>Destination URL</label>
                <input
                  type="text"
                  placeholder="/bespoke"
                  value={bespoke.ctaHref || ""}
                  onChange={(e) => handleBespokeChange("ctaHref", e.target.value)}
                  style={inputStyle}
                />
              </div>
            )}

            <div>
              <label style={labelStyle}>Atelier Photography URL</label>
              <input
                type="text"
                placeholder="/images/atelier.png"
                value={bespoke.image || ""}
                onChange={(e) => handleBespokeChange("image", e.target.value)}
                style={inputStyle}
              />
            </div>
          </div>

          {/* Live Preview Card */}
          <div
            style={{
              background: "#EEE7D8",
              border: "1px solid rgba(21,19,15,0.1)",
              borderRadius: "4px",
              padding: "20px",
              color: "#15130F",
            }}
          >
            <div
              style={{
                fontSize: "11px",
                textTransform: "uppercase",
                letterSpacing: "0.08em",
                color: "#1F5C42",
                marginBottom: "14px",
                fontWeight: 700,
              }}
            >
              Live Storefront Section Preview
            </div>

            <div style={{ display: "flex", flexDirection: "column", gap: "14px" }}>
              <div>
                <div
                  style={{
                    fontFamily: "var(--font-mono, monospace)",
                    fontSize: "9px",
                    letterSpacing: "0.14em",
                    textTransform: "uppercase",
                    color: "#1F5C42",
                    fontWeight: 600,
                    marginBottom: "4px",
                  }}
                >
                  {bespoke.eyebrow || "Made to Measure"}
                </div>
                <div
                  style={{
                    fontFamily: "var(--font-serif, serif)",
                    fontSize: "18px",
                    fontWeight: 500,
                    color: "#15130F",
                    lineHeight: 1.25,
                    marginBottom: "8px",
                  }}
                >
                  {bespoke.title || "A garment built around you"}
                </div>
                <p
                  style={{
                    fontSize: "11px",
                    lineHeight: 1.5,
                    color: "rgba(21, 19, 15, 0.7)",
                    margin: 0,
                  }}
                >
                  {bespoke.description || "From a single alteration to a fully bespoke piece..."}
                </p>
              </div>

              <div>
                <span
                  style={{
                    background: "#15130F",
                    color: "#F6F2EA",
                    padding: "6px 14px",
                    fontSize: "9.5px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    borderRadius: "2px",
                    fontWeight: 600,
                    display: "inline-block",
                  }}
                >
                  {bespoke.ctaText || "Start a bespoke request"}
                </span>
              </div>

              <div
                style={{
                  aspectRatio: "4/3",
                  backgroundImage: `url(${bespoke.image || "/images/atelier.png"})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                  borderRadius: "3px",
                  position: "relative",
                  overflow: "hidden",
                  boxShadow: "0 6px 16px rgba(0,0,0,0.12)",
                }}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
