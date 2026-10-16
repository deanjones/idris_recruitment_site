import { test, before } from "node:test";
import assert from "node:assert/strict";
import { mkdtempSync, readdirSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import sharp from "sharp";
import { processPhoto } from "../lib/photos.js";

let dir, src, small;
before(async () => {
  dir = mkdtempSync(join(tmpdir(), "photos-"));
  src = join(dir, "IMG_20250823_phone.jpg");
  // Landscape pixels with an EXIF "rotate 90°" flag, plus copyright and GPS tags.
  await sharp({ create: { width: 2000, height: 1000, channels: 3, background: "#336" } })
    .jpeg()
    .withMetadata({ orientation: 6 })
    .withExif({ IFD0: { Copyright: "x" }, IFD3: { GPSLatitudeRef: "N", GPSLatitude: "51/1 27/1 0/1" } })
    .toFile(src);
  small = join(dir, "small.jpg");
  await sharp({ create: { width: 300, height: 200, channels: 3, background: "#633" } }).jpeg().toFile(small);
});

test("fixture really carries EXIF and orientation", async () => {
  const m = await sharp(src).metadata();
  assert.ok(m.exif);
  assert.equal(m.orientation, 6);
});

test("writes two hash-named sizes with no EXIF, correctly rotated", async () => {
  const out = join(dir, "out");
  const { id, files } = await processPhoto(src, out);
  assert.match(id, /^[0-9a-f]{10}$/);
  assert.deepEqual(readdirSync(out).sort(), [`${id}-1200.jpg`, `${id}-480.jpg`]);
  assert.equal(files.length, 2);
  for (const f of files) {
    const m = await sharp(f).metadata();
    assert.equal(m.exif, undefined, `${f} still has EXIF`);
    assert.ok(m.orientation === undefined || m.orientation === 1);
  }
  const big = await sharp(join(out, `${id}-1200.jpg`)).metadata();
  assert.ok(big.height > big.width, "rotation not applied");
  assert.equal((await sharp(join(out, `${id}-480.jpg`)).metadata()).width, 480);
});

test("same source gives same id", async () => {
  const a = await processPhoto(src, join(dir, "out"));
  const b = await processPhoto(src, join(dir, "out"));
  assert.equal(a.id, b.id);
});

test("small images are not enlarged", async () => {
  const { id } = await processPhoto(small, join(dir, "small-out"));
  assert.equal((await sharp(join(dir, "small-out", `${id}-1200.jpg`)).metadata()).width, 300);
});
