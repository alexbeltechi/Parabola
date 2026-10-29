/**
 * Tastes (Alex, 2026-10-29): the styles a theme can be pushed toward, in
 * three tracks, the way people describe a brand:
 *
 * - **Feel**, its look and feel: Restrained, Technical, Approachable,
 *   Luxurious, Bold, Candid.
 * - **World**, the world it belongs to: Editorial, Tech, Playful, Wacky,
 *   Sci-fi, Fashion, Natural.
 * - **Era**, when it's from: Retro, Modern, Contemporary, Futuristic.
 *
 * Parabola's own is Restrained yet Editorial, so those tracks start there;
 * Era starts empty. Each taste also has a voice (a tone and a rule), so a
 * look comes with how it speaks.
 *
 * Which picks can stand together is a rule, not a habit of the panel
 * (`dsTastesClash`): Feel and World take one pick each, as tabs do
 * (Restrained and Bold can't both be true); Era takes more than one, except
 * where `DS_TASTE_EXCLUDES` says two can't meet (retro and modern can't;
 * retro and futuristic can). Two that meet in a look of their own, as retro
 * and futuristic do, have a blend (`DS_TASTE_BLENDS`) that draws instead of
 * either.
 *
 * Each is a recipe of ranges, not one fixed look: where on the Mood bar it
 * sits, where the Appearance dials may go, the backgrounds (light, dark and
 * mid-tone, a strong teal as much as paper) and button colours it reaches
 * for, the font pairs it uses, and whether its people show as a photo or as
 * initials. Picking one draws a look inside it at once (`dsShuffleTaste`);
 * picking more draws inside all of them. The pills picked are kept on the
 * theme (`character.tastes`).
 *
 * Typography and Buttons each have one rail of their own, about only that
 * (`DS_TYPE_STYLES`, `DS_BUTTON_LOOKS`); Appearance and Fields have none.
 *
 * This list is meant to grow. An agent adds a taste, a font pair or a
 * colour from what's current (font trends, a Figma file, Mobbin, an awards
 * site) as a line here, so every theme can reach it; one look a maker asks
 * for is dials and overrides on their theme, not a new taste.
 */
import { dsCharacterBase, dsMoodDials, type DsCharacter, type DsFontPair } from "./character";
import { dsContrast, dsHexToHsl } from "./colours";

type Range = readonly [number, number];

export type DsTasteGroup = "feel" | "world" | "era";

/** The tones a taste speaks in. */
export type DsTone =
  | "calm"
  | "precise"
  | "warm"
  | "elegant"
  | "loud"
  | "candid"
  | "considered"
  | "playful"
  | "wild"
  | "futurist"
  | "chic"
  | "grounded";

export type DsTaste = {
  id: string;
  label: string;
  group: DsTasteGroup;
  /** Where on the Mood bar (0 serious, 0.5 Parabola, 0.75 playful, 1 wacky). */
  mood: Range;
  /** The Appearance dials' ranges; a dial left out follows the mood. */
  dials?: Partial<Record<"warmth" | "contrast" | "roundness" | "depth", Range>>;
  /** Backgrounds to start from (null: white), and the button colours to reach for (null: the text's). */
  backgrounds: readonly (string | null)[];
  buttons: readonly (string | null)[];
  /** Font pairs it reaches for; none to leave the fonts as they are (Restrained isn't a font). */
  fonts: readonly DsFontPair[];
  /** How people show (an avatar): their photo, friendly; or their initials, branded. */
  people: "photo" | "initials";
  /**
   * How words sit on a story's photo (as Instagram sets them, line by line):
   * boxed in the page colour (branded), plain in white (candid), or loud on
   * the button colour (playful).
   */
  story: "boxed" | "plain" | "loud";
  /**
   * How it speaks: a tone (which the preview's copy is written in) and one
   * rule of voice, for the brand's statement and for an agent writing in it.
   */
  voice: { tone: DsTone; rule: string };
};

const pair = (heading: string, headingAxes: string, body: string, bodyAxes: string): DsFontPair => ({
  heading: { label: heading, google: `${heading.replace(/ /g, "+")}${headingAxes}` },
  body: { label: body, google: `${body.replace(/ /g, "+")}${bodyAxes}` },
});

