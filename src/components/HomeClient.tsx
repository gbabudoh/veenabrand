"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useStore } from "@/lib/StoreContext";
import ProductCard from "@/components/ProductCard";

interface HomeClientProps {
  products: any[];
  initialSlides?: any[] | null;
  initialRunway?: { mode: "film" | "lookbook"; videoUrl: string } | null;
}

export default function HomeClient({ products, initialSlides, initialRunway }: HomeClientProps) {
  const router = useRouter();
  const { gender, setGender, openModal } = useStore();
  
  // Hero Slider Config
  const slides = initialSlides && initialSlides.length > 0 ? initialSlides : [
    {
      eyebrow: "Spring/Summer 2026",
      title: "Tailoring that moves with you",
      cta: "Shop Women",
      tone1: "#c9beac",
      tone2: "#8f8571",
      bgImage: "/images/hero_women.png",
      genderFilter: "WOMEN"
    },
    {
      eyebrow: "Runway Film",
      title: "The AW26 collection, in motion",
      cta: "Watch the Film",
      tone1: "#1c2a24",
      tone2: "#0d1512",
      bgImage: "/images/hero_runway.png",
      actionScroll: "runway-banner"
    },
    {
      eyebrow: "For Him",
      title: "Modern silhouettes, Lagos-made",
      cta: "Shop Men",
      tone1: "#3a3936",
      tone2: "#171613",
      bgImage: "/images/hero_men.png",
      genderFilter: "MEN"
    }
  ];

  const handleSlideAction = (slide: any) => {
    if (slide.genderFilter) {
      setGender(slide.genderFilter);
      router.push(`/products?gender=${slide.genderFilter}`);
    } else if (slide.actionScroll) {
      const el = document.getElementById(slide.actionScroll);
      if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  const runwayConfig = initialRunway || { mode: "film", videoUrl: "/placeholder/runway.mp4" };

  // Hero Slider States
  const [heroIndex, setHeroIndex] = useState(0);

  // Auto advance slider
  useEffect(() => {
    const timer = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % slides.length);
    }, 6000);
    return () => clearInterval(timer);
  }, [slides.length]);

  const prevHero = () => setHeroIndex((prev) => (prev - 1 + slides.length) % slides.length);
  const nextHero = () => setHeroIndex((prev) => (prev + 1) % slides.length);

  // Runway Toggle States
  const [runwayMode, setRunwayMode] = useState<"film" | "lookbook">(runwayConfig.mode);

  const LOOKBOOK_TILES = [
    { label: "LOOK 01", tone1: "#d8cdb6", tone2: "#a99c7d" },
    { label: "LOOK 02", tone1: "#5a5952", tone2: "#2b2a26" },
    { label: "LOOK 03", tone1: "#2f5c48", tone2: "#123024" },
    { label: "LOOK 04", tone1: "#efe6d0", tone2: "#cbbf9c" }
  ];

  // Filter products based on selected gender
  const filteredProducts = products
    .filter((p) => p.gender === gender)
    .slice(0, 3); // Display only top 3 new arrivals on homepage

  const togglePillStyle = (active: boolean) => ({
    border: "none",
    padding: "9px 20px",
    fontSize: "12px",
    letterSpacing: "0.04em",
    textTransform: "uppercase" as const,
    cursor: "pointer",
    background: active ? "#F6F2EA" : "transparent",
    color: active ? "#15130F" : "rgba(246, 242, 234, 0.6)",
    borderRadius: "999px",
    fontWeight: 500,
    transition: "all 0.2s ease"
  });

  return (
    <div>
      {/* 1. HERO SLIDER */}
      <section style={{ position: "relative", height: "86vh", minHeight: "560px", overflow: "hidden", background: "#15130F" }}>
        {slides.map((slide, i) => {
          const active = i === heroIndex;
          return (
            <div
              key={i}
              style={{
                position: "absolute",
                inset: 0,
                opacity: active ? 1 : 0,
                transition: "opacity 0.8s ease",
                pointerEvents: active ? "auto" : "none",
                backgroundSize: "cover",
                backgroundPosition: "center",
                backgroundImage: `url(${slide.bgImage})`
              }}
            >
              {/* Overlay shading to ensure readable text */}
              <div style={{
                position: "absolute",
                inset: 0,
                background: "linear-gradient(0deg, rgba(21, 19, 15, 0.75) 0%, rgba(21, 19, 15, 0.2) 60%, rgba(21, 19, 15, 0.4) 100%)"
              }}></div>

              {/* Slide text box */}
              <div style={{ position: "absolute", left: "56px", bottom: "76px", color: "#F6F2EA", maxWidth: "520px", zIndex: 10 }}>
                <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", opacity: 0.75, marginBottom: "14px" }}>
                  {slide.eyebrow}
                </div>
                <h1 style={{ fontFamily: "var(--font-serif)", fontSize: "52px", lineHeight: "1.05", margin: "0 0 20px", fontWeight: 500 }}>
                  {slide.title}
                </h1>
                <button
                  onClick={() => handleSlideAction(slide)}
                  style={{
                    background: "#F6F2EA",
                    color: "#15130F",
                    border: "none",
                    padding: "14px 26px",
                    fontSize: "12.5px",
                    letterSpacing: "0.08em",
                    textTransform: "uppercase",
                    cursor: "pointer",
                    borderRadius: "2px",
                    fontWeight: 600
                  }}
                >
                  {slide.cta}
                </button>
              </div>
            </div>
          );
        })}

        {/* Slide navigation controls */}
        <div style={{ position: "absolute", right: "56px", bottom: "76px", display: "flex", gap: "10px", zIndex: 10 }}>
          {slides.map((_, i) => (
            <span
              key={i}
              onClick={() => setHeroIndex(i)}
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                cursor: "pointer",
                background: i === heroIndex ? "#F6F2EA" : "rgba(246, 242, 234, 0.4)",
                transition: "background 0.3s ease"
              }}
            ></span>
          ))}
        </div>
        <button
          onClick={prevHero}
          style={{ position: "absolute", left: "20px", top: "50%", transform: "translateY(-50%)", background: "rgba(246, 242, 234, 0.14)", border: "none", color: "#F6F2EA", width: "44px", height: "44px", borderRadius: "50%", cursor: "pointer", fontSize: "18px", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          ‹
        </button>
        <button
          onClick={nextHero}
          style={{ position: "absolute", right: "20px", top: "50%", transform: "translateY(-50%)", background: "rgba(246, 242, 234, 0.14)", border: "none", color: "#F6F2EA", width: "44px", height: "44px", borderRadius: "50%", cursor: "pointer", fontSize: "18px", zIndex: 10, display: "flex", alignItems: "center", justifyContent: "center" }}
        >
          ›
        </button>
      </section>

      {/* 2. RUNWAY SWITCH BANNER */}
      <section
        id="runway-banner"
        style={{ background: "#0F0E0B", padding: "90px 24px", position: "relative" }}
      >
        <div className="container-max">
          <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginBottom: "34px", flexWrap: "wrap", gap: "18px" }}>
            <div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(246, 242, 234, 0.55)", marginBottom: "10px" }}>
                Autumn/Winter Collection
              </div>
              <h2 style={{ fontFamily: "var(--font-serif)", color: "#F6F2EA", fontSize: "36px", margin: 0, fontWeight: 500 }}>
                See it move on the runway
              </h2>
            </div>
            <div style={{ display: "flex", border: "1px solid rgba(246, 242, 234, 0.25)", borderRadius: "999px", overflow: "hidden", padding: "2px" }}>
              <button
                onClick={() => setRunwayMode("lookbook")}
                style={togglePillStyle(runwayMode === "lookbook")}
              >
                Lookbook
              </button>
              <button
                onClick={() => setRunwayMode("film")}
                style={togglePillStyle(runwayMode === "film")}
              >
                Runway Film
              </button>
            </div>
          </div>

          {runwayMode === "film" ? (
            <div style={{
              position: "relative",
              aspectRatio: "16/7.2",
              borderRadius: "4px",
              overflow: "hidden",
              backgroundImage: "url(/images/hero_runway.png)",
              backgroundSize: "cover",
              backgroundPosition: "center",
              boxShadow: "0 10px 40px rgba(0,0,0,0.5)"
            }}>
              <div style={{ position: "absolute", inset: 0, background: "rgba(15, 14, 11, 0.45)" }}></div>
              <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", flexDirection: "column", gap: "14px" }}>
                <button
                  style={{
                    width: "76px",
                    height: "76px",
                    borderRadius: "50%",
                    background: "rgba(246, 242, 234, 0.92)",
                    border: "none",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    cursor: "pointer",
                    fontSize: "22px",
                    color: "#15130F",
                    paddingLeft: "6px",
                    boxShadow: "0 8px 24px rgba(0,0,0,0.3)"
                  }}
                >
                  ▶
                </button>
                <span style={{ fontFamily: "var(--font-mono)", fontSize: "12px", letterSpacing: "0.06em", color: "rgba(246, 242, 234, 0.65)", fontWeight: 500 }}>
                  RUNWAY FILM — "VEENA AW26" — 02:14
                </span>
              </div>
              <div style={{ position: "absolute", left: "32px", bottom: "28px", color: "#F6F2EA", fontFamily: "var(--font-serif)", fontSize: "22px", fontStyle: "italic", opacity: 0.9 }}>
                "Movement is the true test of a garment."
              </div>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "14px" }}>
              {LOOKBOOK_TILES.map((tile, i) => (
                <div
                  key={i}
                  style={{
                    aspectRatio: "3/4",
                    background: `linear-gradient(160deg, ${tile.tone1} 0%, ${tile.tone2} 100%)`,
                    borderRadius: "3px",
                    position: "relative",
                    overflow: "hidden"
                  }}
                >
                  <div style={{ position: "absolute", inset: 0, background: "repeating-linear-gradient(120deg, rgba(246, 242, 234, 0.05) 0 2px, transparent 2px 22px)" }}></div>
                  <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(246, 242, 234, 0.6)", fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.05em" }}>
                    {tile.label}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* 3. NEW ARRIVALS GRID */}
      <section style={{ padding: "90px 24px" }}>
        <div className="container-max">
          <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: "40px" }}>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "32px", margin: 0, fontWeight: 500 }}>
              New in — {gender === "WOMEN" ? "Women" : "Men"}
            </h2>
            <Link
              href={`/products?gender=${gender}`}
              style={{
                fontSize: "12.5px",
                letterSpacing: "0.06em",
                textTransform: "uppercase",
                borderBottom: "1px solid #15130F",
                paddingBottom: "2px",
                fontWeight: 600,
                color: "#15130F"
              }}
            >
              View all
            </Link>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: "28px" }}>
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* 4. CATEGORY TILES (GENDER SPLIT) */}
      <section style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 0 }}>
        <div
          onClick={() => {
            setGender("WOMEN");
            router.push("/products?gender=WOMEN");
          }}
          style={{
            position: "relative",
            height: "460px",
            cursor: "pointer",
            overflow: "hidden",
            backgroundImage: "url(/images/hero_women.png)",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(21, 19, 15, 0.6) 0%, rgba(21, 19, 15, 0) 60%)" }}></div>
          <div style={{ position: "absolute", left: "36px", bottom: "34px", color: "#F6F2EA", fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: 500 }}>
            Shop Women
          </div>
        </div>
        <div
          onClick={() => {
            setGender("MEN");
            router.push("/products?gender=MEN");
          }}
          style={{
            position: "relative",
            height: "460px",
            cursor: "pointer",
            overflow: "hidden",
            backgroundImage: "url(/images/hero_men.png)",
            backgroundSize: "cover",
            backgroundPosition: "center"
          }}
        >
          <div style={{ position: "absolute", inset: 0, background: "linear-gradient(0deg, rgba(21, 19, 15, 0.6) 0%, rgba(21, 19, 15, 0) 60%)" }}></div>
          <div style={{ position: "absolute", left: "36px", bottom: "34px", color: "#F6F2EA", fontFamily: "var(--font-serif)", fontSize: "28px", fontWeight: 500 }}>
            Shop Men
          </div>
        </div>
      </section>

      {/* 5. BESPOKE ATELIER TEASER */}
      <section style={{ padding: "100px 24px", background: "#EEE7D8" }}>
        <div className="container-max" style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: "64px", alignItems: "center" }}>
          <div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "#1F5C42", marginBottom: "14px", fontWeight: 600 }}>
              Made to Measure
            </div>
            <h2 style={{ fontFamily: "var(--font-serif)", fontSize: "34px", margin: "0 0 18px", fontWeight: 500 }}>
              A garment built around you
            </h2>
            <p style={{ fontSize: "15px", lineHeight: 1.7, color: "rgba(21, 19, 15, 0.7)", maxWidth: "440px", marginBottom: "26px" }}>
              From a single alteration to a fully bespoke piece, our atelier works with your measurements, fabric preferences and timeline.
            </p>
            <button
              onClick={() => openModal("bespoke")}
              style={{
                background: "#15130F",
                color: "#F6F2EA",
                border: "none",
                padding: "14px 26px",
                fontSize: "12.5px",
                letterSpacing: "0.08em",
                textTransform: "uppercase",
                cursor: "pointer",
                borderRadius: "2px",
                fontWeight: 600
              }}
            >
              Start a bespoke request
            </button>
          </div>
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
        </div>
      </section>

      {/* 6. ABOUT TEASER BRAND STORY */}
      <section className="container-about" style={{ padding: "110px 24px", textAlign: "center" }}>
        <div style={{ fontFamily: "var(--font-mono)", fontSize: "11px", letterSpacing: "0.14em", textTransform: "uppercase", color: "rgba(21, 19, 15, 0.5)", marginBottom: "18px" }}>
          The House of Veena
        </div>
        <p style={{ fontFamily: "var(--font-serif)", fontSize: "28px", fontStyle: "italic", lineHeight: 1.5, marginBottom: "26px" }}>
          "Every stitch begins with the person who will wear it — Veena is fashion built on relationship, not just fabric."
        </p>
        <Link
          href="/about"
          style={{
            fontSize: "12.5px",
            letterSpacing: "0.06em",
            textTransform: "uppercase",
            borderBottom: "1px solid #15130F",
            paddingBottom: "2px",
            fontWeight: 600,
            color: "#15130F",
            display: "inline-block"
          }}
        >
          Read our story
        </Link>
      </section>
    </div>
  );
}
