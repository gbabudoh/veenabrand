import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { getHomeData } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Women — Veena",
  description:
    "Women's ready-to-wear and made-to-measure, cut and finished in our Lagos atelier.",
};

export default async function WomenHomePage() {
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
