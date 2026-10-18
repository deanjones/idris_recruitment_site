// Splits an evaluation quote into homepage-sized parts of up to two sentences:
// 3 sentences → [1–2, 3], 4 sentences → [1–2, 3–4]. Wording is never changed.

const ABBREVIATIONS = /\b(?:vs|e\.g|i\.e|etc|Mr|Mrs|Ms|Dr|St|No)\.$/i;

export function sentences(text) {
  const clean = String(text ?? "").replace(/\s+/g, " ").trim();
  if (!clean) return [];
  const out = [];
  // A sentence ends at . ! or ? (plus any closing quote/bracket), followed by a space.
  const re = /[.!?]["”’')\]]*(?=\s)/g;
  let start = 0;
  for (const m of clean.matchAll(re)) {
    const end = m.index + m[0].length;
    if (ABBREVIATIONS.test(clean.slice(start, end))) continue;
    out.push(clean.slice(start, end).trim());
    start = end;
  }
  const rest = clean.slice(start).trim();
  if (rest) out.push(rest);
  return out;
}

export function quoteParts(text) {
  const s = sentences(text);
  const parts = [];
  for (let i = 0; i < s.length; i += 2) parts.push(s.slice(i, i + 2).join(" "));
  return parts;
}
