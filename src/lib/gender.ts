// Gender is a URL concept, not just client state. The preference is mirrored
// into a cookie (not localStorage) so the server can read it during render —
// that is what keeps the first paint from showing the wrong segment.

export type Gender = "WOMEN" | "MEN";

export const GENDER_COOKIE = "veena_gender";
export const DEFAULT_GENDER: Gender = "WOMEN";

/** Normalises anything (cookie value, query string, route segment) to a Gender. */
export function resolveGender(value: string | null | undefined): Gender {
  const upper = value?.toUpperCase();
  return upper === "MEN" ? "MEN" : "WOMEN";
}

/** True only for a value that genuinely names a segment. */
export function isGender(value: string | null | undefined): value is Gender {
  const upper = value?.toUpperCase();
  return upper === "WOMEN" || upper === "MEN";
}

/** The storefront home route for a segment. */
export function genderHome(gender: Gender) {
  return gender === "MEN" ? "/men" : "/women";
}

export function genderLabel(gender: Gender) {
  return gender === "MEN" ? "Men" : "Women";
}

/**
 * Writes the preference client-side. A year-long, lax cookie: it is a display
 * preference, so it needs to survive a return visit but never leaves the site.
 */
export function persistGender(gender: Gender) {
  if (typeof document === "undefined") return;
  document.cookie = `${GENDER_COOKIE}=${gender}; path=/; max-age=31536000; samesite=lax`;
}
