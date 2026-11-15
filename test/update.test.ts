import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";
import { test } from "node:test";
import { run } from "../cli/core";
import { changelogBetween, readManifest } from "../cli/update";
import { buildParabolaCli } from "../scripts/build-cli.mjs";

const GIT = ["-c", "user.name=Test", "-c", "user.email=test@example.test", "-c", "commit.gpgsign=false", "-c", "tag.gpgsign=false"];
const git = (cwd: string, ...args: string[]) => execFileSync("git", [...GIT, ...args], { cwd, stdio: "pipe" }).toString().trim();

function put(root: string, files: Record<string, string | null>) {
  for (const [path, body] of Object.entries(files)) {
    const file = join(root, path);
    if (body === null) rmSync(file);
    else {
      mkdirSync(dirname(file), { recursive: true });
      writeFileSync(file, body);
    }
  }
}

const lines = (...l: string[]) => `${l.join("\n")}\n`;

/** A small Parabola in git: version 0.1.0 tagged, then 0.2.0 tagged with `next` applied. */
function upstream(first: Record<string, string>, next: Record<string, string | null>) {
  const root = mkdtempSync(join(tmpdir(), "parabola-up-"));
  git(root, "init", "--quiet", "-b", "main");
  put(root, { ...first, "package.json": JSON.stringify({ version: "0.1.0" }) });
  git(root, "add", "-A");
  git(root, "commit", "--quiet", "-m", "0.1.0");
  git(root, "tag", "v0.1.0");
  const v1 = git(root, "rev-parse", "HEAD");
  put(root, { ...next, "package.json": JSON.stringify({ version: "0.2.0" }) });
  git(root, "add", "-A");
  git(root, "commit", "--quiet", "-m", "0.2.0");
  git(root, "tag", "v0.2.0");
  return { root, v1, v2: git(root, "rev-parse", "HEAD") };
}

/** A project in git holding a copy of `files` under ds/, committed, then changed by `edits` and committed again. */
function project(source: string, manifest: object, files: Record<string, string>, edits: Record<string, string | null> = {}) {
  const cwd = mkdtempSync(join(tmpdir(), "parabola-proj-"));
  git(cwd, "init", "--quiet", "-b", "main");
  put(cwd, Object.fromEntries(Object.entries(files).map(([p, b]) => [`ds/${p}`, b])));
  writeFileSync(join(cwd, "parabola.json"), JSON.stringify({ source, dir: "ds", ...manifest }));
  writeFileSync(join(cwd, "package.json"), JSON.stringify({ dependencies: {} }));
  put(cwd, Object.fromEntries(Object.entries(edits).map(([p, b]) => [`ds/${p}`, b])));
  git(cwd, "add", "-A");
  git(cwd, "commit", "--quiet", "-m", "project");
  const out: string[] = [];
  return { cwd, out, io: { log: (l: string) => out.push(l), error: (l: string) => out.push(`ERR ${l}`) } };
}

const FIRST = {
  "untouched.ts": lines("a", "b", "c"),
  "mine.ts": lines("a", "b", "c"),
  "both.ts": lines("one", "two", "three", "four", "five", "six", "seven"),
  "clash.ts": lines("a", "b", "c"),
  "gone.ts": lines("x"),
  "gone-but-mine.ts": lines("x"),
  "infra/build.mjs": lines("build"),
};
const NEXT = {
  "untouched.ts": lines("a", "B", "c"),
  "both.ts": lines("one", "two", "three", "four", "five", "six", "SEVEN"),
  "clash.ts": lines("a", "theirs", "c"),
  "new.ts": lines("new"),
  "gone.ts": null,
  "gone-but-mine.ts": null,
  "infra/build.mjs": lines("build 2"),
};
const EDITS = {
  "mine.ts": lines("a", "b", "c", "mine"),
  "both.ts": lines("ONE", "two", "three", "four", "five", "six", "seven"),
  "clash.ts": lines("a", "mine", "c"),
  "gone-but-mine.ts": lines("x", "mine"),
};
const { "infra/build.mjs": _infra, ...COPIED } = FIRST;

test("update: untouched files update, your changes stay, both sides merge, clashes are marked", () => {
  const up = upstream(FIRST, NEXT);
  const { cwd, out, io } = project(up.root, { version: "0.1.0", commit: up.v1, files: "*", exclude: ["infra/", "package.json"] }, COPIED, EDITS);
  const read = (p: string) => readFileSync(join(cwd, "ds", p), "utf8");

  assert.equal(run(["update"], cwd, "/nowhere", io), 1, "a clash exits 1");
  assert.equal(read("untouched.ts"), lines("a", "B", "c"));
  assert.equal(read("mine.ts"), lines("a", "b", "c", "mine"));
  assert.equal(read("both.ts"), lines("ONE", "two", "three", "four", "five", "six", "SEVEN"));
  assert.match(read("clash.ts"), /<<<<<<< yours\nmine\n[\s\S]*=======\ntheirs\n>>>>>>> Parabola 0\.2\.0/);
  assert.equal(read("new.ts"), lines("new"));
  assert.equal(existsSync(join(cwd, "ds/gone.ts")), false);
  assert.equal(read("gone-but-mine.ts"), lines("x", "mine"));
  assert.equal(existsSync(join(cwd, "ds/infra/build.mjs")), false, "excluded folders never come along");

  const manifest = readManifest(cwd);
  assert.equal(manifest?.version, "0.2.0");
  assert.equal(manifest?.commit, up.v2);
  const text = out.join("\n");
  assert.match(text, /Parabola 0\.1\.0 → 0\.2\.0/);
  assert.match(text, /CONFLICT {2}ds\/clash\.ts/);
  assert.match(text, /merged {4}ds\/both\.ts/);
  assert.match(text, /1 file needs you/);

  // Run again: nothing left to take.
  git(cwd, "add", "-A");
  git(cwd, "commit", "--quiet", "-m", "updated");
  out.length = 0;
  assert.equal(run(["update"], cwd, "/nowhere", io), 0);
  assert.match(out.join("\n"), /Already on Parabola 0\.2\.0/);
});

