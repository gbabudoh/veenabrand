"use client";

import React from "react";
import useRouter from "next/navigation";
import Link from "next/link";
import { formatNaira } from "@/lib/money";

interface ProductCardProps {
  product: {
    id: string;
    slug: string;
    name: string;
    category: string;
    priceMinor: number;
    colors: { name: string; hex: string }[];
    media: { url: string; label: string }[];
  };
}

export default function ProductCard({ product }: ProductCardProps) {
  const primaryColor = product.colors[0];
  const colorHex = primaryColor?.hex || "#EEE7D8";
  const colorName = primaryColor?.name || "Ivory";

  return (
    <Link href={`/products/${product.slug}`} style={{ cursor: "pointer", display: "block" }}>
      {/* Product Image Frame */}
      <div style={{
        aspectRatio: "3/4",
        position: "relative",
        overflow: "hidden",
        borderRadius: "3px",
        background: `linear-gradient(160deg, ${colorHex} 0%, #15130F 180%)`,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        border: "1px solid rgba(21, 19, 15, 0.05)",
        boxShadow: "0 4px 12px rgba(21, 19, 15, 0.02)"
      }}>
        {/* Placeholder label simulating textile texture */}
        <div style={{
          position: "absolute",
          inset: 0,
          background: "repeating-linear-gradient(120deg, rgba(21,19,15,0.03) 0 2px, transparent 2px 24px)"
        }}></div>

        {/* Info overlay badge */}
        <span style={{
          position: "absolute",
          top: "14px",
          left: "14px",
          background: "#F6F2EA",
          color: "#15130F",
          fontSize: "10px",
          letterSpacing: "0.06em",
          textTransform: "uppercase",
          padding: "5px 10px",
          borderRadius: "999px",
          zIndex: 5,
          fontWeight: 500,
          border: "1px solid rgba(21, 19, 15, 0.08)"
        }}>
          {product.category}
        </span>

        {/* Labeled outline showing product colors details */}
        <div style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          gap: "4px",
          color: "rgba(21, 19, 15, 0.45)",
          fontFamily: "var(--font-mono)",
          fontSize: "11px",
          letterSpacing: "0.02em",
          zIndex: 2
        }}>
          <span>PRODUCT SHOT</span>
          <span>· {colorName.toUpperCase()} ·</span>
        </div>
      </div>

      {/* Product Info Block */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        marginTop: "14px",
        gap: "10px"
      }}>
        <span style={{ fontSize: "14px", fontWeight: 500, color: "#15130F" }}>
          {product.name}
        </span>
        <span style={{ fontSize: "14px", color: "rgba(21, 19, 15, 0.65)" }}>
          {formatNaira(product.priceMinor)}
        </span>
      </div>

      <div style={{
        fontSize: "12px",
        color: "rgba(21, 19, 15, 0.45)",
        marginTop: "3px"
      }}>
        {colorName}
      </div>
    </Link>
  );
}
