/**
 * Computes "D'autres jeux à terminer" for every published game into
 * game_recommendation, read by the build (src/features/jeu/api/
 * getRelatedGames.ts). Run after scripts/embed-games.ts; no API call, a few
 * minutes for the whole catalog.
 *
 *   pnpm tsx scripts/recommend.ts [--dry-run] [--slug rimworld,…]
 *
 * --dry-run prints the recommendations of the --slug games (or of a few
 * games) instead of writing them.
 *
 * Env (.env.local): DATABASE_URL
 */
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { inArray } from 'drizzle-orm';
import { ALGO_VERSION, WEIGHTS } from '../src/config/recommendations';
import { closeDb, getDb } from '../src/db/client';
import { game, gameRecommendation } from '../src/db/schema';
import { createRecommender } from './lib/recommender';

for (const file of [`.env.local`, `.env`]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const { values: args } = parseArgs({
  options: {
    slug: { type: `string` },
    'dry-run': { type: `boolean`, default: false },
  },
});

const BATCH = 200;

async function main() {
  const { db } = getDb();
  const recommender = await createRecommender();
  const { games, embeddings } = recommender;

  let references = games;
  if (args.slug) {
    const rows = await db
      .select({ id: game.id })
      .from(game)
      .where(inArray(game.slug, args.slug.split(`,`)));
    const ids = new Set(rows.map((row) => row.id));
    references = games.filter((row) => ids.has(row.id));
  } else if (args[`dry-run`]) {
    references = games.slice(0, 5);
  }
  console.info(
    `${references.length} games, ${embeddings.size} embeddings, ${ALGO_VERSION}`,
  );

  const startedAt = Date.now();
  let empty = 0;
  for (let i = 0; i < references.length; i += BATCH) {
    const batch = references.slice(i, i + BATCH);
    const rows: (typeof gameRecommendation.$inferInsert)[] = [];
    for (const reference of batch) {
      const picks = await recommender.recommend(reference, {
        weights: WEIGHTS,
      });
      if (!picks.length) empty++;
      if (args[`dry-run`]) {
        console.info(`\n${reference.name}`);
        for (const pick of picks) {
          const name = recommender.catalog.games.get(pick.id)!.name;
          const parts = Object.entries(pick.components)
            .map(([key, value]) => `${key} ${value.toFixed(2)}`)
            .join(`, `);
          console.info(`  ${pick.score.toFixed(3)} ${name} (${parts})`);
        }
      }
      rows.push(
        ...picks.map((pick, rank) => ({
          gameId: reference.id,
          rank,
          relatedGameId: pick.id,
          score: pick.score,
          components: pick.components as Record<string, number>,
          algoVersion: ALGO_VERSION,
        })),
      );
    }
    if (!args[`dry-run`]) {
      // The list of each game is replaced as a whole
      await db.transaction(async (tx) => {
        await tx.delete(gameRecommendation).where(
          inArray(
            gameRecommendation.gameId,
            batch.map((row) => row.id),
          ),
        );
        if (rows.length) await tx.insert(gameRecommendation).values(rows);
      });
      console.info(
        `… ${Math.min(i + BATCH, references.length)}/${references.length} (${Math.round((Date.now() - startedAt) / 1000)} s)`,
      );
    }
  }
  console.info(
    `${empty} games without any recommendation above the threshold (fallback on the site)`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
