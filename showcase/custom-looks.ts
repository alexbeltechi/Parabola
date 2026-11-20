"use client";

/**
 * Custom looks: what the Theme panel's rows (Style, Colour, Typography,
 * Buttons) hold beyond Parabola's own presets. Change any value a preset set
 * and the row shows Custom; name it (double-click) or press + and it's kept,
 * a chip of its own to come back to. The presets can be renamed too, for this
 * maker only, or deleted: a deleted preset is only hidden, and its section's
 * Restore (or Restore all) brings it back.
 *
 * Each row looks at its part of the theme alone (`dsLookSnapshot`): Colour at
 * the colour dials and the colours, Typography at the fonts, Buttons at the
 * buttons' roundness, depth and look, Style at all three. Two looks are the
 * same when those parts are.
 *
 * Kept in this browser (localStorage), as the themes are where there's no
 * app to save to. The store is shared by every row on the page.
 */

import * as React from "react";
import type { DsThemeConfig } from "../theme";

export type DsLookScope = "style" | "colour" | "type" | "buttons";

export type DsLookSnapshot = Record<string, unknown>;
type Snapshot = DsLookSnapshot;
export type DsCustomLook = { id: string; name: string; snap: Snapshot };
type Store = { looks: Record<DsLookScope, DsCustomLook[]>; names: Record<string, string>; hidden: string[] };

const KEY = "ds-custom-looks";
const EMPTY: Store = { looks: { style: [], colour: [], type: [], buttons: [] }, names: {}, hidden: [] };

const colourSnap = (t: DsThemeConfig): Snapshot => ({
  hue: t.character.hue,
  colour: t.character.colour,
  brightness: t.character.brightness,
  warmth: t.character.warmth,
  contrast: t.character.contrast,
  colours: t.colours,
});
const typeSnap = (t: DsThemeConfig): Snapshot => ({ families: t.families.map((f) => ({ id: f.id, font: f.font })) });
const buttonsSnap = (t: DsThemeConfig): Snapshot => ({
  roundness: t.character.roundness,
  depth: t.character.depth,
  radius: t.radius,
  pillRadius: t.pillRadius,
  buttons: t.buttons,
});

/** A row's part of the theme, to compare and to keep. */
export function dsLookSnapshot(scope: DsLookScope, t: DsThemeConfig): Snapshot {
  if (scope === "colour") return colourSnap(t);
  if (scope === "type") return typeSnap(t);
  if (scope === "buttons") return buttonsSnap(t);
  return { colour: colourSnap(t), type: typeSnap(t), buttons: buttonsSnap(t) };
}

/** Whether two looks are the same, for this row. */
export const dsSameLook = (a: Snapshot, b: Snapshot) => JSON.stringify(a) === JSON.stringify(b);

/** The theme with a kept look's part put back. */
export function dsWithLook(scope: DsLookScope, t: DsThemeConfig, snap: Snapshot): DsThemeConfig {
  if (scope === "style") {
    const s = snap as { colour: Snapshot; type: Snapshot; buttons: Snapshot };
    return dsWithLook("buttons", dsWithLook("type", dsWithLook("colour", t, s.colour), s.type), s.buttons);
  }
  if (scope === "colour") {
    const { colours, ...dials } = snap as Snapshot & { colours: DsThemeConfig["colours"] };
    return { ...t, character: { ...t.character, ...(dials as Partial<DsThemeConfig["character"]>) }, colours };
  }
  if (scope === "type") {
    const fonts = new Map((snap.families as { id: string; font: string }[]).map((f) => [f.id, f.font]));
    return { ...t, families: t.families.map((f) => (fonts.has(f.id) ? { ...f, font: fonts.get(f.id)! } : f)) };
  }
  const b = snap as { roundness: number; depth: number; radius: DsThemeConfig["radius"]; pillRadius: DsThemeConfig["pillRadius"]; buttons: DsThemeConfig["buttons"] };
  return { ...t, character: { ...t.character, roundness: b.roundness, depth: b.depth }, radius: b.radius, pillRadius: b.pillRadius, buttons: b.buttons };
}

// One store for the page, read once from the browser, written on every change.
let store: Store = EMPTY;
let read = false;
const listeners = new Set<() => void>();

function load() {
  if (read || typeof window === "undefined") return;
  read = true;
  try {
    const raw = JSON.parse(window.localStorage.getItem(KEY) ?? "null") as Partial<Store> | null;
    if (raw && typeof raw === "object") store = {
        looks: { ...EMPTY.looks, ...(raw.looks ?? {}) },
        names: { ...(raw.names ?? {}) },
        hidden: Array.isArray(raw.hidden) ? raw.hidden.filter((k): k is string => typeof k === "string") : [],
      };
  } catch {}
}

function write(next: Store) {
  store = next;
  try {
    window.localStorage.setItem(KEY, JSON.stringify(next));
  } catch {}
  listeners.forEach((l) => l());
}

const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};

/** The kept looks and renamed presets, and the ways to change them. */
export function useCustomLooks() {
  const current = React.useSyncExternalStore(
    subscribe,
    () => {
      load();
      return store;
    },
    () => EMPTY,
  );
  return React.useMemo(
    () => ({
      looks: (scope: DsLookScope) => current.looks[scope],
      /** A preset's name as this maker calls it. */
      name: (scope: DsLookScope, id: string, fallback: string) => current.names[`${scope}:${id}`] ?? fallback,
      renamePreset: (scope: DsLookScope, id: string, name: string) => write({ ...store, names: { ...store.names, [`${scope}:${id}`]: name } }),
      /** Keep a look under a name; returns its id. */
      add: (scope: DsLookScope, name: string, snap: Snapshot) => {
        const id = `custom-${Date.now().toString(36)}`;
        write({ ...store, looks: { ...store.looks, [scope]: [...store.looks[scope], { id, name, snap }] } });
        return id;
      },
      rename: (scope: DsLookScope, id: string, name: string) =>
        write({ ...store, looks: { ...store.looks, [scope]: store.looks[scope].map((l) => (l.id === id ? { ...l, name } : l)) } }),
      remove: (scope: DsLookScope, id: string) => write({ ...store, looks: { ...store.looks, [scope]: store.looks[scope].filter((l) => l.id !== id) } }),
      /** Whether a preset was deleted (hidden) here. */
      hidden: (scope: DsLookScope, id: string) => current.hidden.includes(`${scope}:${id}`),
      hide: (scope: DsLookScope, id: string) => write({ ...store, hidden: [...store.hidden.filter((k) => k !== `${scope}:${id}`), `${scope}:${id}`] }),
    }),
    [current],
  );
}

/**
 * The presets deleted in these rows back (a section's Restore; every row for Restore all). Returns what undoes it.
 */
export function dsUnhidePresets(scopes: readonly DsLookScope[]): () => void {
  load();
  const before = store.hidden;
  const after = before.filter((k) => !scopes.some((scope) => k.startsWith(`${scope}:`)));
  if (after.length === before.length) return () => {};
  write({ ...store, hidden: after });
  return () => write({ ...store, hidden: before });
}

/**
 * Factory settings for the rows (Restore all): every preset back, under its own name, and the looks kept here
 * gone, as the kept themes are. Returns what undoes it.
 */
export function dsResetLooks(): () => void {
  load();
  const before = store;
  write(EMPTY);
  return () => write(before);
}
