"use client";

import * as React from "react";
import { createPortal } from "react-dom";
import { ChevronDown } from "lucide-react";
import { DsButton } from "../primitives/button";
import { dsToast } from "../primitives/toast";
import { cn } from "../cn";
import { useDsThemeConfig } from "../provider";
import { DS_DEFAULT_THEME, dsApplyTheme, parseDsThemeConfig, type DsThemeConfig } from "../theme";

/**
 * The theme being made on /parabola: one draft for every page, so a font
 * picked on Font families shows on Type scale and Theme too. Each change
 * shows at once (dsApplyTheme); Save hands it to the app (DsProvider
 * `onThemeConfigChange`), which makes it the site's and the admin's.
 */
type ThemeEditor = {
  theme: DsThemeConfig;
  setTheme: (theme: DsThemeConfig) => void;
  dirty: boolean;
  saving: boolean;
  canSave: boolean;
  save: () => Promise<void>;
  undo: () => void;
  reset: () => void;
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
  const [theme, setDraft] = React.useState<DsThemeConfig>(saved);
  const [saving, setSaving] = React.useState(false);

  const setTheme = React.useCallback((next: DsThemeConfig) => {
    setDraft(next);
    dsApplyTheme(next);
  }, []);

  // Leaving /parabola with changes unsaved puts the page back in the saved theme.
  React.useEffect(() => () => dsApplyTheme(saved), [saved]);

  const save = React.useCallback(async () => {
    if (!onThemeConfigChange) return;
    setSaving(true);
    try {
      await onThemeConfigChange(theme);
      setSaved(theme);
      dsToast.success("Theme saved");
    } catch (error) {
      dsToast.error("Couldn't save the theme", { description: error instanceof Error ? error.message : undefined });
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
      undo: () => setTheme(saved),
      // Parabola's defaults, keeping the fonts this theme added so they stay pickable.
      reset: () => setTheme({ ...DS_DEFAULT_THEME, customFonts: theme.customFonts }),
    }),
    [theme, saved, saving, onThemeConfigChange, save, setTheme]
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

/** The panel's Theme section: save it to the site, undo, or go back to Parabola's default. */
export function ThemeActions() {
  const { dirty, saving, canSave, save, undo, reset } = useThemeEditor();
  return (
    <PanelSection title="Theme">
      <p className="text-small text-ds-fg-muted">
        {canSave ? "Changes show here at once. Save makes them this site's and its admin's." : "A preview: copy the theme on the Theme page to use it."}
      </p>
      <div className="flex flex-wrap gap-ds-8">
        {canSave && (
          <DsButton variant="primary" onClick={save} disabled={!dirty} loading={saving}>
            Save
          </DsButton>
        )}
        <DsButton onClick={undo} disabled={!dirty || saving}>
          Undo
        </DsButton>
        <DsButton variant="text" onClick={reset} disabled={saving}>
          Default
        </DsButton>
      </div>
    </PanelSection>
  );
}
