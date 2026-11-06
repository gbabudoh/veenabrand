import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import LiveWatch from "./LiveWatch";

export const dynamic = "force-dynamic";

async function getShow(slug: string) {
  return db.liveShow.findUnique({ where: { slug } });
}

export async function generateMetadata({ params }: { params: { slug: string } }): Promise<Metadata> {
  const show = await getShow(params.slug);
  if (!show) return { title: "Live — Veena" };
  return {
    title: `${show.status === "LIVE" ? "LIVE: " : ""}${show.title} — Veena`,
    description: show.description || "Watch Veena live.",
    openGraph: show.posterImage ? { images: [show.posterImage] } : undefined,
  };
}

export default async function LiveShowPage({ params }: { params: { slug: string } }) {
  const show = await getShow(params.slug);
  if (!show) notFound();

  return (
    <LiveWatch
      initial={{
        slug: show.slug,
        title: show.title,
        description: show.description,
        posterImage: show.posterImage,
        status: show.status,
        scheduledAt: show.scheduledAt ? show.scheduledAt.toISOString() : null,
      }}
    />
  );
}
