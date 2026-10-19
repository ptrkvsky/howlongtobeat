// GameSpot news shown on /actus, translated and published by
// scripts/fetch-gamespot.ts on the public Vercel Blob store game-over-news
// (store_lHZQPU4FQyav327e)
const BLOB_URL = `https://lhzqpu4fqyav327e.public.blob.vercel-storage.com`;

// Index of the latest articles, without their content
export const NEWS_INDEX_PATH = `news/gamespot.json`;
export const NEWS_INDEX_URL = `${BLOB_URL}/${NEWS_INDEX_PATH}`;

// One file per article, kept after the article leaves the index
export const NEWS_ARTICLES_PREFIX = `news/articles/`;
export const newsArticlePath = (slug: string) =>
  `${NEWS_ARTICLES_PREFIX}${slug}.json`;
export const newsArticleUrl = (slug: string) =>
  `${BLOB_URL}/${newsArticlePath(slug)}`;

// Page of an article (static page, the article is loaded client-side)
export const newsPageUrl = (slug: string) =>
  `/actus/article?slug=${encodeURIComponent(slug)}`;

export interface NewsSummary {
  slug: string;
  // Original article on GameSpot
  url: string;
  date: string;
  image: string | null;
  title: string;
  excerpt: string;
}

export interface NewsArticle extends NewsSummary {
  // Translated article, as HTML
  content: string;
}

export interface NewsIndex {
  source: string;
  updatedAt: string;
  articles: NewsSummary[];
}
