/**
 * A theme's character (theme.ts; decisions, 2026-10-29): a few dials that
 * set the look as a whole, the way a photograph is edited, before any one
 * value is picked. Every theme value that isn't given its own (Auto) is
 * worked out from them: the base and the colours that follow it, the
 * corners, the buttons' look. A value given its own (Custom) stays put when
 * a dial moves, and Restore hands it back to the dials. So an agent sets a
 * look by moving dials, not by writing hexes; a person drags from there.
 *
 * - mood: 0 (serious) to 1 (wacky), 0.5 Parabola's own, 0.75 playful: the
 *   lever a taste starts from, the way people first describe a brand. Not a
 *   value of its own: moving it moves roundness and the fonts together
 *   (`DS_MOODS`, `dsThemeWithMood` in theme.ts), and they can be fine-tuned
 *   after. (An Expression bar, how boldly colour spread, sat beside it for a
 *   day; Alex, 2026-10-29: the mood does it better.)
 * - scoped: the pick on the one rail inside Typography (a kind of type) and
 *   inside Buttons (a kind of button), each deciding only that section's
 *   values (taste.ts, `DS_TYPE_STYLES`, `DS_BUTTON_LOOKS`).
 * - tastes: the taste pills the look was drawn from (taste.ts), by id.
 * - The background, as dials rather than a hex (a hex is Colours' job;
 *   Alex, 2026-10-29), in Appearance: warmth, the Temperature bar, -1 (cool)
 *   to 1 (warm), a white balance over it and the greys drawn from it; hue, 0 to 360; colour, 0 (none: white, greys, black) to 1 (the hue
 *   at full strength), so a strong teal or a mid green is as reachable as
 *   paper; brightness, 0 (black) to 1 (as light as it goes).
 * - contrast: -1 (soft) to 1 (hard), 0 Parabola's: how far the quieter
 *   text, the borders and the cards sit from the base.
 * - roundness: 0 (sharp) to 1 (round): every corner, None to Large.
 * - depth: 0 (flat) to 1 (dimensional): the buttons' gradient, outline and
 *   text shadow, in that order as it rises.
 *
 * Pure data and functions, so the server and the browser share them.
 */
import { DS_DEFAULT_BUTTON_STYLE, type DsButtonStyle } from "./button-style";
import { dsHexToHsl, dsHslToHex, dsHsvToHex, dsIsHex, type DsColourOptions } from "./colours";
import type { DsRadius } from "./radius";

/** The panel sections with a rail of their own, each deciding only its own values. */
export type DsTasteScope = "type" | "buttons";

export type DsCharacter = {
  tastes: string[];
  scoped: Partial<Record<DsTasteScope, string>>;
  mood: number;
  warmth: number;
  hue: number;
  colour: number;
  brightness: number;
  contrast: number;
  roundness: number;
  depth: number;
};

/**
 * Parabola's own look is a taste too: restrained and editorial, writing
 * first, a little finesse (Alex, 2026-10-29), so those pills show picked.
 */
export const DS_DEFAULT_TASTES = ["restrained", "editorial"];

export const DS_DEFAULT_CHARACTER: DsCharacter = {
  tastes: DS_DEFAULT_TASTES,
  scoped: {},
  mood: 0.5,
  warmth: 0,
  hue: 40,
  colour: 0,
  brightness: 1,
  contrast: 0,
  roundness: 1,
  depth: 0,
};

/** A font pair: a Google font for headlines over one for text. */
export type DsFontPair = { heading: { label: string; google: string }; body: { label: string; google: string } };

const pair = (heading: string, headingAxes: string, body: string, bodyAxes: string): DsFontPair => ({
  heading: { label: heading, google: `${heading.replace(/ /g, "+")}${headingAxes}` },
  body: { label: body, google: `${body.replace(/ /g, "+")}${bodyAxes}` },
});

