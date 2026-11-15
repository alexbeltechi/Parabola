/**
 * What the command knows about Parabola's own files: which ones a file
 * imports, and the one change a copy makes to them. `add` and `update` both
 * read these, so a file is copied and later updated the same way.
 */
import { existsSync, readFileSync } from "node:fs";
import { dirname, join } from "node:path";

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
export function transform(file: string, source: string): string {
  if (file !== "provider.tsx") return source;
  return source.replace(
    /import type \{ DsThemeEntry, DsThemeLibrary \} from "\.\/theme";/,
    "// The theme engine isn't copied with a component; these are its shapes, loosely.\ntype DsThemeEntry = { id: string; name: string; theme: unknown };\ntype DsThemeLibrary = { themes: DsThemeEntry[]; active: string };"
  );
}

/** These files and every file of Parabola they import (entries first), with the npm packages they need. */
export function closure(pkgRoot: string, entries: string[]): { files: string[]; packages: string[] } {
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
  entries.forEach(visit);
  return { files, packages: [...packages].sort() };
}

export function hasDependency(cwd: string, name: string): boolean {
  try {
    const pkg = JSON.parse(readFileSync(join(cwd, "package.json"), "utf8")) as Record<string, Record<string, string> | undefined>;
    return Boolean(pkg.dependencies?.[name] ?? pkg.devDependencies?.[name]);
  } catch {
    return false;
  }
}
