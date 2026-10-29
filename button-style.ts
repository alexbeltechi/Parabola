/**
 * How a theme's buttons look (theme.ts; Alex, 2026-10-29): the solid
 * buttons (Publish, Subscribe), in the theme's primary button colour
 * (colours.ts).
 *
 * - fill: solid, or a gradient of the button colour. `contrast` runs from
 *   -1 to 1 and starts at 0, flat: above 0 the top is lighter and the
 *   bottom darker, below 0 the other way round, further apart the further
 *   from 0 (the panel shows it as -50 to +50).
 * - outline: a line inside the edge, `outlineWidth` pixels (1 to 8), the
 *   button colour a step darker (a step lighter on a very dark button), so
 *   it holds its shape, at `outlineOpacity` (1 solid, 0 gone). Off by
 *   default.
 *
 * Fields have an outline of their own (`DsFieldStyle`): on by default, 2px,
 * in `--ds-field-border` (colours.ts), which can be turned off, thinner or
 * thicker, or see-through.
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
  /** The outline's thickness in pixels, 1 to 8. */
  outlineWidth: number;
  /** How solid the outline is, 0 (gone) to 1 (solid). */
  outlineOpacity: number;
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
  outlineOpacity: 1,
  shadow: false,
  shadowAngle: 90,
};

/** The outline widths offered as buttons; any other, up to the most, is typed. */
export const DS_OUTLINE_WIDTHS = [1, 2] as const;
export const DS_OUTLINE_MAX = 8;

/** A field's outline (DsInput, selects, dates): on, 2px, solid by default. */
export type DsFieldStyle = { outline: boolean; outlineWidth: number; outlineOpacity: number };

export const DS_DEFAULT_FIELD_STYLE: DsFieldStyle = { outline: true, outlineWidth: 2, outlineOpacity: 1 };

const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : null);

/** A theme's button style from stored data: anything missing or odd is Parabola's. */
export function parseDsButtonStyle(value: unknown): DsButtonStyle {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const contrast = num(raw.contrast);
  const angle = num(raw.shadowAngle);
  return {
    fill: raw.fill === "gradient" ? "gradient" : "solid",
    contrast: contrast === null ? DS_DEFAULT_BUTTON_STYLE.contrast : Math.min(1, Math.max(-1, contrast)),
    outline: raw.outline === true,
    ...parseOutline(raw, DS_DEFAULT_BUTTON_STYLE.outlineWidth),
    // The text shadow was `emboss` (a "3D label") for a day.
    shadow: raw.shadow === true || raw.emboss === true,
    shadowAngle: angle === null ? DS_DEFAULT_BUTTON_STYLE.shadowAngle : ((Math.round(angle) % 360) + 360) % 360,
  };
}

/** An outline's width and opacity from stored data. */
function parseOutline(raw: Record<string, unknown>, width: number) {
  const w = num(raw.outlineWidth);
  const o = num(raw.outlineOpacity);
  return {
    outlineWidth: w === null ? width : Math.min(DS_OUTLINE_MAX, Math.max(1, Math.round(w))),
    outlineOpacity: o === null ? 1 : Math.min(1, Math.max(0, o)),
  };
}

/** A theme's field style from stored data: anything missing or odd is Parabola's (an outline, on). */
export function parseDsFieldStyle(value: unknown): DsFieldStyle {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  return { outline: raw.outline !== false, ...parseOutline(raw, DS_DEFAULT_FIELD_STYLE.outlineWidth) };
}

/** A colour at an opacity, as CSS: itself when solid. */
const faded = (colour: string, opacity: number) =>
  opacity >= 1 ? colour : `color-mix(in srgb, ${colour} ${Math.round(opacity * 100)}%, transparent)`;

/** The field style's custom properties, over the field outline colour of the theme in that mode. */
export function dsFieldStyleVars(style: DsFieldStyle, border: string): Record<string, string> {
  return {
    "--ds-field-border-width": style.outline ? `${style.outlineWidth}px` : "0px",
    "--ds-field-border": faded(border, style.outlineOpacity),
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
    "--ds-button-ring": style.outline
      ? `inset 0 0 0 ${style.outlineWidth}px ${faded(dsShift(button, dark ? 0.2 : -0.15), style.outlineOpacity)}`
      : "none",
    "--ds-button-text-shadow": style.shadow ? `${x}px ${y}px 0 ${dsShift(button, dark ? 0.28 : -0.22)}` : "none",
  };
}
