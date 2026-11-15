/**
 * The command behind `npx <parabola> add …`: copies Parabola into a project
 * the way shadcn's `add` does, so the maker owns the files.
 *
 * - `add theme`: the theme's tokens, as `tokens.css` (the `ds-*` utilities),
 *   `theme.css` (the theme's CSS variables, light and dark, and its fonts)
 *   and `parabola-theme.json` (the theme, to read back), written to
 *   `<dir>/`, and imported from the project's stylesheet.
 * - `add <component>` (`button`, `pill`…): that component's file and every
 *   file of Parabola it imports, in the same folders it has in the package
 *   (so its imports hold), plus the npm packages to install.
 *
 * - `add shadcn`: `shadcn.css`, which points shadcn/ui's colour names at
 *   the theme's tokens. Optional; only for a project that uses shadcn parts.
 * - `update`, `status`: a newer Parabola into a project that already has a
 *   copy, keeping what the project changed (`update.ts`). Every `add` notes
 *   what it copied in `parabola.json` so `update` knows where it came from.
 *
 * Plain Node, no prompts: it prints what it did. `run` takes the folders and
 * output as arguments so a test can drive it.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { dsBrandKit, dsThemeFromPaste } from "../brand-kit";
import { DS_DEFAULT_THEME, type DsThemeConfig } from "../theme";
import { closure, hasDependency, transform } from "./files";
import { DEFAULT_SOURCE, commitOf, readManifest, runUpdate, writeManifest, type Manifest } from "./update";

const USAGE = `Parabola: copy a design system into your project.

  add theme [--from parabola-theme.json | --code <theme>] [--name <name>]
  add <component> [<component>…]      (button, pill, field…)
  add shadcn                          optional: shadcn/ui's colour names pointed at the theme,
                                      so shadcn components wear it
  list                                the components you can add

Options
  --dir <folder>      where to put it (default: parabola/, or src/parabola/ in a project with src/)
  --css <file>        the stylesheet to import the theme from (default: the project's globals.css)
  --overwrite         replace files that already exist
  --code <theme>      the theme pasted: Parabola code (JSON) or the same as base64
`;

export type RunIo = { log: (line: string) => void; error: (line: string) => void };

type Options = { positional: string[]; flags: Record<string, string | true> };

const VALUE_FLAGS = ["from", "code", "name", "dir", "css", "to", "source"];

export function parseArgs(argv: string[]): Options {
  const positional: string[] = [];
  const flags: Record<string, string | true> = {};
  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (!arg.startsWith("--")) {
      positional.push(arg);
      continue;
    }
    const [key, inline] = arg.slice(2).split(/=([\s\S]*)/);
    if (!VALUE_FLAGS.includes(key)) flags[key] = true;
    else if (inline !== undefined) flags[key] = inline;
    else if (argv[i + 1] !== undefined) flags[key] = argv[++i];
    else throw new Error(`--${key} needs a value.`);
  }
  return { positional, flags };
}

/** A theme from pasted text: Parabola code, a kit's tokens.json, or either as base64. Null if it isn't one. */
export function themeFromText(text: string): DsThemeConfig | null {
  const trimmed = text.trim();
  const direct = dsThemeFromPaste(trimmed);
  if (direct) return direct;
  if (/^[A-Za-z0-9+/=_-]+$/.test(trimmed)) {
    try {
      return dsThemeFromPaste(Buffer.from(trimmed, "base64").toString("utf8"));
    } catch {
      return null;
    }
  }
  return null;
}

/** Every component name Parabola can add: its primitives and components. */
export function listComponents(pkgRoot: string): string[] {
  return ["primitives", "components"].flatMap((folder) => {
    const dir = join(pkgRoot, folder);
    if (!existsSync(dir)) return [];
    return readdirSync(dir)
      .filter((f) => /\.tsx$/.test(f))
      .map((f) => f.replace(/\.tsx$/, ""));
  });
}

