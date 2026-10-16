import { test } from "node:test";
import assert from "node:assert/strict";
import { loadPrivateTerms } from "./private-terms.mjs";

test("in CI a missing private-terms file is a failure, not a skip", () => {
  assert.throws(() => loadPrivateTerms({ path: "does-not-exist.txt", ci: true }), /private-terms/);
});

test("in CI an empty private-terms file is a failure", () => {
  assert.throws(() => loadPrivateTerms({ path: "/dev/null", ci: true }), /private-terms/);
});

test("locally a missing file returns null so the check is skipped", () => {
  assert.equal(loadPrivateTerms({ path: "does-not-exist.txt", ci: false }), null);
});
