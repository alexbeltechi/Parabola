"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { usePathname } from "next/navigation";
import { ChevronDown, MoreVertical, Redo2, RotateCcw, Undo2 } from "lucide-react";
import { DsButton } from "../primitives/button";
import { DsConfirmDialog } from "../primitives/dialog";
import { DsDropdown, DsDropdownContent, DsDropdownItem, DsDropdownTrigger } from "../primitives/dropdown";
import { dsToast } from "../primitives/toast";
import { cn } from "../cn";
import { useDsThemeConfig } from "../provider";
import { DS_DEFAULT_THEME, dsApplyTheme, parseDsThemeConfig, type DsThemeConfig } from "../theme";

/**
 * The theme being made on /parabola: one draft for every page, so a font
 * picked on Font families shows on Type scale and Theme too. Each change
 * shows at once (dsApplyTheme) and goes on a history, so Undo and Redo step
 * through the changes one at a time; Publish hands the theme to the app
 * (DsProvider `onThemeConfigChange`), which makes it the site's and the
 * admin's.
 */
type ThemeEditor = {
  theme: DsThemeConfig;
  setTheme: (theme: DsThemeConfig) => void;
  /** Not yet published. */
  dirty: boolean;
  saving: boolean;
  canSave: boolean;
  save: () => Promise<void>;
  canUndo: boolean;
  canRedo: boolean;
  undo: () => void;
  redo: () => void;
};

const ThemeEditorContext = React.createContext<ThemeEditor | null>(null);

export function useThemeEditor(): ThemeEditor {
  const editor = React.useContext(ThemeEditorContext);
  if (!editor) throw new Error("useThemeEditor needs ThemeEditorProvider (DsShell has it)");
  return editor;
}

