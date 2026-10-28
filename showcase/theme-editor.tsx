"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { MoreVertical, Redo2, RotateCcw, Undo2 } from "lucide-react";
import { DsAccordion } from "../primitives/accordion";
import { DsButton } from "../primitives/button";
import { DsConfirmDialog } from "../primitives/dialog";
import { DsDropdown, DsDropdownContent, DsDropdownItem, DsDropdownTrigger } from "../primitives/dropdown";
import { dsToast } from "../primitives/toast";
import { useDsThemeLibrary } from "../provider";
import {
  DS_DEFAULT_LIBRARY,
  DS_DEFAULT_THEME,
  DS_DEFAULT_THEME_ID,
  DS_THEME_SCOPE,
  dsApplyTheme,
  dsClearAppliedTheme,
  dsThemeEntryId,
  parseDsThemeConfig,
  parseDsThemeLibrary,
  type DsThemeConfig,
  type DsThemeEntry,
  type DsThemeLibrary,
} from "../theme";

/**
 * The themes being made on /parabola: the app's library (Default and any
 * added), one of them open for editing, shown on every page's canvas
 * (dsApplyTheme, scoped) so a font picked on Font families shows on Type
 * scale and Theme too; the sidebar, header and panel stay in Parabola's own,
 * so a theme that's hard to read never makes the controls hard to use.
 * Parabola itself never changes: the first change to it opens a copy,
 * "Custom", with the change in it, to create as a theme of its own. Every
 * change goes on a history, so Undo and Redo step through them one at a
 * time; Publish hands the library to the app (DsProvider
 * `onThemeLibraryChange`). Which theme a site wears is the site's choice
 * (Settings › Design), shown here as "In use".
 */
type ThemeEditor = {
  library: DsThemeLibrary;
  /** The theme open for editing. */
  entry: DsThemeEntry;
  theme: DsThemeConfig;
  /** Change the open theme; on Parabola, a copy of it ("Custom") opens with the change. */
  setTheme: (theme: DsThemeConfig) => void;
  /** Where the open theme stands against what's published: Parabola, new (not created yet), changed or as published. */
  status: "parabola" | "new" | "changed" | "saved";
  /** Name the open (new) theme and publish the library with it. */
  createTheme: (name: string) => Promise<void>;
  /** Open another theme. Not a change: nothing goes on the history. */
  select: (id: string) => void;
  /** Add a theme called `name`, a copy of the open one, and open it. */
  addTheme: (name: string) => void;
  renameTheme: (id: string, name: string) => void;
  /** Take a theme out (never Default, nor the one in use). */
  removeTheme: (id: string) => void;
  /**
   * Back to Parabola: open it, and make it the site's again when the themes
   * are published. Other themes stay as they are. Returns what undoes it.
   */
  backToParabola: () => () => void;
  /** Not yet published. */
  dirty: boolean;
  saving: boolean;
  canSave: boolean;
  /** Publish the library (`library`, or the one given). */
  save: (next?: DsThemeLibrary) => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  /** Whether the canvas shows the theme light or dark: its own, not the UI's (the sidebar's toggle). */
  previewMode: "light" | "dark";
  setPreviewMode: (mode: "light" | "dark") => void;
};

const ThemeEditorContext = React.createContext<ThemeEditor | null>(null);

export function useThemeEditor(): ThemeEditor {
  const editor = React.useContext(ThemeEditorContext);
  if (!editor) throw new Error("useThemeEditor needs ThemeEditorProvider (DsShell has it)");
  return editor;
}

