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

test("CI writes the private terms from a secret before testing", () => {
  const body = read(".github/workflows/deploy.yml");
  const w = body.indexOf("secrets.PRIVATE_TERMS");
  assert.ok(w > -1, "workflow does not use the PRIVATE_TERMS secret");
  assert.ok(w < body.indexOf("npm test"), "private terms must be written before npm test");
});

test("sample quotes don't name a club or a person", async () => {
  const { default: yaml } = await import("js-yaml");
  const { testimonials } = yaml.load(read("src/_data/testimonials.yml"));
  for (const t of testimonials.filter((t) => t.placeholder)) {
    assert.ok(!t.name, "sample quote has a name");
    assert.ok(!t.club, `sample quote names a club: ${t.club}`);
  }
});
