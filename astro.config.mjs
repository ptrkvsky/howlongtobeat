// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import vercel from '@astrojs/vercel';

// Static site, rebuilt locally (or on a VPS) and deployed prebuilt. Only the
// news pages (prerender = false) are rendered on demand by a Vercel function:
// an article is published every hour, without a rebuild
export default defineConfig({
  site: `https://www.game-over.io`,
  output: `static`,
  adapter: vercel(),
  trailingSlash: `never`,
  build: {
    // jeu/elden-ring.html, served as /jeu/elden-ring (vercel.json cleanUrls)
    format: `file`,
  },
  integrations: [
    // On-demand pages are not listed: /actus is added by hand, the articles
    // have their own sitemap (src/pages/actus/sitemap.xml.ts)
    sitemap({ customPages: [`https://www.game-over.io/actus`] }),
  ],
});
