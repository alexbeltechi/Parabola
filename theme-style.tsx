import * as React from "react";
import { dsGoogleFontsUrl } from "./fonts";
import { dsThemeCss, type DsThemeConfig } from "./theme";

/**
 * Applies a Parabola theme (theme.ts) to the page: one <style> that sets its
 * tokens on :root, and, unless the app hosts its fonts itself
 * (`loadFonts={false}`), the Google Fonts stylesheet for the ones it uses.
 * Render it once in the document's <head>. Server-safe: no hooks.
 */
export function DsThemeStyle({ theme, loadFonts = true }: { theme: DsThemeConfig; loadFonts?: boolean }) {
  const fontsUrl = loadFonts ? dsGoogleFontsUrl([theme.fonts.text, theme.fonts.headings]) : null;
  return (
    <>
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      <style data-slot="ds-theme" dangerouslySetInnerHTML={{ __html: dsThemeCss(theme) }} />
    </>
  );
}
