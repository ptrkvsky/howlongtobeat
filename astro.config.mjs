// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';

// Fully static site: rebuilt locally (or on a VPS) and deployed prebuilt
export default defineConfig({
  site: `https://game-over.io`,
  output: `static`,
  trailingSlash: `never`,
  build: {
    // jeu/elden-ring.html, served as /jeu/elden-ring (vercel.json cleanUrls)
    format: `file`,
  },
  integrations: [sitemap()],
});
