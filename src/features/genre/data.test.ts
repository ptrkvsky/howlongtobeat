import assert from 'node:assert/strict';
import { test } from 'node:test';
import type { Game } from '@/types/Game';
import { lengthShares, similarGenres, timedExtremes } from './data';

const game = (slug: string, time: number) =>
  ({
    slug,
    timeMainStory: time,
  }) as Game;

const genre = (slug: string, count: number, median: number) => ({
  slug,
  label: slug,
  count,
  timed: count,
  median,
  bins: [0, 0, 0, 0, 0, 0],
});

test(`shares come from the bins of the home`, () => {
  // 24 under 5 h, 6 from 5 to 10 h, 14, 15, 5 from 40 to 80 h, 0 over
  assert.deepEqual(lengthShares([24, 6, 14, 15, 5, 0], 64), {
    underTen: 47,
    overForty: 8,
  });
  assert.deepEqual(lengthShares([0, 0, 0, 0, 0, 0], 0), {
    underTen: 0,
    overForty: 0,
  });
});

test(`extremes skip the games without a time`, () => {
  const games = [
    game(`a`, 10),
    game(`none`, 0),
    game(`b`, 2),
    game(`c`, 50),
    game(`d`, 2),
  ];
  const { shortest, longest } = timedExtremes(games, 2);
  assert.deepEqual(
    shortest.map((g) => g.slug),
    [`b`, `d`],
  );
  assert.deepEqual(
    longest.map((g) => g.slug),
    [`c`, `a`],
  );
});

test(`similar genres are the closest in median, never the genre itself`, () => {
  const charted = [
    genre(`vn`, 74, 12),
    genre(`rpg`, 762, 20),
    genre(`music`, 46, 6),
    genre(`sport`, 76, 7),
    genre(`rts`, 47, 13),
  ];
  assert.deepEqual(
    similarGenres(charted[0], charted, 2).map((g) => g.slug),
    [`rts`, `sport`],
  );
});