const AXES = ":wght@400..700";

export const DS_TASTES: DsTaste[] = [
  // Feel
  {
    id: "restrained",
    label: "Restrained",
    group: "feel",
    mood: [0.3, 0.55],
    dials: { warmth: [-0.1, 0.15], contrast: [-0.1, 0.15], depth: [0, 0.05] },
    backgrounds: [null, "#F7F7F5", "#EDEDEA"],
    buttons: [null, "#111111", "#3A3A38"],
    fonts: [],
    people: "initials",
    story: "boxed",
    voice: { tone: "calm", rule: "Plain words and short sentences; nothing shouted." },
  },
  {
    id: "technical",
    label: "Technical",
    group: "feel",
    // Precise and quiet, as a well-made tool is (shadcn's look): neutral greys, crisp edges, one font, no flourish.
    mood: [0.3, 0.5],
    dials: { warmth: [-0.25, 0], contrast: [0.05, 0.3], roundness: [0.2, 0.45], depth: [0, 0.05] },
    backgrounds: [null, "#FAFAFA", "#09090B"],
    buttons: ["#18181B", "#2563EB", null],
    fonts: [pair("Geist", AXES, "Geist", AXES), pair("Inter", AXES, "Inter", AXES)],
    people: "initials",
    story: "boxed",
    voice: { tone: "precise", rule: "Exact and useful: name the thing, say what it does." },
  },
  {
    id: "approachable",
    label: "Approachable",
    group: "feel",
    mood: [0.55, 0.72],
    dials: { warmth: [0.15, 0.5], contrast: [-0.25, 0], depth: [0, 0.3] },
    backgrounds: [null, "#FFF6EC", "#EEF6F1", "#F3F0FF"],
    buttons: ["#2F6FEB", "#E8553D", "#1E8A5A"],
    fonts: [pair("DM Sans", AXES, "DM Sans", AXES), pair("Nunito", AXES, "Nunito", AXES), pair("Plus Jakarta Sans", AXES, "Plus Jakarta Sans", AXES)],
    people: "photo",
    story: "plain",
    voice: { tone: "warm", rule: "Warm and direct, as if talking to a friend." },
  },
  {
    id: "luxurious",
    label: "Luxurious",
    group: "feel",
    mood: [0.05, 0.3],
    dials: { contrast: [0.1, 0.4], roundness: [0, 0.2], depth: [0, 0.2] },
    backgrounds: ["#F5F1EA", "#121212", "#1E2A24", "#3B2F2A"],
    buttons: ["#111111", "#8C6A43", "#C9A96E"],
    fonts: [
      pair("Cormorant Garamond", AXES, "Jost", AXES),
      pair("Bodoni Moda", ":opsz,wght@6..96,400..700", "Montserrat", AXES),
      pair("Playfair Display", AXES, "Lato", ":wght@400;700"),
    ],
    people: "initials",
    story: "boxed",
    voice: { tone: "elegant", rule: "Few words, chosen slowly; never a hard sell." },
  },
  {
    id: "bold",
    label: "Bold",
    group: "feel",
    mood: [0.45, 0.75],
    dials: { contrast: [0.4, 0.8], roundness: [0, 0.6], depth: [0, 0.4] },
    backgrounds: [null, "#FFE600", "#FF4F00", "#0F766E", "#111111"],
    buttons: ["#111111", "#FF4F00", "#2F2BFF", "#FFFFFF"],
    fonts: [pair("Archivo Black", "", "Archivo", AXES), pair("Anton", "", "Inter", AXES), pair("Bricolage Grotesque", AXES, "Inter", AXES)],
    people: "initials",
    story: "loud",
    voice: { tone: "loud", rule: "Short, strong statements, verbs first." },
  },
  {
    id: "candid",
    label: "Candid",
    group: "feel",
    mood: [0.5, 0.7],
    dials: { warmth: [0.1, 0.4], contrast: [-0.2, 0.1], roundness: [0.4, 0.9], depth: [0, 0.1] },
    backgrounds: [null, "#FBF8F3", "#F1EEE8"],
    buttons: [null, "#2B2B2B", "#C2410C"],
    fonts: [pair("Work Sans", AXES, "Work Sans", AXES), pair("Karla", AXES, "Karla", AXES)],
    people: "photo",
    story: "plain",
    voice: { tone: "candid", rule: "First person and unpolished, honest about the mess." },
  },
  // World
  {
    id: "editorial",
    label: "Editorial",
    group: "world",
    mood: [0.1, 0.5],
    dials: { warmth: [0, 0.3], contrast: [0.2, 0.5], depth: [0, 0.05] },
    backgrounds: [null, "#FAF7EF", "#F6F1E7", "#1C1B19"],
    buttons: [null, "#111111", "#B3261E"],
    fonts: [
      pair("Newsreader", AXES, "Inter", AXES),
      pair("Fraunces", ":opsz,wght@9..144,400..700", "Source Sans 3", AXES),
      pair("Instrument Serif", "", "Instrument Sans", AXES),
    ],
    people: "initials",
    story: "boxed",
    voice: { tone: "considered", rule: "A point of view, argued: essay-like, specific, unhurried." },
  },
  {
    id: "tech",
    label: "Tech",
    group: "world",
    mood: [0.3, 0.5],
    // A product's look, as shadcn's is: quiet neutrals, one clear blue or black, a clean grotesque; not a terminal
    // (that's Sci-fi; Alex, 2026-10-29).
    dials: { warmth: [-0.3, 0], contrast: [0.1, 0.35], roundness: [0.15, 0.4], depth: [0, 0.15] },
    backgrounds: [null, "#F8FAFC", "#FAFAFA", "#0B0D12"],
    buttons: ["#111111", "#2563EB", "#4F46E5"],
    fonts: [pair("Geist", AXES, "Geist", AXES), pair("Inter", AXES, "Inter", AXES), pair("Space Grotesk", AXES, "Inter", AXES)],
    people: "initials",
    story: "boxed",
    voice: { tone: "precise", rule: "Say what it does, how, and stop. No hype." },
  },
  {
    id: "playful",
    label: "Playful",
    group: "world",
    mood: [0.68, 0.85],
    backgrounds: [null, "#FFF4E8", "#F2F0FF", "#2BB673", "#FF8A5B"],
    buttons: ["#FF7A59", "#7C5CFF", "#00A37A", "#111111"],
    fonts: [pair("Fredoka", AXES, "Nunito", AXES), pair("Baloo 2", AXES, "Quicksand", AXES)],
    people: "photo",
    story: "loud",
    voice: { tone: "playful", rule: "Light and a little cheeky; an emoji where it helps." },
  },
  {
    id: "wacky",
    label: "Wacky",
    group: "world",
    mood: [0.88, 1],
    backgrounds: ["#FFD400", "#FF3EA5", "#3D5AFE", "#00E0A4", null],
    buttons: ["#111111", "#FF3EA5", "#3D5AFE", "#FFD400"],
    fonts: [pair("Shrikhand", "", "DM Sans", AXES), pair("Bungee", "", "Work Sans", AXES), pair("Chango", "", "Nunito", AXES)],
    people: "photo",
    story: "loud",
    voice: { tone: "wild", rule: "Odd, loud, unexpected; capitals and exclamation marks welcome." },
  },
  {
    id: "scifi",
    label: "Sci-fi",
    group: "world",
    mood: [0.35, 0.6],
    dials: { warmth: [-0.6, -0.1], contrast: [0.3, 0.7], roundness: [0, 0.5], depth: [0.3, 0.8] },
    backgrounds: ["#05070D", "#0E1A2B", "#123B3A", "#2A1B4D"],
    buttons: ["#00E5FF", "#B388FF", "#39FF88"],
    fonts: [pair("Orbitron", AXES, "Exo 2", AXES), pair("Michroma", "", "Rajdhani", ":wght@400;500;600;700")],
    people: "initials",
    story: "boxed",
    voice: { tone: "futurist", rule: "Clipped and cinematic, written from a little ahead." },
  },
  {
    id: "fashion",
    label: "Fashion",
    group: "world",
    mood: [0.15, 0.55],
    dials: { contrast: [0.3, 0.7], roundness: [0, 0.15], depth: [0, 0.1] },
    backgrounds: [null, "#F2EDE6", "#111111", "#C9B8A6", "#7A1F2B"],
    buttons: ["#111111", "#FFFFFF", "#7A1F2B"],
    fonts: [pair("Bodoni Moda", ":opsz,wght@6..96,400..700", "Inter", AXES), pair("Syne", AXES, "Inter", AXES), pair("Italiana", "", "Jost", AXES)],
    people: "photo",
    story: "plain",
    voice: { tone: "chic", rule: "Sharp and sure of itself, a little aloof." },
  },
  {
    id: "natural",
    label: "Natural",
    group: "world",
    mood: [0.4, 0.65],
    dials: { warmth: [0.15, 0.5], contrast: [-0.15, 0.15], roundness: [0.5, 1], depth: [0, 0.2] },
    backgrounds: ["#F3EFE4", "#E7EDDF", "#2E5E3A", "#6B8F71", "#D9C9A8"],
    buttons: ["#2E5E3A", "#8A5A2B", "#111111"],
    fonts: [pair("Fraunces", ":opsz,wght@9..144,400..700", "Nunito Sans", AXES), pair("Lora", AXES, "Work Sans", AXES)],
    people: "photo",
    story: "plain",
    voice: { tone: "grounded", rule: "Slow and sensory, close to the ground." },
  },
  // Era (Alex, 2026-10-29): when the look is from.
  {
    id: "retro",
    label: "Retro",
    group: "era",
    // Seventies print and old packaging: warm creams, mustard and rust, chunky serifs, round corners, a little depth.
    mood: [0.45, 0.8],
    dials: { warmth: [0.3, 0.7], contrast: [-0.1, 0.25], roundness: [0.4, 0.9], depth: [0.1, 0.45] },
    backgrounds: ["#F4E9D8", "#F2D7A6", "#E9C46A", "#3B2A20"],
    buttons: ["#D1495B", "#E76F51", "#2A9D8F", "#3B2A20"],
    fonts: [pair("Alfa Slab One", "", "Work Sans", AXES), pair("DM Serif Display", "", "DM Sans", AXES), pair("Righteous", "", "Nunito", AXES)],
    people: "photo",
    story: "loud",
    voice: { tone: "warm", rule: "Nostalgic and a bit of a showman, like an old ad that means it." },
  },
  {
    id: "modern",
    label: "Modern",
    group: "era",
    // Modernism, the Swiss school: white, black and one red, a strict grotesque, square corners, flat.
    mood: [0.2, 0.5],
    dials: { warmth: [-0.1, 0.1], contrast: [0.3, 0.7], roundness: [0, 0.12], depth: [0, 0.02] },
    backgrounds: [null, "#F5F5F0", "#111111"],
    buttons: ["#E30613", "#111111", "#0047BB"],
    fonts: [pair("Inter Tight", AXES, "Inter", AXES), pair("Archivo", AXES, "Archivo", AXES), pair("Instrument Sans", AXES, "Instrument Sans", AXES)],
    people: "initials",
    story: "boxed",
    voice: { tone: "precise", rule: "Form follows function: say it once, in order, nothing ornamental." },
  },
  {
    id: "contemporary",
    label: "Contemporary",
    group: "era",
    // How things look now: soft neutrals, a serif beside a grotesque, rounded corners, flat.
    mood: [0.4, 0.65],
    dials: { warmth: [0, 0.25], contrast: [-0.15, 0.15], roundness: [0.35, 0.75], depth: [0, 0.1] },
    backgrounds: [null, "#F6F5F2", "#EFEDE8", "#E8ECEA"],
    buttons: [null, "#1F1F1F", "#3F5BD9"],
    fonts: [pair("Instrument Serif", "", "Inter", AXES), pair("Bricolage Grotesque", AXES, "Inter", AXES), pair("Manrope", AXES, "Manrope", AXES)],
    people: "photo",
    story: "plain",
    voice: { tone: "considered", rule: "Of now: relaxed, clear, a little understated." },
  },
  {
    id: "futuristic",
    label: "Futuristic",
    group: "era",
    // Ahead of now: dark or icy, cool, a wide geometric face, bright accents, some depth.
    mood: [0.35, 0.65],
    dials: { warmth: [-0.6, -0.1], contrast: [0.2, 0.6], roundness: [0.1, 0.6], depth: [0.2, 0.6] },
    backgrounds: ["#07080C", "#0E1726", "#EEF2F7", null],
    buttons: ["#00E5FF", "#7C5CFF", "#C6FF3D"],
    fonts: [pair("Unbounded", AXES, "Inter", AXES), pair("Space Grotesk", AXES, "Space Grotesk", AXES), pair("Syncopate", ":wght@400;700", "Exo 2", AXES)],
    people: "initials",
    story: "boxed",
    voice: { tone: "futurist", rule: "Written from a little ahead: clipped, confident, no nostalgia." },
  },
];

