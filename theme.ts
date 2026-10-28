import { DS_DEFAULT_FONT, DS_FONTS, dsFont, type DsFontId } from "./fonts";

/**
 * A Parabola theme: the choices that change how everything looks, stored as
 * data so a site, an agent or the /parabola Theme page can set them
 * (decisions, 2026-10-28; BEL-109). It starts with fonts: one for text and
 * one for headings (Display, H1–H3), so a pairing is two picks. Colours,
 * corners and the rest join it later; an older theme without them keeps
 * Parabola's defaults.
 */
export type DsThemeConfig = {
  fonts: { text: DsFontId; headings: DsFontId };
};

export const DS_DEFAULT_THEME: DsThemeConfig = {
  fonts: { text: DS_DEFAULT_FONT, headings: DS_DEFAULT_FONT },
};

const fontId = (value: unknown): DsFontId =>
  DS_FONTS.some((f) => f.id === value) ? (value as DsFontId) : DS_DEFAULT_FONT;

/** A stored theme, cleaned: anything missing or unknown reads as the default. */
export function parseDsThemeConfig(value: unknown): DsThemeConfig {
  const fonts = (value && typeof value === "object" ? (value as { fonts?: unknown }).fonts : undefined) as
    | { text?: unknown; headings?: unknown }
    | undefined;
  return { fonts: { text: fontId(fonts?.text), headings: fontId(fonts?.headings) } };
}

/** The CSS custom properties a theme sets on the page. */
export function dsThemeVars(theme: DsThemeConfig): Record<string, string> {
  const headings = dsFont(theme.fonts.headings);
  return {
    "--ds-font": dsFont(theme.fonts.text).family,
    "--ds-font-heading": headings.family,
    "--ds-heading-weight": String(headings.headingWeight),
  };
}

/**
 * Shows a theme on this page right away, before it's saved or reloaded: sets
 * its tokens on <html>, over the ones the page was served with. Browser only.
 */
export function dsApplyTheme(theme: DsThemeConfig): void {
  if (typeof document === "undefined") return;
  for (const [name, value] of Object.entries(dsThemeVars(theme))) {
    document.documentElement.style.setProperty(name, value);
  }
}

/** The theme as one CSS rule on :root, to put in the page's <head>. */
export function dsThemeCss(theme: DsThemeConfig): string {
  const decls = Object.entries(dsThemeVars(theme))
    .map(([name, value]) => `${name}: ${value};`)
    .join(" ");
  return `:root { ${decls} }`;
}
