"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import LogoutButton from "./LogoutButton";

interface AdminSidebarProps {
  username: string;
  role: string;
}

const NAV_ITEMS = [
  {
    href: "/admin",
    label: "Dashboard",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <path d="M16 10a4 4 0 0 1-8 0" />
      </svg>
    ),
  },
  {
    href: "/admin/products",
    label: "Product Registry",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <path d="M22 19a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h5l2 3h9a2 2 0 0 1 2 2z" />
      </svg>
    ),
  },
  {
    href: "/admin/banners",
    label: "Hero Banners",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
        <circle cx="8.5" cy="8.5" r="1.5" />
        <polyline points="21 15 16 10 5 21" />
      </svg>
    ),
  },
  {
    href: "/admin/footer",
    label: "Footer Config",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <line x1="3" y1="12" x2="21" y2="12" />
        <line x1="3" y1="6" x2="21" y2="6" />
        <line x1="3" y1="18" x2="21" y2="18" />
      </svg>
    ),
  },
  {
    href: "/admin/discounts",
    label: "Promo Codes",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
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
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="3" />
        <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
      </svg>
    ),
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
      background: "#0F172A", // Rich obsidian slate for enterprise grounding
      borderRight: "1px solid #1E293B",
      display: "flex",
      flexDirection: "column",
      justifyContent: "space-between",
      height: "100vh",
      zIndex: 50,
      flexShrink: 0,
      overflow: "hidden",
    }}>
      {/* Top Brand & Scrollable Navigation Area */}
      <div className="admin-sidebar-scroll" style={{
        padding: "24px 20px",
        overflowY: "auto",
        flex: 1,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px", marginBottom: "28px" }}>
          <img
            src="/images/logo.png"
            alt="Veena"
            width={40}
            height={39}
            style={{ height: "38px", width: "auto", display: "block" }}
          />
          <div>
            <div style={{ fontFamily: "var(--font-admin)", fontSize: "15px", fontWeight: 800, color: "#F8FAFC", letterSpacing: "0.06em" }}>
              VEENA
            </div>
            <div style={{ fontSize: "10px", color: "#10B981", textTransform: "uppercase", letterSpacing: "0.08em", fontWeight: 700 }}>
              Enterprise Console
            </div>
          </div>
        </div>

        {/* Navigation links */}
        <nav style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
          {NAV_ITEMS.map((item) => {
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
                  gap: "11px",
                  fontSize: "13px",
                  padding: "9px 12px",
                  borderRadius: "6px",
                  textDecoration: "none",
                  fontWeight: isActive ? 600 : 500,
                  color: isActive ? "#FFFFFF" : "#94A3B8",
                  background: isActive ? "rgba(255, 255, 255, 0.08)" : "transparent",
                  borderLeft: isActive ? "3px solid #10B981" : "3px solid transparent",
                  transition: "all 0.15s ease",
                }}
              >
                <span style={{ color: isActive ? "#10B981" : "#64748B", display: "flex" }}>
                  {item.icon}
                </span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* User Footer Card (Pinned) */}
      <div style={{
        padding: "20px",
        borderTop: "1px solid #1E293B",
        background: "#0B1120",
        flexShrink: 0,
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "14px" }}>
          <div style={{
            width: "34px",
            height: "34px",
            borderRadius: "50%",
            background: "linear-gradient(135deg, #10B981 0%, #047857 100%)",
            color: "#FFFFFF",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontWeight: 700,
            fontSize: "12px",
            boxShadow: "0 2px 6px rgba(16, 185, 129, 0.3)",
          }}>
            {username.slice(0, 2).toUpperCase()}
          </div>
          <div style={{ overflow: "hidden" }}>
            <div style={{ fontSize: "13px", fontWeight: 600, color: "#F8FAFC", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
              {username}
            </div>
            <div style={{ fontSize: "10px", color: "#10B981", textTransform: "uppercase", letterSpacing: "0.05em", fontWeight: 600 }}>
              {role}
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <Link
            href="/"
            target="_blank"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "6px",
              background: "rgba(255, 255, 255, 0.05)",
              border: "1px solid rgba(255, 255, 255, 0.1)",
              borderRadius: "4px",
              color: "#CBD5E1",
              fontSize: "11.5px",
              padding: "7px 10px",
              textDecoration: "none",
              fontWeight: 500,
              transition: "background 0.15s ease",
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
