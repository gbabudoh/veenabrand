import React from "react";
import { redirect } from "next/navigation";
import { getAdminSession } from "@/lib/auth";
import Link from "next/link";
import LogoutButton from "@/app/admin/(dashboard)/LogoutButton";

export default function AdminDashboardLayout({ children }: { children: React.ReactNode }) {
  const session = getAdminSession();

  // Protect layout on server-side
  if (!session) {
    redirect("/admin/login");
  }

  const navLinks = [
    { href: "/admin", label: "Dashboard", icon: "📊" },
    { href: "/admin/orders", label: "Orders", icon: "📦" },
    { href: "/admin/products", label: "Products", icon: "👗" },
    { href: "/admin/categories", label: "Categories", icon: "🗂️" },
    { href: "/admin/homepage", label: "Homepage Banners", icon: "🖼️" },
    { href: "/admin/discounts", label: "Promo Codes", icon: "🎟️" },
    { href: "/admin/users", label: "Users & Staff", icon: "👥" },
    { href: "/admin/settings", label: "SEO & Socials", icon: "⚙️" },
  ];

  return (
    <div style={{
      display: "grid",
      gridTemplateColumns: "240px 1fr",
      minHeight: "100vh",
      background: "#0F0E0B",
      color: "#F6F2EA",
      fontFamily: "var(--font-sans)",
    }}>
      {/* Sidebar Navigation */}
      <aside style={{
        background: "#15130F",
        borderRight: "1px solid rgba(246, 242, 234, 0.08)",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "32px 20px",
        height: "100vh",
        position: "sticky",
        top: 0,
      }}>
        <div>
          {/* Logo Brand */}
          <div style={{ paddingLeft: "10px", marginBottom: "36px" }}>
            <img
              src="/images/logo.png"
              alt="Veena"
              width={57}
              height={56}
              style={{ height: "56px", width: "auto", display: "block" }}
            />
            <div style={{ fontSize: "9.5px", color: "var(--color-emerald)", textTransform: "uppercase", letterSpacing: "0.1em", fontWeight: 700, marginTop: "2px" }}>
              Admin Panel
            </div>
          </div>

          {/* Links list */}
          <nav style={{ display: "flex", flexDirection: "column", gap: "6px" }}>
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                style={{
                  display: "flex",
                  alignItems: "center",
                  gap: "12px",
                  fontSize: "13.5px",
                  padding: "11px 14px",
                  borderRadius: "3px",
                  color: "rgba(246, 242, 234, 0.8)",
                  textDecoration: "none",
                  fontWeight: 500,
                  transition: "all 0.2s ease",
                }}
                className="admin-nav-link"
              >
                <span>{link.icon}</span>
                <span>{link.label}</span>
              </Link>
            ))}
          </nav>
        </div>

        {/* User Card & Logout */}
        <div style={{
          borderTop: "1px solid rgba(246, 242, 234, 0.08)",
          paddingTop: "20px",
          display: "flex",
          flexDirection: "column",
          gap: "12px"
        }}>
          <div>
            <div style={{ fontSize: "13px", fontWeight: 600 }}>{session.username}</div>
            <div style={{ fontSize: "10px", color: "rgba(246, 242, 234, 0.45)", textTransform: "uppercase", marginTop: "2px", letterSpacing: "0.04em" }}>
              {session.role}
            </div>
          </div>
          
          <Link
            href="/"
            target="_blank"
            style={{ fontSize: "12px", color: "var(--color-emerald)", textDecoration: "underline" }}
          >
            Visit live store ↗
          </Link>

          <LogoutButton />
        </div>
      </aside>

      {/* Main Content Area */}
      <div style={{ display: "flex", flexDirection: "column", height: "100vh", overflowY: "auto" }}>
        {/* Top Header */}
        <header style={{
          height: "64px",
          background: "#15130F",
          borderBottom: "1px solid rgba(246, 242, 234, 0.08)",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "0 40px",
          flexShrink: 0,
        }}>
          <div style={{ fontSize: "13.5px", color: "rgba(246, 242, 234, 0.55)", fontWeight: 500 }}>
            Veena Fashion Atelier Management Console v1.0
          </div>
          <div style={{ fontSize: "13px", background: "rgba(31, 92, 66, 0.15)", color: "var(--color-emerald)", padding: "4px 10px", borderRadius: "999px", fontWeight: 600 }}>
            ● Session Active
          </div>
        </header>

        {/* Route content */}
        <main style={{ flex: 1, padding: "40px" }}>
          {children}
        </main>
      </div>
    </div>
  );
}
