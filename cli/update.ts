/**
 * `update` and `status`: how a project that copied Parabola takes a newer one
 * without losing what it changed.
 *
 * A project owns its copy. `parabola.json` at its root says which Parabola
 * the copy came from (`version`, `commit`), where it sits (`dir`) and which
 * files it holds (`files`: a list, or "*" for the whole package). `update`
 * fetches Parabola, then looks at each file three ways: as it was when
 * copied, as the project has it now, and as Parabola has it now.
 *
 * - the project never touched it: it takes Parabola's
 * - only the project changed it: it stays
 * - both changed it: the two are merged, as git would, and where they clash
 *   the file gets git's conflict markers for a person or their agent to settle
 *
 * Nothing happens to a project until someone runs this, and it refuses to
 * run over uncommitted work, so `git checkout` undoes it. The same shape as
 * Copier's `update` for project templates; shadcn's `add --diff` shows the
 * difference and leaves the merge to you.
 */
import { spawnSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, relative, resolve } from "node:path";
import { closure, hasDependency, transform } from "./files";

export const MANIFEST = "parabola.json";
export const DEFAULT_SOURCE = "https://github.com/alexbeltechi/parabola.git";

export type Manifest = {
  /** Where Parabola is fetched from: a git address, or a folder. */
  source: string;
  /** The Parabola this copy came from. `commit` is exact; without it, the tag `v<version>`. */
  version: string;
  commit?: string;
  /** The folder the copy sits in, from the project's root. */
  dir: string;
  /** The files copied, as paths in Parabola; "*" is the whole package. */
  files: "*" | string[];
  /** With "*": paths left out (a folder ends in "/"). */
  exclude?: string[];
};

type Io = { log: (line: string) => void; error: (line: string) => void };
type Flags = Record<string, string | true>;

export function readManifest(cwd: string): Manifest | null {
  const path = join(cwd, MANIFEST);
  if (!existsSync(path)) return null;
  const read = JSON.parse(readFileSync(path, "utf8")) as Partial<Manifest>;
  if (!read.version || !read.dir || !read.files) throw new Error(`${MANIFEST} needs "version", "dir" and "files".`);
  return { source: DEFAULT_SOURCE, ...read } as Manifest;
}

export function writeManifest(cwd: string, manifest: Manifest): void {
  const { source, version, commit, dir, files, exclude } = manifest;
  const ordered = { source, version, ...(commit ? { commit } : {}), dir, files, ...(exclude ? { exclude } : {}) };
  writeFileSync(join(cwd, MANIFEST), `${JSON.stringify(ordered, null, 2)}\n`);
}

function git(cwd: string, args: string[]): { ok: boolean; out: Buffer; err: string; code: number } {
  const res = spawnSync("git", args, { cwd, maxBuffer: 256 * 1024 * 1024 });
  if (res.error) throw new Error("This needs git, and it isn't installed here.");
  return { ok: res.status === 0, out: res.stdout, err: res.stderr.toString("utf8").trim(), code: res.status ?? 1 };
}

/** The commit a folder of Parabola is at, if it's a git checkout of its own. */
export function commitOf(pkgRoot: string): string | undefined {
  if (!existsSync(join(pkgRoot, ".git"))) return undefined;
  const head = git(pkgRoot, ["rev-parse", "HEAD"]);
  return head.ok ? head.out.toString("utf8").trim() : undefined;
}

function revParse(clone: string, ref: string): string | null {
  const res = git(clone, ["rev-parse", "--verify", "--quiet", `${ref}^{commit}`]);
  return res.ok ? res.out.toString("utf8").trim() : null;
}

function show(clone: string, commit: string, path: string): Buffer | null {
  const res = git(clone, ["show", `${commit}:${path}`]);
  return res.ok ? res.out : null;
}

function filesAt(clone: string, commit: string): string[] {
  return git(clone, ["ls-tree", "-r", "--name-only", commit]).out.toString("utf8").split("\n").filter(Boolean);
}

function versionAt(clone: string, commit: string): string {
  try {
    return (JSON.parse(show(clone, commit, "package.json")?.toString("utf8") ?? "{}") as { version?: string }).version ?? "?";
  } catch {
    return "?";
  }
}

function excluded(path: string, exclude: string[] = []): boolean {
  return exclude.some((rule) => (rule.endsWith("/") ? path.startsWith(rule) : path === rule));
}

const versionParts = (v: string) => v.split(".").map((n) => parseInt(n, 10) || 0);
function newer(a: string, b: string): boolean {
  const [x, y] = [versionParts(a), versionParts(b)];
  for (let i = 0; i < 3; i++) if ((x[i] ?? 0) !== (y[i] ?? 0)) return (x[i] ?? 0) > (y[i] ?? 0);
  return false;
}

