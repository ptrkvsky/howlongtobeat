/**
 * schema.org nodes, rendered by BaseLayout as one JSON-LD @graph per page.
 * F9: only data shown on the page. No aggregateRating (third-party reviews),
 * no FAQPage or SearchAction (no longer shown by Google).
 */
import { marked } from 'marked';
import {
  AUTHOR_IMAGE_SIZE,
  authorPageUrl,
  authors,
  type Author,
  type AuthorSlug,
} from '@/config/authors';
import { newsCategoryLabels, type NewsArticle } from '@/config/news';
import { siteInformations } from '@/config/siteInformations';
import type { Game } from '@/types/Game';
import type { Genre } from '@/types/Genre';
import { externalLinks } from '@/utils/externalLinks';
import { igdbImage } from '@/utils/igdbImage';

export type JsonLdNode = Record<string, unknown>;

export interface BreadcrumbItem {
  name: string;
  path: string;
}

const LANGUAGE = `fr-FR`;
const DESCRIPTION_LENGTH = 300;

const absolute = (path: string) => new URL(path, siteInformations.url).href;

export const siteIds = {
  website: absolute(`/#website`),
  organization: absolute(`/#organization`),
};

// Ids of the nodes of a page, from its path
export const pageIds = (path: string) => ({
  webpage: `${absolute(path)}#webpage`,
  breadcrumb: `${absolute(path)}#breadcrumb`,
  game: `${absolute(path)}#game`,
  itemList: `${absolute(path)}#itemlist`,
});

// The Person of an author, defined on their page and on their articles
export const personId = (slug: AuthorSlug) =>
  `${absolute(authorPageUrl(slug))}#person`;

export const ref = (id: string) => ({ '@id': id });

// 12.5 → "PT12H30M", 3 → "PT3H"
export function isoDuration(hours: number) {
  const minutes = Math.round(hours * 60);
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return `PT${h ? `${h}H` : ``}${m ? `${m}M` : ``}` || `PT0M`;
}

