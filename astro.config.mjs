import { defineConfig } from 'astro/config';
// import inlineSVG from '@jsdevtools/rehype-inline-svg';
import tailwind from "@astrojs/tailwind";
import sitemap from "@astrojs/sitemap";
import prefetch from "@astrojs/prefetch";
import cloudflare from "@astrojs/cloudflare";

// https://astro.build/config
export default defineConfig({
  site: "https://blog.mioi.io",
  integrations: [tailwind(), sitemap(), prefetch()],
  markdown: {
    rehypePlugins: []
  },
  output: "server",
  adapter: cloudflare({ mode: "directory" }),
});