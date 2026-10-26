import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { sharedImageIds } from './igdbImage';

describe(`sharedImageIds`, () => {
  it(`keeps the image ids found on several games, whatever their size`, () => {
    assert.deepEqual(
      sharedImageIds([
        `//images.igdb.com/igdb/image/upload/t_720p/co3gzq.jpg`,
        `//images.igdb.com/igdb/image/upload/t_thumb/co3gzq.jpg`,
        `//images.igdb.com/igdb/image/upload/t_720p/co1lat.jpg`,
        `test`,
        `test`,
        null,
        null,
      ]),
      new Set([`co3gzq`]),
    );
  });
});
