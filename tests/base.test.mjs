import { test, before } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync } from "node:fs";
import { FULL, MINIMAL, buildFull, buildMinimal, page } from "./helpers.mjs";

before(async () => {
  await Promise.all([buildFull(), buildMinimal()]);
});

for (const [label, out] of [["full", FULL], ["minimal", MINIMAL]]) {
  test(`${label}: homepage has title, viewport, canonical and contact`, () => {
    const doc = page(out, "/");
    assert.match(doc.querySelector("title").textContent, /Idris Thomas-Jones/);
    assert.ok(doc.querySelector('meta[name="viewport"]'));
    assert.equal(doc.querySelector('link[rel="canonical"]').getAttribute("href"), "https://idristhomasjones.com/");
    assert.ok(doc.querySelector('footer a[href="mailto:idris.2009.soccer@gmail.com"]'));
  });
}

test("CNAME is published", () => {
  assert.equal(readFileSync(`${FULL}/CNAME`, "utf8").trim(), "idristhomasjones.com");
});

test("minimal: no og:image without a headshot", () => {
  assert.ok(!page(MINIMAL, "/").querySelector('meta[property="og:image"]'));
});

test("site icon is linked on every page and published", () => {
  for (const p of ["/", "/soccer/", "/academics/", "/media/"]) {
    const doc = page(FULL, p);
    assert.equal(doc.querySelector('link[rel="icon"][type="image/svg+xml"]')?.getAttribute("href"), "/assets/icon.svg", p);
    assert.equal(doc.querySelector('link[rel="apple-touch-icon"]')?.getAttribute("href"), "/assets/apple-touch-icon.png", p);
  }
  for (const f of ["assets/icon.svg", "assets/apple-touch-icon.png", "favicon.ico"]) {
    assert.ok(existsSync(`${FULL}/${f}`), `${f} missing`);
  }
});
