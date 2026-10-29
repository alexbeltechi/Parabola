/**
 * Taste (Alex, 2026-10-29): two things, the way people describe a brand,
 * its aesthetics and its personality.
 *
 * - **Style**, the aesthetics: one rail, one pick, as tabs are, never none
 *   (Default, Minimal, Editorial, Elegant, Tech, Natural, Retro, Sport;
 *   `DS_TASTES`). A style chooses a chip on each section's rail: a palette
 *   in Colour (`DS_PALETTES`), a kind of type in Typography
 *   (`DS_TYPE_STYLES`), a kind of button in Buttons (`DS_BUTTON_LOOKS`).
 *   Parabola's own is Default.
 * - **Mood**, the personality: a bar from Restrained through Balanced and
 *   Playful to Wacky (character.ts). Moving it changes the look you can see
 *   inside the style: the soberer or the wilder of the type's fonts, flatter
 *   or rounder and deeper buttons, quieter or more saturated colour and a
 *   livelier button colour (`dsThemeWithMood`), and how it speaks (a calm
 *   voice at one end, a wild one at the other).
 *
 * A style is a recipe, not one fixed look: picking it draws a look inside
 * it at the mood set (`dsShuffleTaste`); › draws another. A chip can be
 * picked by hand after. (A Feel track, a World track and an Era with rules
 * between its picks came first, the same day; Alex: "too much going on".
 * Fashion became Elegant, which Luxury and Sci-fi were too close to: Luxury
 * went into it, Sci-fi into Tech.)
 *
 * These lists are meant to grow. An agent adds a style, a chip, a font pair
 * or a colour from what's current (font trends, a Figma file, Mobbin, an
 * awards site) as a line here, so every theme can reach it; one look a
 * maker asks for is dials and overrides on their theme, not a new style.
 */
import { DS_DEFAULT_BUTTON_STYLE, type DsButtonStyle } from "./button-style";
import { dsCharacterBase, type DsCharacter, type DsFontPair } from "./character";
import { dsContrast, dsHexToHsv } from "./colours";

type Range = readonly [number, number];

/** The tones a look speaks in. */
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
 * The chips on the sections' rails. Every list the mood moves along runs
 * from restrained to wacky.
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
  { id: "neutral", label: "Neutral", backgrounds: [null, "#FAFAFA", "#F4F4F5", "#09090B"], buttons: ["#18181B", null, "#2563EB"], contrast: [0.05, 0.3] },
  { id: "earthy", label: "Earthy", backgrounds: ["#F3EFE4", "#E7EDDF", "#D9C9A8", "#2E5E3A"], buttons: ["#2E5E3A", "#8A5A2B", "#B5532E"], contrast: [-0.15, 0.15] },
  { id: "pastel", label: "Pastel", backgrounds: ["#FFF4E8", "#F2F0FF", "#EEF6F1", "#FDEFF4"], buttons: ["#2F6FEB", "#00A37A", "#7C5CFF", "#FF7A59"], contrast: [-0.25, 0] },
  { id: "vibrant", label: "Vibrant", backgrounds: ["#FFE600", "#FF4F00", "#0F766E", "#FF3EA5", "#3D5AFE"], buttons: ["#111111", "#2F2BFF", "#FFFFFF"], contrast: [0.3, 0.7] },
  // A team's: white or black, one loud primary, hard contrast.
  { id: "sport", label: "Sport", backgrounds: [null, "#111111", "#F2F2F2"], buttons: ["#111111", "#0057FF", "#E10600", "#C6FF3D"], contrast: [0.4, 0.8] },
  { id: "rich", label: "Rich", backgrounds: ["#F5F1EA", "#121212", "#1E2A24", "#3B2F2A", "#7A1F2B"], buttons: ["#111111", "#8C6A43", "#C9A96E"], contrast: [0.1, 0.4] },
  { id: "vintage", label: "Vintage", backgrounds: ["#F4E9D8", "#F2D7A6", "#E9C46A", "#3B2A20"], buttons: ["#3B2A20", "#2A9D8F", "#D1495B", "#E76F51"], contrast: [-0.1, 0.25] },
  { id: "neon", label: "Neon", backgrounds: ["#05070D", "#0E1A2B", "#2A1B4D", "#1B1035"], buttons: ["#00E5FF", "#B388FF", "#39FF88", "#FF5F1F"], contrast: [0.3, 0.7] },
];

