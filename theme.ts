import { DS_DEFAULT_FONT, DS_DEFAULT_DISPLAY_FONT, DS_FONTS, dsCustomFont, type DsCustomFont, type DsFont } from "./fonts";

/**
 * A Parabola theme: the choices that change how everything looks, stored as
 * data so a site, an agent or /parabola can set them (decisions,
 * 2026-10-28; BEL-109). It starts with typography:
 *
 * - two font families, a primary and a display, each a font from
 *   Parabola's list (fonts.ts) or one added to the theme (`customFonts`);
 * - the type scale: for each text style, which family it's set in (primary
 *   unless it's moved to display), its size and its line height.
 *
 * Colours, corners and the rest join it later; an older theme without them
 * keeps Parabola's defaults.
 */

/** Parabola's text styles, largest first (the `text-*` utilities). */
export const DS_TEXT_STYLES = ["display", "h1", "h2", "h3", "p", "prose", "small"] as const;
export type DsTextStyle = (typeof DS_TEXT_STYLES)[number];

/** Each style's name and Parabola's default size and line height (px), as tokens.css sets them. */
export const DS_TEXT_STYLE_DEFAULTS: Record<DsTextStyle, { label: string; size: number; lineHeight: number; use: string }> = {
  display: { label: "Display", size: 60, lineHeight: 64, use: "Editorial headlines on large screens" },
  h1: { label: "H1", size: 36, lineHeight: 48, use: "Page and post titles" },
  h2: { label: "H2", size: 24, lineHeight: 30, use: "Sections" },
  h3: { label: "H3", size: 18, lineHeight: 26, use: "Small headings, the site's name" },
  p: { label: "P", size: 16, lineHeight: 22, use: "Interface text: buttons, fields, lists" },
  prose: { label: "Prose", size: 18, lineHeight: 28, use: "Paragraphs people read" },
  small: { label: "Small", size: 14, lineHeight: 18, use: "Meta and descriptions; the floor" },
};

export type DsFamilyRole = "primary" | "display";

export type DsTextStyleConfig = { family: DsFamilyRole; size: number; lineHeight: number };

export type DsThemeConfig = {
  fonts: { primary: string; display: string };
  type: Record<DsTextStyle, DsTextStyleConfig>;
  /** Fonts added to this theme (a Google font by name or link), beside Parabola's. */
  customFonts: DsCustomFont[];
};

export const DS_DEFAULT_THEME: DsThemeConfig = {
  fonts: { primary: DS_DEFAULT_FONT, display: DS_DEFAULT_DISPLAY_FONT },
  type: Object.fromEntries(
    DS_TEXT_STYLES.map((s) => [s, { family: "primary", size: DS_TEXT_STYLE_DEFAULTS[s].size, lineHeight: DS_TEXT_STYLE_DEFAULTS[s].lineHeight }])
  ) as Record<DsTextStyle, DsTextStyleConfig>,
  customFonts: [],
};

/** Every font this theme can use: Parabola's, then the ones it added. */
export function dsThemeFonts(theme: Pick<DsThemeConfig, "customFonts">): DsFont[] {
  return [...DS_FONTS, ...theme.customFonts.map(dsCustomFont)];
}

/** One of the theme's fonts by id, else Parabola's default. */
export function dsThemeFont(theme: Pick<DsThemeConfig, "customFonts">, id: string): DsFont {
  const fonts = dsThemeFonts(theme);
  return fonts.find((f) => f.id === id) ?? fonts.find((f) => f.id === DS_DEFAULT_FONT)!;
}

const HEADINGS: DsTextStyle[] = ["display", "h1", "h2", "h3"];

const px = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;

/**
 * A stored theme, cleaned: anything missing or unknown reads as the default.
 * Older shapes still read: `fonts: { text, headings }` (the first version)
 * as primary and display with headings in display, and `secondary` (before
 * it was called display) as display.
 */
