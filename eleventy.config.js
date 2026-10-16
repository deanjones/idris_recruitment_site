import yaml from "js-yaml";

export default function (eleventyConfig) {
  eleventyConfig.addDataExtension("yml", (contents) => yaml.load(contents));
  eleventyConfig.addPassthroughCopy("src/assets");
  eleventyConfig.addPassthroughCopy("src/CNAME");
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
