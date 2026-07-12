"use client";

import React, { useState, useEffect } from "react";

interface SEOConfig {
  metaTitle: string;
  metaDescription: string;
  metaKeywords: string;
}

interface SocialLinks {
  instagram: string;
  facebook: string;
  pinterest: string;
}

export default function AdminSettingsPage() {
  const [seo, setSeo] = useState<SEOConfig>({ metaTitle: "", metaDescription: "", metaKeywords: "" });
  const [socials, setSocials] = useState<SocialLinks>({ instagram: "", facebook: "", pinterest: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    async function fetchSettings() {
      try {
        const res = await fetch("/api/admin/settings");
        if (res.ok) {
          const data = await res.json();
          const seoSetting = data.settings.find((s: any) => s.key === "seo_metadata");
          const socialsSetting = data.settings.find((s: any) => s.key === "social_links");

          if (seoSetting) setSeo(JSON.parse(seoSetting.value));
          if (socialsSetting) setSocials(JSON.parse(socialsSetting.value));
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchSettings();
  }, []);

  const handleSave = async (key: "seo_metadata" | "social_links") => {
    setSaving(true);
    const value = key === "seo_metadata" ? JSON.stringify(seo) : JSON.stringify(socials);

    try {
      const res = await fetch("/api/admin/settings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ key, value }),
      });

      if (res.ok) {
        alert("Settings saved successfully!");
      } else {
        alert("Failed to save settings");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div style={{ color: "rgba(246,242,234,0.5)" }}>Querying configurations registry...</div>;
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
    <div style={{ maxWidth: "760px" }}>
      {/* Title */}
      <div style={{ marginBottom: "34px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "30px", margin: 0, fontWeight: 500 }}>
          Global Settings
        </h1>
        <div style={{ fontSize: "13px", color: "rgba(246, 242, 234, 0.5)", marginTop: "4px" }}>
          Configure SEO crawlers meta-tags and social media channels
        </div>
      </div>

      {/* 1. SEO CONFIGURATION CARD */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid rgba(246,242,234,0.08)", paddingBottom: "12px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", margin: 0, fontWeight: 600 }}>Search Engine Optimization (SEO)</h2>
          <button
            onClick={() => handleSave("seo_metadata")}
            disabled={saving}
            style={{ background: "#F6F2EA", color: "#15130F", border: "none", padding: "6px 14px", fontSize: "12px", borderRadius: "2px", cursor: "pointer", fontWeight: 600 }}
          >
            Save SEO
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={labelStyle}>Default Title Tag</label>
            <input type="text" value={seo.metaTitle} onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Meta Description</label>
            <textarea value={seo.metaDescription} onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })} rows={3} style={{ ...inputStyle, resize: "none" }} />
          </div>
          <div>
            <label style={labelStyle}>Meta Keywords (comma-separated)</label>
            <input type="text" value={seo.metaKeywords} onChange={(e) => setSeo({ ...seo, metaKeywords: e.target.value })} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* 2. SOCIAL MEDIA LINKS CARD */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", borderBottom: "1px solid rgba(246,242,234,0.08)", paddingBottom: "12px", marginBottom: "24px" }}>
          <h2 style={{ fontSize: "16px", margin: 0, fontWeight: 600 }}>Social Accounts Handles</h2>
          <button
            onClick={() => handleSave("social_links")}
            disabled={saving}
            style={{ background: "#F6F2EA", color: "#15130F", border: "none", padding: "6px 14px", fontSize: "12px", borderRadius: "2px", cursor: "pointer", fontWeight: 600 }}
          >
            Save Socials
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "18px" }}>
          <div>
            <label style={labelStyle}>Instagram Link</label>
            <input type="text" value={socials.instagram} onChange={(e) => setSocials({ ...socials, instagram: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Facebook Link</label>
            <input type="text" value={socials.facebook} onChange={(e) => setSocials({ ...socials, facebook: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Pinterest Link</label>
            <input type="text" value={socials.pinterest} onChange={(e) => setSocials({ ...socials, pinterest: e.target.value })} style={inputStyle} />
          </div>
        </div>
      </div>
    </div>
  );
}