/** Typography's chips: a kind of type, its font pairs from the most restrained to the wackiest; Classic is Parabola's own. */
export const DS_TYPE_STYLES: readonly { id: string; label: string; fonts: readonly DsFontPair[] }[] = [
  { id: "classic", label: "Classic", fonts: [] },
  {
    id: "editorial",
    label: "Editorial",
    fonts: [
      pair("Newsreader", AXES, "Inter", AXES),
      pair("Instrument Serif", "", "Instrument Sans", AXES),
      pair("Fraunces", ":opsz,wght@9..144,400..700", "Source Sans 3", AXES),
      pair("Abril Fatface", "", "Work Sans", AXES),
    ],
  },
  {
    id: "startup",
    label: "Startup",
    fonts: [
      pair("Inter Tight", AXES, "Inter", AXES),
      pair("Geist", AXES, "Geist", AXES),
      pair("Plus Jakarta Sans", AXES, "Plus Jakarta Sans", AXES),
      pair("Bricolage Grotesque", AXES, "Inter", AXES),
    ],
  },
  {
    id: "elegant",
    label: "Elegant",
    fonts: [
      pair("Bodoni Moda", ":opsz,wght@6..96,400..700", "Montserrat", AXES),
      pair("Cormorant Garamond", AXES, "Jost", AXES),
      pair("Playfair Display", AXES, "Lato", ":wght@400;700"),
      pair("Italiana", "", "Jost", AXES),
    ],
  },
  {
    id: "friendly",
    label: "Friendly",
    fonts: [
      pair("Work Sans", AXES, "Work Sans", AXES),
      pair("DM Sans", AXES, "DM Sans", AXES),
      pair("Nunito", AXES, "Nunito", AXES),
      pair("Fredoka", AXES, "Nunito", AXES),
    ],
  },
  {
    id: "funky",
    label: "Funky",
    fonts: [
      pair("Archivo Black", "", "Archivo", AXES),
      pair("Syne", AXES, "Inter", AXES),
      pair("Bricolage Grotesque", AXES, "Inter", AXES),
      pair("Bungee", "", "Work Sans", AXES),
    ],
  },
  {
    id: "quirky",
    label: "Quirky",
    fonts: [
      pair("Bungee", "", "Work Sans", AXES),
      pair("Fredoka", AXES, "Nunito", AXES),
      pair("Shrikhand", "", "DM Sans", AXES),
      pair("Chango", "", "Nunito", AXES),
    ],
  },
  {
    id: "retro",
    label: "Retro",
    fonts: [
      pair("DM Serif Display", "", "DM Sans", AXES),
      pair("Alfa Slab One", "", "Work Sans", AXES),
      pair("Righteous", "", "Nunito", AXES),
      pair("Bagel Fat One", "", "Nunito", AXES),
    ],
  },
  {
    id: "futurist",
    label: "Futurist",
    fonts: [
      pair("Michroma", "", "Rajdhani", ":wght@400;500;600;700"),
      pair("Space Grotesk", AXES, "Space Grotesk", AXES),
      pair("Audiowide", "", "Exo 2", AXES),
      pair("Orbitron", AXES, "Exo 2", AXES),
    ],
  },
];

/**
 * Buttons' chips: a kind of button, its roundness and depth (gradient,
 * outline, shadowed label) from restrained to wacky; Outline and Text have
 * no fill, the label in the button colour (`style`).
 */
