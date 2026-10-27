import assert from 'node:assert/strict';
import { describe, it, mock } from 'node:test';
import { normalize, search } from './searchIndex';

describe(`normalize`, () => {
  it(`strips accents, case and punctuation`, () => {
    assert.equal(normalize(`Pokémon: Épée`), `pokemon epee`);
  });
});

describe(`search`, () => {
  const entries: Array<[string, number, number, number]> = [
    [`The Legend of Zelda`, 10, 20, 30],
    [`Zelda II`, 5, 10, 15],
    [`Breath of the Wild Zelda`, 15, 25, 35],
    [`Unrelated Game`, 1, 2, 3],
  ];

  it(`ranks name starts first, then word starts, then substrings`, async () => {
    mock.method(globalThis, `fetch`, () =>
      Promise.resolve({ json: () => Promise.resolve(entries) } as Response),
    );
    const found = await search(`zelda`);
    assert.deepEqual(
      found.map(([name]) => name),
      [`Zelda II`, `The Legend of Zelda`, `Breath of the Wild Zelda`],
    );
    mock.reset();
  });
});