test("update --dry-run and status write nothing", () => {
  const up = upstream(FIRST, NEXT);
  const { cwd, out, io } = project(up.root, { version: "0.1.0", files: "*", exclude: ["infra/", "package.json"] }, COPIED, EDITS);
  assert.equal(run(["update", "--dry-run"], cwd, "/nowhere", io), 0);
  assert.equal(run(["status"], cwd, "/nowhere", io), 0);
  assert.equal(git(cwd, "status", "--porcelain"), "");
  assert.equal(readManifest(cwd)?.version, "0.1.0", "found the base by its version tag, and left it");
  const text = out.join("\n");
  assert.match(text, /Would update Parabola 0\.1\.0 → 0\.2\.0/);
  assert.match(text, /The latest is 0\.2\.0/);
  assert.match(text, /4 files you changed, 1 of them clash/);
});

test("update refuses to run over uncommitted work, unless forced", () => {
  const up = upstream(FIRST, NEXT);
  const { cwd, out, io } = project(up.root, { version: "0.1.0", files: "*", exclude: ["infra/", "package.json"] }, COPIED);
  writeFileSync(join(cwd, "ds/mine.ts"), "not committed\n");
  assert.equal(run(["update"], cwd, "/nowhere", io), 1);
  assert.match(out.join("\n"), /uncommitted work in ds/);
  assert.equal(readManifest(cwd)?.version, "0.1.0");
  assert.equal(run(["update", "--force"], cwd, "/nowhere", io), 0);
  assert.equal(readManifest(cwd)?.version, "0.2.0");
});

test("update with a list of files brings along a file a component newly imports", () => {
  const up = upstream(
    { "primitives/button.tsx": 'import { cn } from "../cn";\nexport const a = cn;\n', "cn.ts": "export const cn = 1;\n", "primitives/other.tsx": "export {};\n" },
    {
      "primitives/button.tsx": 'import { cn } from "../cn";\nimport { hue } from "../hue";\nimport x from "some-pkg";\nexport const a = [cn, hue, x];\n',
      "hue.ts": "export const hue = 2;\n",
      "primitives/other.tsx": "export const changed = true;\n",
    }
  );
  const copied = { "primitives/button.tsx": 'import { cn } from "../cn";\nexport const a = cn;\n', "cn.ts": "export const cn = 1;\n" };
  const { cwd, out, io } = project(up.root, { version: "0.1.0", commit: up.v1, files: ["cn.ts", "primitives/button.tsx"] }, copied);
  assert.equal(run(["update"], cwd, "/nowhere", io), 0);
  assert.equal(readFileSync(join(cwd, "ds/hue.ts"), "utf8"), "export const hue = 2;\n");
  assert.equal(existsSync(join(cwd, "ds/primitives/other.tsx")), false, "a file the project never copied stays out");
  assert.deepEqual(readManifest(cwd)?.files, ["cn.ts", "hue.ts", "primitives/button.tsx"]);
  assert.match(out.join("\n"), /npm install some-pkg/);
});

test("add notes what it copied in parabola.json", () => {
  const cwd = mkdtempSync(join(tmpdir(), "parabola-add-"));
  writeFileSync(join(cwd, "package.json"), JSON.stringify({ dependencies: {} }));
  const out: string[] = [];
  const io = { log: (l: string) => out.push(l), error: (l: string) => out.push(`ERR ${l}`) };
  assert.equal(run(["add", "pill"], cwd, process.cwd(), io), 0);
  const manifest = readManifest(cwd);
  assert.equal(manifest?.dir, "parabola");
  assert.ok(Array.isArray(manifest?.files) && manifest.files.includes("primitives/pill.tsx"));
  assert.match(manifest?.source ?? "", /parabola/);
});

test("the changelog between two versions", () => {
  const log = "# Changelog\n\n## 0.3.0 — later\n- three\n\n## 0.2.0 — now\n- two\n\n## 0.1.0\n- one\n";
  assert.deepEqual(changelogBetween(log, "0.1.0", "0.2.0"), ["## 0.2.0 — now", "- two"]);
  assert.deepEqual(changelogBetween(log, "0.1.0", "0.3.0"), ["## 0.3.0 — later", "- three", "## 0.2.0 — now", "- two"]);
});

test("the committed command is built from the current source", async () => {
  const fresh = await buildParabolaCli(join(mkdtempSync(join(tmpdir(), "parabola-bin-")), "parabola.mjs"));
  assert.equal(readFileSync(fresh, "utf8"), readFileSync(join(process.cwd(), "bin/parabola.mjs"), "utf8"), "run `npm run bundle` and commit bin/parabola.mjs");
});
