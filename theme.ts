import {
  DS_ACCENT_COLOURS,
  DS_BASE_COLOURS,
  DS_DEFAULT_ACCENT_COLOUR,
  DS_DEFAULT_BASE_COLOUR,
  DS_DEFAULT_COLOURS,
  DS_ICON_LIBRARIES,
  DS_SHIFT_MAX,
  dsColourTokens,
  dsIsHex,
  type DsThemeColour,
  type DsThemeColours,
} from "./colours";
import {
  DS_DEFAULT_FONT,
  DS_DEFAULT_HEADING_FONT,
  DS_FONTS,
  dsCustomFont,
  dsSafeFontLabel,
  DS_CUSTOM_FONT_ID_RE,
  DS_GOOGLE_FONT_RE,
  dsGoogleWeightsValid,
  dsCustomFontFromInput,
  dsGoogleFontsUrl,
  dsNearestWeight,
  type DsCustomFont,
  type DsFont,
} from "./fonts";
import { dsButtonLookAt, dsButtonLookStyle, dsMoodSaturation, dsPaletteButton, dsTypeStyleFonts } from "./taste";
import { DS_RADII, DS_RADIUS_MAX, DS_RADIUS_TOKENS, dsRadiusPx, type DsRadius } from "./radius";
import {
  DS_DEFAULT_CHARACTER,
  dsCharacterBase,
  dsCharacterButtons,
  dsCharacterColourOptions,
  dsCharacterIsDefault,
  dsCharacterRadius,
  dsMoodDials,
  dsMoodFonts,
  type DsFontPair,
  parseDsCharacter,
  type DsCharacter,
} from "./character";
import {
  DS_DEFAULT_BUTTON_STYLE,
  DS_DEFAULT_FIELD_STYLE,
  dsButtonStyleVars,
  dsFieldStyleVars,
  parseDsButtonStyle,
  parseDsFieldStyle,
  type DsButtonStyle,
  type DsFieldStyle,
} from "./button-style";

/**
 * A Parabola theme: the choices that change how everything looks, stored as
 * data so a site, an agent or /parabola can set them much as shadcn's create page sets a style:
 *
 * - colours: the theme colour (the website's background), fonts and UI (the
 *   text and the greys drawn from it), the tertiary colour (the
 *   accent: buttons, calls to action and highlights), the surface (cards)
 *   and the quaternary (fields), each Parabola's or a hex picked for the light theme, and in
 *   dark based on the light one (its counterpart) or picked apart (colours.ts);
 * - font families: Font (text) and Heading (headlines) to start, and any a
 *   theme adds, each a name and a font, the font one of Parabola's (fonts.ts)
 *   or one added to the theme (`customFonts`);
 * - the type scale: for each text style, its name, family (Display to H2 in
 *   Heading, the rest in Font, by default), weight, size and line height;
 * - a radius (None, Small, Medium, Large) for every corner, buttons
 *   included: fully round only at Large (radius.ts);
 * - the buttons' look: solid or a gradient (with its contrast), an outline,
 *   a 3D label (button-style.ts);
 * - an icon library (Lucide, for now).
 *
 * Themes are kept in a library (DsThemeLibrary): Parabola (the default) and
 * any added, one of them a site's. An older theme without a part keeps Parabola's default.
 */

/** Parabola's text styles, largest first (the `text-*` utilities). */
export const DS_TEXT_STYLES = ["display", "h1", "h2", "h3", "p", "prose", "small"] as const;
export type DsTextStyle = (typeof DS_TEXT_STYLES)[number];

/** A font family: what the theme calls it, and its font. `id` names its CSS variable, `--ds-family-<id>`. */
export type DsFontFamily = { id: string; label: string; font: string };

/** The family every theme has: text, and the fallback for a style whose family is gone. */
export const DS_BODY_FAMILY = "body";
/** Headlines' family, from the start. */
export const DS_HEADING_FAMILY = "heading";

/**
 * Each style's default name, family, weight, size and line height (px), as
 * tokens.css sets them (`npm run check` checks): Display to H2 in
 * the Heading family (Instrument Serif, which has one weight); H3, the small
 * heading, and the rest in Font at Medium.
 */
export const DS_TEXT_STYLE_DEFAULTS: Record<
  DsTextStyle,
  { label: string; family: string; weight: number; size: number; lineHeight: number; use: string }