/** The tracks, in the panel's order: Feel and World take one pick each; Era takes more, as its rules allow. */
export const DS_TASTE_TRACKS: readonly { id: DsTasteGroup; label: string; one: boolean }[] = [
  { id: "feel", label: "Feel", one: true },
  { id: "world", label: "World", one: true },
  { id: "era", label: "Era", one: false },
];

/** Picks that can't stand together (Alex, 2026-10-29: retro and modern can't; retro-futuristic can). */
export const DS_TASTE_EXCLUDES: readonly (readonly [string, string])[] = [
  ["retro", "modern"],
  ["retro", "contemporary"],
  ["modern", "contemporary"],
];

/** Two picks that make a look of their own together, drawn instead of either's backgrounds, buttons and fonts. */
export const DS_TASTE_BLENDS: readonly {
  ids: readonly [string, string];
  label: string;
  backgrounds: readonly (string | null)[];
  buttons: readonly (string | null)[];
  fonts: readonly DsFontPair[];
}[] = [
  {
    ids: ["retro", "futuristic"],
    label: "Retro-futuristic",
    // The future as the sixties and eighties saw it: space-age night blues, sunset orange, chunky rounded display faces.
    backgrounds: ["#1B1035", "#0B1B3F", "#F2E8CF", "#FF6F59"],
    buttons: ["#FF5F1F", "#00C2D1", "#F7B32B"],
    fonts: [pair("Audiowide", "", "Exo 2", AXES), pair("Righteous", "", "Space Grotesk", AXES), pair("Bungee", "", "Exo 2", AXES)],
  },
];

