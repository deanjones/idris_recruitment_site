import { test, before } from "node:test";
import { existsSync } from "node:fs";
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
    "CAM / RW / LW",
    "Chippenham Town Academy",
  ]) assert.ok(card.includes(s), `card missing "${s}"`);
  assert.ok(!card.includes("Attacking Midfielder"), "card shows the long position names");
});

test("no stat boxes on the homepage; GPA shown beside the photo", () => {
  assert.equal(byTestId(full, "headline-stat").length, 0);
  const id = byTestId(full, "profile-card")[0].querySelector(".profile-id");
  assert.match(text(id.querySelector('[data-testid="gpa"]')), /^3\.9 GPA/);
});

test("minimal: no GPA line without a GPA", () => {
  assert.equal(byTestId(minimal, "gpa").length, 0);
});

test("contact and CV buttons", () => {
  assert.equal(byTestId(full, "contact-btn")[0].getAttribute("href"), "mailto:idris.2009.soccer@gmail.com");
  assert.equal(byTestId(full, "cv-btn")[0].getAttribute("href"), "/cv/");
});

test("three tiles in order, each linking to its page", () => {
  const tiles = byTestId(full, "tile");
  assert.deepEqual(tiles.map((t) => t.getAttribute("data-section")), ["football", "academics", "media"]);
  for (const t of tiles) {
    const s = t.getAttribute("data-section");
    assert.ok(t.querySelector(`a[href="/${s}/"]`), `tile ${s} has no link`);
  }
});

test("minimal: no highlights button, attributes or headshot; initials shown", () => {
  assert.equal(byTestId(minimal, "highlights-btn").length, 0);
  assert.equal(byTestId(minimal, "attribute").length, 0);
  const card = byTestId(minimal, "profile-card")[0];
  assert.ok(!card.querySelector("img"));
  assert.equal(text(card.querySelector('[data-testid="initials"]')), "IT-J");
});

test("minimal: empty tile summaries render no empty paragraph", () => {
  const tiles = byTestId(minimal, "tile");
  assert.equal(tiles.length, 3);
  for (const t of tiles) {
    for (const p of t.querySelectorAll("p")) assert.notEqual(text(p), "", "empty <p> in tile");
    assert.ok(t.querySelector("h2"));
  }
});

test("homepage has no feature image column", () => {
  assert.equal(byTestId(full, "feature-image").length, 0);
  assert.ok(!full.querySelector(".has-feature"));
});

test("minimal: no feature image column", () => {
  assert.equal(byTestId(minimal, "feature-image").length, 0);
  assert.ok(!minimal.querySelector(".page-feature"));
});

test("headshot can be zoomed onto the face from profile.yml", () => {
  const img = byTestId(full, "profile-card")[0].querySelector(".headshot img");
  assert.ok(img);
  const style = img.getAttribute("style") || "";
  assert.match(style, /transform:\s*scale\(1\.5\)/);
  assert.match(style, /transform-origin:\s*40% 28%/);
});

test("no Personal section anywhere", () => {
  assert.ok(!full.querySelector('a[href="/personal/"]'), "a link to /personal/ is still on the page");
  assert.equal(existsSync(`${FULL}/personal/index.html`), false);
});
