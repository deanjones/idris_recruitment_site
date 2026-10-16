import { execFile } from "node:child_process";
import { promisify } from "node:util";
import { cpSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { parseHTML } from "linkedom";

const run = promisify(execFile);

export const FULL = "tests/.out/full";
export const MINIMAL = "tests/.out/minimal";
export const MINIMAL_DATA = "../tests/fixtures/minimal-data";

const builds = new Map();

// Builds the site once per output dir within a test process.
// dataDir is relative to src/ (Eleventy resolves the data dir against the input dir).
export function buildSite({ dataDir, outDir }) {
  if (!builds.has(outDir)) {
    rmSync(outDir, { recursive: true, force: true });
    const env = { ...process.env };
    if (dataDir) env.SITE_DATA_DIR = dataDir;
    else delete env.SITE_DATA_DIR;
    builds.set(
      outDir,
      run("npx", ["eleventy", `--output=${outDir}`, "--quiet"], { env }),
    );
  }
  return builds.get(outDir);
}

export const buildFull = () => buildSite({ outDir: FULL });
export const buildMinimal = () => buildSite({ dataDir: MINIMAL_DATA, outDir: MINIMAL });

export function page(outDir, urlPath) {
  const html = readFileSync(join(outDir, urlPath, "index.html"), "utf8");
  return parseHTML(html).document;
}

export const text = (el) => (el?.textContent ?? "").replace(/\s+/g, " ").trim();
export const byTestId = (doc, id) => [...doc.querySelectorAll(`[data-testid="${id}"]`)];

// Builds the minimal fixture with some data files replaced, e.g.
//   await buildVariant("realquote", { "testimonials.yml": "testimonials: [...]" })
// Returns the output dir.
export async function buildVariant(name, files) {
  const dataDir = `tests/.out/data-${name}`;
  rmSync(dataDir, { recursive: true, force: true });
  cpSync("tests/fixtures/minimal-data", dataDir, { recursive: true });
  for (const [file, body] of Object.entries(files)) writeFileSync(join(dataDir, file), body);
  const outDir = `tests/.out/${name}`;
  await buildSite({ dataDir: `../${dataDir}`, outDir });
  return outDir;
}
