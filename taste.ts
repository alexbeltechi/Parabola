/**
 * Tastes (Alex, 2026-10-29): the styles a theme can be pushed toward, in
 * two groups, the way people describe a brand:
 *
 * - **Feel**, its look and feel: Approachable, Restrained, Editorial,
 *   Luxurious, Bold, Candid.
 * - **World**, the world it belongs to: Playful, Wacky, Tech, Sci-fi,
 *   Fashion, Natural.
 *
 * Each is a recipe of ranges, not one fixed look: where on the Mood bar it
 * sits, where the Appearance dials may go, the backgrounds (light, dark and
 * mid-tone, a strong teal as much as paper) and button colours it reaches
 * for, the font pairs it uses, and whether its people show as a photo or as
 * initials. Picking one draws a look inside it at once (`dsShuffleTaste`);
 * picking more draws inside all of them. The pills picked are kept on the
 * theme (`character.tastes`).
 *
 * This list is meant to grow. An agent adds a taste, a font pair or a
 * colour from what's current (font trends, a Figma file, Mobbin, an awards
 * site) as a line here, so every theme can reach it; one look a maker asks
 * for is dials and overrides on their theme, not a new taste.
 */
import type { DsFieldStyle } from "./button-style";
import { dsCharacterBase, dsExpressionDials, dsMoodDials, type DsCharacter, type DsFontPair } from "./character";
import { dsContrast, dsHexToHsv } from "./colours";

type Range = readonly [number, number];

export type DsTasteGroup = "feel" | "world";

export type DsTaste = {
  id: string;
  label: string;
  group: DsTasteGroup;
  /** Where on the Mood bar (0 serious, 0.5 Parabola, 0.75 playful, 1 wacky). */
  mood: Range;
  /** Where on the Expression bar (0 toned down, 0.25 Parabola, 1 expressive). */
  expression: Range;
  /** The Appearance dials' ranges; a dial left out follows the mood. */
  dials?: Partial<Record<"warmth" | "contrast" | "roundness" | "depth", Range>>;
  /** Backgrounds to start from (null: white), and the button colours to reach for (null: the text's). */
  backgrounds: readonly (string | null)[];
  buttons: readonly (string | null)[];
  /** Font pairs it reaches for; none to leave the fonts as they are (Restrained isn't a font). */
  fonts: readonly DsFontPair[];
  /** Its fields' outline. */
  field: DsFieldStyle;
  /** How people show (an avatar): their photo, friendly; or their initials, branded. */
  people: "photo" | "initials";
};

const pair = (heading: string, headingAxes: string, body: string, bodyAxes: string): DsFontPair => ({
  heading: { label: heading, google: `${heading.replace(/ /g, "+")}${headingAxes}` },
  body: { label: body, google: `${body.replace(/ /g, "+")}${bodyAxes}` },
});

const AXES = ":wght@400..700";