// Markdown → plain text, cut on a word: "Dans ce jeu, vous…"
export function plainText(markdown: string, length = DESCRIPTION_LENGTH) {
  const text = marked
    .parse(markdown, { async: false })
    .replace(/<[^>]+>/g, ` `)
    .replace(/&quot;/g, `"`)
    .replace(/&#39;/g, `'`)
    .replace(/&lt;/g, `<`)
    .replace(/&gt;/g, `>`)
    .replace(/&amp;/g, `&`)
    .replace(/\s+/g, ` `)
    .trim();
  if (text.length <= length) return text;
  return `${text.slice(0, text.lastIndexOf(` `, length))}…`;
}

export const websiteNode = (): JsonLdNode => ({
  '@type': `WebSite`,
  '@id': siteIds.website,
  name: siteInformations.title,
  alternateName: `Game-Over`,
  url: absolute(`/`),
  inLanguage: LANGUAGE,
  publisher: ref(siteIds.organization),
});

export const organizationNode = (): JsonLdNode => ({
  '@type': `Organization`,
  '@id': siteIds.organization,
  name: siteInformations.title,
  url: absolute(`/`),
  logo: {
    '@type': `ImageObject`,
    url: absolute(`/icons/180x180.png`),
    width: 180,
    height: 180,
  },
  sameAs: [`https://x.com/${siteInformations.twitter.replace(/^@/, ``)}`],
});

interface WebPageOptions {
  type?: `WebPage` | `CollectionPage` | `ProfilePage`;
  path: string;
  name: string;
  description?: string;
  hasBreadcrumb?: boolean;
  extra?: JsonLdNode;
}

export function webPageNode({
  type = `WebPage`,
  path,
  name,
  description,
  hasBreadcrumb = true,
  extra,
}: WebPageOptions): JsonLdNode {
  const ids = pageIds(path);
  return {
    '@type': type,
    '@id': ids.webpage,
    url: absolute(path),
    name,
    description,
    inLanguage: LANGUAGE,
    isPartOf: ref(siteIds.website),
    breadcrumb: hasBreadcrumb ? ref(ids.breadcrumb) : undefined,
    ...extra,
  };
}

// The last item is the current page: no link, as on the page
export const breadcrumbNode = (
  path: string,
  items: BreadcrumbItem[],
): JsonLdNode => ({
  '@type': `BreadcrumbList`,
  '@id': pageIds(path).breadcrumb,
  itemListElement: items.map((item, index) => ({
    '@type': `ListItem`,
    position: index + 1,
    name: item.name,
    item: index < items.length - 1 ? absolute(item.path) : undefined,
  })),
});

const organizations = (names: string[] = []) =>
  names.length
    ? names.map((name) => ({ '@type': `Organization`, name }))
    : undefined;

export function videoGameNode(
  game: Game,
  genres: Genre[],
  path: string,
): JsonLdNode {
  const sameAs = externalLinks(game.links).map((link) => link.href);
  return {
    '@type': `VideoGame`,
    '@id': pageIds(path).game,
    name: game.name,
    url: absolute(path),
    description: game.descriptionMd ? plainText(game.descriptionMd) : undefined,
    image: game.cover ? igdbImage(game.cover, `cover_big_2x`) : undefined,
    applicationCategory: `Game`,
    datePublished: game.identity?.releaseDate ?? undefined,
    genre: genres.length ? genres.map((genre) => genre.name) : undefined,
    gamePlatform: game.identity?.platforms.length
      ? game.identity.platforms
      : undefined,
    author: organizations(game.identity?.developers),
    publisher: organizations(game.identity?.publishers),
    // Main story time, the first HLTB time shown (see TimesRuler.astro)
    timeRequired:
      game.timeMainStory > 0 ? isoDuration(game.timeMainStory) : undefined,
    sameAs: sameAs.length ? sameAs : undefined,
    mainEntityOfPage: ref(pageIds(path).webpage),
  };
}

// A paginated list gives the whole list size and the first item's index
export const itemListNode = (
  path: string,
  items: BreadcrumbItem[],
  { total = items.length, start = 0 } = {},
): JsonLdNode => ({
  '@type': `ItemList`,
  '@id': pageIds(path).itemList,
  numberOfItems: total,
  itemListElement: items.map((item, index) => ({
    '@type': `ListItem`,
    position: start + index + 1,
    url: absolute(item.path),
    name: item.name,
  })),
});

// Author of the /actus articles. No sameAs: they have no other profile
export const personNode = (author: Author): JsonLdNode => ({
  '@type': `Person`,
  '@id': personId(author.slug),
  name: author.name,
  url: absolute(authorPageUrl(author.slug)),
  description: author.shortBio,
  jobTitle: author.jobTitle,
  image: {
    '@type': `ImageObject`,
    url: absolute(author.image),
    width: AUTHOR_IMAGE_SIZE,
    height: AUTHOR_IMAGE_SIZE,
  },
  knowsAbout: author.knowsAbout,
  knowsLanguage: LANGUAGE,
  worksFor: ref(siteIds.organization),
  mainEntityOfPage: ref(pageIds(authorPageUrl(author.slug)).webpage),
});

const wordCount = (html: string) =>
  html
    .replace(/<[^>]+>/g, ` `)
    .split(/\s+/)
    .filter(Boolean).length;

// Article of /actus: signed by its author, illustrated with a 16:9 image.
// The author's name and url are repeated, as Google recommends
export function newsArticleNode(
  path: string,
  article: NewsArticle,
): JsonLdNode {
  const author = authors[article.author];
  const image = absolute(article.image.url);
  return {
    '@type': `NewsArticle`,
    '@id': `${absolute(path)}#article`,
    mainEntityOfPage: ref(pageIds(path).webpage),
    headline: article.title,
    description: article.excerpt,
    image: {
      '@type': `ImageObject`,
      url: image,
      width: article.image.width,
      height: article.image.height,
    },
    thumbnailUrl: image,
    datePublished: article.date,
    dateModified: article.updatedAt,
    inLanguage: LANGUAGE,
    articleSection: newsCategoryLabels[article.category],
    wordCount: wordCount(article.content),
    isAccessibleForFree: true,
    // Only the games with a page are linked (src/features/actus/api.ts)
    about: article.game
      ? ref(pageIds(`/jeu/${article.game.slug}`).game)
      : undefined,
    author: {
      '@type': `Person`,
      '@id': personId(author.slug),
      name: author.name,
      url: absolute(authorPageUrl(author.slug)),
    },
    publisher: ref(siteIds.organization),
  };
}

export const graph = (nodes: JsonLdNode[]) => ({
  '@context': `https://schema.org`,
  '@graph': nodes,
});
