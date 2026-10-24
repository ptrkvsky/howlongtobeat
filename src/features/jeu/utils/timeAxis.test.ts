import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { timeAxis } from './timeAxis';

describe(`timeAxis`, () => {
  it(`ends on the longest time when it is round`, () => {
    assert.deepEqual(timeAxis(140), {
      max: 140,
      step: 20,
      ticks: [0, 20, 40, 60, 80, 100, 120, 140],
    });
  });

  it(`ends at the next tick past the longest time`, () => {
    const axis = timeAxis(387);
    assert.equal(axis.step, 50);
    assert.equal(axis.max, 400);
  });

  it(`keeps a few hours for the short games`, () => {
    assert.deepEqual(timeAxis(1).ticks, [0, 1, 2, 3, 4, 5]);
    assert.equal(timeAxis(3).max, 5);
  });

  it(`scales to the longest games`, () => {
    const axis = timeAxis(2199);
    assert.equal(axis.step, 500);
    assert.equal(axis.max, 2500);
    assert.ok(axis.ticks.length - 1 <= 8);
  });

  it(`has no axis without a time`, () => {
    assert.deepEqual(timeAxis(0).ticks, []);
  });
});
