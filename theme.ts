import {
  DS_DEFAULT_FONT,
  DS_DEFAULT_SECONDARY_FONT,
  DS_FONTS,
  dsCustomFont,
  dsNearestWeight,
  type DsCustomFont,
  type DsFont,
} from "./fonts";

/**
 * A Parabola theme: the choices that change how everything looks, stored as
 * data so a site, an agent or /parabola can set them (decisions,
 * 2026-10-28; BEL-109). It starts with typography:
 *
 * - font families: Primary (text) and Secondary (headlines) to start, and as
 *   many more as a theme adds, each a name and a font, the font one of
 *   Parabola's (fonts.ts) or one added to the theme (`customFonts`);
 * - the type scale: for each text style, its name, which family it's set
 *   in (Display to H2 in Secondary, the rest in Primary, by default), its weight,
 *   size and line height.
 *
 * Colours, corners and the rest join it later; an older theme without them
 * keeps Parabola's defaults.
 */

/** Parabola's text styles, largest first (the `text-*` utilities). */
export const DS_TEXT_STYLES = ["display", "h1", "h2", "h3", "p", "prose", "small"] as const;
export type DsTextStyle = (typeof DS_TEXT_STYLES)[number];

/** A font family: what the theme calls it, and its font. `id` names its CSS variable, `--ds-family-<id>`. */
export type DsFontFamily = { id: string; label: string; font: string };

/** The family every theme has: text, and the fallback for a style whose family is gone. */
export const DS_PRIMARY_FAMILY = "primary";

/**
 * Each style's default name, family, weight, size and line height (px), as
 * tokens.css sets them (`npm run check:parabola` checks): Display to H2 in
 * the secondary family (Instrument Serif, which has one weight); H3, the
 * small heading, and the rest in the primary at Medium (decisions,
 * 2026-10-28).
 */
export const DS_TEXT_STYLE_DEFAULTS: Record<
  DsTextStyle,
  { label: string; family: string; weight: number; size: number; lineHeight: number; use: string }
> = {
  display: { label: "Display", family: "secondary", weight: 400, size: 60, lineHeight: 64, use: "Editorial headlines on large screens" },
  h1: { label: "H1", family: "secondary", weight: 400, size: 36, lineHeight: 48, use: "Page and post titles" },
  h2: { label: "H2", family: "secondary", weight: 400, size: 24, lineHeight: 30, use: "Sections" },
  h3: { label: "H3", family: "primary", weight: 500, size: 18, lineHeight: 26, use: "Small headings, the site's name" },
  p: { label: "P", family: "primary", weight: 500, size: 16, lineHeight: 22, use: "Interface text: buttons, fields, lists" },
  prose: { label: "Prose", family: "primary", weight: 500, size: 18, lineHeight: 28, use: "Paragraphs people read" },
  small: { label: "Small", family: "primary", weight: 500, size: 14, lineHeight: 18, use: "Meta and descriptions; the floor" },
};

export type DsTextStyleConfig = {
  /** What the theme calls it, shown on /parabola ("Display", "H1"…). */
  label: string;
  /** The id of one of the theme's families. */
  family: string;
  /** 100–900; the family's font's nearest weight is used. */
  weight: number;
  size: number;
  lineHeight: number;
};

export type DsThemeConfig = {
  /** Primary first, always there; then Secondary and any the theme added. */
  families: DsFontFamily[];
  type: Record<DsTextStyle, DsTextStyleConfig>;
  /** Fonts added to this theme (a Google font by name or link), beside Parabola's. */
  customFonts: DsCustomFont[];
  /** Parabola's fonts this theme took out of its list (never System). */
  hiddenFonts: string[];
};

