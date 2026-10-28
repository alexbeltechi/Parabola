/**
 * Parabola corners: a theme picks one radius (None, Small, Medium, Large,
 * or a custom number of pixels) and every corner follows it, from the
 * smallest (`rounded-ds-sm`) to the pill (`rounded-ds-pill`, buttons, nav
 * items, tooltips). Large is
 * Parabola's default, where the pill is fully round; below it buttons
 * become rounded rectangles. The values live as `--ds-radius-*` on :root
 * (tokens.css has Large), and `npm run check:parabola` fails if the two
 * disagree. Progress bars, switches, radios and avatars stay round in any
 * theme: they're circles, not corners.
 */
export const DS_RADIUS_TOKENS = ["sm", "control", "md", "lg", "pill"] as const;
export type DsRadiusToken = (typeof DS_RADIUS_TOKENS)[number];

export const DS_RADII = [
  { id: "none", label: "None", px: { sm: 0, control: 0, md: 0, lg: 0, pill: 0 } },
  { id: "small", label: "Small", px: { sm: 2, control: 4, md: 4, lg: 6, pill: 6 } },
  { id: "medium", label: "Medium", px: { sm: 4, control: 6, md: 8, lg: 12, pill: 12 } },
  { id: "large", label: "Large", px: { sm: 4, control: 8, md: 12, lg: 16, pill: 9999 } },
] as const satisfies { id: string; label: string; px: Record<DsRadiusToken, number> }[];

/** A preset's id, or a custom radius in pixels (the largest corner, cards and pills). */
export type DsRadius = (typeof DS_RADII)[number]["id"] | number;

export const DS_DEFAULT_RADIUS: DsRadius = "large";

/** A custom radius goes from 0 to this. */
export const DS_RADIUS_MAX = 64;

/**
 * Every corner's pixels for a radius. A custom one is the cards' and the
 * pills' corner, the smaller ones scaled from it as the presets are.
 */
export function dsRadiusPx(radius: DsRadius): Record<DsRadiusToken, number> {
  if (typeof radius === "number") {
    const px = Math.min(DS_RADIUS_MAX, Math.max(0, Math.round(radius)));
    return { sm: Math.round(px / 4), control: Math.round(px / 2), md: Math.round((px * 3) / 4), lg: px, pill: px };
  }
  return (DS_RADII.find((r) => r.id === radius) ?? DS_RADII[DS_RADII.length - 1]).px;
}
