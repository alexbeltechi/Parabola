"use client";

import * as React from "react";
import type { DsThemeEntry, DsThemeLibrary } from "./theme";

/**
 * Parabola's hooks into the app's framework, set once near the root:
 *
 *   <DsProvider link={Link} onThemeChange={setTheme}>…</DsProvider>
 *
 * - `link`: the component that renders every Parabola link (DsButton,
 *   DsNavItem and DsListRow with `href`), e.g. Next's `Link` for client-side
 *   navigation and prefetching. Default: a plain `<a>`.
 * - `onThemeChange`: called by DsThemeToggle with the theme to switch to,
 *   e.g. next-themes' `setTheme`, so the choice is saved. Default: the toggle
 *   flips the `dark` class on <html> itself (not remembered across visits).
 * - `themeLibrary` / `publishedTheme` / `onThemeLibraryChange`: the app's
 *   Parabola themes as saved (theme.ts), the one its website wears as
 *   published, and how to save them (and, with an entry, publish that one
 *   too), for /parabola. Without them it previews and offers a theme to copy.
 *
 * Without a provider everything still works, in plain HTML.
 */
export type DsLinkComponent = React.ComponentType<DsLinkProps>;

export type DsLinkProps = Omit<React.ComponentProps<"a">, "href"> & { href: string };

type DsTheme = "light" | "dark";
/** A page-wide pick: light, dark, or back to following the system. */
type DsThemeChoice = DsTheme | "system";

type DsConfig = {
  link: DsLinkComponent | "a";
  onThemeChange?: (theme: DsThemeChoice) => void;
  themeLibrary?: DsThemeLibrary;
  /** The theme the website wears, as published. */
  publishedTheme?: DsThemeEntry;
  /** Save the themes; with `publish`, make that theme the website's too. */
  onThemeLibraryChange?: (library: DsThemeLibrary, publish?: DsThemeEntry) => Promise<void> | void;
};

const DsConfigContext = React.createContext<DsConfig>({ link: "a" });

export function DsProvider({
  link = "a",
  onThemeChange,
  themeLibrary,
  publishedTheme,
  onThemeLibraryChange,
  children,
}: Partial<DsConfig> & { children: React.ReactNode }) {
  const config = React.useMemo(
    () => ({ link, onThemeChange, themeLibrary, publishedTheme, onThemeLibraryChange }),
    [link, onThemeChange, themeLibrary, publishedTheme, onThemeLibraryChange]
  );
  return <DsConfigContext.Provider value={config}>{children}</DsConfigContext.Provider>;
}

/**
 * Light and dark for part of the page that keeps its own mode (a
 * `data-ds-mode` element, as /parabola's canvas): a theme toggle inside it
 * switches that part only, through `onThemeChange`. Everything else the app
 * gave DsProvider stays.
 */
export function DsModeScope({ onThemeChange, children }: { onThemeChange: (theme: DsTheme) => void; children: React.ReactNode }) {
  const parent = React.useContext(DsConfigContext);
  // A part of the page has no system to follow: "system" there means nothing to do.
  const config = React.useMemo(
    () => ({ ...parent, onThemeChange: (theme: DsThemeChoice) => theme !== "system" && onThemeChange(theme) }),
    [parent, onThemeChange],
  );
  return <DsConfigContext.Provider value={config}>{children}</DsConfigContext.Provider>;
}

/**
 * A link through the app's link component. Parabola's own links render this,
 * so they can stay server-safe: only this small piece reads the provider.
 */
export function DsLink(props: DsLinkProps) {
  const { link: Link } = React.useContext(DsConfigContext);
  return <Link {...props} />;
}

/** The app's Parabola themes, and how to publish them, if it said. */
export function useDsThemeLibrary(): Pick<DsConfig, "themeLibrary" | "publishedTheme" | "onThemeLibraryChange"> {
  const { themeLibrary, publishedTheme, onThemeLibraryChange } = React.useContext(DsConfigContext);
  return { themeLibrary, publishedTheme, onThemeLibraryChange };
}

/** Switches the theme: through the provider when set, else the `dark` class on <html>. */
export function useDsSetTheme(): (theme: DsThemeChoice) => void {
  const { onThemeChange } = React.useContext(DsConfigContext);
  return React.useCallback(
    (theme: DsThemeChoice) => {
      if (onThemeChange) onThemeChange(theme);
      else
        document.documentElement.classList.toggle(
          "dark",
          theme === "system" ? window.matchMedia("(prefers-color-scheme: dark)").matches : theme === "dark",
        );
    },
    [onThemeChange]
  );
}
