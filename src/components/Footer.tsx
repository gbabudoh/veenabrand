"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useStore } from "@/lib/StoreContext";
import { FooterConfig, DEFAULT_FOOTER_CONFIG } from "@/lib/home-data";

interface FooterProps {
  initialConfig?: FooterConfig | null;
}

export default function Footer({ initialConfig }: FooterProps) {
  const pathname = usePathname();

  // The storefront footer must NEVER render anywhere in the admin region
  if (
    pathname?.startsWith("/admin") ||
    (typeof window !== "undefined" && window.location.pathname.startsWith("/admin"))
  ) {
    return null;
  }

  const { gender } = useStore();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const config: FooterConfig = {
    logoImage: initialConfig?.logoImage || DEFAULT_FOOTER_CONFIG.logoImage,
    tagline: initialConfig?.tagline || DEFAULT_FOOTER_CONFIG.tagline,
    columns:
      initialConfig?.columns && initialConfig.columns.length > 0
        ? initialConfig.columns
        : DEFAULT_FOOTER_CONFIG.columns,
    newsletter: {
      active: initialConfig?.newsletter?.active !== false,
      title:
        initialConfig?.newsletter?.title ||
        DEFAULT_FOOTER_CONFIG.newsletter?.title,
      description:
        initialConfig?.newsletter?.description ||
        DEFAULT_FOOTER_CONFIG.newsletter?.description,
      placeholder:
        initialConfig?.newsletter?.placeholder ||
        DEFAULT_FOOTER_CONFIG.newsletter?.placeholder,
    },
    copyright: initialConfig?.copyright || DEFAULT_FOOTER_CONFIG.copyright,
    bottomLinks:
      initialConfig?.bottomLinks && initialConfig.bottomLinks.length > 0
        ? initialConfig.bottomLinks
        : DEFAULT_FOOTER_CONFIG.bottomLinks,
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      setEmail("");
    }
  };

  return (
    <footer
      style={{
        background: "#15130F",
        color: "#F6F2EA",
        padding: "70px 24px 32px",
        marginTop: "auto",
      }}
    >
      <div className="container-max">
        {/* Main Grid */}
        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
            gap: "40px",
            marginBottom: "56px",
          }}
        >
          {/* Brand Column */}
          <div>
            {config.logoImage && (
              <img
                src={config.logoImage}
                alt="Veena"
                width={66}
                height={64}
                style={{
                  height: "64px",
                  width: "auto",
                  display: "block",
                  marginBottom: "14px",
                }}
              />
            )}
            {config.tagline && (
              <p
                style={{
                  fontSize: "13px",
                  lineHeight: 1.7,
                  color: "rgba(246, 242, 234, 0.55)",
                  maxWidth: "280px",
                }}
              >
                {config.tagline}
              </p>
            )}
          </div>

          {/* Dynamic Link Columns */}
          {config.columns?.map((col, idx) => (
            <div key={idx}>
              <div
                style={{
                  fontSize: "11.5px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(246, 242, 234, 0.5)",
                  marginBottom: "14px",
                  fontWeight: 600,
                }}
              >
                {col.title}
              </div>
              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px",
                }}
              >
                {col.links?.map((link, linkIdx) => {
                  const href = link.href.includes("?gender=")
                    ? `/products?gender=${gender}`
                    : link.href;
                  return (
                    <Link
                      key={linkIdx}
                      href={href}
                      style={{
                        fontSize: "13px",
                        color: "rgba(246, 242, 234, 0.85)",
                        transition: "color 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.color = "var(--color-emerald)";
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.color =
                          "rgba(246, 242, 234, 0.85)";
                      }}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}

          {/* Newsletter Column */}
          {config.newsletter?.active && (
            <div>
              <div
                style={{
                  fontSize: "11.5px",
                  letterSpacing: "0.08em",
                  textTransform: "uppercase",
                  color: "rgba(246, 242, 234, 0.5)",
                  marginBottom: "14px",
                  fontWeight: 600,
                }}
              >
                {config.newsletter.title || "Newsletter"}
              </div>
              {config.newsletter.description && (
                <p
                  style={{
                    fontSize: "12.5px",
                    lineHeight: 1.6,
                    color: "rgba(246, 242, 234, 0.55)",
                    marginBottom: "14px",
                  }}
                >
                  {config.newsletter.description}
                </p>
              )}
              {subscribed ? (
                <div
                  style={{
                    fontSize: "12.5px",
                    color: "#81c784",
                    padding: "8px 0",
                    fontWeight: 500,
                  }}
                >
                  Thank you for subscribing ✓
                </div>
              ) : (
                <form
                  onSubmit={handleSubscribe}
                  style={{
                    display: "flex",
                    gap: "10px",
                    borderBottom: "1px solid rgba(246, 242, 234, 0.35)",
                    paddingBottom: "8px",
                    alignItems: "center",
                  }}
                >
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={
                      config.newsletter.placeholder || "Email address"
                    }
                    style={{
                      background: "none",
                      border: "none",
                      color: "#F6F2EA",
                      fontSize: "13px",
                      flex: 1,
                      outline: "none",
                    }}
                  />
                  <button
                    type="submit"
                    style={{
                      background: "none",
                      border: "none",
                      color: "#F6F2EA",
                      cursor: "pointer",
                      fontSize: "13px",
                      opacity: 0.85,
                      padding: 0,
                    }}
                  >
                    →
                  </button>
                </form>
              )}
            </div>
          )}
        </div>

        {/* Bottom Banner */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            flexWrap: "wrap",
            gap: "14px",
            borderTop: "1px solid rgba(246, 242, 234, 0.15)",
            paddingTop: "24px",
            fontSize: "12px",
            color: "rgba(246, 242, 234, 0.45)",
          }}
        >
          <span>{config.copyright}</span>
          <div style={{ display: "flex", gap: "16px" }}>
            {config.bottomLinks?.map((link, idx) => (
              <Link
                key={idx}
                href={link.href}
                style={{
                  color: "rgba(246, 242, 234, 0.45)",
                  transition: "color 0.15s ease",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.color = "#F6F2EA";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.color = "rgba(246, 242, 234, 0.45)";
                }}
              >
                {link.label}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
