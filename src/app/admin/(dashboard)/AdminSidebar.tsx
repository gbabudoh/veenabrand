"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

interface AdminSidebarProps {
  username: string;
  role: string;
}

interface NavSection {
  title: string;
  items: {
    href: string;
    label: string;
    icon: React.ReactNode;
  }[];
}

const NAV_SECTIONS: NavSection[] = [
  {
    title: "Operations",
    items: [
      {
        href: "/admin",
        label: "Dashboard",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="9" rx="1" />
            <rect x="14" y="3" width="7" height="5" rx="1" />
            <rect x="14" y="12" width="7" height="9" rx="1" />
            <rect x="3" y="16" width="7" height="5" rx="1" />
          </svg>
        ),
      },
      {
        href: "/admin/orders",
        label: "Orders & Sales",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <path d="M16 10a4 4 0 0 1-8 0" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Atelier & Catalog",
    items: [
      {
        href: "/admin/products",
        label: "Product Registry",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="12 2 2 7 12 12 22 7 12 2" />
            <polyline points="2 17 12 22 22 17" />
            <polyline points="2 12 12 17 22 12" />
          </svg>
        ),
      },
      {
        href: "/admin/categories",
        label: "Categories",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
          </svg>
        ),
      },
      {
        href: "/admin/consultations",
        label: "Consultations",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <polygon points="23 7 16 12 23 17 23 7" />
            <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
          </svg>
        ),
      },
      {
        href: "/admin/live",
        label: "Live Shows",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="2" />
            <path d="M16.24 7.76a6 6 0 0 1 0 8.49" />
            <path d="M7.76 16.24a6 6 0 0 1 0-8.49" />
            <path d="M19.07 4.93a10 10 0 0 1 0 14.14" />
            <path d="M4.93 19.07a10 10 0 0 1 0-14.14" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "Storefront Design",
    items: [
      {
        href: "/admin/banners",
        label: "Hero Banners",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="2" y="4" width="20" height="12" rx="2" />
            <path d="M4 12l4-4 5 5 4-4 3 3" />
            <circle cx="7" cy="8" r="1" />
          </svg>
        ),
      },
      {
        href: "/admin/homepage",
        label: "Homepage & Nav",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
            <circle cx="8.5" cy="8.5" r="1.5" />
            <polyline points="21 15 16 10 5 21" />
          </svg>
        ),
      },
      {
        href: "/admin/mega-menu",
        label: "Mega Menu",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="18" height="5" rx="1" />
            <line x1="6" y1="12" x2="10" y2="12" />
            <line x1="6" y1="16" x2="10" y2="16" />
            <line x1="14" y1="12" x2="18" y2="12" />
            <line x1="14" y1="16" x2="18" y2="16" />
            <line x1="3" y1="20" x2="21" y2="20" />
          </svg>
        ),
      },
      {
        href: "/admin/footer",
        label: "Footer Config",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        ),
      },
    ],
  },
  {
    title: "System & Settings",
    items: [
      {
        href: "/admin/discounts",
        label: "Promo Codes",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <line x1="19" y1="5" x2="5" y2="19" />
            <circle cx="6.5" cy="6.5" r="2.5" />
            <circle cx="17.5" cy="17.5" r="2.5" />
          </svg>
        ),
      },
      {
        href: "/admin/users",
        label: "Users & Staff",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        ),
      },
      {
        href: "/admin/settings",
        label: "SEO & Socials",
        icon: (
          <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="3" />
            <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
          </svg>
        ),
      },
    ],
  },
];

