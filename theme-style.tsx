import * as React from "react";
import { dsGoogleFontsUrl } from "./fonts";
import { dsThemeCss, dsThemeFont, type DsThemeConfig } from "./theme";

/**
 * Applies a Parabola theme (theme.ts) to the page: one <style> that sets its
 * tokens on :root, and one Google Fonts stylesheet for the Google fonts its
 * families use, leaving out the ones the app hosts itself (`hosted`, by
 * font id: the CMS hosts Parabola's own with next/font). Render it once in
 * the document's <head>. Server-safe: no hooks.
 */
export function DsThemeStyle({ theme, hosted = [] }: { theme: DsThemeConfig; hosted?: readonly string[] }) {
  const fonts = theme.families
    .map((family) => dsThemeFont(theme, family.font))
    .filter((font) => !hosted.includes(font.id));
  const fontsUrl = dsGoogleFontsUrl(fonts);
  return (
    <>
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      <style data-slot="ds-theme" dangerouslySetInnerHTML={{ __html: dsThemeCss(theme) }} />
    </>
  );
}
