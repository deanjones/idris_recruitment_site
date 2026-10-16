// Progressive enhancements. Every page works without this file.

function initRotation(root = document) {
  for (const region of root.querySelectorAll("[data-rotate]")) {
    const items = [...region.querySelectorAll("figure")];
    if (items.length < 2) continue;
    let i = 0;
    setInterval(() => {
      items[i].hidden = true;
      i = (i + 1) % items.length;
      items[i].hidden = false;
    }, 8000);
  }
}

initRotation();

// Swap a video thumbnail for the real player only when it's clicked.
function initVideos(root = document) {
  for (const a of root.querySelectorAll("a.video-facade[data-embed]")) {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      const iframe = document.createElement("iframe");
      iframe.src = a.dataset.embed;
      iframe.title = a.getAttribute("aria-label") || "Video";
      iframe.allow = "autoplay; encrypted-media; picture-in-picture; fullscreen";
      iframe.allowFullscreen = true;
      iframe.className = "video-frame";
      a.replaceWith(iframe);
    });
  }
}

initVideos();

for (const b of document.querySelectorAll("[data-print]")) {
  b.addEventListener("click", () => window.print());
}
