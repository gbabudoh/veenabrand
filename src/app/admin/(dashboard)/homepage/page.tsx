"use client";

import React, { useState, useEffect } from "react";

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

interface RunwayConfig {
  mode: "film" | "lookbook";
  videoUrl: string;
}

export default function AdminHomepageConfigPage() {
  const [slides, setSlides] = useState<Slide[]>([]);
  const [runway, setRunway] = useState<RunwayConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchConfigs() {
      try {
        const res = await fetch("/api/admin/homepage");
        if (res.ok) {
          const data = await res.json();
          const slideConfig = data.configs.find((c: any) => c.key === "hero_slides");
          const runwayConfig = data.configs.find((c: any) => c.key === "runway_switch");

          if (slideConfig) setSlides(JSON.parse(slideConfig.value));
          if (runwayConfig) setRunway(JSON.parse(runwayConfig.value));
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

  const handleRunwayChange = (field: keyof RunwayConfig, value: string) => {
    if (!runway) return;
    setRunway({ ...runway, [field]: value });
  };

  const handleSave = async (key: "hero_slides" | "runway_switch") => {
    setSaving(true);
    const value = key === "hero_slides" ? JSON.stringify(slides) : JSON.stringify(runway);

    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      if (res.ok) {
        alert("Configuration saved successfully!");
      } else {
        alert("Failed to save configuration");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: "rgba(246,242,234,0.5)" }}>Querying homepage configurations...</div>;
  }

  const cardStyle = {
    background: "#15130F",
    border: "1px solid rgba(246, 242, 234, 0.08)",
    borderRadius: "4px",
    padding: "26px",
    marginBottom: "32px"
  };

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    color: "rgba(246,242,234,0.5)",
    marginBottom: "6px",
    textTransform: "uppercase" as const,
    fontWeight: 600
  };

  const inputStyle = {
    width: "100%",
    background: "#0F0E0B",
    border: "1px solid rgba(246,242,234,0.15)",
    color: "#F6F2EA",
    padding: "10px 12px",
    fontSize: "13.5px",
    borderRadius: "2px",
    outline: "none"
  };

  return (
    <div>
      {/* Title */}
      <div style={{ marginBottom: "34px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "30px", margin: 0, fontWeight: 500 }}>
          Homepage Customizer
        </h1>
        <div style={{ fontSize: "13px", color: "rgba(246, 242, 234, 0.5)", marginTop: "4px" }}>
          Edit collection sliders copy and toggles on the live homepage
        </div>
      </div>

      {/* 1. HERO SLIDES EDITOR */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid rgba(246,242,234,0.08)", paddingBottom: "12px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", margin: 0, fontWeight: 600 }}>Hero Carousel Slides</h2>
          <button
            onClick={() => handleSave("hero_slides")}
            disabled={saving}
            style={{ background: "#F6F2EA", color: "#15130F", border: "none", padding: "6px 14px", fontSize: "12px", borderRadius: "2px", cursor: "pointer", fontWeight: 600 }}
          >
            Save Slides
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "28px" }}>
          {slides.map((slide, i) => (
            <div key={i} style={{ borderBottom: i < slides.length - 1 ? "1px dashed rgba(246,242,234,0.08)" : "none", paddingBottom: i < slides.length - 1 ? "24px" : 0 }}>
              <h3 style={{ fontSize: "14px", margin: "0 0 16px", color: "var(--color-emerald)", fontWeight: 600 }}>Slide 0{i + 1}</h3>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
                <div>
                  <label style={labelStyle}>Eyebrow text</label>
                  <input type="text" value={slide.eyebrow} onChange={(e) => handleSlideChange(i, "eyebrow", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Headline text</label>
                  <input type="text" value={slide.title} onChange={(e) => handleSlideChange(i, "title", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>CTA Button Label</label>
                  <input type="text" value={slide.cta} onChange={(e) => handleSlideChange(i, "cta", e.target.value)} style={inputStyle} />
                </div>
                <div>
                  <label style={labelStyle}>Asset Background Path</label>
                  <input type="text" value={slide.bgImage} onChange={(e) => handleSlideChange(i, "bgImage", e.target.value)} style={inputStyle} />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 2. RUNWAY BANNER SWITCH CONFIG */}
      {runway && (
        <div style={cardStyle}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid rgba(246,242,234,0.08)", paddingBottom: "12px", marginBottom: "24px" }}>
            <h2 style={{ fontSize: "16px", margin: 0, fontWeight: 600 }}>Runway Switch Banner</h2>
            <button
              onClick={() => handleSave("runway_switch")}
              disabled={saving}
              style={{ background: "#F6F2EA", color: "#15130F", border: "none", padding: "6px 14px", fontSize: "12px", borderRadius: "2px", cursor: "pointer", fontWeight: 600 }}
            >
              Save Runway Config
            </button>
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "16px" }}>
            <div>
              <label style={labelStyle}>Active Mode</label>
              <select value={runway.mode} onChange={(e) => handleRunwayChange("mode", e.target.value)} style={inputStyle}>
                <option value="film">Runway Film Video</option>
                <option value="lookbook">Static Grid Lookbook</option>
              </select>
            </div>
            <div>
              <label style={labelStyle}>Runway Film Video URL</label>
              <input type="text" value={runway.videoUrl} onChange={(e) => handleRunwayChange("videoUrl", e.target.value)} style={inputStyle} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
