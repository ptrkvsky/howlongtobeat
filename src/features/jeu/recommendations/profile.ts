/**
 * Gameplay profile of a game: the weighted descriptors (Steam tags, IGDB
 * keywords and themes) compared by the score, and the English document that
 * is embedded. Names, studios, platforms and dates are left out: two games
 * must not look alike because of a brand.
 */
import { createHash } from 'node:crypto';
import {
  IGNORED_DESCRIPTOR_WORDS,
  IGNORED_DESCRIPTORS,
  IGNORED_GENRES,
} from '../../../config/recommendations';
import type { GameFeatures } from './types';

// "Base-Building" and "base building" are the same descriptor
export const descriptor = (name: string) =>
  name
    .normalize(`NFKD`)
    .replace(/[̀-ͯ]/g, ``)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ` `)
    .trim();

const ignoredDescriptors = new Set(IGNORED_DESCRIPTORS.map(descriptor));
const ignoredWords = new RegExp(
  `\\b(${IGNORED_DESCRIPTOR_WORDS.map(descriptor).join(`|`)})\\b`,
);
const ignored = {
  has: (key: string) => ignoredDescriptors.has(key) || ignoredWords.test(key),
};
const ignoredGenres = new Set(IGNORED_GENRES);

const MAX_TAGS = 20;
// An IGDB keyword or theme counts as a tag with half of the top votes
const IGDB_WEIGHT = 0.5;

export const gameplayGenres = (game: GameFeatures) =>
  game.genres.filter((genre) => !ignoredGenres.has(genre));

// Descriptor → weight between 0 and 1: the share of the most voted tag
export function descriptors(game: GameFeatures) {
  const weights = new Map<string, number>();
  const add = (name: string, weight: number) => {
    const key = descriptor(name);
    if (!key || ignored.has(key)) return;
    weights.set(key, Math.max(weights.get(key) ?? 0, weight));
  };
  const tags = game.steamTags.slice(0, MAX_TAGS);
  const top = tags[0]?.votes ?? 0;
  for (const tag of tags) add(tag.name, top ? tag.votes / top : 0);
  for (const name of [...game.keywords, ...game.themes]) add(name, IGDB_WEIGHT);
  return weights;
}

const MAX_SUMMARY = 800;

// The name of the game would match its sequels and namesakes. Same case and
// whole words only: "Stray" is the game, "a stray" is not
export function cleanSummary(summary: string, name: string) {
  const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, `\\$&`);
  const text = summary
    .replace(new RegExp(`(?<![\\w])${escaped}(?![\\w])`, `g`), `the game`)
    .replace(/[*_#>`[\]]/g, ``)
    .replace(/\s+/g, ` `)
    .trim();
  if (text.length <= MAX_SUMMARY) return text;
  const cut = text.slice(0, MAX_SUMMARY);
  return cut.slice(0, cut.lastIndexOf(` `)) + `…`;
}

const line = (label: string, values: string[]) =>
  values.length ? `${label}: ${values.join(`, `)}` : null;

// null: too little known to compare the game (no tag, keyword nor summary)
export function buildProfile(game: GameFeatures): string | null {
  const tags = game.steamTags
    .slice(0, MAX_TAGS)
    .map((tag) => tag.name)
    .filter((name) => !ignored.has(descriptor(name)));
  const keywords = game.keywords.filter(
    (name) => !ignored.has(descriptor(name)),
  );
  const summary = game.summary ? cleanSummary(game.summary, game.name) : ``;
  if (!tags.length && !keywords.length && !summary) return null;
  return [
    line(`Genres`, gameplayGenres(game)),
    line(`Gameplay`, tags),
    line(`Keywords`, keywords),
    line(`Themes`, game.themes),
    line(`Modes`, game.gameModes),
    line(`Perspective`, game.perspectives),
    summary ? `Summary: ${summary}` : null,
  ]
    .filter(Boolean)
    .join(`\n`);
}

// An embedding is recomputed only when this changes
export const profileHash = (
  document: string,
  model: string,
  dimensions: number,
) =>
  createHash(`sha256`)
    .update(`${model}\n${dimensions}\n${document}`)
    .digest(`hex`);
