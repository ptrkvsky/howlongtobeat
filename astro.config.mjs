// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Static site, rebuilt locally (or on a VPS) and deployed prebuilt. The news
// pages too: scripts/news.sh redeploys the site when an article is written
export default defineConfig({
  site: `https://www.game-over.io`,
  output: `static`,
  adapter: vercel(),
  trailingSlash: `never`,
  build: {
    // jeu/elden-ring.html, served as /jeu/elden-ring (vercel.json cleanUrls)
    format: `file`,
  },
  integrations: [sitemap()],
});