export const DS_TASTES: DsTaste[] = [
  // Feel
  {
    id: "approachable",
    label: "Approachable",
    group: "feel",
    mood: [0.55, 0.72],
    expression: [0.35, 0.6],
    dials: { warmth: [0.15, 0.5], contrast: [-0.25, 0], depth: [0, 0.3] },
    backgrounds: [null, "#FFF6EC", "#EEF6F1", "#F3F0FF"],
    buttons: ["#2F6FEB", "#E8553D", "#1E8A5A"],
    fonts: [pair("DM Sans", AXES, "DM Sans", AXES), pair("Nunito", AXES, "Nunito", AXES), pair("Plus Jakarta Sans", AXES, "Plus Jakarta Sans", AXES)],
    field: { outline: true, outlineWidth: 2, outlineOpacity: 0.6 },
    people: "photo",
  },
  {
    id: "restrained",
    label: "Restrained",
    group: "feel",
    mood: [0.3, 0.55],
    expression: [0.1, 0.3],
    dials: { warmth: [-0.1, 0.15], contrast: [-0.1, 0.15], depth: [0, 0.05] },
    backgrounds: [null, "#F7F7F5", "#EDEDEA"],
    buttons: [null, "#111111", "#3A3A38"],
    fonts: [],
    field: { outline: true, outlineWidth: 1, outlineOpacity: 1 },
    people: "initials",
  },
  {
    id: "editorial",
    label: "Editorial",
    group: "feel",
    mood: [0.1, 0.5],
    expression: [0.15, 0.35],
    dials: { warmth: [0, 0.3], contrast: [0.2, 0.5], depth: [0, 0.05] },
    backgrounds: [null, "#FAF7EF", "#F6F1E7", "#1C1B19"],
    buttons: [null, "#111111", "#B3261E"],
    fonts: [
      pair("Newsreader", AXES, "Inter", AXES),
      pair("Fraunces", ":opsz,wght@9..144,400..700", "Source Sans 3", AXES),
      pair("Instrument Serif", "", "Instrument Sans", AXES),
    ],
    field: { outline: true, outlineWidth: 2, outlineOpacity: 1 },
    people: "initials",
  },
  {
    id: "luxurious",
    label: "Luxurious",
    group: "feel",
    mood: [0.05, 0.3],
    expression: [0.2, 0.45],
    dials: { contrast: [0.1, 0.4], roundness: [0, 0.2], depth: [0, 0.2] },
    backgrounds: ["#F5F1EA", "#121212", "#1E2A24", "#3B2F2A"],
    buttons: ["#111111", "#8C6A43", "#C9A96E"],
    fonts: [
      pair("Cormorant Garamond", AXES, "Jost", AXES),
      pair("Bodoni Moda", ":opsz,wght@6..96,400..700", "Montserrat", AXES),
      pair("Playfair Display", AXES, "Lato", ":wght@400;700"),
    ],
    field: { outline: true, outlineWidth: 1, outlineOpacity: 0.5 },
    people: "initials",
  },
  {
    id: "bold",
    label: "Bold",
    group: "feel",
    mood: [0.45, 0.75],
    expression: [0.7, 0.95],
    dials: { contrast: [0.4, 0.8], roundness: [0, 0.6], depth: [0, 0.4] },
    backgrounds: [null, "#FFE600", "#FF4F00", "#0F766E", "#111111"],
    buttons: ["#111111", "#FF4F00", "#2F2BFF", "#FFFFFF"],
    fonts: [pair("Archivo Black", "", "Archivo", AXES), pair("Anton", "", "Inter", AXES), pair("Bricolage Grotesque", AXES, "Inter", AXES)],
    field: { outline: true, outlineWidth: 2, outlineOpacity: 1 },
    people: "initials",
  },
  {
    id: "candid",
    label: "Candid",
    group: "feel",
    mood: [0.5, 0.7],
    expression: [0.25, 0.45],
    dials: { warmth: [0.1, 0.4], contrast: [-0.2, 0.1], roundness: [0.4, 0.9], depth: [0, 0.1] },
    backgrounds: [null, "#FBF8F3", "#F1EEE8"],
    buttons: [null, "#2B2B2B", "#C2410C"],
    fonts: [pair("Work Sans", AXES, "Work Sans", AXES), pair("Karla", AXES, "Karla", AXES)],
    field: { outline: false, outlineWidth: 2, outlineOpacity: 1 },
    people: "photo",
  },
  // World
  {
    id: "playful",
    label: "Playful",
    group: "world",
    mood: [0.68, 0.85],
    expression: [0.5, 0.8],
    backgrounds: [null, "#FFF4E8", "#F2F0FF", "#2BB673", "#FF8A5B"],
    buttons: ["#FF7A59", "#7C5CFF", "#00A37A", "#111111"],
    fonts: [pair("Fredoka", AXES, "Nunito", AXES), pair("Baloo 2", AXES, "Quicksand", AXES)],
    field: { outline: true, outlineWidth: 2, outlineOpacity: 1 },
    people: "photo",
  },
  {
    id: "wacky",
    label: "Wacky",
    group: "world",
    mood: [0.88, 1],
    expression: [0.85, 1],
    backgrounds: ["#FFD400", "#FF3EA5", "#3D5AFE", "#00E0A4", null],
    buttons: ["#111111", "#FF3EA5", "#3D5AFE", "#FFD400"],
    fonts: [pair("Shrikhand", "", "DM Sans", AXES), pair("Bungee", "", "Work Sans", AXES), pair("Chango", "", "Nunito", AXES)],
    field: { outline: true, outlineWidth: 3, outlineOpacity: 1 },
    people: "photo",
  },
  {
    id: "tech",
    label: "Tech",
    group: "world",
    mood: [0.25, 0.5],
    expression: [0.35, 0.65],
    dials: { warmth: [-0.4, 0], contrast: [0.2, 0.6], roundness: [0, 0.35], depth: [0, 0.3] },
    backgrounds: ["#0B0F0C", "#0D1117", null, "#F2F4F7", "#1F3A5F"],
    buttons: ["#39FF88", "#4C8DFF", "#F2F4F7"],
    fonts: [
      pair("JetBrains Mono", AXES, "IBM Plex Sans", ":wght@400;500;600;700"),
      pair("Space Grotesk", AXES, "Space Mono", ":wght@400;700"),
      pair("Geist Mono", AXES, "Geist", AXES),
    ],
    field: { outline: true, outlineWidth: 1, outlineOpacity: 1 },
    people: "initials",
  },
  {
    id: "scifi",
    label: "Sci-fi",
    group: "world",
    mood: [0.35, 0.6],
    expression: [0.6, 0.9],
    dials: { warmth: [-0.6, -0.1], contrast: [0.3, 0.7], roundness: [0, 0.5], depth: [0.3, 0.8] },
    backgrounds: ["#05070D", "#0E1A2B", "#123B3A", "#2A1B4D"],
    buttons: ["#00E5FF", "#B388FF", "#39FF88"],
    fonts: [pair("Orbitron", AXES, "Exo 2", AXES), pair("Michroma", "", "Rajdhani", ":wght@400;500;600;700")],
    field: { outline: true, outlineWidth: 1, outlineOpacity: 0.7 },
    people: "initials",
  },
  {
    id: "fashion",
    label: "Fashion",
    group: "world",
    mood: [0.15, 0.55],
    expression: [0.4, 0.8],
    dials: { contrast: [0.3, 0.7], roundness: [0, 0.15], depth: [0, 0.1] },
    backgrounds: [null, "#F2EDE6", "#111111", "#C9B8A6", "#7A1F2B"],
    buttons: ["#111111", "#FFFFFF", "#7A1F2B"],
    fonts: [pair("Bodoni Moda", ":opsz,wght@6..96,400..700", "Inter", AXES), pair("Syne", AXES, "Inter", AXES), pair("Italiana", "", "Jost", AXES)],
    field: { outline: true, outlineWidth: 1, outlineOpacity: 1 },
    people: "photo",
  },
  {
    id: "natural",
    label: "Natural",
    group: "world",
    mood: [0.4, 0.65],
    expression: [0.3, 0.55],
    dials: { warmth: [0.15, 0.5], contrast: [-0.15, 0.15], roundness: [0.5, 1], depth: [0, 0.2] },
    backgrounds: ["#F3EFE4", "#E7EDDF", "#2E5E3A", "#6B8F71", "#D9C9A8"],
    buttons: ["#2E5E3A", "#8A5A2B", "#111111"],
    fonts: [pair("Fraunces", ":opsz,wght@9..144,400..700", "Nunito Sans", AXES), pair("Lora", AXES, "Work Sans", AXES)],
    field: { outline: true, outlineWidth: 1, outlineOpacity: 0.6 },
    people: "photo",
  },
];

