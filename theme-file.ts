import type { DsThemeColours } from "./colours";
import { DS_ACCENT_COLOURS, DS_BASE_COLOURS, DS_ICON_LIBRARIES, DS_SHIFT_MAX, dsIsHex } from "./colours";
import { DS_CHARACTER_DIALS, DS_DEFAULT_CHARACTER } from "./character";
import { DS_CUSTOM_FONT_ID_RE, DS_FONTS, DS_FONT_LABEL_RE, DS_GOOGLE_FONT_RE, dsGoogleWeightsValid } from "./fonts";
import { DS_OUTLINE_MAX } from "./button-style";
import { DS_NAV_STYLES, DS_NAV_SURFACES } from "./nav-style";
import { DS_RADII, DS_RADIUS_MAX } from "./radius";
import { DS_TEXT_STYLES, parseDsThemeConfig, type DsThemeConfig } from "./theme";

/**
 * The theme file: `<name>.theme.json`, a theme a maker or their agent writes
 * by hand, drops into the app (Darmio: Settings > Design) and removes again, without touching
 * code. `theme` holds the same choices Parabola's builder sets
 * (`DsThemeConfig`); the file adds a name and a version, and this contract says
 * exactly which keys are allowed, so a mistake is named instead of ignored.
 *
 * Anything left out keeps Parabola's default. Anything not listed in
 * `DS_THEME_FILE_CONTRACT` is rejected, with the allowed values in the message.
 */
export const DS_THEME_FILE_FORMAT = "parabola-theme";
/** Older theme files, written when Parabola shipped inside Darmio; still read. */
export const DS_THEME_FILE_LEGACY_FORMATS: readonly string[] = ["darmio-theme"];
export const DS_THEME_FILE_VERSION = 1;
export const DS_THEME_FILE_SUFFIX = ".theme.json";
/** A file bigger than this is not a theme. */
export const DS_THEME_FILE_MAX_BYTES = 200_000;

const COLOUR_KEYS = ["theme", "surface", "text", "muted", "accent", "buttonSecondary", "field"] as const;
const COLOUR_PICK_KEYS = ["light", "dark", "lightShift", "darkShift"] as const;
const FAMILY_KEYS = ["id", "label", "font"] as const;
const STYLE_KEYS = ["label", "family", "weight", "size", "lineHeight"] as const;
const CUSTOM_FONT_KEYS = ["id", "label", "google"] as const;
const BUTTON_KEYS = ["fill", "contrast", "outline", "outlineWidth", "outlineOpacity", "shadow", "shadowAngle"] as const;
const FIELD_KEYS = ["outline", "outlineWidth", "outlineOpacity"] as const;
const NAV_KEYS = ["style", "surface"] as const;
const CHARACTER_KEYS = ["tastes", "scoped", "mood", ...DS_CHARACTER_DIALS.map((d) => d.id)] as const;
const THEME_KEYS = [
  "character",
  "colours",
  "families",
  "type",
  "customFonts",
  "hiddenFonts",
  "radius",
  "pillRadius",
  "buttons",
  "fields",
  "nav",
  "icons",
  "composition",
  "brief",
  "social",
] as const;
const FILE_KEYS = ["format", "version", "name", "description", "theme"] as const;

/** What a theme file may set, for the guide and for an agent: nothing outside this changes the site. */
export const DS_THEME_FILE_CONTRACT = {
  file: FILE_KEYS,
  theme: THEME_KEYS,
  colours: COLOUR_KEYS,
  colourPick: COLOUR_PICK_KEYS,
  textStyles: DS_TEXT_STYLES,
  textStyle: STYLE_KEYS,
  family: FAMILY_KEYS,
  customFont: CUSTOM_FONT_KEYS,
  character: CHARACTER_KEYS,
  buttons: BUTTON_KEYS,
  fields: FIELD_KEYS,
  nav: NAV_KEYS,
  navStyles: DS_NAV_STYLES.map((s) => s.id),
  navSurfaces: DS_NAV_SURFACES.map((s) => s.id),
  radii: DS_RADII.map((r) => r.id),
  radiusMaxPx: DS_RADIUS_MAX,
  fonts: DS_FONTS.map((f) => f.id),
  icons: DS_ICON_LIBRARIES.filter((l) => l.ready).map((l) => l.id),
} as const;

