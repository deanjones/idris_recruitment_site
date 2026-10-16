import { test, before } from "node:test";
import assert from "node:assert/strict";
import { FULL, MINIMAL, buildFull, buildMinimal, buildVariant, page, text, byTestId } from "./helpers.mjs";

let full, minimal, real;
before(async () => {
  await Promise.all([buildFull(), buildMinimal()]);
  full = page(FULL, "/");
  minimal = page(MINIMAL, "/");
  const out = await buildVariant("realquote", {
    "testimonials.yml": `testimonials:
  - {quote: "A real quote.", name: "Jo Bloggs", role: "Coach", club: "Somewhere FC", homepage: true, placeholder: false}
`,
  });
  real = page(out, "/");
});

test("homepage rotates three testimonials, first visible", () => {
  const region = full.querySelector("[data-rotate]");
  assert.ok(region, "no [data-rotate] region");
  const quotes = [...region.querySelectorAll('[data-testid="testimonial"]')];
  assert.equal(quotes.length, 3);
  assert.equal(quotes[0].hasAttribute("hidden"), false);
  assert.equal(quotes[1].hasAttribute("hidden"), true);
  assert.equal(quotes[2].hasAttribute("hidden"), true);
});

test("placeholder quotes carry a Sample quote badge", () => {
  const quotes = byTestId(full, "testimonial");
  assert.equal(quotes.length, 3);
  for (const q of quotes) {
    assert.equal(text(q.querySelector('[data-testid="sample-badge"]')), "Sample quote");
  }
});

test("minimal: no testimonial region", () => {
  assert.equal(minimal.querySelector("[data-rotate]"), null);
});

test("real quote has no badge and shows attribution", () => {
  const q = byTestId(real, "testimonial")[0];
  assert.equal(q.querySelector('[data-testid="sample-badge"]'), null);
  assert.match(text(q.querySelector("figcaption")), /Jo Bloggs.*Coach.*Somewhere FC/);
});
