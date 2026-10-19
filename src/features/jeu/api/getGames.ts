import { asc, eq, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import {
  game,
  gameExternalId,
  gameOverride,
  igdbInfo,
  steamStats,
} from '@/db/schema';
import type { Game, GameSummary } from '@/types/Game';
import { steamReviewLabel } from '@/utils/format';

// Data is only shown from confirmed ids (scripts/sync.ts). IGDB data needs no
// Steam id: console games have none
const IGDB_TRUSTED = new Set([`matched`, `no_steam`, `manual`]);
const STEAM_TRUSTED = new Set([`matched`, `manual`]);
const COMPLETION_PUBLISHED = new Set([`auto`, `validated`]);

async function fetchGames(): Promise<Game[]> {
  const { db } = getDb();
  const [rows, overrides] = await Promise.all([
    db
      .select({
        game: {
          id: game.id,
          hltbId: game.hltbId,
          name: game.name,
          slug: game.slug,
          cover: game.cover,
          rating: game.rating,
          timeMainStory: game.timeMainStory,
          timeMainExtras: game.timeMainExtras,
          timeCompletionists: game.timeCompletionists,
          descriptionMd: game.descriptionMd,
          genreIds: sql<
            number[]
          >`coalesce((select array_agg(genre_id) from game_genre where game_id = ${game.id}), '{}')`,
        },
        ids: gameExternalId,
        igdb: igdbInfo,
        steam: steamStats,
      })
      .from(game)
      .leftJoin(gameExternalId, eq(gameExternalId.gameId, game.id))
      .leftJoin(igdbInfo, eq(igdbInfo.gameId, game.id))
      .leftJoin(steamStats, eq(steamStats.gameId, game.id))
      .where(eq(game.isPublished, true))
      // Former Sanity order (by document id), then the games added since
      .orderBy(sql`${game.sanityId} collate "C" asc nulls last`, asc(game.id)),
    db.select().from(gameOverride),
  ]);

  const games = rows.map(({ game: row, ids, igdb, steam }): Game => {
    const igdbTrusted = Boolean(ids && IGDB_TRUSTED.has(ids.status));
    const steamTrusted = Boolean(
      ids && STEAM_TRUSTED.has(ids.status) && steam?.appId === ids.steamAppId,
    );
    const identity =
      igdbTrusted && igdb
        ? {
            releaseDate: igdb.firstReleaseDate,
            developers: igdb.developers,
            publishers: igdb.publishers,
            platforms: igdb.platforms,
            isMature: igdb.isMature,
          }
        : null;
    const reviews =
      steamTrusted && steam?.reviewTotal && steam.reviewPercent !== null
        ? {
            percent: steam.reviewPercent,
            total: steam.reviewTotal,
            label: steamReviewLabel(steam.reviewDesc),
            updatedAt: steam.fetchedAt.toISOString(),
          }
        : null;
    const completion =
      steamTrusted &&
      steam?.completion &&
      steam.completionStatus &&
      COMPLETION_PUBLISHED.has(steam.completionStatus)
        ? {
            percent: steam.completion.percent,
            achievement: steam.completion.displayName ?? steam.completion.name,
            updatedAt: steam.fetchedAt.toISOString(),
          }
        : null;
    return {
      ...row,
      identity,
      reviews,
      completion,
      links: {
        steamAppId: steamTrusted ? ids!.steamAppId : null,
        igdbSlug: igdbTrusted ? (ids!.igdbSlug ?? null) : null,
      },
    };
  });

  // Manual corrections win over imported values
  const byId = new Map(games.map((row) => [row.id, row]));
  for (const { gameId, field, value } of overrides) {
    const row = byId.get(gameId) as Record<string, unknown> | undefined;
    if (row && field in row) row[field] = value;
  }
  return games;
}

// Every page is generated at build time: fetch the whole catalog once
// per build worker instead of one request per page.
let gamesPromise: Promise<Game[]> | undefined;

export function getGames() {
  gamesPromise ??= fetchGames();
  return gamesPromise;
}

// Fields needed to list a game
export function toGameSummary({ id, name, cover, slug }: Game): GameSummary {
  return { id, name, cover, slug };
}
