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
 * How the parts fit (Alex, 2026-10-29): the taste pills choose a
 * combination, one chip on each section's rail: a palette in Colour
 * (`DS_PALETTES`), a kind of type in Typography (`DS_TYPE_STYLES`), a kind
 * of button in Buttons (`DS_BUTTON_LOOKS`). Each taste names the chips it
 * reaches for; the picks together take the chips most of them name. The
 * Mood bar then fine-tunes that combination, serious to playful: where in
 * each kind's range it sits (a sharper or a rounder button, the soberer or
 * the livelier of its font pairs). A chip can be picked by hand after.
 *
 * Which picks can stand together is a rule, not a habit of the panel
 * (`dsTastesClash`): Feel and World take one pick each, as tabs do
 * (Restrained and Bold can't both be true); Era takes more than one, except
 * where `DS_TASTE_EXCLUDES` says two can't meet (retro and modern can't;
 * retro and futuristic can). Two that meet in a look of their own, as retro
 * and futuristic do, have a blend (`DS_TASTE_BLENDS`) that chooses instead
 * of either.
 *
 * These lists are meant to grow. An agent adds a taste, a chip, a font pair
 * or a colour from what's current (font trends, a Figma file, Mobbin, an
 * awards site) as a line here, so every theme can reach it; one look a
 * maker asks for is dials and overrides on their theme, not a new taste.
 */
import { dsCharacterBase, type DsCharacter, type DsFontPair } from "./character";
import { dsContrast, dsHexToHsv } from "./colours";

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

const pair = (heading: string, headingAxes: string, body: string, bodyAxes: string): DsFontPair => ({
  heading: { label: heading, google: `${heading.replace(/ /g, "+")}${headingAxes}` },
  body: { label: body, google: `${body.replace(/ /g, "+")}${bodyAxes}` },
});

const AXES = ":wght@400..700";

/*
 * The chips on the sections' rails. Each list a mood moves along runs from
 * serious to playful.
 */

/** Colour's chips: backgrounds (null: white) and button colours (null: the text's) to reach for, and how far the greys sit. */
export type DsPalette = {
  id: string;
  label: string;
  backgrounds: readonly (string | null)[];
  buttons: readonly (string | null)[];
  contrast: Range;
};

export const DS_PALETTES: readonly DsPalette[] = [
  // Parabola's own: white, black buttons.
  { id: "classic", label: "Classic", backgrounds: [null], buttons: [null], contrast: [0, 0] },
  // A startup's: whites and zinc greys, near-black or one clear blue.
  { id: "neutral", label: "Neutral", backgrounds: [null, "#FAFAFA", "#F4F4F5", "#09090B"], buttons: ["#18181B", "#2563EB", null], contrast: [0.05, 0.3] },
  { id: "earthy", label: "Earthy", backgrounds: ["#F3EFE4", "#E7EDDF", "#D9C9A8", "#2E5E3A"], buttons: ["#2E5E3A", "#8A5A2B", "#B5532E"], contrast: [-0.15, 0.15] },
  { id: "pastel", label: "Pastel", backgrounds: ["#FFF4E8", "#F2F0FF", "#EEF6F1", "#FDEFF4"], buttons: ["#7C5CFF", "#FF7A59", "#2F6FEB", "#00A37A"], contrast: [-0.25, 0] },
  { id: "vibrant", label: "Vibrant", backgrounds: ["#FFE600", "#FF4F00", "#0F766E", "#FF3EA5", "#3D5AFE"], buttons: ["#111111", "#FFFFFF", "#2F2BFF"], contrast: [0.3, 0.7] },
  // A team's: white or black, one loud primary, hard contrast.
  { id: "sport", label: "Sport", backgrounds: [null, "#111111", "#F2F2F2"], buttons: ["#E10600", "#0057FF", "#C6FF3D", "#111111"], contrast: [0.4, 0.8] },
  { id: "rich", label: "Rich", backgrounds: ["#F5F1EA", "#121212", "#1E2A24", "#3B2F2A", "#7A1F2B"], buttons: ["#111111", "#8C6A43", "#C9A96E"], contrast: [0.1, 0.4] },
  { id: "vintage", label: "Vintage", backgrounds: ["#F4E9D8", "#F2D7A6", "#E9C46A", "#3B2A20"], buttons: ["#D1495B", "#E76F51", "#2A9D8F", "#3B2A20"], contrast: [-0.1, 0.25] },
  { id: "neon", label: "Neon", backgrounds: ["#05070D", "#0E1A2B", "#2A1B4D", "#1B1035"], buttons: ["#00E5FF", "#B388FF", "#39FF88", "#FF5F1F"], contrast: [0.3, 0.7] },
];

