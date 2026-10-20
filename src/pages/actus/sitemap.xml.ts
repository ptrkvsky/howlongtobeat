/**
 * Google News sitemap of the articles published in the last 48 hours
 * (https://developers.google.com/search/docs/crawling-indexing/sitemaps/news-sitemap),
 * rendered on demand from the list kept by scripts/publish-news.ts.
 */
import type { APIRoute } from 'astro';
import { siteInformations } from '@/config/siteInformations';
import { newsPageUrl } from '@/config/news';
import { getNewsSitemap } from '@/features/actus/api';

export const prerender = false;

const MAX_AGE = 48 * 3600 * 1000;

const escapeXml = (text: string) =>
  text
    .replace(/&/g, `&amp;`)
    .replace(/</g, `&lt;`)
    .replace(/>/g, `&gt;`)
    .replace(/"/g, `&quot;`);

export const GET: APIRoute = async ({ site }) => {
  const sitemap = await getNewsSitemap();
  const since = Date.now() - MAX_AGE;
  const urls = (sitemap?.articles ?? [])
    .filter((article) => Date.parse(article.date) >= since)
    .map(
      (article) => `  <url>
    <loc>${new URL(newsPageUrl(article.slug), site)}</loc>
    <news:news>
      <news:publication>
        <news:name>${escapeXml(siteInformations.title)}</news:name>
        <news:language>fr</news:language>
      </news:publication>
      <news:publication_date>${article.date}</news:publication_date>
      <news:title>${escapeXml(article.title)}</news:title>
    </news:news>
  </url>`,
    );
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:news="http://www.google.com/schemas/sitemap-news/0.9">
${urls.join(`\n`)}
</urlset>
`;
  return new Response(xml, {
    headers: {
      'Content-Type': `application/xml; charset=utf-8`,
      'Cache-Control': `public, s-maxage=600, stale-while-revalidate=3600`,
    },
  });
};
