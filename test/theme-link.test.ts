import assert from "node:assert/strict";
import { test } from "node:test";
import { DS_DEFAULT_THEME } from "../theme";
import { dsThemeToFile } from "../theme-file";
import { dsThemeFromLink, dsThemeLink } from "../theme-link";

test("a theme link opens the same theme, under its name", () => {
  const file = dsThemeToFile(DS_DEFAULT_THEME, "Camp, night ☾");
  const link = dsThemeLink(file, "https://example.test/");
  assert.match(link, /^https:\/\/example\.test\/parabola\/theme#theme=[A-Za-z0-9_-]+$/);
  const back = dsThemeFromLink(new URL(link).hash);
  assert.ok(back?.ok);
  assert.equal(back.name, "Camp, night ☾");
  assert.deepEqual(back.theme, DS_DEFAULT_THEME);
});

test("a file that isn't a theme makes no link", () => {
  assert.throws(() => dsThemeLink({ format: "parabola-theme", version: 1, theme: {} }), /name/);
});

test("an address without a theme, or with a broken one", () => {
  assert.equal(dsThemeFromLink(""), null);
  assert.equal(dsThemeFromLink("#other=1"), null);
  assert.equal(dsThemeFromLink("#theme=%%%")?.ok, false);
});