> = {
  display: { label: "Display", family: "heading", weight: 400, size: 60, lineHeight: 64, use: "Editorial headlines on large screens" },
  h1: { label: "H1", family: "heading", weight: 400, size: 36, lineHeight: 48, use: "Page and post titles" },
  h2: { label: "H2", family: "heading", weight: 400, size: 24, lineHeight: 30, use: "Sections" },
  h3: { label: "H3", family: "body", weight: 500, size: 18, lineHeight: 26, use: "Small headings, the site's name" },
  p: { label: "P", family: "body", weight: 500, size: 16, lineHeight: 22, use: "Interface text: buttons, fields, lists" },
  prose: { label: "Prose", family: "body", weight: 500, size: 18, lineHeight: 28, use: "Paragraphs people read" },
  small: { label: "Small", family: "body", weight: 500, size: 14, lineHeight: 18, use: "Meta and descriptions; the floor" },
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
  /** The dials every Auto value is worked out from: hue, temperature, colour, brightness, contrast, roundness, depth (character.ts). */
  character: DsCharacter;
  /** Background, primary and secondary (the text), buttons, field and surface, each for light and dark (colours.ts). */
  colours: DsThemeColours;
  /** Font (text, always there) first; then Heading and any the theme added. */
  families: DsFontFamily[];
  type: Record<DsTextStyle, DsTextStyleConfig>;
  /** Fonts added to this theme (a Google font by name or link), beside Parabola's. */
  customFonts: DsCustomFont[];
  /** Parabola's fonts this theme took out of its list (never System). */
  hiddenFonts: string[];
  /** How round every corner is: a preset, or custom pixels (radius.ts); null for the character's roundness. */
  radius: DsRadius | null;
  /** The pills' corner (labels like New, Published): null for the same as the buttons, or a radius of their own. */
  pillRadius: DsRadius | null;
  /** How the solid buttons look: fill, outline, text shadow (button-style.ts); null for the character's depth. */
  buttons: DsButtonStyle | null;
  /** The fields' outline: on or off, its width and opacity (button-style.ts). */
  fields: DsFieldStyle;
  /** The icon library, by id (colours.ts). */
  icons: string;
};

