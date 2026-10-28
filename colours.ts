/**
 * The colours a theme can pick (theme.ts; decisions, 2026-10-28), as shadcn
 * offers them:
 *
 * - a **base colour**: the greys every surface, border and quiet text is
 *   drawn in, light and dark. Stone is Parabola's own and what tokens.css
 *   sets (`npm run check:parabola` checks); Neutral, Zinc, Slate and Gray
 *   follow Tailwind's palettes, mapped onto the same roles.
 * - an **accent colour**: Parabola's one highlight, for the few things that
 *   need attention (a highlight pill), and its tint. Purple is Parabola's own.
 * - a **background colour**: the website's background, by default the base
 *   colour's own (white, charcoal); any colour, a bright yellow included.
 *   Picked, it brings the rest along (`dsBackgroundTokens`): the surfaces on
 *   it (cards, fields, side panels, borders) as shades of itself, and text
 *   in black or white, whichever reads on it.
 * - a **surface colour**, optional: cards, side panels and fields, by default
 *   shades of the background.
 *
 * Every colour is picked once, for the light theme; the dark theme uses its
 * counterpart (`dsCounterpart`), the same hue at the other end of light, so
 * the two always contrast.
 *
 * Each of the three is a preset or a custom colour, a hex: a custom base or
 * accent derives its other shades from it (`dsBaseTokens`, `dsAccentTokens`).
 * Pure data and functions, so the server and the browser share them.
 */

/** The base colour's tokens, by theme. Black and white text and the page stay as they are. */
export type DsBaseTokens = {
  bg: string;
  "fg-muted": string;
  "fg-subtle": string;
  border: string;
  "surface-subtle": string;
  field: string;
  surface: string;
  "surface-inverse": string;
};

export type DsBaseColour = { id: string; label: string; swatch: string; light: DsBaseTokens; dark: DsBaseTokens };

const darkInverse = "rgb(255 255 255 / 0.8)";

export const DS_BASE_COLOURS: DsBaseColour[] = [
  {
    id: "stone",
    label: "Stone",
    swatch: "#78716C",
    light: {
      bg: "#FFFFFF",
      "fg-muted": "#595959",
      "fg-subtle": "#78716C",
      border: "#D6D3D1",
      "surface-subtle": "#FAFAF9",
      field: "#F7F5F2",
      surface: "#E2DFD9",
      "surface-inverse": "rgb(48 46 44 / 0.7)",
    },
    dark: {
      bg: "#121110",
      "fg-muted": "#A0A0A0",
      "fg-subtle": "#A8A29E",
      border: "#44403C",
      "surface-subtle": "#1A1918",
      field: "#211F1E",
      surface: "#302E2C",
      "surface-inverse": darkInverse,
    },
  },
  {
    id: "neutral",
    label: "Neutral",
    swatch: "#737373",
    light: {
      bg: "#FFFFFF",
      "fg-muted": "#525252",
      "fg-subtle": "#737373",
      border: "#D4D4D4",
      "surface-subtle": "#FAFAFA",
      field: "#F5F5F5",
      surface: "#E5E5E5",
      "surface-inverse": "rgb(38 38 38 / 0.7)",
    },
    dark: {
      bg: "#0A0A0A",
      "fg-muted": "#A3A3A3",
      "fg-subtle": "#A3A3A3",
      border: "#404040",
      "surface-subtle": "#171717",
      field: "#1C1C1C",
      surface: "#262626",
      "surface-inverse": darkInverse,
    },
  },
  {
    id: "zinc",
    label: "Zinc",
    swatch: "#71717A",
    light: {
      bg: "#FFFFFF",
      "fg-muted": "#52525B",
      "fg-subtle": "#71717A",
      border: "#D4D4D8",
      "surface-subtle": "#FAFAFA",
      field: "#F4F4F5",
      surface: "#E4E4E7",
      "surface-inverse": "rgb(39 39 42 / 0.7)",
    },
    dark: {
      bg: "#09090B",
      "fg-muted": "#A1A1AA",
      "fg-subtle": "#A1A1AA",
      border: "#3F3F46",
      "surface-subtle": "#18181B",
      field: "#1F1F23",
      surface: "#27272A",
      "surface-inverse": darkInverse,
    },
  },
  {
    id: "slate",
    label: "Slate",
    swatch: "#64748B",
    light: {
      bg: "#FFFFFF",
      "fg-muted": "#475569",
      "fg-subtle": "#64748B",
      border: "#CBD5E1",
      "surface-subtle": "#F8FAFC",
      field: "#F1F5F9",
      surface: "#E2E8F0",
      "surface-inverse": "rgb(30 41 59 / 0.7)",
    },
    dark: {
      bg: "#020617",
      "fg-muted": "#94A3B8",
      "fg-subtle": "#94A3B8",
      border: "#334155",
      "surface-subtle": "#0F172A",
      field: "#131C31",
      surface: "#1E293B",
      "surface-inverse": darkInverse,
    },
  },
  {
    id: "gray",
    label: "Gray",
    swatch: "#6B7280",
    light: {
      bg: "#FFFFFF",
      "fg-muted": "#4B5563",
      "fg-subtle": "#6B7280",
      border: "#D1D5DB",
      "surface-subtle": "#F9FAFB",
      field: "#F3F4F6",
      surface: "#E5E7EB",
      "surface-inverse": "rgb(31 41 55 / 0.7)",
    },
    dark: {
      bg: "#030712",
      "fg-muted": "#9CA3AF",
      "fg-subtle": "#9CA3AF",
      border: "#374151",
      "surface-subtle": "#111827",
      field: "#161D2B",
      surface: "#1F2937",
      "surface-inverse": darkInverse,
    },
  },
];

