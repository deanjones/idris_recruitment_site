import { test, before } from "node:test";
import assert from "node:assert/strict";
import { FULL, MINIMAL, buildFull, buildMinimal, page, text, byTestId } from "./helpers.mjs";

let full, cv, minimal;
before(async () => {
  await Promise.all([buildFull(), buildMinimal()]);
  full = page(FULL, "/cv/");
  cv = byTestId(full, "cv")[0];
  minimal = page(MINIMAL, "/cv/");
});

test("identity and contact", () => {
  const t = text(cv);
  for (const s of [
    "Idris Thomas-Jones",
    "Class of 2027 · Fall entry",
    "Attacking Midfielder (CAM / #10)",
    "Right Wing",
    "Left Wing",
    "Chippenham Town Academy",
    "idris.2009.soccer@gmail.com",
  ]) assert.ok(t.includes(s), `CV missing "${s}"`);
  assert.ok(cv.querySelector('a[href="https://idristhomasjones.com/"]'));
});

test("stats, achievements, grades and honours", () => {
  assert.equal(byTestId(cv, "headline-stat").length, 4);
  assert.equal(byTestId(cv, "achievement").length, 3);
  assert.equal(byTestId(cv, "gcse-row").length, 10);
  assert.equal(byTestId(cv, "alevel").length, 3);
  assert.equal(byTestId(cv, "honour").length, 4);
});

test("homepage testimonials with sample badges", () => {
  const quotes = byTestId(cv, "testimonial");
  assert.equal(quotes.length, 3);
  for (const q of quotes) {
    assert.ok(q.querySelector('[data-testid="sample-badge"]'));
    assert.equal(q.hasAttribute("hidden"), false);
  }
});

test("print button and print stylesheet", () => {
  assert.ok(byTestId(full, "print-btn")[0]);
  assert.ok(full.querySelector('link[rel="stylesheet"][href="/assets/css/print.css"][media="print"]'));
});

test("minimal: no empty sections", () => {
  const c = byTestId(minimal, "cv")[0];
  assert.ok(c);
  for (const h of c.querySelectorAll("h2")) {
    const section = h.parentElement;
    assert.ok(text(section).length > text(h).length, `empty CV section "${text(h)}"`);
  }
  for (const id of ["headline-stat", "achievement", "gcse-row", "alevel", "honour", "testimonial"]) {
    assert.equal(byTestId(c, id).length, 0);
  }
});
