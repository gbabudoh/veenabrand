import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { StoreProvider } from "@/lib/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import AskVeenaChat from "@/components/AskVeenaChat";
import Modals from "@/components/Modals";
import { getNavCategories } from "@/lib/categories";
import { getMegaMenuConfig } from "@/lib/home-data";
import { cookies } from "next/headers";
import { GENDER_COOKIE, resolveGender } from "@/lib/gender";

export const metadata: Metadata = {
  title: "Veena — Ready-to-wear & Bespoke Fashion",
  description: "Women's and men's fashion, ready-to-wear and made-to-measure, from our Lagos atelier.",
  icons: {
    icon: [{ url: "/images/favicon.png", type: "image/png", sizes: "96x96" }],
    shortcut: "/images/favicon.png",
    apple: "/images/favicon.png",
  },
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  // The navbar is driven by the Category table and dynamic mega menu config
  const [categories, megaMenuConfig] = await Promise.all([
    getNavCategories(),
    getMegaMenuConfig(),
  ]);

  // Seeding the provider from the cookie means the server renders the same
  // segment the visitor last chose, so the navbar does not rewrite on hydration.
  const initialGender = resolveGender(cookies().get(GENDER_COOKIE)?.value);

  return (
    <html lang="en">
      <body>
        <StoreProvider initialGender={initialGender}>
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
            <Suspense fallback={<div style={{ height: "109px", background: "rgba(246, 242, 234, 0.92)" }}></div>}>
              <Header categories={categories} megaMenuConfig={megaMenuConfig} />
            </Suspense>
            <main style={{ flex: 1 }}>
              {children}
            </main>
            <Footer />
            <CookieBanner />
            <AskVeenaChat />
            <Modals />
          </div>
        </StoreProvider>
      </body>
    </html>
  );
}
