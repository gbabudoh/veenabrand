"use client";

import React from "react";
import Link from "next/link";
import { useStore } from "@/lib/StoreContext";

export default function Footer() {
  const { gender } = useStore();

  return (
    <footer style={{
      background: "#15130F",
      color: "#F6F2EA",
      padding: "70px 24px 32px",
      marginTop: "auto"
    }}>
      <div className="container-max">
        {/* Main Grid */}
        <div style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px",
          marginBottom: "56px"
        }}>
          <div>
            <img
              src="/images/logo.png"
              alt="Veena"
              width={66}
              height={64}
              style={{ height: "64px", width: "auto", display: "block", marginBottom: "14px" }}
            />
            <p style={{
              fontSize: "13px",
              lineHeight: 1.7,
              color: "rgba(246, 242, 234, 0.55)",
              maxWidth: "280px"
            }}>
              Ready-to-wear and bespoke fashion, cut and finished in Lagos.
            </p>
          </div>

          <div>
            <div style={{
              fontSize: "11.5px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(246, 242, 234, 0.5)",
              marginBottom: "14px",
              fontWeight: 600
            }}>
              Shop
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href={`/products?gender=${gender}`} style={{ fontSize: "13px", color: "rgba(246, 242, 234, 0.85)" }}>
                New Arrivals
              </Link>
              <Link href="/products/signature-agbada-set" style={{ fontSize: "13px", color: "rgba(246, 242, 234, 0.85)" }}>
                Bespoke
              </Link>
              <Link href="/#runway-banner" style={{ fontSize: "13px", color: "rgba(246, 242, 234, 0.85)" }}>
                Runway
              </Link>
            </div>
          </div>

          <div>
            <div style={{
              fontSize: "11.5px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(246, 242, 234, 0.5)",
              marginBottom: "14px",
              fontWeight: 600
            }}>
              Company
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
              <Link href="/about" style={{ fontSize: "13px", color: "rgba(246, 242, 234, 0.85)" }}>
                About Veena
              </Link>
              <Link href="/legal?tab=terms" style={{ fontSize: "13px", color: "rgba(246, 242, 234, 0.85)" }}>
                Terms &amp; Policies
              </Link>
            </div>
          </div>

          <div>
            <div style={{
              fontSize: "11.5px",
              letterSpacing: "0.08em",
              textTransform: "uppercase",
              color: "rgba(246, 242, 234, 0.5)",
              marginBottom: "14px",
              fontWeight: 600
            }}>
              Newsletter
            </div>
            <div style={{
              display: "flex",
              gap: "10px",
              borderBottom: "1px solid rgba(246, 242, 234, 0.35)",
              paddingBottom: "8px",
              alignItems: "center"
            }}>
              <input
                type="email"
                placeholder="Email address"
                style={{
                  background: "none",
                  border: "none",
                  color: "#F6F2EA",
                  fontSize: "13px",
                  flex: 1,
                  outline: "none"
                }}
              />
              <span style={{ cursor: "pointer", fontSize: "13px", opacity: 0.85 }}>→</span>
            </div>
          </div>
        </div>

        {/* Bottom Banner */}
        <div style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          flexWrap: "wrap",
          gap: "14px",
          borderTop: "1px solid rgba(246, 242, 234, 0.15)",
          paddingTop: "24px",
          fontSize: "12px",
          color: "rgba(246, 242, 234, 0.45)"
        }}>
          <span>© 2026 Veena Fashion House. All rights reserved.</span>
          <div style={{ display: "flex", gap: "16px" }}>
            <Link href="/legal?tab=terms" style={{ color: "rgba(246, 242, 234, 0.45)" }}>Terms</Link>
            <Link href="/legal?tab=privacy" style={{ color: "rgba(246, 242, 234, 0.45)" }}>Privacy</Link>
            <Link href="/legal?tab=payment" style={{ color: "rgba(246, 242, 234, 0.45)" }}>Payment Terms</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