/** Typography's chips: a kind of type, its font pairs from the soberest to the liveliest; Classic is Parabola's own. */
export const DS_TYPE_STYLES: readonly { id: string; label: string; fonts: readonly DsFontPair[] }[] = [
  { id: "classic", label: "Classic", fonts: [] },
  {
    id: "editorial",
    label: "Editorial",
    fonts: [pair("Newsreader", AXES, "Inter", AXES), pair("Instrument Serif", "", "Instrument Sans", AXES), pair("Fraunces", ":opsz,wght@9..144,400..700", "Source Sans 3", AXES)],
  },
  {
    id: "startup",
    label: "Startup",
    fonts: [pair("Inter Tight", AXES, "Inter", AXES), pair("Geist", AXES, "Geist", AXES), pair("Plus Jakarta Sans", AXES, "Plus Jakarta Sans", AXES)],
  },
  {
    id: "elegant",
    label: "Elegant",
    fonts: [pair("Bodoni Moda", ":opsz,wght@6..96,400..700", "Montserrat", AXES), pair("Cormorant Garamond", AXES, "Jost", AXES), pair("Playfair Display", AXES, "Lato", ":wght@400;700")],
  },
  {
    id: "friendly",
    label: "Friendly",
    fonts: [pair("Work Sans", AXES, "Work Sans", AXES), pair("DM Sans", AXES, "DM Sans", AXES), pair("Nunito", AXES, "Nunito", AXES)],
  },
  {
    id: "funky",
    label: "Funky",
    fonts: [pair("Archivo Black", "", "Archivo", AXES), pair("Syne", AXES, "Inter", AXES), pair("Bricolage Grotesque", AXES, "Inter", AXES)],
  },
  {
    id: "quirky",
    label: "Quirky",
    fonts: [pair("Bungee", "", "Work Sans", AXES), pair("Fredoka", AXES, "Nunito", AXES), pair("Shrikhand", "", "DM Sans", AXES)],
  },
  {
    id: "retro",
    label: "Retro",
    fonts: [pair("DM Serif Display", "", "DM Sans", AXES), pair("Alfa Slab One", "", "Work Sans", AXES), pair("Righteous", "", "Nunito", AXES)],
  },
  {
    id: "futurist",
    label: "Futurist",
    fonts: [pair("Michroma", "", "Rajdhani", ":wght@400;500;600;700"), pair("Space Grotesk", AXES, "Space Grotesk", AXES), pair("Audiowide", "", "Exo 2", AXES)],
  },
];

/** Buttons' chips: a kind of button, its roundness and depth (gradient, outline, shadowed label) from serious to playful. */
export const DS_BUTTON_LOOKS: readonly { id: string; label: string; roundness: Range; depth: Range }[] = [
  // A product's, as shadcn's are: a small radius, flat.
  { id: "product", label: "Product", roundness: [0.2, 0.45], depth: [0, 0] },
  // Parabola's own: round, flat.
  { id: "soft", label: "Soft", roundness: [0.9, 1], depth: [0, 0] },
  { id: "sharp", label: "Sharp", roundness: [0, 0.07], depth: [0, 0] },
  // Something to press.
  { id: "tactile", label: "Tactile", roundness: [0.3, 0.6], depth: [0.6, 0.9] },
  { id: "chunky", label: "Chunky", roundness: [0.5, 0.85], depth: [0.35, 0.6] },
];

/** The chips a taste reaches for, by section. */
type Chips = { palettes: readonly string[]; types: readonly string[]; buttons: readonly string[] };

