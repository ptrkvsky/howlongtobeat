/**
 * What /genres shows, from the catalog at build time: the genres that have
 * enough timed games to give a reliable duration, and the others.
 */
import { getGames } from '@/features/jeu/api';
import { genreStats } from '@/features/home/data';

export const FEATURED_COUNT = 8;
// "Indépendant" says how a game was made, not how it plays: no visual of its
// own, it stays in the index
const NOT_FEATURED = new Set([`indie`]);

type GenreStat = Awaited<ReturnType<typeof genreStats>>['charted'][number];

// The most played genres lead the page; the median only means something
// with enough timed games, which `charted` guarantees
export function splitFeatured(charted: GenreStat[], count = FEATURED_COUNT) {
  const candidates = charted.filter((genre) => !NOT_FEATURED.has(genre.slug));
  const featured = candidates.slice(0, count);
  return {
    featured,
    rest: charted.filter((genre) => !featured.includes(genre)),
  };
}

// The shortest and the longest genres by median hours, among the charted ones
export function byLength(charted: GenreStat[], count = 3) {
  const sorted = [...charted].sort(
    (a, b) => a.median - b.median || b.count - a.count,
  );
  return {
    shortest: sorted.slice(0, count),
    longest: sorted.slice(-count).reverse(),
  };
}

async function genresData() {
  const games = await getGames();
  const { charted, others } = await genreStats(games);
  const { featured, rest } = splitFeatured(charted);
  return {
    gamesCount: games.length,
    genresCount: charted.length + others.length,
    featured,
    rest,
    others,
    ...byLength(charted),
    // Every genre, for the index and its filter
    all: [...charted, ...others].sort((a, b) =>
      a.label.localeCompare(b.label, `fr`),
    ),
  };
}

let promise: ReturnType<typeof genresData> | undefined;

export function getGenresData() {
  promise ??= genresData();
  return promise;
}

export type GenresData = Awaited<ReturnType<typeof genresData>>;
