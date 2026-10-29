/**
 * How a theme's buttons look (theme.ts; Alex, 2026-10-29): the solid
 * buttons (Publish, Subscribe), in the theme's button colour (colours.ts).
 *
 * - fill: solid, or a gradient, the button colour lighter at the top and
 *   darker at the bottom; `contrast` (0 to 1) sets how far apart the two
 *   ends are, from a hint to a strong sheen.
 * - outline: a 1px line inside the edge, the button colour a step darker
 *   (a step lighter on a very dark button), so it holds its shape.
 * - emboss: a 3D label, a 1px shadow on the text only (icons stay flat):
 *   darker and above white text, as if pressed in, or lighter and below
 *   dark text, as if raised; on a near-black button lighter and below, on a
 *   near-white one darker and below, the only ones that show there.
 *
 * Their roundness is the theme's radius (radius.ts). Each is a CSS custom
 * property the primary button reads (`--ds-button-image`, `--ds-button-ring`,
 * `--ds-button-text-shadow`), "none" in tokens.css, so a theme that turns
 * none of them on looks as Parabola always has. Pure data and functions, so
 * the server and the browser share them.
 */
import { dsHexToHsl, dsHslToHex, dsLuminance, dsShift } from "./colours";

export type DsButtonFill = "solid" | "gradient";

export type DsButtonStyle = {
  fill: DsButtonFill;
  /** How far apart a gradient's ends are, 0 (a hint) to 1 (strong). */
  contrast: number;
  outline: boolean;
  /** The 3D label. */
  emboss: boolean;
};

export const DS_DEFAULT_BUTTON_STYLE: DsButtonStyle = { fill: "solid", contrast: 0.5, outline: false, emboss: false };

/** A theme's button style from stored data: anything missing or odd is Parabola's. */
export function parseDsButtonStyle(value: unknown): DsButtonStyle {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const contrast = typeof raw.contrast === "number" && Number.isFinite(raw.contrast) ? Math.min(1, Math.max(0, raw.contrast)) : null;
  return {
    fill: raw.fill === "gradient" ? "gradient" : "solid",
    contrast: contrast ?? DS_DEFAULT_BUTTON_STYLE.contrast,
    outline: raw.outline === true,
    emboss: raw.emboss === true,
  };
}

/** How far a gradient's ends sit from the button colour, as lightness, at no contrast and at full. */
const SPREAD_MIN = 0.03;
const SPREAD_MAX = 0.2;

/**
 * The button style's custom properties for a button colour and what's on it
 * (`ds-button`, `ds-on-button` in that theme), each "none" when off.
 */
export function dsButtonStyleVars(style: DsButtonStyle, button: string, onButton: string): Record<string, string> {
  const spread = SPREAD_MIN + (SPREAD_MAX - SPREAD_MIN) * style.contrast;
  const [h, s, l] = dsHexToHsl(button);
  // The gradient's ends either side of the colour, both moved in from black or white so neither is lost there
  // (a black button still gets its sheen).
  const middle = Math.min(1 - spread, Math.max(spread, l));
  // Near black there's no darker: the outline and the label's shadow go lighter instead (and near white, darker).
  const dark = l < 0.25;
  const pale = l > 0.85;
  const lightLabel = dsLuminance(onButton) > 0.5;
  return {
    "--ds-button-image":
      style.fill === "gradient" ? `linear-gradient(to bottom, ${dsHslToHex(h, s, middle + spread)}, ${dsHslToHex(h, s, middle - spread)})` : "none",
    "--ds-button-ring": style.outline ? `inset 0 0 0 1px ${dsShift(button, dark ? 0.2 : -0.15)}` : "none",
    // Pressed in (a darker line above light text) or raised (a lighter line below dark text); where that one
    // wouldn't show, the other way: a lighter line below on a near-black button, a darker one below on a near-white.
    "--ds-button-text-shadow": !style.emboss
      ? "none"
      : dark
        ? `0 1px 0 ${dsShift(button, 0.28)}`
        : pale
          ? `0 1px 0 ${dsShift(button, -0.15)}`
          : lightLabel
            ? `0 -1px 0 ${dsShift(button, -0.22)}`
            : `0 1px 0 ${dsShift(button, 0.22)}`,
  };
}