export type DsThemeFileResult =
  | { ok: true; name: string; description: string; theme: DsThemeConfig }
  | { ok: false; errors: string[] };

type Obj = Record<string, unknown>;
const isObj = (v: unknown): v is Obj => !!v && typeof v === "object" && !Array.isArray(v);
const isNum = (v: unknown): v is number => typeof v === "number" && Number.isFinite(v);
const list = (values: readonly string[]) => values.map((v) => `"${v}"`).join(", ");

/** Unknown keys of `obj`, each named with the keys that are allowed. */
function unknownKeys(obj: Obj, allowed: readonly string[], at: string, errors: string[]) {
  for (const key of Object.keys(obj)) {
    if (!allowed.includes(key)) errors.push(`${at}: unknown key "${key}". Allowed: ${list(allowed)}`);
  }
}

function range(value: unknown, min: number, max: number, at: string, errors: string[]) {
  if (!isNum(value) || value < min || value > max) errors.push(`${at}: must be a number from ${min} to ${max}`);
}

function checkRadius(value: unknown, at: string, errors: string[]) {
  if (value === null) return;
  if (typeof value === "string" && DS_RADII.some((r) => r.id === value)) return;
  if (isNum(value) && value >= 0 && value <= DS_RADIUS_MAX) return;
  errors.push(`${at}: must be null, one of ${list(DS_RADII.map((r) => r.id))}, or pixels from 0 to ${DS_RADIUS_MAX}`);
}

