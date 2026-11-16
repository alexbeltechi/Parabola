/**
 * Parabola's fonts: the faces a theme's two families can be (theme.ts). Each
 * is a CSS font stack; a Google font also says how to load it. An app that
 * hosts the files itself (Darmio does, through next/font) sets `--ds-font-<id>`
 * to its own family name, which each stack tries first; anything else loads
 * them from Google.
 *
 * A theme can add more (`customFonts`): any Google font, by its name or a
 * link to it (`dsCustomFontFromInput`), loaded from Google where it's used.
 * Adding one to this list instead makes it every theme's (and, in an app that
 * hosts its fonts, needs its next/font call). Pure data and functions, so the
 * server and the browser share it.
 */

export type DsFont = {
  id: string;
  label: string;
  /** The CSS font-family stack, its own name first, the system face last. */
  family: string;
  /** The weights it has, lightest first (400 alone for a face with one). */
  weights: number[];
  /** The `family=` value for Google Fonts' css2 API, when it's a Google font. */
  google?: string;
  /** Added to a theme, not one of Parabola's. */
  custom?: boolean;
};

/** A font a theme added: a Google font. */
export type DsCustomFont = { id: string; label: string; google: string };

const SYSTEM_STACK = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const DS_FONTS: DsFont[] = [
  {
    id: "instrument-sans",
    label: "Instrument Sans",
    family: `var(--ds-font-instrument-sans, "Instrument Sans"), ${SYSTEM_STACK}`,
    weights: [400, 500, 600, 700],
    google: "Instrument+Sans:wght@400..700",
  },
  {
    id: "instrument-serif",
    label: "Instrument Serif",
    family: `var(--ds-font-instrument-serif, "Instrument Serif"), Georgia, serif`,
    // One weight only: anything heavier would be faked.
    weights: [400],
    google: "Instrument+Serif",
  },
  { id: "system", label: "System", family: SYSTEM_STACK, weights: [300, 400, 500, 600, 700] },
];

/** The Font family's default face: tokens.css sets `--ds-family-body` to its stack (`npm run check` checks). */
export const DS_DEFAULT_FONT = "instrument-sans";
/** The Heading family's default face, for headlines (`--ds-family-heading`). */
export const DS_DEFAULT_HEADING_FONT = "instrument-serif";

/** What each weight is called. */
export const DS_WEIGHT_NAMES: Record<number, string> = {
  100: "Thin",
  200: "Extra light",
  300: "Light",
  400: "Regular",
  500: "Medium",
  600: "Semibold",
  700: "Bold",
  800: "Extra bold",
  900: "Black",
};

export const dsWeightName = (weight: number) => DS_WEIGHT_NAMES[weight] ?? String(weight);

/** The weight a font has that's closest to the one asked for (the lighter on a tie), so nothing is faked. */
export function dsNearestWeight(font: DsFont, weight: number): number {
  return font.weights.reduce((best, w) => (Math.abs(w - weight) < Math.abs(best - weight) ? w : best), font.weights[0] ?? 400);
}

/** The heaviest weight Google Fonts has. */
export const DS_GOOGLE_WEIGHT_MAX = 1000;

/** The weights a Google Fonts family value asks for: `wght@400;500`, a range `wght@400..700`, or none (Regular). */
export function dsGoogleWeights(google: string): number[] {
  const spec = google.split(":")[1] ?? "";
  const values = spec.includes("@") ? spec.split("@")[1] : "";
  if (!/wght/.test(spec) || !values) return [400];
  // Google's weights run 1 to 1000; stored data from any path may say more, so every number is clamped
  // and a range is walked in a bounded number of steps.
  const clampW = (n: number) => Math.min(DS_GOOGLE_WEIGHT_MAX, Math.max(1, Math.round(n)));
  const weights = new Set<number>();
  for (const part of values.split(";").slice(0, 40)) {
    // `ital,wght@0,400;1,400`: the weight is the last number.
    const value = part.split(",").pop() ?? "";
    const [from, to] = value.split("..").map(Number);
    if (Number.isFinite(from) && Number.isFinite(to)) {
      const end = clampW(to);
      for (let w = Math.ceil(clampW(from) / 100) * 100, steps = 0; w <= end && steps < 12; w += 100, steps += 1) weights.add(w);
    } else if (Number.isFinite(from)) {
      weights.add(clampW(from));
    }
  }
  return weights.size > 0 ? [...weights].sort((a, b) => a - b) : [400];
}

export function dsFont(id: string | undefined): DsFont {
  return DS_FONTS.find((f) => f.id === id) ?? DS_FONTS.find((f) => f.id === DS_DEFAULT_FONT)!;
}

