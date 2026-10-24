/**
 * What a genre page shows, from the catalog at build time: the figures of
 * the genre, the games to list and the genres of a similar length. The
 * median and the bins are the ones of the home and of /genres (genreStats).
 */
import { existsSync } from 'node:fs';
import { join } from 'node:path';
import { getGames } from '@/features/jeu/api';
import { genreStats, GENRE_MIN_TIMES } from '@/features/home/data';
import type { Game } from '@/types/Game';

export const SIMILAR_COUNT = 5;
const EXTREMES_COUNT = 3;

type GenreStat = Awaited<ReturnType<typeof genreStats>>['charted'][number];

// Most popular first, by name for a stable order between builds
export async function getGenreGames(genreId: number) {
  const games = await getGames();
  return games
    .filter((game) => game.genreIds.includes(genreId))
    .sort(
      (a, b) =>
        b.popularity - a.popularity || a.name.localeCompare(b.name, `fr`),
    );
}

let statsPromise: ReturnType<typeof loadStats> | undefined;

async function loadStats() {
  const { charted, others } = await genreStats(await getGames());
  return { charted, others, all: [...charted, ...others] };
}

const getStats = () => (statsPromise ??= loadStats());

// Share of the timed games, in percent
const share = (part: number, total: number) =>
  total ? Math.round((part / total) * 100) : 0;

// A median and a histogram only mean something with enough timed games
export const isReliable = (stat: Pick<GenreStat, `timed`>) =>
  stat.timed >= GENRE_MIN_TIMES;

// Bins of the home: 0 is under 5 h and 1 is 5 to 10 h, 4 is 40 to 80 h and
// 5 is over 80 h
export function lengthShares(bins: number[], timed: number) {
  return {
    underTen: share(bins[0] + bins[1], timed),
    overForty: share(bins[4] + bins[5], timed),
  };
}

// Shortest and longest main story, the most popular first among equals
export function timedExtremes(games: Game[], count = EXTREMES_COUNT) {
  const timed = games.filter((game) => game.timeMainStory > 0);
  const sorted = [...timed].sort((a, b) => a.timeMainStory - b.timeMainStory);
  return {
    shortest: sorted.slice(0, count),
    longest: sorted.slice(-count).reverse(),
  };
}

// Genres closest in median hours, else the biggest ones
export function similarGenres(
  genre: GenreStat | undefined,
  charted: GenreStat[],
  count = SIMILAR_COUNT,
) {
  const others = charted.filter((other) => other.slug !== genre?.slug);
  if (!genre || !isReliable(genre)) return others.slice(0, count);
  return others
    .sort(
      (a, b) =>
        Math.abs(a.median - genre.median) - Math.abs(b.median - genre.median) ||
        b.count - a.count,
    )
    .slice(0, count);
}

// Artwork of the genre when it has one (public/genres, see
// scripts/generate-genre-images.ts)
export const genreArt = (slug: string) =>
  existsSync(join(process.cwd(), `public`, `genres`, `${slug}-1200.webp`));

export async function getGenrePageData(slug: string, games: Game[]) {
  const { charted, all } = await getStats();
  const stat = all.find((item) => item.slug === slug);
  const reliable = !!stat && isReliable(stat);
  return {
    stat,
    reliable,
    shares: stat && reliable ? lengthShares(stat.bins, stat.timed) : undefined,
    extremes: reliable ? timedExtremes(games) : undefined,
    similar: similarGenres(stat, charted),
    art: genreArt(slug),
  };
}

export type GenrePageData = Awaited<ReturnType<typeof getGenrePageData>>;
