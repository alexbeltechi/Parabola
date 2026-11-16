"use client";

/**
 * Plugs Parabola into Next: its links use next/link and its theme toggle saves
 * the choice through next-themes. No theme library is passed, so the Theme
 * page previews themes and offers them to copy; nothing is saved on the site.
 */

import * as React from "react";
import Link from "next/link";
import { ThemeProvider, useTheme } from "next-themes";
import { DsProvider } from "@beltechi/parabola";

function ParabolaNext({ children }: { children: React.ReactNode }) {
  const { setTheme } = useTheme();
  return (
    <DsProvider link={Link} onThemeChange={setTheme}>
      {children}
    </DsProvider>
  );
}

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
      <ParabolaNext>{children}</ParabolaNext>
    </ThemeProvider>
  );
}
