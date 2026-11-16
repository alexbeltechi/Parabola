/**
 * Parabola drift check: the values the /parabola showcase and the accent list
 * hold in TypeScript must match the tokens in tokens.css, the one source of
 * truth. Run with `npm run check`; exits 1 on any mismatch.
 *
 * Checks that every themed colour token (one set in .dark) is shown on
 * /parabola/colours/main with the same light and dark value; that every
 * accent in accents.ts is a `--ds-accent-*` token with the same value and a
 * Tailwind utility (`bg-ds-accent-*`), and vice versa; and that every spacing
 * in spacing.ts is a `--ds-space-*` token with the same value and a utility
 * (`gap-ds-*`), and vice versa; and that the type tokens (families, sizes,
 * line heights, each style's family and weight) are the default theme's in
 * fonts.ts and theme.ts; and that the corner tokens are the default radius's
 * (radius.ts), each with its utility (`rounded-ds-*`).
 */
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { DS_ACCENTS } from "../accents";
import { DS_SPACES } from "../spacing";
import { ROLES } from "../showcase/colour-roles";
import { DS_DEFAULT_FONT, DS_DEFAULT_HEADING_FONT, dsFont } from "../fonts";
import { DS_DEFAULT_COLOURS, dsColourTokens } from "../colours";
import { DS_TEXT_STYLES, DS_TEXT_STYLE_DEFAULTS } from "../theme";
import { DS_DEFAULT_RADIUS, DS_RADIUS_TOKENS, dsRadiusPx } from "../radius";