function checkTheme(theme: Obj, errors: string[]) {
  unknownKeys(theme, THEME_KEYS, "theme", errors);

  if (theme.character !== undefined) {
    if (!isObj(theme.character)) errors.push("theme.character: must be an object");
    else {
      unknownKeys(theme.character, CHARACTER_KEYS, "theme.character", errors);
      for (const d of DS_CHARACTER_DIALS) {
        const v = theme.character[d.id];
        if (v !== undefined) range(v, d.min, d.max, `theme.character.${d.id}`, errors);
      }
      const { tastes, scoped } = theme.character;
      if (tastes !== undefined && (!Array.isArray(tastes) || tastes.length > 4 || tastes.some((t) => typeof t !== "string" || t.length > 40))) {
        errors.push("theme.character.tastes: a short list of style names");
      }
      if (scoped !== undefined && (!isObj(scoped) || Object.values(scoped).some((v) => typeof v !== "string" || v.length > 40))) {
        errors.push("theme.character.scoped: an object of short names");
      }
      if (theme.character.mood !== undefined) range(theme.character.mood, 0, 1, "theme.character.mood", errors);
    }
  }

  if (theme.colours !== undefined) {
    if (!isObj(theme.colours)) errors.push("theme.colours: must be an object");
    else {
      unknownKeys(theme.colours, COLOUR_KEYS, "theme.colours", errors);
      for (const key of COLOUR_KEYS) {
        const pick = theme.colours[key];
        if (pick === undefined) continue;
        const at = `theme.colours.${key}`;
        if (!isObj(pick)) {
          errors.push(`${at}: must be an object like { "light": "#FFFFFF", "dark": null }`);
          continue;
        }
        unknownKeys(pick, COLOUR_PICK_KEYS, at, errors);
        for (const mode of ["light", "dark"] as const) {
          // The accent's and the text's light pick may also be one of the known presets, which render differently from any hex.
          const presets = key === "accent" ? DS_ACCENT_COLOURS : key === "text" ? DS_BASE_COLOURS : [];
          const preset = mode === "light" && typeof pick.light === "string" && presets.some((c) => c.id === pick.light);
          if (pick[mode] !== undefined && pick[mode] !== null && !dsIsHex(pick[mode]) && !preset) {
            errors.push(`${at}.${mode}: must be null (Auto) or a hex colour like "#1A2B3C"${mode === "light" && presets.length ? ` or a preset (${list(presets.map((c) => c.id))})` : ""}`);
          }
        }
        for (const shift of ["lightShift", "darkShift"] as const) {
          if (pick[shift] !== undefined) range(pick[shift], -DS_SHIFT_MAX, DS_SHIFT_MAX, `${at}.${shift}`, errors);
        }
      }
    }
  }

  const customIds: string[] = [];
  if (theme.customFonts !== undefined) {
    if (!Array.isArray(theme.customFonts)) errors.push("theme.customFonts: must be a list");
    else {
      theme.customFonts.forEach((f: unknown, i: number) => {
        const at = `theme.customFonts[${i}]`;
        if (!isObj(f)) return void errors.push(`${at}: must be an object`);
        unknownKeys(f, CUSTOM_FONT_KEYS, at, errors);
        if (typeof f.id !== "string" || !DS_CUSTOM_FONT_ID_RE.test(f.id)) errors.push(`${at}.id: lowercase letters, digits and dashes, up to 41 characters`);
        else customIds.push(f.id);
        if (typeof f.label !== "string" || !f.label.trim() || !DS_FONT_LABEL_RE.test(f.label)) {
          errors.push(`${at}.label: the font's name, up to 60 letters, digits, spaces, hyphens, underscores, periods or apostrophes`);
        }
        // A name and its weights, never a link: a theme can't point the site at an address of its own.
        if (typeof f.google !== "string" || !DS_GOOGLE_FONT_RE.test(f.google) || !dsGoogleWeightsValid(f.google)) {
          errors.push(`${at}.google: a Google font by name, like "Fraunces:wght@400;700", weights from 1 to 1000. No links`);
        }
      });
    }
  }
  const fontIds = [...DS_FONTS.map((f) => f.id), ...customIds];

  const familyIds: string[] = [];
  if (theme.families !== undefined) {
    if (!Array.isArray(theme.families)) errors.push("theme.families: must be a list");
    else {
      theme.families.forEach((f: unknown, i: number) => {
        const at = `theme.families[${i}]`;
        if (!isObj(f)) return void errors.push(`${at}: must be an object`);
        unknownKeys(f, FAMILY_KEYS, at, errors);
        if (typeof f.id !== "string" || !/^[a-z][a-z0-9-]{0,40}$/.test(f.id)) errors.push(`${at}.id: lowercase letters, digits and dashes`);
        else familyIds.push(f.id);
        if (f.label !== undefined && (typeof f.label !== "string" || f.label.length > 40)) errors.push(`${at}.label: text of up to 40 characters`);
        if (typeof f.font !== "string" || !fontIds.includes(f.font)) {
          errors.push(`${at}.font: must be one of ${list(fontIds)}`);
        }
      });
    }
  }

  if (theme.type !== undefined) {
    if (!isObj(theme.type)) errors.push("theme.type: must be an object");
    else {
      unknownKeys(theme.type, DS_TEXT_STYLES, "theme.type", errors);
      for (const style of DS_TEXT_STYLES) {
        const s = theme.type[style];
        if (s === undefined) continue;
        const at = `theme.type.${style}`;
        if (!isObj(s)) {
          errors.push(`${at}: must be an object`);
          continue;
        }
        unknownKeys(s, STYLE_KEYS, at, errors);
        if (s.family !== undefined && theme.families !== undefined && (typeof s.family !== "string" || !familyIds.includes(s.family))) {
          errors.push(`${at}.family: must be one of the theme's families ${list(familyIds)}`);
        }
        if (s.label !== undefined && (typeof s.label !== "string" || s.label.length > 40)) errors.push(`${at}.label: text of up to 40 characters`);
        if (s.weight !== undefined) range(s.weight, 100, 900, `${at}.weight`, errors);
        if (s.size !== undefined) range(s.size, 10, 200, `${at}.size`, errors);
        if (s.lineHeight !== undefined) range(s.lineHeight, 10, 240, `${at}.lineHeight`, errors);
      }
    }
  }

  if (theme.hiddenFonts !== undefined && (!Array.isArray(theme.hiddenFonts) || theme.hiddenFonts.some((f: unknown) => typeof f !== "string"))) {
    errors.push("theme.hiddenFonts: must be a list of font ids");
  }
  if (theme.radius !== undefined) checkRadius(theme.radius, "theme.radius", errors);
  if (theme.pillRadius !== undefined) checkRadius(theme.pillRadius, "theme.pillRadius", errors);

  if (theme.buttons !== undefined && theme.buttons !== null) {
    if (!isObj(theme.buttons)) errors.push("theme.buttons: must be null or an object");
    else {
      unknownKeys(theme.buttons, BUTTON_KEYS, "theme.buttons", errors);
      const b = theme.buttons;
      if (b.fill !== undefined && !["solid", "gradient", "none"].includes(b.fill as string)) errors.push('theme.buttons.fill: must be "solid", "gradient" or "none"');
      if (b.contrast !== undefined) range(b.contrast, -1, 1, "theme.buttons.contrast", errors);
      if (b.outlineWidth !== undefined) range(b.outlineWidth, 1, DS_OUTLINE_MAX, "theme.buttons.outlineWidth", errors);
      if (b.outlineOpacity !== undefined) range(b.outlineOpacity, 0, 1, "theme.buttons.outlineOpacity", errors);
      if (b.shadowAngle !== undefined) range(b.shadowAngle, 0, 360, "theme.buttons.shadowAngle", errors);
      for (const k of ["outline", "shadow"] as const) {
        if (b[k] !== undefined && typeof b[k] !== "boolean") errors.push(`theme.buttons.${k}: must be true or false`);
      }
    }
  }

  if (theme.fields !== undefined) {
    if (!isObj(theme.fields)) errors.push("theme.fields: must be an object");
    else {
      unknownKeys(theme.fields, FIELD_KEYS, "theme.fields", errors);
      if (theme.fields.outline !== undefined && typeof theme.fields.outline !== "boolean") errors.push("theme.fields.outline: must be true or false");
      if (theme.fields.outlineWidth !== undefined) range(theme.fields.outlineWidth, 1, DS_OUTLINE_MAX, "theme.fields.outlineWidth", errors);
      if (theme.fields.outlineOpacity !== undefined) range(theme.fields.outlineOpacity, 0, 1, "theme.fields.outlineOpacity", errors);
    }
  }

  if (theme.nav !== undefined) {
    if (!isObj(theme.nav)) errors.push("theme.nav: must be an object");
    else {
      unknownKeys(theme.nav, NAV_KEYS, "theme.nav", errors);
      const style = theme.nav.style;
      if (style !== undefined && !DS_THEME_FILE_CONTRACT.navStyles.some((s) => s === style)) {
        errors.push(`theme.nav.style: must be one of ${list(DS_THEME_FILE_CONTRACT.navStyles)}`);
      }
      const surface = theme.nav.surface;
      if (surface !== undefined && !DS_THEME_FILE_CONTRACT.navSurfaces.some((s) => s === surface)) {
        errors.push(`theme.nav.surface: must be one of ${list(DS_THEME_FILE_CONTRACT.navSurfaces)}`);
      }
    }
  }

  // Composition, the brief and the social rules are read leniently (parseDsComposition, parseDsBrief,
  // parseDsSocial put anything unknown back to Parabola's own), so the file only has to give objects.
  for (const key of ["composition", "brief", "social"] as const) {
    if (theme[key] !== undefined && !isObj(theme[key])) errors.push(`theme.${key}: must be an object`);
  }

  if (theme.icons !== undefined && !DS_THEME_FILE_CONTRACT.icons.some((i) => i === theme.icons)) {
    errors.push(`theme.icons: must be one of ${list(DS_THEME_FILE_CONTRACT.icons)}`);
  }
}