export const DS_DEFAULT_THEME: DsThemeConfig = {
  families: [
    { id: DS_PRIMARY_FAMILY, label: "Primary", font: DS_DEFAULT_FONT },
    { id: "secondary", label: "Secondary", font: DS_DEFAULT_SECONDARY_FONT },
  ],
  type: Object.fromEntries(
    DS_TEXT_STYLES.map((s) => {
      const { label, family, weight, size, lineHeight } = DS_TEXT_STYLE_DEFAULTS[s];
      return [s, { label, family, weight, size, lineHeight }];
    })
  ) as Record<DsTextStyle, DsTextStyleConfig>,
  customFonts: [],
  hiddenFonts: [],
};

/** The font no theme can take out: every stack ends in it. */
export const DS_PERMANENT_FONT = "system";

/** Every font this theme can use: Parabola's (less the ones it took out), then the ones it added. */
export function dsThemeFonts(theme: Pick<DsThemeConfig, "customFonts" | "hiddenFonts">): DsFont[] {
  return [...DS_FONTS.filter((f) => !theme.hiddenFonts.includes(f.id)), ...theme.customFonts.map(dsCustomFont)];
}

/** One of the theme's fonts by id, else Parabola's default, else System. */
export function dsThemeFont(theme: Pick<DsThemeConfig, "customFonts" | "hiddenFonts">, id: string): DsFont {
  const fonts = [...DS_FONTS, ...theme.customFonts.map(dsCustomFont)];
  return fonts.find((f) => f.id === id) ?? fonts.find((f) => f.id === DS_DEFAULT_FONT) ?? fonts.find((f) => f.id === DS_PERMANENT_FONT)!;
}

/** A family by id, else Primary. */
export function dsFamily(theme: Pick<DsThemeConfig, "families">, id: string): DsFontFamily {
  return theme.families.find((f) => f.id === id) ?? theme.families[0];
}

/** The font a family is set in. */
export function dsFamilyFont(theme: DsThemeConfig, familyId: string): DsFont {
  return dsThemeFont(theme, dsFamily(theme, familyId).font);
}

/** A new family's id from its name: lowercase, dashes, unlike the theme's others. */
export function dsFamilyId(theme: Pick<DsThemeConfig, "families">, label: string): string {
  const base = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 30) || "family";
  const start = /^[a-z]/.test(base) ? base : `f-${base}`;
  let id = start;
  for (let n = 2; theme.families.some((f) => f.id === id); n += 1) id = `${start}-${n}`;
  return id;
}

/** The theme without one family; the styles set in it move to Primary. Primary can't go. */
export function dsRemoveFamily(theme: DsThemeConfig, id: string): DsThemeConfig {
  if (id === DS_PRIMARY_FAMILY) return theme;
  const type = Object.fromEntries(
    DS_TEXT_STYLES.map((s) => [s, theme.type[s].family === id ? { ...theme.type[s], family: DS_PRIMARY_FAMILY } : theme.type[s]])
  ) as Record<DsTextStyle, DsTextStyleConfig>;
  return { ...theme, families: theme.families.filter((f) => f.id !== id), type };
}

const HEADINGS: DsTextStyle[] = ["display", "h1", "h2", "h3"];

const px = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;

