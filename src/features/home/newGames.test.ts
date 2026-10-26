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

  it(`keeps the order of the list, up to ${NEW_GAMES_COUNT} games`, () => {
    const games = Array.from({ length: 12 }, (_, index) => ({
      slug: `game-${index}`,
      publishedAt: daysAgo(index),
    }));
    assert.deepEqual(
      newGames(games, builtAt).map((game) => game.slug),
      games.slice(0, NEW_GAMES_COUNT).map((game) => game.slug),
    );
  });
});
