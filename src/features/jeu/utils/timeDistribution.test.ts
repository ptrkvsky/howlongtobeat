import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { binIndex, binLabel, timeBins } from './timeDistribution';

describe(`timeBins`, () => {
  it(`counts the known times in doubling bins`, () => {
    const bins = timeBins([1, 2, 3, 40, 40, 0, 900]);
    assert.deepEqual(
      bins.map((bin) => bin.count),
      [1, 1, 1, 0, 0, 0, 2, 0, 0, 1],
    );
  });

  it(`puts a time in the bin that includes it`, () => {
    assert.equal(binIndex(1), 0);
    assert.equal(binIndex(4), 2);
    assert.equal(binIndex(5), 3);
    assert.equal(binIndex(0), -1);
  });

  it(`names the bins`, () => {
    const bins = timeBins([]);
    assert.equal(binLabel(bins[0]), `1 h ou moins`);
    assert.equal(binLabel(bins[3]), `4 à 8 h`);
    assert.equal(binLabel(bins.at(-1)!), `plus de 256 h`);
  });
});
