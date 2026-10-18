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
  assert.match(img.getAttribute("src"), /^\/assets\/img\/6eb7ce23e2-1200\.jpg$/);
  assert.notEqual(img.getAttribute("alt"), "");
});

test("minimal: football page has no feature column", () => {
  assert.equal(byTestId(minimal, "feature-image").length, 0);
});

test("positions panel shows the short form", () => {
  const panel = [...full.querySelectorAll("section.panel")].find((s) => text(s.querySelector("h2")) === "Positions");
  assert.ok(panel, "no Positions panel");
  assert.equal(text(panel.querySelector("p")), "CAM / RW / LW");
});

test("development panel lists the Swindon Town programme after achievements", () => {
  const panels = [...full.querySelectorAll("section.panel")];
  const titles = panels.map((p) => text(p.querySelector("h2")));
  const dev = panels[titles.indexOf("Development")];
  assert.ok(dev, "no Development panel");
  assert.ok(titles.indexOf("Development") > titles.indexOf("Achievements"), "Development should come after Achievements");
  const items = [...dev.querySelectorAll('[data-testid="development"]')].map(text);
  assert.deepEqual(items, [
    "2024–present Chippenham Town Academy",
    "2022–2025 Cirencester Town",
    "2018–2024 Swindon Town FITC Elite Player Program",
    "2016–2022 Stratton Youth",
  ]);
});

test("minimal: no development panel without entries", () => {
  assert.equal(byTestId(minimal, "development").length, 0);
});
