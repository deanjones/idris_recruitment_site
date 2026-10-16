// Turns a pasted video URL into what the templates need to show it.
const NONE = Object.freeze({ provider: "none", href: "" });
const YOUTUBE_ID = /^[A-Za-z0-9_-]{11}$/;

function youtubeId(url) {
  const host = url.hostname.replace(/^(www|m)\./, "");
  if (host === "youtu.be") return url.pathname.slice(1).split("/")[0];
  if (host !== "youtube.com" && host !== "youtube-nocookie.com") return null;
  if (url.pathname === "/watch") return url.searchParams.get("v");
  const m = url.pathname.match(/^\/(shorts|embed|live)\/([^/]+)/);
  return m ? m[2] : null;
}

export function parseVideo(input) {
  let url;
  try {
    url = new URL(String(input ?? "").trim());
  } catch {
    return { ...NONE };
  }
  if (url.protocol !== "https:" && url.protocol !== "http:") return { ...NONE };

  const host = url.hostname.replace(/^(www|m)\./, "");
  if (["youtu.be", "youtube.com", "youtube-nocookie.com"].includes(host)) {
    const id = youtubeId(url);
    if (!id || !YOUTUBE_ID.test(id)) return { ...NONE };
    return {
      provider: "youtube",
      id,
      embedUrl: `https://www.youtube-nocookie.com/embed/${id}?autoplay=1`,
      thumbnailUrl: `https://i.ytimg.com/vi/${id}/hqdefault.jpg`,
      href: `https://www.youtube.com/watch?v=${id}`,
    };
  }
  if (url.hostname === "hudl.com" || url.hostname.endsWith(".hudl.com")) {
    return { provider: "hudl", href: url.href };
  }
  return { provider: "link", href: url.href };
}
