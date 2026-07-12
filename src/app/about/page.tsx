"use client";

import React from "react";

export default function AboutPage() {
  return (
    <div className="fade-in">
      {/* 1. PORTRAIT HERO SECTION */}
      <section style={{
        position: "relative",
        height: "58vh",
        minHeight: "420px",
        overflow: "hidden",
        backgroundImage: "url(/images/founder.png)",
        backgroundSize: "cover",
        backgroundPosition: "center 20%",
        display: "flex",
        alignItems: "flex-end"
      }}>
        {/* Shading Overlay */}
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(21,19,15,0.7) 0%, rgba(21,19,15,0.1) 60%)" }}></div>
        
        <div className="container-about" style={{ padding: "0 24px 56px", position: "relative", zIndex: 10 }}>
          <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#F6F2EA", opacity: 0.7, marginBottom: "12px" }}>
            The House of Veena
          </div>
          <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "44px", color: "#F6F2EA", margin: 0, fontWeight: 500 }}>
            Designed with intention
          </h1>
        </div>
      </section>

      {/* 2. BRAND FOCUS / FOUNDER QUOTE SECTION */}
      <section className="container-about" style={{ padding: "100px 24px", textAlign: "center", maxWidth: "760px" }}>
        <p style={{
          fontFamily: "var(--font-serif)",
          fontSize: "24px",
          fontStyle: "italic",
          lineHeight: 1.6,
          marginBottom: "40px",
          color: "#15130F"
        }}>
          "I started Veena from a single sewing table in Lagos, convinced that fashion should fit the life you actually live — not the other way around."
        </p>
        <p style={{ fontSize: "14px", letterSpacing: "0.06em", textTransform: "uppercase", color: "rgba(21, 19, 15, 0.5)", fontWeight: 600 }}>
          — Veena, Founder & Creative Director
        </p>
      </section>

      {/* 3. ATELIER DETAIL SECTION */}
      <section className="container-about" style={{
        padding: "0 24px 100px",
        display: "grid",
        gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))",
        gap: "56px",
        alignItems: "center"
      }}>
        {/* Left Column: Atelier Image */}
        <div style={{
          aspectRatio: "4/3",
          backgroundImage: "url(/images/atelier.png)",
          backgroundSize: "cover",
          backgroundPosition: "center",
          borderRadius: "3px",
          position: "relative",
          overflow: "hidden",
          boxShadow: "0 10px 30px rgba(0,0,0,0.06)"
        }}>
          <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(120deg, rgba(21, 19, 15, 0.04) 0 2px, transparent 2px 24px)" }}></div>
        </div>

        {/* Right Column: Copy */}
        <div>
          <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "28px", margin: "0 0 18px", fontWeight: 500 }}>
            Our focus
          </h2>
          <p style={{ fontSize: "14.5px", lineHeight: 1.8, color: "rgba(21, 19, 15, 0.7)", marginBottom: "16px" }}>
            Every Veena piece is cut in our Lagos atelier using fabrics sourced from West African mills and select European houses. We build for two customers at once: the one buying off the rack, and the one who wants it altered to fit exactly right.
          </p>
          <p style={{ fontSize: "14.5px", lineHeight: 1.8, color: "rgba(21, 19, 15, 0.7)" }}>
            Bespoke and made-to-measure sit alongside ready-to-wear, because we believe both deserve the same craftsmanship.
          </p>
        </div>
      </section>

      {/* 4. MILESTONES STATS STRIP */}
      <section style={{ background: "#EEE7D8", padding: "90px 24px" }}>
        <div className="container-about" style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))",
          gap: "40px",
          textAlign: "center"
        }}>
          <div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "32px", marginBottom: "10px", fontWeight: 500 }}>2016</div>
            <div style={{ fontSize: "13px", color: "rgba(21, 19, 15, 0.6)", lineHeight: 1.5 }}>Founded in Lagos with a single tailoring bench</div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "32px", marginBottom: "10px", fontWeight: 500 }}>40+</div>
            <div style={{ fontSize: "13px", color: "rgba(21, 19, 15, 0.6)", lineHeight: 1.5 }}>Artisans across cutting, sewing and finishing</div>
          </div>
          <div>
            <div style={{ fontFamily: "var(--font-serif)", fontSize: "32px", marginBottom: "10px", fontWeight: 500 }}>12</div>
            <div style={{ fontSize: "13px", color: "rgba(21, 19, 15, 0.6)", lineHeight: 1.5 }}>Countries we now ship bespoke orders to</div>
          </div>
        </div>
      </section>
    </div>
  );
}
