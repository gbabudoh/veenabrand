"use client";

import React, { useState, useRef, useMemo } from "react";
import Image from "next/image";
import Link from "next/link";
import { useStore } from "@/lib/StoreContext";
import { formatNaira } from "@/lib/money";
import { genderHome } from "@/lib/gender";

/* ==========================================================================
   ENTERPRISE HAIRLINE ICONS (1.5px Stroke Width)
   ========================================================================== */

function SparkleIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M12 2v4m0 12v4M2 12h4m12 0h4m-3.17-6.83l-2.83 2.83M6.83 17.17l-2.83 2.83m14 0l-2.83-2.83M6.83 6.83L4 4" />
    </svg>
  );
}

function ScissorsIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="6" cy="6" r="3" />
      <circle cx="6" cy="18" r="3" />
      <line x1="20" y1="4" x2="8.12" y2="15.88" />
      <line x1="14.47" y1="14.48" x2="20" y2="20" />
      <line x1="8.12" y1="8.12" x2="12" y2="12" />
    </svg>
  );
}

function MaximizeIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15 3h6v6m0-6l-7 7M9 21H3v-6m0 6l7-7" />
    </svg>
  );
}

function CloseIcon({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

function PlayIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <polygon points="5 3 19 12 5 21 5 3" />
    </svg>
  );
}

function PauseIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <rect x="6" y="4" width="4" height="16" />
      <rect x="14" y="4" width="4" height="16" />
    </svg>
  );
}

function ChevronDownIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function ChevronLeftIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="15 18 9 12 15 6" />
    </svg>
  );
}

function ChevronRightIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="9 18 15 12 9 6" />
    </svg>
  );
}

function RulerIcon({ size = 14 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21.3 8.7l-6-6a1 1 0 0 0-1.4 0l-11 11a1 1 0 0 0 0 1.4l6 6a1 1 0 0 0 1.4 0l11-11a1 1 0 0 0 0-1.4z" />
      <path d="M7.5 10.5l2 2m2-6l2 2m2 6l2 2" />
    </svg>
  );
}

function CheckIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="20 6 9 17 4 12" />
    </svg>
  );
}

function ChatIcon({ size = 16 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
    </svg>
  );
}

/* ==========================================================================
   PROPS & TYPES
   ========================================================================== */

interface ProductDetailClientProps {
  product: {
    id: string;
    slug: string;
    name: string;
    description: string;
    fabricCare: string;
    shippingReturnsNote: string;
    priceMinor: number;
    category: { id: string; name: string; slug: string } | null;
    gender: string;
    colors: { name: string; hex: string }[];
    media: { url: string; label: string | null; type: string }[];
    reviews: { id: string; authorName: string; rating: number; text: string; createdAt: Date }[];
  };
}

const SIZES = ["XS", "S", "M", "L", "XL"];

