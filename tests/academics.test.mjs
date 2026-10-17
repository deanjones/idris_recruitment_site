import { test, before } from "node:test";
import assert from "node:assert/strict";
import { FULL, MINIMAL, buildFull, buildMinimal, page, text, byTestId } from "./helpers.mjs";

let full, minimal;
before(async () => {
  await Promise.all([buildFull(), buildMinimal()]);
  full = page(FULL, "/academics/");
  minimal = page(MINIMAL, "/academics/");
});

test("GCSE table has 11 rows in order", () => {
  const rows = byTestId(full, "gcse-row");
  assert.equal(rows.length, 11);
  const cells = (r) => [...r.querySelectorAll("td")].map(text);
  assert.deepEqual(cells(rows[0]), ["Biology", "9"]);
  assert.deepEqual(cells(rows[9]), ["English Literature", "6"]);
  assert.deepEqual(cells(rows[10]), ["Statistics", "6"]);
});

test("three A-levels with no predicted grade shown yet", () => {
  const items = byTestId(full, "alevel");
  assert.deepEqual(items.map(text), ["Maths", "Chemistry", "Biology"]);
  assert.doesNotMatch(text(full.querySelector("main")), /Predicted/);
});

test("GPA equivalent with its note", () => {
  const main = text(full.querySelector("main"));
  assert.match(main, /3\.9/);
  assert.match(main, /Estimated US equivalent of GCSE results; not an official GPA\./);
});

test("four honours and no test scores", () => {
  const honours = byTestId(full, "honour");
  assert.equal(honours.length, 4);
  assert.equal(text(honours[0]), "High School Prize for Academic Excellence");
  assert.equal(text(honours[1]), "High School Prize for Outstanding Commitment to Physical Education");
  assert.equal(text(honours[2]), "Nominated for the High School English Prize");
  assert.equal(text(honours[3]), "Nominated for the High School Maths Prize");
  assert.equal(byTestId(full, "test-score").length, 0);
});

test("minimal: no empty sections", () => {
  for (const id of ["gcse-row", "alevel", "honour", "test-score"]) assert.equal(byTestId(minimal, id).length, 0);
  assert.equal(minimal.querySelectorAll("main h2").length, 0);
});
