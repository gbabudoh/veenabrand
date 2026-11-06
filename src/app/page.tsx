import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { getHomeData } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Veena",
  description:
    "Women's ready-to-wear and made-to-measure, cut and finished in our Lagos atelier.",
};

// "/" is the storefront home and serves the default (women's) segment.
export default async function RootPage() {
  const { products, initialSlides, initialRunway, initialNewIn, initialBespoke } = await getHomeData();

  return (
    <HomeClient
      products={products}
      initialSlides={initialSlides}
      initialRunway={initialRunway}
      initialNewIn={initialNewIn}
      initialBespoke={initialBespoke}
      gender="WOMEN"
    />
  );
}
