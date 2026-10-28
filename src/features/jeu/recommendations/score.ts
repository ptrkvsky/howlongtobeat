/**
 * Hybrid score of the recommendations: each signal between 0 and 1, then a
 * weighted mean over the signals known for both games (a game without
 * embedding is scored on the others). See docs/recommandations.md.
 */
import {
  COMPONENTS,
  MAX_PER_SERIES,
  MIN_SCORE,
  MMR_LAMBDA,
  RECOMMENDATION_COUNT,
  type Weights,
} from '../../../config/recommendations';
import { descriptors, gameplayGenres } from './profile';
import type { Components, GameFeatures, Recommendation } from './types';

type Vector = Map<string, number>;

// Smoothed inverse document frequency: a tag every game has weighs little
export function inverseFrequencies(sets: Iterable<Iterable<string>>) {
  const counts = new Map<string, number>();
  let total = 0;
  for (const set of sets) {
    total++;
    for (const key of new Set(set)) counts.set(key, (counts.get(key) ?? 0) + 1);
  }
  const idf = new Map<string, number>();
  for (const [key, count] of counts) {
    idf.set(key, Math.log((1 + total) / (1 + count)));
  }
  return idf;
}

export function cosine(a: Vector, b: Vector) {
  let dot = 0;
  let normA = 0;
  let normB = 0;
  for (const [key, value] of a) {
    normA += value * value;
    const other = b.get(key);
    if (other) dot += value * other;
  }
  for (const value of b.values()) normB += value * value;
  return normA && normB ? dot / Math.sqrt(normA * normB) : 0;
}

// Shared genres over all genres, each weighted by its rarity
export function weightedJaccard(
  a: string[],
  b: string[],
  idf: Map<string, number>,
) {
  const setB = new Set(b);
  let shared = 0;
  let union = 0;
  for (const key of new Set([...a, ...b])) {
    const weight = idf.get(key) ?? 0;
    union += weight;
    if (a.includes(key) && setB.has(key)) shared += weight;
  }
  return union ? shared / union : 0;
}

const MULTIPLAYER = /multi|co-?op|split|mmo|battle royale/i;

// Solo and multiplayer games are rarely alternatives to each other.
// Unknown modes: neutral
export function modesSimilarity(a: string[], b: string[]) {
  if (!a.length || !b.length) return 0.5;
  const kinds = (modes: string[]) =>
    new Set(
      modes.map((mode) =>
        MULTIPLAYER.test(mode) ? `multi` : /single/i.test(mode) ? `solo` : mode,
      ),
    );
  const ka = kinds(a);
  const kb = kinds(b);
  const shared = [...ka].filter((kind) => kb.has(kind)).length;
  return shared / new Set([...ka, ...kb]).size;
}

// 1 for the same main story, 0 from 8 times longer (or shorter)
export function timeSimilarity(a: number, b: number) {
  if (a <= 0 || b <= 0) return 0.5;
  return Math.max(0, 1 - Math.abs(Math.log2(a / b)) / 3);
}

// 10 000 HLTB players or more: 1
export const qualitySignal = (popularity: number) =>
  Math.min(1, Math.log10(popularity + 1) / 4);

