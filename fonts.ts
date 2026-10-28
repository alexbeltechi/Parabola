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
  /** The weight Parabola's type is set at in this face: 500 (Medium), or 400 for a face with one weight. */
  weight: number;
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
    weight: 500,
    google: "Instrument+Sans:wght@400..700",
  },
  {
    id: "instrument-serif",
    label: "Instrument Serif",
    family: `var(--ds-font-instrument-serif, "Instrument Serif"), Georgia, serif`,
    // One weight only: a Medium would be faked, so it's set Regular.
    weight: 400,
    google: "Instrument+Serif",
  },
  { id: "system", label: "System", family: SYSTEM_STACK, weight: 500 },
];

/** The primary family's default face: tokens.css sets `--ds-font-primary` to its stack (`npm run check:parabola` checks). */
export const DS_DEFAULT_FONT = "instrument-sans";
/** The secondary family's default face, for a pairing (`--ds-font-secondary`). */
export const DS_DEFAULT_SECONDARY_FONT = "instrument-serif";

export function dsFont(id: string | undefined): DsFont {
  return DS_FONTS.find((f) => f.id === id) ?? DS_FONTS.find((f) => f.id === DS_DEFAULT_FONT)!;
}

/** A theme's added font as a DsFont: its name first, then the system face. */
export function dsCustomFont(font: DsCustomFont): DsFont {
  // A weight range or a 500 among its weights means it has a Medium; otherwise Regular.
  const weights = font.google.split(":wght@")[1] ?? "";
  const hasMedium = /\.\./.test(weights) || /(^|;)500(;|$)/.test(weights);
  return {
    id: font.id,
    label: font.label,
    family: `"${font.label}", ${SYSTEM_STACK}`,
    weight: hasMedium ? 500 : 400,
    google: font.google,
    custom: true,
  };
}

/**
 * A Google font from what someone typed: its name ("Space Grotesk"), its
 * page (fonts.google.com/specimen/Space+Grotesk) or its stylesheet link
 * (fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500, which keeps
 * the weights it asks for). Null when there's no name in it.
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
      const name = url.pathname.match(/\/specimen\/([^/]+)/)?.[1];
      google = name ? decodeURIComponent(name).replace(/\s+/g, "+") : null;
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
