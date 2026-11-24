import { test } from "node:test";
import assert from "node:assert/strict";
import { renderToStaticMarkup } from "react-dom/server";
import * as React from "react";
import { DS_DEFAULT_FONT, DS_DEFAULT_HEADING_FONT, dsFont } from "../fonts";
import { DS_DEFAULT_THEME, dsFamilyFont, parseDsThemeConfig } from "../theme";
import { DsThemeStyle } from "../theme-style";
import { dsBrandKit } from "../brand-kit";

test("Parabola's own fonts are the Geist pairing", () => {
  assert.equal(dsFont(DS_DEFAULT_FONT).label, "Geist Sans");
  assert.equal(dsFont(DS_DEFAULT_HEADING_FONT).label, "Geist Serif");
});

test("a theme saved with Instrument's ids reads as Geist, each family in its own face", () => {
  const theme = parseDsThemeConfig({
    families: [
      { id: "body", label: "Font", font: "instrument-sans" },
      { id: "heading", label: "Heading", font: "instrument-serif" },
    ],
  });
  assert.equal(dsFamilyFont(theme, "body").id, "geist");
  assert.equal(dsFamilyFont(theme, "heading").id, "geist-serif");
});

test("the copy of Instrument Sans a style's pair stored goes; one someone added stays", () => {
  const paired = parseDsThemeConfig({
    families: [{ id: "body", label: "Font", font: "instrument-sans" }],
    customFonts: [{ id: "instrument-sans", label: "Instrument Sans", google: "Instrument+Sans:wght@400..700" }],
  });
  assert.equal(paired.customFonts.length, 0);
  assert.equal(dsFamilyFont(paired, "body").id, "geist");

  const added = parseDsThemeConfig({
    families: [{ id: "body", label: "Font", font: "instrument-sans" }],
    customFonts: [{ id: "instrument-sans", label: "Instrument Sans", google: "Instrument+Sans" }],
  });
  assert.equal(added.customFonts.length, 1);
  assert.equal(dsFamilyFont(added, "body").label, "Instrument Sans");
});

test("an app that hosts nothing gets Geist Sans from Google and Geist Serif as its own @font-face", () => {
  const html = renderToStaticMarkup(React.createElement(DsThemeStyle, { theme: DS_DEFAULT_THEME }));
  assert.match(html, /fonts\.googleapis\.com\/css2\?family=Geist:wght@400\.\.700/);
  assert.match(html, /@font-face \{ font-family: "Geist Serif"/);
  const hosted = renderToStaticMarkup(React.createElement(DsThemeStyle, { theme: DS_DEFAULT_THEME, hosted: ["geist", "geist-serif", "system"] }));
  assert.doesNotMatch(hosted, /googleapis|@font-face/);
});

test("the brand kit's CSS carries Geist Serif's @font-face after the Google import", () => {
  const css = dsBrandKit(DS_DEFAULT_THEME, "Classic").css;
  assert.ok(css.indexOf("@import") < css.indexOf("@font-face"));
  assert.match(css, /font-family: "Geist Serif"/);
});
