import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { FULL, MINIMAL, buildFull, buildMinimal, page, text, byTestId } from "./helpers.mjs";

let full, minimal;
before(async () => {
  await Promise.all([buildFull(), buildMinimal()]);
  full = page(FULL, "/football/");
  minimal = page(MINIMAL, "/football/");
});

test("achievements listed in data order", () => {
  const { achievements } = yaml.load(readFileSync("src/_data/football.yml", "utf8"));
  const items = byTestId(full, "achievement");
  assert.equal(items.length, achievements.length);
  achievements.forEach((a, i) => {
    for (const field of [a.season, a.result, a.competition, a.team]) assert.ok(text(items[i]).includes(field), `achievement ${i} missing "${field}"`);
  });
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
  assert.ok(!minimal.querySelector("#testimonials"));
  assert.equal(byTestId(minimal, "achievement").length, 0);
  for (const h of minimal.querySelectorAll("main h2")) assert.notEqual(text(h), "Achievements");
});

test("feature photo sits in a right-hand column beside the football content", () => {
  const layout = full.querySelector(".page-layout.has-feature");
  assert.ok(layout, "no two-column layout");
  const [left, right] = layout.children;
  assert.ok(left.querySelector('[data-testid="achievement"]'), "achievements not in left column");
  const img = right.querySelector('[data-testid="feature-image"] img');
  assert.ok(img, "no feature image in right column");
  assert.match(img.getAttribute("src"), /^\/assets\/img\/bb838a5b15-1200\.jpg$/);
  assert.notEqual(img.getAttribute("alt"), "");
});

test("minimal: football page has no feature column", () => {
  assert.equal(byTestId(minimal, "feature-image").length, 0);
});
