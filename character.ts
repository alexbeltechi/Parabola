/**
 * A theme's character (theme.ts; decisions, 2026-10-29): a few dials that
 * set the look as a whole, the way a photograph is edited, before any one
 * value is picked. Every theme value that isn't given its own (Auto) is
 * worked out from them: the base and the colours that follow it, the
 * corners, the buttons' look. A value given its own (Custom) stays put when
 * a dial moves, and Restore hands it back to the dials. So an agent sets a
 * look by moving dials, not by writing hexes; a person drags from there.
 *
 * - mood: 0 (serious) to 1 (playful), 0.5 Parabola's own. Not a value of
 *   its own: moving it moves the dials below and the fonts together
 *   (`DS_MOODS`, `dsThemeWithMood` in theme.ts), the way a look is first
 *   described, and they can be fine-tuned after.
 * - seed: the colour the light theme's base starts from, or null for white.
 * - brightness: how bright the base is, 0 (dark) to 1 (as bright as it
 *   comes: white, or the seed as picked).
 * - warmth: -1 (cold) to 1 (warm), 0 neither: a white balance over the base.
 * - contrast: -1 (soft) to 1 (hard), 0 Parabola's: how far the quieter
 *   text, the borders and the cards sit from the base.
 * - roundness: 0 (sharp) to 1 (round): every corner, None to Large.
 * - depth: 0 (flat) to 1 (dimensional): the buttons' gradient, outline and
 *   text shadow, in that order as it rises.
 *
 * Pure data and functions, so the server and the browser share them.
 */
import { DS_DEFAULT_BUTTON_STYLE, type DsButtonStyle } from "./button-style";
import { dsHexToHsv, dsHsvToHex, dsIsHex, dsWithWarmth, type DsColourOptions } from "./colours";
import type { DsRadius } from "./radius";

export type DsCharacter = {
  mood: number;
  seed: string | null;
  brightness: number;
  warmth: number;
  contrast: number;
  roundness: number;
  depth: number;
};

export const DS_DEFAULT_CHARACTER: DsCharacter = { mood: 0.5, seed: null, brightness: 1, warmth: 0, contrast: 0, roundness: 1, depth: 0 };

/**
 * The moods along the Mood bar: what each end, and Parabola in the middle,
 * does to the dials and the fonts. Between them the dials slide; the fonts
 * change where a mood takes over. The taste lives here: a later model
 * improves a mood by changing a line, not every theme.
 *
 * - Serious: crisp corners, a little cooler, firmer contrast, flat; an
 *   editorial serif over a sober sans.
 * - Parabola: its own look.
 * - Playful: round, warmer, a touch softer, some depth (gradient, outline);
 *   a rounded display face over a friendly sans.
 */
export const DS_MOODS = [
  {
    at: 0,
    label: "Serious",
    dials: { warmth: -0.1, contrast: 0.4, roundness: 0.12, depth: 0 },
    fonts: { heading: { label: "Newsreader", google: "Newsreader:wght@400..700" }, body: { label: "IBM Plex Sans", google: "IBM+Plex+Sans:wght@400;500;600;700" } },
  },
  { at: 0.5, label: "Balanced", dials: { warmth: 0, contrast: 0, roundness: 1, depth: 0 }, fonts: null },
  {
    at: 1,
    label: "Playful",
    dials: { warmth: 0.4, contrast: -0.15, roundness: 1, depth: 0.55 },
    fonts: { heading: { label: "Fredoka", google: "Fredoka:wght@400..700" }, body: { label: "Nunito", google: "Nunito:wght@400..700" } },
  },
] as const;

/** Where a mood's fonts take over from Parabola's: past these, toward either end. */
export const DS_MOOD_FONT_EDGE = 0.3;

/** A mood's word, for its bar's readout. */
export function dsMoodLabel(mood: number): string {
  if (mood < 0.15) return "Serious";
  if (mood < 0.4) return "Composed";
  if (mood <= 0.6) return "Balanced";
  if (mood <= 0.85) return "Lively";
  return "Playful";
}

/** The dials at a mood: Parabola's in the middle, sliding toward each end's. */
export function dsMoodDials(mood: number): Pick<DsCharacter, "warmth" | "contrast" | "roundness" | "depth"> {
  const [lo, hi] = mood <= 0.5 ? [DS_MOODS[0], DS_MOODS[1]] : [DS_MOODS[1], DS_MOODS[2]];
  const t = (mood - lo.at) / (hi.at - lo.at);
  const mix = (k: keyof typeof lo.dials) => Math.round((lo.dials[k] + (hi.dials[k] - lo.dials[k]) * t) * 100) / 100;
  return { warmth: mix("warmth"), contrast: mix("contrast"), roundness: mix("roundness"), depth: mix("depth") };
}

