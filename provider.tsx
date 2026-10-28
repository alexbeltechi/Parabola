"use client";

import * as React from "react";
import type { DsThemeConfig } from "./theme";

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
 * - `themeConfig` / `onThemeConfigChange`: the Parabola theme the page wears
 *   (theme.ts, fonts for now) and how to save a new one, for the /parabola
 *   Theme page. Without them it previews and offers the theme to copy.
 *
 * Without a provider everything still works, in plain HTML.
 */
export type DsLinkComponent = React.ComponentType<DsLinkProps>;

export type DsLinkProps = Omit<React.ComponentProps<"a">, "href"> & { href: string };

type DsTheme = "light" | "dark";

type DsConfig = {
  link: DsLinkComponent | "a";
  onThemeChange?: (theme: DsTheme) => void;
  themeConfig?: DsThemeConfig;
  onThemeConfigChange?: (theme: DsThemeConfig) => Promise<void> | void;
};

const DsConfigContext = React.createContext<DsConfig>({ link: "a" });

export function DsProvider({
  link = "a",
  onThemeChange,
  themeConfig,
  onThemeConfigChange,
  children,
}: Partial<DsConfig> & { children: React.ReactNode }) {
  const config = React.useMemo(
    () => ({ link, onThemeChange, themeConfig, onThemeConfigChange }),
    [link, onThemeChange, themeConfig, onThemeConfigChange]
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

/** The Parabola theme the app says the page wears, and how to save one, if it said. */
export function useDsThemeConfig(): Pick<DsConfig, "themeConfig" | "onThemeConfigChange"> {
  const { themeConfig, onThemeConfigChange } = React.useContext(DsConfigContext);
  return { themeConfig, onThemeConfigChange };
}

/** Switches the theme: through the provider when set, else the `dark` class on <html>. */
export function useDsSetTheme(): (theme: DsTheme) => void {
  const { onThemeChange } = React.useContext(DsConfigContext);
  return React.useCallback(
    (theme: DsTheme) => {
      if (onThemeChange) onThemeChange(theme);
      else document.documentElement.classList.toggle("dark", theme === "dark");
    },
    [onThemeChange]
  );
}
