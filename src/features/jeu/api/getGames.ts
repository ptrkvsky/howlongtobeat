import { asc, eq, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import {
  game,
  gameExternalId,
  gameOverride,
  hltbStats,
  igdbInfo,
  itadPrice,
  steamStats,
} from '@/db/schema';
import type { Game, GameSummary } from '@/types/Game';
import { steamReviewLabel } from '@/utils/format';
import { imageIdFromUrl } from '@/utils/igdbImage';

// Data is only shown from confirmed ids (scripts/sync.ts). IGDB data needs no
// Steam id: console games have none
const IGDB_TRUSTED = new Set([`matched`, `no_steam`, `manual`]);
const STEAM_TRUSTED = new Set([`matched`, `manual`]);
const COMPLETION_PUBLISHED = new Set([`auto`, `validated`]);

// HLTB seconds → whole hours, like the game times
const toHours = (seconds: number) => Math.round(seconds / 3600);

// First index of sorted `times` where `before` is false
function partition(times: number[], before: (time: number) => boolean) {
  let low = 0;
  let high = times.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (before(times[middle])) low = middle + 1;
    else high = middle;
  }
  return low;
}

// Rank of each main story in the catalog, after the overrides so that a
// corrected time is ranked with its new value. Ties count on neither side
function setTimeRanks(games: Game[]) {
  const times = games
    .map((row) => row.timeMainStory)
    .filter((time) => time > 0)
    .sort((a, b) => a - b);
  const percent = (count: number) => Math.round((count / times.length) * 100);
  for (const row of games) {
    const time = row.timeMainStory;
    if (time <= 0) continue;
    row.timeRank = {
      longerThan: percent(partition(times, (other) => other < time)),
      shorterThan: percent(
        times.length - partition(times, (other) => other <= time),
      ),
    };
  }
}

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
        hltb: hltbStats,
        price: itadPrice,
      })
      .from(game)
      .leftJoin(gameExternalId, eq(gameExternalId.gameId, game.id))
      .leftJoin(igdbInfo, eq(igdbInfo.gameId, game.id))
      .leftJoin(steamStats, eq(steamStats.gameId, game.id))
      .leftJoin(hltbStats, eq(hltbStats.gameId, game.id))
      .leftJoin(itadPrice, eq(itadPrice.gameId, game.id))
      .where(eq(game.isPublished, true))
      // Former Sanity order (by document id), then the games added since
      .orderBy(sql`${game.sanityId} collate "C" asc nulls last`, asc(game.id)),
    db.select().from(gameOverride),
  ]);

  const games = rows.map(
    ({ game: row, ids, igdb, steam, hltb, price }): Game => {
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
              achievement:
                steam.completion.displayName ?? steam.completion.name,
              updatedAt: steam.fetchedAt.toISOString(),
            }
          : null;
      return {
        ...row,
        // The confirmed IGDB cover first: the imported ones may be another game's
        cover: (igdbTrusted && igdb?.coverImageId) || imageIdFromUrl(row.cover),
        identity,
        reviews,
        completion,
        hltb: hltb
          ? {
              players: hltb.countTotal,
              completed: hltb.countComp,
              playing: hltb.countPlaying,
              backlog: hltb.countBacklog,
              times: {
                main: {
                  hours: toHours(hltb.compMain),
                  count: hltb.compMainCount,
                },
                plus: {
                  hours: toHours(hltb.compPlus),
                  count: hltb.compPlusCount,
                },
                full: {
                  hours: toHours(hltb.comp100),
                  count: hltb.comp100Count,
                },
              },
              mainMedian: toHours(hltb.compMainMed),
              updatedAt: hltb.fetchedAt.toISOString(),
            }
          : null,
        // Looked up from the confirmed Steam id, even without Steam stats
        price:
          ids &&
          STEAM_TRUSTED.has(ids.status) &&
          price?.appId === ids.steamAppId
            ? {
                current: price.current,
                shop: price.shop,
                url: price.url,
                lowest: price.lowest,
                lowestShop: price.lowestShop,
                currency: price.currency,
                updatedAt: price.fetchedAt.toISOString(),
              }
            : null,
        timeRank: null,
        // HLTB players who added the game, Steam reviews when not imported yet
        popularity: hltb?.countTotal ?? steam?.reviewTotal ?? 0,
        links: {
          steamAppId: steamTrusted ? ids!.steamAppId : null,
          igdbSlug: igdbTrusted ? (ids!.igdbSlug ?? null) : null,
        },
      };
    },
  );

  // Manual corrections win over imported values
  const byId = new Map(games.map((row) => [row.id, row]));
  for (const { gameId, field, value } of overrides) {
    const row = byId.get(gameId) as Record<string, unknown> | undefined;
    if (row && field in row) row[field] = value;
  }
  setTimeRanks(games);
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
