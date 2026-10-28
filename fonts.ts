/**
 * Parabola's fonts: the faces a theme's two families can be (theme.ts). Each
 * is a CSS font stack; a Google font also says how to load it. An app that
 * hosts the files itself (the CMS, through next/font) sets `--ds-font-<id>`
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

/** The primary family's default face: tokens.css sets `--ds-family-primary` to its stack (`npm run check:parabola` checks). */
export const DS_DEFAULT_FONT = "instrument-sans";
/** The display family's default face, for a pairing (`--ds-family-display`). */
export const DS_DEFAULT_DISPLAY_FONT = "instrument-serif";

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

/** The weights a Google Fonts family value asks for: `wght@400;500`, a range `wght@400..700`, or none (Regular). */
export function dsGoogleWeights(google: string): number[] {
  const spec = google.split(":")[1] ?? "";
  const values = spec.includes("@") ? spec.split("@")[1] : "";
  if (!/wght/.test(spec) || !values) return [400];
  const weights = new Set<number>();
  for (const part of values.split(";")) {
    // `ital,wght@0,400;1,400`: the weight is the last number.
    const value = part.split(",").pop() ?? "";
    const [from, to] = value.split("..").map(Number);
    if (Number.isFinite(from) && Number.isFinite(to)) {
      for (let w = Math.ceil(from / 100) * 100; w <= to; w += 100) weights.add(w);
    } else if (Number.isFinite(from)) {
      weights.add(from);
    }
  }
  return weights.size > 0 ? [...weights].sort((a, b) => a - b) : [400];
}

export function dsFont(id: string | undefined): DsFont {
  return DS_FONTS.find((f) => f.id === id) ?? DS_FONTS.find((f) => f.id === DS_DEFAULT_FONT)!;
}

/** A theme's added font as a DsFont: its name first, then the system face; the weights its link asked for. */
export function dsCustomFont(font: DsCustomFont): DsFont {
  return {
    id: font.id,
    label: font.label,
    family: `"${font.label}", ${SYSTEM_STACK}`,
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
  if (!label) return null;
  return { id: label.toLowerCase().replace(/[^a-z0-9]+/g, "-"), label, google: google.replace(/ /g, "+") };
}

/** One Google Fonts stylesheet for these fonts, or null when none of them is a Google font. */
export function dsGoogleFontsUrl(fonts: DsFont[]): string | null {
  const families = [...new Map(fonts.filter((f) => f.google).map((f) => [f.id, `family=${f.google}`])).values()];
  return families.length > 0 ? `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap` : null;
}
