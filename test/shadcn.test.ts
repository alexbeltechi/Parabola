import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, readFileSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { test } from "node:test";
import { run } from "../cli/core";
import { readManifest } from "../cli/update";

const bridge = readFileSync(join(process.cwd(), "shadcn.css"), "utf8");
const tokens = readFileSync(join(process.cwd(), "tokens.css"), "utf8");

/** The names shadcn/ui's components read (its Tailwind v4 theme). When shadcn adds one, add it here and in shadcn.css. */
const SHADCN_NAMES = [
  "background", "foreground", "card", "card-foreground", "popover", "popover-foreground",
  "primary", "primary-foreground", "secondary", "secondary-foreground", "muted", "muted-foreground",
  "accent", "accent-foreground", "destructive", "border", "input", "ring",
  "chart-1", "chart-2", "chart-3", "chart-4", "chart-5",
  "sidebar", "sidebar-foreground", "sidebar-primary", "sidebar-primary-foreground",
  "sidebar-accent", "sidebar-accent-foreground", "sidebar-border", "sidebar-ring",
];

test("shadcn.css gives every name shadcn reads a value, and a utility", () => {
  for (const name of [...SHADCN_NAMES, "radius"]) assert.match(bridge, new RegExp(`^  --${name}: var\\(--ds-`, "m"), `--${name}`);
  for (const name of SHADCN_NAMES) assert.ok(bridge.includes(`--color-${name}: var(--${name});`), `--color-${name}`);
});

test("every Parabola token shadcn.css points at exists", () => {
  const used = new Set([...bridge.matchAll(/var\((--ds-[a-z0-9-]+)\)/g)].map((m) => m[1]));
  assert.ok(used.size > 10);
  for (const token of used) assert.match(tokens, new RegExp(`^\\s*${token}:`, "m"), `${token} isn't in tokens.css`);
});

test("add shadcn copies the file, imports it after the theme, and notes it", () => {
  const cwd = mkdtempSync(join(tmpdir(), "parabola-shadcn-"));
  mkdirSync(join(cwd, "src/app"), { recursive: true });
  writeFileSync(join(cwd, "src/app/globals.css"), '@import "tailwindcss";\n\nbody { margin: 0; }\n');
  writeFileSync(join(cwd, "package.json"), JSON.stringify({ dependencies: {} }));
  const out: string[] = [];
  const io = { log: (l: string) => out.push(l), error: (l: string) => out.push(`ERR ${l}`) };
  assert.equal(run(["add", "theme", "shadcn"], cwd, process.cwd(), io), 0);
  const css = readFileSync(join(cwd, "src/app/globals.css"), "utf8");
  assert.match(css, /@import "\.\.\/parabola\/theme\.css";\n@import "\.\.\/parabola\/shadcn\.css";/);
  assert.equal(readFileSync(join(cwd, "src/parabola/shadcn.css"), "utf8"), bridge);
  assert.deepEqual(readManifest(cwd)?.files, ["shadcn.css", "tokens.css"]);
  // Again: nothing doubles.
  assert.equal(run(["add", "shadcn"], cwd, process.cwd(), io), 0);
  assert.equal(readFileSync(join(cwd, "src/app/globals.css"), "utf8"), css);
});
