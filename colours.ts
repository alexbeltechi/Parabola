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
 * - a **background colour**: the page itself, set apart for light and dark,
 *   by default the base colour's own (white, charcoal); any colour, a bright
 *   yellow included, to see what the rest does on it.
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

/** Backgrounds to try, by theme: soft, and a few bold mid-tones. "Base" (null) is the base colour's own. */
export const DS_BACKGROUND_PRESETS: Record<"light" | "dark", { label: string; value: string }[]> = {
  light: [
    { label: "Paper", value: "#F6F2EA" },
    { label: "Sand", value: "#ECE3D0" },
    { label: "Mint", value: "#DCF2E3" },
    { label: "Sky", value: "#DCEAF8" },
    { label: "Yellow", value: "#FFE35A" },
    { label: "Coral", value: "#FF9A7A" },
  ],
  dark: [
    { label: "Charcoal", value: "#1E1E1E" },
    { label: "Ink", value: "#0F1B2D" },
    { label: "Forest", value: "#11261C" },
    { label: "Plum", value: "#2A1630" },
    { label: "Olive", value: "#3D3D18" },
    { label: "Rust", value: "#5A2414" },
  ],
};

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
