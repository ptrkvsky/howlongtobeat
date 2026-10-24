import assert from 'node:assert/strict';
import { test } from 'node:test';
import { byLength, splitFeatured } from './data';

const genre = (slug: string, count: number, median: number) => ({
  slug,
  label: slug,
  count,
  timed: count,
  median,
  bins: [0, 0, 0, 0, 0, 0],
});

const charted = [
  genre(`adventure`, 500, 7),
  genre(`indie`, 400, 6),
  genre(`rpg`, 300, 20),
  genre(`puzzle`, 200, 5),
  genre(`strategy`, 100, 24),
];

test(`featured genres skip the ones that are not a way of playing`, () => {
  const { featured, rest } = splitFeatured(charted, 3);
  assert.deepEqual(
    featured.map((g) => g.slug),
    [`adventure`, `rpg`, `puzzle`],
  );
  assert.deepEqual(
    rest.map((g) => g.slug),
    [`indie`, `strategy`],
  );
});

test(`shortest and longest are ranked by median`, () => {
  const { shortest, longest } = byLength(charted, 2);
  assert.deepEqual(
    shortest.map((g) => g.slug),
    [`puzzle`, `indie`],
  );
  assert.deepEqual(
    longest.map((g) => g.slug),
    [`strategy`, `rpg`],
  );
});