export const DS_BUTTON_LOOKS: readonly { id: string; label: string; roundness: Range; depth: Range; style?: Partial<DsButtonStyle> }[] = [
  // A product's, as shadcn's are: a small radius, flat.
  { id: "product", label: "Product", roundness: [0.15, 0.5], depth: [0, 0.2] },
  // Parabola's own: fully round, flat.
  { id: "soft", label: "Soft", roundness: [1, 1], depth: [0, 0.3] },
  { id: "sharp", label: "Sharp", roundness: [0, 0.1], depth: [0, 0.3] },
  { id: "outline", label: "Outline", roundness: [0, 1], depth: [0, 0], style: { fill: "none", outline: true, outlineWidth: 1 } },
  { id: "text", label: "Text", roundness: [0.5, 1], depth: [0, 0], style: { fill: "none" } },
  // Something to press.
  { id: "tactile", label: "Tactile", roundness: [0.3, 0.7], depth: [0.5, 0.95] },
  { id: "chunky", label: "Chunky", roundness: [0.45, 0.9], depth: [0.3, 0.8] },
];

/** A kind of button's own look where it has one (no fill), else null: the depth decides (character.ts). */
export function dsButtonLookStyle(id: string | undefined): DsButtonStyle | null {
  const style = DS_BUTTON_LOOKS.find((l) => l.id === id)?.style;
  return style ? { ...DS_DEFAULT_BUTTON_STYLE, ...style } : null;
}

/** A style: the chips it reaches for in each section, and how its people show, its stories read and it speaks. */
export type DsTaste = {
  id: string;
  label: string;
  palettes: readonly string[];
  types: readonly string[];
  buttons: readonly string[];
  /** How people show (an avatar): their photo, friendly; or their initials, branded. */
  people: "photo" | "initials";
  /**
   * How words sit on a story's photo (as Instagram sets them, line by line):
   * boxed in the page colour (branded), plain in white (candid), or loud on
   * the button colour (playful; any style at a playful mood).
   */
  story: "boxed" | "plain" | "loud";
  /**
   * How it speaks: a tone (which the preview's copy is written in) and one
   * rule of voice, for the brand's statement and for an agent writing in it.
   */
  voice: { tone: DsTone; rule: string };
};

export const DS_TASTES: DsTaste[] = [
  {
    id: "default",
    label: "Default",
    // Parabola's own: its white, its fonts, its round buttons.
    palettes: ["classic"],
    types: ["classic"],
    buttons: ["soft"],
    people: "initials",
    story: "boxed",
    voice: { tone: "calm", rule: "Plain words and short sentences; nothing shouted." },
  },
  {
    id: "minimal",
    label: "Minimal",
    // As little as it takes: white or grey, one grotesque, buttons that are barely there.
    palettes: ["classic", "neutral"],
    types: ["startup"],
    buttons: ["text", "outline", "sharp"],
    people: "initials",
    story: "boxed",
    voice: { tone: "calm", rule: "As few words as it takes; let the space speak." },
  },
  {
    id: "editorial",
    label: "Editorial",
    palettes: ["classic", "earthy"],
    types: ["editorial"],
    buttons: ["sharp", "soft"],
    people: "initials",
    story: "boxed",
    voice: { tone: "considered", rule: "A point of view, argued: essay-like, specific, unhurried." },
  },
  {
    id: "elegant",
    label: "Elegant",
    // A refined serif, rich colour, square buttons (it was Fashion for a day; Alex: "most definitely not fashion").
    palettes: ["rich", "classic"],
    types: ["elegant"],
    buttons: ["sharp", "outline"],
    people: "photo",
    story: "plain",
    voice: { tone: "elegant", rule: "Few words, chosen slowly; never a hard sell." },
  },
  {
    id: "tech",
    label: "Tech",
    // A product's look, as shadcn's is, and now and then a further-out, sci-fi one.
    palettes: ["neutral", "neutral", "neon"],
    types: ["startup", "startup", "futurist"],
    buttons: ["product", "tactile"],
    people: "initials",
    story: "boxed",
    voice: { tone: "precise", rule: "Say what it does, how, and stop. No hype." },
  },
  {
    id: "natural",
    label: "Natural",
    palettes: ["earthy"],
    types: ["editorial", "friendly"],
    buttons: ["soft"],
    people: "photo",
    story: "plain",
    voice: { tone: "grounded", rule: "Slow and sensory, close to the ground." },
  },
  {
    id: "retro",
    label: "Retro",
    // Seventies print and old packaging.
    palettes: ["vintage"],
    types: ["retro"],
    buttons: ["tactile", "chunky"],
    people: "photo",
    story: "plain",
    voice: { tone: "warm", rule: "Nostalgic and a bit of a showman, like an old ad that means it." },
  },
  {
    id: "sport",
    label: "Sport",
    palettes: ["sport", "vibrant"],
    types: ["funky"],
    buttons: ["chunky", "sharp"],
    people: "initials",
    story: "loud",
    voice: { tone: "loud", rule: "Short, strong statements, verbs first." },
  },
];

