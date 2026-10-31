/**
 * What /a-propos and /methodologie say about the catalog, counted from the
 * data at build time. No figure is typed by hand: a count at 0 is not shown.
 */
import { authors, type AuthorSlug } from '@/config/authors';
import type { NewsArticle } from '@/config/news';
import { getNewsArticles } from '@/features/actus/api';
import { getGenresData } from '@/features/genres/data';
import { getGames } from '@/features/jeu/api';
import type { Game } from '@/types/Game';

type TimeKey = 'main' | 'plus' | 'full';

const TIME_FIELDS: Record<TimeKey, keyof Game> = {
  main: `timeMainStory`,
  plus: `timeMainExtras`,
  full: `timeCompletionists`,
};

// Median of whole hours, 0 without value
export function median(values: number[]) {
  const sorted = [...values].sort((a, b) => a - b);
  const middle = sorted.length >> 1;
  if (!sorted.length) return 0;
  return sorted.length % 2
    ? sorted[middle]
    : Math.round((sorted[middle - 1] + sorted[middle]) / 2);
}

type CatalogGame = Pick<
  Game,
  'timeMainStory' | 'timeMainExtras' | 'timeCompletionists' | 'hltb'
> & { identity: Pick<NonNullable<Game['identity']>, 'platforms'> | null };

export function catalogStats(games: CatalogGame[]) {
  const timed = {} as Record<TimeKey, number>;
  const medians = {} as Record<TimeKey, number>;
  for (const [key, field] of Object.entries(TIME_FIELDS) as [
    TimeKey,
    keyof CatalogGame,
  ][]) {
    const times = games
      .map((game) => game[field] as number)
      .filter((time) => time > 0);
    timed[key] = times.length;
    medians[key] = median(times);
  }
  // Times sent by the HowLongToBeat players, at the last reading of each game
  const submissions = games.reduce(
    (sum, { hltb }) =>
      hltb
        ? sum +
          hltb.times.main.count +
          hltb.times.plus.count +
          hltb.times.full.count
        : sum,
    0,
  );
  const platforms = new Set(
    games.flatMap((game) => game.identity?.platforms ?? []),
  );
  return {
    games: games.length,
    timed,
    medians,
    submissions,
    platforms: platforms.size,
  };
}

// Articles signed by each author, every author listed even without article
export function authorsWithCounts(news: Pick<NewsArticle, 'author'>[]) {
  const counts = new Map<AuthorSlug, number>();
  for (const { author } of news)
    counts.set(author, (counts.get(author) ?? 0) + 1);
  return Object.values(authors).map((author) => ({
    ...author,
    articles: counts.get(author.slug) ?? 0,
  }));
}

async function aboutData() {
  const [games, genres, news] = await Promise.all([
    getGames(),
    getGenresData(),
    getNewsArticles(),
  ]);
  return {
    ...catalogStats(games),
    genres: genres.genresCount,
    news: news.length,
    authors: authorsWithCounts(news),
  };
}

let promise: ReturnType<typeof aboutData> | undefined;

export function getAboutData() {
  promise ??= aboutData();
  return promise;
}

export type AboutData = Awaited<ReturnType<typeof aboutData>>;