const trackOf = (id: string) => DS_TASTE_TRACKS.find((t) => t.id === DS_TASTES.find((x) => x.id === id)?.group);

/** Whether two tastes can't both be picked: the same one-pick track, or a pair the rules exclude. */
export function dsTastesClash(a: string, b: string): boolean {
  if (a === b) return false;
  const track = trackOf(a);
  if (track?.one && track === trackOf(b)) return true;
  return DS_TASTE_EXCLUDES.some(([x, y]) => (x === a && y === b) || (x === b && y === a));
}

/** The blend the picks make, if any. */
export const dsTasteBlend = (ids: string[]) => DS_TASTE_BLENDS.find((b) => b.ids.every((id) => ids.includes(id)));

/** The picks' names in the tracks' order, a blend named once ("Restrained, Editorial, Retro-futuristic"). */
export function dsTasteNames(ids: string[]): string[] {
  const blend = dsTasteBlend(ids);
  return DS_TASTES.filter((t) => ids.includes(t.id)).flatMap((t) =>
    blend?.ids.includes(t.id) ? (t.id === blend.ids[0] ? [blend.label] : []) : [t.label]
  );
}

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

/** The picks with `id` toggled: picked, it takes off whatever it clashes with (`dsTastesClash`); picked already, it's taken off. */
export function dsPickTaste(picked: string[], id: string): string[] {
  if (picked.includes(id)) return picked.filter((t) => t !== id);
  return [...picked.filter((t) => !dsTastesClash(t, id)), id];
}