const css = readFileSync(join(__dirname, "../tokens.css"), "utf8").replace(/\/\*[\s\S]*?\*\//g, "");

/** The `--ds-*` declarations in the first top-level block opened by `selector {`. */
function block(selector: string): Map<string, string> {
  const start = css.search(new RegExp(`^${selector.replace(".", "\\.")}\\s*\\{`, "m"));
  if (start < 0) throw new Error(`No ${selector} block in tokens.css`);
  const body = css.slice(css.indexOf("{", start) + 1, css.indexOf("\n}", start));
  const decls = new Map<string, string>();
  for (const [, name, value] of body.matchAll(/(--[\w-]+)\s*:\s*([^;]+);/g)) decls.set(name, value.trim());
  return decls;
}

const same = (a: string, b: string) => a.replace(/\s+/g, " ").toLowerCase() === b.replace(/\s+/g, " ").toLowerCase();

const root = block(":root");
const dark = block(".dark");
const theme = block("@theme inline");
const problems: string[] = [];

// Colours: the default theme's (colours.ts) are tokens.css's, light and dark. Buttons are the text there
// (var(--ds-fg)), so they're left out.
{
  for (const [mode, tokens] of [
    ["light", root],
    ["dark", dark],
  ] as const) {
    const values = dsColourTokens(DS_DEFAULT_COLOURS, mode);
    for (const [name, value] of Object.entries(values)) {
      if (name === "button" || name === "on-button") continue;
      const css = tokens.get(`--ds-${name}`) ?? root.get(`--ds-${name}`);
      if (!css || !same(css, value)) problems.push(`--ds-${name} (${mode}) isn't the default colours' ${value} (colours.ts): ${css}`);
    }
  }
}

// Typography: the default theme (fonts.ts, theme.ts) is what tokens.css sets.
for (const [token, id] of [["--ds-family-body", DS_DEFAULT_FONT], ["--ds-family-heading", DS_DEFAULT_HEADING_FONT]]) {
  if (!same(root.get(token) ?? "", dsFont(id).family)) problems.push(`${token} in tokens.css isn't the default font (${id}): ${dsFont(id).family}`);
}
for (const style of DS_TEXT_STYLES) {
  const { size, lineHeight, family, weight } = DS_TEXT_STYLE_DEFAULTS[style];
  if (root.get(`--ds-text-${style}`) !== `${size}px`) problems.push(`--ds-text-${style} isn't ${size}px (theme.ts)`);
  if (root.get(`--ds-font-${style}`) !== `var(--ds-family-${family})`) problems.push(`--ds-font-${style} isn't the ${family} family (theme.ts)`);
  if (root.get(`--ds-weight-${style}`) !== String(weight)) problems.push(`--ds-weight-${style} isn't ${weight} (theme.ts)`);
  if (root.get(`--ds-text-${style}-leading`) !== `${lineHeight}px`) problems.push(`--ds-text-${style}-leading isn't ${lineHeight}px (theme.ts)`);
}

// Corners: the default radius (radius.ts) is what tokens.css sets, each token with its utility.
for (const token of DS_RADIUS_TOKENS) {
  const px = `${dsRadiusPx(DS_DEFAULT_RADIUS)[token]}px`;
  if (root.get(`--ds-radius-${token}`) !== px) problems.push(`--ds-radius-${token} isn't ${px} (radius.ts)`);
  if (!same(theme.get(`--radius-ds-${token}`) ?? "", `var(--ds-radius-${token})`)) problems.push(`--radius-ds-${token} is missing from @theme`);
}

// UI palette: /parabola/colours/main against :root and .dark.
const shown = new Set<string>();
for (const { colours } of ROLES) {
  for (const { token, light, dark: darkValue } of colours) {
    shown.add(token);
    const cssLight = root.get(token);
    const cssDark = dark.get(token) ?? cssLight;
    if (!cssLight) problems.push(`${token} is on /parabola/colours/main but not in :root`);
    else if (!same(cssLight, light.css)) problems.push(`${token} light: showcase ${light.css}, tokens.css ${cssLight}`);
    if (cssDark && !same(cssDark, darkValue.css)) problems.push(`${token} dark: showcase ${darkValue.css}, tokens.css ${cssDark}`);
  }
}
for (const [token, value] of dark) {
  // Themed tokens that aren't colours (the shadow) are shown elsewhere.
  if (token.startsWith("--ds-shadow")) continue;
  if (!shown.has(token)) problems.push(`${token} (${value}) is themed in .dark but missing from /parabola/colours/main`);
}

// Accents: accents.ts against the --ds-accent-* tokens and their utilities.
const accentTokens = new Set([...root.keys()].filter((t) => t.startsWith("--ds-accent-")));
for (const { name, token, value } of DS_ACCENTS) {
  const cssValue = root.get(token);
  if (!cssValue) problems.push(`Accent ${name}: ${token} is not in :root`);
  else if (!same(cssValue, value)) problems.push(`Accent ${name}: accents.ts ${value}, tokens.css ${cssValue}`);
  const utility = `--color-ds-accent-${token.slice("--ds-accent-".length)}`;
  if (!same(theme.get(utility) ?? "", `var(${token})`)) problems.push(`Accent ${name}: ${utility} is missing from @theme`);
  accentTokens.delete(token);
}
for (const token of accentTokens) problems.push(`${token} is in tokens.css but not in accents.ts`);

// Spacing: spacing.ts against the --ds-space-* tokens and their utilities.
const spaceTokens = new Set([...root.keys()].filter((t) => t.startsWith("--ds-space-")));
for (const px of DS_SPACES) {
  const token = `--ds-space-${px}`;
  const cssValue = root.get(token);
  if (!cssValue) problems.push(`Spacing ${px}: ${token} is not in :root`);
  else if (!same(cssValue, `${px}px`)) problems.push(`Spacing ${px}: ${token} is ${cssValue} in tokens.css`);
  if (!same(theme.get(`--spacing-ds-${px}`) ?? "", `var(${token})`)) problems.push(`Spacing ${px}: --spacing-ds-${px} is missing from @theme`);
  spaceTokens.delete(token);
}
for (const token of spaceTokens) problems.push(`${token} is in tokens.css but not in spacing.ts`);

if (problems.length) {
  console.error(`Parabola tokens out of sync (${problems.length}):\n${problems.map((p) => `  - ${p}`).join("\n")}`);
  process.exit(1);
}
console.log(`Parabola tokens in sync: ${shown.size} UI tokens, ${DS_ACCENTS.length} accents, ${DS_SPACES.length} spacings.`);
