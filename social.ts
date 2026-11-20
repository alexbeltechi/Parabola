/**
 * Social: the style where the frame is a post, not a page. A carousel slide
 * or a reel has no scroll and no browser, so what makes it this style and
 * not another is a short list of rigid rules: the frame's shape, how far
 * anything sits from its edge, how text sits on a picture, how a slide is
 * signed.
 *
 * Like composition (composition.ts), it is a handful of choices, each with
 * the sentence an agent is given for it (`says`), so the same data draws the
 * Social board and writes the exported style. Colours and fonts are the
 * theme's own; social only says how few of them it uses.
 *
 * Every length is a share of the frame's width, given here at 1080 wide, so
 * it holds at any size. The type sizes and a reel's safe areas are fixed for
 * every style (DS_SOCIAL_TYPE, DS_SOCIAL_REEL): a phone held at arm's length
 * doesn't change with the brand.
 */

export type DsSocial = {
  /** The shape of a post and of every slide in a carousel. A reel is always 9:16. */
  frame: "3:4" | "4:5" | "1:1";
  /** How far text and marks stay from the frame's edge. */
  edge: "tight" | "regular" | "wide";
  /** How text sits on a picture: in one box, in a band behind each line, straight on it, or straight on it with a shadow. */
  text: "mixed" | "boxed" | "wrapped" | "plain" | "shadow";
  /** The corners of a box or of the bands behind the lines. */
  corners: "square" | "rounded";
  /** One font for everything, or the theme's two. */
  fonts: "two" | "one";
  align: "left" | "centre" | "right";
  /** How a slide is signed. */
  signature: "none" | "ends" | "every";
};

export const DS_DEFAULT_SOCIAL: DsSocial = {
  frame: "3:4",
  edge: "regular",
  text: "mixed",
  corners: "square",
  fonts: "two",
  align: "centre",
  signature: "ends",
};

/** The width every length here is given at. */
export const DS_SOCIAL_WIDTH = 1080;

/** A post's height at 1080 wide, by frame. */
export const DS_SOCIAL_FRAMES: Record<DsSocial["frame"], number> = { "3:4": 1440, "4:5": 1350, "1:1": 1080 };

/** The edge distance at 1080 wide, by choice. */
export const DS_SOCIAL_EDGES: Record<DsSocial["edge"], number> = { tight: 36, regular: 54, wide: 90 };

/** A text box's padding, and the room between things stacked at one anchor, at 1080 wide. */
export const DS_SOCIAL_GAP = 18;

/** Type on a frame 1080 wide: size and line height. Fixed for every style. */
export const DS_SOCIAL_TYPE = {
  display: { size: 126, leading: 1.05, heading: true },
  h1: { size: 90, leading: 1.1, heading: true },
  h2: { size: 63, leading: 1.15, heading: true },
  // A reel's captions: one size and one font for all of them, the body font, a little bigger than a sentence.
  caption: { size: 54, leading: 1.2, heading: false },
  p: { size: 45, leading: 1.25, heading: false },
  small: { size: 36, leading: 1.25, heading: false },
} as const;

/**
 * A reel: 1080 × 1920, with the room the app covers. A tall phone shows the video full screen and crops its sides,
 * so the clear area is narrower than the video: the status bar at the top; the name, caption and tab bar at the
 * bottom; the like, comment, repost and send column on the right; the cropped strip on the left.
 */
export const DS_SOCIAL_REEL = { height: 1920, top: 220, bottom: 500, right: 240, left: 100 } as const;

type Choice<K extends keyof DsSocial> = {
  key: K;
  label: string;
  options: readonly { id: DsSocial[K]; label: string; says: string }[];
};

