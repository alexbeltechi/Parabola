/**
 * Parabola's fonts: the faces a theme can pick for its text and its headings
 * (theme.ts). Each is a CSS font stack; a Google font also says how to load
 * it. An app that hosts the files itself (the CMS, through next/font) sets
 * `--ds-font-<id>` to its own family name, which each stack tries first;
 * anything else loads them from Google with `dsGoogleFontsUrl`.
 *
 * Adding a font is one entry here (and, in an app that hosts its fonts, one
 * next/font call). Pure data, so the server and the browser share it.
 */

export type DsFont = {
  id: string;
  label: string;
  /** The CSS font-family stack, its own name first, the system face last. */
  family: string;
  /** Headings in it read best at this weight; Parabola's type is otherwise Medium (500). */
  headingWeight: number;
  /** The `family=` value for Google Fonts' css2 API, when it's a Google font. */
  google?: string;
};

const SYSTEM_STACK = 'system-ui, -apple-system, "Segoe UI", sans-serif';

export const DS_FONTS = [
  {
    id: "instrument-sans",
    label: "Instrument Sans",
    family: `var(--ds-font-instrument-sans, "Instrument Sans"), ${SYSTEM_STACK}`,
    headingWeight: 500,
    google: "Instrument+Sans:wght@400..700",
  },
  {
    id: "instrument-serif",
    label: "Instrument Serif",
    family: `var(--ds-font-instrument-serif, "Instrument Serif"), Georgia, serif`,
    // One weight only: a Medium would be faked, so headings stay Regular.
    headingWeight: 400,
    google: "Instrument+Serif",
  },
  {
    id: "system",
    label: "System",
    family: SYSTEM_STACK,
    headingWeight: 500,
  },
] as const satisfies readonly DsFont[];

export type DsFontId = (typeof DS_FONTS)[number]["id"];

/** The default face: tokens.css sets `--ds-font` to its stack (`npm run check:parabola` checks). */
export const DS_DEFAULT_FONT: DsFontId = "instrument-sans";

export function dsFont(id: string | undefined): DsFont {
  return DS_FONTS.find((f) => f.id === id) ?? DS_FONTS.find((f) => f.id === DS_DEFAULT_FONT)!;
}

/** One Google Fonts stylesheet for these fonts, or null when none of them is a Google font. */
export function dsGoogleFontsUrl(ids: string[]): string | null {
  const families = [...new Set(ids)]
    .map((id) => dsFont(id))
    .flatMap((font) => (font.google ? [`family=${font.google}`] : []));
  return families.length > 0 ? `https://fonts.googleapis.com/css2?${families.join("&")}&display=swap` : null;
}