export const DS_DEFAULT_THEME: DsThemeConfig = {
  character: DS_DEFAULT_CHARACTER,
  colours: DS_DEFAULT_COLOURS,
  families: [
    { id: DS_BODY_FAMILY, label: "Font", font: DS_DEFAULT_FONT },
    { id: DS_HEADING_FAMILY, label: "Heading", font: DS_DEFAULT_HEADING_FONT },
  ],
  type: Object.fromEntries(
    DS_TEXT_STYLES.map((s) => {
      const { label, family, weight, size, lineHeight } = DS_TEXT_STYLE_DEFAULTS[s];
      return [s, { label, family, weight, size, lineHeight }];
    })
  ) as Record<DsTextStyle, DsTextStyleConfig>,
  customFonts: [],
  hiddenFonts: [],
  radius: null,
  pillRadius: null,
  buttons: null,
  fields: DS_DEFAULT_FIELD_STYLE,
  icons: "lucide",
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

/** A family by id, else Font. */
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

/** The theme without one family; the styles set in it move to Font. Font can't go. */
export function dsRemoveFamily(theme: DsThemeConfig, id: string): DsThemeConfig {
  if (id === DS_BODY_FAMILY) return theme;
  const type = Object.fromEntries(
    DS_TEXT_STYLES.map((s) => [s, theme.type[s].family === id ? { ...theme.type[s], family: DS_BODY_FAMILY } : theme.type[s]])
  ) as Record<DsTextStyle, DsTextStyleConfig>;
  return { ...theme, families: theme.families.filter((f) => f.id !== id), type };
}

/** A family id from an older theme: primary was Font, secondary (and display) Heading. */
const currentFamilyId = (id: unknown): unknown =>
  id === "primary" ? DS_BODY_FAMILY : id === "secondary" || id === "display" ? DS_HEADING_FAMILY : id;
const OLD_LABELS: Record<string, string> = { Primary: "Font", Secondary: "Heading", Display: "Heading" };

const px = (value: unknown, fallback: number, min: number, max: number) =>
  typeof value === "number" && Number.isFinite(value) ? Math.min(max, Math.max(min, Math.round(value))) : fallback;

/**
 * A stored theme, cleaned: anything missing or unknown reads as the default.
 * Older shapes still read, their families as Font and Heading: a families
 * list with `primary` and `secondary`, `fonts: { primary, display }` or
 * `{ primary, secondary }`, and the first version's `fonts: { text,
 * headings }`.
 */
export function parseDsThemeConfig(value: unknown): DsThemeConfig {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const customFonts = Array.isArray(raw.customFonts)
    ? (raw.customFonts as unknown[]).flatMap((f) => {
        const font = f as Partial<DsCustomFont>;
        // Stored data is checked like a file: the id, name and link end up in CSS and in a link on every page.
        return typeof font?.id === "string" && typeof font.label === "string" && typeof font.google === "string" &&
          DS_CUSTOM_FONT_ID_RE.test(font.id) && DS_GOOGLE_FONT_RE.test(font.google) && dsGoogleWeightsValid(font.google)
          ? [{ id: font.id, label: dsSafeFontLabel(font.label), google: font.google }]
          : [];
      })
    : [];
  const allFonts = [...DS_FONTS.map((f) => f.id), ...customFonts.map((f) => f.id)];
  const known = (id: unknown, fallback: string) => (typeof id === "string" && allFonts.includes(id) ? id : fallback);

  const coloursRaw = (raw.colours ?? {}) as Record<string, unknown>;
  const hex = (value: unknown) => (dsIsHex(value) ? value.toUpperCase() : null);
  // A light pick: a hex, or an older theme's preset (never Parabola's own, which is null).
  const lightPick = (value: unknown, presets: { id: string }[], own: string) =>
    hex(value) ?? (typeof value === "string" && value !== own && presets.some((c) => c.id === value) ? value : null);
  const shift = (value: unknown) =>
    typeof value === "number" && Number.isFinite(value)
      ? { value: Math.min(DS_SHIFT_MAX, Math.max(-DS_SHIFT_MAX, value)) }
      : null;
  const colour = (value: unknown, presets: { id: string }[] = [], own = ""): DsThemeColour => {
    const v = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
    const lightShift = shift(v.lightShift);
    const darkShift = shift(v.darkShift);
    return {
      light: lightPick(v.light, presets, own),
      dark: hex(v.dark),
      ...(lightShift && { lightShift: lightShift.value }),
      ...(darkShift && { darkShift: darkShift.value }),
    };
  };
  // Older themes: a base colour, an accent (once "secondary"), a background (once light and dark apart) and a surface, which goes (the new
  // surface starts from the theme colour).
  const legacyBackground =
    coloursRaw.background && typeof coloursRaw.background === "object"
      ? (coloursRaw.background as Record<string, unknown>).light
      : coloursRaw.background;
  // Buttons were a colour of their own until 2026-10-29; now they're the tertiary (accent), so a theme's buttons
  // colour becomes its tertiary when it had none.
  const accent = colour(coloursRaw.accent, DS_ACCENT_COLOURS, DS_DEFAULT_ACCENT_COLOUR);
  const buttons = colour(coloursRaw.button);
  const colours: DsThemeColours =
    coloursRaw.theme || coloursRaw.text || coloursRaw.ui
      ? {
          theme: colour(coloursRaw.theme),
          surface: colour(coloursRaw.surface),
          // Typography was "fonts and UI" for a day.
          text: colour(coloursRaw.text ?? coloursRaw.ui, DS_BASE_COLOURS, DS_DEFAULT_BASE_COLOUR),
          muted: colour(coloursRaw.muted),
          accent: accent.light === null && buttons.light ? buttons : accent,
          buttonSecondary: colour(coloursRaw.buttonSecondary),
          field: colour(coloursRaw.field),
        }
      : {
          theme: { light: hex(legacyBackground), dark: null },
          surface: { light: null, dark: null },
          text: { light: lightPick(coloursRaw.base, DS_BASE_COLOURS, DS_DEFAULT_BASE_COLOUR), dark: null },
          muted: { light: null, dark: null },
          accent: { light: lightPick(coloursRaw.accent ?? coloursRaw.secondary, DS_ACCENT_COLOURS, DS_DEFAULT_ACCENT_COLOUR), dark: null },
          buttonSecondary: { light: null, dark: null },
          field: { light: null, dark: null },
        };

  // Families: the list, or an older pair.
  let families: DsFontFamily[];
  let legacy = false;
  if (Array.isArray(raw.families)) {
    const seen = new Set<string>();
    families = (raw.families as unknown[]).flatMap((f) => {
      const family = f as Partial<DsFontFamily>;
      const id = currentFamilyId(family?.id);
      if (typeof id !== "string" || !/^[a-z][a-z0-9-]{0,40}$/.test(id) || seen.has(id)) return [];
      seen.add(id);
      const asked = typeof family.label === "string" && family.label.trim() ? family.label.trim().slice(0, 40) : id;
      return [{ id, label: OLD_LABELS[asked] ?? asked, font: known(family.font, DS_DEFAULT_FONT) }];
    });
  } else {
    const fonts = (raw.fonts ?? {}) as Record<string, unknown>;
    legacy = fonts.text !== undefined || fonts.headings !== undefined;
    families = [
      { id: DS_BODY_FAMILY, label: "Font", font: known(legacy ? fonts.text : fonts.primary, DS_DEFAULT_FONT) },
      {
        id: DS_HEADING_FAMILY,
        label: "Heading",
        font: known(legacy ? fonts.headings : (fonts.secondary ?? fonts.display), DS_DEFAULT_HEADING_FONT),
      },
    ];
  }
  // Font always comes first.
  const body = families.find((f) => f.id === DS_BODY_FAMILY) ?? DS_DEFAULT_THEME.families[0];
  families = [body, ...families.filter((f) => f.id !== DS_BODY_FAMILY)];
  const familyIds = families.map((f) => f.id);

  const typeRaw = (raw.type ?? {}) as Record<
    string,
    { label?: unknown; family?: unknown; weight?: unknown; size?: unknown; lineHeight?: unknown } | undefined
  >;
  const type = Object.fromEntries(
    DS_TEXT_STYLES.map((s) => {
      const d = DS_TEXT_STYLE_DEFAULTS[s];
      const t = typeRaw[s];
      const asked = currentFamilyId(t?.family);
      const fallback = legacy && d.family === DS_HEADING_FAMILY && families[1]?.font === families[0].font ? DS_BODY_FAMILY : d.family;
      const family =
        typeof asked === "string" && familyIds.includes(asked) ? asked : familyIds.includes(fallback) ? fallback : DS_BODY_FAMILY;
      const label = typeof t?.label === "string" && t.label.trim() ? t.label.trim().slice(0, 40) : d.label;
      const weight = px(t?.weight, family === d.family ? d.weight : family === DS_BODY_FAMILY ? 500 : 400, 100, 900);
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

  const parseRadius = (value: unknown): DsRadius | null =>
    typeof value === "number" && Number.isFinite(value)
      ? Math.min(DS_RADIUS_MAX, Math.max(0, Math.round(value)))
      : DS_RADII.some((r) => r.id === value)
        ? (value as DsRadius)
        : null;
  // Null means Auto, from the character. A theme from before the character (none stored) kept Parabola's
  // defaults as values: those become Auto, anything else its own (Custom).
  const older = !(raw.character && typeof raw.character === "object");
  const storedRadius = parseRadius(raw.radius);
  const radius = older && storedRadius === "large" ? null : storedRadius;
  const pillRadius = parseRadius(raw.pillRadius);
  const storedButtons = raw.buttons && typeof raw.buttons === "object" ? parseDsButtonStyle(raw.buttons) : null;
  const parsed = parseDsCharacter(raw.character);
  // A theme stored before the chips shows the ones it still matches: Parabola's colours, fonts and buttons.
  const stored = raw.character && typeof raw.character === "object" ? (raw.character as Record<string, unknown>).scoped : undefined;
  const chips = { ...parsed.scoped };
  if (!stored || typeof stored !== "object" || Array.isArray(stored) || Object.values(stored).every(Array.isArray)) {
    const c = parsed;
    if (!chips.colour && c.colour === 0 && c.brightness === 1 && c.contrast === 0 && Object.values(colours).every((v) => !v.light && !v.dark)) chips.colour = "classic";
    if (!chips.type && families.find((f) => f.id === DS_BODY_FAMILY)?.font === DS_DEFAULT_FONT && families.find((f) => f.id === DS_HEADING_FAMILY)?.font === DS_DEFAULT_HEADING_FONT) chips.type = "classic";
    if (!chips.buttons && c.roundness === 1 && c.depth === 0 && radius === null && !storedButtons) chips.buttons = "soft";
  }
  const character = { ...parsed, scoped: chips };
  const icons = DS_ICON_LIBRARIES.some((l) => l.id === raw.icons && l.ready) ? (raw.icons as string) : "lucide";

  const buttonStyle =
    older && storedButtons && JSON.stringify(storedButtons) === JSON.stringify(DS_DEFAULT_BUTTON_STYLE) ? null : storedButtons;

  return {
    character,
    colours,
    families,
    type,
    customFonts,
    hiddenFonts,
    radius,
    pillRadius,
    buttons: buttonStyle,
    fields: parseDsFieldStyle(raw.fields),
    icons,
  };
}

/**
 * The theme at a mood, its personality, restrained to wacky (character.ts; moving
 * the slider should visibly change the mood): inside the chips the style chose (taste.ts), the kind of type's
 * font pair for that mood, the kind of button's roundness and depth, the
 * background's saturation (quieter restrained, stronger wacky) and the
 * palette's button colour for it. Without chips (a theme from before them),
 * roundness and the fonts slide along `DS_MOODS`. Anything given its own
 * apart from the button colour stays as it is.
 */
export function dsThemeWithMood(theme: DsThemeConfig, mood: number): DsThemeConfig {
  const c = theme.character;
  const { colour, type, buttons } = c.scoped;
  const look = buttons ? dsButtonLookAt(buttons, mood) : null;
  const saturation = Math.round(Math.min(1, (c.colour * dsMoodSaturation(mood)) / dsMoodSaturation(c.mood)) * 100) / 100;
  const character = { ...c, mood, ...(look ?? dsMoodDials(mood)), ...(colour ? { colour: saturation } : {}) };
  const colours = colour ? { ...theme.colours, accent: { light: dsPaletteButton(colour, character, mood), dark: null } } : theme.colours;
  // An outline or text button keeps its own look; any other's comes from the depth.
  return dsThemeWithFonts(
    { ...theme, character, colours, buttons: dsButtonLookStyle(buttons) ?? theme.buttons },
    type ? dsTypeStyleFonts(type, mood) : dsMoodFonts(mood)
  );
}

/**
 * The theme with its Heading and Font in a pair of Google fonts (added to its
 * fonts if they're not there), or Parabola's own for null.
 */
export function dsThemeWithFonts(theme: DsThemeConfig, fonts: DsFontPair | null): DsThemeConfig {
  const customFonts = [...theme.customFonts];
  const fontId = (face: { label: string; google: string } | undefined, fallback: string) => {
    if (!face) return fallback;
    const font = dsCustomFontFromInput(face.label);
    if (!font) return fallback;
    const own = { ...font, google: face.google };
    if (!customFonts.some((f) => f.id === own.id)) customFonts.push(own);
    return own.id;
  };
  const heading = fontId(fonts?.heading, DS_DEFAULT_HEADING_FONT);
  const body = fontId(fonts?.body, DS_DEFAULT_FONT);
  const families = theme.families.map((f) =>
    f.id === DS_HEADING_FAMILY ? { ...f, font: heading } : f.id === DS_BODY_FAMILY ? { ...f, font: body } : f
  );
  return parseDsThemeConfig({ ...theme, families, customFonts });
}

/** A theme's corners: its own, or the character's roundness. */
export const dsThemeRadius = (theme: DsThemeConfig): DsRadius => theme.radius ?? dsCharacterRadius(theme.character);

/** A theme's buttons' look: its own, or the character's depth. */
export const dsThemeButtons = (theme: DsThemeConfig): DsButtonStyle => theme.buttons ?? dsCharacterButtons(theme.character);

/** A theme's colour tokens in a mode, its character's base and contrast under the Auto ones. */
export function dsThemeColourTokens(theme: DsThemeConfig, mode: "light" | "dark"): Record<string, string> {
  return dsColourTokens(theme.colours, mode, dsCharacterColourOptions(theme.character));
}

/**
 * A theme's colour tokens in light or dark, every one of them, so a theme's CSS stands on its own over another's,
 * and its buttons' look, which follows their colour.
 */
function colourVars(theme: DsThemeConfig, mode: "light" | "dark"): Record<string, string> {
  const tokens = dsThemeColourTokens(theme, mode);
  return {
    ...Object.fromEntries(Object.entries(tokens).map(([name, value]) => [`--ds-${name}`, value])),
    ...dsButtonStyleVars(dsThemeButtons(theme), tokens.button),
    ...dsFieldStyleVars(theme.fields, tokens["field-border"]),
  };
}

/** The CSS custom properties a theme sets on :root, in the light theme (tokens.css has the defaults). */
export function dsThemeVars(theme: DsThemeConfig): Record<string, string> {
  const vars: Record<string, string> = colourVars(theme, "light");
  for (const family of theme.families) vars[`--ds-family-${family.id}`] = dsThemeFont(theme, family.font).family;
  for (const s of DS_TEXT_STYLES) {
    const t = theme.type[s];
    const family = dsFamily(theme, t.family);
    vars[`--ds-font-${s}`] = `var(--ds-family-${family.id})`;
    vars[`--ds-text-${s}`] = `${t.size}px`;
    vars[`--ds-text-${s}-leading`] = `${t.lineHeight}px`;
    vars[`--ds-weight-${s}`] = String(dsNearestWeight(dsThemeFont(theme, family.font), t.weight));
  }
  const radius = dsThemeRadius(theme);
  const px = dsRadiusPx(radius);
  for (const token of DS_RADIUS_TOKENS) vars[`--ds-radius-${token}`] = `${px[token]}px`;
  // Pills: the buttons' corner, or their own.
  vars["--ds-radius-chip"] = `${dsRadiusPx(theme.pillRadius ?? radius).pill}px`;
  return vars;
}

/** The colours a theme sets in the dark theme (the `.dark` class). */
export function dsThemeDarkVars(theme: DsThemeConfig): Record<string, string> {
  return colourVars(theme, "dark");
}

const rule = (selector: string, vars: Record<string, string>) =>
  `${selector} { ${Object.entries(vars)
    .map(([name, value]) => `${name}: ${value};`)
    .join(" ")} }`;

/**
 * The class that wears a theme on part of a page (`dsThemeCss` with a
 * scope): /parabola's canvas, while its sidebar, header and panel, like the
 * admin, stay in Parabola's own.
 */
export const DS_THEME_SCOPE = "ds-theme";

/**
 * Tokens tokens.css works out from others on :root. A scope sets them again,
 * so they follow its colours and fonts rather than the page's.
 */
const SCOPE_DERIVED: Record<string, string> = {
  "--ds-font": "var(--ds-family-body)",
  "--ds-hover": "color-mix(in srgb, var(--ds-fg) 12%, transparent)",
  "--ds-hover-inverse": "color-mix(in srgb, var(--ds-bg) 18%, transparent)",
  "--ds-focus": "var(--ds-fg)",
};

/** Each colour token's role, in plain words, for an export a person or an AI reads. */
const COLOUR_ROLES: [token: string, role: string][] = [
  ["bg", "background: the page"],
  ["fg", "primary: the text"],
  ["fg-muted", "secondary: quieter text"],
  ["fg-subtle", "faintest text (captions, placeholders)"],
  ["border", "borders and field outlines"],
  ["surface-subtle", "surface: cards and panels"],
  ["field", "field: input backgrounds"],
  ["field-border", "field outlines"],
  ["surface", "button: secondary, the quiet buttons and pills, and image placeholders"],
  ["on-surface", "text on secondary buttons and pills"],
  ["surface-inverse", "toasts and tooltips"],
  ["button", "button: primary, the solid buttons and selected states"],
  ["on-button", "text on primary buttons"],
  ["highlight", "button colour as an accent (highlight pills, what needs attention)"],
  ["highlight-tint", "accent background"],
];

/**
 * A theme as one export a person or an AI can read and build from (a
 * prompt: "build me a website in this theme") and Parabola can read back:
 * what it is, every colour by its role in light and dark, the fonts by name
 * with a Google Fonts link and each text style's size, line height and
 * weight, the corners in pixels, and, under `settings`, the theme itself
 * (`parseDsThemeExport` reads that back).
 */
export function dsThemeExport(theme: DsThemeConfig, name = "Parabola theme") {
  const colours = (mode: "light" | "dark") => {
    const tokens = dsThemeColourTokens(theme, mode);
    return Object.fromEntries(COLOUR_ROLES.map(([token, role]) => [role, tokens[token]]));
  };
  const familyFont = (id: string) => dsThemeFont(theme, dsFamily(theme, id).font);
  const radius = dsThemeRadius(theme);
  const buttons = dsThemeButtons(theme);
  const px = dsRadiusPx(radius);
  const c = theme.character;
  const pct = (n: number) => Math.round(n * 100);
  // What's been given its own value, apart from the dials.
  const overrides = [
    ...(Object.keys(theme.colours) as (keyof typeof theme.colours)[]).filter((k) => theme.colours[k].light !== null || theme.colours[k].dark !== null).map((k) => `colour: ${k}`),
    ...(theme.radius !== null ? ["corners"] : []),
    ...(theme.pillRadius !== null ? ["pill corners"] : []),
    ...(theme.buttons !== null ? ["buttons"] : []),
  ];
  const round = (n: number) => (n >= 9999 ? "fully round" : `${n}px`);
  return {
    about: `"${name}", a website theme made with Parabola. "character" is the look as a whole, dials an agent moves rather than picking colours: hue (0 to 360), temperature ("warmth", cool -50 to warm +50), how much colour ("colour"), the type's contrast ("typeContrast", 100 full, lower an ink of the hue), brightness (0 black, 50 the colour at its strongest, 100 white), contrast, roundness and depth, each 0 to 100 (contrast -50 to +50), plus the base colour they make and the chips picked in each section ("scoped"); every value under them is worked out from the dials unless listed in "overrides". Colours are given for a light and a dark mode, each by what it's for; fonts by name, with a Google Fonts link; type styles by name, largest first; corners in pixels. Use it to build or restyle a website in this look. "settings" is the theme itself, for Parabola to read back.`,
    name,
    character: {
      tastes: c.tastes,
      scoped: c.scoped,
      background: dsCharacterBase(c) ?? "white",
      hue: Math.round(c.hue),
      warmth: Math.round(c.warmth * 50),
      typeContrast: pct(c.ink),
      colour: pct(c.colour),
      brightness: pct(c.brightness),
      contrast: Math.round(c.contrast * 50),
      roundness: pct(c.roundness),
      depth: pct(c.depth),
      ...(dsCharacterIsDefault(c) ? { note: "Parabola's own: every dial at rest" } : {}),
    },
    overrides,
    colours: { light: colours("light"), dark: colours("dark") },
    typography: {
      fonts: Object.fromEntries(theme.families.map((f) => [f.label, familyFont(f.id).label])),
      googleFonts: dsGoogleFontsUrl(theme.families.map((f) => familyFont(f.id))),
      styles: Object.fromEntries(
        DS_TEXT_STYLES.map((s) => {
          const t = theme.type[s];
          return [t.label, { font: familyFont(t.family).label, size: `${t.size}px`, lineHeight: `${t.lineHeight}px`, weight: t.weight }];
        })
      ),
    },
    corners: {
      "cards and panels": round(px.lg),
      "fields and menus": round(px.md),
      "small buttons and pills": round(px.control),
      "smallest (tags, swatches)": round(px.sm),
      buttons: round(px.pill),
      pills: round(dsRadiusPx(theme.pillRadius ?? radius).pill),
    },
    buttons: {
      fill:
        buttons.fill === "gradient" && buttons.contrast !== 0
          ? `a gradient of the button colour, ${buttons.contrast > 0 ? "lighter at the top and darker at the bottom" : "darker at the top and lighter at the bottom"} (contrast ${Math.round(Math.abs(buttons.contrast) * 50)} of 50)`
          : "solid, the button colour",
      outline: buttons.outline ? `a ${buttons.outlineWidth}px line inside the edge, the button colour a step darker` : "none",
      fieldOutline: theme.fields.outline
        ? `${theme.fields.outlineWidth}px${theme.fields.outlineOpacity < 1 ? `, ${Math.round(theme.fields.outlineOpacity * 100)}% opaque` : ""}`
        : "none",
      label: buttons.shadow
        ? `a 1px text shadow on the label only, falling away from a light at ${buttons.shadowAngle}° (90 is from above)`
        : "flat",
    },
    settings: theme,
  };
}

/** A theme from an export (its `settings`), or from the settings alone. */
export function parseDsThemeExport(value: unknown): DsThemeConfig {
  const raw = value && typeof value === "object" ? (value as Record<string, unknown>) : {};
  return parseDsThemeConfig(raw.settings ?? raw);
}

/** The tokens tokens.css's `.dark` changes that a theme doesn't set: a scope sets them for its own mode. */
const SCOPE_MODE: Record<"light" | "dark", Record<string, string>> = {
  light: {
    "--ds-error": "oklch(0.577 0.245 27.325)",
    "--ds-shadow-raised": "0 12px 32px -8px rgb(0 0 0 / 0.14), 0 2px 6px rgb(0 0 0 / 0.06)",
  },
  dark: {
    "--ds-error": "oklch(0.704 0.191 22.216)",
    "--ds-shadow-raised": "0 12px 32px -8px rgb(0 0 0 / 0.6), 0 2px 6px rgb(0 0 0 / 0.4)",
  },
};

/**
 * The theme as CSS: light on :root and dark on `.dark`, for a whole page
 * (the website); or, with `scope`, on that class only (`DS_THEME_SCOPE`),
 * its text in the theme's font and colour, light or dark by its own
 * `data-ds-mode` whatever the page around it is in.
 */
export function dsThemeCss(theme: DsThemeConfig, scope?: string): string {
  if (!scope) return `${rule(":root", dsThemeVars(theme))} ${rule(".dark", dsThemeDarkVars(theme))}`;
  const at = `.${scope}`;
  return [
    rule(at, { ...dsThemeVars(theme), ...SCOPE_DERIVED, ...SCOPE_MODE.light }),
    // Dark by its own data-ds-mode, or, with none set, by the page's `.dark`
    // (already there before the first paint, so the scope never flashes light).
    rule(`${at}[data-ds-mode="dark"], .dark ${at}:not([data-ds-mode="light"])`, { ...dsThemeDarkVars(theme), ...SCOPE_MODE.dark }),
    `${at} { font-family: var(--ds-font); color: var(--ds-fg); }`,
  ].join(" ");
}

let release: number | undefined;

/**
 * Holds every transition while a theme is applied, and for two frames
 * after the last time (a drag applies one many times a second), so
 * buttons and fields change with the page instead of fading behind it.
 */
function holdTransitions(): void {
  if (!document.getElementById("ds-theme-still")) {
    const still = Object.assign(document.createElement("style"), {
      id: "ds-theme-still",
      textContent: "*, *::before, *::after { transition: none !important; }",
    });
    document.head.appendChild(still);
  }
  if (release !== undefined) cancelAnimationFrame(release);
  release = requestAnimationFrame(() => {
    release = requestAnimationFrame(() => {
      document.getElementById("ds-theme-still")?.remove();
      release = undefined;
    });
  });
}

/**
 * Shows a theme on this page right away, before it's saved or reloaded: puts
 * its CSS in a <style> at the end of the page, after (so over) the theme it
 * was served with (DsThemeStyle, wherever the app rendered it), and loads the fonts the theme added (from Google) that the
 * page hasn't loaded yet, so they can be seen before they're picked;
 * Parabola's own come with the page (DsThemeStyle). With `scope`, only on
 * that class (dsThemeCss). Browser only.
 */
export function dsApplyTheme(theme: DsThemeConfig, scope?: string): void {
  if (typeof document === "undefined") return;
  holdTransitions();
  let style = document.getElementById("ds-theme-live") as HTMLStyleElement | null;
  if (!style) {
    style = Object.assign(document.createElement("style"), { id: "ds-theme-live" });
  }
  // Last on the page, whatever was added since: the later of two equal rules wins.
  if (style !== document.body.lastElementChild) document.body.appendChild(style);
  style.textContent = dsThemeCss(theme, scope);
  // Paint the new colours now, while transitions are held, so nothing fades into them.
  void getComputedStyle(document.body).color;
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

/** Takes away what dsApplyTheme showed, so the page wears the theme it was served with again. */
export function dsClearAppliedTheme(): void {
  if (typeof document === "undefined") return;
  document.getElementById("ds-theme-live")?.remove();
}

// ---------------------------------------------------------------------------
/**
 * Whether two themes look the same: the style they're named for and fonts
 * added but unused don't count (a style is a label for how a look was made).
 */
export function dsSameLook(a: DsThemeConfig, b: DsThemeConfig): boolean {
  const look = (t: DsThemeConfig) => {
    const p = parseDsThemeConfig(t);
    return JSON.stringify({ ...p, character: { ...p.character, tastes: [] }, customFonts: [], hiddenFonts: [] });
  };
  return look(a) === look(b);
}

// The library: every theme a site has, one of them in use.

/** A named theme in a library. */
export type DsThemeEntry = { id: string; name: string; theme: DsThemeConfig };

/** Parabola, the default (always first, can't go), and any themes added; `active` is the one the site wears. */
export type DsThemeLibrary = { themes: DsThemeEntry[]; active: string };

export const DS_DEFAULT_THEME_ID = "default";

export const DS_DEFAULT_LIBRARY: DsThemeLibrary = {
  themes: [{ id: DS_DEFAULT_THEME_ID, name: "Parabola", theme: DS_DEFAULT_THEME }],
  active: DS_DEFAULT_THEME_ID,
};

/** The theme a library says is in use. */
export function dsActiveTheme(library: DsThemeLibrary): DsThemeEntry {
  return library.themes.find((t) => t.id === library.active) ?? library.themes[0];
}

/** A new theme's id from its name, unlike the library's others. */
export function dsThemeEntryId(library: DsThemeLibrary, name: string): string {
  const base = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40) || "theme";
  let id = base;
  for (let n = 2; library.themes.some((t) => t.id === id); n += 1) id = `${base}-${n}`;
  return id;
}

/**
 * A stored library, cleaned: Default first, every theme parsed, `active` one
 * of them. `legacy` is a single theme stored before there was a library,
 * which becomes Default.
 */
export function parseDsThemeLibrary(value: unknown, legacy?: unknown): DsThemeLibrary {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const seen = new Set<string>();
  const themes: DsThemeEntry[] = Array.isArray(raw.themes)
    ? (raw.themes as unknown[]).flatMap((t) => {
        const entry = t as Partial<DsThemeEntry>;
        const id = typeof entry?.id === "string" && /^[a-z0-9][a-z0-9-]{0,60}$/.test(entry.id) ? entry.id : null;
        if (!id || seen.has(id)) return [];
        seen.add(id);
        const named = typeof entry.name === "string" && entry.name.trim() ? entry.name.trim().slice(0, 60) : id;
        // The default theme was called Default before it was Parabola.
        const name = id === DS_DEFAULT_THEME_ID && named === "Default" ? "Parabola" : named;
        return [{ id, name, theme: parseDsThemeConfig(entry.theme) }];
      })
    : [];
  const fallbackDefault: DsThemeEntry = {
    id: DS_DEFAULT_THEME_ID,
    name: "Parabola",
    theme: legacy !== undefined ? parseDsThemeConfig(legacy) : DS_DEFAULT_THEME,
  };
  const first = themes.find((t) => t.id === DS_DEFAULT_THEME_ID) ?? fallbackDefault;
  const others = themes.filter((t) => t.id !== DS_DEFAULT_THEME_ID);
  const active = typeof raw.active === "string" && others.some((t) => t.id === raw.active) ? raw.active : DS_DEFAULT_THEME_ID;
  // Parabola can be changed like any theme (Restore puts it back to DS_DEFAULT_THEME), so it's kept as stored.
  return { themes: [first, ...others], active };
}
