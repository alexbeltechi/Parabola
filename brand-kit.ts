/**
 * A theme as a brand kit: what an agent needs to make anything in the brand
 * (a page, a document, a deck, a post, an email) without guessing.
 *
 * - `style`: the style in words, short enough to paste at the end of any
 *   prompt ("make a website, in this style"): the look in a sentence, the
 *   colours, fonts, sizes and shapes that are fixed, and what's left free.
 * - `readme`: the brand guide, `README.md` (also the copy-paste text):
 *   the voice, every colour by its job in light and dark, the fonts and
 *   type styles, spacing, corners, buttons, and the rules for using them.
 * - `tokens`: `tokens.json` in the shape Claude's Design System reads
 *   (each family a list of `{ name, value, usage }`, colours with light
 *   and dark themes), so the kit becomes a design system in Claude as it is.
 * - `css`: `tokens.css`, the theme as CSS variables with its fonts, for an
 *   HTML page to link.
 * - `theme`: the full Parabola export, which Parabola reads back.
 *
 * Every value comes from the theme; nothing is invented. Both texts say the
 * same thing about using it, Parabola's "fixed below, free above": the
 * values hold, and everything built on them is open (`HOW_TO_USE`).
 */
import { dsMoodLabel } from "./character";
import { dsCompositionWords } from "./composition";
import { dsSocialWords } from "./social";
import { DS_SPACES } from "./spacing";
import { DS_BUTTON_LOOKS, DS_PALETTES, DS_TYPE_STYLES, dsTasteNames, dsTasteVoice } from "./taste";
import { dsThemeColourTokens, dsThemeCss, dsThemeExport, parseDsThemeConfig, type DsThemeConfig } from "./theme";

/** The colours a brand kit names, each with what it's for (the tokens tokens.css sets as `--ds-<name>`). */
const KIT_COLOURS: [token: string, usage: string][] = [
  ["bg", "Page background."],
  ["fg", "Text, and headings."],
  ["fg-muted", "Quieter text: descriptions, secondary lines."],
  ["fg-subtle", "Faintest text: captions, placeholders, meta."],
  ["border", "Dividers and borders."],
  ["surface-subtle", "Cards and panels on the page."],
  ["surface", "Secondary buttons, pills and image placeholders."],
  ["on-surface", "Text on secondary buttons and pills."],
  ["button", "Primary buttons and the one accent: links that act, selected states."],
  ["on-button", "Text on primary buttons."],
  ["highlight", "What needs attention: a highlight pill, a key number."],
  ["highlight-tint", "A soft background behind highlighted things."],
  ["field", "Input backgrounds."],
  ["field-border", "Input outlines."],
  ["surface-inverse", "Toasts and tooltips."],
];

/** A text style's name in tokens.json: "H1" → "h1", "Display" → "display". */
const styleName = (label: string) => label.toLowerCase().replace(/[^a-z0-9]+/g, "-");

/**
 * Fixed below, free above, as an agent is told it: what holds, and what's
 * open. The one place this is worded, for the style text and the guide.
 */
const HOW_TO_USE = [
  "Keep the values as they are: the colours and what each is for, the fonts, the spacing steps and the corners. Follow the composition and the signature moves: they are what makes this style this style, and not another with the same colours.",
  "Everything else is yours: what goes on a page, the sections it needs, imagery, motion, and things nobody has made before. Experiment there, and build it from these values.",
];

/** Where a style made here says it came from. */
const MADE_WITH = "Created with parabolasystem.com";

/** A page colour in a word or two: "a white page", "a dark page". */
function pageInWords(hex: string): string {
  const m = /^#([0-9a-f]{6})$/i.exec(hex);
  if (!m) return "the page";
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(m[1].slice(i, i + 2), 16) / 255);
  const light = 0.2126 * r + 0.7152 * g + 0.0722 * b;
  const grey = Math.max(r, g, b) - Math.min(r, g, b) < 0.06;
  if (light > 0.97 && grey) return "a white page";
  if (light < 0.12) return "a dark page";
  if (grey) return light > 0.6 ? "a light grey page" : "a grey page";
  return light > 0.8 ? "a pale, tinted page" : light > 0.35 ? "a page in full colour" : "a deep-coloured page";
}

export type DsBrandKit = {
  name: string;
  /** The style in words, to paste into any agent. */
  style: string;
  readme: string;
  tokens: Record<string, unknown>;
  css: string;
  theme: ReturnType<typeof dsThemeExport>;
};

