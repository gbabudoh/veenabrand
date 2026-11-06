import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { db } from "@/lib/db";
import { isConsultRoomName } from "@/lib/livekit";
import ConsultJoin from "./ConsultJoin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Your Veena consultation",
  // Private links — keep them out of search engines.
  robots: { index: false, follow: false },
};

export default async function ConsultPage({ params }: { params: { room: string } }) {
  if (!isConsultRoomName(params.room)) notFound();
  const c = await db.consultation.findUnique({ where: { room: params.room } });
  if (!c) notFound();

  return (
    <ConsultJoin
      room={c.room}
      customerName={c.customerName}
      topic={c.topic}
      status={c.status}
      scheduledAt={c.scheduledAt ? c.scheduledAt.toISOString() : null}
    />
  );
}