export default function AdminSidebar({ username, role }: AdminSidebarProps) {
  const pathname = usePathname();

  return (
    <aside style={{
      position: "fixed",
      top: 0,
      left: 0,
      bottom: 0,
      width: "256px",
      background: "#FFFFFF", // Refined luxury white
      borderRight: "1px solid #E2E8F0",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100vh",
      zIndex: 50,
      flexShrink: 0,
      overflow: "hidden",
      boxShadow: "1px 0 3px rgba(15, 23, 42, 0.02)",
    }}>
      {/* Top Brand & Scrollable Navigation Area */}
      <div className="admin-sidebar-scroll" style={{
        padding: "22px 16px",
        overflowY: "auto",
        flex: 1,
      }}>
        {/* Brand Header */}
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "20px", paddingBottom: "16px", borderBottom: "1px solid #F1F5F9", paddingLeft: "4px" }}>
          <img
            src="/images/logo.png"
            alt="Veena"
            width={38}
            height={37}
            style={{ height: "36px", width: "auto", display: "block" }}
          />
          <div>
            <div style={{ fontFamily: "var(--font-admin)", fontSize: "14px", fontWeight: 800, color: "#0F172A", letterSpacing: "0.06em" }}>
              VEENA
            </div>
            <div style={{ fontSize: "10px", color: "#64748B", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 600 }}>
              Atelier Console
            </div>
          </div>
        </div>

        {/* Grouped Navigation */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          {NAV_SECTIONS.map((section, idx) => (
            <div key={section.title}>
              {/* Section Category Header */}
              <div style={{
                fontSize: "10.5px",
                textTransform: "uppercase",
                letterSpacing: "0.07em",
                fontWeight: 700,
                color: "#94A3B8",
                padding: "0 10px",
                marginBottom: "4px",
              }}>
                {section.title}
              </div>

              {/* Section Links */}
              <div style={{ display: "flex", flexDirection: "column", gap: "2px" }}>
                {section.items.map((item) => {
                  const isActive = item.href === "/admin"
                    ? pathname === "/admin"
                    : pathname.startsWith(item.href);

                  return (
                    <Link
                      key={item.href}
                      href={item.href}
                      style={{
                        display: "flex",
                        alignItems: "center",
                        gap: "10px",
                        fontSize: "12.5px",
                        padding: "8px 10px",
                        borderRadius: "6px",
                        textDecoration: "none",
                        fontWeight: isActive ? 600 : 500,
                        color: isActive ? "#FFFFFF" : "#475569",
                        background: isActive ? "#0F172A" : "transparent",
                        transition: "all 0.15s ease",
                      }}
                      onMouseEnter={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "#F8FAFC";
                          e.currentTarget.style.color = "#0F172A";
                        }
                      }}
                      onMouseLeave={(e) => {
                        if (!isActive) {
                          e.currentTarget.style.background = "transparent";
                          e.currentTarget.style.color = "#475569";
                        }
                      }}
                    >
                      <span style={{ color: isActive ? "#FFFFFF" : "#64748B", display: "flex" }}>
                        {item.icon}
                      </span>
                      <span>{item.label}</span>
                    </Link>
                  );
                })}
              </div>
            </div>
          ))}
        </nav>
      </div>

      {/* User Footer Card (Pinned at bottom) */}
      <div style={{
        padding: "16px",
        borderTop: "1px solid #E2E8F0",
        background: "#F8FAFC",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "12px" }}>
          <div style={{
            width: "32px",
            height: "32px",
            borderRadius: "50%",
            background: "#0F172A",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "11.5px",
            boxShadow: "0 1px 3px rgba(15, 23, 42, 0.2)",
          }}>
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "12.5px", fontWeight: 600, color: "#0F172A", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {username}
            </div>
            <div style={{ fontSize: "10px", color: "#059669", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
              {role}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              background: "#FFFFFF",
              border: "1px solid #CBD5E1",
              borderRadius: "6px",
              color: "#334155",
              fontSize: "11.5px",
              padding: "7px 10px",
              textDecoration: "none",
              fontWeight: 500,
              boxShadow: "0 1px 2px rgba(0,0,0,0.02)",
              transition: "all 0.15s ease",
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = "#94A3B8";
              e.currentTarget.style.color = "#0F172A";
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = "#CBD5E1";
              e.currentTarget.style.color = "#334155";
            }}
          >
            <span>Live Storefront</span>
            <span style={{ fontSize: "10px" }}>↗</span>
          </Link>

          <LogoutButton />
        </div>
      </div>
    </aside>
  );
}
