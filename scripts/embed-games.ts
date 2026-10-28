/**
 * Embeds the gameplay profile of the published games (OpenAI embeddings,
 * see src/features/jeu/recommendations/profile.ts) into game_embedding.
 * Only the games whose profile, model or dimensions changed are sent: a
 * weekly run costs nothing when the catalog did not move.
 *
 *   pnpm tsx scripts/embed-games.ts [--dry-run] [--limit n] [--max-usd 1]
 *
 * --dry-run prints how many games would be sent and the estimated cost.
 * Games without a profile (no tag, keyword nor summary) are skipped: their
 * recommendations come from the other signals or the fallback.
 *
 * Env (.env.local): OPENAI_API_KEY, EMBEDDING_MODEL, DATABASE_URL
 */
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { sql } from 'drizzle-orm';
import OpenAI from 'openai';
import { EMBEDDING_MODEL } from '../src/config/recommendations';
import { closeDb, getDb } from '../src/db/client';
import { EMBEDDING_DIMENSIONS, gameEmbedding } from '../src/db/schema';
import {
  buildProfile,
  profileHash,
} from '../src/features/jeu/recommendations/profile';
import { loadEmbeddings, loadFeatures } from './lib/recommendationData';

for (const file of [`.env.local`, `.env`]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const { values: args } = parseArgs({
  options: {
    limit: { type: `string` },
    'max-usd': { type: `string`, default: `1` },
    'dry-run': { type: `boolean`, default: false },
  },
});

// USD per million input tokens
const PRICES: Record<string, number> = {
  'text-embedding-3-small': 0.02,
  'text-embedding-3-large': 0.13,
};
const BATCH = 256;
// Rough count for the estimate: the API returns the real one
const estimateTokens = (text: string) => Math.ceil(text.length / 4);

async function main() {
  const model = EMBEDDING_MODEL;
  const price = PRICES[model];
  if (price === undefined) throw new Error(`No price known for ${model}`);
  const maxUsd = Number(args[`max-usd`]);

  const [games, existing] = await Promise.all([
    loadFeatures(),
    loadEmbeddings(model),
  ]);
  const todo = games
    .flatMap((game) => {
      const document = buildProfile(game);
      if (!document) return [];
      const docHash = profileHash(document, model, EMBEDDING_DIMENSIONS);
      return existing.get(game.id)?.docHash === docHash
        ? []
        : [{ gameId: game.id, document, docHash }];
    })
    .slice(0, args.limit ? Number(args.limit) : undefined);

  const estimated = todo.reduce(
    (sum, row) => sum + estimateTokens(row.document),
    0,
  );
  console.info(
    `${games.length} games, ${todo.length} profiles to embed with ${model} (${EMBEDDING_DIMENSIONS} d): ~${estimated} tokens, ~$${((estimated / 1e6) * price).toFixed(4)}`,
  );
  if (args[`dry-run`]) {
    if (todo[0]) console.info(`Example:\n${todo[0].document}`);
    return;
  }
  if (!process.env.OPENAI_API_KEY) throw new Error(`Missing OPENAI_API_KEY`);

  const openai = new OpenAI();
  const { db } = getDb();
  let tokens = 0;
  const cost = () => (tokens / 1e6) * price;
  for (let i = 0; i < todo.length; i += BATCH) {
    if (cost() > maxUsd) {
      console.error(`✖ budget of $${maxUsd} reached, stopping`);
      process.exitCode = 1;
      break;
    }
    const batch = todo.slice(i, i + BATCH);
    const response = await openai.embeddings.create({
      model,
      dimensions: EMBEDDING_DIMENSIONS,
      input: batch.map((row) => row.document),
    });
    tokens += response.usage.total_tokens;
    const values = response.data.map(({ index, embedding }) => ({
      ...batch[index],
      model,
      embedding,
      updatedAt: new Date(),
    }));
    await db
      .insert(gameEmbedding)
      .values(values)
      .onConflictDoUpdate({
        target: gameEmbedding.gameId,
        set: {
          model: sql`excluded.model`,
          docHash: sql`excluded.doc_hash`,
          document: sql`excluded.document`,
          embedding: sql`excluded.embedding`,
          updatedAt: sql`excluded.updated_at`,
        },
      });
    console.info(
      `… ${Math.min(i + BATCH, todo.length)}/${todo.length}, ${tokens} tokens, $${cost().toFixed(4)}`,
    );
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
