import { NextRequest, NextResponse } from "next/server";

// FAQ script mirrored from the prototype's Ask Veena chip replies. Swap this for a
// real LLM call (see the "Claude API in prototypes" pattern) if you want live,
// open-ended answers instead of a fixed script.
const SCRIPT: Record<string, string> = {
  "Track my order":
    "Sure — head to Account > Orders and you'll see live status. Orders placed before 2pm Lagos time ship same day.",
  "Sizing help":
    "Every product page has a Size Guide link next to the size selector, or use Try It On for a visual fit preview.",
  Returns:
    "You can return unworn ready-to-wear items within 14 days. Bespoke and made-to-measure pieces are final sale.",
  "Bespoke process":
    "Bespoke starts with a request form (measurements, fabric, timeline) from any product page — our atelier replies within 48 hours with a quote.",
  "Store locations": "Our flagship is on Victoria Island, Lagos. Pickup is available there for online orders.",
};

// POST /api/chat — Ask Veena panel. Body: { message: string }
export async function POST(req: NextRequest) {
  const { message } = await req.json();

  const scripted = SCRIPT[message as keyof typeof SCRIPT];
  if (scripted) return NextResponse.json({ reply: scripted });

  // TODO: replace with a real call to your LLM of choice, grounded in store FAQ/policy
  // content (About, Legal, Shipping) so answers stay accurate as policies change.
  return NextResponse.json({
    reply: "Thanks — one of our stylists will follow up, or try one of the quick topics for an instant answer.",
  });
}
