import type { Metadata } from "next";
import localFont from "next/font/local";
import { DS_FONTS, DS_THEME_SCOPE, DS_DEFAULT_LIBRARY, DsThemeStyle, dsActiveTheme } from "@beltechi/parabola";
import { DsShell } from "@beltechi/parabola/showcase/ds-shell";
import { Providers } from "./providers";
import "./globals.css";

// Parabola's two fonts, self-hosted from Vercel's `geist` package (no request
// to Google or a CDN, from a visitor or at build). Each sets the
// `--ds-font-<id>` its stack in fonts.ts tries first.
const geistSans = localFont({
  src: [
    { path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Variable.woff2", style: "normal" },
    { path: "../../node_modules/geist/dist/fonts/geist-sans/Geist-Italic[wght].woff2", style: "italic" },
  ],
  weight: "400 700",
  variable: "--ds-font-geist",
  display: "swap",
});
const geistSerif = localFont({
  src: [{ path: "../../node_modules/geist/dist/fonts/geist-serif/GeistSerif-Regular.woff2", style: "normal" }],
  weight: "400",
  variable: "--ds-font-geist-serif",
  display: "swap",
  preload: false,
});

export const metadata: Metadata = {
  metadataBase: new URL("https://parabolasystem.com"),
  title: { default: "Parabola", template: "%s — Parabola" },
  description:
    "Parabola is a style, not a design system in the traditional sense. Fixed below, free above: the basics of a design system, as a foundation any model can experiment on.",
};

/** The whole site is the showcase: no site nav around it, so no way "back to website". */
export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistSerif.variable}`}>
      <body className="antialiased">
        <Providers>
          <DsThemeStyle
            theme={dsActiveTheme(DS_DEFAULT_LIBRARY).theme}
            hosted={DS_FONTS.map((f) => f.id)}
            scope={DS_THEME_SCOPE}
          />
          <div className="site-root min-h-screen bg-ds-bg text-ds-fg">
            <DsShell backHref={null}>{children}</DsShell>
          </div>
        </Providers>
      </body>
    </html>
  );
}
