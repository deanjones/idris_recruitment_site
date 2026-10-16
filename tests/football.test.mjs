import { test, before } from "node:test";
import assert from "node:assert/strict";
import { FULL, MINIMAL, buildFull, buildMinimal, page, text, byTestId } from "./helpers.mjs";

let full, minimal;
before(async () => {
  await Promise.all([buildFull(), buildMinimal()]);
  full = page(FULL, "/football/");
  minimal = page(MINIMAL, "/football/");
});

test("achievements listed in data order", () => {
  const items = byTestId(full, "achievement");
  assert.equal(items.length, 3);
  assert.match(text(items[0]), /South Premier Division/);
  assert.match(text(items[0]), /Champions/);
  assert.match(text(items[1]), /Step 5/);
  assert.match(text(items[2]), /JPL Southwest/);
});

test("all testimonials shown with sample badges", () => {
  const quotes = byTestId(full, "testimonial");
  assert.equal(quotes.length, 3);
  for (const q of quotes) assert.ok(q.querySelector('[data-testid="sample-badge"]'));
  for (const q of quotes) assert.equal(q.hasAttribute("hidden"), false);
});

test("links to video page; no stats table without stats", () => {
  assert.ok(full.querySelector('main a[href="/media/"]'));
  assert.equal(byTestId(full, "stats-table").length, 0);
});

test("minimal: builds without stats or testimonials heading", () => {
  assert.equal(byTestId(minimal, "stats-table").length, 0);
  assert.equal(minimal.querySelector("#testimonials"), null);
  assert.equal(byTestId(minimal, "achievement").length, 0);
  for (const h of minimal.querySelectorAll("main h2")) assert.notEqual(text(h), "Achievements");
});