/** The personality along the Mood bar: from where it starts, how a look speaks (the style's own tone in the middle). */
const PERSONALITY: readonly { from: number; tone: DsTone | null; rule: string | null }[] = [
  { from: 0, tone: "calm", rule: "Plain words and short sentences; nothing shouted." },
  { from: 0.2, tone: null, rule: null },
  { from: 0.68, tone: "playful", rule: "Light and a little cheeky; an emoji where it helps." },
  { from: 0.88, tone: "wild", rule: "Odd, loud, unexpected; capitals and exclamation marks welcome." },
];

const personality = (mood: number) => [...PERSONALITY].reverse().find((p) => mood >= p.from) ?? PERSONALITY[0];

/**
 * What a draw sets: the character (its chips among it), a font pair (null:
 * Parabola's), the button colour (null: the text's) and the buttons' own
 * look where the kind has one (null: from the depth).
 */
export type DsTasteDraw = { character: DsCharacter; fonts: DsFontPair | null; button: string | null; buttonStyle: DsButtonStyle | null };

const pick = <T>(list: readonly T[]): T => list[Math.floor(Math.random() * list.length)];
const between = ([lo, hi]: Range) => Math.round((lo + Math.random() * (hi - lo)) * 100) / 100;
const along = ([lo, hi]: Range, mood: number) => Math.round((lo + mood * (hi - lo)) * 100) / 100;
/** The one of a list a mood lands on, the first at 0, the last at 1. */
const at = <T>(list: readonly T[], mood: number): T => list[Math.min(list.length - 1, Math.floor(mood * list.length))];
const styleOf = (ids: string[]) => DS_TASTES.find((t) => ids.includes(t.id));

/** The style picked: one at a time, as tabs are; there's always one. */
export function dsPickTaste(_picked: string[], id: string): string[] {
  return [id];
}

/** A style at random, another than `not`'s: what the dice puts on. */
export function dsRandomTastes(not: string[] = []): string[] {
  const others = DS_TASTES.filter((t) => !not.includes(t.id));
  return [pick(others.length ? others : DS_TASTES).id];
}

/** The styles' names picked, for the brand's statement. */
export function dsTasteNames(ids: string[]): string[] {
  return DS_TASTES.filter((t) => ids.includes(t.id)).map((t) => t.label);
}

/** Where on the Mood bar each of a kind of type's four font pairs takes over: restrained, balanced, playful, wacky. */
const FONT_STOPS = [0, 0.38, 0.68, 0.88];

/** A font pair of a kind of type at a mood; null for Classic (Parabola's own). */
export function dsTypeStyleFonts(id: string, mood: number): DsFontPair | null {
  const fonts = DS_TYPE_STYLES.find((s) => s.id === id)?.fonts ?? [];
  if (!fonts.length) return null;
  const stop = FONT_STOPS.filter((s) => mood >= s).length - 1;
  return fonts[Math.min(fonts.length - 1, Math.max(0, stop))];
}

/**
 * A kind of button at a mood: its roundness along its range, the restrained
 * end at 0; its depth at its least up to Balanced, rising from there to
 * Wacky, so a balanced button is as flat as its kind is.
 */
export function dsButtonLookAt(id: string, mood: number): Pick<DsCharacter, "roundness" | "depth"> | null {
  const look = DS_BUTTON_LOOKS.find((l) => l.id === id);
  return look ? { roundness: along(look.roundness, mood), depth: along(look.depth, Math.max(0, mood * 2 - 1)) } : null;
}

/**
 * A palette's button colour at a mood, among those that stand out from the
 * page it lands on (a pink button on a pink page doesn't): the quieter at
 * the restrained end, the livelier toward wacky; else the text's.
 */
