import * as React from "react";
import { dsFontFacesCss, dsGoogleFontsUrl } from "./fonts";
import { dsThemeCss, dsThemeFont, type DsThemeConfig } from "./theme";

/**
 * Applies a Parabola theme (theme.ts) to the page: one <style> that sets its
 * tokens on :root, and one Google Fonts stylesheet for the Google fonts its
 * families use (a font Google doesn't carry comes as its own `@font-face`
 * in the same <style>), leaving out the ones the app hosts itself (`hosted`, by
 * font id: Darmio hosts Parabola's own with next/font). Render it once in
 * the page. With `scope`, only that class wears it (dsThemeCss). Server-safe:
 * no hooks.
 */
export function DsThemeStyle({
  theme,
  hosted = [],
  scope,
}: {
  theme: DsThemeConfig;
  hosted?: readonly string[];
  scope?: string;
}) {
  const fonts = theme.families
    .map((family) => dsThemeFont(theme, family.font))
    .filter((font) => !hosted.includes(font.id));
  const fontsUrl = dsGoogleFontsUrl(fonts);
  const faces = dsFontFacesCss(fonts);
  return (
    <>
      {fontsUrl && <link rel="stylesheet" href={fontsUrl} />}
      <style data-slot="ds-theme" dangerouslySetInnerHTML={{ __html: `${faces ? `${faces}\n` : ""}${dsThemeCss(theme, scope)}` }} />
    </>
  );
}
