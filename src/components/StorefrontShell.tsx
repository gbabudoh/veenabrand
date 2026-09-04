"use client";

import React, { Suspense } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import AskVeenaChat from "@/components/AskVeenaChat";
import Modals from "@/components/Modals";

interface StorefrontShellProps {
  categories: any[];
  megaMenuConfig: any;
  footerConfig: any;
  children: React.ReactNode;
}

export default function StorefrontShell({
  categories,
  megaMenuConfig,
  footerConfig,
  children,
}: StorefrontShellProps) {
  const pathname = usePathname();
  const isAdminRoute =
    pathname?.startsWith("/admin") ||
    (typeof window !== "undefined" && window.location.pathname.startsWith("/admin"));

  // Admin routes are 100% standalone and independent:
  // No platform announcement bar, no storefront nav, no Ask Veena widget, no footer/modals
  if (isAdminRoute) {
    return <>{children}</>;
  }

  // Consumer storefront chrome
  return (
    <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
      <Suspense fallback={<div style={{ height: "109px", background: "rgba(246, 242, 234, 0.92)" }}></div>}>
        <Header categories={categories} megaMenuConfig={megaMenuConfig} />
      </Suspense>
      <main style={{ flex: 1 }}>
        {children}
      </main>
      <Footer initialConfig={footerConfig} />
      <CookieBanner />
      <AskVeenaChat />
      <Modals />
    </div>
  );
}
