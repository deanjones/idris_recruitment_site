import { createHash } from "node:crypto";
import { existsSync, mkdirSync, readFileSync } from "node:fs";
import { join } from "node:path";
import sharp from "sharp";

export const WIDTHS = [480, 1200];

// Writes web-sized copies of a photo, named by a hash of its contents so the
// original filename (which often contains a date) never reaches the site.
// sharp drops all metadata (EXIF, GPS) unless asked to keep it; .rotate()
// applies the camera's orientation flag to the pixels first.
export async function processPhoto(srcPath, outDir) {
  const bytes = readFileSync(srcPath);
  const id = createHash("sha256").update(bytes).digest("hex").slice(0, 10);
  mkdirSync(outDir, { recursive: true });
  const files = WIDTHS.map((w) => join(outDir, `${id}-${w}.jpg`));
  for (const [i, width] of WIDTHS.entries()) {
    if (existsSync(files[i])) continue;
    await sharp(bytes)
      .rotate()
      .resize({ width, withoutEnlargement: true })
      .jpeg({ quality: 80, mozjpeg: true })
      .toFile(files[i]);
  }
  return { id, files };
}