/** What a font's name may hold: letters (accented too), digits, space, hyphen, underscore, period, apostrophe. It ends up inside CSS on every page. */
export const DS_FONT_LABEL_RE = /^[\p{L}\p{N} ._'-]{1,60}$/u;
/** A font name safe for the CSS font stack: anything outside the allowed characters is dropped. */
export const dsSafeFontLabel = (label: string): string =>
  label.replace(/[^\p{L}\p{N} ._'-]/gu, "").trim().slice(0, 60) || "Font";
/** A Google font's name and weights as the link carries them: no quotes, brackets or slashes. */
export const DS_GOOGLE_FONT_RE = /^[A-Za-z0-9+]+(:[A-Za-z0-9,;@.:+-]*)?$/;
/** A custom font's id. */
export const DS_CUSTOM_FONT_ID_RE = /^[a-z0-9][a-z0-9-]{0,40}$/;

/**
 * Whether a Google font value's axes are sound: `wght` values are whole numbers from 1 to 1000 (a range is low..high),
 * `ital` is 0 or 1, other axes are left as the link regex allows. The family part is DS_GOOGLE_FONT_RE's.
 */
export function dsGoogleWeightsValid(google: string): boolean {
  const spec = google.split(":")[1];
  if (!spec || !spec.includes("@")) return true;
  const [axisList, values] = spec.split("@");
  const axes = axisList.split(",");
  if (!values) return true;
  return values.split(";").every((tuple) =>
    tuple.split(",").every((value, i) => {
      if (axes[i] === "ital") return value === "0" || value === "1";
      if (axes[i] !== "wght") return true;
      const range = value.split("..");
      if (range.length > 2) return false;
      const nums = range.map((n) => (/^\d{1,4}$/.test(n) ? Number(n) : NaN));
      return nums.every((n) => n >= 1 && n <= DS_GOOGLE_WEIGHT_MAX) && (nums.length < 2 || nums[0] <= nums[1]);
    }),
  );
}

/** A theme's added font as a DsFont: its name first, then the system face; the weights its link asked for. */
export function dsCustomFont(font: DsCustomFont): DsFont {
  return {
    id: font.id,
    label: font.label,
    // The name sits inside quotes in CSS: only safe characters, so it can't close them or the <style>.
    family: `"${dsSafeFontLabel(font.label)}", ${SYSTEM_STACK}`,
    weights: dsGoogleWeights(font.google),
    google: font.google,
    custom: true,
  };
}

/**
 * A Google font from what someone typed: its name ("Space Grotesk"), its
 * page (fonts.google.com/specimen/Space+Grotesk), a share link with the
 * weights picked there (fonts.google.com/share?selection.family=…) or its
 * stylesheet link (fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500).
 * Links that name weights keep them; a name or a page gives Regular only.
 * Null when there's no name in it.
 */
export function dsCustomFontFromInput(input: string): DsCustomFont | null {
  const text = input.trim();
  if (!text) return null;
  let google: string | null = null;
  try {
    const url = new URL(text);
    if (url.hostname === "fonts.googleapis.com") {
      google = url.searchParams.get("family");
    } else if (url.hostname === "fonts.google.com") {
      // A share link names its families and weights, `|` between families: the first.
      const shared = url.searchParams.get("selection.family")?.split("|")[0];
      const name = url.pathname.match(/\/specimen\/([^/]+)/)?.[1];
      google = shared ?? (name ? decodeURIComponent(name).replace(/\s+/g, "+") : null);
    }
  } catch {
    // Not a link: a name.
    if (/^[A-Za-z0-9 ]{2,60}$/.test(text)) google = text.replace(/\s+/g, "+");
  }
  if (!google) return null;
  const label = google.split(":")[0].replace(/\+/g, " ").trim();
  const safeGoogle = google.replace(/ /g, "+");
  if (!label || !DS_FONT_LABEL_RE.test(label) || !DS_GOOGLE_FONT_RE.test(safeGoogle) || !dsGoogleWeightsValid(safeGoogle)) return null;
  const id = label.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 40).replace(/-+$/, "");
  return id ? { id, label, google: safeGoogle } : null;
}

/** A Google font's page on fonts.google.com, to check it's the one meant; null for System. */
export function dsGoogleFontsPage(font: DsFont): string | null {
  if (!font.google) return null;
  return `https://fonts.google.com/specimen/${font.google.split(":")[0]}`;
}

/** One Google Fonts stylesheet for these fonts, or null when none of them is a Google font. */
export function dsGoogleFontsUrl(fonts: DsFont[]): string | null {
  const families = [...new Map(fonts.filter((f) => f.google).map((f) => [f.id, `family=${f.google}`])).values()];
  return families.length > 0 ? `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap` : null;
}
