import { test, before } from "node:test";
import assert from "node:assert/strict";
import { existsSync, readFileSync, readdirSync, statSync } from "node:fs";
import { join, extname } from "node:path";
import { FULL, buildFull } from "./helpers.mjs";
import { loadPrivateTerms } from "./private-terms.mjs";

const EMAIL = "idris.2009.soccer@gmail.com";

function walk(dir) {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name);
    return statSync(p).isDirectory() ? walk(p) : [p];
  });
}

let textFiles = [];
before(async () => {
  await buildFull();
  textFiles = walk(FULL)
    .filter((f) => [".html", ".xml", ".txt"].includes(extname(f)))
    .map((f) => ({ f, body: readFileSync(f, "utf8").split(EMAIL).join("") }));
});

test("no birth-date wording", () => {
  for (const { f, body } of textFiles) {
    assert.doesNotMatch(body, /birthday|date of birth|\bDOB\b|\bborn\b/i, f);
  }
});

test("no 2009 anywhere outside the contact email", () => {
  for (const { f, body } of textFiles) {
    assert.doesNotMatch(body, /2009/, f);
    assert.doesNotMatch(body, /\b\d{1,2}[\/.-]\d{1,2}[\/.-]2009\b/, f);
  }
});

test("no phone links", () => {
  for (const { f, body } of textFiles) assert.doesNotMatch(body, /href="tel:/i, f);
});

test("private terms (school name etc.) never appear", (t) => {
  const terms = loadPrivateTerms();
  if (!terms) {
    t.skip("private-terms.txt not found – school-name check skipped");
    return;
  }
  for (const { f, body } of textFiles) {
    const lower = body.toLowerCase();
    for (const term of terms) assert.ok(!lower.includes(term.toLowerCase()), `private term found in ${f}`);
  }
});

test("published image filenames are content hashes", () => {
  const dir = join(FULL, "assets/img");
  if (!existsSync(dir)) return;
  for (const name of readdirSync(dir)) {
    assert.match(name, /^[0-9a-f]{10}-(480|1200)\.jpg$/, name);
  }
});
