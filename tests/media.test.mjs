import { test, before } from "node:test";
import assert from "node:assert/strict";
import { FULL, MINIMAL, buildFull, buildMinimal, buildVariant, page, text, byTestId } from "./helpers.mjs";

const COMING_SOON = "Videos coming soon.";
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
  assert.ok(!withVideo.querySelector("iframe"));
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

test("highlights button falls back to videos.yml highlight", async () => {
  const out = await buildVariant("highlight-fallback", {
    "videos.yml": `summary: ""\nhighlight: {title: "Highlight reel", url: "https://youtu.be/dQw4w9WgXcQ"}\nmatches: []\n`,
  });
  assert.equal(byTestId(page(out, "/"), "highlights-btn")[0]?.getAttribute("href"), "https://www.youtube.com/watch?v=dQw4w9WgXcQ");
});

for (const [label, get] of [["minimal", () => minimal]]) {
  test(`${label}: no videos yet shows coming soon`, () => {
    const doc = get();
    assert.equal(byTestId(doc, "video").length, 0);
    assert.match(text(doc.querySelector("main")), new RegExp(COMING_SOON));
  });
}

test("page, tile and menu are labelled Videos", () => {
  assert.equal(text(full.querySelector("h1")), "Videos");
  assert.match(full.querySelector("title").textContent, /^Videos \|/);
  assert.equal(text(full.querySelector('nav a[href="/media/"]')), "Videos");
  assert.equal(text(page(FULL, "/").querySelector('[data-section="media"] h2')), "Videos");
});

test("highlight and matches share one grid so the players are the same size", () => {
  const players = byTestId(withVideo, "video");
  assert.equal(players.length, 2);
  for (const v of players) {
    assert.ok(v.closest(".video-grid > .video-card"), "video not inside the shared grid");
  }
  const cards = [...withVideo.querySelectorAll(".video-grid > .video-card")];
  assert.equal(text(cards[0].querySelector("h3")), "Highlight reel");
});

test("highlight card shows its details line under the title", () => {
  const card = full.querySelector(".video-grid > .video-card");
  assert.equal(text(card.querySelector("h3")), "Highlight reel");
  assert.equal(text(card.querySelector("h3 + p.muted")), "U16 / U18");
});

test("banner photo sits at the top of the Videos page", () => {
  const main = full.querySelector("main");
  const banner = main.querySelector('[data-testid="banner"]');
  assert.ok(banner, "no banner");
  assert.ok(main.firstElementChild === banner, "banner is not the first thing on the page");
  const img = banner.querySelector("img");
  assert.match(img.getAttribute("src"), /^\/assets\/img\/87c962107d-1200\.jpg$/);
  assert.notEqual(img.getAttribute("alt"), "");
});

test("minimal: no banner on the Videos page", () => {
  assert.equal(byTestId(minimal, "banner").length, 0);
});