/**
 * The moods along the Mood bar, Serious to Wacky: what each stop does to the
 * dials and the fonts. Between stops the dials slide; the fonts are the
 * nearest stop's within `fonts` of it, Parabola's otherwise. The taste lives
 * here: a later model improves a mood by changing a line, not every theme.
 *
 * - Serious: crisp corners, a little cooler, firmer contrast, flat; an
 *   editorial serif over a sober sans.
 * - Balanced: Parabola's own.
 * - Playful: round, warmer, a touch softer, some depth; a rounded display
 *   face over a friendly sans.
 * - Wacky: everything turned up: round, warm, hard, as deep as it goes; a
 *   loud display face.
 */
export const DS_MOODS = [
  { at: 0, label: "Serious", dials: { roundness: 0.12 }, fonts: pair("Newsreader", ":wght@400..700", "IBM Plex Sans", ":wght@400;500;600;700"), reach: 0.2 },
  { at: 0.5, label: "Balanced", dials: { roundness: 1 }, fonts: null, reach: 0 },
  { at: 0.75, label: "Playful", dials: { roundness: 1 }, fonts: pair("Fredoka", ":wght@400..700", "Nunito", ":wght@400..700"), reach: 0.13 },
  { at: 1, label: "Wacky", dials: { roundness: 1 }, fonts: pair("Shrikhand", "", "DM Sans", ":wght@400..700"), reach: 0.12 },
] as const;

/** The fonts at a mood: the nearest stop's within its reach, or null for Parabola's own. */
export function dsMoodFonts(mood: number): DsFontPair | null {
  const near = DS_MOODS.find((m) => m.fonts && Math.abs(mood - m.at) <= m.reach);
  return near?.fonts ?? null;
}

/** A mood's word, for its bar. */
export function dsMoodLabel(mood: number): string {
  if (mood < 0.15) return "Serious";
  if (mood < 0.38) return "Composed";
  if (mood <= 0.6) return "Balanced";
  if (mood < 0.68) return "Lively";
  if (mood < 0.88) return "Playful";
  return "Wacky";
}

/** The dials at a mood: sliding between the stops either side of it. */
export function dsMoodDials(mood: number): Pick<DsCharacter, "roundness"> {
  const i = Math.max(0, DS_MOODS.findIndex((m) => m.at >= mood) - 1);
  const lo = DS_MOODS[i];
  const hi = DS_MOODS[Math.min(DS_MOODS.length - 1, i + 1)];
  const t = hi.at === lo.at ? 0 : (mood - lo.at) / (hi.at - lo.at);
  const mix = (k: keyof typeof lo.dials) => Math.round((lo.dials[k] + (hi.dials[k] - lo.dials[k]) * t) * 100) / 100;
  return { roundness: mix("roundness") };
}

/** A temperature's word, for its bar. */
export function dsTemperatureLabel(warmth: number): string {
  if (warmth < -0.6) return "Cool";
  if (warmth < -0.2) return "Crisp";
  if (warmth <= 0.2) return "Neutral";
  if (warmth <= 0.6) return "Warm";
  return "Cosy";
}


/** The dials, each with its range and what its ends mean, for a panel or an agent. */
export const DS_CHARACTER_DIALS = [
  { id: "warmth", label: "Warmth", min: -1, max: 1, low: "Cold", high: "Warm" },
  { id: "hue", label: "Hue", min: 0, max: 360, low: "Red", high: "Red" },
  { id: "colour", label: "Colour", min: 0, max: 1, low: "None", high: "Full" },
  { id: "brightness", label: "Brightness", min: 0, max: 1, low: "Dark", high: "Light" },
  { id: "contrast", label: "Contrast", min: -1, max: 1, low: "Soft", high: "Hard" },
  { id: "roundness", label: "Roundness", min: 0, max: 1, low: "Sharp", high: "Round" },
  { id: "depth", label: "Depth", min: 0, max: 1, low: "Flat", high: "Deep" },
] as const satisfies { id: keyof DsCharacter; label: string; min: number; max: number; low: string; high: string }[];

export type DsCharacterDial = (typeof DS_CHARACTER_DIALS)[number]["id"];

const clamp = (n: number, min: number, max: number) => Math.min(max, Math.max(min, n));