export default function ProductDetailClient({ product }: ProductDetailClientProps) {
  const { addToCart, openModal, toggleChat } = useStore();

  // Media view states
  const [mediaIdx, setMediaIdx] = useState(0);
  const [colorIdx, setColorIdx] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string>("M");
  const [activeTab, setActiveTab] = useState<string | null>("description");
  const [isAdded, setIsAdded] = useState(false);
  const [isSizeDrawerOpen, setIsSizeDrawerOpen] = useState(false);
  const [sizeUnit, setSizeUnit] = useState<"cm" | "in">("cm");
  const [lightboxIdx, setLightboxIdx] = useState<number | null>(null);

  // Video state
  const [isPlaying, setIsPlaying] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Zoom Loupe State
  const [zoomStyle, setZoomStyle] = useState<{ backgroundPosition: string } | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);

  // Fallback Media handling for pristine presentation
  const mediaList = useMemo(() => {
    const fallbackList = [
      { url: "/images/emerald_gown_runway.jpg", label: "Runway Presentation", type: "IMAGE" },
      { url: "/images/emerald_gown_detail.jpg", label: "Silk Crepe Detail", type: "IMAGE" },
      { url: "/images/emerald_gown_studio.jpg", label: "Studio Draped Profile", type: "IMAGE" },
      { url: "https://assets.mixkit.co/videos/preview/mixkit-fashion-model-in-a-runway-show-41843-large.mp4", label: "Runway Motion", type: "VIDEO" }
    ];

    if (!product.media || product.media.length === 0) {
      return fallbackList;
    }

    return product.media.map((m, idx) => {
      let cleanUrl = m.url;
      if (!cleanUrl || cleanUrl.includes("placeholder") || cleanUrl.includes("via.placeholder")) {
        cleanUrl = fallbackList[idx % fallbackList.length].url;
      }
      return {
        ...m,
        url: cleanUrl,
        label: m.label || (m.type === "VIDEO" ? "Runway Motion" : `Editorial Look 0${idx + 1}`)
      };
    });
  }, [product.media]);

  const activeMedia = mediaList[mediaIdx] || mediaList[0];
  const selectedColor = product.colors[colorIdx] || product.colors[0] || { name: "Emerald", hex: "#1F5C42" };

  // Catalog code
  const catalogRef = `VN-${product.slug.toUpperCase().slice(0, 4)}-${product.id.slice(-4).toUpperCase()}`;

  // Handle Zoom Loupe
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (activeMedia.type === "VIDEO" || !stageRef.current) return;
    const { left, top, width, height } = stageRef.current.getBoundingClientRect();
    const x = ((e.clientX - left) / width) * 100;
    const y = ((e.clientY - top) / height) * 100;
    setZoomStyle({
      backgroundPosition: `${x}% ${y}%`
    });
  };

  const handleMouseLeave = () => {
    setZoomStyle(null);
  };

  // Video Toggle
  const togglePlay = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current.play();
      setIsPlaying(true);
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Add to bag micro-interaction
  const handleAddToBag = () => {
    addToCart(product.id, selectedSize, selectedColor.name);
    setIsAdded(true);
    setTimeout(() => {
      setIsAdded(false);
    }, 2000);
  };

  // Lightbox Navigation
  const handlePrevLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIdx === null) return;
    setLightboxIdx((prev) => (prev! > 0 ? prev! - 1 : mediaList.length - 1));
  };

  const handleNextLightbox = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (lightboxIdx === null) return;
    setLightboxIdx((prev) => (prev! < mediaList.length - 1 ? prev! + 1 : 0));
  };

  return (
    <div className="vn-pdp-container">
      {/* Breadcrumb Trail & Atelier Reference */}
      <div className="vn-pdp-breadcrumbs">
        <div className="vn-pdp-breadcrumbs-trail">
          <Link href="/">Atelier</Link>
          <span>/</span>
          <Link href={genderHome(product.gender === "MEN" ? "MEN" : "WOMEN")}>
            {product.gender === "WOMEN" ? "Women" : "Men"}
          </Link>
          <span>/</span>
          <Link href={`/${product.gender.toLowerCase()}?category=${product.category?.slug || ""}`}>
            {product.category?.name || "Runway Pieces"}
          </Link>
          <span>/</span>
          <span style={{ color: "var(--color-ink)", fontWeight: 500 }}>{product.name}</span>
        </div>
        <div className="vn-pdp-ref-tag">
          REF: {catalogRef}
        </div>
      </div>

      {/* Main Luxury PDP Grid */}
      <div className="vn-pdp-grid">
        {/* Left Column: Visual Presentation Rail & 4:5 Lookbook Canvas */}
        <div className="vn-pdp-gallery-wrap">
          {/* Vertical Thumbnail Rail */}
          <div className="vn-pdp-thumbnails">
            {mediaList.map((m, idx) => {
              const isSelected = idx === mediaIdx;
              const isVideo = m.type === "VIDEO";

              return (
                <button
                  key={m.url + idx}
                  type="button"
                  className="vn-pdp-thumb-btn"
                  data-active={isSelected}
                  onClick={() => {
                    setMediaIdx(idx);
                    if (isVideo) setIsPlaying(true);
                  }}
                  aria-label={`View ${m.label || `angle ${idx + 1}`}`}
                >
                  {isVideo ? (
                    <div style={{ width: "100%", height: "100%", background: "#1F231F", display: "flex", alignItems: "center", justifyContent: "center" }}>
                      <PlayIcon size={18} />
                    </div>
                  ) : (
                    <Image
                      src={m.url}
                      alt={m.label || product.name}
                      fill
                      sizes="80px"
                      style={{ objectFit: "cover" }}
                    />
                  )}
                  {isVideo && (
                    <span className="vn-pdp-thumb-video-badge">
                      <PlayIcon size={8} /> MOTION
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          {/* Main 4:5 Visual Canvas with Loupe Zoom */}
          <div
            ref={stageRef}
            className="vn-pdp-stage"
            onMouseMove={handleMouseMove}
            onMouseLeave={handleMouseLeave}
            onClick={() => {
              if (activeMedia.type === "IMAGE") {
                setLightboxIdx(mediaIdx);
              }
            }}
          >
            {/* Stage Badges & Fullscreen Button */}
            <div className="vn-pdp-stage-badges">
              <div className="vn-pdp-curation-pill">
                <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--color-emerald)" }}></span>
                {activeMedia.type === "VIDEO" ? "Runway Motion Teaser" : activeMedia.label || "Runway Look 03"}
              </div>
              <button
                type="button"
                className="vn-pdp-fullscreen-btn"
                onClick={(e) => {
                  e.stopPropagation();
                  setLightboxIdx(mediaIdx);
                }}
                title="Expand fullscreen view"
                aria-label="Expand image"
              >
                <MaximizeIcon size={16} />
              </button>
            </div>

            {/* Media Rendering: Image with Zoom or Video */}
            {activeMedia.type === "VIDEO" ? (
              <>
                <video
                  ref={videoRef}
                  src={activeMedia.url}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="vn-pdp-stage-video"
                />
                <div className="vn-pdp-video-controls">
                  <button type="button" className="vn-pdp-play-btn" onClick={togglePlay}>
                    {isPlaying ? (
                      <>
                        <PauseIcon size={12} /> Pause Motion
                      </>
                    ) : (
                      <>
                        <PlayIcon size={12} /> Play Runway
                      </>
                    )}
                  </button>
                </div>
              </>
            ) : (
              <>
                <Image
                  src={activeMedia.url}
                  alt={product.name}
                  fill
                  priority
                  sizes="(max-width: 1040px) 100vw, 55vw"
                  className="vn-pdp-stage-media"
                />
                {/* Desktop Zoom Loupe Overlay */}
                <div
                  className="vn-pdp-loupe"
                  style={{
                    backgroundImage: `url(${activeMedia.url})`,
                    backgroundSize: "220%",
                    ...zoomStyle
                  }}
                />
              </>
            )}
          </div>
        </div>

        {/* Right Column: Atelier Specifications & Actions */}
        <div className="vn-pdp-info">
          {/* Atelier Edition Tag */}
          <div className="vn-pdp-edition-meta">
            <span>SS26 Runway Edition</span>
            <span>•</span>
            <span>Limited Run Atelier Piece</span>
          </div>

          {/* Title */}
          <h1 className="vn-pdp-title">{product.name}</h1>

          {/* Pricing & Courier Perk */}
          <div className="vn-pdp-pricing-block">
            <div className="vn-pdp-price">{formatNaira(product.priceMinor)}</div>
            <div className="vn-pdp-price-perk">
              <span className="vn-pdp-price-dot"></span>
              Complimentary DHL Express &amp; Veena Garment Bag
            </div>
          </div>

          {/* Color Swatches */}
          <div style={{ marginBottom: "26px" }}>
            <div className="vn-pdp-section-label">
              <span>Colour — {selectedColor.name}</span>
              <span style={{ fontSize: "11px", color: "rgba(21, 19, 15, 0.45)", fontWeight: "normal" }}>
                {product.colors.length} {product.colors.length === 1 ? "Atelier Hue" : "Atelier Hues"}
              </span>
            </div>
            <div className="vn-pdp-swatches-list">
              {product.colors.map((c, i) => {
                const isSelected = i === colorIdx;
                return (
                  <button
                    key={c.name}
                    type="button"
                    className="vn-pdp-swatch"
                    data-active={isSelected}
                    onClick={() => setColorIdx(i)}
                    title={c.name}
                    aria-label={`Select color ${c.name}`}
                  >
                    <span
                      className="vn-pdp-swatch-inner"
                      style={{ backgroundColor: c.hex }}
                    />
                  </button>
                );
              })}
            </div>
          </div>

          {/* Sizing Section */}
          <div style={{ marginBottom: "28px" }}>
            <div className="vn-pdp-size-header">
              <span className="vn-pdp-section-label" style={{ marginBottom: 0 }}>
                Size — Selected: {selectedSize}
              </span>
              <button
                type="button"
                className="vn-pdp-size-guide-link"
                onClick={() => setIsSizeDrawerOpen(true)}
              >
                <RulerIcon size={13} />
                <span>Atelier Size Guide &amp; Measurements</span>
              </button>
            </div>
            <div className="vn-pdp-sizes-grid">
              {SIZES.map((sz) => {
                const isSelected = sz === selectedSize;
                return (
                  <button
                    key={sz}
                    type="button"
                    className="vn-pdp-size-btn"
                    data-active={isSelected}
                    onClick={() => setSelectedSize(sz)}
                  >
                    <span>{sz}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Primary Action Button: Add to Bag */}
          <button
            type="button"
            className="vn-pdp-primary-atc"
            data-added={isAdded}
            onClick={handleAddToBag}
          >
            {isAdded ? (
              <>
                <CheckIcon size={16} /> Added to Bag
              </>
            ) : (
              <>Add to Bag — {formatNaira(product.priceMinor)}</>
            )}
          </button>

          {/* Concierge Dual Actions: Try-On & Adjustment */}
          <div className="vn-pdp-concierge-row">
            <button
              type="button"
              className="vn-pdp-concierge-btn"
              onClick={() => openModal("tryon", { productId: product.id })}
            >
              <SparkleIcon size={14} />
              <span>Virtual Silhouette Try-On</span>
            </button>
            <button
              type="button"
              className="vn-pdp-concierge-btn"
              onClick={() => openModal("adjustment", { productId: product.id })}
            >
              <ScissorsIcon size={14} />
              <span>Atelier Fit Adjustment</span>
            </button>
          </div>

          {/* Made-to-Measure Bespoke Panel */}
          <div
            className="vn-pdp-bespoke-panel"
            onClick={() => openModal("bespoke", { productId: product.id })}
            role="button"
            tabIndex={0}
          >
            <div className="vn-pdp-bespoke-info">
              <h4>Made-to-Measure &amp; Bespoke Commissions</h4>
              <p>
                Have this silhouette recut to your exact personal measurements or in custom bridal silk.
              </p>
            </div>
            <div className="vn-pdp-bespoke-arrow">→</div>
          </div>

          {/* Flat Face Accordions */}
          <div className="vn-pdp-accordions">
            {/* Accordion 1: Silhouette & Description */}
            <div className="vn-pdp-acc-item" data-open={activeTab === "description"}>
              <button
                type="button"
                className="vn-pdp-acc-trigger"
                onClick={() => setActiveTab(activeTab === "description" ? null : "description")}
              >
                <div className="vn-pdp-acc-icon">
                  <span>Silhouette &amp; Atelier Tailoring</span>
                </div>
                <ChevronDownIcon size={16} className="vn-pdp-acc-chevron" />
              </button>
              {activeTab === "description" && (
                <div className="vn-pdp-acc-body">
                  <p>{product.description}</p>
                  <ul>
                    <li>Floor-length column drape designed for fluid, sculptural movement.</li>
                    <li>Interior boned corset structure for discreet structural support.</li>
                    <li>Concealed hairline back zip with hand-covered silk button closure.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Accordion 2: Fabric & Craft */}
            <div className="vn-pdp-acc-item" data-open={activeTab === "fabric"}>
              <button
                type="button"
                className="vn-pdp-acc-trigger"
                onClick={() => setActiveTab(activeTab === "fabric" ? null : "fabric")}
              >
                <div className="vn-pdp-acc-icon">
                  <span>Artisanal Fabric &amp; Craftsmanship</span>
                </div>
                <ChevronDownIcon size={16} className="vn-pdp-acc-chevron" />
              </button>
              {activeTab === "fabric" && (
                <div className="vn-pdp-acc-body">
                  <p>{product.fabricCare}</p>
                  <ul>
                    <li>100% Double-weight Italian Silk Crepe with satin interior back.</li>
                    <li>Sourced from historic Como mills with OEKO-TEX® certified botanical dyes.</li>
                    <li>Specialist dry clean only. Store in provided archival cotton garment bag.</li>
                  </ul>
                </div>
              )}
            </div>

            {/* Accordion 3: Delivery & Returns */}
            <div className="vn-pdp-acc-item" data-open={activeTab === "shipping"}>
              <button
                type="button"
                className="vn-pdp-acc-trigger"
                onClick={() => setActiveTab(activeTab === "shipping" ? null : "shipping")}
              >
                <div className="vn-pdp-acc-icon">
                  <span>Complimentary White Glove Delivery &amp; Returns</span>
                </div>
                <ChevronDownIcon size={16} className="vn-pdp-acc-chevron" />
              </button>
              {activeTab === "shipping" && (
                <div className="vn-pdp-acc-body">
                  <p>{product.shippingReturnsNote}</p>
                  <ul>
                    <li>Lagos, Abuja &amp; Port Harcourt: 24–48hr Hand-delivered concierge courier.</li>
                    <li>International: 3–5 business days via insured DHL Express Worldwide.</li>
                    <li>Complimentary 14-day home fitting trial with seamless concierge returns.</li>
                  </ul>
                </div>
              )}
            </div>
          </div>

          {/* Client Advisor Card */}
          <div className="vn-pdp-advisor-card" onClick={toggleChat} role="button" tabIndex={0}>
            <div className="vn-pdp-advisor-text">
              <ChatIcon size={16} />
              <span>Have styling questions about this silhouette?</span>
            </div>
            <div className="vn-pdp-advisor-action">
              Ask Veena →
            </div>
          </div>
        </div>
      </div>

      {/* Customer Fittings & Reviews Section */}
      <section className="vn-pdp-reviews-section">
        <div className="vn-pdp-reviews-header">
          <h2 className="vn-pdp-reviews-title">Client Fittings &amp; Reviews</h2>
          <span style={{ fontSize: "12.5px", color: "rgba(21, 19, 15, 0.55)" }}>
            {product.reviews.length} Verified {product.reviews.length === 1 ? "Fitting" : "Fittings"}
          </span>
        </div>

        {product.reviews.length === 0 ? (
          <div style={{ color: "rgba(21,19,15,0.5)", fontSize: "13.5px", padding: "16px 0" }}>
            No fitting notes published yet. Be the first to share your silhouette feedback!
          </div>
        ) : (
          product.reviews.map((r) => (
            <div key={r.id} className="vn-pdp-review-card">
              <div className="vn-pdp-review-top">
                <div className="vn-pdp-review-author">
                  <span>{r.authorName}</span>
                  <span className="vn-pdp-verified-badge">Verified Client</span>
                </div>
                <div className="vn-pdp-review-rating">
                  {"★".repeat(r.rating) + "☆".repeat(5 - r.rating)}
                </div>
              </div>
              <p className="vn-pdp-review-text">{r.text}</p>
            </div>
          ))
        )}
      </section>

      {/* =====================================================================
          ATELIER MEASUREMENT & SIZE GUIDE SLIDING DRAWER
          ===================================================================== */}
      <div
        className="vn-size-drawer-backdrop"
        data-open={isSizeDrawerOpen}
        onClick={() => setIsSizeDrawerOpen(false)}
      />

      <aside className="vn-size-drawer" data-open={isSizeDrawerOpen} aria-label="Atelier Size Guide">
        <div className="vn-size-drawer-head">
          <h3 className="vn-size-drawer-title">Atelier Size Guide</h3>
          <button
            type="button"
            className="vn-size-drawer-close"
            onClick={() => setIsSizeDrawerOpen(false)}
            aria-label="Close size guide"
          >
            <CloseIcon size={18} />
          </button>
        </div>

        <div className="vn-size-drawer-body">
          {/* Unit Toggle: CM vs INCHES */}
          <div className="vn-size-unit-toggle">
            <button
              type="button"
              className="vn-size-unit-btn"
              data-active={sizeUnit === "cm"}
              onClick={() => setSizeUnit("cm")}
            >
              Centimetres (CM)
            </button>
            <button
              type="button"
              className="vn-size-unit-btn"
              data-active={sizeUnit === "in"}
              onClick={() => setSizeUnit("in")}
            >
              Inches (IN)
            </button>
          </div>

          {/* Garment Dimensions Table */}
          <div className="vn-size-table-title">Garment Finished Measurements</div>
          <table className="vn-size-table">
            <thead>
              <tr>
                <th>Size</th>
                <th>Bust</th>
                <th>Waist</th>
                <th>Hip</th>
                <th>Length</th>
              </tr>
            </thead>
            <tbody>
              {sizeUnit === "cm" ? (
                <>
                  <tr>
                    <td><strong>XS</strong> (UK 6)</td>
                    <td>82 cm</td>
                    <td>64 cm</td>
                    <td>90 cm</td>
                    <td>152 cm</td>
                  </tr>
                  <tr>
                    <td><strong>S</strong> (UK 8)</td>
                    <td>86 cm</td>
                    <td>68 cm</td>
                    <td>94 cm</td>
                    <td>154 cm</td>
                  </tr>
                  <tr>
                    <td><strong>M</strong> (UK 10)</td>
                    <td>90 cm</td>
                    <td>72 cm</td>
                    <td>98 cm</td>
                    <td>156 cm</td>
                  </tr>
                  <tr>
                    <td><strong>L</strong> (UK 12)</td>
                    <td>95 cm</td>
                    <td>77 cm</td>
                    <td>103 cm</td>
                    <td>158 cm</td>
                  </tr>
                  <tr>
                    <td><strong>XL</strong> (UK 14)</td>
                    <td>101 cm</td>
                    <td>83 cm</td>
                    <td>109 cm</td>
                    <td>160 cm</td>
                  </tr>
                </>
              ) : (
                <>
                  <tr>
                    <td><strong>XS</strong> (US 2)</td>
                    <td>32.3 in</td>
                    <td>25.2 in</td>
                    <td>35.4 in</td>
                    <td>59.8 in</td>
                  </tr>
                  <tr>
                    <td><strong>S</strong> (US 4)</td>
                    <td>33.9 in</td>
                    <td>26.8 in</td>
                    <td>37.0 in</td>
                    <td>60.6 in</td>
                  </tr>
                  <tr>
                    <td><strong>M</strong> (US 6)</td>
                    <td>35.4 in</td>
                    <td>28.3 in</td>
                    <td>38.6 in</td>
                    <td>61.4 in</td>
                  </tr>
                  <tr>
                    <td><strong>L</strong> (US 8)</td>
                    <td>37.4 in</td>
                    <td>30.3 in</td>
                    <td>40.5 in</td>
                    <td>62.2 in</td>
                  </tr>
                  <tr>
                    <td><strong>XL</strong> (US 10)</td>
                    <td>39.8 in</td>
                    <td>32.7 in</td>
                    <td>42.9 in</td>
                    <td>63.0 in</td>
                  </tr>
                </>
              )}
            </tbody>
          </table>

          {/* International Conversions Table */}
          <div className="vn-size-table-title">International Size Conversion</div>
          <table className="vn-size-table">
            <thead>
              <tr>
                <th>Veena</th>
                <th>UK / AU</th>
                <th>US</th>
                <th>EU</th>
                <th>IT</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td><strong>XS</strong></td>
                <td>6</td>
                <td>2</td>
                <td>34</td>
                <td>38</td>
              </tr>
              <tr>
                <td><strong>S</strong></td>
                <td>8</td>
                <td>4</td>
                <td>36</td>
                <td>40</td>
              </tr>
              <tr>
                <td><strong>M</strong></td>
                <td>10</td>
                <td>6</td>
                <td>38</td>
                <td>42</td>
              </tr>
              <tr>
                <td><strong>L</strong></td>
                <td>12</td>
                <td>8</td>
                <td>40</td>
                <td>44</td>
              </tr>
              <tr>
                <td><strong>XL</strong></td>
                <td>14</td>
                <td>10</td>
                <td>42</td>
                <td>46</td>
              </tr>
            </tbody>
          </table>

          {/* Atelier Tailoring Advice */}
          <div className="vn-size-guide-tip">
            <strong>Atelier Fit Advice:</strong> This silhouette is engineered to drape cleanly along natural body lines. If you are between sizes or intend to wear with high stilettos, we recommend ordering based on your waist measurement or utilizing our <strong>Virtual Silhouette Try-On</strong> and <strong>Atelier Fit Adjustment</strong> services for precision hem length.
          </div>
        </div>
      </aside>

      {/* =====================================================================
          FULLSCREEN LIGHTBOX MODAL
          ===================================================================== */}
      {lightboxIdx !== null && (
        <div className="vn-pdp-lightbox" onClick={() => setLightboxIdx(null)}>
          <button
            type="button"
            className="vn-pdp-lightbox-close"
            onClick={() => setLightboxIdx(null)}
            aria-label="Close fullscreen view"
          >
            <CloseIcon size={20} />
          </button>

          {mediaList.length > 1 && (
            <>
              <button
                type="button"
                className="vn-pdp-lightbox-nav"
                data-dir="prev"
                onClick={handlePrevLightbox}
                aria-label="Previous image"
              >
                <ChevronLeftIcon size={24} />
              </button>
              <button
                type="button"
                className="vn-pdp-lightbox-nav"
                data-dir="next"
                onClick={handleNextLightbox}
                aria-label="Next image"
              >
                <ChevronRightIcon size={24} />
              </button>
            </>
          )}

          {/* Lightbox Media */}
          {mediaList[lightboxIdx].type === "VIDEO" ? (
            <video
              src={mediaList[lightboxIdx].url}
              controls
              autoPlay
              playsInline
              style={{ maxWidth: "90vw", maxHeight: "85vh", borderRadius: "3px" }}
              onClick={(e) => e.stopPropagation()}
            />
          ) : (
            <img
              src={mediaList[lightboxIdx].url}
              alt={mediaList[lightboxIdx].label || product.name}
              className="vn-pdp-lightbox-img"
              onClick={(e) => e.stopPropagation()}
            />
          )}

          <div className="vn-pdp-lightbox-caption">
            {mediaList[lightboxIdx].label || `Look 0${lightboxIdx + 1}`} — {lightboxIdx + 1} of {mediaList.length}
          </div>
        </div>
      )}
    </div>
  );
}
