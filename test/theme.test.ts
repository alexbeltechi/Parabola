import assert from "node:assert/strict";
import { test } from "node:test";
import { DS_DEFAULT_THEME, parseDsThemeConfig } from "../theme";

test("an empty theme is Parabola's own, chips included", () => {
  assert.deepEqual(parseDsThemeConfig({}), DS_DEFAULT_THEME);
});

test("Parabola's own theme reads back as itself", () => {
  assert.deepEqual(parseDsThemeConfig(JSON.parse(JSON.stringify(DS_DEFAULT_THEME))), DS_DEFAULT_THEME);
});
