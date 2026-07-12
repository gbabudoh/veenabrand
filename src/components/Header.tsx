"use client";

import React from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/StoreContext";

export default function Header() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { gender, setGender, cart, toggleChat } = useStore();

  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  const handleGenderChange = (newGender: "WOMEN" | "MEN") => {
    setGender(newGender);
    
    // If we're on the products page, update the query parameter to match
    if (pathname === "/products") {
      const params = new URLSearchParams(searchParams.toString());
      params.set("gender", newGender);
      router.push(`/products?${params.toString()}`);
    }
  };

  const pillStyle = (active: boolean) => ({
    border: "none",
    padding: "9px 20px",
    fontSize: "12px",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    background: active ? "#15130F" : "transparent",
    color: active ? "#F6F2EA" : "#15130F",
    borderRadius: "999px",
    fontWeight: 500,
  });

  return (
    <>
      {/* ANNOUNCEMENT BAR */}
      <div style={{
        background: "#15130F",
        color: "#F6F2EA",
        textAlign: "center",
        padding: "9px 16px",
        fontSize: "11px",
        letterSpacing: "0.14em",
        textTransform: "uppercase",
        fontWeight: 400
      }}>
        Complimentary Lagos delivery on orders over ₦150,000 &nbsp;·&nbsp; Bespoke atelier now booking for December
      </div>

      {/* NAVIGATION BAR */}
      <header style={{
        position: "sticky",
        top: 0,
        zIndex: 40,
        background: "rgba(246, 242, 234, 0.92)",
        backdropFilter: "blur(10px)",
        WebkitBackdropFilter: "blur(10px)",
        borderBottom: "1px solid rgba(21, 19, 15, 0.1)"
      }}>
        <div className="container-max" style={{
          padding: "16px 24px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          gap: "14px",
          flexWrap: "wrap",
        }}>
          {/* Logo and Nav Links */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "18px",
            flexWrap: "wrap",
            minWidth: 0
          }}>
            <Link href="/" style={{
              fontFamily: "var(--font-serif)",
              fontSize: "22px",
              letterSpacing: "0.06em",
              fontWeight: 600,
              flexShrink: 0,
              color: "#15130F"
            }}>
              VEENA
            </Link>
            
            <nav style={{
              display: "flex",
              gap: "14px",
              alignItems: "center",
              flexWrap: "wrap"
            }}>
              {/* Gender Toggle Pill */}
              <div style={{
                display: "flex",
                border: "1px solid rgba(21, 19, 15, 0.18)",
                borderRadius: "999px",
                overflow: "hidden",
                flexShrink: 0,
                background: "transparent"
              }}>
                <button
                  onClick={() => handleGenderChange("WOMEN")}
                  style={pillStyle(gender === "WOMEN")}
                >
                  Women
                </button>
                <button
                  onClick={() => handleGenderChange("MEN")}
                  style={pillStyle(gender === "MEN")}
                >
                  Men
                </button>
              </div>

              <Link
                href={`/products?gender=${gender}`}
                style={{
                  fontSize: "11.5px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#15130F",
                  whiteSpace: "nowrap"
                }}
              >
                New Arrivals
              </Link>
              <Link
                href="/#runway-banner"
                style={{
                  fontSize: "11.5px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#15130F",
                  whiteSpace: "nowrap"
                }}
              >
                Runway
              </Link>
              <Link
                href="/products/signature-agbada-set"
                style={{
                  fontSize: "11.5px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#15130F",
                  whiteSpace: "nowrap"
                }}
              >
                Bespoke
              </Link>
              <Link
                href="/about"
                style={{
                  fontSize: "11.5px",
                  letterSpacing: "0.05em",
                  textTransform: "uppercase",
                  color: "#15130F",
                  whiteSpace: "nowrap"
                }}
              >
                About
              </Link>
            </nav>
          </div>

          {/* Action Utilities */}
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "14px",
            flexWrap: "wrap",
            flexShrink: 0
          }}>
            <span
              onClick={toggleChat}
              style={{
                fontSize: "11.5px",
                letterSpacing: "0.05em",
                textTransform: "uppercase",
                cursor: "pointer",
                color: "var(--color-emerald)",
                borderBottom: "1px solid var(--color-emerald)",
                paddingBottom: "2px",
                whiteSpace: "nowrap",
                fontWeight: 500
              }}
            >
              Ask Veena
            </span>
            <span style={{ cursor: "pointer", fontSize: "14px", whiteSpace: "nowrap", opacity: 0.85 }}>Search</span>
            <span style={{ cursor: "pointer", fontSize: "14px", whiteSpace: "nowrap", opacity: 0.85 }}>Account</span>
            <Link
              href="/checkout"
              style={{
                fontSize: "11.5px",
                letterSpacing: "0.03em",
                border: "1px solid #15130F",
                borderRadius: "999px",
                padding: "7px 14px",
                whiteSpace: "nowrap",
                color: "#15130F",
                fontWeight: 500
              }}
            >
              Bag ({cartCount})
            </Link>
          </div>
        </div>
      </header>
    </>
  );
}
