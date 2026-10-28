"use client";

import * as React from "react";
import { Moon, Sun } from "lucide-react";
import { DsButton } from "./button";
import { useDsSetTheme } from "../provider";

/**
 * Icon-only light/dark switch. Flips whichever theme is showing (the `dark`
 * class on <html>, so "system" works too) and hands the new one to the app
 * through DsProvider `onThemeChange`. Extra props (and a ref) pass to the
 * button, so it can sit inside a DsTooltip. `variant="text"` makes it a
 * ghost, for a row of ghost buttons such as a site's nav.
 */
export function DsThemeToggle({
  onClick,
  variant = "default",
  ...props
}: Omit<React.ComponentProps<"button">, "children"> & { variant?: "default" | "text" }) {
  const setTheme = useDsSetTheme();

  // Both icons render; CSS picks one so there's no hydration flash.
  return (
    <DsButton
      iconOnly
      variant={variant}
      aria-label="Toggle theme"
      {...props}
      onClick={(e) => {
        onClick?.(e);
        setTheme(document.documentElement.classList.contains("dark") ? "light" : "dark");
      }}
    >
      <Moon className="dark:hidden" />
      <Sun className="hidden dark:block" />
    </DsButton>
  );
}
