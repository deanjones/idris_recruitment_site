import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
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
