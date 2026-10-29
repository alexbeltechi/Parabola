/**
 * The data behind /parabola/colours/main: every UI token by role, with its
 * light and dark value. The values mirror `:root` / `.dark` in tokens.css;
 * `npm run check:parabola` fails if they drift apart.
 */
export type Value = { css: string; label: string };
export type Colour = { name: string; token: string; light: Value; dark: Value };
export type Role = { role: string; note: string; colours: Colour[] };

const hex = (value: string): Value => ({ css: value, label: value });

// Values mirror `:root` / `.dark` in tokens.css. Both themes are drawn at
// once from fixed values (not the live variable), each on its own page colour,
// so a translucent token reads as it will in that theme.
export const PAGE = { light: "#FFFFFF", dark: "#121110" };

// Grouped by role, as design systems do: you pick a token by what it's for.
// Every token has a value in both themes; none exist in only one.
export const ROLES: Role[] = [
  {
    role: "Surface",
    note: "Backgrounds, from the page up to selected controls",
    colours: [
      { name: "Background", token: "--ds-bg", light: hex("#FFFFFF"), dark: hex("#121110") },
      { name: "Surface subtle", token: "--ds-surface-subtle", light: hex("#F7F5F2"), dark: hex("#1A1918") },
      { name: "Field", token: "--ds-field", light: hex("#FFFFFF"), dark: hex("#121110") },
      { name: "Surface", token: "--ds-surface", light: hex("#E2DFD9"), dark: hex("#302E2C") },
      {
        name: "Surface inverse",
        token: "--ds-surface-inverse",
        light: { css: "rgb(48 46 44 / 0.7)", label: "#302E2C 70%" },
        dark: { css: "rgb(255 255 255 / 0.8)", label: "#FFFFFF 80%" },
      },
    ],
  },
  {
    role: "Text",
    note: "Copy and icons, strongest to weakest",
    colours: [
      { name: "Foreground", token: "--ds-fg", light: hex("#000000"), dark: hex("#FFFFFF") },
      { name: "Muted", token: "--ds-fg-muted", light: hex("#595959"), dark: hex("#A0A0A0") },
      { name: "Subtle", token: "--ds-fg-subtle", light: hex("#78716C"), dark: hex("#A8A29E") },
    ],
  },
  {
    role: "Border",
    note: "Field outlines and dividers",
    colours: [{ name: "Border", token: "--ds-border", light: hex("#D6D3D1"), dark: hex("#44403C") }],
  },
  {
    role: "Feedback",
    note: "Invalid fields and destructive actions",
    colours: [{
        name: "Error",
        token: "--ds-error",
        // Defined in oklch (shadcn's destructive); labelled with its hex.
        light: { css: "oklch(0.577 0.245 27.325)", label: "#E7000B" },
        dark: { css: "oklch(0.704 0.191 22.216)", label: "#FF6467" },
      }],
  },
  {
    role: "Highlight",
    note: "The tag accent, e.g. the Claude pill: text on its own solid tint",
    colours: [
      { name: "Highlight", token: "--ds-highlight", light: hex("#000000"), dark: hex("#FFFFFF") },
      { name: "Highlight tint", token: "--ds-highlight-tint", light: hex("#DBDBDB"), dark: hex("#333231") },
    ],
  },
];