export function ThemeEditorProvider({ children }: { children: React.ReactNode }) {
  const { themeLibrary, onThemeLibraryChange } = useDsThemeLibrary();
  const [saved, setSaved] = React.useState<DsThemeLibrary>(() => parseDsThemeLibrary(themeLibrary ?? DS_DEFAULT_LIBRARY));
  const [history, setHistory] = React.useState<{ past: DsThemeLibrary[]; present: DsThemeLibrary; future: DsThemeLibrary[] }>(
    () => ({ past: [], present: saved, future: [] })
  );
  const library = history.present;
  const [selected, setSelected] = React.useState(saved.active);
  const entry = library.themes.find((t) => t.id === selected) ?? library.themes[0];
  const [saving, setSaving] = React.useState(false);
  const [previewMode, setPreviewMode] = React.useState<"light" | "dark">("light");

  // The open theme shows on the canvas (DsCanvas), whatever changed it; the rest of /parabola stays in Parabola's own.
  React.useEffect(() => dsApplyTheme(entry.theme, DS_THEME_SCOPE), [entry.theme]);
  // Leaving /parabola takes it away.
  React.useEffect(() => dsClearAppliedTheme, []);

  // A new change starts a new branch: there's nothing to redo after it.
  const change = React.useCallback((next: DsThemeLibrary) => {
    setHistory((h) => ({ past: [...h.past, h.present].slice(-100), present: next, future: [] }));
  }, []);
  const undo = React.useCallback(() => {
    setHistory((h) =>
      h.past.length === 0 ? h : { past: h.past.slice(0, -1), present: h.past[h.past.length - 1], future: [h.present, ...h.future] }
    );
  }, []);
  const redo = React.useCallback(() => {
    setHistory((h) => (h.future.length === 0 ? h : { past: [...h.past, h.present], present: h.future[0], future: h.future.slice(1) }));
  }, []);

  const setTheme = React.useCallback(
    (theme: DsThemeConfig) => {
      if (JSON.stringify(theme) === JSON.stringify(entry.theme)) return;
      if (entry.id === DS_DEFAULT_THEME_ID) {
        // Parabola stays as it is: the change goes into a copy, Custom (Custom 2…), opened.
        const names = new Set(library.themes.map((t) => t.name));
        let name = "Custom";
        for (let n = 2; names.has(name); n++) name = `Custom ${n}`;
        const id = dsThemeEntryId(library, name);
        change({ ...library, themes: [...library.themes, { id, name, theme }] });
        setSelected(id);
        return;
      }
      change({ ...library, themes: library.themes.map((t) => (t.id === entry.id ? { ...t, theme } : t)) });
    },
    [change, library, entry]
  );

  const save = React.useCallback(async (next?: DsThemeLibrary) => {
    if (!onThemeLibraryChange) return;
    const publishing = next ?? library;
    setSaving(true);
    try {
      await onThemeLibraryChange(publishing);
      setSaved(publishing);
      dsToast.success("Themes published");
    } catch (error) {
      dsToast.error("Couldn't publish the themes", { description: error instanceof Error ? error.message : undefined });
    } finally {
      setSaving(false);
    }
  }, [onThemeLibraryChange, library]);

  const savedEntry = saved.themes.find((t) => t.id === entry.id);
  const status: ThemeEditor["status"] =
    entry.id === DS_DEFAULT_THEME_ID
      ? "parabola"
      : !savedEntry
        ? "new"
        : JSON.stringify(savedEntry) !== JSON.stringify(entry)
          ? "changed"
          : "saved";

  const createTheme = React.useCallback(
    async (name: string) => {
      const next = { ...library, themes: library.themes.map((t) => (t.id === entry.id ? { ...t, name } : t)) };
      change(next);
      await save(next);
    },
    [library, entry.id, change, save]
  );

  const value = React.useMemo<ThemeEditor>(
    () => ({
      library,
      entry,
      theme: entry.theme,
      setTheme,
      status,
      createTheme,
      select: setSelected,
      addTheme: (name) => {
        const id = dsThemeEntryId(library, name);
        change({ ...library, themes: [...library.themes, { id, name, theme: entry.theme }] });
        setSelected(id);
      },
      renameTheme: (id, name) => change({ ...library, themes: library.themes.map((t) => (t.id === id ? { ...t, name } : t)) }),
      removeTheme: (id) => {
        if (id === DS_DEFAULT_THEME_ID || id === library.active) return;
        change({ ...library, themes: library.themes.filter((t) => t.id !== id) });
        if (selected === id) setSelected(library.active);
      },
      backToParabola: () => {
        const wasSelected = entry.id;
        const moved = library.active !== DS_DEFAULT_THEME_ID;
        if (moved) change({ ...library, active: DS_DEFAULT_THEME_ID });
        setSelected(DS_DEFAULT_THEME_ID);
        return () => {
          if (moved) undo();
          setSelected(wasSelected);
        };
      },
      dirty: JSON.stringify(library) !== JSON.stringify(saved),
      saving,
      canSave: Boolean(onThemeLibraryChange),
      save,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      undo,
      redo,
      previewMode,
      setPreviewMode,
    }),
    [library, entry, setTheme, status, createTheme, change, selected, saved, saving, onThemeLibraryChange, save, history.past.length, history.future.length, undo, redo, previewMode]
  );
  return <ThemeEditorContext.Provider value={value}>{children}</ThemeEditorContext.Provider>;
}

/** Where a page's properties land: the panel on the right of the canvas (DsCanvas). */
export const PanelSlotContext = React.createContext<HTMLElement | null>(null);

/** Puts its children in the canvas's right-hand panel. */
export function InPanel({ children }: { children: React.ReactNode }) {
  const slot = React.useContext(PanelSlotContext);
  return slot ? createPortal(children, slot) : null;
}

/** Where the panel's foot is: pinned under its sections, which scroll above it. */
export const PanelFooterSlotContext = React.createContext<HTMLElement | null>(null);

/** Puts its children at the foot of the right-hand panel (a page's main action there: Create theme). */
export function InPanelFooter({ children }: { children: React.ReactNode }) {
  const slot = React.useContext(PanelFooterSlotContext);
  return slot ? createPortal(children, slot) : null;
}

/** One section of the right-hand panel: a Parabola accordion (DsAccordion), its fields filling the panel. */
export function PanelSection({
  title,
  defaultOpen = true,
  actions,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  actions?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <DsAccordion title={title} defaultOpen={defaultOpen} actions={actions} contentClassName="ds-fields-fill">
      {children}
    </DsAccordion>
  );
}