/** The pick on each section's rail, from stored data (a list of pills for a day: its first). */
function parseScoped(value: unknown): Partial<Record<DsTasteScope, string>> {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const out: Partial<Record<DsTasteScope, string>> = {};
  for (const scope of ["type", "buttons"] as const) {
    const id = Array.isArray(raw[scope]) ? (raw[scope] as unknown[])[0] : raw[scope];
    if (typeof id === "string") out[scope] = id;
  }
  return out;
}

/** A theme's character from stored data: anything missing or odd is Parabola's. */
export function parseDsCharacter(value: unknown): DsCharacter {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const dial = (id: DsCharacterDial) => {
    const { min, max } = DS_CHARACTER_DIALS.find((d) => d.id === id)!;
    const n = raw[id];
    return typeof n === "number" && Number.isFinite(n) ? clamp(n, min, max) : DS_DEFAULT_CHARACTER[id];
  };
  const mood = typeof raw.mood === "number" && Number.isFinite(raw.mood) ? clamp(raw.mood, 0, 1) : DS_DEFAULT_CHARACTER.mood;
  const tastes = Array.isArray(raw.tastes) ? [...new Set((raw.tastes as unknown[]).filter((t): t is string => typeof t === "string"))] : [];
  // A background picked as a hex for a day (`seed`) becomes its hue, colour and brightness.
  const hsl = dsIsHex(raw.seed) ? dsHexToHsl(raw.seed) : null;
  const seed = hsl ? { h: hsl[0], s: hsl[1], v: hsl[2] } : null;
  return {
    tastes: Array.isArray(raw.tastes) ? tastes : DS_DEFAULT_TASTES,
    scoped: parseScoped(raw.scoped),
    mood,
    warmth: dial("warmth"),
    hue: seed && seed.s > 0 ? Math.round(seed.h) : dial("hue"),
    colour: seed ? Math.round(seed.s * 100) / 100 : dial("colour"),
    brightness: seed ? Math.round(seed.v * 100) / 100 : dial("brightness"),
    contrast: dial("contrast"),
    roundness: dial("roundness"),
    depth: dial("depth"),
  };
}

export const dsCharacterIsDefault = (c: DsCharacter) =>
  [...c.tastes].sort().join() === [...DS_DEFAULT_TASTES].sort().join() &&
  Object.keys(c.scoped).length === 0 &&
  c.mood === 0.5 &&
  c.colour === 0 && c.brightness === 1 && c.warmth === 0 && c.contrast === 0 && c.roundness === 1 && c.depth === 0;

/**
 * The light theme's background from the dials: the hue at its colour and
 * brightness, warmed or cooled; or null for Parabola's own white, which keeps
 * its hand-tuned greys.
 */
export function dsCharacterBase(c: DsCharacter): string | null {
  if (c.colour === 0 && c.brightness === 1 && c.warmth === 0) return null;
  // With no colour, warmth tints toward paper (40°) or ice (210°), a little more the further it goes, so a warm
  // white is paper, not lemon; a colour is warmed or cooled as a photo's white balance is.
  if (c.colour < 0.02) {
    return c.warmth === 0
      ? dsHsvToHex(0, 0, c.brightness)
      : dsHsvToHex(c.warmth > 0 ? 40 : 210, Math.abs(c.warmth) * 0.12, c.brightness);
  }
  // On a colour, temperature leans its hue toward orange (warm, 30°) or blue (cool, 220°), up to 25° at the
  // ends, so a warm yellow stays a yellow; a white balance would pull it to green.
  // A true brightness on a colour (Alex, 2026-10-29): 0 black, 0.5 the colour at its strongest, 1 white.
  if (c.warmth === 0) return dsHslToHex(c.hue, c.colour, c.brightness);
  const toward = c.warmth > 0 ? 30 : 220;
  const gap = ((toward - c.hue + 540) % 360) - 180;
  const lean = Math.sign(gap) * Math.min(Math.abs(gap), 25 * Math.abs(c.warmth));
  return dsHslToHex((c.hue + lean + 360) % 360, c.colour, c.brightness);
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
