"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { useStore } from "@/lib/StoreContext";
import type { NavCategory } from "@/lib/category-utils";
import { resolveNavMenu, visibleDepartments, isHrefActive } from "@/lib/mega-menu";

/* --------------------------------------------------------------------------
   ENTERPRISE MINIMALIST SVG ICON SUITE
   -------------------------------------------------------------------------- */
function SearchIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <circle cx="11" cy="11" r="7.5" />
      <line x1="21" y1="21" x2="16.5" y2="16.5" />
    </svg>
  );
}

function UserIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M19 21v-1.5a4.5 4.5 0 0 0-4.5-4.5h-5A4.5 4.5 0 0 0 5 19.5V21" />
      <circle cx="12" cy="7.5" r="4" />
    </svg>
  );
}

function BagIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M6 3h12l2 6v11a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V9l2-6z" />
      <line x1="3" y1="9" x2="21" y2="9" />
      <path d="M16 13a4 4 0 0 1-8 0" />
    </svg>
  );
}

function SparkleIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="13"
      height="13"
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden="true"
    >
      <path d="M12 0C12.4 6.6 17.4 11.6 24 12C17.4 12.4 12.4 17.4 12 24C11.6 17.4 6.6 12.4 0 12C6.6 11.6 11.6 6.6 12 0Z" />
    </svg>
  );
}

function ChevronDownIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="9"
      height="9"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <polyline points="6 9 12 15 18 9" />
    </svg>
  );
}

function CloseIcon({ className = "" }: { className?: string }) {
  return (
    <svg
      className={className}
      width="14"
      height="14"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <line x1="18" y1="6" x2="6" y2="18" />
      <line x1="6" y1="6" x2="18" y2="18" />
    </svg>
  );
}

interface HeaderProps {
  categories?: NavCategory[];
  /** Raw stored nav config — resolved (and defaulted) here. */
  megaMenuConfig?: unknown;
}

