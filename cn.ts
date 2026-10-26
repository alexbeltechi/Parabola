import { clsx, type ClassValue } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// Parabola's type scale, corners and elevation (tokens.css) are custom, so
// tailwind-merge has to be told about them; otherwise it reads `text-p` as a
// colour and drops it next to `text-ds-fg`.
const twMerge = extendTailwindMerge({
  extend: {
    theme: {
      text: ["display", "h1", "h2", "h3", "p", "prose", "small"],
      radius: ["ds-sm", "ds-control", "ds-md", "ds-lg"],
      shadow: ["ds-raised"],
    },
  },
});

/** Joins class names and resolves Tailwind conflicts, Parabola tokens included. */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}
