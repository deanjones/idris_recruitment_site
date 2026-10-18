import { test, before } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import yaml from "js-yaml";
import { quoteParts } from "../lib/quotes.js";
import { FULL, MINIMAL, buildFull, buildMinimal, buildVariant, page, text, byTestId } from "./helpers.mjs";

let full, minimal, real;
before(async () => {
  await Promise.all([buildFull(), buildMinimal()]);
  full = page(FULL, "/");
  minimal = page(MINIMAL, "/");
  const out = await buildVariant("realquote", {
    "testimonials.yml": `testimonials:
  - {quote: "Excellent vision and weight of pass.", coach: "Swindon Town FITC coach", source: "End-of-season performance evaluation, 2023/24", homepage: true, placeholder: false}
`,
  });
  real = page(out, "/");
});

test("homepage rotates through every quote part, first visible", () => {
  const { testimonials } = yaml.load(readFileSync("src/_data/testimonials.yml", "utf8"));
  const expected = testimonials.filter((t) => t.homepage).flatMap((t) => quoteParts(t.quote).map(() => t));
  const region = full.querySelector("[data-rotate]");
  assert.ok(region, "no [data-rotate] region");
  const parts = [...region.querySelectorAll('[data-testid="testimonial"]')];
  assert.equal(parts.length, expected.length);
  parts.forEach((p, i) => {
    assert.equal(p.hasAttribute("hidden"), i > 0);
    assert.equal(Boolean(p.querySelector('[data-testid="sample-badge"]')), Boolean(expected[i].placeholder));
  });
});

test("placeholder quotes carry a Sample quote badge", async () => {
  const out = await buildVariant("sample-quote", {
    "testimonials.yml": `testimonials:
  - {quote: "A sample.", coach: "Academy coach", source: "Sample evaluation", homepage: true, placeholder: true}
`,
  });
  const q = byTestId(page(out, "/"), "testimonial")[0];
  assert.equal(text(q.querySelector('[data-testid="sample-badge"]')), "Sample quote");
});

test("minimal: no testimonial region", () => {
  assert.ok(!minimal.querySelector("[data-rotate]"));
});

test("evaluation quote shows quote, anonymous coach and source, with no badge", () => {
  const q = byTestId(real, "testimonial")[0];
  assert.ok(!q.querySelector('[data-testid="sample-badge"]'));
  assert.equal(text(q.querySelector("blockquote")), "“Excellent vision and weight of pass.”");
  assert.equal(text(q.querySelector('[data-testid="quote-coach"]')), "Swindon Town FITC coach");
  assert.equal(text(q.querySelector('[data-testid="quote-source"]')), "End-of-season performance evaluation, 2023/24");
});

test("a coach's name is never shown, even if one is added to the data", async () => {
  const out = await buildVariant("named-coach", {
    "testimonials.yml": `testimonials:
  - {quote: "Q.", name: "Jo Bloggs", coach: "Academy coach", source: "Evaluation", homepage: true, placeholder: false}
`,
  });
  assert.ok(!text(page(out, "/").querySelector("main")).includes("Jo Bloggs"));
});

test("homepage splits long evaluation quotes into two-sentence parts; Football page keeps them whole", async () => {
  const out = await buildVariant("long-quotes", {
    "testimonials.yml": `testimonials:
  - {quote: "S1. S2. S3.", coach: "Academy coach", source: "Evaluation A", homepage: true, placeholder: false}
  - {quote: "T1. T2. T3. T4.", coach: "U16 coach", source: "Evaluation B", homepage: true, placeholder: false}
`,
  });
  const home = page(out, "/");
  const parts = [...home.querySelectorAll('[data-rotate] [data-testid="testimonial"]')];
  assert.deepEqual(parts.map((p) => text(p.querySelector("blockquote"))), ["“S1. S2.”", "“S3.”", "“T1. T2.”", "“T3. T4.”"]);
  assert.deepEqual(parts.map((p) => text(p.querySelector('[data-testid="quote-coach"]'))), ["Academy coach", "Academy coach", "U16 coach", "U16 coach"]);
  assert.deepEqual(parts.map((p) => p.hasAttribute("hidden")), [false, true, true, true]);
  const football = page(out, "/football/");
  assert.deepEqual(byTestId(football, "testimonial").map((p) => text(p.querySelector("blockquote"))), ["“S1. S2. S3.”", "“T1. T2. T3. T4.”"]);
});
