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
