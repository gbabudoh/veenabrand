import type { Metadata } from "next";
import HomeClient from "@/components/HomeClient";
import { getHomeData } from "@/lib/home-data";

export const metadata: Metadata = {
  title: "Men — Veena",
  description:
    "Men's ready-to-wear and made-to-measure, cut and finished in our Lagos atelier.",
};

export default async function MenHomePage() {
  const { products, initialSlides, initialRunway, initialNewIn, initialBespoke } = await getHomeData();

  return (
    <HomeClient
      products={products}
      initialSlides={initialSlides}
      initialRunway={initialRunway}
      initialNewIn={initialNewIn}
      initialBespoke={initialBespoke}
      gender="MEN"
    />
  );
}