/** The changelog's entries after `from`, up to `to`: "## 0.2.0 …" headings and what's under them. */
export function changelogBetween(changelog: string, from: string, to: string): string[] {
  const lines: string[] = [];
  let keep = false;
  for (const line of changelog.split("\n")) {
    const heading = line.match(/^##\s+v?(\d+\.\d+\.\d+)/);
    if (heading) keep = newer(heading[1], from) && !newer(heading[1], to);
    if (keep && line.trim()) lines.push(line);
  }
  return lines;
}

type Outcome = "updated" | "added" | "removed" | "merged" | "conflict" | "yours" | "kept-removed" | "left-out" | "same";

/** Git's three-way merge of one file. `conflicts` counts the places the two sides clash. */
function merge(yours: Buffer, base: Buffer, theirs: Buffer, labels: [string, string, string]): { body: Buffer; conflicts: number } {
  const tmp = mkdtempSync(join(tmpdir(), "parabola-merge-"));
  try {
    const paths = ["yours", "base", "theirs"].map((name) => join(tmp, name));
    [yours, base, theirs].forEach((body, i) => writeFileSync(paths[i], body));
    const res = spawnSync("git", ["merge-file", "-p", "-L", labels[0], "-L", labels[1], "-L", labels[2], ...paths], {
      maxBuffer: 256 * 1024 * 1024,
    });
    if (res.status === null || res.status > 127) throw new Error(`git couldn't merge a file: ${res.stderr.toString("utf8").trim()}`);
    return { body: res.stdout, conflicts: res.status };
  } finally {
    rmSync(tmp, { recursive: true, force: true });
  }
}

const isBinary = (body: Buffer) => body.subarray(0, 8000).includes(0);

/** Refuses to run over work that isn't committed, so the update can be undone with git. */
function assertClean(cwd: string, manifest: Manifest): void {
  if (!git(cwd, ["rev-parse", "--is-inside-work-tree"]).ok) return;
  const dirty = git(cwd, ["status", "--porcelain", "--", manifest.dir, MANIFEST]).out.toString("utf8").trim();
  if (dirty) {
    throw new Error(
      `There's uncommitted work in ${manifest.dir}. Commit it first, so the update is easy to undo (or pass --force).`
    );
  }
}

/** `update` (and `status`, which looks without writing). Returns the exit code: 1 when a file needs settling. */
export function runUpdate(flags: Flags, cwd: string, io: Io, statusOnly: boolean): number {
  const manifest = readManifest(cwd);
  if (!manifest) {
    throw new Error(`No ${MANIFEST} here. It's written when Parabola is added to a project (\`add theme\`, \`add button\`).`);
  }
  const dry = statusOnly || flags["dry-run"] === true;
  if (!dry && flags.force !== true) assertClean(cwd, manifest);

  const given = typeof flags.source === "string" ? flags.source : manifest.source;
  const source = existsSync(resolve(cwd, given)) ? resolve(cwd, given) : given;
  const clone = mkdtempSync(join(tmpdir(), "parabola-src-"));
  try {
    const cloned = git(cwd, ["clone", "--quiet", source, clone]);
    if (!cloned.ok) throw new Error(`Couldn't fetch Parabola from ${given}.\n${cloned.err}`);

    const baseRef = manifest.commit ?? `v${manifest.version}`;
    const base = revParse(clone, baseRef);
    if (!base) throw new Error(`${MANIFEST} says this copy came from ${baseRef}, and Parabola has no such version.`);

    const wanted = typeof flags.to === "string" ? flags.to : undefined;
    const latestTag = git(clone, ["tag", "--list", "v*", "--sort=-v:refname"]).out.toString("utf8").split("\n").filter(Boolean)[0];
    const target = revParse(clone, wanted ?? latestTag ?? "HEAD");
    if (!target) throw new Error(`Parabola has no version called ${wanted}.`);
    const toVersion = versionAt(clone, target);

    const whole = manifest.files === "*";
    let tracked: string[];
    if (manifest.files === "*") {
      tracked = [...new Set([...filesAt(clone, base), ...filesAt(clone, target)])].filter((p) => !excluded(p, manifest.exclude));
    } else {
      // A copied component may import a file it didn't before: that file comes along.
      git(clone, ["checkout", "--quiet", "--detach", target]);
      const still = manifest.files.filter((f) => existsSync(join(clone, f)));
      tracked = [...new Set([...manifest.files, ...closure(clone, still).files])];
    }
    const prepare = (path: string, body: Buffer | null) =>
      body && !whole ? Buffer.from(transform(path, body.toString("utf8"))) : body;

    const dir = resolve(cwd, manifest.dir);
    const results: { path: string; outcome: Outcome }[] = [];
    const nextFiles: string[] = [];
    for (const path of tracked.sort()) {
      const was = prepare(path, show(clone, base, path));
      const now = prepare(path, show(clone, target, path));
      const file = join(dir, path);
      const yours = existsSync(file) ? readFileSync(file) : null;
      let outcome: Outcome;
      let write: Buffer | null | undefined; // undefined: leave the file as it is; null: delete it

      if (!now) {
        if (!yours) outcome = "same";
        else if (was && yours.equals(was)) [outcome, write] = ["removed", null];
        else outcome = "kept-removed";
      } else if (!yours) {
        if (!was) [outcome, write] = ["added", now];
        else outcome = now.equals(was) ? "same" : "left-out";
      } else if (yours.equals(now)) outcome = "same";
      else if (was && yours.equals(was)) [outcome, write] = ["updated", now];
      else if (was && now.equals(was)) outcome = "yours";
      else if (isBinary(yours) || isBinary(now)) outcome = "conflict";
      else {
        const merged = merge(yours, was ?? Buffer.alloc(0), now, ["yours", `Parabola ${manifest.version}`, `Parabola ${toVersion}`]);
        [outcome, write] = [merged.conflicts ? "conflict" : "merged", merged.body];
      }

      results.push({ path, outcome });
      if (now ? yours || write : outcome === "kept-removed") nextFiles.push(path);
      if (dry || write === undefined) continue;
      if (write === null) rmSync(file);
      else {
        mkdirSync(dirname(file), { recursive: true });
        writeFileSync(file, write);
      }
    }

    const of = (outcome: Outcome) => results.filter((r) => r.outcome === outcome).map((r) => r.path);
    const rel = (path: string) => relative(cwd, join(dir, path)).split("\\").join("/");
    const upToDate = base === target;

    if (statusOnly) {
      io.log(`This project is on Parabola ${manifest.version}.${upToDate ? " That's the latest." : ` The latest is ${toVersion}.`}`);
      const changed = of("yours").length + of("merged").length + of("conflict").length + of("kept-removed").length;
      if (upToDate) {
        const yours = results.filter((r) => r.outcome !== "same").map((r) => r.path);
        io.log(yours.length ? `Changed here (${yours.length}):\n${yours.map((p) => `  ${rel(p)}`).join("\n")}` : "Nothing here differs from it.");
        return 0;
      }
      io.log(`  ${of("updated").length + of("added").length + of("removed").length} files would update cleanly`);
      io.log(`  ${changed} files you changed${of("conflict").length ? `, ${of("conflict").length} of them clash with Parabola's changes` : ""}`);
    } else {
      if (upToDate && results.every((r) => r.outcome === "same" || r.outcome === "yours")) {
        io.log(`Already on Parabola ${manifest.version}, the latest.`);
        return 0;
      }
      io.log(`${dry ? "Would update" : "Updating"} Parabola ${manifest.version} → ${toVersion}:`);
      const say: [Outcome, string, string][] = [
        ["updated", "updated ", ""],
        ["added", "added   ", ""],
        ["removed", "removed ", ""],
        ["merged", "merged  ", " (your changes and Parabola's)"],
        ["conflict", "CONFLICT", " (both changed the same lines)"],
        ["kept-removed", "kept    ", " (Parabola removed it; you had changed it)"],
        ["left-out", "left out", " (you removed it; Parabola changed it)"],
      ];
      for (const [outcome, label, note] of say) for (const path of of(outcome)) io.log(`  ${label}  ${rel(path)}${note}`);
      if (of("yours").length) io.log(`  ${of("yours").length} files you changed stay as they are.`);
    }

    const news = changelogBetween(show(clone, target, "CHANGELOG.md")?.toString("utf8") ?? "", manifest.version, toVersion);
    if (news.length) io.log(`\nWhat's new:\n${news.map((l) => `  ${l}`).join("\n")}`);

    if (dry) {
      if (!upToDate) io.log(`\nNothing was changed. Run \`update\` to take it.`);
      return 0;
    }

    writeManifest(cwd, { ...manifest, version: toVersion, commit: target, files: whole ? "*" : nextFiles.sort() });

    if (!whole) {
      const missing = closure(dir, nextFiles.filter((f) => existsSync(join(dir, f)))).packages.filter((p) => !hasDependency(cwd, p));
      if (missing.length) io.log(`\nInstall what they need:\n  npm install ${missing.join(" ")}`);
    }
    const conflicts = of("conflict");
    if (conflicts.length) {
      io.log(
        `\n${conflicts.length} ${conflicts.length === 1 ? "file needs" : "files need"} you: open ${conflicts.length === 1 ? "it" : "each"}, find <<<<<<<, keep what you want and delete the markers.`
      );
    }
    io.log(`\n${MANIFEST} now says ${toVersion}. To undo all of it: git checkout -- ${manifest.dir} ${MANIFEST}`);
    return conflicts.length ? 1 : 0;
  } finally {
    rmSync(clone, { recursive: true, force: true });
  }
}