/** What a draw sets: the character, a font pair, and the button colour (null: the text's). */
export type DsTasteDraw = { character: DsCharacter; fonts: DsFontPair | null; button: string | null };

const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];
const between = ([lo, hi]: Range) => Math.round((lo + Math.random() * (hi - lo)) * 100) / 100;

/** Where ranges meet; the middle of them where they don't. */
function meetOf(ranges: Range[]): Range {
  const lo = Math.max(...ranges.map((r) => r[0]));
  const hi = Math.min(...ranges.map((r) => r[1]));
  if (lo <= hi) return [lo, hi];
  const mid = ranges.reduce((sum, r) => sum + (r[0] + r[1]) / 2, 0) / ranges.length;
  return [mid, mid];
}

/** One or two tastes at random, a different mix from `not` where there is one: what Shuffle puts on. */
export function dsRandomTastes(not: string[] = []): string[] {
  const ids = DS_TASTES.map((t) => t.id);
  let next: string[] = [];
  for (let tries = 0; tries < 8; tries++) {
    next = [...ids].sort(() => Math.random() - 0.5).slice(0, Math.random() < 0.6 ? 1 : 2);
    if ([...next].sort().join() !== [...not].sort().join()) break;
  }
  return next;
}

/**
 * A look drawn at random inside the tastes picked (one at random with none):
 * a mood inside their mood ranges (the middle of them where they don't
 * meet), the dials from that mood unless a taste narrows one, then a
 * background (its hue, colour and brightness), a button colour that stands
 * out from it, and a font pair, from any of them.
 */
