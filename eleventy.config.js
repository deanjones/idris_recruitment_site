import yaml from "js-yaml";
import { parseVideo } from "./lib/video.js";

export default function (eleventyConfig) {
  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/CNAME");
  eleventyConfig.addFilter("parseVideo", (url) => {
    const v = parseVideo(url);
    if (v.provider === "none" && String(url ?? "").trim()) {
      console.warn(`[site] Ignoring video link that isn't a usable URL: ${url}`);
    }
    return v;
  });
  eleventyConfig.addFilter("split", (str, sep) => String(str ?? "").split(sep));
  eleventyConfig.addGlobalData("site", { url: "https://idristhomasjones.com" });

  return {
    dir: {
      input: "src",
      output: "_site",
      // Tests point this at a fixture folder to build with minimal content.
      data: process.env.SITE_DATA_DIR ?? "_data",
    },
    markdownTemplateEngine: "njk",
    htmlTemplateEngine: "njk",
  };
}
