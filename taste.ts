/**
 * Tastes (Alex, 2026-10-29): common styles a theme can be pushed toward,
 * Minimal, Editorial, Luxury and the rest, each a recipe of ranges, not one
 * fixed look: where on the Mood bar it sits, where the Appearance dials may
 * go, the base and button colours it reaches for, the font pairs it uses.
 * Picking one draws a look inside it at once (`dsShuffleTaste`); picking
 * more draws inside all of them; Shuffle draws again for another take. The
 * pills picked are kept on the theme (`character.tastes`).
 *
 * This list is meant to grow. An agent adds a taste, a font pair or a
 * colour from what's current (font trends, a Figma file, Mobbin, an awards
 * site) as a line here, so every theme can reach it; one look a maker asks
 * for is dials and overrides on their theme, not a new taste.
 */
import { dsCharacterBase, dsMoodDials, type DsCharacter, type DsFontPair } from "./character";
import { dsContrast } from "./colours";

type Range = readonly [number, number];

export type DsTaste = {
  id: string;
  label: string;
  /** Where on the Mood bar (0 serious, 0.5 Parabola, 0.75 playful, 1 wacky). */
  mood: Range;
  /** The Appearance dials' ranges; a dial left out follows the mood. */
  dials?: Partial<Record<"brightness" | "warmth" | "contrast" | "roundness" | "depth", Range>>;
  /** Base colours to start from (null: white), and the button colours to reach for (null: the text's). */
  bases: readonly (string | null)[];
  buttons: readonly (string | null)[];
  fonts: readonly DsFontPair[];
};

const pair = (heading: string, headingAxes: string, body: string, bodyAxes: string): DsFontPair => ({
  heading: { label: heading, google: `${heading.replace(/ /g, "+")}${headingAxes}` },
  body: { label: body, google: `${body.replace(/ /g, "+")}${bodyAxes}` },
});

const AXES = ":wght@400..700";

export const DS_TASTES: DsTaste[] = [
  {
    id: "minimal",
    label: "Minimal",
    mood: [0.3, 0.5],
    dials: { warmth: [-0.15, 0.1], contrast: [-0.1, 0.2], depth: [0, 0.05] },
    bases: [null, "#F7F7F5", "#F4F4F2"],
    buttons: [null, "#111111"],
    fonts: [pair("Inter", AXES, "Inter", AXES), pair("Manrope", AXES, "Inter", AXES), pair("Geist", AXES, "Geist", AXES)],
  },
  {
    id: "editorial",
    label: "Editorial",
    mood: [0.08, 0.35],
    dials: { warmth: [0, 0.3], contrast: [0.2, 0.5], depth: [0, 0.05] },
    bases: [null, "#FAF7EF", "#F6F1E7"],
    buttons: [null, "#111111", "#B3261E"],
    fonts: [
      pair("Newsreader", AXES, "Inter", AXES),
      pair("Fraunces", ":opsz,wght@9..144,400..700", "Source Sans 3", AXES),
      pair("Instrument Serif", "", "Instrument Sans", AXES),
    ],
  },
  {
    id: "luxury",
    label: "Luxury",
    mood: [0.05, 0.3],
    dials: { contrast: [0.1, 0.4], roundness: [0, 0.2], depth: [0, 0.2] },
    bases: ["#F5F1EA", "#EFE9DF", "#121212"],
    buttons: ["#111111", "#8C6A43", "#C9A96E"],
    fonts: [
      pair("Cormorant Garamond", AXES, "Jost", AXES),
      pair("Bodoni Moda", ":opsz,wght@6..96,400..700", "Montserrat", AXES),
      pair("Playfair Display", AXES, "Lato", ":wght@400;700"),
    ],
  },
  {
    id: "tech",
    label: "Tech",
    mood: [0.25, 0.5],
    dials: { warmth: [-0.4, 0], contrast: [0.2, 0.6], roundness: [0, 0.35], depth: [0, 0.3] },
    bases: ["#0B0F0C", "#0D1117", null, "#F2F4F7"],
    buttons: ["#39FF88", "#4C8DFF", "#F2F4F7"],
    fonts: [
      pair("JetBrains Mono", AXES, "IBM Plex Sans", ":wght@400;500;600;700"),
      pair("Space Grotesk", AXES, "Space Mono", ":wght@400;700"),
      pair("Geist Mono", AXES, "Geist", AXES),
    ],
  },
  {
    id: "warm",
    label: "Warm",
    mood: [0.45, 0.7],
    dials: { warmth: [0.3, 0.8], contrast: [-0.2, 0.1] },
    bases: ["#FAF3E6", "#F6EBDD", "#FFF8EE"],
    buttons: ["#C2410C", "#7C4A2D", "#E07A3F"],
    fonts: [pair("Fraunces", ":opsz,wght@9..144,400..700", "Nunito Sans", AXES), pair("Lora", AXES, "Work Sans", AXES)],
  },
  {
    id: "bold",
    label: "Bold",
    mood: [0.45, 0.75],
    dials: { contrast: [0.4, 0.8], roundness: [0, 0.6], depth: [0, 0.4] },
    bases: [null, "#FFE600", "#FF4F00", "#111111"],
    buttons: ["#111111", "#FF4F00", "#2F2BFF"],
    fonts: [pair("Archivo Black", "", "Archivo", AXES), pair("Anton", "", "Inter", AXES), pair("Bricolage Grotesque", AXES, "Inter", AXES)],
  },
  {
    id: "playful",
    label: "Playful",
    mood: [0.68, 0.85],
    bases: [null, "#FFF4E8", "#F2F0FF", "#EAF8F0"],
    buttons: ["#FF7A59", "#7C5CFF", "#00A37A"],
    fonts: [pair("Fredoka", AXES, "Nunito", AXES), pair("Baloo 2", AXES, "Quicksand", AXES)],
  },
  {
    id: "wacky",
    label: "Wacky",
    mood: [0.88, 1],
    bases: ["#FFD400", "#FF3EA5", "#3D5AFE", "#00E0A4", null],
    buttons: ["#111111", "#FF3EA5", "#3D5AFE", "#FFD400"],
    fonts: [pair("Shrikhand", "", "DM Sans", AXES), pair("Bungee", "", "Work Sans", AXES), pair("Chango", "", "Nunito", AXES)],
  },
];

