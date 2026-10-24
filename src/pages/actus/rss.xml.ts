/**
 * RSS feed of the latest news, built with the site (rebuilt every time
 * scripts/publish-news.ts writes an article).
 */
import type { APIRoute } from 'astro';
import { siteInformations } from '@/config/siteInformations';
import { newsCategoryLabels, newsPageUrl } from '@/config/news';
import { getNewsArticles } from '@/features/actus/api';

const MAX_ITEMS = 30;

const escapeXml = (text: string) =>
  text
    .replace(/&/g, `&amp;`)
    .replace(/</g, `&lt;`)
    .replace(/>/g, `&gt;`)
    .replace(/"/g, `&quot;`);

export const GET: APIRoute = async ({ site }) => {
  const articles = (await getNewsArticles()).slice(0, MAX_ITEMS);
  const items = articles.map((article) => {
    const url = new URL(newsPageUrl(article.slug), site).href;
    return `    <item>
      <title>${escapeXml(article.title)}</title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${new Date(article.date).toUTCString()}</pubDate>
      <category>${escapeXml(newsCategoryLabels[article.category])}</category>
      <description>${escapeXml(article.excerpt)}</description>
    </item>`;
  });
  const feed = new URL(`/actus/rss.xml`, site).href;
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
  <channel>
    <title>Actus ${escapeXml(siteInformations.title)}</title>
    <link>${new URL(`/actus`, site).href}</link>
    <description>Les actus jeux vidéo, avec le temps qu'il faut pour finir les jeux concernés.</description>
    <language>fr</language>
    <atom:link href="${feed}" rel="self" type="application/rss+xml" />
${items.join(`\n`)}
  </channel>
</rss>
`;
  return new Response(xml, {
    headers: { 'Content-Type': `application/rss+xml; charset=utf-8` },
  });
};