export function dsBrandKit(theme: DsThemeConfig, name: string): DsBrandKit {
  const exported = dsThemeExport(theme, name);
  const light = dsThemeColourTokens(theme, "light");
  const dark = dsThemeColourTokens(theme, "dark");
  const c = theme.character;
  const voice = dsTasteVoice(c.tastes, c.mood);
  const tastes = dsTasteNames(c.tastes);
  const fonts = exported.typography.fonts as Record<string, string>;
  const heading = fonts.Heading ?? Object.values(fonts)[0];
  const body = fonts.Font ?? Object.values(fonts)[0];
  const styles = Object.entries(exported.typography.styles) as [
    string,
    { font: string; size: string; lineHeight: string; weight: number },
  ][];
  const corners = exported.corners as Record<string, string>;
  // A family's font stack as the theme's CSS sets it, without the app's hosted-font variable around the name.
  const themeCss = dsThemeCss(theme);
  const stack = (family: "body" | "heading", font: string) =>
    (themeCss.match(new RegExp(`--ds-family-${family}: ([^;]+);`))?.[1] ?? `"${font}", sans-serif`).replace(
      /var\(--ds-font-[\w-]+, ("[^"]+")\)/g,
      "$1"
    );

  const tokens = {
    name,
    version: 1,
    // The theme itself rides along, so a design system made from this kit comes back into Parabola exactly.
    meta: { source: "Parabola", parabola: theme },
    color: {
      themes: [
        { id: "light", name: "Light" },
        { id: "dark", name: "Dark" },
      ],
      tokens: KIT_COLOURS.map(([token, usage]) => ({
        name: token,
        value: { light: light[token], dark: dark[token] },
        usage,
      })),
    },
    type: {
      families: { body: stack("body", body), heading: stack("heading", heading) },
      groups: [
        {
          name: "Text",
          family: "body",
          styles: styles.map(([label, s]) => ({
            name: styleName(label),
            family: s.font === heading && heading !== body ? "heading" : "body",
            fontSize: s.size,
            lineHeight: s.lineHeight,
            fontWeight: s.weight,
          })),
        },
      ],
    },
    spacing: {
      tokens: DS_SPACES.map((px) => ({ name: `space-${px}`, value: `${px}px`, usage: SPACE_USAGE[px] ?? "" })),
    },
    radius: {
      tokens: Object.entries(corners).map(([use, value]) => ({
        name: `radius-${styleName(use).split("-")[0]}`,
        value: value === "fully round" ? "9999px" : value,
        usage: `${use[0].toUpperCase()}${use.slice(1)}.`,
      })),
    },
  };

  const googleFontsUrl = exported.typography.googleFonts;
  const googleFonts = googleFontsUrl;
  const row = (cells: string[]) => `| ${cells.join(" | ")} |`;
  const describe = [
    tastes.length ? tastes.join(" and ") : "Parabola",
    dsMoodLabel(c.mood).toLowerCase(),
  ].join(", ");
  const readme = [
    `# ${name}: brand guide`,
    "",
    `Made with Parabola. ${describe[0].toUpperCase()}${describe.slice(1)}, set in ${[...new Set([heading, body])].join(" and ")}.`,
    "",
    "**For agents.** Read this before making anything in this brand: a page, a document, a deck, a social post, an email. For HTML, link `tokens.css` (or copy its variables) and the fonts.",
    "",
    ...HOW_TO_USE,
    "",
    "## Voice",
    "",
    `Tone: ${voice.tone}.`,
    "",
    ...(voice.rules.length ? voice.rules : ["Plain words and short sentences; nothing shouted."]).map((r) => `- ${r}`),
    "",
    "## Colour",
    "",
    "Light is the default; dark is the same brand at night. Use colours only for the jobs listed: text on the page is `fg`, quieter text `fg-muted`, the one accent is `button`.",
    "",
    row(["Token", "Light", "Dark", "Use"]),
    row(["---", "---", "---", "---"]),
    ...KIT_COLOURS.map(([token, usage]) => row([`\`${token}\``, light[token], dark[token], usage])),
    "",
    "## Type",
    "",
    `Headings in **${heading}**, everything else in **${body}**.${exported.typography.googleFonts ? ` Fonts: ${exported.typography.googleFonts}` : ""}`,
    "",
    row(["Style", "Font", "Size", "Line height", "Weight"]),
    row(["---", "---", "---", "---", "---"]),
    ...styles.map(([label, s]) => row([label, s.font, s.size, s.lineHeight, String(s.weight)])),
    "",
    "Text never goes below Small. Paragraphs people read use Prose, about 600px wide at most.",
    "",
    "## Space",
    "",
    `Spacing steps: ${DS_SPACES.map((px) => `${px}px`).join(", ")}. Use only these. Generous space between sections; never crowd.`,
    "",
    "## Corners",
    "",
    ...Object.entries(corners).map(([use, value]) => `- ${use[0].toUpperCase()}${use.slice(1)}: ${value}`),
    "",
    "## Buttons",
    "",
    `- Primary: \`button\` fill, \`on-button\` text; ${exported.buttons.fill}.`,
    `- Outline: ${exported.buttons.outline}. Label: ${exported.buttons.label}.`,
    "- Secondary: `surface` fill, `on-surface` text.",
    `- Fields: \`field\` background; outline ${exported.buttons.fieldOutline}, in \`field-border\`.`,
    "",
    "## Making things",
    "",
    "- **Pages and documents:** `bg` page, `fg` text, headings in the heading font, one accent (`button`). Cards on `surface-subtle` with the cards-and-panels corner.",
    "- **Decks and slides:** the same colours and fonts; Display or H1 for titles, Prose for body; one idea per slide.",
    "- **Social posts and cards:** the brand's background and one accent; the heading font, large; few words, in the voice above.",
    "- **Email:** the body font on white or `bg`, `fg` text, the primary button for the one link that matters.",
    "",
    MADE_WITH,
    "",
  ].join("\n");

  // The style in words: the same theme, short enough to end a prompt with.
  const chip = (list: readonly { id: string; label: string }[], id: string | undefined) => list.find((o) => o.id === id)?.label;
  const look = [
    [chip(DS_PALETTES, c.scoped.colour), "colour"],
    [chip(DS_TYPE_STYLES, c.scoped.type), "type"],
    [chip(DS_BUTTON_LOOKS, c.scoped.buttons), "buttons"],
  ]
    .filter(([label]) => label)
    .map(([label, what]) => `${label} ${what}`)
    .join(", ");
  const both = (token: string) => `${light[token]} (dark mode ${dark[token]})`;
  const size = (label: string, s: { size: string; lineHeight: string }) => `${label} ${parseInt(s.size)}/${parseInt(s.lineHeight)}`;
  const shape = corners.buttons === "fully round" ? "pill-shaped" : `with ${corners.buttons} corners`;
  const brief = { ...theme.brief, moves: theme.brief.moves.map((m) => m.trim()).filter(Boolean) };
  const style = [
    `Use the "${name}" style for everything you make.`,
    "",
    ...(brief.reference ? [brief.reference, ""] : []),
    `The look: ${look ? `${look}. ` : ""}${pageInWords(light.bg)[0].toUpperCase()}${pageInWords(light.bg).slice(1)}, headings in ${heading}${heading === body ? "" : ` and everything else in ${body}`}, buttons ${shape}.`,
    "",
    "Colours",
    `- Page: ${both("bg")}`,
    `- Text primary: ${both("fg")}`,
    `- Text secondary, quieter text and, in a two-tone post, the word said louder: ${both("fg-muted")}`,
    `- Primary, the brand's colour: ${both("button")}, its text ${both("on-button")}. Use it with intent: the main button and calls to action, a highlight, the ground of one slide in a carousel.`,
    `- Secondary, the quiet buttons and pills: ${both("surface")}`,
    `- Cards and panels: ${both("surface-subtle")}`,
    `- Borders: ${both("border")}`,
    "",
    "Type",
    `- Headings: ${heading}. Everything else: ${body}.${googleFontsUrl ? ` Fonts: ${googleFontsUrl}` : ""}`,
    `- Base sizes (size/line height, px; Scale, under Composition, says how far pages go from them): ${styles.map(([label, s]) => size(label, s)).join(", ")}`,
    "",
    "Shape and space",
    `- Buttons: ${shape}; ${exported.buttons.outline === "none" ? exported.buttons.fill : `outlined, ${exported.buttons.outline}`}.`,
    `- Fields: ${exported.buttons.fieldOutline === "none" ? "no outline" : `a ${exported.buttons.fieldOutline} outline`}. Cards and panels: ${corners["cards and panels"]} corners.`,
    `- Spacing steps: ${DS_SPACES.map((px) => `${px}`).join(", ")}px.`,
    "",
    "Composition",
    ...dsCompositionWords(theme.composition).map((line) => `- ${line}`),
    "",
    ...(brief.moves.length ? ["Signature moves", ...brief.moves.map((m) => `- ${m}`), ""] : []),
    "Social (posts, carousels, reels)",
    ...dsSocialWords(theme.social).map((line) => `- ${line}`),
    "",
    `Voice: ${voice.tone}. ${(voice.rules.length ? voice.rules : ["Plain words and short sentences; nothing shouted."]).join(" ")}`,
    "",
    "How to use it",
    ...HOW_TO_USE,
    "",
    MADE_WITH,
  ].join("\n");

  const css = `${googleFonts ? `@import url("${googleFonts}");\n\n` : ""}/* ${name}, from Parabola. Light on :root, dark on .dark. */\n${themeCss
    .replace(/ \.dark/, "\n.dark")
    .replace(/; /g, ";\n  ")
    .replace(/\{ ?/g, "{\n  ")
    .replace(/ ?\}/g, "\n}")}\n`;

  return { name, style, readme, tokens, css, theme: exported };
}

/** What each spacing step is for. */
const SPACE_USAGE: Record<number, string> = {
  4: "Hairline gaps: an icon and its label.",
  8: "Tight groups: pills in a row, a label and its field.",
  16: "Card padding; gaps between items in a list.",
  20: "The page's side margin on a phone.",
  32: "A picture and the text beside it, in a list.",
  40: "Between blocks inside a section.",
  80: "Between sections.",
  160: "Around the biggest breaks: before a footer, around a hero.",
};

/** The kit as files, by path: the brand guide, Claude's tokens, the CSS and Parabola's own export. */
export function dsBrandKitFiles(kit: DsBrandKit): Record<string, string> {
  return {
    "README.md": kit.readme,
    "tokens.json": `${JSON.stringify(kit.tokens, null, 2)}\n`,
    "tokens.css": kit.css,
    "parabola-theme.json": `${JSON.stringify(kit.theme, null, 2)}\n`,
  };
}

/**
 * The kit as one text to paste into Claude Design or any agent: build the
 * design system from it. The guide (README.md) and the tokens (tokens.json,
 * in the shape Claude's Design System reads), each given as it is.
 */
export function dsBrandKitPrompt(kit: DsBrandKit): string {
  return [
    `Build my design system, "${kit.name}", from the brand guide and tokens below (made with Parabola).`,
    "In Claude Design, make it a Design System: the guide is its README.md, word for word, and the JSON its tokens.json, exactly as given. Anywhere else, use them as the design system's source.",
    "",
    "=== README.md ===",
    kit.readme,
    "=== tokens.json ===",
    JSON.stringify(kit.tokens, null, 2),
  ].join("\n");
}

/**
 * A theme from whatever was pasted: Parabola's code, a kit's tokens.json, or
 * the whole design-system text (its tokens.json part), as long as it came
 * from Parabola and carries the theme. Null for anything else: a design
 * system made elsewhere needs an agent to turn it into a theme.
 */
export function dsThemeFromPaste(text: string): DsThemeConfig | null {
  const json = (raw: string) => {
    try {
      return JSON.parse(raw) as unknown;
    } catch {
      return null;
    }
  };
  const marker = text.indexOf("=== tokens.json ===");
  const value = json(text) ?? (marker >= 0 ? json(text.slice(marker + "=== tokens.json ===".length)) : null);
  if (!value || typeof value !== "object") return null;
  const raw = value as { settings?: unknown; meta?: { parabola?: unknown }; character?: unknown };
  const theme = raw.settings ?? raw.meta?.parabola ?? (raw.character ? raw : null);
  return theme ? parseDsThemeConfig(theme) : null;
}

/** The package's name as the command is typed (a rename changes this one line). */
export const DS_PACKAGE_NAME = "@beltechi/parabola";

/**
 * The theme as one shell-safe word, base64 of its Parabola code: what
 * `add theme --code` takes (cli/core.ts reads it back).
 */
export function dsThemeCode(kit: DsBrandKit): string {
  const bytes = new TextEncoder().encode(JSON.stringify(kit.theme));
  let binary = "";
  for (const byte of bytes) binary += String.fromCharCode(byte);
  return btoa(binary);
}

/** The commands that copy this theme, and a component, into a project (`npx`, as shadcn's `add`). */
export function dsThemeCommands(kit: DsBrandKit): { theme: string; component: string } {
  return {
    theme: `npx ${DS_PACKAGE_NAME} add theme --code ${dsThemeCode(kit)}`,
    component: `npx ${DS_PACKAGE_NAME} add button`,
  };
}
