#!/usr/bin/env node
/**
 * Bundles Parabola's command (cli/) into bin/parabola.mjs, the file the
 * package's `bin` points at. Parabola ships TypeScript source, so the command
 * needs this one built file to run under plain Node. The bundle is committed,
 * so the command runs straight from the repo with nothing to install or
 * build; a test fails when it's out of date. `npm run bundle` after any
 * change under cli/.
 */
import { build } from "esbuild";
import { fileURLToPath } from "node:url";
import { join } from "node:path";

const root = join(fileURLToPath(import.meta.url), "../..");

export async function buildParabolaCli(outfile = join(root, "bin/parabola.mjs")) {
  await build({
    entryPoints: [join(root, "cli/main.ts")],
    outfile,
    bundle: true,
    platform: "node",
    format: "esm",
    target: "node20",
    banner: { js: "#!/usr/bin/env node" },
    logLevel: "silent",
  });
  return outfile;
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
  buildParabolaCli().then((file) => console.log(`built ${file}`));
}