export function ThemeEditorProvider({ children }: { children: React.ReactNode }) {
  const { themeConfig, onThemeConfigChange } = useDsThemeConfig();
  const [saved, setSaved] = React.useState<DsThemeConfig>(() => parseDsThemeConfig(themeConfig ?? DS_DEFAULT_THEME));
  const [history, setHistory] = React.useState<{ past: DsThemeConfig[]; present: DsThemeConfig; future: DsThemeConfig[] }>(
    () => ({ past: [], present: saved, future: [] })
  );
  const theme = history.present;
  const [saving, setSaving] = React.useState(false);

  // A new change starts a new branch: there's nothing to redo after it.
  const setTheme = React.useCallback((next: DsThemeConfig) => {
    setHistory((h) => ({ past: [...h.past, h.present].slice(-100), present: next, future: [] }));
    dsApplyTheme(next);
  }, []);
  const undo = React.useCallback(() => {
    setHistory((h) => {
      if (h.past.length === 0) return h;
      const present = h.past[h.past.length - 1];
      dsApplyTheme(present);
      return { past: h.past.slice(0, -1), present, future: [h.present, ...h.future] };
    });
  }, []);
  const redo = React.useCallback(() => {
    setHistory((h) => {
      if (h.future.length === 0) return h;
      const present = h.future[0];
      dsApplyTheme(present);
      return { past: [...h.past, h.present], present, future: h.future.slice(1) };
    });
  }, []);

  // Leaving /parabola with changes unsaved puts the page back in the saved theme.
  React.useEffect(() => () => dsApplyTheme(saved), [saved]);

  const save = React.useCallback(async () => {
    if (!onThemeConfigChange) return;
    setSaving(true);
    try {
      await onThemeConfigChange(theme);
      setSaved(theme);
      dsToast.success("Theme published");
    } catch (error) {
      dsToast.error("Couldn't publish the theme", { description: error instanceof Error ? error.message : undefined });
    } finally {
      setSaving(false);
    }
  }, [onThemeConfigChange, theme]);

  const value = React.useMemo<ThemeEditor>(
    () => ({
      theme,
      setTheme,
      dirty: JSON.stringify(theme) !== JSON.stringify(saved),
      saving,
      canSave: Boolean(onThemeConfigChange),
      save,
      canUndo: history.past.length > 0,
      canRedo: history.future.length > 0,
      undo,
      redo,
    }),
    [theme, saved, saving, onThemeConfigChange, save, setTheme, history.past.length, history.future.length, undo, redo]
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

/**
 * One section of the right-hand panel, as Linear's properties panel: a muted
 * label with a small chevron that folds the section away, then its rows.
 */
export function PanelSection({
  title,
  defaultOpen = true,
  children,
}: {
  title: string;
  defaultOpen?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = React.useState(defaultOpen);
  const id = React.useId();
  return (
    <section className="flex flex-col">
      <button
        type="button"
        aria-expanded={open}
        aria-controls={id}
        onClick={() => setOpen((o) => !o)}
        className="group -mx-ds-8 flex items-center gap-ds-4 rounded-ds-control px-ds-8 py-ds-4 text-left text-p text-ds-fg-muted ds-focus hover:text-ds-fg"
      >
        {title}
        <ChevronDown aria-hidden className={cn("size-4 transition-transform", !open && "-rotate-90")} />
      </button>
      {open && (
        <div id={id} className="ds-fields-fill flex flex-col gap-ds-16 pt-ds-16">
          {children}
        </div>
      )}
    </section>
  );
}

/** What a restore puts back to Parabola's defaults: this page's part of the theme, or all of it. */
type RestoreScope = "families" | "type" | "all";

const RESTORE: Record<RestoreScope, { item: string; title: string; description: string; done: string }> = {
  families: {
    item: "Restore the font families",
    title: "Restore the font families?",
    description:
      "Primary and Secondary go back to Instrument Sans and Instrument Serif, families you added go, and Parabola's fonts come back to the list. Fonts you added stay.",
    done: "Font families restored",
  },
  type: {
    item: "Restore the type scale",
    title: "Restore the whole type scale?",
    description: "Every style goes back to Parabola's size and line height, set in the primary family.",
    done: "Type scale restored",
  },
  all: {
    item: "Restore all defaults",
    title: "Restore the whole theme?",
    description: "The font families and every style go back to Parabola's defaults. Fonts you added stay in the list.",
    done: "Theme restored",
  },
};

/** The theme with one part back at Parabola's defaults, cleaned (styles in a family that's gone move to Primary). */
function restored(theme: DsThemeConfig, scope: RestoreScope): DsThemeConfig {
  if (scope === "families") return parseDsThemeConfig({ ...theme, families: DS_DEFAULT_THEME.families, hiddenFonts: [] });
  if (scope === "type") return parseDsThemeConfig({ ...theme, type: DS_DEFAULT_THEME.type });
  // Keeping the fonts this theme added, so they stay pickable.
  return { ...DS_DEFAULT_THEME, customFonts: theme.customFonts };
}

/**
 * The theme's actions, top right of every /parabola page (DsCanvas): Undo
 * (its icon and label) and Redo (icon only), one change at a time and off
 * when there's none; Publish (after a confirm, since a published theme
 * changes every site that uses it); and, last, a ⋮ menu to restore
 * Parabola's defaults for this page's part of the theme or all of it, each
 * after a confirm and with Undo in the toast that follows. Nothing restored
 * is live until it's published.
 */
export function ThemeHeaderActions() {
  const { theme, setTheme, dirty, saving, canSave, save, canUndo, canRedo, undo, redo } = useThemeEditor();
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
    const before = theme;
    setTheme(restored(theme, scope));
    setRestoring(null);
    dsToast(RESTORE[scope].done, { action: { label: "Undo", onClick: () => setTheme(before) } });
  }

  return (
    <div className="flex shrink-0 items-center gap-ds-8">
      <DsButton iconLeft={Undo2} onClick={undo} disabled={!canUndo || saving}>
        Undo
      </DsButton>
      <DsButton iconLeft={Redo2} aria-label="Redo" onClick={redo} disabled={!canRedo || saving} />
      {canSave && (
        <DsButton variant="primary" onClick={() => setPublishing(true)} disabled={!dirty} loading={saving}>
          Publish
        </DsButton>
      )}
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
        title="Publish this theme?"
        description="This changes every site that uses it, and its admin, right away."
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
        description={restoring ? `${RESTORE[restoring].description} Nothing changes on your site until you publish.` : undefined}
        confirmLabel="Restore"
        onConfirm={() => restoring && restore(restoring)}
      />
    </div>
  );
}