/**
 * A stored theme, cleaned: anything missing or unknown reads as the default.
 * Older shapes still read as Primary and Secondary: `fonts: { primary,
 * display }` and `fonts: { primary, secondary }` (one font each), and the
 * first version's `fonts: { text, headings }`, with headings in Secondary.
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
  const allFonts = [...DS_FONTS.map((f) => f.id), ...customFonts.map((f) => f.id)];
  const known = (id: unknown, fallback: string) => (typeof id === "string" && allFonts.includes(id) ? id : fallback);

  // Families: the list, or an older pair.
  let families: DsFontFamily[];
  let legacy = false;
  if (Array.isArray(raw.families)) {
    const seen = new Set<string>();
    families = (raw.families as unknown[]).flatMap((f) => {
      const family = f as Partial<DsFontFamily>;
      const id = typeof family?.id === "string" ? family.id : "";
      if (!/^[a-z][a-z0-9-]{0,40}$/.test(id) || seen.has(id)) return [];
      seen.add(id);
      const label = typeof family.label === "string" && family.label.trim() ? family.label.trim().slice(0, 40) : id;
      return [{ id, label, font: known(family.font, DS_DEFAULT_FONT) }];
    });
  } else {
    const fonts = (raw.fonts ?? {}) as Record<string, unknown>;
    legacy = fonts.text !== undefined || fonts.headings !== undefined;
    families = [
      { id: DS_PRIMARY_FAMILY, label: "Primary", font: known(legacy ? fonts.text : fonts.primary, DS_DEFAULT_FONT) },
      {
        id: "secondary",
        label: "Secondary",
        font: known(legacy ? fonts.headings : (fonts.secondary ?? fonts.display), DS_DEFAULT_SECONDARY_FONT),
      },
    ];
  }
  // Primary always comes first.
  const primary = families.find((f) => f.id === DS_PRIMARY_FAMILY) ?? DS_DEFAULT_THEME.families[0];
  families = [primary, ...families.filter((f) => f.id !== DS_PRIMARY_FAMILY)];
  const familyIds = families.map((f) => f.id);

  const typeRaw = (raw.type ?? {}) as Record<
    string,
    { label?: unknown; family?: unknown; weight?: unknown; size?: unknown; lineHeight?: unknown } | undefined
  >;
  const type = Object.fromEntries(
    DS_TEXT_STYLES.map((s) => {
      const d = DS_TEXT_STYLE_DEFAULTS[s];
      const t = typeRaw[s];
      // "display" was Secondary's name for a while.
      const asked = t?.family === "display" ? "secondary" : t?.family;
      const fallback =
        legacy && HEADINGS.includes(s) && families[1] && families[1].font === families[0].font ? DS_PRIMARY_FAMILY : d.family;
      const family =
        typeof asked === "string" && familyIds.includes(asked)
          ? asked
          : familyIds.includes(fallback)
            ? fallback
            : DS_PRIMARY_FAMILY;
      const label = typeof t?.label === "string" && t.label.trim() ? t.label.trim().slice(0, 40) : d.label;
      const weight = px(t?.weight, family === d.family ? d.weight : family === DS_PRIMARY_FAMILY ? 500 : 400, 100, 900);
      return [
        s,
        {
          label,
          family,
          weight: Math.round(weight / 100) * 100,
          size: px(t?.size, d.size, 10, 200),
          lineHeight: px(t?.lineHeight, d.lineHeight, 10, 240),
        },
      ];
    })
  ) as Record<DsTextStyle, DsTextStyleConfig>;

  // Parabola's fonts it took out, never System nor one a family is set in.
  const used = new Set(families.map((f) => f.font));
  const hiddenFonts = Array.isArray(raw.hiddenFonts)
    ? [...new Set((raw.hiddenFonts as unknown[]).filter((id): id is string => typeof id === "string"))].filter(
        (id) => id !== DS_PERMANENT_FONT && DS_FONTS.some((f) => f.id === id) && !used.has(id)
      )
    : [];

  return { families, type, customFonts, hiddenFonts };
}

/** The CSS custom properties a theme sets on the page (tokens.css has the defaults). */
export function dsThemeVars(theme: DsThemeConfig): Record<string, string> {
  const vars: Record<string, string> = {};
  for (const family of theme.families) vars[`--ds-family-${family.id}`] = dsThemeFont(theme, family.font).family;
  for (const s of DS_TEXT_STYLES) {
    const t = theme.type[s];
    const family = dsFamily(theme, t.family);
    vars[`--ds-font-${s}`] = `var(--ds-family-${family.id})`;
    vars[`--ds-text-${s}`] = `${t.size}px`;
    vars[`--ds-text-${s}-leading`] = `${t.lineHeight}px`;
    vars[`--ds-weight-${s}`] = String(dsNearestWeight(dsThemeFont(theme, family.font), t.weight));
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
