import { test } from "node:test";
import assert from "node:assert/strict";
import { execFileSync } from "node:child_process";
import { existsSync, readFileSync } from "node:fs";

const read = (p) => readFileSync(p, "utf8");

test("deploy workflow runs tests before publishing", () => {
  const wf = ".github/workflows/deploy.yml";
  assert.ok(existsSync(wf));
  const body = read(wf);
  const t = body.indexOf("npm test");
  const u = body.indexOf("upload-pages-artifact");
  assert.ok(t > -1 && u > -1 && t < u, "npm test must come before upload-pages-artifact");
  assert.match(body, /deploy-pages/);
});

test(".gitignore keeps private and generated files out", () => {
  const lines = read(".gitignore").split("\n").map((l) => l.trim());
  for (const p of ["node_modules/", "_site/", "originals/", "docs/superpowers/", ".superpowers/", "private-terms.txt", "tests/.out/"]) {
    assert.ok(lines.includes(p), `.gitignore missing ${p}`);
  }
});

test("nothing private is tracked by git", () => {
  const files = execFileSync("git", ["ls-files"], { encoding: "utf8" }).split("\n");
  for (const f of files) {
    assert.ok(!f.startsWith("originals/"), f);
    assert.ok(!f.startsWith("docs/superpowers/"), f);
    assert.notEqual(f, "private-terms.txt");
  }
});

test("README covers the owner's jobs", () => {
  const readme = read("README.md");
  for (const h of [
    "## Editing content",
    "## Adding photos",
    "## Adding videos",
    "## Replacing the sample quotes",
    "## Deploying",
    "## Custom domain",
    "## Privacy checklist",
  ]) assert.ok(readme.includes(h), `README missing "${h}"`);
});
