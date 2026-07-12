import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { z } from "zod";

const schema = z.object({
  productId: z.string(),
  method: z.enum(["photo", "measurements", "model"]),
  measurements: z
    .object({ height: z.number(), weight: z.number(), chestOrBust: z.number(), waist: z.number() })
    .optional(),
});

// POST /api/fitting — PDP "Try It On" modal submit.
// This stub returns a naive rule-based size prediction. Replace with a real
// fit-prediction service/model if you want this to be more than illustrative.
export async function POST(req: NextRequest) {
  const body = schema.parse(await req.json());

  let predictedSize = "M";
  if (body.measurements) {
    const { chestOrBust } = body.measurements;
    if (chestOrBust < 84) predictedSize = "XS";
    else if (chestOrBust < 90) predictedSize = "S";
    else if (chestOrBust < 98) predictedSize = "M";
    else if (chestOrBust < 106) predictedSize = "L";
    else predictedSize = "XL";
  }

  const request = await db.fittingRequest.create({
    data: {
      productId: body.productId,
      method: body.method,
      measurements: body.measurements ? JSON.stringify(body.measurements) : undefined,
      predictedSize,
    },
  });

  return NextResponse.json({ request, predictedSize });
}
