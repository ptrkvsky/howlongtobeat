import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { authorsWithCounts, catalogStats, median } from './data';

const times = (main: number, plus: number, full: number) => ({
  main: { hours: main, count: 2 },
  plus: { hours: plus, count: 1 },
  full: { hours: full, count: 1 },
});

const game = (
  main: number,
  plus: number,
  full: number,
  platforms: string[] = [],
  withHltb = true,
) => ({
  timeMainStory: main,
  timeMainExtras: plus,
  timeCompletionists: full,
  identity: { platforms },
  hltb: withHltb
    ? {
        players: 0,
        completed: 0,
        playing: 0,
        backlog: 0,
        times: times(main, plus, full),
        mainMedian: 0,
        updatedAt: ``,
      }
    : null,
});

describe(`median`, () => {
  it(`takes the middle value, or the rounded mean of the two middle ones`, () => {
    assert.equal(median([9, 1, 5]), 5);
    assert.equal(median([1, 2, 4, 9]), 3);
    assert.equal(median([]), 0);
  });
});

describe(`catalogStats`, () => {
  const stats = catalogStats([
    game(10, 20, 40, [`PC`, `PlayStation 5`]),
    game(4, 0, 0, [`PC`]),
    game(30, 50, 0, [], false),
  ]);

  it(`counts the games and the games with each time`, () => {
    assert.equal(stats.games, 3);
    assert.deepEqual(stats.timed, { main: 3, plus: 2, full: 1 });
  });

  it(`ignores the missing times in the medians`, () => {
    assert.deepEqual(stats.medians, { main: 10, plus: 35, full: 40 });
  });

  it(`adds the HowLongToBeat submissions of the games that have them`, () => {
    assert.equal(stats.submissions, 8);
  });

  it(`counts each platform once`, () => {
    assert.equal(stats.platforms, 2);
  });
});

describe(`authorsWithCounts`, () => {
  it(`lists every author with their article count`, () => {
    const result = authorsWithCounts([
      { author: `lea-moreau` },
      { author: `lea-moreau` },
      { author: `ines-bakri` },
    ]);
    assert.deepEqual(
      result.map((author) => [author.slug, author.articles]),
      [
        [`lea-moreau`, 2],
        [`thomas-ferrand`, 0],
        [`ines-bakri`, 1],
      ],
    );
  });
});
