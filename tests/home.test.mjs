import { test, before } from "node:test";
import assert from "node:assert/strict";
import { FULL, MINIMAL, buildFull, buildMinimal, page, text, byTestId } from "./helpers.mjs";

let full, minimal;
before(async () => {
  await Promise.all([buildFull(), buildMinimal()]);
  full = page(FULL, "/");
  minimal = page(MINIMAL, "/");
});

test("profile card shows identity, positions and club", () => {
  const card = text(byTestId(full, "profile-card")[0]);
  for (const s of [
    "Idris Thomas-Jones",
    "Class of 2027 · Fall entry",
    "Attacking Midfielder (CAM / #10)",
    "Right Wing",
    "Left Wing",
    "Chippenham Town Academy",
  ]) assert.ok(card.includes(s), `card missing "${s}"`);
});

test("four headline stats, GPA first", () => {
  const stats = byTestId(full, "headline-stat");
  assert.equal(stats.length, 4);
  assert.match(text(stats[0]), /^3\.9/);
});

test("contact and CV buttons", () => {
  assert.equal(byTestId(full, "contact-btn")[0].getAttribute("href"), "mailto:idris.2009.soccer@gmail.com");
  assert.equal(byTestId(full, "cv-btn")[0].getAttribute("href"), "/cv/");
});

test("four tiles in order, each linking to its page", () => {
  const tiles = byTestId(full, "tile");
  assert.deepEqual(tiles.map((t) => t.getAttribute("data-section")), ["football", "academics", "personal", "media"]);
  for (const t of tiles) {
    const s = t.getAttribute("data-section");
    assert.ok(t.querySelector(`a[href="/${s}/"]`), `tile ${s} has no link`);
  }
});

test("minimal: no highlights button, attributes or headshot; initials shown", () => {
  assert.equal(byTestId(minimal, "highlights-btn").length, 0);
  assert.equal(byTestId(minimal, "attribute").length, 0);
  const card = byTestId(minimal, "profile-card")[0];
  assert.equal(card.querySelector("img"), null);
  assert.equal(text(card.querySelector('[data-testid="initials"]')), "IT-J");
});

test("minimal: empty tile summaries render no empty paragraph", () => {
  const tiles = byTestId(minimal, "tile");
  assert.equal(tiles.length, 4);
  for (const t of tiles) {
    for (const p of t.querySelectorAll("p")) assert.notEqual(text(p), "", "empty <p> in tile");
    assert.ok(t.querySelector("h2"));
  }
});