/**
 * The file's colours in the shape the stored-theme reader takes as current. That reader falls back to
 * an older colour layout unless `theme` or `text` is present, which drops a partial file's colours
 * (only `accent`, only `surface`); empty picks keep those present and the rest at Auto.
 */
function withColourShape(theme: Obj): Obj {
  // Same for the character: without `warmth` the reader takes `colour` and `brightness` as an older
  // layout's saturation and value. A file always means the current dials.
  const character = isObj(theme.character) ? { warmth: DS_DEFAULT_CHARACTER.warmth, ...theme.character } : theme.character;
  const withCharacter = character === theme.character ? theme : { ...theme, character };
  if (!isObj(withCharacter.colours)) return withCharacter;
  return { ...withCharacter, colours: { theme: {}, text: {}, ...withCharacter.colours } };
}

/** A light colour pick: a hex or a known preset is kept as it is, anything else is Auto. */
function presetToHex(light: unknown, key: string): unknown {
  if (typeof light !== "string" || dsIsHex(light)) return light;
  // A preset stays a preset: it sets more than one colour (a hex would recolour buttons and derive other dark colours).
  const presets = key === "accent" ? DS_ACCENT_COLOURS : key === "text" ? DS_BASE_COLOURS : [];
  return presets.some((c) => c.id === light) ? light : null;
}

