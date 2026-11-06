// The storefront's primary navigation, as a single document the admin edits.
// Pure data + helpers (no database import) so the Header and the admin page
// can both use it. Stored under the "mega_menu_config" HomepageConfig key.

export const NAV_MENU_KEY = "mega_menu_config";

export interface NavMenuItem {
  name: string;
  href: string;
  /** Small pill shown beside the link, e.g. "Signature" or "New". Empty = none. */
  badge?: string;
  visible?: boolean;
}

export interface NavMenuColumn {
  title: string;
  items: NavMenuItem[];
}

export interface NavMenuEditorial {
  visible?: boolean;
  eyebrow: string;
  title: string;
  image: string;
  href: string;
  cta: string;
}

export interface NavMenuDepartment {
  /** Stable key — used for hover state and React keys, never shown. */
  id: string;
  name: string;
  href: string;
  /** "mega" opens a flyout panel; "link" is a plain top-level link. */
  type: "mega" | "link";
  visible?: boolean;
  overviewLabel: string;
  columns: NavMenuColumn[];
  editorial: NavMenuEditorial;
}

export interface NavMenu {
  version: 2;
  departments: NavMenuDepartment[];
}

export const DEFAULT_NAV_MENU: NavMenu = {
  version: 2,
  departments: [
    {
      id: "women",
      name: "Women",
      href: "/products?gender=WOMEN",
      type: "mega",
      visible: true,
      overviewLabel: "All Women's Collection",
      columns: [
        {
          title: "Separates & Tops",
          items: [
            { name: "Tops", href: "/products?gender=WOMEN&category=women-tops" },
            { name: "Shirts", href: "/products?gender=WOMEN&category=women-shirts" },
            { name: "Trousers", href: "/products?gender=WOMEN&category=women-trousers" },
            { name: "Shorts", href: "/products?gender=WOMEN&category=women-shorts" },
            { name: "Skirts", href: "/products?gender=WOMEN&category=women-skirts" },
          ],
        },
        {
          title: "Dresses & Atelier",
          items: [
            { name: "Dresses", href: "/products?gender=WOMEN&category=women-dresses" },
            { name: "Bubu", href: "/products?gender=WOMEN&category=women-bubu", badge: "Signature" },
            { name: "Two Piece Sets", href: "/products?gender=WOMEN&category=women-two-piece-sets" },
            { name: "Suits", href: "/products?gender=WOMEN&category=women-suits" },
            { name: "Scarves", href: "/products?gender=WOMEN&category=women-scarves" },
          ],
        },
      ],
      editorial: {
        visible: true,
        eyebrow: "Signature Atelier",
        title: "The Bubu Silhouette & Hand-Woven Silks",
        image: "/images/hero_women.png",
        href: "/products?gender=WOMEN&category=women-bubu",
        cta: "Explore Atelier Women",
      },
    },
    {
      id: "men",
      name: "Men",
      href: "/products?gender=MEN",
      type: "mega",
      visible: true,
      overviewLabel: "All Men's Collection",
      columns: [
        {
          title: "Tailoring & Sets",
          items: [
            { name: "Suits", href: "/products?gender=MEN&category=men-suits" },
            { name: "Two Piece Set", href: "/products?gender=MEN&category=men-two-piece-set" },
            { name: "Trousers", href: "/products?gender=MEN&category=men-trousers" },
          ],
        },
        {
          title: "Casuals & Tops",
          items: [
            { name: "Tops", href: "/products?gender=MEN&category=men-tops" },
            { name: "Shirts", href: "/products?gender=MEN&category=men-shirts" },
            { name: "Shorts", href: "/products?gender=MEN&category=men-shorts" },
          ],
        },
      ],
      editorial: {
        visible: true,
        eyebrow: "Atelier Tailoring",
        title: "Architectural Precision & Modern Cuts",
        image: "/images/hero_men.png",
        href: "/products?gender=MEN",
        cta: "Explore Atelier Men",
      },
    },
    {
      id: "accessories",
      name: "Accessories",
      href: "/products?category=accessories",
      type: "mega",
      visible: true,
      overviewLabel: "All Accessories",
      columns: [
        {
          title: "Adornments & Jewelry",
          items: [
            { name: "Earrings", href: "/products?category=earrings" },
            { name: "Necklaces", href: "/products?category=necklaces" },
          ],
        },
        {
          title: "Leather & Footwear",
          items: [
            { name: "Bags", href: "/products?category=bags" },
            { name: "Sleepers", href: "/products?category=sleepers" },
          ],
        },
      ],
      editorial: {
        visible: true,
        eyebrow: "Finishing Touches",
        title: "Handcrafted Adornments & Leather Goods",
        image: "/images/hero_runway.png",
        href: "/products?category=accessories",
        cta: "Discover Accessories",
      },
    },
    {
      id: "lifestyle",
      name: "Lifestyle",
      href: "/products?category=lifestyle",
      type: "mega",
      visible: true,
      overviewLabel: "All Home & Living",
      columns: [
        {
          title: "Bedding & Sanctuary",
          items: [
            { name: "Pillows", href: "/products?category=pillows" },
            { name: "Sheets", href: "/products?category=sheets" },
            { name: "Throws", href: "/products?category=throws" },
          ],
        },
        {
          title: "Living & Dining",
          items: [
            { name: "Candles", href: "/products?category=candles" },
            { name: "Flower Vase", href: "/products?category=flower-vase" },
            { name: "Tablemats", href: "/products?category=tablemats" },
            { name: "Chair Covers", href: "/products?category=chair-covers" },
            { name: "Home Accessories", href: "/products?category=home-accessories" },
          ],
        },
      ],
      editorial: {
        visible: true,
        eyebrow: "Living with Veena",
        title: "Artisanal Comfort for Inspired Living",
        image: "/images/atelier.png",
        href: "/products?category=lifestyle",
        cta: "Explore Lifestyle",
      },
    },
    {
      id: "bespoke",
      name: "Bespoke",
      href: "/products?department=bespoke",
      type: "link",
      visible: true,
      overviewLabel: "",
      columns: [],
      editorial: emptyEditorial(),
    },
    {
      id: "about",
      name: "About",
      href: "/about",
      type: "link",
      visible: false,
      overviewLabel: "",
      columns: [],
      editorial: emptyEditorial(),
    },
  ],
};

