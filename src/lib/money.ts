// Shared money + order-number helpers used across API routes.

/** Format an integer minor-unit amount (kobo) as a NGN display string, e.g. 14500000 -> "₦145,000" */
export function formatNaira(minor: number): string {
  return "₦" + Math.round(minor / 100).toLocaleString("en-NG");
}

export function generateOrderNumber(): string {
  const n = Math.floor(10000 + Math.random() * 89999);
  return `VN-${n}`;
}

// Delivery fees in kobo minor units. International carries a flat USD component —
// handle multi-currency totals explicitly in your payment integration.
export const DELIVERY_FEES_MINOR: Record<string, number> = {
  PICKUP: 0,
  NEXT_DAY_LAGOS: 350_000,
  TWO_THREE_DAY_NIGERIA: 500_000,
  OUT_OF_LAGOS: 750_000,
  INTERNATIONAL: 0, // + $45 flat handled separately, see README "Open Questions"
};

export const INTERNATIONAL_FLAT_USD = 45;