/**
 * Reads a theme file (its text, or the value already parsed). Strict: the
 * first wrong thing isn't the only one reported, and unknown keys fail rather
 * than vanish. On success `theme` is the cleaned, complete theme.
 */
export function dsThemeFileParse(input: unknown): DsThemeFileResult {
  let value = input;
  if (typeof input === "string") {
    if (input.length > DS_THEME_FILE_MAX_BYTES) return { ok: false, errors: ["The file is too big to be a theme"] };
    try {
      value = JSON.parse(input);
    } catch {
      return { ok: false, errors: ["The file isn't valid JSON"] };
    }
  }
  if (!isObj(value)) return { ok: false, errors: ["The file must be a JSON object"] };

  const errors: string[] = [];
  unknownKeys(value, FILE_KEYS, "file", errors);
  if (value.format !== DS_THEME_FILE_FORMAT && !DS_THEME_FILE_LEGACY_FORMATS.includes(value.format as string)) errors.push(`format: must be "${DS_THEME_FILE_FORMAT}"`);
  if (value.version !== DS_THEME_FILE_VERSION) errors.push(`version: must be ${DS_THEME_FILE_VERSION}`);
  if (typeof value.name !== "string" || !value.name.trim() || value.name.length > 60) errors.push("name: a name of 1 to 60 characters");
  if (value.description !== undefined && (typeof value.description !== "string" || value.description.length > 300)) {
    errors.push("description: text of up to 300 characters");
  }
  if (!isObj(value.theme)) errors.push("theme: must be an object (it may be empty to keep Parabola's defaults)");
  else checkTheme(value.theme, errors);
  if (errors.length) return { ok: false, errors };

  return {
    ok: true,
    name: (value.name as string).trim(),
    description: typeof value.description === "string" ? value.description.trim() : "",
    theme: parseDsThemeConfig(withColourShape(value.theme as Obj)),
  };
}

function withHexColours(theme: DsThemeConfig): DsThemeConfig {
  const colours = Object.fromEntries(
    Object.entries(theme.colours).map(([key, pick]) => [key, { ...pick, light: presetToHex(pick.light, key) }]),
  ) as unknown as DsThemeColours;
  return { ...theme, colours };
}

/** A theme as a file, to save as `<name>.theme.json`. It reads back to the same theme. */
export function dsThemeToFile(theme: DsThemeConfig, name: string, description = "") {
  return {
    format: DS_THEME_FILE_FORMAT,
    version: DS_THEME_FILE_VERSION,
    // The file refuses more than a name of 60 and a description of 300, so a longer one is cut here.
    name: name.trim().slice(0, 60) || "Theme",
    ...(description && { description: description.slice(0, 300) }),
    theme: withHexColours(JSON.parse(JSON.stringify(theme)) as DsThemeConfig),
  };
}

/** The file's text, ready to save. */
export const dsThemeFileText = (theme: DsThemeConfig, name: string, description = "") =>
  `${JSON.stringify(dsThemeToFile(theme, name, description), null, 2)}\n`;

/** The file name for a theme: `my-theme.theme.json`. */
export const dsThemeFileName = (name: string) =>
  `${name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "") || "theme"}${DS_THEME_FILE_SUFFIX}`;
