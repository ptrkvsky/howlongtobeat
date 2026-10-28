import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Game } from '@/types/Game';
import { buildIndex, relatedOf } from './getRelatedGames';

const genres = [
  { id: 1, name: `Adventure` },
  { id: 2, name: `Indie` },
  { id: 3, name: `Simulator` },
  { id: 4, name: `Strategy` },
  { id: 5, name: `Shooter` },
  { id: 6, name: `Role-playing (RPG)` },
];
const game = (id: number, genreIds: number[], rating = 85, time = 10) =>
  ({ id, name: `Game ${id}`, genreIds, rating, timeMainStory: time }) as Game;

test(`the computed recommendations come first, in their order`, () => {
  const games = [game(1, [5, 6]), game(2, [5, 6]), game(3, [5]), game(4, [6])];
  const index = buildIndex(games, genres, new Map([[1, [4, 3]]]));
  assert.deepEqual(
    relatedOf(games[0], index).map(({ id }) => id),
    [4, 3],
  );
});

test(`an unpublished recommendation is skipped`, () => {
  const games = [game(1, [5]), game(2, [5])];
  const index = buildIndex(games, genres, new Map([[1, [99, 2]]]));
  assert.deepEqual(
    relatedOf(games[0], index).map(({ id }) => id),
    [2],
  );
});

test(`without recommendations, the games sharing two genres`, () => {
  const games = [
    game(1, [5, 6]),
    game(2, [5, 6]),
    // One genre only in common: no link
    game(3, [5]),
    // Shares two genres but rated under 80
    game(4, [5, 6], 70),
  ];
  const index = buildIndex(games, genres, new Map());
  assert.deepEqual(
    relatedOf(games[0], index).map(({ id }) => id),
    [2],
  );
});

test(`the filler genres of 2021 link nothing`, () => {
  const filler = [1, 2, 3, 4];
  const games = [game(1, filler), game(2, filler), game(3, filler)];
  const index = buildIndex(games, genres, new Map());
  assert.deepEqual(relatedOf(games[0], index), []);
});

test(`a game without genres nor recommendations gets nothing, not filler`, () => {
  const games = [game(1, []), game(2, [5, 6]), game(3, [5, 6])];
  const index = buildIndex(games, genres, new Map());
  assert.deepEqual(relatedOf(games[0], index), []);
});
