import type { Metadata } from "next";
import "./globals.css";
import { StoreProvider } from "@/lib/StoreContext";
import StorefrontShell from "@/components/StorefrontShell";
import { getNavCategories } from "@/lib/categories";
import { getMegaMenuConfig, getFooterConfig } from "@/lib/home-data";
import { cookies, headers } from "next/headers";
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
  const headersList = headers();
  const currentPath = headersList.get("x-pathname") || "";
  const isAdmin = currentPath.startsWith("/admin");

  // If serving an admin route, completely bypass StorefrontShell, Footer, and customer chrome
  if (isAdmin) {
    return (
      <html lang="en">
        <body>
          {children}
        </body>
      </html>
    );
  }

  // Navbar and footer are driven by Category table, dynamic mega menu config, and footer config
  const [categories, megaMenuConfig, footerConfig] = await Promise.all([
    getNavCategories(),
    getMegaMenuConfig(),
    getFooterConfig(),
  ]);

  // Seeding the provider from the cookie means the server renders the same
  // segment the visitor last chose, so the navbar does not rewrite on hydration.
  const initialGender = resolveGender(cookies().get(GENDER_COOKIE)?.value);

  return (
    <html lang="en">
      <body>
        <StoreProvider initialGender={initialGender}>
          <StorefrontShell
            categories={categories}
            megaMenuConfig={megaMenuConfig}
            footerConfig={footerConfig}
          >
            {children}
          </StorefrontShell>
        </StoreProvider>
      </body>
    </html>
  );
}