/** What a restore puts back to Parabola's defaults: this page's part of the open theme, or all of it. */
type RestoreScope = "families" | "type" | "all";

export const RESTORE: Record<RestoreScope, { item: string; title: string; description: string; done: string }> = {
  families: {
    item: "Restore the font families",
    title: "Restore the font families?",
    description:
      "Font and Heading go back to Instrument Sans and Instrument Serif, families you added go, and Parabola's fonts come back to the list. Fonts you added stay.",
    done: "Font families restored",
  },
  type: {
    item: "Restore the type scale",
    title: "Restore the whole type scale?",
    description: "Every style goes back to Parabola's name, family, weight, size and line height.",
    done: "Type scale restored",
  },
  all: {
    item: "Restore all settings",
    title: "Restore all settings?",
    description: "Restore all settings across the design system and components back to default.",
    done: "All settings restored",
  },
};

/** The theme with one part back at Parabola's defaults, cleaned (styles in a family that's gone move to Font). */
function restored(theme: DsThemeConfig, scope: "families" | "type"): DsThemeConfig {
  if (scope === "families") return parseDsThemeConfig({ ...theme, families: DS_DEFAULT_THEME.families, hiddenFonts: [] });
  return parseDsThemeConfig({ ...theme, type: DS_DEFAULT_THEME.type });
}

/**
 * The theme's actions, top right of every /parabola page (DsCanvas): Undo
 * (its icon and label) and Redo (icon only), one change at a time and off
 * when there's none; Publish (after a confirm, since published themes
 * change every site that uses them); and, last, a ⋮ menu to restore
 * Parabola's defaults for this page's part of the open theme, or to go back
 * to Parabola itself (all defaults: it opens, and is the site's theme again
 * once published), each after a confirm and with Undo in the toast that
 * follows. Nothing restored is live until it's published.
 */
export function ThemeHeaderActions({ beforeMenu }: { beforeMenu?: React.ReactNode }) {
  const { theme, setTheme, entry, dirty, saving, canSave, save, canUndo, canRedo, undo, redo, backToParabola } = useThemeEditor();
  const pathname = usePathname();
  const [publishing, setPublishing] = React.useState(false);
  const [restoring, setRestoring] = React.useState<RestoreScope | null>(null);

  // This page's part of the theme, if it has one.
  const pageScope: RestoreScope | null = pathname?.endsWith("/typography/font-families")
    ? "families"
    : pathname?.endsWith("/typography/type-scale")
      ? "type"
      : null;

  function restore(scope: RestoreScope) {
    setRestoring(null);
    if (scope === "all") {
      const undoIt = backToParabola();
      dsToast(RESTORE.all.done, { action: { label: "Undo", onClick: undoIt } });
      return;
    }
    const before = theme;
    setTheme(restored(theme, scope));
    dsToast(`${RESTORE[scope].done} (${entry.name})`, { action: { label: "Undo", onClick: () => setTheme(before) } });
  }

  return (
    <div className="flex shrink-0 items-center gap-ds-8">
      <DsButton variant="text" iconLeft={Undo2} onClick={undo} disabled={!canUndo || saving}>
        Undo
      </DsButton>
      <DsButton variant="text" iconLeft={Redo2} aria-label="Redo" onClick={redo} disabled={!canRedo || saving} />
      {canSave && (
        <DsButton variant="primary" onClick={() => setPublishing(true)} disabled={!dirty} loading={saving}>
          Publish
        </DsButton>
      )}
      {beforeMenu}
      <DsDropdown>
        <DsDropdownTrigger asChild>
          <DsButton variant="text" iconLeft={MoreVertical} aria-label="More theme actions" disabled={saving} />
        </DsDropdownTrigger>
        <DsDropdownContent align="end">
          {pageScope && (
            <DsDropdownItem iconLeft={RotateCcw} onSelect={() => setRestoring(pageScope)}>
              {RESTORE[pageScope].item}
            </DsDropdownItem>
          )}
          <DsDropdownItem iconLeft={RotateCcw} onSelect={() => setRestoring("all")}>
            {RESTORE.all.item}
          </DsDropdownItem>
        </DsDropdownContent>
      </DsDropdown>

      <DsConfirmDialog
        open={publishing}
        onOpenChange={setPublishing}
        title="Publish the themes?"
        description="This changes every site that uses one of them, and its admin, right away."
        confirmLabel="Publish"
        loading={saving}
        onConfirm={async () => {
          await save();
          setPublishing(false);
        }}
      />
      <DsConfirmDialog
        open={restoring !== null}
        onOpenChange={(open) => !open && setRestoring(null)}
        title={restoring ? RESTORE[restoring].title : ""}
        description={
          restoring === "all"
            ? RESTORE.all.description
            : restoring
              ? `${RESTORE[restoring].description} This is ${entry.name}; nothing changes on your site until you publish.`
              : undefined
        }
        confirmLabel="Restore"
        onConfirm={() => restoring && restore(restoring)}
      />
    </div>
  );
}
