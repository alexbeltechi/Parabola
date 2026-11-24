/**
 * Taste: two things, the way people describe a brand,
 * its aesthetics and its personality.
 *
 * - **Style**, the aesthetics: one rail, one pick, as tabs are, never none
 *   (Classic, Minimal, Elegant, Tech, Natural, Retro, Sport; `DS_TASTES`).
 *   A style chooses a chip on each section's rail: a palette in Colour
 *   (`DS_PALETTES`), a kind of type in Typography (`DS_TYPE_STYLES`), a kind
 *   of button in Buttons (`DS_BUTTON_LOOKS`). Its first pick of each is its
 *   own look; › draws variations from the rest. Parabola's own is Classic.
 * - **Mood**, the personality: a slider from Serious through Balanced to
 *   Wacky (character.ts). Moving it changes the look you can see
 *   inside the style: the soberer or the wilder of the type's fonts, flatter
 *   or rounder and deeper buttons, quieter or more saturated colour and a
 *   livelier button colour (`dsThemeWithMood`), and how it speaks (a calm
 *   voice at one end, a wild one at the other).
 *
 * A style is a recipe, not one fixed look: picking it draws a look inside
 * it at the mood set (`dsShuffleTaste`); › draws another. A chip can be
 * picked by hand after. (A Feel track, a World track and an Era with rules
 * between its picks came first, the same day, and was too much going on.
 * Fashion became Elegant, which Luxury and Sci-fi were too close to: Luxury
 * went into it, Sci-fi into Tech. Default and Editorial became Classic.
 * Gradients stay off every style; Tactile is there to pick by hand.)
 *
 * These lists are meant to grow. An agent adds a style, a chip, a font pair
 * or a colour from what's current (font trends, a Figma file, Mobbin, an
 * awards site) as a line here, so every theme can reach it; one look a
 * maker asks for is dials and overrides on their theme, not a new style.
 */
import { DS_DEFAULT_BUTTON_STYLE, type DsButtonStyle } from "./button-style";
import { dsCharacterBase, type DsCharacter, type DsFontPair } from "./character";
import { dsContrast, dsHexToHsl } from "./colours";

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

/**
 * Five, each a page that is nearly neutral with one colour that carries it
 * (as the sites that last are built: a cream page with one deep red, a faint
 * lavender page with black buttons), never several loud colours at once. A
 * palette's first background and first button are its own look, what picking
 * it gives; the rest are what picking it again, or the dice, draws.
 */
export const DS_PALETTES: readonly DsPalette[] = [
  // Paper: warm off-whites, stone ink. Black buttons, or one deep red.
  // Its own look's button (the middle, at a balanced mood) is the text's own colour.
  { id: "classic", label: "Paper", backgrounds: ["#F8F5F0", "#F3F0EA", "#EEE9E0", null], buttons: ["#1C1917", null, "#B0182B"], contrast: [0, 0.1] },
  // No colour at all: white, greys, black.
  { id: "neutral", label: "Black and white", backgrounds: [null, "#FAFAFA", "#F4F4F5", "#0A0A0A"], buttons: [null, "#0A0A0A", "#52525B"], contrast: [0.05, 0.3] },
  // Clay, sand and moss, muted.
  { id: "earthy", label: "Earthy", backgrounds: ["#F3EEE3", "#EAE4D3", "#E3E7DA", "#2B3328"], buttons: ["#3D4A36", "#8A5A2B", "#A4492B"], contrast: [-0.1, 0.15] },
  // A faint tint of one colour, and a soft mid-tone of it for the buttons. Never bright.
  { id: "pastel", label: "Pastel", backgrounds: ["#F3F1FB", "#FBF0F1", "#EEF5F0", "#FAF3E3", "#EDF3FA"], buttons: ["#6F63B8", "#B5677C", "#4F8F7B", "#5B7FB5", null], contrast: [-0.2, 0] },
  // Dark, with one bright colour on it.
  { id: "neon", label: "Neon", backgrounds: ["#0B0B10", "#0E1420", "#15111F"], buttons: ["#C6FF3D", "#00E5FF", "#FF5F1F", "#B388FF"], contrast: [0.3, 0.6] },
];

/**
 * Typography's chips: a kind of type, its four font pairs from the most
 * serious to the wackiest: the playful one plainly playful, the wacky one a
 * retro display face. Classic's balanced one is
 * Parabola's own (null), its others keep Parabola's text face under another
 * headline. Elegant has no Didones (Bodoni, Playfair): Garamonds and a
 * flared roman.
 */