/** The highlight and its tint, by theme. */
export type DsAccentColour = {
  id: string;
  label: string;
  light: { highlight: string; tint: string };
  dark: { highlight: string; tint: string };
};

/** Tailwind's 700 and 100 in light, 300 and 900 in dark. */
export const DS_ACCENT_COLOURS: DsAccentColour[] = [
  { id: "purple", label: "Purple", light: { highlight: "#7E22CE", tint: "#F3E8FF" }, dark: { highlight: "#D8B4FE", tint: "#581C87" } },
  { id: "blue", label: "Blue", light: { highlight: "#1D4ED8", tint: "#DBEAFE" }, dark: { highlight: "#93C5FD", tint: "#1E3A8A" } },
  { id: "teal", label: "Teal", light: { highlight: "#0F766E", tint: "#CCFBF1" }, dark: { highlight: "#5EEAD4", tint: "#134E4A" } },
  { id: "green", label: "Green", light: { highlight: "#15803D", tint: "#DCFCE7" }, dark: { highlight: "#86EFAC", tint: "#14532D" } },
  { id: "orange", label: "Orange", light: { highlight: "#C2410C", tint: "#FFEDD5" }, dark: { highlight: "#FDBA74", tint: "#7C2D12" } },
  { id: "rose", label: "Rose", light: { highlight: "#BE123C", tint: "#FFE4E6" }, dark: { highlight: "#FDA4AF", tint: "#881337" } },
];

/**
 * Backgrounds and surfaces to try: soft ones, a few bold mid-tones and two
 * deep ones. Each is the light theme's; the dark theme uses its counterpart
 * (`dsCounterpart`), so one pick covers both.
 */
export const DS_BACKGROUND_PRESETS: { label: string; value: string }[] = [
  { label: "Paper", value: "#F6F2EA" },
  { label: "Sand", value: "#ECE3D0" },
  { label: "Mint", value: "#DCF2E3" },
  { label: "Sky", value: "#DCEAF8" },
  { label: "Yellow", value: "#FFE35A" },
  { label: "Coral", value: "#FF9A7A" },
  { label: "Ink", value: "#1B2A44" },
  { label: "Forest", value: "#1F3A2C" },
];

export const DS_DEFAULT_BASE_COLOUR = "stone";
export const DS_DEFAULT_ACCENT_COLOUR = "purple";

export const dsBaseColour = (id: string) => DS_BASE_COLOURS.find((c) => c.id === id) ?? DS_BASE_COLOURS[0];
export const dsAccentColour = (id: string) => DS_ACCENT_COLOURS.find((c) => c.id === id) ?? DS_ACCENT_COLOURS[0];

