import { asc, eq } from 'drizzle-orm';
import { ALGO_VERSION, RECOMMENDATION_COUNT } from '@/config/recommendations';
import { getDb } from '@/db/client';
import { gameRecommendation } from '@/db/schema';
import { getAllGenres } from '@/functions/getAllGenres';
import type { Game, RelatedGame } from '@/types/Game';
import type { Genre } from '@/types/Genre';
import { getGames, toGameSummary } from './getGames';

// 2021 scraping: 45 % of the legacy games got these four genres, which
// therefore link nothing
const FILLER_GENRES = [`Adventure`, `Indie`, `Simulator`, `Strategy`];
// Fallback: at least two genres in common, without the filler
const MIN_SHARED_GENRES = 2;

// 0 for the same main story time, 1 for twice (or half) as long
const timeDistance = (a: Game, b: Game) =>
  a.timeMainStory > 0 && b.timeMainStory > 0
    ? Math.abs(Math.log2(a.timeMainStory / b.timeMainStory))
    : Infinity;

export interface RelatedIndex {
  byId: Map<number, Game>;
  // scripts/recommend.ts, by rank
  recommendations: Map<number, number[]>;
  // Fallback, for the games without recommendations
  byGenre: Map<number, Game[]>;
  // Genres of each game, without the filler set
  genres: Map<number, number[]>;
  // Position in the catalog order, to break ties
  position: Map<Game, number>;
}

export function buildIndex(
  games: Game[],
  allGenres: Pick<Genre, 'id' | 'name'>[],
  recommendations: Map<number, number[]>,
): RelatedIndex {
  const names = new Map(allGenres.map((genre) => [genre.id, genre.name]));
  const isFiller = (ids: number[]) =>
    ids.length === FILLER_GENRES.length &&
    FILLER_GENRES.every((name) => ids.some((id) => names.get(id) === name));
  const genres = new Map(
    games.map((game) => [
      game.id,
      isFiller(game.genreIds) ? [] : game.genreIds,
    ]),
  );

  const byGenre = new Map<number, Game[]>();
  for (const game of games) {
    if ((game.rating ?? 0) < 80) continue;
    for (const genreId of genres.get(game.id)!) {
      const list = byGenre.get(genreId);
      if (list) list.push(game);
      else byGenre.set(genreId, [game]);
    }
  }
  return {
    byId: new Map(games.map((game) => [game.id, game])),
    recommendations,
    byGenre,
    genres,
    position: new Map(games.map((game, i) => [game, i])),
  };
}

// Former rule, kept as a fallback: well rated games (>= 80) sharing the most
// genres, then with the closest main story. A short list rather than games
// without any link
export function fallbackRelated(game: Game, index: RelatedIndex) {
  const shared = new Map<Game, number>();
  for (const genreId of new Set(index.genres.get(game.id) ?? [])) {
    for (const related of index.byGenre.get(genreId) ?? []) {
      if (related.id === game.id) continue;
      shared.set(related, (shared.get(related) ?? 0) + 1);
    }
  }
  return [...shared]
    .filter(([, count]) => count >= MIN_SHARED_GENRES)
    .map(([related, count]) => ({
      related,
      shared: count,
      distance: timeDistance(game, related),
    }))
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        a.distance - b.distance ||
        index.position.get(a.related)! - index.position.get(b.related)!,
    )
    .slice(0, RECOMMENDATION_COUNT)
    .map(({ related }) => related);
}

export function relatedOf(game: Game, index: RelatedIndex) {
  const ids = index.recommendations.get(game.id) ?? [];
  // A recommended game may have been unpublished since the computation
  const recommended = ids.flatMap((id) => index.byId.get(id) ?? []);
  return recommended.length ? recommended : fallbackRelated(game, index);
}

// Missing table (migration not applied yet) or legacy engine: fallback only
async function loadRecommendations() {
  const recommendations = new Map<number, number[]>();
  if (process.env.RECOMMENDATIONS_ENGINE === `legacy`) return recommendations;
  try {
    const rows = await getDb()
      .db.select({
        gameId: gameRecommendation.gameId,
        relatedGameId: gameRecommendation.relatedGameId,
      })
      .from(gameRecommendation)
      .where(eq(gameRecommendation.algoVersion, ALGO_VERSION))
      .orderBy(asc(gameRecommendation.gameId), asc(gameRecommendation.rank));
    for (const row of rows) {
      const list = recommendations.get(row.gameId);
      if (list) list.push(row.relatedGameId);
      else recommendations.set(row.gameId, [row.relatedGameId]);
    }
  } catch (error) {
    console.warn(`Recommendations not available, fallback used:`, error);
  }
  return recommendations;
}

// Built once per build worker: every game page reads it
let indexPromise: Promise<RelatedIndex> | undefined;

const getIndex = () =>
  (indexPromise ??= Promise.all([
    getGames(),
    getAllGenres(),
    loadRecommendations(),
  ]).then(([games, genres, recommendations]) =>
    buildIndex(games, genres, recommendations),
  ));

/**
 * "D'autres jeux à terminer": the recommendations of scripts/recommend.ts,
 * else the games sharing genres (fallbackRelated)
 */
export async function getRelatedGames(game: Game): Promise<RelatedGame[]> {
  return relatedOf(game, await getIndex()).map((related) => ({
    ...toGameSummary(related),
    timeMainStory: related.timeMainStory,
    timeMainExtras: related.timeMainExtras,
    timeCompletionists: related.timeCompletionists,
  }));
}