/** What a shuffle sets: the character, a font pair, and the button colour (null: the text's). */
export type DsTasteDraw = { character: DsCharacter; fonts: DsFontPair; button: string | null };

const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];
const between = ([lo, hi]: Range) => Math.round((lo + Math.random() * (hi - lo)) * 100) / 100;

/**
 * A theme drawn at random inside the tastes picked (all of them with none):
 * a mood inside their mood ranges (the middle of them where they don't
 * meet), the dials from that mood unless a taste narrows one, then a base,
 * a button colour and a font pair from any of them. `brightness` keeps the
 * one given unless a taste narrows it.
 */
export function dsShuffleTaste(ids: string[], current: DsCharacter): DsTasteDraw {
  const known = DS_TASTES.filter((t) => ids.includes(t.id));
  const tastes = known.length ? known : [pick(DS_TASTES)];
  const meet = (ranges: Range[]): Range => {
    const lo = Math.max(...ranges.map((r) => r[0]));
    const hi = Math.min(...ranges.map((r) => r[1]));
    if (lo <= hi) return [lo, hi];
    const mid = ranges.reduce((sum, r) => sum + (r[0] + r[1]) / 2, 0) / ranges.length;
    return [mid, mid];
  };
  const mood = between(meet(tastes.map((t) => t.mood)));
  const dials: Partial<DsCharacter> = { ...dsMoodDials(mood) };
  for (const key of ["brightness", "warmth", "contrast", "roundness", "depth"] as const) {
    const ranges = tastes.flatMap((t) => (t.dials?.[key] ? [t.dials[key]!] : []));
    if (ranges.length) dials[key] = between(meet(ranges));
  }
  const character = { ...current, ...dials, tastes: tastes.map((t) => t.id), mood, seed: pick(tastes.flatMap((t) => t.bases)), brightness: dials.brightness ?? 1 };
  // A button colour that stands out from the page it lands on (a pink button on a pink page doesn't); else the text's.
  const base = dsCharacterBase(character) ?? "#FFFFFF";
  const buttons = tastes.flatMap((t) => t.buttons).filter((b) => b === null || dsContrast(b, base) >= 2);
  return { character, fonts: pick(tastes.flatMap((t) => t.fonts)), button: buttons.length ? pick(buttons) : null };
}
