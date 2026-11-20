"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { DsButton } from "./button";
import { useDsSetTheme } from "../provider";

/**
 * Icon-only light/dark switch. Flips whichever theme is showing (the `dark`
 * class on <html>, so "system" works too, or the mode of the part of the
 * page it's in: `data-ds-mode`, DsModeScope) and hands the new one to the app
 * through DsProvider `onThemeChange`; for the whole page, the system's own
 * mode is handed over as "system", so the page follows the system again
 * rather than keeping a pick that only matched it. Extra props (and a ref) pass to the
 * button, so it can sit inside a DsTooltip. `variant="text"` makes it a
 * ghost, for a row of ghost buttons such as a site's nav; `size="small"`
 * for a row of small controls.
 */
export function DsThemeToggle({
  onClick,
  variant = "default",
  size = "default",
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & { variant?: "default" | "text"; size?: "default" | "small" }) {
  const setTheme = useDsSetTheme();

  // Both icons render; CSS picks one so there's no hydration flash.
  return (
    <DsButton
      iconOnly
      variant={variant}
      size={size}
      aria-label="Toggle theme"
      {...props}
      onClick={(e) => {
        onClick?.(e);
        const scope = e.currentTarget.closest<HTMLElement>("[data-ds-mode]");
        const dark = scope ? scope.dataset.dsMode === "dark" : document.documentElement.classList.contains("dark");
        const next = dark ? "light" : "dark";
        // For the whole page, landing on the system's own mode hands the choice back to the system, so the page
        // keeps following it (a pick that matches the system is no pick). A part of the page keeps its pick.
        const system = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
        setTheme(!scope && next === system ? "system" : next);
      }}
    >
      <Moon className="dark:hidden" />
      <Sun className="hidden dark:block" />
    </DsButton>
  );
}
