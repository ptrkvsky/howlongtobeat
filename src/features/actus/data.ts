/**
 * Editorial rules of the /actus pages, on the list the build already holds
 * (latest first): which articles lead, how the flow is grouped, which
 * articles go together. Pure functions, so they are tested.
 */
import {
  NEWS_CATEGORIES,
  type NewsCategory,
  type NewsGame,
  type NewsSummary,
} from '@/config/news';

// The lead comes from the most recent articles only: it must stay "news"
const LEAD_POOL = 15;
export const LEAD_SIZE = 3;
export const RELATED_SIZE = 3;
const TOP_GAMES_WINDOW_DAYS = 30;
const DAY_MS = 24 * 60 * 60 * 1000;

// The category visuals are paths of the site; a real artwork is an URL
const hasArtwork = (article: NewsSummary) =>
  article.image.url.startsWith(`http`);

// Articles about a game of the catalog come first (they link to a play time,
// which is what the site is about), then those with a real artwork. Ties keep
// the order of the list: the most recent first
export function pickLead<T extends NewsSummary>(articles: T[]): T[] {
  const score = (article: T) =>
    (article.game ? 2 : 0) + (hasArtwork(article) ? 1 : 0);
  const ranked = articles
    .slice(0, LEAD_POOL)
    .map((article, index) => ({ article, index }))
    .sort((a, b) => score(b.article) - score(a.article) || a.index - b.index)
    .map(({ article }) => article);
  // One story per game: three stories about the same game would show the
  // same artwork three times
  const lead: T[] = [];
  const games = new Set<string>();
  for (const article of ranked) {
    if (lead.length === LEAD_SIZE) break;
    if (article.game && games.has(article.game.slug)) continue;
    if (article.game) games.add(article.game.slug);
    lead.push(article);
  }
  return lead;
}

// Paris calendar day, "2026-10-23"
const dayKey = new Intl.DateTimeFormat(`en-CA`, { timeZone: `Europe/Paris` });

export interface DayGroup<T> {
  // "2026-10-23", sortable
  key: string;
  date: string;
  articles: T[];
}

// The flow, one group per day, in the order of the list
export function groupByDay<T extends NewsSummary>(
  articles: T[],
): DayGroup<T>[] {
  const groups: DayGroup<T>[] = [];
  for (const article of articles) {
    const key = dayKey.format(new Date(article.date));
    const last = groups.at(-1);
    if (last?.key === key) last.articles.push(article);
    else groups.push({ key, date: article.date, articles: [article] });
  }
  return groups;
}

// Same game first, then same category; never an unrelated article. Latest
// first inside each tier
export function relatedArticles<T extends NewsSummary>(
  article: NewsSummary,
  articles: T[],
  size = RELATED_SIZE,
): T[] {
  const others = articles.filter((other) => other.slug !== article.slug);
  const sameGame = article.game
    ? others.filter((other) => other.game?.slug === article.game?.slug)
    : [];
  const sameCategory = others.filter(
    (other) => other.category === article.category && !sameGame.includes(other),
  );
  return [...sameGame, ...sameCategory].slice(0, size);
}

// Newer and older neighbours in the whole flow
export function adjacentArticles<T extends NewsSummary>(
  article: NewsSummary,
  articles: T[],
) {
  const index = articles.findIndex((other) => other.slug === article.slug);
  if (index < 0) return { newer: undefined, older: undefined };
  return { newer: articles[index - 1], older: articles[index + 1] };
}

// Categories with at least one article, in the editorial order of the
// config, with their count
export function categoriesWithCount(articles: NewsSummary[]) {
  const counts = new Map<NewsCategory, number>();
  for (const { category } of articles) {
    counts.set(category, (counts.get(category) ?? 0) + 1);
  }
  return NEWS_CATEGORIES.filter((category) => counts.has(category)).map(
    (category) => ({ category, count: counts.get(category) ?? 0 }),
  );
}

export type TopGame = NewsGame & { count: number };

// Games of the catalog the news talk about the most over the last 30 days
export function topGames(
  articles: NewsSummary[],
  now: Date,
  size = 6,
): TopGame[] {
  const since = now.getTime() - TOP_GAMES_WINDOW_DAYS * DAY_MS;
  const games = new Map<string, TopGame>();
  for (const { game, date } of articles) {
    if (!game || new Date(date).getTime() < since) continue;
    const entry = games.get(game.slug) ?? { ...game, count: 0 };
    entry.count += 1;
    games.set(game.slug, entry);
  }
  return [...games.values()]
    .sort((a, b) => b.count - a.count || a.name.localeCompare(b.name, `fr`))
    .slice(0, size);
}
