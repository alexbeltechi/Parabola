import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { run } from "./core";

// Bundled to bin/parabola.mjs, so the package's own files sit one folder up.
const pkgRoot = join(dirname(fileURLToPath(import.meta.url)), "..");
process.exitCode = run(process.argv.slice(2), process.cwd(), pkgRoot, {
  log: (line) => console.log(line),
  error: (line) => console.error(line),
});
