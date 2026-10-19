import { asc, eq, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { game, gameGenre, gameOverride } from '@/db/schema';
import type { Game, GameSummary } from '@/types/Game';

async function fetchGames(): Promise<Game[]> {
  const { db } = getDb();
  const [rows, overrides] = await Promise.all([
    db
      .select({
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
        >`coalesce(array_agg(${gameGenre.genreId}) filter (where ${gameGenre.genreId} is not null), '{}')`,
      })
      .from(game)
      .leftJoin(gameGenre, eq(gameGenre.gameId, game.id))
      .where(eq(game.isPublished, true))
      .groupBy(game.id)
      // Former Sanity order (by document id), then the games added since
      .orderBy(sql`${game.sanityId} collate "C" asc nulls last`, asc(game.id)),
    db.select().from(gameOverride),
  ]);

  // Manual corrections win over imported values
  const byId = new Map(rows.map((row) => [row.id, row as Game]));
  for (const { gameId, field, value } of overrides) {
    const row = byId.get(gameId) as Record<string, unknown> | undefined;
    if (row && field in row) row[field] = value;
  }
  return rows;
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