function emptyEditorial(): NavMenuEditorial {
  return { visible: false, eyebrow: "", title: "", image: "", href: "", cta: "" };
}

/** A blank department the admin can fill in. */
export function newDepartment(existingIds: string[]): NavMenuDepartment {
  let n = existingIds.length + 1;
  while (existingIds.includes(`dept-${n}`)) n++;
  return {
    id: `dept-${n}`,
    name: "New Department",
    href: "/products",
    type: "mega",
    visible: true,
    overviewLabel: "Shop All",
    columns: [{ title: "New Column", items: [{ name: "New Link", href: "/products" }] }],
    editorial: { ...emptyEditorial(), visible: false, eyebrow: "Featured", cta: "Discover" },
  };
}

// Before the menu was fully editable, the saved config was a map of per-dept
// overrides: { women: { overviewLabel, col1Title, col2Title, editorial } }.
interface LegacyDeptOverride {
  overviewLabel?: string;
  col1Title?: string;
  col2Title?: string;
  editorial?: Partial<NavMenuEditorial>;
}

function fromLegacy(legacy: Record<string, LegacyDeptOverride>): NavMenu {
  return {
    version: 2,
    departments: DEFAULT_NAV_MENU.departments.map((dept) => {
      const o = legacy[dept.id];
      if (!o || typeof o !== "object") return dept;
      return {
        ...dept,
        overviewLabel: o.overviewLabel || dept.overviewLabel,
        columns: dept.columns.map((col, idx) => ({
          ...col,
          title: (idx === 0 ? o.col1Title : idx === 1 ? o.col2Title : undefined) || col.title,
        })),
        editorial: { ...dept.editorial, ...(o.editorial || {}) },
      };
    }),
  };
}

/**
 * Turns whatever is stored (new document, legacy overrides, a JSON string, or
 * nothing) into a complete, well-formed menu. Never throws — a bad config
 * falls back to the default menu rather than breaking the header.
 */
export function resolveNavMenu(raw: unknown): NavMenu {
  let value = raw;
  if (typeof value === "string") {
    try {
      value = JSON.parse(value);
    } catch {
      return DEFAULT_NAV_MENU;
    }
  }
  if (!value || typeof value !== "object") return DEFAULT_NAV_MENU;

  const doc = value as Partial<NavMenu> & Record<string, unknown>;
  if (!Array.isArray(doc.departments)) {
    return fromLegacy(doc as Record<string, LegacyDeptOverride>);
  }

  return {
    version: 2,
    departments: doc.departments
      .filter((d): d is NavMenuDepartment => !!d && typeof d === "object")
      .map((d, i) => ({
        id: d.id || `dept-${i + 1}`,
        name: d.name || "",
        href: d.href || "/products",
        type: d.type === "link" ? "link" : "mega",
        visible: d.visible !== false,
        overviewLabel: d.overviewLabel || "",
        columns: (Array.isArray(d.columns) ? d.columns : []).map((c) => ({
          title: c?.title || "",
          items: (Array.isArray(c?.items) ? c.items : []).map((it) => ({
            name: it?.name || "",
            href: it?.href || "/products",
            badge: it?.badge || ((it as { highlight?: boolean })?.highlight ? "Signature" : ""),
            visible: it?.visible !== false,
          })),
        })),
        editorial: { ...emptyEditorial(), ...(d.editorial || {}) },
      })),
  };
}

/** What the storefront actually renders: hidden departments and links removed. */
export function visibleDepartments(menu: NavMenu): NavMenuDepartment[] {
  return menu.departments
    .filter((d) => d.visible !== false && d.name.trim())
    .map((d) => ({
      ...d,
      columns: d.columns
        .map((c) => ({ ...c, items: c.items.filter((it) => it.visible !== false && it.name.trim()) }))
        .filter((c) => c.items.length > 0),
    }));
}

/** True when the current URL matches a nav href (path and every query param it names). */
export function isHrefActive(href: string, pathname: string | null, search: URLSearchParams | null) {
  if (!pathname) return false;
  try {
    const url = new URL(href, "http://x");
    if (url.pathname !== pathname) return false;
    for (const [k, v] of url.searchParams) {
      if (search?.get(k) !== v) return false;
    }
    return true;
  } catch {
    return false;
  }
}
