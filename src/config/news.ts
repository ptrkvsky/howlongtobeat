import type { AuthorSlug } from './authors';

// Video game news shown on /actus: written every hour by
// scripts/publish-news.ts into the news_article table, built as static pages
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

// What the news pages show of a game: its cover and play times (hours)
export interface NewsGame {
  name: string;
  slug: string;
  // IGDB image id, see src/utils/igdbImage.ts
  cover: string | null;
  timeMainStory: number;
  timeCompletionists: number;
}

export interface NewsSummary {
  slug: string;
  date: string;
  category: NewsCategory;
  author: AuthorSlug;
  image: NewsImage;
  title: string;
  excerpt: string;
  // Game of the catalog the article is about, linked to its page
  game: NewsGame | null;
}

export interface NewsArticle extends NewsSummary {
  // dateModified of the structured data
  updatedAt: string;
  // Rewritten article, as HTML
  content: string;
}
