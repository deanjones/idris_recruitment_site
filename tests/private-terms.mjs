import { existsSync, readFileSync } from "node:fs";

// Terms that must never appear on the site (school name, real prize names…).
// Locally they live in the gitignored private-terms.txt; in CI the deploy
// workflow writes that file from the PRIVATE_TERMS secret.
// Returns null when the check should be skipped (local only); throws in CI.
export function loadPrivateTerms({ path = "private-terms.txt", ci = Boolean(process.env.CI) } = {}) {
  const terms = existsSync(path)
    ? readFileSync(path, "utf8").split("\n").map((s) => s.trim()).filter(Boolean)
    : [];
  if (terms.length) return terms;
  if (ci) throw new Error("private-terms.txt is missing or empty in CI – set the PRIVATE_TERMS repository secret");
  return null;
}
