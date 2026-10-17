import { test, before } from "node:test";
import assert from "node:assert/strict";
import { mkdirSync, copyFileSync } from "node:fs";
import sharp from "sharp";
import { buildVariant, page, text, byTestId } from "./helpers.mjs";

const ID = "abcdef0123";
let home, media;

before(async () => {
  const out = await buildVariant("photos-on-pages", {
    "profile.yml": `name: Idris Thomas-Jones
initials: IT-J
email: idris.2009.soccer@gmail.com
headshot: "${ID}"
positions: []
headline_stats: []
`,
    "photos.yml": `photos:
  - {id: "${ID}", alt: "Idris on the ball", caption: "NFYL match"}
`,
  });
  home = page(out, "/");
  media = page(out, "/media/");
  // Give the variant output a real image so the files referenced exist.
  mkdirSync(`${out}/assets/img`, { recursive: true });
  const img = sharp({ create: { width: 10, height: 10, channels: 3, background: "#000" } }).jpeg();
  await img.toFile(`${out}/assets/img/${ID}-480.jpg`);
  copyFileSync(`${out}/assets/img/${ID}-480.jpg`, `${out}/assets/img/${ID}-1200.jpg`);
});

test("headshot shows on the card and as og:image", () => {
  const img = byTestId(home, "profile-card")[0].querySelector("img");
  assert.ok(img);
  assert.match(img.getAttribute("srcset"), new RegExp(`/assets/img/${ID}-480\\.jpg 480w`));
  assert.equal(home.querySelector('meta[property="og:image"]').getAttribute("content"), `https://idristhomasjones.com/assets/img/${ID}-1200.jpg`);
});

test("photo grid with captions on media page", () => {
  const photos = byTestId(media, "photo");
  assert.equal(photos.length, 1);
  assert.equal(photos[0].querySelector("img").getAttribute("alt"), "Idris on the ball");
  assert.equal(text(photos[0].querySelector("figcaption")), "NFYL match");
  assert.doesNotMatch(text(media.querySelector("main")), /coming soon/);
});
