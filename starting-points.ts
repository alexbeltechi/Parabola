/**
 * Starting points: whole styles to begin from, each a different kind of
 * site, so the range Parabola covers is something to look at and not a
 * promise. One is a full theme: values (a page colour, a button colour, a
 * pair of fonts, a kind of button), a composition and a brief
 * (composition.ts). Picking one replaces the open theme with it; every
 * control still tunes it after.
 *
 * They are archetypes, named for the kind of site, not copies of anyone's.
 * The primitives underneath are the same for all of them: that is the test
 * of "fixed below, free above".
 */
import type { DsFontPair } from "./character";
import { DS_DEFAULT_CHARACTER } from "./character";
import { DS_DEFAULT_COLOURS } from "./colours";
import type { DsBrief, DsComposition } from "./composition";
import { dsButtonLookAt, dsButtonLookStyle } from "./taste";
import { DS_DEFAULT_THEME, dsThemeWithFonts, type DsThemeConfig } from "./theme";

const AXES = ":wght@400..700";
const face = (label: string, axes = AXES) => ({ label, google: `${label.replace(/ /g, "+")}${axes}` });
const fonts = (heading: string, body: string, headingAxes = AXES): DsFontPair => ({ heading: face(heading, headingAxes), body: face(body) });

export type DsStartingPoint = {
  id: string;
  name: string;
  /** The kind of site it's for, in a few words. */
  kind: string;
  theme: DsThemeConfig;
};

function point(
  id: string,
  name: string,
  kind: string,
  look: {
    page: string | null;
    button: string | null;
    fonts: DsFontPair | null;
    /** The chips the Theme page's rails show for it. */
    chips: { colour: string; type: string; buttons: string };
    composition: DsComposition;
    brief: DsBrief;
  }
): DsStartingPoint {
  const dials = dsButtonLookAt(look.chips.buttons, 0.5);
  const theme = dsThemeWithFonts(
    {
      ...DS_DEFAULT_THEME,
      character: {
        ...DS_DEFAULT_CHARACTER,
        scoped: look.chips,
        roundness: dials?.roundness ?? DS_DEFAULT_CHARACTER.roundness,
        depth: dials?.depth ?? DS_DEFAULT_CHARACTER.depth,
      },
      colours: {
        ...DS_DEFAULT_COLOURS,
        theme: { light: look.page, dark: null },
        accent: { light: look.button, dark: null },
      },
      buttons: dsButtonLookStyle(look.chips.buttons),
      composition: look.composition,
      brief: look.brief,
    },
    look.fonts
  );
  return { id, name, kind, theme };
}

export const DS_STARTING_POINTS: readonly DsStartingPoint[] = [
  point("parabola", "Parabola", "Editorial, a writer's site", {
    page: null,
    button: null,
    fonts: null,
    chips: { colour: "classic", type: "classic", buttons: "soft" },
    composition: { layout: "inline", align: "centre", scale: "regular", density: "airy", structure: "plain", labels: "none", numbered: false, hero: "statement" },
    brief: {
      reference: "The label beside a work in a gallery: a white wall, black type, and room around everything.",
      moves: ["Headings in a light serif, large, never bold.", "Buttons and fields are pills; the main button is black.", "Colour belongs to the content, not the frame."],
    },
  }),
  point("swiss", "Swiss", "A programme, an event, a manifesto", {
    page: "#FFFFFF",
    button: "#000000",
    fonts: fonts("Inter Tight", "Inter Tight"),
    chips: { colour: "neutral", type: "startup", buttons: "sharp" },
    composition: { layout: "full", align: "left", scale: "loud", density: "airy", structure: "ruled", labels: "bracket", numbered: true, hero: "statement" },
    brief: {
      reference: "A Swiss poster from the 1960s, set as a website: one grotesque, very large, on a strict grid with most of the page left empty.",
      moves: ["One typeface, one weight, two sizes that are both big.", "Small labels in brackets, like (Challenge), in the left column.", "A black hairline opens each section.", "Parts are numbered (01), (02), (03).", "Square corners everywhere."],
    },
  }),
  point("institute", "Institute", "A lab, a studio, a company with ideas", {
    page: "#F3EFE4",
    button: "#1F1E1D",
    fonts: fonts("Newsreader", "Inter"),
    chips: { colour: "earthy", type: "editorial", buttons: "product" },
    composition: { layout: "hybrid", align: "left", scale: "regular", density: "airy", structure: "plain", labels: "eyebrow", numbered: false, hero: "split" },
    brief: {
      reference: "A research institute's site: warm paper, a serif for ideas and a sans for facts, wide when it presents and narrow when it explains.",
      moves: ["Headlines in a serif, set left over a wide page.", "Articles in a narrow column, like a printed essay.", "Small uppercase labels name each section.", "One dark button; everything else is a text link."],
    },
  }),
  point("storefront", "Storefront", "A shop", {
    page: "#FAFAFA",
    button: "#18181B",
    fonts: fonts("DM Sans", "DM Sans"),
    chips: { colour: "neutral", type: "friendly", buttons: "soft" },
    composition: { layout: "hybrid", align: "centre", scale: "regular", density: "regular", structure: "cards", labels: "tag", numbered: false, hero: "poster" },
    brief: {
      reference: "A well-run shop: the product photo is the loudest thing on the page, and everything around it is tidy, rounded and easy to tap.",
      moves: ["A full-width photo opens the page, the headline over it.", "Products sit on cards in an even grid.", "Round buttons, big enough for a thumb.", "Pill tags for New, Sale, Sold out."],
    },
  }),
  point("startup", "Startup", "A software product", {
    page: "#FFFFFF",
    button: "#2563EB",
    fonts: fonts("Geist", "Geist"),
    chips: { colour: "neutral", type: "startup", buttons: "product" },
    composition: { layout: "hybrid", align: "centre", scale: "regular", density: "regular", structure: "cards", labels: "eyebrow", numbered: false, hero: "statement" },
    brief: {
      reference: "A software launch page: a confident sans, one bright colour for the thing to click, and features in neat cards.",
      moves: ["A centred headline, a line under it, two buttons.", "Features in a grid of cards with small radii.", "One action colour, used only on what you click."],
    },
  }),
  point("onchain", "Onchain", "Crypto, a protocol, a dashboard", {
    page: "#05070D",
    button: "#39FF88",
    fonts: fonts("Space Grotesk", "Space Grotesk"),
    chips: { colour: "neon", type: "futurist", buttons: "sharp" },
    composition: { layout: "full", align: "left", scale: "regular", density: "tight", structure: "boxed", labels: "eyebrow", numbered: true, hero: "statement" },
    brief: {
      reference: "A trading terminal at night: dark, one neon colour, everything boxed in like a dashboard, labels in capitals.",
      moves: ["Dark first; light mode is the exception.", "Bordered cells that share edges, edge to edge.", "Capital labels and counted parts: 01, 02, 03.", "One neon colour for anything live or clickable."],
    },
  }),
  point("studio", "Studio", "A portfolio", {
    page: "#FFFFFF",
    button: "#000000",
    fonts: fonts("Work Sans", "Work Sans"),
    chips: { colour: "neutral", type: "friendly", buttons: "text" },
    composition: { layout: "full", align: "left", scale: "small", density: "tight", structure: "plain", labels: "none", numbered: false, hero: "poster" },
    brief: {
      reference: "An artist's portfolio: tiny type tucked in a corner, pictures filling everything else.",
      moves: ["Type is small and stays out of the way.", "Images run edge to edge, with almost no gap.", "No boxes, no rules, no buttons that look like buttons."],
    },
  }),
];
