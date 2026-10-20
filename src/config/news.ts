// Video game news shown on /actus, written and published every hour by
// scripts/publish-news.ts on the public Vercel Blob store game-over-news
// (store_lHZQPU4FQyav327e)
const BLOB_URL = `https://lhzqpu4fqyav327e.public.blob.vercel-storage.com`;

// Latest articles, without their content, for /actus
export const NEWS_INDEX_PATH = `news/index.json`;
export const NEWS_INDEX_URL = `${BLOB_URL}/${NEWS_INDEX_PATH}`;

// Every published article, without its content, for the news sitemap
export const NEWS_SITEMAP_PATH = `news/sitemap.json`;
export const NEWS_SITEMAP_URL = `${BLOB_URL}/${NEWS_SITEMAP_PATH}`;

// One file per article, kept after the article leaves the index
export const NEWS_ARTICLES_PREFIX = `news/articles/`;
export const newsArticlePath = (slug: string) =>
  `${NEWS_ARTICLES_PREFIX}${slug}.json`;
export const newsArticleUrl = (slug: string) =>
  `${BLOB_URL}/${newsArticlePath(slug)}`;

export const newsPageUrl = (slug: string) => `/actus/${slug}`;

export const NEWS_CATEGORIES = [
  `sortie`,
  `mise-a-jour`,
  `annonce`,
  `materiel`,
  `industrie`,
  `promo`,
  `autre`,
] as const;
export type NewsCategory = (typeof NEWS_CATEGORIES)[number];

export const newsCategoryLabels: Record<NewsCategory, string> = {
  sortie: `Sortie`,
  'mise-a-jour': `Mise à jour`,
  annonce: `Annonce`,
  materiel: `Matériel`,
  industrie: `Industrie`,
  promo: `Bon plan`,
  autre: `Actu`,
};

export interface NewsImage {
  // Absolute URL, or a path of the site for the category visuals
  url: string;
  width: number;
  height: number;
  alt: string;
}

export interface NewsSummary {
  slug: string;
  date: string;
  category: NewsCategory;
  image: NewsImage;
  title: string;
  excerpt: string;
  // Game of the catalog the article is about, linked to its page
  game: { name: string; slug: string } | null;
}

export interface NewsArticle extends NewsSummary {
  // Rewritten article, as HTML
  content: string;
}

export interface NewsIndex {
  updatedAt: string;
  articles: NewsSummary[];
}

export interface NewsSitemap {
  updatedAt: string;
  articles: Pick<NewsSummary, 'slug' | 'date' | 'title'>[];
}
