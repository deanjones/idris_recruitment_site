import { test } from "node:test";
import assert from "node:assert/strict";
import { quoteParts } from "../lib/quotes.js";

test("1 or 2 sentences stay whole", () => {
  assert.deepEqual(quoteParts("One sentence."), ["One sentence."]);
  assert.deepEqual(quoteParts("First one. Second one."), ["First one. Second one."]);
});

test("3 sentences: first two, then the third", () => {
  assert.deepEqual(quoteParts("Reads the game well. Strong on the ball. A natural leader."), [
    "Reads the game well. Strong on the ball.",
    "A natural leader.",
  ]);
});

test("4 sentences: first two, then second two", () => {
  assert.deepEqual(quoteParts("One. Two! Three? Four."), ["One. Two!", "Three? Four."]);
});

test("does not split inside numbers, scores or common abbreviations", () => {
  assert.deepEqual(
    quoteParts("He scored 2.5 goals a game vs. strong teams. Works hard. Plays U16 and U18 football."),
    ["He scored 2.5 goals a game vs. strong teams. Works hard.", "Plays U16 and U18 football."],
  );
});

test("keeps closing quotes and brackets with their sentence; tidies spaces", () => {
  assert.deepEqual(quoteParts('  He said "great."  Then left.   Again. '), ['He said "great." Then left.', "Again."]);
});

test("empty input gives no parts", () => {
  assert.deepEqual(quoteParts(""), []);
  assert.deepEqual(quoteParts(undefined), []);
});