/** The dials, each with its range and what its ends mean, for a panel or an agent. */
export const DS_CHARACTER_DIALS = [
  { id: "brightness", label: "Brightness", min: 0, max: 1, low: "Dark", high: "Bright" },
  { id: "warmth", label: "Warmth", min: -1, max: 1, low: "Cold", high: "Warm" },
  { id: "contrast", label: "Contrast", min: -1, max: 1, low: "Soft", high: "Hard" },
  { id: "roundness", label: "Roundness", min: 0, max: 1, low: "Sharp", high: "Round" },
  { id: "depth", label: "Depth", min: 0, max: 1, low: "Flat", high: "Deep" },
] as const satisfies { id: keyof DsCharacter; label: string; min: number; max: number; low: string; high: string }[];

export type DsCharacterDial = (typeof DS_CHARACTER_DIALS)[number]["id"];

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** A theme's character from stored data: anything missing or odd is Parabola's. */
export function parseDsCharacter(value: unknown): DsCharacter {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const dial = (id: DsCharacterDial) => {
    const { min, max } = DS_CHARACTER_DIALS.find((d) => d.id === id)!;
    const n = raw[id];
    return typeof n === "number" && Number.isFinite(n) ? clamp(n, min, max) : DS_DEFAULT_CHARACTER[id];
  };
  const mood = typeof raw.mood === "number" && Number.isFinite(raw.mood) ? clamp(raw.mood, 0, 1) : DS_DEFAULT_CHARACTER.mood;
  return {
    mood,
    seed: dsIsHex(raw.seed) && raw.seed.toUpperCase() !== "#FFFFFF" ? raw.seed.toUpperCase() : null,
    brightness: dial("brightness"),
    warmth: dial("warmth"),
    contrast: dial("contrast"),
    roundness: dial("roundness"),
    depth: dial("depth"),
  };
}

export const dsCharacterIsDefault = (c: DsCharacter) =>
  c.mood === 0.5 &&
  c.seed === null && c.brightness === 1 && c.warmth === 0 && c.contrast === 0 && c.roundness === 1 && c.depth === 0;

/** How dark the base goes at brightness 0: about the dark theme's page. */
const DARKEST = 0.12;

/**
 * The light theme's base from the dials: the seed (or white), as bright as
 * `brightness` says, warmed or cooled; or null for Parabola's own white,
 * which keeps its hand-tuned greys.
 */
export function dsCharacterBase(c: DsCharacter): string | null {
  if (c.seed === null && c.brightness === 1 && c.warmth === 0) return null;
  const { h, s, v } = dsHexToHsv(c.seed ?? "#FFFFFF");
  // On a curve: the top half of the dial stays light (60 is a light grey, not a mid one), the dark end comes fast.
  const dim = (1 - c.brightness) ** 2;
  const value = v * (1 - dim * (1 - DARKEST));
  // From white, warmth tints toward paper (40°) or ice (210°), a little more colour the further it goes, so warm
  // white is paper, not lemon; a seed colour is warmed or cooled as a photo's white balance is.
  if (c.seed === null) return c.warmth === 0 ? dsHsvToHex(0, 0, value) : dsHsvToHex(c.warmth > 0 ? 40 : 210, Math.abs(c.warmth) * 0.12, value);
  const bright = dsHsvToHex(h, s, value);
  return c.warmth === 0 ? bright : dsWithWarmth(bright, 0.5 + c.warmth * 0.35);
}

/** What the colour derivations take from the character (colours.ts). */
export function dsCharacterColourOptions(c: DsCharacter): DsColourOptions {
  return { base: dsCharacterBase(c), contrast: c.contrast };
}

/** The corners from the roundness: None, then 2 to 20px, then Large (fully round pills). */
export function dsCharacterRadius(c: DsCharacter): DsRadius {
  if (c.roundness < 0.08) return "none";
  if (c.roundness >= 0.92) return "large";
  return Math.round(2 + ((c.roundness - 0.08) / 0.84) * 18);
}

/** The buttons' look from the depth: flat; then a gradient, an outline from 0.4, a text shadow from 0.7. */
export function dsCharacterButtons(c: DsCharacter): DsButtonStyle {
  if (c.depth < 0.05) return DS_DEFAULT_BUTTON_STYLE;
  return {
    fill: "gradient",
    contrast: Math.round(c.depth * 0.6 * 50) / 50,
    outline: c.depth >= 0.4,
    outlineWidth: 1,
    outlineOpacity: Math.round(clamp(c.depth, 0, 1) * 100) / 100,
    shadow: c.depth >= 0.7,
    shadowAngle: 90,
  };
}
