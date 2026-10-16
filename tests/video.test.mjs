import { test } from "node:test";
import assert from "node:assert/strict";
import { parseVideo } from "../lib/video.js";

const ID = "dQw4w9WgXcQ";

for (const url of [
  `https://www.youtube.com/watch?v=${ID}&t=30s`,
  `https://youtu.be/${ID}?si=abc`,
  `https://www.youtube.com/shorts/${ID}`,
  `https://www.youtube.com/embed/${ID}`,
  `https://m.youtube.com/watch?v=${ID}`,
  `  https://youtu.be/${ID}  `,
]) {
  test(`youtube: ${url.trim()}`, () => {
    assert.deepEqual(parseVideo(url), {
      provider: "youtube",
      id: ID,
      embedUrl: `https://www.youtube-nocookie.com/embed/${ID}?autoplay=1`,
      thumbnailUrl: `https://i.ytimg.com/vi/${ID}/hqdefault.jpg`,
      href: `https://www.youtube.com/watch?v=${ID}`,
    });
  });
}

test("hudl links out unchanged", () => {
  const url = "https://www.hudl.com/video/3/123/abc";
  assert.deepEqual(parseVideo(url), { provider: "hudl", href: url });
});

test("other http(s) URLs become plain links", () => {
  assert.deepEqual(parseVideo("https://vimeo.com/1"), { provider: "link", href: "https://vimeo.com/1" });
});

for (const bad of ["", "not a url", undefined, "javascript:alert(1)", "https://www.youtube.com/watch?v="]) {
  test(`none: ${JSON.stringify(bad)}`, () => {
    assert.deepEqual(parseVideo(bad), { provider: "none", href: "" });
  });
}
