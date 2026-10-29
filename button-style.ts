/**
 * How a theme's buttons look (theme.ts; Alex, 2026-10-29): the solid
 * buttons (Publish, Subscribe), in the theme's primary button colour
 * (colours.ts).
 *
 * - fill: solid, or a gradient of the button colour. `contrast` runs from
 *   -1 to 1 and starts at 0, flat: above 0 the top is lighter and the
 *   bottom darker, below 0 the other way round, further apart the further
 *   from 0 (the panel shows it as -50 to +50).
 * - outline: a line inside the edge, `outlineWidth` pixels (1 to 4), the
 *   button colour a step darker (a step lighter on a very dark button), so
 *   it holds its shape.
 * - shadow: a text shadow, 1px, on the label only (icons stay flat), cast
 *   away from a light at `shadowAngle` degrees as Photoshop has it (90 is
 *   light from above, the shadow falling below): the button colour a step
 *   darker, or lighter on a very dark button.
 *
 * Their roundness is the theme's radius (radius.ts). Each is a CSS custom
 * property the primary button reads (`--ds-button-image`, `--ds-button-ring`,
 * `--ds-button-text-shadow`), "none" in tokens.css, so a theme that turns
 * none of them on looks as Parabola always has. Pure data and functions, so
 * the server and the browser share them.
 */
import { dsHexToHsl, dsHslToHex, dsShift } from "./colours";

export type DsButtonFill = "solid" | "gradient";

export type DsButtonStyle = {
  fill: DsButtonFill;
  /** A gradient's contrast, -1 to 1: 0 flat, above it lighter at the top, below it darker at the top. */
  contrast: number;
  outline: boolean;
  /** The outline's thickness in pixels, 1 to 4. */
  outlineWidth: number;
  /** The label's text shadow. */
  shadow: boolean;
  /** Where the light comes from, in degrees: 0 the right, 90 above (the shadow falls below), as in Photoshop. */
  shadowAngle: number;
};

export const DS_DEFAULT_BUTTON_STYLE: DsButtonStyle = {
  fill: "solid",
  contrast: 0,
  outline: false,
  outlineWidth: 1,
  shadow: false,
  shadowAngle: 90,
};

export const DS_OUTLINE_WIDTHS = [1, 2, 3, 4] as const;

const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);

/** A theme's button style from stored data: anything missing or odd is Parabola's. */
export function parseDsButtonStyle(value: unknown): DsButtonStyle {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const contrast = num(raw.contrast);
  const width = num(raw.outlineWidth);
  const angle = num(raw.shadowAngle);
  return {
    fill: raw.fill === "gradient" ? "gradient" : "solid",
    contrast: contrast === null ? DS_DEFAULT_BUTTON_STYLE.contrast : Math.min(1, Math.max(-1, contrast)),
    outline: raw.outline === true,
    outlineWidth: width === null ? 1 : Math.min(4, Math.max(1, Math.round(width))),
    // The text shadow was `emboss` (a "3D label") for a day.
    shadow: raw.shadow === true || raw.emboss === true,
    shadowAngle: angle === null ? DS_DEFAULT_BUTTON_STYLE.shadowAngle : ((Math.round(angle) % 360) + 360) % 360,
  };
}

/** How far a gradient's ends sit from the button colour, as lightness, at full contrast. */
const SPREAD = 0.2;

/** The button style's custom properties for a button colour, each "none" when off. */
export function dsButtonStyleVars(style: DsButtonStyle, button: string): Record<string, string> {
  const [h, s, l] = dsHexToHsl(button);
  const spread = Math.abs(style.contrast) * SPREAD;
  // Both ends moved in from black or white so neither is lost there (a black button still gets its sheen).
  const middle = Math.min(1 - spread, Math.max(spread, l));
  const [top, bottom] = style.contrast >= 0 ? [middle + spread, middle - spread] : [middle - spread, middle + spread];
  // Near black there's no darker: the outline and the shadow go lighter there.
  const dark = l < 0.25;
  // The shadow falls away from the light, 1px.
  const away = (style.shadowAngle * Math.PI) / 180;
  const x = Math.round(-Math.cos(away) * 100) / 100;
  const y = Math.round(Math.sin(away) * 100) / 100;
  return {
    "--ds-button-image":
      style.fill === "gradient" && style.contrast !== 0
        ? `linear-gradient(to bottom, ${dsHslToHex(h, s, top)}, ${dsHslToHex(h, s, bottom)})`
        : "none",
    "--ds-button-ring": style.outline ? `inset 0 0 0 ${style.outlineWidth}px ${dsShift(button, dark ? 0.2 : -0.15)}` : "none",
    "--ds-button-text-shadow": style.shadow ? `${x}px ${y}px 0 ${dsShift(button, dark ? 0.28 : -0.22)}` : "none",
  };
}
