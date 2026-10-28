/**
 * Features of the published games for the recommendations, from the trusted
 * matches only (same rules as src/features/jeu/api/getGames.ts).
 */
import { and, eq, inArray } from 'drizzle-orm';
import { getDb } from '../../src/db/client';
import {
  game,
  gameEmbedding,
  gameExternalId,
  hltbStats,
  igdbInfo,
  steamStats,
  steamTags,
} from '../../src/db/schema';
import type { GameFeatures } from '../../src/features/jeu/recommendations/types';

const IGDB_TRUSTED = new Set([`matched`, `no_steam`, `manual`]);
const STEAM_TRUSTED = new Set([`matched`, `manual`]);

export async function loadFeatures(): Promise<GameFeatures[]> {
  const { db } = getDb();
  const rows = await db
    .select({
      game: {
        id: game.id,
        name: game.name,
        timeMainStory: game.timeMainStory,
        descriptionMd: game.descriptionMd,
        isTranslated: game.isTranslated,
      },
      ids: gameExternalId,
      igdb: igdbInfo,
      tags: steamTags,
      hltbPlayers: hltbStats.countTotal,
      steamReviews: steamStats.reviewTotal,
    })
    .from(game)
    .leftJoin(gameExternalId, eq(gameExternalId.gameId, game.id))
    .leftJoin(igdbInfo, eq(igdbInfo.gameId, game.id))
    .leftJoin(steamTags, eq(steamTags.gameId, game.id))
    .leftJoin(hltbStats, eq(hltbStats.gameId, game.id))
    .leftJoin(steamStats, eq(steamStats.gameId, game.id))
    .where(eq(game.isPublished, true))
    .orderBy(game.id);

  return rows.map(({ game: row, ids, igdb: rawIgdb, tags, ...counts }) => {
    const igdb =
      ids && IGDB_TRUSTED.has(ids.status) && rawIgdb ? rawIgdb : null;
    const steamTrusted = Boolean(
      ids && STEAM_TRUSTED.has(ids.status) && tags?.appId === ids.steamAppId,
    );
    return {
      id: row.id,
      name: row.name,
      igdbId: igdb ? (ids?.igdbId ?? null) : null,
      parentIgdbId: igdb?.parentIgdbId ?? null,
      seriesIds: [
        ...(igdb?.franchiseIds ?? []).map((id) => `f${id}`),
        ...(igdb?.collectionIds ?? []).map((id) => `c${id}`),
      ],
      similarIgdbIds: igdb?.similarIgdbIds ?? [],
      genres: igdb?.genres ?? [],
      themes: igdb?.themes ?? [],
      keywords: igdb?.keywords ?? [],
      gameModes: igdb?.gameModes ?? [],
      perspectives: igdb?.perspectives ?? [],
      steamTags: steamTrusted ? tags!.tags : [],
      // The English summary; the description while it is still in English
      summary:
        igdb?.summaryEn ??
        (!row.isTranslated && row.descriptionMd ? row.descriptionMd : null),
      timeMainStory: row.timeMainStory,
      popularity: counts.hltbPlayers ?? counts.steamReviews ?? 0,
    };
  });
}

// pgvector returns "[0.1,0.2,…]"; drizzle's vector type parses it
export async function loadEmbeddings(model: string, gameIds?: number[]) {
  const { db } = getDb();
  const rows = await db
    .select({
      gameId: gameEmbedding.gameId,
      docHash: gameEmbedding.docHash,
      embedding: gameEmbedding.embedding,
    })
    .from(gameEmbedding)
    .where(
      and(
        eq(gameEmbedding.model, model),
        gameIds ? inArray(gameEmbedding.gameId, gameIds) : undefined,
      ),
    );
  return new Map(rows.map((row) => [row.gameId, row]));
}