export default function Header({ megaMenuConfig }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { cart, toggleChat } = useStore();

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [activeMegaMenu, setActiveMegaMenu] = useState<string | null>(null);
  const [openSection, setOpenSection] = useState<string | null>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement | null>(null);
  const hoverTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const headerRef = useRef<HTMLElement | null>(null);

  const cartCount = cart?.items.reduce((sum, item) => sum + item.quantity, 0) || 0;

  // Admin-managed navigation (Admin → Mega Menu); falls back to the default menu.
  const departments = React.useMemo(
    () => visibleDepartments(resolveNavMenu(megaMenuConfig)),
    [megaMenuConfig]
  );

  // Hover handlers with smooth intentional buffer
  const handleMenuEnter = (menuId: string) => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
      hoverTimeoutRef.current = null;
    }
    setActiveMegaMenu(menuId);
  };

  const handleMenuLeave = () => {
    if (hoverTimeoutRef.current) {
      clearTimeout(hoverTimeoutRef.current);
    }
    hoverTimeoutRef.current = setTimeout(() => {
      setActiveMegaMenu(null);
    }, 220);
  };

  // Handle Search Submission
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    router.push(`/products?search=${encodeURIComponent(searchQuery.trim())}`);
    setSearchOpen(false);
  };

  // Focus input when search bar opens
  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => {
        searchInputRef.current?.focus();
      }, 60);
    }
  }, [searchOpen]);

  // Close the drawer & dropdowns whenever navigation happens
  useEffect(() => {
    setDrawerOpen(false);
    setActiveMegaMenu(null);
    setSearchOpen(false);
  }, [pathname, searchParams]);

  // Lock the page behind the open drawer
  useEffect(() => {
    document.body.classList.toggle("vn-scroll-locked", drawerOpen);
    return () => document.body.classList.remove("vn-scroll-locked");
  }, [drawerOpen]);

  // Escape closes whichever layer is open
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      setDrawerOpen(false);
      setActiveMegaMenu(null);
      setSearchOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Click outside header closes mega menu
  useEffect(() => {
    if (!activeMegaMenu) return;
    const onClick = (e: MouseEvent) => {
      if (headerRef.current && !headerRef.current.contains(e.target as Node)) {
        setActiveMegaMenu(null);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, [activeMegaMenu]);

  return (
    <>
      {/* ANNOUNCEMENT BAR */}
      <div className="vn-announce">
        <span className="vn-announce__full">
          Complimentary Lagos delivery on orders over ₦150,000 &nbsp;·&nbsp; Bespoke atelier now booking for December
        </span>
        <span className="vn-announce__short">
          Free Lagos delivery over ₦150,000
        </span>
      </div>

      {/* ENTERPRISE NAVIGATION HEADER WITH MEGA MENU */}
      <header
        className="vn-header"
        data-search-open={searchOpen}
        data-mega-open={!!activeMegaMenu}
        ref={headerRef}
      >
        <div className="container-max vn-header__inner">
          {/* ZONE 1: BRAND LOGO */}
          <div className="vn-header__zone vn-header__zone--left">
            {/* Mobile menu trigger */}
            <button
              type="button"
              className="vn-burger"
              data-open={drawerOpen}
              aria-label={drawerOpen ? "Close menu" : "Open menu"}
              aria-expanded={drawerOpen}
              onClick={() => setDrawerOpen((v) => !v)}
            >
              <span />
              <span />
              <span />
            </button>

            <Link href="/" className="vn-logo" aria-label="Veena — home">
              <img src="/images/logo.png" alt="Veena" width={53} height={52} />
            </Link>
          </div>

          {/* ZONE 2: CENTER MEGA MENU NAVIGATION */}
          <nav className="vn-header__zone vn-header__zone--center vn-nav">
            <div className="vn-nav__links">
              {departments.map((dept) => {
                if (dept.type === "link") {
                  return (
                    <div key={dept.id} className="vn-navitem">
                      <Link
                        href={dept.href}
                        className="vn-navlink"
                        data-active={isHrefActive(dept.href, pathname, searchParams)}
                      >
                        {dept.name}
                      </Link>
                    </div>
                  );
                }

                const isOpen = activeMegaMenu === dept.id;
                return (
                  <div
                    key={dept.id}
                    className="vn-navitem vn-navitem--mega"
                    onMouseEnter={() => handleMenuEnter(dept.id)}
                    onMouseLeave={handleMenuLeave}
                  >
                    <Link
                      href={dept.href}
                      className="vn-navlink"
                      data-active={isOpen}
                      aria-expanded={isOpen}
                      onClick={() => setActiveMegaMenu(null)}
                    >
                      <span>{dept.name}</span>
                      <span className="vn-navlink__caret">
                        <ChevronDownIcon />
                      </span>
                    </Link>
                  </div>
                );
              })}
            </div>
          </nav>

          {/* ZONE 3: ENTERPRISE MODERN ICONOGRAPHY & UTILITIES */}
          <div className="vn-header__zone vn-header__zone--right vn-actions">
            {/* Ask Veena Concierge Pill */}
            <button
              type="button"
              className="vn-concierge-pill"
              onClick={toggleChat}
              title="Ask Veena Concierge"
              aria-label="Open Ask Veena Concierge"
            >
              <span className="vn-concierge-pill__sparkle">
                <SparkleIcon />
              </span>
              <span className="vn-concierge-pill__label">Ask Veena</span>
            </button>

            {/* Modern Search Icon Button */}
            <button
              type="button"
              className={`vn-icon-btn ${searchOpen ? "vn-icon-btn--active" : ""}`}
              onClick={() => setSearchOpen((prev) => !prev)}
              title="Search collections"
              aria-label="Search collections"
            >
              <SearchIcon />
            </button>

            {/* Modern Account Icon Button */}
            <Link
              href="/admin"
              className="vn-icon-btn"
              title="Client & Atelier Portal"
              aria-label="Account Profile"
            >
              <UserIcon />
            </Link>

            {/* Modern Architectural Bag with Micro-Badge */}
            <Link
              href="/checkout"
              className="vn-icon-btn vn-bag-btn"
              title={`Shopping Bag (${cartCount} ${cartCount === 1 ? "item" : "items"})`}
              aria-label={`Shopping Bag (${cartCount} items)`}
            >
              <BagIcon />
              <span className="vn-bag-badge" data-count={cartCount}>
                {cartCount}
              </span>
            </Link>
          </div>
        </div>

        {/* MEGA MENU FLYOUT PANELS (70/30 EDITORIAL ARCHITECTURE) */}
        {activeMegaMenu && (
          <div
            className="vn-mega-panel animate-fade-down"
            onMouseEnter={() => handleMenuEnter(activeMegaMenu)}
            onMouseLeave={handleMenuLeave}
          >
            <div className="container-max vn-mega-panel__inner">
              {(() => {
                const dept = departments.find((d) => d.id === activeMegaMenu && d.type === "mega");
                if (!dept) return null;
                const showEditorial = dept.editorial.visible !== false && !!dept.editorial.title;

                return (
                  <div className="vn-mega-grid" data-editorial={showEditorial}>
                    {/* Left & Center: Structured Subcategory Columns */}
                    <div className="vn-mega-columns">
                      <div className="vn-mega-overview-row">
                        <Link
                          href={dept.href}
                          className="vn-mega-overview-link"
                          onClick={() => setActiveMegaMenu(null)}
                        >
                          <span>{dept.overviewLabel || `All ${dept.name}`}</span>
                          <span className="vn-mega-overview-arrow">→</span>
                        </Link>
                      </div>

                      <div
                        className="vn-mega-cols-wrap"
                        style={{ gridTemplateColumns: `repeat(${Math.max(1, Math.min(dept.columns.length, showEditorial ? 3 : 4))}, 1fr)` }}
                      >
                        {dept.columns.map((col, idx) => (
                          <div key={idx} className="vn-mega-col">
                            <div className="vn-mega-col__title">{col.title}</div>
                            <ul className="vn-mega-col__list">
                              {col.items.map((item, itemIdx) => (
                                <li key={itemIdx} className="vn-mega-col__item">
                                  <Link
                                    href={item.href}
                                    className={`vn-mega-link ${item.badge ? "vn-mega-link--highlight" : ""}`}
                                    onClick={() => setActiveMegaMenu(null)}
                                  >
                                    <span>{item.name}</span>
                                    {item.badge && (
                                      <span className="vn-mega-badge">{item.badge}</span>
                                    )}
                                  </Link>
                                </li>
                              ))}
                            </ul>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Right: Editorial Campaign Spotlight Card */}
                    {showEditorial && (
                    <div className="vn-mega-editorial">
                      <Link
                        href={dept.editorial.href}
                        className="vn-mega-card"
                        onClick={() => setActiveMegaMenu(null)}
                      >
                        <div className="vn-mega-card__media">
                          {dept.editorial.image && (
                          <img
                            src={dept.editorial.image}
                            alt={dept.editorial.title}
                            loading="lazy"
                          />
                          )}
                          <div className="vn-mega-card__scrim" />
                        </div>
                        <div className="vn-mega-card__content">
                          <span className="vn-mega-card__eyebrow">
                            {dept.editorial.eyebrow}
                          </span>
                          <h4 className="vn-mega-card__title">
                            {dept.editorial.title}
                          </h4>
                          {dept.editorial.cta && (
                            <span className="vn-mega-card__cta">
                              <span>{dept.editorial.cta}</span>
                              <span className="vn-mega-card__arrow">→</span>
                            </span>
                          )}
                        </div>
                      </Link>
                    </div>
                    )}
                  </div>
                );
              })()}
            </div>
          </div>
        )}

        {/* EXPANDABLE ENTERPRISE SEARCH DRAWER */}
        {searchOpen && (
          <div className="vn-search-drawer">
            <div className="container-max vn-search-drawer__inner">
              <form onSubmit={handleSearchSubmit} className="vn-search-drawer__form">
                <SearchIcon className="vn-search-drawer__icon" />
                <input
                  ref={searchInputRef}
                  type="search"
                  className="vn-search-drawer__input"
                  placeholder="Search silhouettes, bubu, bespoke fabrics, lifestyle..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  autoComplete="off"
                />
                {searchQuery && (
                  <button
                    type="button"
                    className="vn-search-drawer__clear"
                    onClick={() => setSearchQuery("")}
                    aria-label="Clear search text"
                  >
                    <CloseIcon />
                  </button>
                )}
              </form>
              <button
                type="button"
                className="vn-search-drawer__close"
                onClick={() => setSearchOpen(false)}
                aria-label="Close search"
              >
                <CloseIcon />
              </button>
            </div>
          </div>
        )}
      </header>

      {/* MEGA MENU FOCUS SCRIM */}
      {activeMegaMenu && (
        <div
          className="vn-mega-scrim"
          aria-hidden="true"
          onClick={() => setActiveMegaMenu(null)}
        />
      )}

      {/* MOBILE DRAWER (DRILL-DOWN ACCORDION) */}
      <div
        className="vn-drawer-scrim"
        data-open={drawerOpen}
        onClick={() => setDrawerOpen(false)}
        aria-hidden="true"
      />
      <aside className="vn-drawer" data-open={drawerOpen} aria-hidden={!drawerOpen}>
        <div className="vn-drawer__head">
          <Link href="/" className="vn-logo" aria-label="Veena — home" onClick={() => setDrawerOpen(false)}>
            <img src="/images/logo.png" alt="Veena" width={45} height={44} style={{ height: "44px" }} />
          </Link>
          <button
            type="button"
            className="vn-drawer__close"
            aria-label="Close menu"
            onClick={() => setDrawerOpen(false)}
          >
            <CloseIcon />
          </button>
        </div>

        <div className="vn-drawer__body">
          {departments.map((dept) => {
            if (dept.type === "link") {
              return (
                <div key={dept.id} className="vn-drawer__section">
                  <Link
                    href={dept.href}
                    className="vn-drawer__row"
                    onClick={() => setDrawerOpen(false)}
                  >
                    {dept.name}
                  </Link>
                </div>
              );
            }

            const isOpen = openSection === dept.id;
            const allItems = dept.columns.flatMap((c) => c.items);
            return (
              <div key={dept.id} className="vn-drawer__section" data-open={isOpen}>
                <button
                  type="button"
                  className="vn-drawer__row"
                  aria-expanded={isOpen}
                  onClick={() => setOpenSection((v) => (v === dept.id ? null : dept.id))}
                >
                  <span>{dept.name}</span>
                  <span className="vn-drawer__chev">
                    <ChevronDownIcon />
                  </span>
                </button>
                <div className="vn-drawer__children">
                  <div>
                    <Link
                      href={dept.href}
                      className="vn-drawer__row vn-drawer__row--sub vn-drawer__row--overview"
                      onClick={() => setDrawerOpen(false)}
                    >
                      <span>{dept.overviewLabel || `All ${dept.name}`}</span>
                      <span>→</span>
                    </Link>
                    {allItems.map((item, itemIdx) => (
                      <Link
                        key={itemIdx}
                        href={item.href}
                        className="vn-drawer__row vn-drawer__row--sub"
                        onClick={() => setDrawerOpen(false)}
                      >
                        <span>{item.name}</span>
                        {item.badge && (
                          <span className="vn-drawer__badge">{item.badge}</span>
                        )}
                      </Link>
                    ))}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* ENTERPRISE MOBILE DRAWER UTILITIES */}
        <div className="vn-drawer__foot">
          <button
            type="button"
            className="vn-drawer__foot-btn vn-drawer__foot-btn--concierge"
            onClick={() => {
              setDrawerOpen(false);
              toggleChat();
            }}
          >
            <SparkleIcon />
            <span>Ask Veena Concierge</span>
          </button>
          <button
            type="button"
            className="vn-drawer__foot-btn"
            onClick={() => {
              setDrawerOpen(false);
              setSearchOpen(true);
            }}
          >
            <SearchIcon />
            <span>Search</span>
          </button>
          <Link
            href="/admin"
            className="vn-drawer__foot-btn"
            onClick={() => setDrawerOpen(false)}
          >
            <UserIcon />
            <span>Account</span>
          </Link>
          <Link
            href="/checkout"
            className="vn-drawer__foot-btn vn-drawer__foot-btn--bag"
            onClick={() => setDrawerOpen(false)}
          >
            <BagIcon />
            <span>Bag ({cartCount})</span>
          </Link>
        </div>
      </aside>
    </>
  );
}