// ---------------------------------------------------------------------------
// Custom colours: hex in, shades out.

/** A colour typed or picked: `#RRGGBB`. */
export const dsIsHex = (value: unknown): value is string => typeof value === "string" && /^#[0-9a-fA-F]{6}$/.test(value);

/** `#abc`, `abc123`, ` #ABC123 ` → `#ABC123`, or null. */
export function dsNormalizeHex(value: string): string | null {
  let v = value.trim().replace(/^#/, "");
  if (/^[0-9a-fA-F]{3}$/.test(v)) v = v.split("").map((c) => c + c).join("");
  return /^[0-9a-fA-F]{6}$/.test(v) ? `#${v.toUpperCase()}` : null;
}

type Rgb = [number, number, number];
const toRgb = (hex: string): Rgb => [1, 3, 5].map((i) => parseInt(hex.slice(i, i + 2), 16)) as Rgb;
const toHex = (rgb: Rgb) => `#${rgb.map((c) => Math.round(Math.min(255, Math.max(0, c))).toString(16).padStart(2, "0")).join("").toUpperCase()}`;

/** `a` mixed into `b`: `amount` of `a`, the rest `b`. */
export function dsMix(a: string, b: string, amount: number): string {
  const [x, y] = [toRgb(a), toRgb(b)];
  return toHex([0, 1, 2].map((i) => x[i] * amount + y[i] * (1 - amount)) as Rgb);
}

/** Hue (0–360), saturation and value (0–1), for the colour picker. */
export function dsHexToHsv(hex: string): { h: number; s: number; v: number } {
  const [r, g, b] = toRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const d = max - Math.min(r, g, b);
  let h = 0;
  if (d) h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return { h: (h * 60 + 360) % 360, s: max ? d / max : 0, v: max };
}

export function dsHsvToHex(h: number, s: number, v: number): string {
  const f = (n: number) => {
    const k = (n + h / 60) % 6;
    return v - v * s * Math.max(0, Math.min(k, 4 - k, 1));
  };
  return toHex([f(5) * 255, f(3) * 255, f(1) * 255]);
}

const WHITE = "#FFFFFF";
const BLACK = "#000000";

/** The base colour's tokens in a theme: a preset's, or shades of a custom hex (it plays the preset's swatch, fg-subtle). */
export function dsBaseTokens(base: string, mode: "light" | "dark"): DsBaseTokens {
  if (!dsIsHex(base)) return dsBaseColour(base)[mode];
  const [r, g, b] = toRgb(dsMix(base, BLACK, 0.2));
  return mode === "light"
    ? {
        bg: WHITE,
        "fg-muted": dsMix(base, BLACK, 0.7),
        "fg-subtle": base,
        border: dsMix(base, WHITE, 0.32),
        "surface-subtle": dsMix(base, WHITE, 0.035),
        field: dsMix(base, WHITE, 0.07),
        surface: dsMix(base, WHITE, 0.2),
        "surface-inverse": `rgb(${r} ${g} ${b} / 0.7)`,
      }
    : {
        bg: dsMix(base, BLACK, 0.12),
        "fg-muted": dsMix(base, WHITE, 0.45),
        "fg-subtle": dsMix(base, WHITE, 0.7),
        border: dsMix(base, BLACK, 0.45),
        "surface-subtle": dsMix(base, BLACK, 0.16),
        field: dsMix(base, BLACK, 0.2),
        surface: dsMix(base, BLACK, 0.3),
        "surface-inverse": "rgb(255 255 255 / 0.8)",
      };
}

/** The accent's highlight and tint in a theme: a preset's, or shades of a custom hex. */
export function dsAccentTokens(accent: string, mode: "light" | "dark"): { highlight: string; tint: string } {
  if (!dsIsHex(accent)) return dsAccentColour(accent)[mode];
  return mode === "light"
    ? { highlight: accent, tint: dsMix(accent, WHITE, 0.14) }
    : { highlight: dsMix(accent, WHITE, 0.55), tint: dsMix(accent, BLACK, 0.4) };
}

/** How light a colour is, 0 (black) to 1 (white): relative luminance. */
export function dsLuminance(hex: string): number {
  const [r, g, b] = toRgb(hex).map((c) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

// Hue, saturation and lightness (0–1), for counterparts.
function toHsl(hex: string): [number, number, number] {
  const [r, g, b] = toRgb(hex).map((c) => c / 255);
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;
  const d = max - min;
  if (!d) return [0, 0, l];
  const s = d / (1 - Math.abs(2 * l - 1));
  const h = max === r ? ((g - b) / d) % 6 : max === g ? (b - r) / d + 2 : (r - g) / d + 4;
  return [(h * 60 + 360) % 360, s, l];
}

function fromHsl(h: number, s: number, l: number): string {
  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;
  const [r, g, b] = h < 60 ? [c, x, 0] : h < 120 ? [x, c, 0] : h < 180 ? [0, c, x] : h < 240 ? [0, x, c] : h < 300 ? [x, 0, c] : [c, 0, x];
  return toHex([(r + m) * 255, (g + m) * 255, (b + m) * 255]);
}

/**
 * A colour's counterpart for the other theme: the same hue at the other end
 * of light, so whatever contrasted with it still does. A light colour gets a
 * deep one (lightness 6–24%), a dark colour a pale one (88–97%), its
 * saturation softened a little so a bright pick doesn't glow in the dark.
 */
export function dsCounterpart(hex: string): string {
  const [h, s, l] = toHsl(hex);
  const flipped = 1 - l;
  return l >= 0.5
    ? fromHsl(h, s * 0.75, Math.min(0.24, Math.max(0.06, flipped)))
    : fromHsl(h, s * 0.75, Math.min(0.97, Math.max(0.88, flipped)));
}

/**
 * The page and what sits on it, from a background (and, optionally, a
 * surface) picked for the light theme; the dark theme uses their
 * counterparts. Text is black or white, whichever reads on the background,
 * with its quieter steps mixed toward it; the surfaces (cards, fields, side
 * panels) are the surface colour or shades of the background, darker on a
 * light one and lighter on a dark one; borders are a deeper shade.
 * `background` null keeps the base colour's own page (`baseBg`).
 */
export function dsBackgroundTokens({
  background,
  surface,
  baseBg,
  mode,
}: {
  background: string | null;
  surface: string | null;
  baseBg: string;
  mode: "light" | "dark";
}): Record<string, string> {
  const inMode = (hex: string) => (mode === "light" ? hex : dsCounterpart(hex));
  const bg = background ? inMode(background) : baseBg;
  const toward = dsLuminance(bg) > 0.18 ? BLACK : WHITE;
  const shade = (from: string, amount: number) => dsMix(toward, from, amount);
  const card = surface ? inMode(surface) : shade(bg, 0.035);
  const tokens: Record<string, string> = {
    bg,
    "surface-subtle": card,
    field: shade(card, 0.03),
    surface: shade(card, 0.11),
    border: shade(bg, 0.2),
  };
  // Text follows the background only when one is picked; the base's own page keeps the base's text.
  if (background) {
    tokens.fg = toward;
    tokens["fg-muted"] = dsMix(toward, bg, 0.7);
    tokens["fg-subtle"] = dsMix(toward, bg, 0.52);
  }
  return tokens;
}

/** The swatch a colour choice shows: a preset's own, or the hex itself. */
export function dsColourSwatch(kind: "base" | "accent", value: string, mode: "light" | "dark" = "light"): string {
  if (dsIsHex(value)) return value;
  return kind === "base" ? dsBaseColour(value).swatch : dsAccentColour(value)[mode].highlight;
}

/**
 * Icon libraries a theme could use, as shadcn offers them. Only Lucide works
 * today: Parabola's components import Lucide directly, so the others wait for
 * icons to go through one Parabola component.
 */
export const DS_ICON_LIBRARIES = [
  { id: "lucide", label: "Lucide", ready: true },
  { id: "tabler", label: "Tabler", ready: false },
  { id: "hugeicons", label: "Hugeicons", ready: false },
  { id: "phosphor", label: "Phosphor", ready: false },
  { id: "remix", label: "Remix", ready: false },
] as const;
