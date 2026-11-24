"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ChevronsDownUp, ChevronsUpDown, MoreVertical, PanelRightClose, Redo2, RotateCcw, Save, Share, Undo2, Upload } from "lucide-react";
import { DsAccordion } from "../primitives/accordion";
import { DsButton } from "../primitives/button";
import { DsConfirmDialog } from "../primitives/dialog";
import { DsDropdown, DsDropdownContent, DsDropdownItem, DsDropdownSeparator, DsDropdownTrigger } from "../primitives/dropdown";
import { dsToast } from "../primitives/toast";
import { ThemeExportDialog } from "./theme-export";
import { useDsThemeLibrary } from "../provider";
import { dsResetLooks } from "./custom-looks";
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
 * A change goes into the open theme, Parabola included; Restore puts it back
 * to Parabola's own (theme.ts keeps those), and New + makes another theme to
 * change instead. Without an app to save to (no `onThemeLibraryChange`), the
 * themes are kept in this browser (localStorage), so a refresh keeps them.
 * Every change goes on a
 * history, so Undo and Redo step through them one at a time. Save keeps the
 * themes (DsProvider `onThemeLibraryChange`) without touching the website;
 * Publish saves them and makes the open theme the website's.
 */
type ThemeEditor = {
  library: DsThemeLibrary;
  /** The theme open for editing. */
  entry: DsThemeEntry;
  theme: DsThemeConfig;
  /** Change the open theme; `into` opens that theme first and changes it. */
  setTheme: (theme: DsThemeConfig, into?: string) => void;
  /** Whether the open theme is Parabola or one of the themes made. */
  status: "parabola" | "theme";
  /** Open another theme. Not a change: nothing goes on the history. */
  select: (id: string) => void;
  /** Add a theme called `name`, a copy of the open one (or of `from`: another theme's id, or a theme), and open it. */
  addTheme: (name: string, from?: string | DsThemeConfig) => void;
  renameTheme: (id: string, name: string) => void;
  /** Take a theme out (never Default, nor the one in use). */
  removeTheme: (id: string) => void;
  /** Back to the start: Classic as Parabola makes it, the kept themes gone (not the website's). Returns what undoes it. */
  restoreTheme: () => () => void;
  /** Changes not saved yet. */
  dirty: boolean;
  /** The open theme isn't what the website wears, as it is. */
  unpublished: boolean;
  saving: boolean;
  canSave: boolean;
  /** Save the themes (`library`, or the one given), the website as it was. */
  save: (next?: DsThemeLibrary) => Promise<void>;
  /** Save, and make the open theme the website's. */
  publish: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
  /** Whether the canvas shows the theme light or dark: the UI's own until one is picked for it (the panel's toggle). */
  previewMode: "light" | "dark";
  /** Light or dark picked for the canvas; null while it follows the UI's. */
  pickedMode: "light" | "dark" | null;
  setPreviewMode: (mode: "light" | "dark") => void;
};

const ThemeEditorContext = React.createContext<ThemeEditor | null>(null);

/** Watches the `dark` class on <html>, the UI's light or dark. */
function subscribeUiMode(onChange: () => void) {
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
  return () => observer.disconnect();
}

/** The UI's own light or dark, followed as it changes (light on the server). */
function useUiMode(): "light" | "dark" {
  return React.useSyncExternalStore(
    subscribeUiMode,
    () => (document.documentElement.classList.contains("dark") ? "dark" : "light"),
    () => "light"
  );
}

/** Where the themes are kept in the browser when there's no app to save them to. */
const STORE_KEY = "parabola:themes";

export function useThemeEditor(): ThemeEditor {
  const editor = React.useContext(ThemeEditorContext);
  if (!editor) throw new Error("useThemeEditor needs ThemeEditorProvider (DsShell has it)");
  return editor;
}