/** A component's files (paths in the package, entry first) and the npm packages they import. */
export function resolveComponent(pkgRoot: string, name: string): { files: string[]; packages: string[] } {
  const entry = ["primitives", "components"].map((f) => `${f}/${name}.tsx`).find((p) => existsSync(join(pkgRoot, p)));
  if (!entry) throw new Error(`No component called "${name}". Run \`list\` to see them.`);
  return closure(pkgRoot, [entry]);
}

function write(path: string, body: string, overwrite: boolean, cwd: string, io: RunIo): boolean {
  if (existsSync(path) && !overwrite) {
    io.log(`  skipped  ${relative(cwd, path)} (exists; --overwrite replaces it)`);
    return false;
  }
  mkdirSync(dirname(path), { recursive: true });
  writeFileSync(path, body);
  io.log(`  wrote    ${relative(cwd, path)}`);
  return true;
}

function defaultDir(cwd: string): string {
  return readManifest(cwd)?.dir ?? (existsSync(join(cwd, "src")) ? "src/parabola" : "parabola");
}

/** Where this Parabola is fetched from, for a project's parabola.json. */
function sourceOf(pkgRoot: string): string {
  try {
    const repo = (JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8")) as { repository?: { url?: string } }).repository;
    return repo?.url?.replace(/^git\+/, "") || DEFAULT_SOURCE;
  } catch {
    return DEFAULT_SOURCE;
  }
}

function versionOf(pkgRoot: string): string {
  return (JSON.parse(readFileSync(join(pkgRoot, "package.json"), "utf8")) as { version: string }).version;
}

/** A copy can't mix two Parabolas: `update` would no longer know what each file started as. */
function assertSameVersion(cwd: string, pkgRoot: string): void {
  const manifest = readManifest(cwd);
  if (!manifest) return;
  const commit = commitOf(pkgRoot);
  const same = manifest.commit && commit ? manifest.commit === commit : manifest.version === versionOf(pkgRoot);
  if (!same) {
    throw new Error(`This project is on Parabola ${manifest.version} and this command is ${versionOf(pkgRoot)}. Run \`update\` first, then add.`);
  }
}

/** Notes the copied files in parabola.json, so `update` knows where each came from. */
function record(cwd: string, pkgRoot: string, dir: string, files: string[]): void {
  const existing = readManifest(cwd);
  if (existing?.files === "*") return;
  const commit = commitOf(pkgRoot);
  const manifest: Manifest = {
    source: existing?.source ?? sourceOf(pkgRoot),
    version: versionOf(pkgRoot),
    ...(commit ? { commit } : {}),
    dir: relative(cwd, dir).split("\\").join("/") || ".",
    files: [...new Set([...(existing?.files ?? []), ...files])].filter((f) => existsSync(join(dir, f))).sort(),
  };
  writeManifest(cwd, manifest);
}

const STYLESHEETS = ["src/app/globals.css", "app/globals.css", "src/styles/globals.css", "styles/globals.css", "src/index.css", "src/globals.css"];

// The CLI marks the fonts import it writes, so a rerun replaces only its own line.
const FONTS_MARK = "/* parabola:fonts */";
const FONTS_IMPORT = /\/\* parabola:fonts \*\/\n@import url\([^\n]*\n+/;

/**
 * Adds the two imports under Tailwind's, if the stylesheet doesn't have them yet,
 * and the theme's Google fonts import at the very top (CSS wants `@import url()`
 * first, so it can't live in theme.css, which Tailwind inlines mid-file).
 */
function importInto(css: string, cwd: string, dir: string, fonts: string | undefined, io: RunIo): void {
  let source = readFileSync(css, "utf8");
  const fontsLine = fonts ? `${FONTS_MARK}\n@import url("${fonts}");\n` : "";
  if (!fontsLine ? FONTS_IMPORT.test(source) : !source.includes(fontsLine)) {
    source = fontsLine + source.replace(FONTS_IMPORT, "");
    writeFileSync(css, source);
    if (fonts) io.log(`  updated  ${relative(cwd, css)} (the theme's fonts, first line)`);
  }
  const rel = (file: string) => {
    const path = relative(dirname(css), join(dir, file)).split("\\").join("/");
    return path.startsWith(".") ? path : `./${path}`;
  };
  const lines = [`@import "${rel("tokens.css")}";`, `@import "${rel("theme.css")}";`].filter((line) => !source.includes(line));
  if (!lines.length) return io.log(`  kept     ${relative(cwd, css)} (already imports them)`);
  const tailwind = source.match(/^@import\s+["']tailwindcss["'][^;]*;[ \t]*$/m);
  if (!tailwind) {
    io.log(`  Add these to ${relative(cwd, css)}, after Tailwind's import:\n    ${lines.join("\n    ")}`);
    return;
  }
  const at = (tailwind.index ?? 0) + tailwind[0].length;
  writeFileSync(css, `${source.slice(0, at)}\n${lines.join("\n")}${source.slice(at)}`);
  io.log(`  updated  ${relative(cwd, css)} (imports tokens.css and theme.css)`);
}

function addTheme(opts: Options, pkgRoot: string, cwd: string, io: RunIo): number {
  const { flags } = opts;
  let theme: DsThemeConfig = DS_DEFAULT_THEME;
  if (typeof flags.from === "string") {
    const file = resolve(cwd, flags.from);
    if (!existsSync(file)) throw new Error(`No file at ${flags.from}. Download the brand kit from /parabola/theme (Share) and use its parabola-theme.json.`);
    const read = themeFromText(readFileSync(file, "utf8"));
    if (!read) throw new Error(`${flags.from} isn't a Parabola theme (expected parabola-theme.json from the brand kit).`);
    theme = read;
  } else if (typeof flags.code === "string") {
    const read = themeFromText(flags.code);
    if (!read) throw new Error("That isn't Parabola code. Copy the command again from /parabola/theme.");
    theme = read;
  } else {
    io.log("No --from or --code given: using Parabola's own theme.");
  }
  const name = typeof flags.name === "string" ? flags.name : "Parabola";
  const overwrite = flags.overwrite === true;
  const dir = resolve(cwd, typeof flags.dir === "string" ? flags.dir : defaultDir(cwd));
  const kit = dsBrandKit(theme, name);
  assertSameVersion(cwd, pkgRoot);
  io.log("Adding the theme:");
  write(join(dir, "tokens.css"), readFileSync(join(pkgRoot, "tokens.css"), "utf8"), overwrite, cwd, io);
  record(cwd, pkgRoot, dir, ["tokens.css"]);
  // The theme is what the maker changes, so it's always replaced.
  const fonts = (kit.theme.typography as { googleFonts?: string }).googleFonts;
  write(join(dir, "theme.css"), kit.css.replace(/^@import url\([^\n]*\n+/, ""), true, cwd, io);
  write(join(dir, "parabola-theme.json"), `${JSON.stringify(kit.theme, null, 2)}\n`, true, cwd, io);
  const css = typeof flags.css === "string" ? resolve(cwd, flags.css) : STYLESHEETS.map((p) => join(cwd, p)).find(existsSync);
  if (css && existsSync(css)) importInto(css, cwd, dir, fonts, io);
  else io.log(`  No stylesheet found. First line of yours: ${fonts ? `@import url("${fonts}");` : "(no web fonts)"}. After Tailwind's import, add:\n    @import "${relative(cwd, join(dir, "tokens.css")).split("\\").join("/")}";\n    @import "${relative(cwd, join(dir, "theme.css")).split("\\").join("/")}";\n  (paths relative to that stylesheet)`);
  return 0;
}

/** Copies shadcn.css and imports it after the theme, so shadcn/ui components wear the theme. */
function addShadcn(opts: Options, pkgRoot: string, cwd: string, io: RunIo): number {
  assertSameVersion(cwd, pkgRoot);
  const dir = resolve(cwd, typeof opts.flags.dir === "string" ? opts.flags.dir : defaultDir(cwd));
  io.log("Adding shadcn's names:");
  write(join(dir, "shadcn.css"), readFileSync(join(pkgRoot, "shadcn.css"), "utf8"), opts.flags.overwrite === true, cwd, io);
  record(cwd, pkgRoot, dir, ["shadcn.css"]);
  const css = typeof opts.flags.css === "string" ? resolve(cwd, opts.flags.css) : STYLESHEETS.map((p) => join(cwd, p)).find(existsSync);
  const path = (file: string, from: string) => {
    const rel = relative(dirname(from), join(dir, file)).split("\\").join("/");
    return rel.startsWith(".") ? rel : `./${rel}`;
  };
  if (!css || !existsSync(css)) {
    io.log("  No stylesheet found. Import shadcn.css in yours, after tokens.css and theme.css.");
    return 0;
  }
  const source = readFileSync(css, "utf8");
  const line = `@import "${path("shadcn.css", css)}";`;
  if (source.includes(line)) {
    io.log(`  kept     ${relative(cwd, css)} (already imports it)`);
    return 0;
  }
  // After the theme, so the names point at tokens that exist; in a project that ran shadcn's own setup, after its values too.
  const theme = `@import "${path("theme.css", css)}";`;
  if (!source.includes(theme)) {
    io.log(`  Add this to ${relative(cwd, css)}, after the theme's imports (run \`add theme\` first if there are none):\n    ${line}`);
    return 0;
  }
  writeFileSync(css, source.replace(theme, `${theme}\n${line}`));
  io.log(`  updated  ${relative(cwd, css)} (imports shadcn.css after the theme)`);
  if (/^\s*--background\s*:/m.test(source)) {
    io.log("  This stylesheet gives shadcn's names values of its own (--background…). Take those out, or the later one wins.");
  }
  return 0;
}

function addComponents(names: string[], opts: Options, pkgRoot: string, cwd: string, io: RunIo): number {
  const overwrite = opts.flags.overwrite === true;
  const dir = resolve(cwd, typeof opts.flags.dir === "string" ? opts.flags.dir : defaultDir(cwd));
  const packages = new Set<string>();
  const copied: string[] = [];
  assertSameVersion(cwd, pkgRoot);
  for (const name of names) {
    const found = resolveComponent(pkgRoot, name);
    copied.push(...found.files);
    io.log(`Adding ${name}:`);
    for (const file of found.files) {
      write(join(dir, file), transform(file, readFileSync(join(pkgRoot, file), "utf8")), overwrite, cwd, io);
    }
    found.packages.forEach((p) => packages.add(p));
    const entry = relative(cwd, join(dir, found.files[0])).replace(/\.tsx$/, "").split("\\").join("/");
    io.log(`  import from "${entry}" (your path alias may shorten it)`);
  }
  record(cwd, pkgRoot, dir, copied);
  const missing = [...packages].filter((p) => !hasDependency(cwd, p));
  if (missing.length) io.log(`\nInstall what they need:\n  npm install ${missing.join(" ")}`);
  io.log("\nThey draw from the theme's tokens: run `add theme` too if you haven't.");
  return 0;
}

/** Runs the command; returns the exit code. */
export function run(argv: string[], cwd: string, pkgRoot: string, io: RunIo): number {
  try {
    const opts = parseArgs(argv);
    const [command, ...rest] = opts.positional;
    if (!command || opts.flags.help) {
      io.log(USAGE);
      return command || opts.flags.help ? 0 : 1;
    }
    if (command === "list") {
      io.log(listComponents(pkgRoot).join("\n"));
      return 0;
    }
    if (command === "update" || command === "status") return runUpdate(opts.flags, cwd, io, command === "status");
    if (command !== "add") throw new Error(`Unknown command "${command}".\n\n${USAGE}`);
    if (!rest.length) throw new Error("Add what? `add theme`, or a component such as `add button`.");
    // `theme` and `shadcn` aren't components: each is its own step, in this order, then the components.
    const names = rest.filter((name) => name !== "theme" && name !== "shadcn");
    let code = 0;
    if (rest.includes("theme")) code = addTheme(opts, pkgRoot, cwd, io) || code;
    if (rest.includes("shadcn")) code = addShadcn(opts, pkgRoot, cwd, io) || code;
    if (names.length) code = addComponents(names, opts, pkgRoot, cwd, io) || code;
    return code;
  } catch (e) {
    io.error(e instanceof Error ? e.message : String(e));
    return 1;
  }
}