export function dsPaletteButton(id: string, character: DsCharacter, mood: number): string | null {
  const palette = DS_PALETTES.find((p) => p.id === id);
  if (!palette) return null;
  const page = dsCharacterBase(character) ?? "#FFFFFF";
  const buttons = palette.buttons.filter((b) => b === null || dsContrast(b, page) >= 2);
  return buttons.length ? at(buttons, mood) : null;
}

/** How much the mood saturates a colour: less when restrained, more when wacky, as it was at Balanced. */
export const dsMoodSaturation = (mood: number) => 0.4 + 1.2 * mood;

/**
 * A palette drawn at a mood: one of its backgrounds (as the hue,
 * saturation and brightness dials, saturated by the mood), a contrast inside
 * its range, and its button colour at that mood.
 */
export function dsPaletteDraw(
  id: string,
  current: DsCharacter,
  mood = current.mood
): { character: Pick<DsCharacter, "hue" | "colour" | "brightness" | "contrast">; button: string | null } {
  const palette = DS_PALETTES.find((p) => p.id === id) ?? DS_PALETTES[0];
  const background = pick(palette.backgrounds);
  const hsv = background ? dsHexToHsv(background) : null;
  const character = {
    hue: hsv && hsv.s > 0 ? Math.round(hsv.h) : current.hue,
    colour: hsv ? Math.round(Math.min(1, (hsv.s * dsMoodSaturation(mood)) / dsMoodSaturation(0.5)) * 100) / 100 : 0,
    brightness: hsv ? Math.round(hsv.v * 100) / 100 : 1,
    contrast: between(palette.contrast),
  };
  return { character, button: dsPaletteButton(palette.id, { ...current, ...character }, mood) };
}

/**
 * A look drawn inside the style picked (one at random with none): a chip
 * for each section from its lists, and that combination at the mood set.
 * `wide` (the dice) draws a mood too, and reaches past the style's own
 * palette and type half the time, so a random look is plainly different.
 */
export function dsShuffleTaste(ids: string[], current: DsCharacter, wide = false): DsTasteDraw {
  const style = styleOf(ids) ?? pick(DS_TASTES);
  const mood = wide ? between([0.1, 0.95]) : current.mood;
  const colour = wide && Math.random() < 0.5 ? pick(DS_PALETTES).id : pick(style.palettes);
  const type = wide && Math.random() < 0.5 ? pick(DS_TYPE_STYLES).id : pick(style.types);
  const buttons = pick(style.buttons);
  const drawn = dsPaletteDraw(colour, current, mood);
  return {
    character: {
      ...current,
      ...drawn.character,
      ...dsButtonLookAt(buttons, mood),
      tastes: [style.id],
      scoped: { colour, type, buttons },
      mood,
    },
    fonts: dsTypeStyleFonts(type, mood),
    button: drawn.button,
    buttonStyle: dsButtonLookStyle(buttons),
  };
}

/** How a story's words sit on its photo in a look: loud at a playful mood, else the style's way; by mood with none. */
export function dsTasteStory(ids: string[], mood: number): "boxed" | "plain" | "loud" {
  if (mood >= 0.68) return "loud";
  return styleOf(ids)?.story ?? (mood >= 0.55 ? "plain" : "boxed");
}

/** A look's voice: the personality's tone at either end, the style's in between; the style's rule and the personality's. */
export function dsTasteVoice(ids: string[], mood: number): { tone: DsTone; rules: string[] } {
  const style = styleOf(ids);
  const p = personality(mood);
  const tone: DsTone = p.tone ?? style?.voice.tone ?? "calm";
  return { tone, rules: [style?.voice.rule, p.rule].filter((r): r is string => Boolean(r)) };
}

/** Whether a story's words sit tilted, as a person places them: only at a playful mood or wackier. */
export function dsTasteTilt(_ids: string[], mood: number): boolean {
  return mood >= 0.68;
}

/** How people show in a look: their photo in a friendly style or at a lively mood, else their initials. */
export function dsTastePeople(ids: string[], mood: number): "photo" | "initials" {
  return styleOf(ids)?.people === "photo" || mood >= 0.6 ? "photo" : "initials";
}
