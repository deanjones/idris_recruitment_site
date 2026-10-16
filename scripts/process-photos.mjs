// Usage: npm run photos
// Cleans and resizes every photo in originals/ (gitignored) into src/assets/img/,
// then prints the photos.yml lines for any that aren't listed yet.
import { existsSync, readdirSync, readFileSync } from "node:fs";
import { extname, join } from "node:path";
import yaml from "js-yaml";
import { processPhoto } from "../lib/photos.js";

const SRC = "originals";
const OUT = "src/assets/img";
const DATA = "src/_data/photos.yml";
const EXTS = new Set([".jpg", ".jpeg", ".png", ".webp", ".heic"]);

if (!existsSync(SRC)) {
  console.log(`Put original photos in ${SRC}/ and run this again.`);
  process.exit(0);
}

const listed = new Set((yaml.load(readFileSync(DATA, "utf8"))?.photos ?? []).map((p) => p.id));
const added = [];
for (const name of readdirSync(SRC).sort()) {
  if (!EXTS.has(extname(name).toLowerCase())) continue;
  const { id } = await processPhoto(join(SRC, name), OUT);
  console.log(`${name} → ${id}`);
  if (!listed.has(id)) added.push(id);
}

if (added.length) {
  console.log(`\nAdd these to ${DATA} (fill in alt text and a caption):\n`);
  for (const id of added) console.log(`  - {id: ${id}, alt: "", caption: ""}`);
  console.log(`\nFor the headshot, put its id in src/_data/profile.yml → headshot.`);
} else {
  console.log("\nAll photos are already listed in photos.yml.");
}
