"use client";

/**
 * Which look the open theme is, for the Theme rail and the page's title: one
 * of Parabola's styles as it starts, a kept theme, or Custom (a style
 * changed). A style is worn by the first theme (DS_DEFAULT_THEME_ID); a kept
 * theme is any other in the library.
 */

import { DS_DEFAULT_COLOURS } from "../colours";
import { DS_TASTES, dsShuffleTaste } from "../taste";
import { DS_DEFAULT_THEME, DS_DEFAULT_THEME_ID, dsThemeWithFonts, type DsThemeConfig } from "../theme";
import { dsLookSnapshot, dsSameLook, useCustomLooks } from "./custom-looks";
import { dsCustomName, useThemeEditor } from "./theme-editor";

/** The styles the Theme rail offers: whole looks, a palette, a kind of type and a kind of button each (taste.ts). */
export const STYLES = DS_TASTES.filter((t) => ["classic", "minimal", "elegant", "tech", "natural"].includes(t.id));

/** A style, applied: one look, the same every time (its first palette, type and buttons). The dice is for chance. */
export function withStyle(t: DsThemeConfig, id: string): DsThemeConfig {
  const drawn = dsShuffleTaste([id], t.character, "first");
  return dsThemeWithFonts(
    {
      ...t,
      character: drawn.character,
      colours: { ...DS_DEFAULT_COLOURS, accent: { light: drawn.button, dark: null } },
      radius: null,
      pillRadius: null,
      buttons: drawn.buttonStyle,
    },
    drawn.fonts,
  );
}

/** The rest of a theme beyond its colour, type and buttons: as a style starts it, or changed (Custom). */
const beyondStyle = (t: DsThemeConfig) => ({
  type: t.type,
  fields: t.fields,
  nav: t.nav,
  icons: t.icons,
  composition: t.composition,
  social: t.social,
  ink: t.character.ink,
  mood: t.character.mood,
});

export function useThemeLook() {
  const { library, entry, theme } = useThemeEditor();
  const custom = useCustomLooks();
  const first = library.themes.find((t) => t.id === DS_DEFAULT_THEME_ID) ?? library.themes[0];
  const kept = library.themes.filter((t) => t.id !== first.id);
  const onFirst = entry.id === first.id;
  // A style as a maker starts it: Parabola's theme in that style, keeping only the brief written for it.
  const fresh = (id: string) => withStyle({ ...DS_DEFAULT_THEME, brief: theme.brief }, id);
  const current = theme.character.tastes[0];
  const style = onFirst
    ? STYLES.find(
        (p) =>
          p.id === current &&
          dsSameLook(dsLookSnapshot("style", withStyle(theme, p.id)), dsLookSnapshot("style", theme)) &&
          dsSameLook(beyondStyle(theme), beyondStyle(fresh(p.id))),
      )
    : undefined;
  const live = onFirst && !style;
  // What the page calls it: the style (as this maker named it), Custom, or the kept theme's name.
  const name = !onFirst
    ? entry.name
    : style
      ? custom.name("style", style.id, style.label)
      : dsCustomName(library.themes.map((t) => t.name));
  return { first, kept, onFirst, style, live, fresh, current, name };
}
