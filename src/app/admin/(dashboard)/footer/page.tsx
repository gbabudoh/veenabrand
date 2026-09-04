"use client";

import React, { useState, useEffect } from "react";
import type { FooterConfig, FooterColumn, FooterLink } from "@/lib/home-data";
import { DEFAULT_FOOTER_CONFIG } from "@/lib/home-data";

export default function AdminFooterConfigPage() {
  const [footer, setFooter] = useState<FooterConfig>(DEFAULT_FOOTER_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function fetchFooter() {
      try {
        const res = await fetch("/api/admin/homepage");
        if (res.ok) {
          const data = await res.json();
          const footerConfig = data.configs?.find((c: any) => c.key === "footer_config");
          if (footerConfig) {
            try {
              const parsed = JSON.parse(footerConfig.value);
              setFooter({
                ...DEFAULT_FOOTER_CONFIG,
                ...parsed,
                columns:
                  parsed.columns && parsed.columns.length > 0
                    ? parsed.columns
                    : DEFAULT_FOOTER_CONFIG.columns,
                bottomLinks:
                  parsed.bottomLinks && parsed.bottomLinks.length > 0
                    ? parsed.bottomLinks
                    : DEFAULT_FOOTER_CONFIG.bottomLinks,
                newsletter: {
                  ...DEFAULT_FOOTER_CONFIG.newsletter,
                  ...(parsed.newsletter || {}),
                },
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
    fetchFooter();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    try {
      const res = await fetch("/api/admin/homepage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          key: "footer_config",
          value: JSON.stringify(footer),
        }),
      });

      if (res.ok) {
        setSaved(true);
        setTimeout(() => setSaved(false), 2500);
      } else {
        alert("Failed to save footer configuration");
      }
    } catch (err) {
      console.error(err);
      alert("An error occurred while saving footer configuration");
    } finally {
      setSaving(false);
    }
  };

  const handleColumnTitleChange = (colIdx: number, title: string) => {
    setFooter((prev) => {
      const cols = [...(prev.columns || [])];
      cols[colIdx] = { ...cols[colIdx], title };
      return { ...prev, columns: cols };
    });
  };

  const handleLinkChange = (
    colIdx: number,
    linkIdx: number,
    field: "label" | "href",
    val: string
  ) => {
    setFooter((prev) => {
      const cols = [...(prev.columns || [])];
      const links = [...cols[colIdx].links];
      links[linkIdx] = { ...links[linkIdx], [field]: val };
      cols[colIdx] = { ...cols[colIdx], links };
      return { ...prev, columns: cols };
    });
  };

  const handleAddLink = (colIdx: number) => {
    setFooter((prev) => {
      const cols = [...(prev.columns || [])];
      const links = [...cols[colIdx].links, { label: "New Link", href: "/products" }];
      cols[colIdx] = { ...cols[colIdx], links };
      return { ...prev, columns: cols };
    });
  };

  const handleRemoveLink = (colIdx: number, linkIdx: number) => {
    setFooter((prev) => {
      const cols = [...(prev.columns || [])];
      const links = cols[colIdx].links.filter((_, i) => i !== linkIdx);
      cols[colIdx] = { ...cols[colIdx], links };
      return { ...prev, columns: cols };
    });
  };

  const handleAddColumn = () => {
    setFooter((prev) => ({
      ...prev,
      columns: [
        ...(prev.columns || []),
        { title: "New Column", links: [{ label: "Link 01", href: "/about" }] },
      ],
    }));
  };

  const handleRemoveColumn = (colIdx: number) => {
    setFooter((prev) => ({
      ...prev,
      columns: (prev.columns || []).filter((_, i) => i !== colIdx),
    }));
  };

  const handleBottomLinkChange = (
    idx: number,
    field: "label" | "href",
    val: string
  ) => {
    setFooter((prev) => {
      const links = [...(prev.bottomLinks || [])];
      links[idx] = { ...links[idx], [field]: val };
      return { ...prev, bottomLinks: links };
    });
  };

  const handleAddBottomLink = () => {
    setFooter((prev) => ({
      ...prev,
      bottomLinks: [
        ...(prev.bottomLinks || []),
        { label: "New Legal Page", href: "/legal" },
      ],
    }));
  };

  const handleRemoveBottomLink = (idx: number) => {
    setFooter((prev) => ({
      ...prev,
      bottomLinks: (prev.bottomLinks || []).filter((_, i) => i !== idx),
    }));
  };

  if (loading) {
    return (
      <div style={{ color: "rgba(246,242,234,0.5)", padding: "20px" }}>
        Loading footer configuration...
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
    padding: "9px 12px",
    fontSize: "13px",
    borderRadius: "2px",
    outline: "none",
  };

  return (
    <div style={{ maxWidth: "1120px" }}>
      {/* Header */}
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "flex-end",
          marginBottom: "34px",
        }}
      >
        <div>
          <h1
            style={{
              fontFamily: "var(--font-serif)",
              fontSize: "30px",
              margin: 0,
              fontWeight: 500,
            }}
          >
            Storefront Footer Customizer
          </h1>
          <div
            style={{
              fontSize: "13px",
              color: "rgba(246, 242, 234, 0.5)",
              marginTop: "4px",
            }}
          >
            Manage brand branding, navigation links, newsletter signup block, and legal disclaimers.
          </div>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          style={{
            background: saved ? "var(--color-emerald)" : "#F6F2EA",
            color: saved ? "#F6F2EA" : "#15130F",
            border: "none",
            padding: "9px 22px",
            fontSize: "13px",
            borderRadius: "2px",
            cursor: "pointer",
            fontWeight: 600,
            transition: "all 0.2s ease",
          }}
        >
          {saving ? "Saving..." : saved ? "Saved ✓" : "Save Footer"}
        </button>
      </div>

      {/* 1. BRAND COLUMN */}
      <div style={cardStyle}>
        <h2
          style={{
            fontSize: "15px",
            margin: "0 0 16px",
            fontWeight: 600,
            borderBottom: "1px solid rgba(246,242,234,0.08)",
            paddingBottom: "12px",
          }}
        >
          1. Brand Column (Logo & Tagline)
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr", gap: "20px" }}>
          <div>
            <label style={labelStyle}>Logo Image URL</label>
            <input
              type="text"
              value={footer.logoImage || ""}
              onChange={(e) =>
                setFooter((prev) => ({ ...prev, logoImage: e.target.value }))
              }
              placeholder="/images/logo.png"
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Brand Tagline / Atelier Bio</label>
            <input
              type="text"
              value={footer.tagline || ""}
              onChange={(e) =>
                setFooter((prev) => ({ ...prev, tagline: e.target.value }))
              }
              placeholder="Ready-to-wear and bespoke fashion, cut and finished in Lagos."
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* 2. NAVIGATION COLUMNS */}
      <div style={cardStyle}>
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            borderBottom: "1px solid rgba(246,242,234,0.08)",
            paddingBottom: "12px",
            marginBottom: "20px",
          }}
        >
          <div>
            <h2 style={{ fontSize: "15px", margin: 0, fontWeight: 600 }}>
              2. Navigation Link Columns
            </h2>
            <div
              style={{
                fontSize: "12px",
                color: "rgba(246,242,234,0.45)",
                marginTop: "2px",
              }}
            >
              Add or edit footer categories, link labels, and destination paths
            </div>
          </div>

          <button
            onClick={handleAddColumn}
            style={{
              background: "#0F0E0B",
              border: "1px solid rgba(246,242,234,0.2)",
              color: "#F6F2EA",
              padding: "6px 14px",
              fontSize: "12px",
              borderRadius: "2px",
              cursor: "pointer",
            }}
          >
            + Add New Column
          </button>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${Math.max(
              1,
              Math.min(3, footer.columns?.length || 1)
            )}, 1fr)`,
            gap: "24px",
          }}
        >
          {footer.columns?.map((col, colIdx) => (
            <div
              key={colIdx}
              style={{
                background: "#0F0E0B",
                border: "1px solid rgba(246,242,234,0.1)",
                borderRadius: "3px",
                padding: "16px",
              }}
            >
              <div
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  marginBottom: "14px",
                }}
              >
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 700,
                    textTransform: "uppercase",
                    letterSpacing: "0.06em",
                    color: "var(--color-emerald)",
                  }}
                >
                  Column 0{colIdx + 1}
                </span>

                <button
                  onClick={() => handleRemoveColumn(colIdx)}
                  title="Remove Column"
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,120,120,0.7)",
                    cursor: "pointer",
                    fontSize: "11px",
                  }}
                >
                  Remove Column ✕
                </button>
              </div>

              <div style={{ marginBottom: "16px" }}>
                <label style={labelStyle}>Column Title</label>
                <input
                  type="text"
                  value={col.title}
                  onChange={(e) =>
                    handleColumnTitleChange(colIdx, e.target.value)
                  }
                  style={inputStyle}
                />
              </div>

              <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
                <label style={labelStyle}>Links</label>
                {col.links?.map((link, linkIdx) => (
                  <div
                    key={linkIdx}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "1fr 1fr 24px",
                      gap: "8px",
                      alignItems: "center",
                    }}
                  >
                    <input
                      type="text"
                      placeholder="Label"
                      value={link.label}
                      onChange={(e) =>
                        handleLinkChange(colIdx, linkIdx, "label", e.target.value)
                      }
                      style={{ ...inputStyle, fontSize: "12px", padding: "6px 8px" }}
                    />
                    <input
                      type="text"
                      placeholder="URL"
                      value={link.href}
                      onChange={(e) =>
                        handleLinkChange(colIdx, linkIdx, "href", e.target.value)
                      }
                      style={{ ...inputStyle, fontSize: "12px", padding: "6px 8px" }}
                    />
                    <button
                      onClick={() => handleRemoveLink(colIdx, linkIdx)}
                      title="Remove link"
                      style={{
                        background: "none",
                        border: "none",
                        color: "rgba(255,100,100,0.6)",
                        cursor: "pointer",
                        fontSize: "13px",
                      }}
                    >
                      ×
                    </button>
                  </div>
                ))}

                <button
                  onClick={() => handleAddLink(colIdx)}
                  style={{
                    marginTop: "6px",
                    background: "none",
                    border: "1px dashed rgba(246,242,234,0.2)",
                    color: "rgba(246,242,234,0.7)",
                    padding: "6px",
                    fontSize: "11.5px",
                    borderRadius: "2px",
                    cursor: "pointer",
                  }}
                >
                  + Add Link
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 3. NEWSLETTER BLOCK */}
      <div style={cardStyle}>
        <h2
          style={{
            fontSize: "15px",
            margin: "0 0 16px",
            fontWeight: 600,
            borderBottom: "1px solid rgba(246,242,234,0.08)",
            paddingBottom: "12px",
          }}
        >
          3. Newsletter Block
        </h2>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "20px" }}>
          <div>
            <label style={labelStyle}>Newsletter Form Status</label>
            <div
              onClick={() =>
                setFooter((prev) => ({
                  ...prev,
                  newsletter: {
                    ...(prev.newsletter || {}),
                    active: prev.newsletter?.active === false ? true : false,
                  },
                }))
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
                    footer.newsletter?.active !== false
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
                    left:
                      footer.newsletter?.active !== false ? "16px" : "2px",
                    transition: "left 0.2s ease",
                  }}
                />
              </div>
              <span style={{ fontSize: "12px", color: "#F6F2EA" }}>
                {footer.newsletter?.active !== false
                  ? "Form Active & Visible"
                  : "Form Hidden"}
              </span>
            </div>
          </div>

          <div>
            <label style={labelStyle}>Header Title</label>
            <input
              type="text"
              value={footer.newsletter?.title || ""}
              onChange={(e) =>
                setFooter((prev) => ({
                  ...prev,
                  newsletter: {
                    ...(prev.newsletter || {}),
                    title: e.target.value,
                  },
                }))
              }
              placeholder="Newsletter"
              style={{ ...inputStyle, height: "40px" }}
            />
          </div>

          <div>
            <label style={labelStyle}>Incentive Copy / Description</label>
            <input
              type="text"
              value={footer.newsletter?.description || ""}
              onChange={(e) =>
                setFooter((prev) => ({
                  ...prev,
                  newsletter: {
                    ...(prev.newsletter || {}),
                    description: e.target.value,
                  },
                }))
              }
              placeholder="Subscribe for runway debuts and private previews."
              style={inputStyle}
            />
          </div>

          <div>
            <label style={labelStyle}>Input Placeholder</label>
            <input
              type="text"
              value={footer.newsletter?.placeholder || ""}
              onChange={(e) =>
                setFooter((prev) => ({
                  ...prev,
                  newsletter: {
                    ...(prev.newsletter || {}),
                    placeholder: e.target.value,
                  },
                }))
              }
              placeholder="Email address"
              style={inputStyle}
            />
          </div>
        </div>
      </div>

      {/* 4. BOTTOM BAR & LEGAL DISCLAIMER */}
      <div style={cardStyle}>
        <h2
          style={{
            fontSize: "15px",
            margin: "0 0 16px",
            fontWeight: 600,
            borderBottom: "1px solid rgba(246,242,234,0.08)",
            paddingBottom: "12px",
          }}
        >
          4. Bottom Bar & Legal Links
        </h2>

        <div style={{ marginBottom: "20px" }}>
          <label style={labelStyle}>Copyright Text</label>
          <input
            type="text"
            value={footer.copyright || ""}
            onChange={(e) =>
              setFooter((prev) => ({ ...prev, copyright: e.target.value }))
            }
            placeholder="© 2026 Veena Fashion House. All rights reserved."
            style={inputStyle}
          />
        </div>

        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "10px",
            }}
          >
            <label style={labelStyle}>Legal Links</label>
            <button
              onClick={handleAddBottomLink}
              style={{
                background: "none",
                border: "none",
                color: "var(--color-emerald)",
                fontSize: "12px",
                cursor: "pointer",
                fontWeight: 600,
              }}
            >
              + Add Legal Link
            </button>
          </div>

          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))",
              gap: "12px",
            }}
          >
            {footer.bottomLinks?.map((link, idx) => (
              <div
                key={idx}
                style={{
                  display: "grid",
                  gridTemplateColumns: "1fr 1fr 24px",
                  gap: "8px",
                  alignItems: "center",
                  background: "#0F0E0B",
                  padding: "8px 10px",
                  borderRadius: "2px",
                  border: "1px solid rgba(246,242,234,0.1)",
                }}
              >
                <input
                  type="text"
                  placeholder="Label"
                  value={link.label}
                  onChange={(e) =>
                    handleBottomLinkChange(idx, "label", e.target.value)
                  }
                  style={{ ...inputStyle, fontSize: "12px", padding: "5px 8px" }}
                />
                <input
                  type="text"
                  placeholder="URL"
                  value={link.href}
                  onChange={(e) =>
                    handleBottomLinkChange(idx, "href", e.target.value)
                  }
                  style={{ ...inputStyle, fontSize: "12px", padding: "5px 8px" }}
                />
                <button
                  onClick={() => handleRemoveBottomLink(idx)}
                  title="Remove link"
                  style={{
                    background: "none",
                    border: "none",
                    color: "rgba(255,100,100,0.6)",
                    cursor: "pointer",
                    fontSize: "13px",
                  }}
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 5. LIVE FOOTER PREVIEW */}
      <div style={cardStyle}>
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
          Live Footer Preview
        </div>

        <div
          style={{
            background: "#15130F",
            border: "1px solid rgba(246,242,234,0.12)",
            borderRadius: "4px",
            padding: "40px 24px 20px",
            color: "#F6F2EA",
          }}
        >
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))",
              gap: "28px",
              marginBottom: "36px",
            }}
          >
            {/* Brand */}
            <div>
              {footer.logoImage && (
                <img
                  src={footer.logoImage}
                  alt="Veena"
                  style={{ height: "46px", width: "auto", marginBottom: "10px" }}
                />
              )}
              <p
                style={{
                  fontSize: "11.5px",
                  lineHeight: 1.6,
                  color: "rgba(246, 242, 234, 0.55)",
                  margin: 0,
                }}
              >
                {footer.tagline}
              </p>
            </div>

            {/* Columns */}
            {footer.columns?.map((col, idx) => (
              <div key={idx}>
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(246, 242, 234, 0.5)",
                    marginBottom: "10px",
                    fontWeight: 600,
                  }}
                >
                  {col.title}
                </div>
                <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
                  {col.links?.map((link, lIdx) => (
                    <span
                      key={lIdx}
                      style={{ fontSize: "11.5px", color: "rgba(246, 242, 234, 0.85)" }}
                    >
                      {link.label}
                    </span>
                  ))}
                </div>
              </div>
            ))}

            {/* Newsletter */}
            {footer.newsletter?.active && (
              <div>
                <div
                  style={{
                    fontSize: "10px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    color: "rgba(246, 242, 234, 0.5)",
                    marginBottom: "10px",
                    fontWeight: 600,
                  }}
                >
                  {footer.newsletter.title || "Newsletter"}
                </div>
                {footer.newsletter.description && (
                  <p
                    style={{
                      fontSize: "11px",
                      color: "rgba(246, 242, 234, 0.5)",
                      marginBottom: "10px",
                      lineHeight: 1.4,
                    }}
                  >
                    {footer.newsletter.description}
                  </p>
                )}
                <div
                  style={{
                    display: "flex",
                    gap: "8px",
                    borderBottom: "1px solid rgba(246, 242, 234, 0.3)",
                    paddingBottom: "4px",
                    alignItems: "center",
                  }}
                >
                  <span style={{ fontSize: "11px", color: "rgba(246,242,234,0.4)" }}>
                    {footer.newsletter.placeholder || "Email address"}
                  </span>
                  <span style={{ fontSize: "11px", marginLeft: "auto" }}>→</span>
                </div>
              </div>
            )}
          </div>

          {/* Bottom Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              flexWrap: "wrap",
              gap: "12px",
              borderTop: "1px solid rgba(246, 242, 234, 0.1)",
              paddingTop: "16px",
              fontSize: "11px",
              color: "rgba(246, 242, 234, 0.45)",
            }}
          >
            <span>{footer.copyright}</span>
            <div style={{ display: "flex", gap: "14px" }}>
              {footer.bottomLinks?.map((link, idx) => (
                <span key={idx}>{link.label}</span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
