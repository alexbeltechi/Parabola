/**
 * Parabola accents: the colours content can wear, e.g. a category's tile and
 * dot. Not part of the UI palette (components never use them); one fixed
 * value per hue, the same in both themes, since each always carries white
 * text.
 *
 * Nine well-spread shadcn/Tailwind 500 shades, the one rung of each ramp that
 * holds white text at an accessible contrast. The highlight (the "Claude"
 * pill) is its own purple, not an accent.
 *
 * Values mirror the `--ds-accent-*` tokens in tokens.css.
 */
export const DS_ACCENTS = [
  { name: "Red", token: "--ds-accent-red", value: "#EF4444" },
  { name: "Orange", token: "--ds-accent-orange", value: "#F97316" },
  { name: "Green", token: "--ds-accent-green", value: "#22C55E" },
  { name: "Teal", token: "--ds-accent-teal", value: "#14B8A6" },
  { name: "Sky", token: "--ds-accent-sky", value: "#0EA5E9" },
  { name: "Blue", token: "--ds-accent-blue", value: "#3B82F6" },
  { name: "Violet", token: "--ds-accent-violet", value: "#8B5CF6" },
  { name: "Pink", token: "--ds-accent-pink", value: "#EC4899" },
  { name: "Stone", token: "--ds-accent-stone", value: "#78716C" },
] as const;

export type DsAccent = (typeof DS_ACCENTS)[number];
