import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  referenceProductId: z.string().optional(),
  fabricPreference: z.string(),
  timeline: z.string(),
  measurements: z.object({
    chestOrBust: z.number(),
    waist: z.number(),
    hip: z.number(),
    height: z.number(),
  }),
  note: z.string().optional(),
  userId: z.string().optional(),
});

// POST /api/bespoke — PDP "Request Bespoke" modal + home Bespoke teaser submit
export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());
  const { measurements, ...rest } = body;
  const request = await db.bespokeRequest.create({
    data: {
      ...rest,
      measurements: JSON.stringify(measurements),
    },
  });
  // TODO: notify the atelier; once quoted, send the customer a 50% deposit
  // payment link per the Payment Terms policy.
  return NextResponse.json({ request });
}