const EDITION =
  /\b(remaster(ed)?|definitive|goty|game of the year|complete|enhanced|anniversary|deluxe|ultimate|director'?s cut|hd|edition|collection|redux|reloaded|royal)\b/g;

// "Tomb Raider: Definitive Edition (2014)" → "tomb raider"
export const baseTitle = (name: string) =>
  name
    .normalize(`NFKD`)
    .replace(/[̀-ͯ]/g, ``)
    .toLowerCase()
    .replace(/\(\d{4}\)/g, ``)
    .replace(/[™®©]/g, ``)
    .replace(/[^a-z0-9' ]+/g, ` `)
    .replace(EDITION, ` `)
    .replace(/\s+/g, ` `)
    .trim();

// Another edition, a remaster or an expansion of the same game
export function isVariant(a: GameFeatures, b: GameFeatures) {
  if (a.id === b.id) return true;
  if (a.igdbId && b.igdbId) {
    if (a.igdbId === b.igdbId) return true;
    if (a.parentIgdbId === b.igdbId || b.parentIgdbId === a.igdbId) return true;
    if (a.parentIgdbId && a.parentIgdbId === b.parentIgdbId) return true;
  }
  const title = baseTitle(a.name);
  return Boolean(title) && title === baseTitle(b.name);
}

export interface Catalog {
  games: Map<number, GameFeatures>;
  descriptors: Map<number, Vector>;
  genreIdf: Map<string, number>;
  // IGDB ids of the catalog, to know whether the base game of a DLC is in it
  igdbIds: Set<number>;
}

// Descriptors weighted by their rarity in the catalog, once
export function createCatalog(games: GameFeatures[]): Catalog {
  const raw = new Map(games.map((game) => [game.id, descriptors(game)]));
  const idf = inverseFrequencies([...raw.values()].map((map) => map.keys()));
  const weighted = new Map<number, Vector>();
  for (const [id, map] of raw) {
    weighted.set(
      id,
      new Map(
        [...map].map(([key, weight]) => [key, weight * (idf.get(key) ?? 0)]),
      ),
    );
  }
  return {
    games: new Map(games.map((game) => [game.id, game])),
    descriptors: weighted,
    genreIdf: inverseFrequencies(games.map(gameplayGenres)),
    igdbIds: new Set(games.flatMap((game) => game.igdbId ?? [])),
  };
}

// The candidates sharing the most weighted descriptors, without embeddings
export function descriptorNeighbours(
  catalog: Catalog,
  reference: GameFeatures,
  limit: number,
) {
  const own = catalog.descriptors.get(reference.id);
  if (!own?.size) return [];
  const scores: [number, number][] = [];
  for (const [id, vector] of catalog.descriptors) {
    if (id === reference.id || !vector.size) continue;
    const value = cosine(own, vector);
    if (value > 0) scores.push([id, value]);
  }
  return scores
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit)
    .map(([id]) => id);
}

// vectorSimilarity: cosine of the embeddings, undefined when one is missing
export function components(
  catalog: Catalog,
  reference: GameFeatures,
  candidate: GameFeatures,
  vectorSimilarity?: number,
): Components {
  const own = catalog.descriptors.get(reference.id);
  const other = catalog.descriptors.get(candidate.id);
  const genresA = gameplayGenres(reference);
  const genresB = gameplayGenres(candidate);
  const result: Components = {
    modes: modesSimilarity(reference.gameModes, candidate.gameModes),
    similar:
      (candidate.igdbId &&
        reference.similarIgdbIds.includes(candidate.igdbId)) ||
      (reference.igdbId && candidate.similarIgdbIds.includes(reference.igdbId))
        ? 1
        : 0,
    time: timeSimilarity(reference.timeMainStory, candidate.timeMainStory),
    quality: qualitySignal(candidate.popularity),
  };
  if (vectorSimilarity !== undefined) result.vector = vectorSimilarity;
  if (own?.size && other?.size) result.descriptors = cosine(own, other);
  if (genresA.length && genresB.length) {
    result.genres = weightedJaccard(genresA, genresB, catalog.genreIdf);
  }
  return result;
}

// Weighted mean of the known signals
export function combine(values: Components, weights: Weights) {
  let sum = 0;
  let total = 0;
  for (const key of COMPONENTS) {
    const value = values[key];
    if (value === undefined || !weights[key]) continue;
    sum += weights[key] * value;
    total += weights[key];
  }
  return total ? sum / total : 0;
}

export interface RankOptions {
  weights: Weights;
  minScore?: number;
  count?: number;
  maxPerSeries?: number;
  mmrLambda?: number;
}

/**
 * Best candidates of a reference game: variants left out, score above the
 * threshold, a few games per series, then maximal marginal relevance when
 * mmrLambda < 1 (the descriptors measure how much two picks look alike)
 */
export function rank(
  catalog: Catalog,
  reference: GameFeatures,
  candidates: { id: number; vector?: number }[],
  {
    weights,
    minScore = MIN_SCORE,
    count = RECOMMENDATION_COUNT,
    maxPerSeries = MAX_PER_SERIES,
    mmrLambda = MMR_LAMBDA,
  }: RankOptions,
): Recommendation[] {
  const scored: Recommendation[] = [];
  const seen = new Set<number>();
  for (const { id, vector } of candidates) {
    const candidate = catalog.games.get(id);
    if (!candidate || seen.has(id) || isVariant(reference, candidate)) continue;
    // A DLC or an edition of a game of the catalog: the base game is better
    if (candidate.parentIgdbId && catalog.igdbIds.has(candidate.parentIgdbId)) {
      continue;
    }
    seen.add(id);
    const values = components(catalog, reference, candidate, vector);
    const score = combine(values, weights);
    if (score >= minScore) scored.push({ id, score, components: values });
  }
  scored.sort((a, b) => b.score - a.score || a.id - b.id);

  const series = new Map<string, number>();
  for (const id of reference.seriesIds) series.set(id, 1);
  const picked: Recommendation[] = [];
  const pool = [...scored];
  while (picked.length < count && pool.length) {
    let best = 0;
    let bestValue = -Infinity;
    for (let i = 0; i < pool.length; i++) {
      let value = pool[i].score;
      if (mmrLambda < 1 && picked.length) {
        const own = catalog.descriptors.get(pool[i].id) ?? new Map();
        const closest = Math.max(
          ...picked.map((pick) =>
            cosine(own, catalog.descriptors.get(pick.id) ?? new Map()),
          ),
        );
        value = mmrLambda * value - (1 - mmrLambda) * closest;
      }
      if (value > bestValue) {
        bestValue = value;
        best = i;
      }
      // Sorted by score: without MMR the first one is the best
      if (mmrLambda >= 1) break;
    }
    const [choice] = pool.splice(best, 1);
    const candidate = catalog.games.get(choice.id)!;
    const full = candidate.seriesIds.some(
      (id) => (series.get(id) ?? 0) >= maxPerSeries,
    );
    if (full) continue;
    // Two picks with the same base title: the first one is enough
    if (
      picked.some((pick) => isVariant(catalog.games.get(pick.id)!, candidate))
    ) {
      continue;
    }
    for (const id of candidate.seriesIds)
      series.set(id, (series.get(id) ?? 0) + 1);
    picked.push(choice);
  }
  return picked;
}
