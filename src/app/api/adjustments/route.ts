import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  productId: z.string(),
  adjustmentType: z.string(), // "Hem length" | "Sleeve length" | "Waist take-in" | "Shoulder fit" | "Other"
  note: z.string(),
  userId: z.string().optional(),
  orderItemId: z.string().optional(),
});

// POST /api/adjustments — PDP "Request Adjustment" modal submit
export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());
  const request = await db.adjustmentRequest.create({ data: body });
  // TODO: notify the atelier (email/Slack) so they can quote within 48 hours,
  // per the copy in the confirmation state of the modal.
  return NextResponse.json({ request });
}
