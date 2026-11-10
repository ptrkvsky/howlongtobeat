import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { NEW_GAMES_COUNT, newGames } from './newGames';

const builtAt = new Date(`2026-10-26T03:00:00Z`);
const daysAgo = (days: number) =>
  new Date(builtAt.getTime() - days * 86_400_000).toISOString();

describe(`newGames`, () => {
  it(`keeps the games published in the last 30 days`, () => {
    const games = [
      { slug: `today`, publishedAt: daysAgo(0) },
      { slug: `limit`, publishedAt: daysAgo(30) },
      { slug: `too-old`, publishedAt: daysAgo(31) },
      { slug: `legacy`, publishedAt: null },
    ];
    assert.deepEqual(
      newGames(games, builtAt).map((game) => game.slug),
      [`today`, `limit`],
    );
  });

  it(`keeps the order of the list within a day, up to ${NEW_GAMES_COUNT} games`, () => {
    const games = Array.from({ length: 12 }, (_, index) => ({
      slug: `game-${index}`,
      publishedAt: daysAgo(0),
    }));
    assert.deepEqual(
      newGames(games, builtAt).map((game) => game.slug),
      games.slice(0, NEW_GAMES_COUNT).map((game) => game.slug),
    );
  });

  it(`puts the latest publication day first, ahead of an older big batch`, () => {
    const batch = Array.from({ length: 20 }, (_, index) => ({
      slug: `batch-${index}`,
      publishedAt: daysAgo(14),
    }));
    const games = [...batch, { slug: `recent`, publishedAt: daysAgo(1) }];
    const slugs = newGames(games, builtAt).map((game) => game.slug);
    assert.equal(slugs[0], `recent`);
    assert.equal(slugs.length, NEW_GAMES_COUNT);
  });
});