export function dsShuffleTaste(ids: string[], current: DsCharacter): DsTasteDraw {
  const known = DS_TASTES.filter((t) => ids.includes(t.id));
  const tastes = known.length ? known : [pick(DS_TASTES)];
  const meet = meetOf;
  const mood = between(meet(tastes.map((t) => t.mood)));
  const expression = between(meet(tastes.map((t) => t.expression)));
  const dials: Partial<DsCharacter> = { ...dsMoodDials(mood), ...dsExpressionDials(expression) };
  for (const key of ["warmth", "contrast", "roundness", "depth"] as const) {
    const ranges = tastes.flatMap((t) => (t.dials?.[key] ? [t.dials[key]!] : []));
    if (ranges.length) dials[key] = between(meet(ranges));
  }
  const background = pick(tastes.flatMap((t) => t.backgrounds));
  const hsv = background ? dsHexToHsv(background) : null;
  const character: DsCharacter = {
    ...current,
    ...dials,
    tastes: tastes.map((t) => t.id),
    mood,
    expression,
    hue: hsv && hsv.s > 0 ? Math.round(hsv.h) : current.hue,
    colour: hsv ? Math.round(hsv.s * 100) / 100 : 0,
    brightness: hsv ? Math.round(hsv.v * 100) / 100 : 1,
  };
  // A button colour that stands out from the page it lands on (a pink button on a pink page doesn't); else the text's.
  const page = dsCharacterBase(character) ?? "#FFFFFF";
  const buttons = tastes.flatMap((t) => t.buttons).filter((b) => b === null || dsContrast(b, page) >= 2);
  const fonts = tastes.flatMap((t) => t.fonts);
  return { character, fonts: fonts.length ? pick(fonts) : null, button: buttons.length ? pick(buttons) : null };
}

/*
 * One section's values from the tastes picked in it (the pills inside
 * Typography, Buttons, Fields and Appearance), each leaving the rest of the
 * theme alone.
 */

const tastesOf = (ids: string[]) => DS_TASTES.filter((t) => ids.includes(t.id));

/** Typography: a font pair from them; null for Parabola's own (a taste that isn't a font, like Restrained). */
export function dsTasteFonts(ids: string[]): DsFontPair | null {
  const fonts = tastesOf(ids).flatMap((t) => t.fonts);
  return fonts.length ? pick(fonts) : null;
}

/** Buttons: a roundness and a depth inside their ranges, and a button colour that stands out on `page`. */
export function dsTasteButtons(ids: string[], page: string): { roundness: number; depth: number; button: string | null } {
  const tastes = tastesOf(ids);
  const mood = between(meetOf(tastes.map((t) => t.mood)));
  const expression = between(meetOf(tastes.map((t) => t.expression)));
  const roundness = tastes.some((t) => t.dials?.roundness) ? between(meetOf(tastes.flatMap((t) => (t.dials?.roundness ? [t.dials.roundness] : [])))) : dsMoodDials(mood).roundness;
  const depth = tastes.some((t) => t.dials?.depth) ? between(meetOf(tastes.flatMap((t) => (t.dials?.depth ? [t.dials.depth] : [])))) : dsExpressionDials(expression).depth;
  const buttons = tastes.flatMap((t) => t.buttons).filter((b) => b === null || dsContrast(b, page) >= 2);
  return { roundness, depth, button: buttons.length ? pick(buttons) : null };
}

/** Fields: the outline of one of them. */
export function dsTasteField(ids: string[]): DsFieldStyle {
  return pick(tastesOf(ids).map((t) => t.field));
}

/** Appearance: a background (hue, colour, brightness) and a warmth from them. */
export function dsTasteBackground(ids: string[], current: DsCharacter): Pick<DsCharacter, "hue" | "colour" | "brightness" | "warmth"> {
  const tastes = tastesOf(ids);
  const background = pick(tastes.flatMap((t) => t.backgrounds));
  const hsv = background ? dsHexToHsv(background) : null;
  const warmths = tastes.flatMap((t) => (t.dials?.warmth ? [t.dials.warmth] : []));
  return {
    hue: hsv && hsv.s > 0 ? Math.round(hsv.h) : current.hue,
    colour: hsv ? Math.round(hsv.s * 100) / 100 : 0,
    brightness: hsv ? Math.round(hsv.v * 100) / 100 : 1,
    warmth: warmths.length ? between(meetOf(warmths)) : dsMoodDials(between(meetOf(tastes.map((t) => t.mood)))).warmth,
  };
}

/** How people show in a look: their photo when any taste picked is a friendly one, else their initials. */
export function dsTastePeople(ids: string[], mood: number): "photo" | "initials" {
  const tastes = DS_TASTES.filter((t) => ids.includes(t.id));
  if (tastes.length) return tastes.some((t) => t.people === "photo") ? "photo" : "initials";
  return mood >= 0.6 ? "photo" : "initials";
}
