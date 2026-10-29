/**
 * A theme's character (theme.ts; decisions, 2026-10-29): a few dials that
 * set the look as a whole, the way a photograph is edited, before any one
 * value is picked. Every theme value that isn't given its own (Auto) is
 * worked out from them: the base and the colours that follow it, the
 * corners, the buttons' look. A value given its own (Custom) stays put when
 * a dial moves, and Restore hands it back to the dials. So an agent sets a
 * look by moving dials, not by writing hexes; a person drags from there.
 *
 * - mood: the personality (Alex, 2026-10-29), 0 (serious) through 0.5
 *   (balanced, Parabola's own) and 0.75 (playful) to 1 (wacky), a slider. It moves the
 *   look inside the style's chips (taste.ts): the fonts, the buttons'
 *   roundness and depth, the colour's saturation and the button colour
 *   (`dsThemeWithMood` in theme.ts), and the voice. With no chips (a theme
 *   from before them) it slides along `DS_MOODS`.
 * - scoped: the chip picked on each section's rail, a palette in Colour, a
 *   kind of type in Typography, a kind of button in Buttons (taste.ts), each
 *   deciding only that section's values.
 * - tastes: the style the look was drawn from (taste.ts), by id; one.
 * - The background, as dials rather than a hex (a hex is Colours' job;
 *   Alex, 2026-10-29), in Colour, as a photo is edited: hue, 0 to 360
 *   (40, paper's, by default); colour, the Saturation bar, 0 (none: white,
 *   greys, black) to 1 (the hue at full strength), so raising it on a white
 *   goes paper, then sand, then a bright orange; brightness, 0 (black) to 1
 *   (as light as it goes). It replaced a Temperature bar (warmth).
 * - contrast: -1 (soft) to 1 (hard), 0 Parabola's: how far the quieter
 *   text, the borders and the cards sit from the base.
 * - roundness: 0 (sharp) to 1 (round): every corner, None to Large.
 * - depth: 0 (flat) to 1 (dimensional): the buttons' gradient, outline and
 *   text shadow, in that order as it rises.
 *
 * Pure data and functions, so the server and the browser share them.
 */
import { DS_DEFAULT_BUTTON_STYLE, type DsButtonStyle } from "./button-style";
import { dsHexToHsv, dsHslToHex, dsHsvToHex, dsIsHex, type DsColourOptions } from "./colours";
import type { DsRadius } from "./radius";

/** The panel sections with a rail of their own, each deciding only its own values. */
export type DsTasteScope = "colour" | "type" | "buttons";

export type DsCharacter = {
  tastes: string[];
  scoped: Partial<Record<DsTasteScope, string>>;
  mood: number;
  hue: number;
  colour: number;
  brightness: number;
  contrast: number;
  roundness: number;
  depth: number;
};

/** Parabola's own look is a style too, Classic, so that shows picked. */
export const DS_DEFAULT_TASTES = ["classic"];

/** Ids from the Feel and Era tracks, retired the same day for one Style rail and the Mood bar (taste.ts). */
const RETIRED_TASTES = ["restrained", "technical", "approachable", "luxurious", "bold", "candid", "playful", "wacky", "modern", "contemporary", "futuristic"];

/** Styles renamed or folded into another, the same day: Fashion and Luxury are Elegant, Sci-fi is Tech, Default and Editorial are Classic. */
const RENAMED_TASTES: Record<string, string> = { fashion: "elegant", luxury: "elegant", scifi: "tech", default: "classic", editorial: "classic" };

export const DS_DEFAULT_CHARACTER: DsCharacter = {
  tastes: DS_DEFAULT_TASTES,
  // Parabola's own chips: its colours, its fonts, its round buttons.
  scoped: { colour: "classic", type: "classic", buttons: "soft" },
  mood: 0.5,
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

/** A mood's word, Serious to Wacky, for its slider. */
export function dsMoodLabel(mood: number): string {
  if (mood < 0.2) return "Serious";
  if (mood < 0.45) return "Composed";
  if (mood < 0.55) return "Balanced";
  if (mood < 0.7) return "Lively";
  if (mood < 0.95) return "Playful";
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

/** The dials, each with its range and what its ends mean, for a panel or an agent. */
export const DS_CHARACTER_DIALS = [
  { id: "hue", label: "Hue", min: 0, max: 360, low: "Red", high: "Red" },
  { id: "colour", label: "Saturation", min: 0, max: 1, low: "None", high: "Full" },
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
  for (const scope of ["colour", "type", "buttons"] as const) {
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
  // One style: the first stored that isn't retired.
  const tastes = Array.isArray(raw.tastes)
    ? (raw.tastes as unknown[])
        .filter((t): t is string => typeof t === "string" && !RETIRED_TASTES.includes(t))
        .map((t) => RENAMED_TASTES[t] ?? t)
        .slice(0, 1)
    : [];
  // A background stored the older ways becomes its hue, saturation and brightness: a hex picked for a day (`seed`),
  // or a temperature over an HSL brightness (`warmth`).
  const num = (k: string) => (typeof raw[k] === "number" && Number.isFinite(raw[k]) ? (raw[k] as number) : null);
  const older =
    typeof raw.warmth === "number"
      ? (legacyBase(raw.warmth, num("hue") ?? 40, num("colour") ?? 0, num("brightness") ?? 1) ?? "#FFFFFF")
      : null;
  const hex = dsIsHex(raw.seed) ? raw.seed : older;
  const seed = hex ? dsHexToHsv(hex) : null;
  return {
    tastes: Array.isArray(raw.tastes) ? tastes : DS_DEFAULT_TASTES,
    scoped: parseScoped(raw.scoped),
    mood,
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
  JSON.stringify(c.scoped) === JSON.stringify(DS_DEFAULT_CHARACTER.scoped) &&
  c.mood === 0.5 &&
  c.colour === 0 && c.brightness === 1 && c.contrast === 0 && c.roundness === 1 && c.depth === 0;

/**
 * The light theme's background from the dials, as a photo's hue and
 * saturation are edited (Alex, 2026-10-29): the hue at its saturation and
 * brightness, so on a white, more saturation is paper, then sand, then a
 * bright orange; or null for Parabola's own white, which keeps its
 * hand-tuned greys.
 */
export function dsCharacterBase(c: DsCharacter): string | null {
  if (c.colour === 0 && c.brightness === 1) return null;
  return dsHsvToHex(c.hue, c.colour, c.brightness);
}

/** A background stored before the Saturation bar: a temperature over an HSL brightness, as a hex; null for white. */
function legacyBase(warmth: number, hue: number, colour: number, brightness: number): string | null {
  if (colour === 0 && brightness === 1 && warmth === 0) return null;
  if (colour < 0.02) return dsHsvToHex(warmth > 0 ? 40 : 210, Math.abs(warmth) * 0.12, brightness);
  const toward = warmth > 0 ? 30 : 220;
  const gap = ((toward - hue + 540) % 360) - 180;
  const lean = Math.sign(gap) * Math.min(Math.abs(gap), 25 * Math.abs(warmth));
  return dsHslToHex((hue + lean + 360) % 360, colour, brightness);
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
