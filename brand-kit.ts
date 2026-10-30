/**
 * A theme as a brand kit: what an agent needs to make anything in the brand
 * (a page, a document, a deck, a post, an email) without guessing.
 *
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
 * Every value comes from the theme; nothing is invented.
 */
import { dsMoodLabel } from "./character";
import { DS_SPACES } from "./spacing";
import { dsTasteNames, dsTasteVoice } from "./taste";
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

export type DsBrandKit = {
  name: string;
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
    "**For agents.** Read this before making anything in this brand: a page, a document, a deck, a social post, an email. Use the exact values below; don't invent colours, fonts or sizes. For HTML, link `tokens.css` (or copy its variables) and the fonts.",
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
    "Don'ts: no colours, fonts or corner sizes outside this guide; no gradients unless the buttons above have one; no stock-AI looks (purple-blue gradients, emoji bullets).",
    "",
  ].join("\n");

  const googleFonts = exported.typography.googleFonts;
  const css = `${googleFonts ? `@import url("${googleFonts}");\n\n` : ""}/* ${name}, from Parabola. Light on :root, dark on .dark. */\n${themeCss
    .replace(/ \.dark/, "\n.dark")
    .replace(/; /g, ";\n  ")
    .replace(/\{ ?/g, "{\n  ")
    .replace(/ ?\}/g, "\n}")}\n`;

  return { name, readme, tokens, css, theme: exported };
}

/** What each spacing step is for. */
const SPACE_USAGE: Record<number, string> = {
  4: "Hairline gaps: an icon and its label.",
  8: "Tight groups: pills in a row, a label and its field.",
  16: "Card padding; gaps between items in a list.",
  20: "The page's side margin on a phone.",
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
    "In Claude Design, make it a Design System: the guide is its README.md, word for word, and the JSON its tokens.json, exactly as given. Anywhere else, use them as the design system's source. Don't invent values.",
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
