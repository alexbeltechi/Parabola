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
 * Plain Node, no prompts: it prints what it did. `run` takes the folders and
 * output as arguments so a test can drive it.
 */
import { existsSync, mkdirSync, readFileSync, readdirSync, writeFileSync } from "node:fs";
import { dirname, join, relative, resolve } from "node:path";
import { dsBrandKit, dsThemeFromPaste } from "../brand-kit";
import { DS_DEFAULT_THEME, type DsThemeConfig } from "../theme";

const USAGE = `Parabola: copy a design system into your project.

  add theme [--from parabola-theme.json | --code <theme>] [--name <name>]
  add <component> [<component>…]      (button, pill, field…)
  list                                the components you can add

Options
  --dir <folder>      where to put it (default: parabola/, or src/parabola/ in a project with src/)
  --css <file>        the stylesheet to import the theme from (default: the project's globals.css)
  --overwrite         replace files that already exist
  --code <theme>      the theme pasted: Parabola code (JSON) or the same as base64
`;

export type RunIo = { log: (line: string) => void; error: (line: string) => void };

type Options = { positional: string[]; flags: Record<string, string | true> };

const VALUE_FLAGS = ["from", "code", "name", "dir", "css"];

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

const FILE_EXTENSIONS = ["", ".ts", ".tsx", "/index.ts", "/index.tsx"];

function resolveFile(pkgRoot: string, from: string, spec: string): string | null {
  const base = join(dirname(from), spec);
  for (const ext of FILE_EXTENSIONS) {
    const path = base + ext;
    if (/\.(tsx?|css)$/.test(path) && existsSync(join(pkgRoot, path))) return path;
  }
  return null;
}

/**
 * Parabola's `provider.tsx` imports its theme *types* only; a copy would
 * pull the whole theme engine in for them, so they're stubbed where copied.
 */
function transform(file: string, source: string): string {
  if (file !== "provider.tsx") return source;
  return source.replace(
    /import type \{ DsThemeEntry, DsThemeLibrary \} from "\.\/theme";/,
    "// The theme engine isn't copied with a component; these are its shapes, loosely.\ntype DsThemeEntry = { id: string; name: string; theme: unknown };\ntype DsThemeLibrary = { themes: DsThemeEntry[]; active: string };"
  );
}

/** A component's files (paths in the package, entry first) and the npm packages they import. */
export function resolveComponent(pkgRoot: string, name: string): { files: string[]; packages: string[] } {
  const entry = ["primitives", "components"].map((f) => `${f}/${name}.tsx`).find((p) => existsSync(join(pkgRoot, p)));
  if (!entry) throw new Error(`No component called "${name}". Run \`list\` to see them.`);
  const files: string[] = [];
  const packages = new Set<string>();
  const visit = (file: string) => {
    if (files.includes(file)) return;
    files.push(file);
    const source = readFileSync(join(pkgRoot, file), "utf8");
    for (const [, spec] of source.matchAll(/(?:from|import)\s+["']([^"']+)["']/g)) {
      if (file === "provider.tsx" && spec === "./theme") continue;
      if (spec.startsWith(".")) {
        const next = resolveFile(pkgRoot, file, spec);
        if (next) visit(next);
      } else if (!spec.startsWith("node:")) {
        packages.add(spec.startsWith("@") ? spec.split("/").slice(0, 2).join("/") : spec.split("/")[0]);
      }
    }
  };
  visit(entry);
  return { files, packages: [...packages].sort() };
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
  return existsSync(join(cwd, "src")) ? "src/parabola" : "parabola";
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
  io.log("Adding the theme:");
  write(join(dir, "tokens.css"), readFileSync(join(pkgRoot, "tokens.css"), "utf8"), overwrite, cwd, io);
  // The theme is what the maker changes, so it's always replaced.
  const fonts = (kit.theme.typography as { googleFonts?: string }).googleFonts;
  write(join(dir, "theme.css"), kit.css.replace(/^@import url\([^\n]*\n+/, ""), true, cwd, io);
  write(join(dir, "parabola-theme.json"), `${JSON.stringify(kit.theme, null, 2)}\n`, true, cwd, io);
  const css = typeof flags.css === "string" ? resolve(cwd, flags.css) : STYLESHEETS.map((p) => join(cwd, p)).find(existsSync);
  if (css && existsSync(css)) importInto(css, cwd, dir, fonts, io);
  else io.log(`  No stylesheet found. First line of yours: ${fonts ? `@import url("${fonts}");` : "(no web fonts)"}. After Tailwind's import, add:\n    @import "${relative(cwd, join(dir, "tokens.css")).split("\\").join("/")}";\n    @import "${relative(cwd, join(dir, "theme.css")).split("\\").join("/")}";\n  (paths relative to that stylesheet)`);
  return 0;
}

function addComponents(names: string[], opts: Options, pkgRoot: string, cwd: string, io: RunIo): number {
  const overwrite = opts.flags.overwrite === true;
  const dir = resolve(cwd, typeof opts.flags.dir === "string" ? opts.flags.dir : defaultDir(cwd));
  const packages = new Set<string>();
  for (const name of names) {
    const found = resolveComponent(pkgRoot, name);
    io.log(`Adding ${name}:`);
    for (const file of found.files) {
      write(join(dir, file), transform(file, readFileSync(join(pkgRoot, file), "utf8")), overwrite, cwd, io);
    }
    found.packages.forEach((p) => packages.add(p));
    const entry = relative(cwd, join(dir, found.files[0])).replace(/\.tsx$/, "").split("\\").join("/");
    io.log(`  import from "${entry}" (your path alias may shorten it)`);
  }
  const missing = [...packages].filter((p) => !hasDependency(cwd, p));
  if (missing.length) io.log(`\nInstall what they need:\n  npm install ${missing.join(" ")}`);
  io.log("\nThey draw from the theme's tokens: run `add theme` too if you haven't.");
  return 0;
}

function hasDependency(cwd: string, name: string): boolean {
  try {
    const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")) as Record<string, Record<string, string> | undefined>;
    return Boolean(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]);
  } catch {
    return false;
  }
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
    if (command !== "add") throw new Error(`Unknown command "${command}".\n\n${USAGE}`);
    if (!rest.length) throw new Error("Add what? `add theme`, or a component such as `add button`.");
    if (rest[0] === "theme") {
      const code = addTheme(opts, pkgRoot, cwd, io);
      return rest.length > 1 ? addComponents(rest.slice(1), opts, pkgRoot, cwd, io) : code;
    }
    return addComponents(rest, opts, pkgRoot, cwd, io);
  } catch (e) {
    io.error(e instanceof Error ? e.message : String(e));
    return 1;
  }
}
