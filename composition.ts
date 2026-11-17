/**
 * Composition: the part of a style that isn't a value. Where things sit on a
 * page, how big they are next to each other, how sections are marked. Two
 * themes can share every colour and font and still be different styles; this
 * is what tells them apart.
 *
 * It is a handful of choices, each with the sentence an agent is given for
 * it (`says`), so the same data draws the board's pages and writes the
 * exported style. `layout` is per kind of page, not one switch for the site:
 * hybrid is "pages that present use the width, pages that are read sit in a
 * column".
 *
 * A theme also carries a `brief`: the reference in one sentence ("a Swiss
 * poster from the 1960s, set as a website") and its signature moves, the few
 * gestures that make it recognisable. Words, written by the maker; nothing
 * is worked out from them.
 */

export type DsComposition = {
  /** Where content sits, by kind of page. */
  layout: "inline" | "hybrid" | "full";
  align: "centre" | "left";
  /** How big type is, and how far the biggest is from the smallest. */
  scale: "small" | "regular" | "loud";
  /** How much room sits between sections. */
  density: "tight" | "regular" | "airy";
  /** What separates and holds things. */
  structure: "plain" | "ruled" | "cards" | "boxed";
  /** How a section is named. */
  labels: "none" | "eyebrow" | "bracket" | "tag";
  /** Parts counted: 01, 02, 03. */
  numbered: boolean;
  /** How a page opens. */
  hero: "statement" | "split" | "poster";
};

export type DsBrief = {
  /** The style in one sentence: a specific reference, not adjectives. */
  reference: string;
  /** Its signature moves, a line each. */
  moves: string[];
};

export const DS_DEFAULT_COMPOSITION: DsComposition = {
  layout: "inline",
  align: "centre",
  scale: "regular",
  density: "airy",
  structure: "plain",
  labels: "none",
  numbered: false,
  hero: "statement",
};

export const DS_DEFAULT_BRIEF: DsBrief = { reference: "", moves: [] };

type Choice<K extends keyof DsComposition> = {
  key: K;
  label: string;
  options: readonly { id: DsComposition[K] & string; label: string; says: string }[];
};

/** Every choice but `numbered`, in the order the panel shows them, with what each tells an agent. */
export const DS_COMPOSITION_CHOICES: readonly [
  Choice<"layout">,
  Choice<"align">,
  Choice<"scale">,
  Choice<"density">,
  Choice<"structure">,
  Choice<"labels">,
  Choice<"hero">,
] = [
  {
    key: "layout",
    label: "Layout",
    options: [
      { id: "inline", label: "Inline", says: "Everything sits in one reading column, about 640px wide, whatever the page." },
      {
        id: "hybrid",
        label: "Hybrid",
        says: "Pages that present (a home page, a shop) use the width, up to about 1200px. Anything meant to be read (an article) sits in a column about 640px wide.",
      },
      {
        id: "full",
        label: "Full width",
        says: "Pages run edge to edge on a 12-column grid. Text takes some of the columns; it is never a centred column with empty sides.",
      },
    ],
  },
  {
    key: "align",
    label: "Alignment",
    options: [
      { id: "centre", label: "Centred", says: "Headlines and openings are centred." },
      { id: "left", label: "Left", says: "Everything hangs from the left edge; nothing is centred." },
    ],
  },
  {
    key: "scale",
    label: "Scale",
    options: [
      { id: "small", label: "Small", says: "Type stays small everywhere, headlines included. Pictures and space do the talking." },
      { id: "regular", label: "Regular", says: "Type is at a normal reading scale, with clear steps between headline, heading and text." },
      {
        id: "loud",
        label: "Loud",
        says: "Type is very large. A headline is about a tenth of the screen's width tall, and running text is well above normal, around 24 to 40px on a desktop.",
      },
    ],
  },
  {
    key: "density",
    label: "Density",
    options: [
      { id: "tight", label: "Tight", says: "Sections sit close together; the page is dense." },
      { id: "regular", label: "Regular", says: "Sections have ordinary room between them." },
      { id: "airy", label: "Airy", says: "Sections are far apart. Empty space is part of the design; leave it empty." },
    ],
  },
  {
    key: "structure",
    label: "Structure",
    options: [
      { id: "plain", label: "Plain", says: "Space alone separates things: no rules, boxes or cards." },
      { id: "ruled", label: "Ruled", says: "A hairline rule opens every section and sits above every item in a list." },
      { id: "cards", label: "Cards", says: "Groups of things sit on cards, on the cards-and-panels colour." },
      { id: "boxed", label: "Boxed", says: "Content sits in bordered cells that share their edges, like a table or a dashboard." },
    ],
  },
  {
    key: "labels",
    label: "Labels",
    options: [
      { id: "none", label: "None", says: "Sections aren't labelled; their headings are enough." },
      { id: "eyebrow", label: "Eyebrow", says: "A small uppercase label sits above each section's heading." },
      { id: "bracket", label: "Brackets", says: "Each section is named by a small label in brackets, like (Work)." },
      { id: "tag", label: "Tags", says: "Sections and items carry pill-shaped tags." },
    ],
  },
  {
    key: "hero",
    label: "Opening",
    options: [
      { id: "statement", label: "Statement", says: "A page opens with words alone: one headline, no picture." },
      { id: "split", label: "Split", says: "A page opens with words on one side and a picture on the other." },
      { id: "poster", label: "Poster", says: "A page opens with a picture across the full width and the headline over it." },
    ],
  },
];

const NUMBERED_SAYS = "Parts are counted: 01, 02, 03.";

/** A stored composition, cleaned: anything unknown falls back to Parabola's own. */
export function parseDsComposition(value: unknown): DsComposition {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const out = { ...DS_DEFAULT_COMPOSITION } as Record<string, unknown>;
  for (const choice of DS_COMPOSITION_CHOICES) {
    if (choice.options.some((o) => o.id === raw[choice.key])) out[choice.key] = raw[choice.key];
  }
  out.numbered = raw.numbered === true;
  return out as DsComposition;
}

/** A stored brief, cleaned: a sentence and up to eight short moves. */
export function parseDsBrief(value: unknown): DsBrief {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const line = (v: unknown, max: number) => (typeof v === "string" ? v.replace(/\s+/g, " ").trim().slice(0, max) : "");
  return {
    reference: line(raw.reference, 400),
    moves: Array.isArray(raw.moves) ? raw.moves.map((m) => line(m, 200)).filter(Boolean).slice(0, 8) : [],
  };
}

/** The composition as an agent is told it, a sentence per choice. */
export function dsCompositionWords(c: DsComposition): string[] {
  const lines = DS_COMPOSITION_CHOICES.map((choice) => {
    const option = (choice.options as readonly { id: string; says: string }[]).find((o) => o.id === c[choice.key]);
    return option ? `${choice.label}: ${option.says}` : "";
  }).filter(Boolean);
  return c.numbered ? [...lines, `Numbering: ${NUMBERED_SAYS}`] : lines;
}

/** The composition in a few words, for a label: "Full width, left, loud". */
export function dsCompositionLabel(c: DsComposition): string {
  const of = (key: "layout" | "align" | "scale") =>
    (DS_COMPOSITION_CHOICES.find((x) => x.key === key)!.options as readonly { id: string; label: string }[]).find((o) => o.id === c[key])?.label ?? "";
  return [of("layout"), of("align"), of("scale")].join(", ").toLowerCase().replace(/^./, (m) => m.toUpperCase());
}