export const DS_TYPE_STYLES: readonly { id: string; label: string; fonts: readonly (DsFontPair | null)[] }[] = [
  {
    id: "classic",
    label: "Classic",
    fonts: [
      pair("Newsreader", AXES, "Geist", AXES),
      null,
      pair("Bricolage Grotesque", AXES, "Geist", AXES),
      pair("Shrikhand", "", "Geist", AXES),
    ],
  },
  // Swiss: the grotesques of the International style, set tight. (Was Startup; Editorial, too near Classic, went.)
  {
    id: "swiss",
    label: "Swiss",
    fonts: [
      pair("Inter Tight", AXES, "Inter", AXES),
      pair("Geist", AXES, "Geist", AXES),
      pair("Bricolage Grotesque", AXES, "Inter", AXES),
      pair("Righteous", "", "Inter", AXES),
    ],
  },
  {
    id: "elegant",
    label: "Elegant",
    fonts: [
      pair("EB Garamond", AXES, "Jost", AXES),
      pair("Cormorant Garamond", AXES, "Montserrat", AXES),
      pair("Marcellus", "", "Jost", AXES),
      pair("Cinzel Decorative", ":wght@400;700", "Jost", AXES),
    ],
  },
  // Humanist: sans serifs drawn from handwriting, open and warm, the popular Google Fonts ones. (Was Friendly.)
  {
    id: "humanist",
    label: "Humanist",
    fonts: [
      pair("Source Sans 3", AXES, "Source Sans 3", AXES),
      pair("Fira Sans", ":wght@400;500;600;700", "Fira Sans", ":wght@400;500;600;700"),
      pair("Open Sans", AXES, "Open Sans", AXES),
      pair("Alegreya Sans", ":wght@400;500;700", "Alegreya Sans", ":wght@400;500;700"),
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
      // A soft, lighter seventies serif first; the heavier display faces further along.
      pair("Fraunces", AXES, "DM Sans", AXES),
      pair("Young Serif", "", "Work Sans", AXES),
      pair("DM Serif Display", "", "DM Sans", AXES),
      pair("Righteous", "", "Nunito", AXES),
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
 * Buttons' chips: a kind of button, its roundness (and Tactile's depth:
 * gradient, outline, shadowed label) from serious to wacky; Outline and Text
 * have no fill, the label in the button colour, Chunky a thick edge
 * (`style`).
 */
export const DS_BUTTON_LOOKS: readonly { id: string; label: string; roundness: Range; depth: Range; style?: Partial<DsButtonStyle> }[] = [
  // A product's, as shadcn's are: a small radius, flat.
  { id: "product", label: "Product", roundness: [0.15, 0.5], depth: [0, 0] },
  // Parabola's own: fully round, flat.
  { id: "soft", label: "Soft", roundness: [1, 1], depth: [0, 0] },
  { id: "sharp", label: "Sharp", roundness: [0, 0.1], depth: [0, 0] },
  { id: "outline", label: "Outline", roundness: [0, 1], depth: [0, 0], style: { fill: "none", outline: true, outlineWidth: 1 } },
  { id: "text", label: "Text", roundness: [0.5, 1], depth: [0, 0], style: { fill: "none" } },
  // Something to press: the one with a gradient, to pick by hand (no gradients in the styles).
  { id: "tactile", label: "Tactile", roundness: [0.3, 0.7], depth: [0.5, 0.95] },
  // Solid with a thick edge, no gradient.
  { id: "chunky", label: "Chunky", roundness: [0.45, 0.9], depth: [0, 0], style: { outline: true, outlineWidth: 2 } },
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
  /**
   * The type's contrast it sits in (character.ts `ink`;
   * different styles have different contrast levels): 1 full, lower an
   * ink of the page's hue. Its own look takes the middle; Shuffle and the
   * dice draw inside it.
   */
  ink: Range;
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
    id: "classic",
    label: "Classic",
    ink: [1, 1],
    // Paper first (its fonts, its round buttons), then an earthier page, serif and square.
    palettes: ["classic", "earthy"],
    types: ["classic"],
    buttons: ["soft", "product"],
    people: "initials",
    story: "boxed",
    voice: { tone: "considered", rule: "A point of view, argued: essay-like, specific, unhurried." },
  },
  {
    id: "minimal",
    label: "Minimal",
    ink: [0.9, 1],
    // As little as it takes: white or grey, one grotesque, square buttons (Text is there to pick by hand).
    palettes: ["classic", "neutral"],
    types: ["swiss"],
    buttons: ["sharp", "outline"],
    people: "initials",
    story: "boxed",
    voice: { tone: "calm", rule: "As few words as it takes; let the space speak." },
  },
  {
    id: "elegant",
    label: "Elegant",
    ink: [0.55, 0.85],
    // A refined serif, rich colour, square buttons (briefly called Fashion, which it isn't).
    palettes: ["classic", "earthy"],
    types: ["elegant"],
    buttons: ["sharp", "outline"],
    people: "photo",
    story: "plain",
    voice: { tone: "elegant", rule: "Few words, chosen slowly; never a hard sell." },
  },
  {
    id: "tech",
    label: "Tech",
    ink: [0.9, 1],
    // A product's look, as shadcn's is, and now and then a further-out, sci-fi one.
    palettes: ["neutral", "neutral", "neon"],
    types: ["swiss", "swiss", "futurist"],
    // Fully round, now and then a product's small radius (square is Minimal's).
    buttons: ["soft", "soft", "product"],
    people: "initials",
    story: "boxed",
    voice: { tone: "precise", rule: "Say what it does, how, and stop. No hype." },
  },
  {
    id: "natural",
    label: "Natural",
    ink: [0.45, 0.75],
    palettes: ["earthy"],
    types: ["classic", "humanist"],
    buttons: ["soft"],
    people: "photo",
    story: "plain",
    voice: { tone: "grounded", rule: "Slow and sensory, close to the ground." },
  },
  {
    id: "retro",
    label: "Retro",
    ink: [0.4, 0.7],
    // Seventies print and old packaging.
    palettes: ["earthy", "pastel"],
    types: ["retro"],
    buttons: ["chunky", "soft"],
    people: "photo",
    story: "plain",
    voice: { tone: "warm", rule: "Nostalgic and a bit of a showman, like an old ad that means it." },
  },
  {
    id: "sport",
    label: "Sport",
    ink: [1, 1],
    // Vibrant, athletic: volt, black, electric blue; neon on dark now and then.
    palettes: ["neon", "neutral"],
    types: ["funky"],
    buttons: ["sharp", "chunky"],
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

/** A font pair of a kind of type at a mood; null for Parabola's own. */
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
 * A palette drawn at a mood: one of its backgrounds (as the hue, colour
 * and brightness dials, the colour stronger as the mood is livelier, the
 * temperature neutral), a contrast inside
 * its range, and its button colour at that mood.
 */
export function dsPaletteDraw(
  id: string,
  current: DsCharacter,
  mood = current.mood,
  first = false
): { character: Pick<DsCharacter, "hue" | "colour" | "brightness" | "warmth" | "contrast">; button: string | null } {
  const palette = DS_PALETTES.find((p) => p.id === id) ?? DS_PALETTES[0];
  const background = first ? palette.backgrounds[0] : pick(palette.backgrounds);
  const hsl = background ? dsHexToHsl(background) : null;
  const character = {
    hue: hsl && hsl[1] > 0 ? Math.round(hsl[0]) : current.hue,
    colour: hsl ? Math.round(Math.min(1, (hsl[1] * dsMoodSaturation(mood)) / dsMoodSaturation(0.5)) * 100) / 100 : 0,
    brightness: hsl ? Math.round(hsl[2] * 100) / 100 : 1,
    warmth: 0,
    contrast: first ? along(palette.contrast, 0.5) : between(palette.contrast),
  };
  return { character, button: dsPaletteButton(palette.id, { ...current, ...character }, mood) };
}

/**
 * A look drawn inside the style picked (one at random with none), at the
 * mood set: `first`, the style's own look, the first of each of its lists
 * and the middle of its type contrast (Classic at Balanced is Parabola's
 * own); `vary` (Shuffle, Next), any of them, a type contrast inside its
 * range; `wide`
 * (the dice), a mood too, and past the style's own palette and type
 * half the time, so a random look is plainly different.
 */
export function dsShuffleTaste(ids: string[], current: DsCharacter, how: "first" | "vary" | "wide" = "vary"): DsTasteDraw {
  const style = styleOf(ids) ?? pick(DS_TASTES);
  const first = how === "first";
  const wide = how === "wide";
  const choose = <T>(list: readonly T[]) => (first ? list[0] : pick(list));
  const mood = wide ? between([0.05, 0.95]) : current.mood;
  const colour = wide && Math.random() < 0.5 ? pick(DS_PALETTES).id : choose(style.palettes);
  const type = wide && Math.random() < 0.5 ? pick(DS_TYPE_STYLES).id : choose(style.types);
  const buttons = choose(style.buttons);
  const drawn = dsPaletteDraw(colour, current, mood, first);
  return {
    character: {
      ...current,
      ...drawn.character,
      ...dsButtonLookAt(buttons, mood),
      ink: first ? along(style.ink, 0.5) : between(style.ink),
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
