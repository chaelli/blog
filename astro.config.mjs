import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import svelte from "@astrojs/svelte";
import remarkGfm from "remark-gfm";
import remarkSmartypants from "remark-smartypants";
import rehypeExternalLinks from "rehype-external-links";

// https://astro.build/config
export default defineConfig({
  site: "https://michael.keller.id",
  // No base path needed when using custom domain
  base: "/",
  integrations: [mdx(), svelte()],
  markdown: {
    shikiConfig: {
      theme: "nord",
    },
    remarkPlugins: [remarkGfm, remarkSmartypants],
    rehypePlugins: [
      [
        rehypeExternalLinks,
        {
          target: "_blank",
        },
      ],
    ],
  },
});
