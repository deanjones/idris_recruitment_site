import { test } from "node:test";
import assert from "node:assert/strict";
import { buildSite, page, text } from "./helpers.mjs";

// Owner edits often leave a key with nothing after it (YAML null) or an unquoted number.
const OUT = "tests/.out/null-data";

test("every page builds when data keys are null", async () => {
  await buildSite({ dataDir: "../tests/fixtures/null-data", outDir: OUT });
  for (const p of ["/", "/football/", "/academics/", "/personal/", "/media/", "/cv/"]) {
    assert.ok(page(OUT, p).querySelector("main"), `${p} missing`);
  }
  assert.equal(text(page(OUT, "/personal/").querySelector('[data-testid="bio"] p')), "12345");
});
