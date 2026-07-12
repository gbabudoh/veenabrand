import type { Metadata } from "next";
import { Suspense } from "react";
import "./globals.css";
import { StoreProvider } from "@/lib/StoreContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import CookieBanner from "@/components/CookieBanner";
import AskVeenaChat from "@/components/AskVeenaChat";
import Modals from "@/components/Modals";

export const metadata: Metadata = {
  title: "Veena — Ready-to-wear & Bespoke Fashion",
  description: "Women's and men's fashion, ready-to-wear and made-to-measure, from our Lagos atelier.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <StoreProvider>
          <div style={{ minHeight: "100vh", display: "flex", flexDirection: "column", position: "relative" }}>
            <Suspense fallback={<div style={{ height: "60px", background: "rgba(246, 242, 234, 0.92)" }}></div>}>
              <Header />
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
