/**
 * What's behind a bar pinned over the page (the site's nav, `DsTopBar`), a
 * theme's choice among three: nothing, the nav fade (the page blurring away
 * beneath it; the default), or the page colour alone (no rule), which hides
 * what scrolls past.
 */
export const DS_NAV_SURFACES = [
  { id: "transparent", label: "None" },
  { id: "blur", label: "Blur" },
  { id: "solid", label: "Solid" },
] as const;

export type DsNavSurface = (typeof DS_NAV_SURFACES)[number]["id"];

export type DsNavStyle = { surface: DsNavSurface };

export const DS_DEFAULT_NAV_STYLE: DsNavStyle = { surface: "blur" };

/** A stored nav style, with anything missing or unknown at its default. */
export function parseDsNavStyle(value: unknown): DsNavStyle {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const surface = DS_NAV_SURFACES.find((s) => s.id === raw.surface)?.id ?? DS_DEFAULT_NAV_STYLE.surface;
  return { surface };
}
