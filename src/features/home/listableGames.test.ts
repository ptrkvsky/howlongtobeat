import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { listableGames } from './listableGames';
import { newGames } from './newGames';

const game = (
  name: string,
  popularity: number,
  publishedAt: string | null = null,
) => ({
  name,
  popularity,
  publishedAt,
  cover: name,
  timeMainStory: 30,
});

describe(`listableGames`, () => {
  it(`keeps GTA VI among new games when GTA V is more popular`, () => {
    const games = [
      game(`Grand Theft Auto V`, 2_000_000),
      game(`Grand Theft Auto VI`, 1_856, `2026-11-20T20:21:30Z`),
      game(`Older addition`, 100_000, `2026-11-14T15:00:00Z`),
    ];
    const recent = newGames(
      listableGames(games),
      new Date(`2026-11-20T21:00:00Z`),
    );
    assert.deepEqual(
      recent.map(({ name }) => name),
      [`Grand Theft Auto VI`, `Older addition`],
    );
  });

  it(`keeps numbered sequels regardless of their popularity order`, () => {
    for (const names of [
      [`Grand Theft Auto V`, `Grand Theft Auto VI`, `Grand Theft Auto VII`],
      [`Final Fantasy I`, `Final Fantasy II`, `Final Fantasy III`],
    ]) {
      for (const order of [names, [...names].reverse()]) {
        const games = order.map((name, index) => game(name, 100 - index));
        assert.deepEqual(
          listableGames(games).map(({ name }) => name),
          order,
        );
      }
    }
  });

  it(`still groups editions and keeps the most popular one`, () => {
    const games = [
      game(`The Witcher 3: Wild Hunt`, 100),
      game(`The Witcher 3: Wild Hunt - Game of the Year Edition`, 200),
    ];
    assert.deepEqual(
      listableGames(games).map(({ name }) => name),
      [`The Witcher 3: Wild Hunt - Game of the Year Edition`],
    );
  });
});