/** Tastes at random, a different mix from `not` where there is one: what the dice puts on. */
export function dsRandomTastes(not: string[] = []): string[] {
  const of = (group: DsTasteGroup) => DS_TASTES.filter((t) => t.group === group).map((t) => t.id);
  let next: string[] = [];
  for (let tries = 0; tries < 8; tries++) {
    // A Feel and a World, or one of them; half the time an era too, now and then two that meet.
    const feel = pick(of("feel"));
    const world = pick(of("world"));
    next = Math.random() < 0.7 ? [feel, world] : [pick([feel, world])];
    if (Math.random() < 0.5) {
      const era = pick(of("era"));
      next.push(era);
      const other = pick(of("era"));
      if (Math.random() < 0.3 && !next.includes(other) && !dsTastesClash(era, other)) next.push(other);
    }
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
export function dsShuffleTaste(ids: string[], current: DsCharacter, wide = false): DsTasteDraw {
  const known = DS_TASTES.filter((t) => ids.includes(t.id));
  const tastes = known.length ? known : [pick(DS_TASTES)];
  const meet = meetOf;
  const mood = between(meet(tastes.map((t) => t.mood)));
  const dials: Partial<DsCharacter> = { ...dsMoodDials(mood), depth: 0 };
  for (const key of ["warmth", "contrast", "roundness", "depth"] as const) {
    const ranges = tastes.flatMap((t) => (t.dials?.[key] ? [t.dials[key]!] : []));
    if (ranges.length) dials[key] = between(meet(ranges));
  }
  // `wide` (the dice): reach past the tastes' own choices half the time, a coloured background and any font pair,
  // so a random look is plainly different.
  // A blend's lists stand in for its two tastes' own.
  const blend = dsTasteBlend(tastes.map((t) => t.id));
  const own = tastes.filter((t) => !blend?.ids.includes(t.id));
  const colourful = DS_TASTES.flatMap((t) => t.backgrounds).filter((b): b is string => b !== null);
  let background = pick([...(blend?.backgrounds ?? []), ...own.flatMap((t) => t.backgrounds)]);
  if (wide && !background && Math.random() < 0.5) background = pick(colourful);
  const hsl = background ? dsHexToHsl(background) : null;
  const character: DsCharacter = {
    ...current,
    ...dials,
    tastes: tastes.map((t) => t.id),
    mood,
    hue: hsl && hsl[1] > 0 ? Math.round(hsl[0]) : current.hue,
    colour: hsl ? Math.round(hsl[1] * 100) / 100 : 0,
    brightness: hsl ? Math.round(hsl[2] * 100) / 100 : 1,
  };
  // A button colour that stands out from the page it lands on (a pink button on a pink page doesn't); else the text's.
  const page = dsCharacterBase(character) ?? "#FFFFFF";
  const buttons = [...(blend?.buttons ?? []), ...own.flatMap((t) => t.buttons)].filter((b) => b === null || dsContrast(b, page) >= 2);
  const fonts = [...(blend?.fonts ?? []), ...own.flatMap((t) => t.fonts)];
  const anyFonts = DS_TASTES.flatMap((t) => t.fonts);
  return {
    character,
    fonts: fonts.length ? pick(fonts) : wide ? pick(anyFonts) : null,
    button: buttons.length ? pick(buttons) : null,
  };
}

const tastesOf = (ids: string[]) => DS_TASTES.filter((t) => ids.includes(t.id));

/*
 * The one rail inside Typography and inside Buttons (Alex, 2026-10-29): not
 * Feel and World again in every section, only what's relevant there.
 * Appearance and Fields have none; their dials say it.
 */

/** Typography's rail: a kind of type, each a few font pairs. */
export const DS_TYPE_STYLES: readonly { id: string; label: string; fonts: readonly DsFontPair[] }[] = [
  {
    id: "editorial",
    label: "Editorial",
    fonts: [pair("Newsreader", AXES, "Inter", AXES), pair("Fraunces", ":opsz,wght@9..144,400..700", "Source Sans 3", AXES), pair("Instrument Serif", "", "Instrument Sans", AXES)],
  },
  {
    id: "startup",
    label: "Startup",
    fonts: [pair("Geist", AXES, "Geist", AXES), pair("Inter", AXES, "Inter", AXES), pair("Plus Jakarta Sans", AXES, "Plus Jakarta Sans", AXES)],
  },
  {
    id: "elegant",
    label: "Elegant",
    fonts: [pair("Cormorant Garamond", AXES, "Jost", AXES), pair("Bodoni Moda", ":opsz,wght@6..96,400..700", "Montserrat", AXES), pair("Playfair Display", AXES, "Lato", ":wght@400;700")],
  },
  {
    id: "funky",
    label: "Funky",
    fonts: [pair("Bricolage Grotesque", AXES, "Inter", AXES), pair("Syne", AXES, "Inter", AXES), pair("Archivo Black", "", "Archivo", AXES)],
  },
  {
    id: "quirky",
    label: "Quirky",
    fonts: [pair("Shrikhand", "", "DM Sans", AXES), pair("Fredoka", AXES, "Nunito", AXES), pair("Bungee", "", "Work Sans", AXES)],
  },
];

/** A font pair of a kind of type, at random; null for one that isn't there. */
export function dsTypeStyleFonts(id: string): DsFontPair | null {
  const fonts = DS_TYPE_STYLES.find((s) => s.id === id)?.fonts;
  return fonts?.length ? pick(fonts) : null;
}

/** Buttons' rail: a kind of button, as a roundness and a depth (the gradient, outline and text shadow it brings). */
export const DS_BUTTON_LOOKS: readonly { id: string; label: string; roundness: number; depth: number }[] = [
  // A product's, as shadcn's are: a small radius, flat.
  { id: "product", label: "Product", roundness: 0.32, depth: 0 },
  { id: "soft", label: "Soft", roundness: 1, depth: 0 },
  { id: "sharp", label: "Sharp", roundness: 0, depth: 0 },
  // A gradient, an outline and a shadowed label: something to press.
  { id: "tactile", label: "Tactile", roundness: 0.4, depth: 0.75 },
  { id: "chunky", label: "Chunky", roundness: 0.6, depth: 0.45 },
];

/** How a story's words sit on its photo in a look: the loudest way any taste picked asks for; by mood with none. */
export function dsTasteStory(ids: string[], mood: number): "boxed" | "plain" | "loud" {
  const stories = tastesOf(ids).map((t) => t.story);
  if (stories.includes("loud")) return "loud";
  if (stories.includes("plain")) return "plain";
  if (stories.length) return "boxed";
  return mood >= 0.7 ? "loud" : mood >= 0.55 ? "plain" : "boxed";
}

/** A look's voice: the tone its copy is written in (the World's, else the Feel's, else the Era's) and the rules of the tastes picked. */
export function dsTasteVoice(ids: string[], mood: number): { tone: DsTone; rules: string[] } {
  const tastes = tastesOf(ids);
  const world = tastes.find((t) => t.group === "world");
  const feel = tastes.find((t) => t.group === "feel");
  const era = tastes.find((t) => t.group === "era");
  const tone: DsTone = world?.voice.tone ?? feel?.voice.tone ?? era?.voice.tone ?? (mood >= 0.88 ? "wild" : mood >= 0.65 ? "playful" : "calm");
  return { tone, rules: tastes.map((t) => t.voice.rule) };
}

/** Whether a story's words sit tilted, as a person places them: only in a playful or wacky look. */
export function dsTasteTilt(ids: string[], mood: number): boolean {
  return ids.includes("playful") || ids.includes("wacky") || (!ids.length && mood >= 0.7);
}

/** How people show in a look: their photo when any taste picked is a friendly one, else their initials. */
export function dsTastePeople(ids: string[], mood: number): "photo" | "initials" {
  const tastes = DS_TASTES.filter((t) => ids.includes(t.id));
  if (tastes.length) return tastes.some((t) => t.people === "photo") ? "photo" : "initials";
  return mood >= 0.6 ? "photo" : "initials";
}
