"use client";

import React, { useState, useEffect } from "react";
import IntegrationsStatus from "@/components/admin/IntegrationsStatus";

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
    return <div style={{ color: "#64748B", padding: "40px 0", textAlign: "center", fontSize: "13.5px" }}>Querying configuration registry...</div>;
  }

  const cardStyle = {
    background: "#FFFFFF",
    border: "1px solid #E2E8F0",
    borderRadius: "10px",
    padding: "24px",
    marginBottom: "24px",
    boxShadow: "0 1px 3px rgba(15, 23, 42, 0.03)",
  };

  const labelStyle = {
    display: "block",
    fontSize: "11px",
    color: "#64748B",
    marginBottom: "5px",
    textTransform: "uppercase" as const,
    fontWeight: 600,
    letterSpacing: "0.05em",
  };

  const inputStyle = {
    width: "100%",
    background: "#FFFFFF",
    border: "1px solid #CBD5E1",
    color: "#0F172A",
    padding: "9px 12px",
    fontSize: "13px",
    borderRadius: "6px",
    outline: "none",
    boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
  };

  return (
    <div style={{ maxWidth: "780px" }}>
      {/* Title */}
      <div style={{ marginBottom: "28px" }}>
        <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", color: "#0F172A", margin: 0, fontWeight: 600 }}>
          Global Settings &amp; SEO
        </h1>
        <div style={{ fontSize: "13.5px", color: "#64748B", marginTop: "4px" }}>
          Configure search crawler metadata, social media links, and media integrations
        </div>
      </div>

      {/* 1. SEO CONFIGURATION CARD */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "15px", margin: 0, fontWeight: 600, color: "#0F172A" }}>Search Engine Optimization (SEO)</h2>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>Default metadata indexed across search crawlers</div>
          </div>
          <button
            type="button"
            onClick={() => handleSave("seo_metadata")}
            disabled={saving}
            style={{
              background: "#0F172A",
              color: "#FFFFFF",
              border: "none",
              padding: "7px 16px",
              fontSize: "12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.12)",
            }}
          >
            Save SEO
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Default Title Tag</label>
            <input type="text" value={seo.metaTitle} onChange={(e) => setSeo({ ...seo, metaTitle: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Meta Description</label>
            <textarea value={seo.metaDescription} onChange={(e) => setSeo({ ...seo, metaDescription: e.target.value })} rows={3} style={{ ...inputStyle, resize: "vertical" }} />
          </div>
          <div>
            <label style={labelStyle}>Meta Keywords (comma-separated)</label>
            <input type="text" value={seo.metaKeywords} onChange={(e) => setSeo({ ...seo, metaKeywords: e.target.value })} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* 2. SOCIAL MEDIA LINKS CARD */}
      <div style={cardStyle}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #F1F5F9", paddingBottom: "14px", marginBottom: "20px" }}>
          <div>
            <h2 style={{ fontSize: "15px", margin: 0, fontWeight: 600, color: "#0F172A" }}>Social Accounts &amp; Channels</h2>
            <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>Links displayed in the customer storefront header and footer</div>
          </div>
          <button
            type="button"
            onClick={() => handleSave("social_links")}
            disabled={saving}
            style={{
              background: "#0F172A",
              color: "#FFFFFF",
              border: "none",
              padding: "7px 16px",
              fontSize: "12px",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: 600,
              boxShadow: "0 1px 2px rgba(15, 23, 42, 0.12)",
            }}
          >
            Save Socials
          </button>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div>
            <label style={labelStyle}>Instagram Profile URL</label>
            <input type="text" value={socials.instagram} onChange={(e) => setSocials({ ...socials, instagram: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Facebook Page URL</label>
            <input type="text" value={socials.facebook} onChange={(e) => setSocials({ ...socials, facebook: e.target.value })} style={inputStyle} />
          </div>
          <div>
            <label style={labelStyle}>Pinterest / Lookbook URL</label>
            <input type="text" value={socials.pinterest} onChange={(e) => setSocials({ ...socials, pinterest: e.target.value })} style={inputStyle} />
          </div>
        </div>
      </div>

      {/* 3. MEDIA & VIDEO SERVICES */}
      <div style={cardStyle}>
        <div style={{ borderBottom: "1px solid #F1F5F9", paddingBottom: "12px", marginBottom: "18px" }}>
          <h2 style={{ fontSize: "15px", margin: 0, fontWeight: 600, color: "#0F172A" }}>Media &amp; Cloud Storage Services</h2>
          <div style={{ fontSize: "12px", color: "#64748B", marginTop: "2px" }}>
            Telemetry and connection status for S3/MinIO bucket storage configured in environment
          </div>
        </div>
        <IntegrationsStatus />
      </div>
    </div>
  );
}
