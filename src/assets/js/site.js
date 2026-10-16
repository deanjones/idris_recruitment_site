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