export type DsTaste = Chips & {
  id: string;
  label: string;
  group: DsTasteGroup;
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

export const DS_TASTES: DsTaste[] = [
  // Feel
  {
    id: "restrained",
    label: "Restrained",
    group: "feel",
    palettes: ["classic", "neutral"],
    types: ["classic"],
    buttons: ["soft", "product"],
    people: "initials",
    story: "boxed",
    voice: { tone: "calm", rule: "Plain words and short sentences; nothing shouted." },
  },
  {
    id: "technical",
    label: "Technical",
    group: "feel",
    // Precise and quiet, as a well-made tool is (shadcn's look).
    palettes: ["neutral"],
    types: ["startup"],
    buttons: ["product"],
    people: "initials",
    story: "boxed",
    voice: { tone: "precise", rule: "Exact and useful: name the thing, say what it does." },
  },
  {
    id: "approachable",
    label: "Approachable",
    group: "feel",
    palettes: ["pastel", "classic"],
    types: ["friendly"],
    buttons: ["soft"],
    people: "photo",
    story: "plain",
    voice: { tone: "warm", rule: "Warm and direct, as if talking to a friend." },
  },
  {
    id: "luxurious",
    label: "Luxurious",
    group: "feel",
    palettes: ["rich"],
    types: ["elegant"],
    buttons: ["sharp"],
    people: "initials",
    story: "boxed",
    voice: { tone: "elegant", rule: "Few words, chosen slowly; never a hard sell." },
  },
  {
    id: "bold",
    label: "Bold",
    group: "feel",
    palettes: ["vibrant", "sport"],
    types: ["funky"],
    buttons: ["chunky", "sharp"],
    people: "initials",
    story: "loud",
    voice: { tone: "loud", rule: "Short, strong statements, verbs first." },
  },
  {
    id: "candid",
    label: "Candid",
    group: "feel",
    palettes: ["classic", "earthy"],
    types: ["friendly"],
    buttons: ["soft"],
    people: "photo",
    story: "plain",
    voice: { tone: "candid", rule: "First person and unpolished, honest about the mess." },
  },
  // World
  {
    id: "editorial",
    label: "Editorial",
    group: "world",
    palettes: ["classic", "earthy"],
    types: ["editorial"],
    buttons: ["sharp", "soft"],
    people: "initials",
    story: "boxed",
    voice: { tone: "considered", rule: "A point of view, argued: essay-like, specific, unhurried." },
  },
  {
    id: "tech",
    label: "Tech",
    group: "world",
    // A product's look, not a terminal (that's Sci-fi; Alex, 2026-10-29).
    palettes: ["neutral"],
    types: ["startup"],
    buttons: ["product"],
    people: "initials",
    story: "boxed",
    voice: { tone: "precise", rule: "Say what it does, how, and stop. No hype." },
  },
  {
    id: "playful",
    label: "Playful",
    group: "world",
    palettes: ["pastel", "vibrant"],
    types: ["friendly", "quirky"],
    buttons: ["soft", "chunky"],
    people: "photo",
    story: "loud",
    voice: { tone: "playful", rule: "Light and a little cheeky; an emoji where it helps." },
  },
  {
    id: "wacky",
    label: "Wacky",
    group: "world",
    palettes: ["vibrant"],
    types: ["quirky"],
    buttons: ["chunky"],
    people: "photo",
    story: "loud",
    voice: { tone: "wild", rule: "Odd, loud, unexpected; capitals and exclamation marks welcome." },
  },
  {
    id: "scifi",
    label: "Sci-fi",
    group: "world",
    palettes: ["neon"],
    types: ["futurist"],
    buttons: ["tactile", "sharp"],
    people: "initials",
    story: "boxed",
    voice: { tone: "futurist", rule: "Clipped and cinematic, written from a little ahead." },
  },
  {
    id: "fashion",
    label: "Fashion",
    group: "world",
    palettes: ["classic", "rich"],
    types: ["elegant", "funky"],
    buttons: ["sharp"],
    people: "photo",
    story: "plain",
    voice: { tone: "chic", rule: "Sharp and sure of itself, a little aloof." },
  },
  {
    id: "natural",
    label: "Natural",
    group: "world",
    palettes: ["earthy"],
    types: ["editorial", "friendly"],
    buttons: ["soft"],
    people: "photo",
    story: "plain",
    voice: { tone: "grounded", rule: "Slow and sensory, close to the ground." },
  },
  // Era (Alex, 2026-10-29): when the look is from.
  {
    id: "retro",
    label: "Retro",
    group: "era",
    // Seventies print and old packaging.
    palettes: ["vintage"],
    types: ["retro"],
    buttons: ["tactile", "chunky"],
    people: "photo",
    story: "loud",
    voice: { tone: "warm", rule: "Nostalgic and a bit of a showman, like an old ad that means it." },
  },
  {
    id: "modern",
    label: "Modern",
    group: "era",
    // Modernism, the Swiss school: white, black and one red, a strict grotesque, square corners.
    palettes: ["classic", "sport"],
    types: ["startup"],
    buttons: ["sharp"],
    people: "initials",
    story: "boxed",
    voice: { tone: "precise", rule: "Form follows function: say it once, in order, nothing ornamental." },
  },
  {
    id: "contemporary",
    label: "Contemporary",
    group: "era",
    // How things look now.
    palettes: ["classic", "neutral", "pastel"],
    types: ["editorial", "startup"],
    buttons: ["soft", "product"],
    people: "photo",
    story: "plain",
    voice: { tone: "considered", rule: "Of now: relaxed, clear, a little understated." },
  },
  {
    id: "futuristic",
    label: "Futuristic",
    group: "era",
    palettes: ["neon", "neutral"],
    types: ["futurist"],
    buttons: ["tactile", "product"],
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

/** Two picks that make a look of their own together: their chips stand in for either's. */
export const DS_TASTE_BLENDS: readonly (Chips & { ids: readonly [string, string]; label: string })[] = [
  {
    ids: ["retro", "futuristic"],
    label: "Retro-futuristic",
    // The future as the sixties and eighties saw it: night blues and sunset orange, chunky rounded faces.
    palettes: ["neon"],
    types: ["retro", "futurist"],
    buttons: ["tactile", "chunky"],
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

/** What a draw sets: the character (its chips among it), a font pair (null: Parabola's), and the button colour (null: the text's). */
export type DsTasteDraw = { character: DsCharacter; fonts: DsFontPair | null; button: string | null };

const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];
const between = ([lo, hi]: Range) => Math.round((lo + Math.random() * (hi - lo)) * 100) / 100;
const along = ([lo, hi]: Range, mood: number) => Math.round((lo + mood * (hi - lo)) * 100) / 100;
const tastesOf = (ids: string[]) => DS_TASTES.filter((t) => ids.includes(t.id));

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

/** One section's chip for the picks: the one most of them name (a blend speaking for its two), at random among a tie. */
function chipFor(ids: string[], key: keyof Chips): string {
  const blend = dsTasteBlend(ids);
  const voters: Chips[] = [...(blend ? [blend] : []), ...tastesOf(ids).filter((t) => !blend?.ids.includes(t.id))];
  const votes = new Map<string, number>();
  for (const v of voters) for (const id of v[key]) votes.set(id, (votes.get(id) ?? 0) + 1);
  const most = Math.max(...votes.values());
  return pick([...votes].filter(([, n]) => n === most).map(([id]) => id));
}

/** A font pair of a kind of type at a mood, the soberest at 0, the liveliest at 1; null for Classic (Parabola's own). */
export function dsTypeStyleFonts(id: string, mood: number): DsFontPair | null {
  const fonts = DS_TYPE_STYLES.find((s) => s.id === id)?.fonts ?? [];
  return fonts.length ? fonts[Math.min(fonts.length - 1, Math.floor(mood * fonts.length))] : null;
}

/** A kind of button at a mood: its roundness and depth, the serious end at 0. */
export function dsButtonLookAt(id: string, mood: number): Pick<DsCharacter, "roundness" | "depth"> | null {
  const look = DS_BUTTON_LOOKS.find((l) => l.id === id);
  return look ? { roundness: along(look.roundness, mood), depth: along(look.depth, mood) } : null;
}

/**
 * A palette drawn: one of its backgrounds (as the hue, saturation and
 * brightness dials), a contrast inside its range, and a button colour that
 * stands out from the background it lands on (a pink button on a pink page
 * doesn't); else the text's.
 */
export function dsPaletteDraw(
  id: string,
  current: DsCharacter
): { character: Pick<DsCharacter, "hue" | "colour" | "brightness" | "contrast">; button: string | null } {
  const palette = DS_PALETTES.find((p) => p.id === id) ?? DS_PALETTES[0];
  const background = pick(palette.backgrounds);
  const hsv = background ? dsHexToHsv(background) : null;
  const character = {
    hue: hsv && hsv.s > 0 ? Math.round(hsv.h) : current.hue,
    colour: hsv ? Math.round(hsv.s * 100) / 100 : 0,
    brightness: hsv ? Math.round(hsv.v * 100) / 100 : 1,
    contrast: between(palette.contrast),
  };
  const page = dsCharacterBase({ ...current, ...character }) ?? "#FFFFFF";
  const buttons = palette.buttons.filter((b) => b === null || dsContrast(b, page) >= 2);
  return { character, button: buttons.length ? pick(buttons) : null };
}

/**
 * A look drawn inside the tastes picked (one at random with none): a chip
 * for each section from them, a mood somewhere between serious and playful,
 * and that combination at that mood. `wide` (the dice) reaches past their
 * own palette and type half the time, so a random look is plainly different.
 */
export function dsShuffleTaste(ids: string[], current: DsCharacter, wide = false): DsTasteDraw {
  const known = tastesOf(ids).map((t) => t.id);
  const picks = known.length ? known : [pick(DS_TASTES).id];
  const mood = between([0.2, 0.8]);
  const colour = wide && Math.random() < 0.5 ? pick(DS_PALETTES).id : chipFor(picks, "palettes");
  const type = wide && Math.random() < 0.5 ? pick(DS_TYPE_STYLES).id : chipFor(picks, "types");
  const buttons = chipFor(picks, "buttons");
  const drawn = dsPaletteDraw(colour, current);
  return {
    character: {
      ...current,
      ...drawn.character,
      ...dsButtonLookAt(buttons, mood),
      tastes: picks,
      scoped: { colour, type, buttons },
      mood,
    },
    fonts: dsTypeStyleFonts(type, mood),
    button: drawn.button,
  };
}

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
  const tastes = tastesOf(ids);
  if (tastes.length) return tastes.some((t) => t.people === "photo") ? "photo" : "initials";
  return mood >= 0.6 ? "photo" : "initials";
}
