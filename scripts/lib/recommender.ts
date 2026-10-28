/**
 * Candidates and ranking of the recommendations, shared by
 * scripts/recommend.ts and scripts/evaluate-recommendations.ts.
 *
 * Candidates: the nearest embeddings (exact pgvector search: the catalog is
 * small enough not to need an approximate index) and the games sharing the
 * most weighted descriptors, so that a game without embedding is still found.
 */
import { EMBEDDING_MODEL } from '../../src/config/recommendations';
import { getDb } from '../../src/db/client';
import {
  createCatalog,
  descriptorNeighbours,
  rank,
  type RankOptions,
} from '../../src/features/jeu/recommendations/score';
import type { GameFeatures } from '../../src/features/jeu/recommendations/types';
import { loadEmbeddings, loadFeatures } from './recommendationData';

const VECTOR_CANDIDATES = 200;
const DESCRIPTOR_CANDIDATES = 200;

const dot = (a: number[], b: number[]) => {
  let sum = 0;
  for (let i = 0; i < a.length; i++) sum += a[i] * b[i];
  return sum;
};
const cosine = (a: number[], b: number[]) =>
  dot(a, b) / Math.sqrt(dot(a, a) * dot(b, b));

export async function createRecommender(model = EMBEDDING_MODEL) {
  const games = await loadFeatures();
  const embeddings = await loadEmbeddings(model);
  const catalog = createCatalog(games);
  const published = new Set(games.map((game) => game.id));
  const { sql: client } = getDb();

  async function nearestEmbeddings(reference: GameFeatures) {
    const own = embeddings.get(reference.id);
    if (!own) return [];
    const rows = await client<{ game_id: number }[]>`
      select game_id from game_embedding
      where model = ${model} and game_id <> ${reference.id}
      order by embedding <=> ${JSON.stringify(own.embedding)}::vector
      limit ${VECTOR_CANDIDATES}`;
    return rows.map((row) => row.game_id);
  }

  async function candidates(reference: GameFeatures) {
    const ids = new Set([
      ...(await nearestEmbeddings(reference)),
      ...descriptorNeighbours(catalog, reference, DESCRIPTOR_CANDIDATES),
    ]);
    const own = embeddings.get(reference.id)?.embedding;
    return [...ids]
      .filter((id) => published.has(id))
      .map((id) => {
        const other = embeddings.get(id)?.embedding;
        return { id, vector: own && other ? cosine(own, other) : undefined };
      });
  }

  return {
    games,
    catalog,
    embeddings,
    candidates,
    async recommend(reference: GameFeatures, options: RankOptions) {
      return rank(catalog, reference, await candidates(reference), options);
    },
  };
}

export type Recommender = Awaited<ReturnType<typeof createRecommender>>;
