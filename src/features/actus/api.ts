/**
 * News published on Vercel Blob by scripts/publish-news.ts, read by the
 * on-demand /actus pages.
 */
import {
  NEWS_INDEX_URL,
  NEWS_SITEMAP_URL,
  newsArticleUrl,
  type NewsArticle,
  type NewsIndex,
  type NewsSitemap,
} from '@/config/news';

async function fetchNews<T>(url: string): Promise<T | null> {
  const response = await fetch(url);
  // A missing file reads as a 403 or a 404 on Vercel Blob
  if (response.status === 403 || response.status === 404) return null;
  if (!response.ok) throw new Error(`HTTP ${response.status} on ${url}`);
  return response.json() as Promise<T>;
}

export const getNewsIndex = () => fetchNews<NewsIndex>(NEWS_INDEX_URL);

export const getNewsSitemap = () => fetchNews<NewsSitemap>(NEWS_SITEMAP_URL);

// Slugs are written by the script: anything else is not an article
export const getNewsArticle = (slug: string) =>
  /^[a-z0-9-]{1,120}$/.test(slug)
    ? fetchNews<NewsArticle>(newsArticleUrl(slug))
    : Promise.resolve(null);