/** Every choice, in the order the panel shows them, with what each tells an agent. */
export const DS_SOCIAL_CHOICES: readonly [
  Choice<"frame">,
  Choice<"edge">,
  Choice<"text">,
  Choice<"corners">,
  Choice<"fonts">,
  Choice<"align">,
  Choice<"signature">,
] = [
  {
    key: "frame",
    label: "Post size",
    options: [
      { id: "3:4", label: "3:4", says: "A post and every slide of a carousel is 3:4, 1080 × 1440px, the shape Instagram's grid shows." },
      { id: "4:5", label: "4:5", says: "A post and every slide of a carousel is 4:5, 1080 × 1350px." },
      { id: "1:1", label: "1:1", says: "A post and every slide of a carousel is square, 1080 × 1080px." },
    ],
  },
  {
    key: "edge",
    label: "Edge",
    options: [
      { id: "tight", label: "Tight", says: "No text or mark comes closer to the frame's edge than 36px (at 1080 wide). Things sit on that line, not somewhere inside it." },
      { id: "regular", label: "Regular", says: "No text or mark comes closer to the frame's edge than 54px (at 1080 wide). Things sit on that line, not somewhere inside it." },
      { id: "wide", label: "Wide", says: "No text or mark comes closer to the frame's edge than 90px (at 1080 wide). Things sit on that line, not somewhere inside it." },
    ],
  },
  {
    key: "text",
    label: "Text on pictures",
    options: [
      {
        id: "mixed",
        label: "Mixed",
        says: "Text on a picture or a video is set two ways. A title, or one line said over a calm picture, sits straight on it in the heading font and the page colour, no box, no shadow. Sentences and captions sit in a solid box: the page colour as the box, the text colour for the words, 18px of padding, several boxes stacked 18px apart, a box as wide as its words.",
      },
      {
        id: "boxed",
        label: "Boxed",
        says: "Text on a picture or a video sits in a solid box: the page colour as the box, the text colour for the words, as on the site, 18px of padding. Several boxes stack 18px apart; a box is as wide as its words, never the frame.",
      },
      {
        id: "wrapped",
        label: "Wrapped",
        says: "Text on a picture or a video has a band behind each line, as wide as that line's words, the bands joined into one shape: the page colour as the band, the text colour for the words. Never one box around all of it.",
      },
      { id: "plain", label: "Plain", says: "Text on a picture or a video sits straight on it, in white, with no box and no shadow. Put it where the picture is calm." },
      {
        id: "shadow",
        label: "Shadow",
        says: "Text on a picture or a video sits straight on it, in white, with a tight shadow under it (4.5px down, 4.5px blur, 40% black, at 1080 wide) so it reads on any picture.",
      },
    ],
  },
  {
    key: "corners",
    label: "Corners",
    options: [
      { id: "square", label: "Square", says: "A box or a band behind text has square corners." },
      { id: "rounded", label: "Rounded", says: "A box or a band behind text has rounded corners, 18px (at 1080 wide), where bands of different widths meet too." },
    ],
  },
  {
    key: "fonts",
    label: "Fonts",
    options: [
      { id: "two", label: "Two", says: "Statements and titles are in the heading font, sentences and captions in the body font." },
      { id: "one", label: "One", says: "One font, the body font, for everything; size alone makes a title." },
    ],
  },
  {
    key: "align",
    label: "Alignment",
    options: [
      { id: "left", label: "Left", says: "Text hangs from the left edge line; on a colour, a statement starts at the top left." },
      { id: "centre", label: "Centred", says: "Text is centred; on a colour, a statement sits in the middle of the frame." },
      { id: "right", label: "Right", says: "Text hangs from the right edge line; on a colour, a statement starts at the top right." },
    ],
  },
  {
    key: "signature",
    label: "Signature",
    options: [
      { id: "none", label: "None", says: "Slides aren't signed." },
      { id: "ends", label: "First and last", says: "The first and the last slide carry the name, small, on the bottom edge line." },
      { id: "every", label: "Every slide", says: "Every slide carries the name, small, on the bottom edge line." },
    ],
  },
];

/** A stored social style, cleaned: anything unknown falls back to Parabola's own. */
export function parseDsSocial(value: unknown): DsSocial {
  const raw = (value && typeof value === "object" ? value : {}) as Record<string, unknown>;
  const out = { ...DS_DEFAULT_SOCIAL } as Record<string, unknown>;
  for (const choice of DS_SOCIAL_CHOICES) {
    if ((choice.options as readonly { id: string }[]).some((o) => o.id === raw[choice.key])) out[choice.key] = raw[choice.key];
  }
  return out as DsSocial;
}

/** The rules every style shares, as an agent is told them. */
const FIXED = [
  `Type (size/line height at 1080 wide): ${Object.entries(DS_SOCIAL_TYPE)
    .map(([name, t]) => `${name} ${t.size}/${Math.round(t.size * t.leading)}`)
    .join(", ")}. Use these sizes and no others; one display or h1 statement a slide at most.`,
  `Reels and stories: 9:16, 1080 × ${DS_SOCIAL_REEL.height}px. Keep text out of the top ${DS_SOCIAL_REEL.top}px, the bottom ${DS_SOCIAL_REEL.bottom}px and the left ${DS_SOCIAL_REEL.left}px, and, in the lower half only, the right ${DS_SOCIAL_REEL.right}px: a tall phone crops the sides, and the app's own name, caption and tab bar sit at the bottom, its buttons down the right of the lower half. In the upper half, text is centred on the whole screen. Captions are short, one thought a scene, all in the caption size and the body font, aligned as the style aligns. A caption sits in one of three places and nowhere else: on the top line of the clear area, in its middle, or on its bottom line. Pick the one where the picture is calm, never over a face. A reel may open on a title instead: h1, in the heading font, straight on the picture in the page colour with no box, where the picture is calm.`,
  "Text straight on a picture or a video is the page colour (the light one), never pure white unless the page is white.",
  "Colour: pictures aside, a carousel uses the page colour, the text colour and the accent, and opens on the page colour. The accent is a ground for one slide at most.",
  "Every length is a share of the frame's width: scale them together for another size.",
  "Text, marks, pictures and video only. Nothing that looks like a button.",
];

/** The social style as an agent is told it: a sentence per choice, then the rules every style shares. */
export function dsSocialWords(s: DsSocial): string[] {
  // Corners say nothing when text has no box or band.
  const lines = DS_SOCIAL_CHOICES.filter((choice) => !(choice.key === "corners" && (s.text === "plain" || s.text === "shadow"))).map((choice) => {
    const option = (choice.options as readonly { id: string; says: string }[]).find((o) => o.id === s[choice.key]);
    return option ? `${choice.label}: ${option.says}` : "";
  });
  return [...lines.filter(Boolean), ...FIXED];
}
