import { test, before } from "node:test";
import assert from "node:assert/strict";
import { FULL, MINIMAL, buildFull, buildMinimal, buildVariant, page, text, byTestId } from "./helpers.mjs";

const COMING_SOON = "Video and photos coming soon.";
let full, minimal, withVideo, withVideoHome;

before(async () => {
  await Promise.all([buildFull(), buildMinimal()]);
  full = page(FULL, "/media/");
  minimal = page(MINIMAL, "/media/");
  const out = await buildVariant("videos", {
    "profile.yml": `name: Idris Thomas-Jones
initials: IT-J
email: idris.2009.soccer@gmail.com
highlight_url: "https://youtu.be/dQw4w9WgXcQ"
positions: []
headline_stats: []
`,
    "videos.yml": `summary: ""
highlight: {title: "Highlight reel", url: "https://youtu.be/dQw4w9WgXcQ"}
matches:
  - {title: "v Example FC", competition: "NFYL", date: "March 2026", watch_for: "#10, white shirt", url: "https://www.hudl.com/video/3/1/x"}
`,
  });
  withVideo = page(out, "/media/");
  withVideoHome = page(out, "/");
});

test("youtube highlight renders a click-to-load facade", () => {
  const facade = withVideo.querySelector('[data-testid="video"].video-facade');
  assert.ok(facade);
  assert.match(facade.getAttribute("data-embed"), /^https:\/\/www\.youtube-nocookie\.com\/embed\//);
  assert.equal(facade.getAttribute("href"), "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  assert.equal(withVideo.querySelector("iframe"), null);
});

test("hudl match renders a plain link with its details", () => {
  const link = withVideo.querySelector('a[data-testid="video"][href^="https://www.hudl.com/"]');
  assert.ok(link);
  assert.match(text(link), /Watch on Hudl/);
  assert.match(text(withVideo.querySelector("main")), /Watch for: #10, white shirt/);
});

test("homepage highlights button uses the canonical YouTube link", () => {
  assert.equal(byTestId(withVideoHome, "highlights-btn")[0].getAttribute("href"), "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
  assert.doesNotMatch(text(withVideo.querySelector("main")), new RegExp(COMING_SOON));
});

for (const [label, get] of [["full", () => full], ["minimal", () => minimal]]) {
  test(`${label}: no videos yet shows coming soon`, () => {
    const doc = get();
    assert.equal(byTestId(doc, "video").length, 0);
    assert.match(text(doc.querySelector("main")), new RegExp(COMING_SOON));
  });
}
