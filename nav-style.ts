/**
 * A site's nav, a theme's choice. Its style: the bar (`DsTopBar`), a band
 * across the top holding the name and the links, or floating (`DsFloatingBar`,
 * the default), buttons over the page with the name in the middle as a
 * button of its own and a soft fade behind. And, for the bar, what's behind
 * it: nothing, the nav fade (the page blurring away beneath it; the default),
 * or the page colour alone (no rule), which hides what scrolls past.
 */
export const DS_NAV_STYLES = [
  { id: "floating", label: "Floating" },
  { id: "bar", label: "Bar" },
] as const;

export const DS_NAV_SURFACES = [
  { id: "transparent", label: "None" },
  { id: "blur", label: "Blur" },
  { id: "solid", label: "Solid" },
] as const;

export type DsNavLook = (typeof DS_NAV_STYLES)[number]["id"];
export type DsNavSurface = (typeof DS_NAV_SURFACES)[number]["id"];

export type DsNavStyle = { style: DsNavLook; surface: DsNavSurface };

export const DS_DEFAULT_NAV_STYLE: DsNavStyle = { style: "floating", surface: "blur" };

/** A stored nav style, with anything missing or unknown at its default. */
export function parseDsNavStyle(value: unknown): DsNavStyle {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const style = DS_NAV_STYLES.find((s) => s.id === raw.style)?.id ?? DS_DEFAULT_NAV_STYLE.style;
  const surface = DS_NAV_SURFACES.find((s) => s.id === raw.surface)?.id ?? DS_DEFAULT_NAV_STYLE.surface;
  return { style, surface };
}