export function ThemeEditorProvider({ children }: { children: React.ReactNode }) {
  const { themeLibrary, publishedTheme, onThemeLibraryChange } = useDsThemeLibrary();
  const [saved, setSaved] = React.useState<DsThemeLibrary>(() => parseDsThemeLibrary(themeLibrary ?? DS_DEFAULT_LIBRARY));
  // What the website wears, as published.
  const [published, setPublished] = React.useState<DsThemeEntry>(
    () => publishedTheme ?? saved.themes.find((t) => t.id === saved.active) ?? saved.themes[0]
  );
  const [history, setHistory] = React.useState<{ past: DsThemeLibrary[]; present: DsThemeLibrary; future: DsThemeLibrary[] }>(
    () => ({ past: [], present: saved, future: [] })
  );
  const library = history.present;
  const [selected, setSelected] = React.useState(saved.active);
  const entry = library.themes.find((t) => t.id === selected) ?? library.themes[0];
  const [saving, setSaving] = React.useState(false);
  // The canvas follows the UI's light or dark until one is picked for it: a light page in a dark frame looks broken.
  const uiMode = useUiMode();
  const [pickedMode, setPreviewMode] = React.useState<"light" | "dark" | null>(null);
  const previewMode = pickedMode ?? uiMode;

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

  // The open theme's id, for changes made from older closures (a toast's Undo).
  const selectedRef = React.useRef(selected);
  selectedRef.current = selected;

  // A change goes into the open theme. The first one (DS_DEFAULT_THEME_ID) is where a style picked on the Theme rail
  // is worn, Custom while it's changed; + keeps it as a theme of its own (theme-section's ThemeRail). `into` opens
  // another theme first and puts the change there (a style picked while a kept theme is open).
  const setTheme = React.useCallback((theme: DsThemeConfig, into?: string) => {
    if (into && into !== selectedRef.current) {
      selectedRef.current = into;
      setSelected(into);
    }
    setHistory((h) => {
      const lib = h.present;
      const open = lib.themes.find((t) => t.id === selectedRef.current) ?? lib.themes[0];
      if (JSON.stringify(theme) === JSON.stringify(open.theme)) return h;
      return {
        past: [...h.past, lib].slice(-100),
        present: { ...lib, themes: lib.themes.map((t) => (t.id === open.id ? { ...t, theme } : t)) },
        future: [],
      };
    });
  }, []);

  // No app to save to: keep the themes in this browser. Read once after the first paint (the server has no
  // browser storage, so reading sooner would differ from its page), then written on every change.
  const keepInBrowser = !onThemeLibraryChange;
  const [loaded, setLoaded] = React.useState(!keepInBrowser);
  React.useEffect(() => {
    if (!keepInBrowser) return;
    try {
      const raw = window.localStorage.getItem(STORE_KEY);
      if (raw) {
        const stored = JSON.parse(raw) as { library?: unknown; selected?: unknown };
        const lib = parseDsThemeLibrary(stored.library);
        setSaved(lib);
        setHistory({ past: [], present: lib, future: [] });
        if (typeof stored.selected === "string" && lib.themes.some((t) => t.id === stored.selected)) setSelected(stored.selected);
      }
    } catch {
      // Storage off or unreadable: start from Parabola.
    }
    setLoaded(true);
  }, [keepInBrowser]);
  React.useEffect(() => {
    if (!keepInBrowser || !loaded) return;
    try {
      window.localStorage.setItem(STORE_KEY, JSON.stringify({ library, selected }));
    } catch {
      // Storage full or off: the themes last until the page closes.
    }
  }, [keepInBrowser, loaded, library, selected]);

  /** Save `next`; with `publish`, make that theme the website's too. */
  const store = React.useCallback(
    async (next: DsThemeLibrary, publish?: DsThemeEntry) => {
      if (!onThemeLibraryChange) return;
      setSaving(true);
      try {
        await onThemeLibraryChange(next, publish);
        setSaved(next);
        if (publish) setPublished(publish);
        dsToast.success(publish ? `${publish.name} is on your website` : "Saved");
      } catch (error) {
        // An app's error may carry what to do about it (DsProvider `onThemeLibraryChange`): Sign in, say.
        const action = (error as { action?: { label: string; onClick: () => void } } | null)?.action;
        dsToast.error(publish ? "Couldn't publish" : "Couldn't save", {
          description: error instanceof Error ? error.message : undefined,
          action,
        });
      } finally {
        setSaving(false);
      }
    },
    [onThemeLibraryChange]
  );
  const save = React.useCallback((next?: DsThemeLibrary) => store(next ?? library), [store, library]);
  const publish = React.useCallback(async () => {
    // The open theme becomes the site's: the library as it is now says so too (not a change to undo).
    const next = { ...library, active: entry.id };
    setHistory((h) => ({ ...h, present: next }));
    await store(next, entry);
  }, [store, library, entry]);

  const status: ThemeEditor["status"] = entry.id === DS_DEFAULT_THEME_ID ? "parabola" : "theme";

  const value = React.useMemo<ThemeEditor>(
    () => ({
      library,
      entry,
      theme: entry.theme,
      setTheme,
      status,
      select: setSelected,
      addTheme: (name, from) => {
        const id = dsThemeEntryId(library, name);
        const theme = typeof from === "object" ? from : (library.themes.find((t) => t.id === from) ?? entry).theme;
        change({ ...library, themes: [...library.themes, { id, name, theme }] });
        setSelected(id);
      },
      renameTheme: (id, name) => change({ ...library, themes: library.themes.map((t) => (t.id === id ? { ...t, name } : t)) }),
      removeTheme: (id) => {
        if (id === DS_DEFAULT_THEME_ID || id === library.active) return;
        change({ ...library, themes: library.themes.filter((t) => t.id !== id) });
        if (selected === id) setSelected(library.active);
      },
      // Factory settings: Classic, as Parabola makes it, the kept themes gone (all but the one the website wears),
      // and every row's presets back as Parabola names them (custom-looks). Undo puts all of it back.
      restoreTheme: () => {
        const before = library;
        const open = entry.id;
        const first = library.themes.find((t) => t.id === DS_DEFAULT_THEME_ID) ?? library.themes[0];
        const after: DsThemeLibrary = {
          ...library,
          themes: library.themes
            .filter((t) => t.id === first.id || t.id === library.active)
            .map((t) => (t.id === first.id ? { ...t, theme: DS_DEFAULT_THEME } : t)),
        };
        const put = (lib: DsThemeLibrary, id: string) => {
          selectedRef.current = id;
          setSelected(id);
          setHistory((h) => ({ past: [...h.past, h.present].slice(-100), present: lib, future: [] }));
        };
        put(after, first.id);
        // The rows as Parabola makes them too: the presets deleted here back, renamed ones under their own names.
        const looksBack = dsResetLooks();
        return () => {
          put(before, open);
          looksBack();
        };
      },
      dirty: JSON.stringify(library) !== JSON.stringify(saved),
      unpublished: published.id !== entry.id || JSON.stringify(published.theme) !== JSON.stringify(entry.theme),
      saving,
      canSave: Boolean(onThemeLibraryChange),
      save,
      publish,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      undo,
      redo,
      previewMode,
      pickedMode,
      setPreviewMode,
    }),
    [library, entry, setTheme, status, change, selected, saved, published, saving, onThemeLibraryChange, save, publish, history.past.length, history.future.length, undo, redo, previewMode, pickedMode]
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
  const { toggle } = React.useContext(ShellSidesContext);
  const all = React.useContext(PanelAllContext);
  return (
    <DsAccordion
      title={title}
      defaultOpen={defaultOpen}
      contentClassName="ds-fields-fill"
      actions={
        <div className="flex items-center gap-ds-4">
          {/* In the first section only: the panel's own collapse (from lg, where the panel is a card of its own), then
              Collapse all / Expand all, every section of the panel at once. */}
          <span className="hidden items-center gap-ds-4 [[data-panel-slot]>:first-child_&]:flex">
            <DsButton
              size="small"
              variant="text"
              iconLeft={PanelRightClose}
              aria-label="Collapse the panel"
              title="Collapse the panel (⌘. for both sides)"
              className="hidden lg:inline-flex"
              onClick={() => toggle("right")}
            />
            {all && (
              <DsButton
                size="small"
                variant="text"
                iconLeft={all.open ? ChevronsDownUp : ChevronsUpDown}
                aria-label={all.open ? "Collapse all" : "Expand all"}
                title={all.open ? "Collapse all" : "Expand all"}
                onClick={all.toggle}
              />
            )}
          </span>
          {actions}
        </div>
      }
    >
      {children}
    </DsAccordion>
  );
}

/**
 * The showcase's two sides, each collapsed on its own, as Figma's UI does: the sidebar and the panel each down to
 * one button that names it and opens it again. ⌘. (Ctrl+. elsewhere) does both at once, closing both if either
 * is open. Held by the shell (ds-shell.tsx); here so a panel section can reach it.
 */
export type ShellSides = { left: boolean; right: boolean };

/** Every section of the panel open or folded at once (the canvas holds it; the first section has its button). */
export const PanelAllContext = React.createContext<{ open: boolean; toggle: () => void } | null>(null);
/** "Custom", or "Custom 2" and on when that's taken. */
export function dsCustomName(taken: readonly string[], base = "Custom"): string {
  if (!taken.includes(base)) return base;
  let n = 2;
  while (taken.includes(`${base} ${n}`)) n += 1;
  return `${base} ${n}`;
}

export const ShellSidesContext = React.createContext<{ collapsed: ShellSides; toggle: (side: keyof ShellSides) => void }>({
  collapsed: { left: false, right: false },
  toggle: () => {},
});

/** What a restore puts back to Parabola's defaults: this page's part of the open theme, or all of it. */
type RestoreScope = "families" | "type" | "all";

export const RESTORE: Record<RestoreScope, { item: string; title: string; description: string; done: string }> = {
  families: {
    item: "Restore the font families",
    title: "Restore the font families?",
    description:
      "Font and Heading go back to Geist Sans and Geist Serif, families you added go, and Parabola's fonts come back to the list. Fonts you added stay.",
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
    description: "Everything as Parabola makes it: Classic, every style and preset back under its own name, and the themes and looks you kept taken out (not the theme your website wears). Undo brings it all back.",
    done: "All settings restored",
  },
};

/** The theme with one part back at Parabola's defaults, cleaned (styles in a family that's gone move to Font). */
function restored(theme: DsThemeConfig, scope: "families" | "type"): DsThemeConfig {
  if (scope === "families") return parseDsThemeConfig({ ...theme, families: DS_DEFAULT_THEME.families, hiddenFonts: [] });
  return parseDsThemeConfig({ ...theme, type: DS_DEFAULT_THEME.type });
}

/**
 * The theme's actions, top right of every /parabola page (DsCanvas), after
 * the page's own (`leading`: Collapse all): Undo and Redo (icons), one change at a time and off
 * when there's none; Save, which keeps the changes without touching the
 * website; Publish (after a confirm), which saves them and puts the open
 * theme on the website; `trailing` (Export, theme-export.tsx); and, last, a ⋮ menu to restore Parabola's defaults
 * for this page's part of the open theme, or all of it,
 * each after a confirm and with Undo in the toast that follows. Nothing
 * restored is live until it's published.
 */
/**
 * The theme's actions, top right of every page. Floating (the default), each a button of its own; `compact`
 * (a phone), everything in the one ⋮ menu so it all fits on the title's line: collapse, undo, redo, save,
 * publish, export and the restores.
 */
export function ThemeHeaderActions({
  leading,
  trailing,
  compact = false,
  allOpen,
  onToggleAll,
}: {
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
  compact?: boolean;
  /** For the menu's Collapse all / Expand all, when compact. */
  allOpen?: boolean;
  onToggleAll?: () => void;
}) {
  const [exporting, setExporting] = React.useState(false);
  const { theme, setTheme, entry, dirty, unpublished, saving, canSave, save, publish, canUndo, canRedo, undo, redo, restoreTheme } =
    useThemeEditor();
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
      const undoIt = restoreTheme();
      dsToast(RESTORE.all.done, { action: { label: "Undo", onClick: undoIt } });
      return;
    }
    const before = theme;
    setTheme(restored(theme, scope));
    dsToast(`${RESTORE[scope].done} (${entry.name})`, { action: { label: "Undo", onClick: () => setTheme(before) } });
  }

  const dialogs = (
    <>
      <ThemeExportDialog open={exporting} onOpenChange={setExporting} />
    </>
  );

  return (
    <div className="flex shrink-0 items-center gap-ds-8">
      {!compact && (
        <>
      {leading}
      <DsButton size="small" iconLeft={Undo2} aria-label="Undo" title="Undo" onClick={undo} disabled={!canUndo || saving} />
      <DsButton size="small" iconLeft={Redo2} aria-label="Redo" title="Redo" onClick={redo} disabled={!canRedo || saving} />
      {canSave && (
        <>
          {/* Save keeps the changes; Publish puts the open theme on the website. */}
          <DsButton size="small" onClick={() => save()} disabled={!dirty || saving}>
            Save
          </DsButton>
          <DsButton size="small" variant="primary" onClick={() => setPublishing(true)} disabled={!(dirty || unpublished)} loading={saving}>
            Publish
          </DsButton>
        </>
      )}
      {trailing}
        </>
      )}
      <DsDropdown>
        <DsDropdownTrigger asChild>
          <DsButton size="small" iconLeft={MoreVertical} aria-label="More theme actions" disabled={saving} />
        </DsDropdownTrigger>
        <DsDropdownContent align="end">
          {compact && (
            <>
              {onToggleAll && (
                <DsDropdownItem iconLeft={allOpen ? ChevronsDownUp : ChevronsUpDown} onSelect={onToggleAll}>
                  {allOpen ? "Collapse all" : "Expand all"}
                </DsDropdownItem>
              )}
              <DsDropdownItem iconLeft={Undo2} onSelect={undo} disabled={!canUndo}>
                Undo
              </DsDropdownItem>
              <DsDropdownItem iconLeft={Redo2} onSelect={redo} disabled={!canRedo}>
                Redo
              </DsDropdownItem>
              {canSave && (
                <>
                  <DsDropdownItem iconLeft={Save} onSelect={() => save()} disabled={!dirty}>
                    Save
                  </DsDropdownItem>
                  <DsDropdownItem iconLeft={Upload} onSelect={() => setPublishing(true)} disabled={!(dirty || unpublished)}>
                    Publish
                  </DsDropdownItem>
                </>
              )}
              <DsDropdownItem iconLeft={Share} onSelect={() => setExporting(true)}>
                Export
              </DsDropdownItem>
              <DsDropdownSeparator />
            </>
          )}
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

      {dialogs}
      <DsConfirmDialog
        open={publishing}
        onOpenChange={setPublishing}
        title={`Publish ${entry.name}?`}
        description="Your website wears it right away. Your changes are saved too."
        confirmLabel="Publish"
        loading={saving}
        onConfirm={async () => {
          await publish();
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