export function parseDsThemeConfig(value: unknown): DsThemeConfig {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const customFonts = Array.isArray(raw.customFonts)
    ? (raw.customFonts as unknown[]).flatMap((f) => {
        const font = f as Partial<DsCustomFont>;
        return typeof font?.id === "string" && typeof font.label === "string" && typeof font.google === "string"
          ? [{ id: font.id, label: font.label, google: font.google }]
          : [];
      })
    : [];
  const known = (id: unknown, fallback: string) =>
    typeof id === "string" && dsThemeFonts({ customFonts }).some((f) => f.id === id) ? id : fallback;

  const fonts = (raw.fonts ?? {}) as Record<string, unknown>;
  const legacy = fonts.text !== undefined || fonts.headings !== undefined;
  const primary = known(legacy ? fonts.text : fonts.primary, DS_DEFAULT_FONT);
  const display = known(legacy ? fonts.headings : (fonts.display ?? fonts.secondary), DS_DEFAULT_DISPLAY_FONT);

  const typeRaw = (raw.type ?? {}) as Record<string, { family?: unknown; size?: unknown; lineHeight?: unknown } | undefined>;
  const type = Object.fromEntries(
    DS_TEXT_STYLES.map((s) => {
      const d = DS_TEXT_STYLE_DEFAULTS[s];
      const t = typeRaw[s];
      const family: DsFamilyRole =
        t?.family === "primary"
          ? "primary"
          : t?.family === "display" || t?.family === "secondary"
            ? "display"
            : legacy && HEADINGS.includes(s) && display !== primary
              ? "display"
              : "primary";
      return [s, { family, size: px(t?.size, d.size, 10, 200), lineHeight: px(t?.lineHeight, d.lineHeight, 10, 240) }];
    })
  ) as Record<DsTextStyle, DsTextStyleConfig>;

  return { fonts: { primary, display }, type, customFonts };
}

/** The CSS custom properties a theme sets on the page (tokens.css has the defaults). */
export function dsThemeVars(theme: DsThemeConfig): Record<string, string> {
  const family = (role: DsFamilyRole) => dsThemeFont(theme, theme.fonts[role]);
  const vars: Record<string, string> = {
    "--ds-family-primary": family("primary").family,
    "--ds-family-display": family("display").family,
  };
  for (const s of DS_TEXT_STYLES) {
    const t = theme.type[s];
    vars[`--ds-font-${s}`] = `var(--ds-family-${t.family})`;
    vars[`--ds-text-${s}`] = `${t.size}px`;
    vars[`--ds-text-${s}-leading`] = `${t.lineHeight}px`;
    vars[`--ds-weight-${s}`] = String(family(t.family).weight);
  }
  return vars;
}

/** The theme as one CSS rule on :root, to put in the page's <head>. */
export function dsThemeCss(theme: DsThemeConfig): string {
  const decls = Object.entries(dsThemeVars(theme))
    .map(([name, value]) => `${name}: ${value};`)
    .join(" ");
  return `:root { ${decls} }`;
}

/**
 * Shows a theme on this page right away, before it's saved or reloaded: sets
 * its tokens on <html>, over the ones the page was served with, and loads the
 * fonts the theme added (from Google) that the page hasn't loaded yet, so
 * they can be seen before they're picked; Parabola's own come with the page
 * (DsThemeStyle). Browser only.
 */
export function dsApplyTheme(theme: DsThemeConfig): void {
  if (typeof document === "undefined") return;
  for (const [name, value] of Object.entries(dsThemeVars(theme))) {
    document.documentElement.style.setProperty(name, value);
  }
  for (const font of theme.customFonts.map(dsCustomFont)) {
    if (document.querySelector(`link[data-ds-font="${font.id}"]`)) continue;
    const link = Object.assign(document.createElement("link"), {
      rel: "stylesheet",
      href: `https://fonts.googleapis.com/css2?family=${font.google}&display=swap`,
    });
    link.dataset.dsFont = font.id;
    document.head.appendChild(link);
  }
}
