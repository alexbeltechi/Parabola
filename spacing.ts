/**
 * Parabola spacing as numbers (px), for layouts that do arithmetic with it
 * (justified rows, column widths). Each is named by its size; the values and
 * what each is for live in tokens.css (`--ds-space-*`, utilities
 * `gap-ds-20`…), and `npm run check:parabola` fails if the two disagree. In
 * markup, use the utilities, not these.
 */
export const DS_SPACES = [4, 8, 16, 20, 32, 40, 80, 160] as const;

export type DsSpace = (typeof DS_SPACES)[number];

/** The gutter: the one space between pictures in anything gallery-like. */
export const DS_GUTTER_PX: DsSpace = 20;
