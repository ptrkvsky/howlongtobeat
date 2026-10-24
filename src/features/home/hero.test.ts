import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { civilDate } from './finishDate';
import { FINISH_AT, calendarTicks, heroView, paceHint } from './hero';

const game = {
  name: `Elden Ring`,
  slug: `elden-ring`,
  main: 40,
  plus: 80,
  full: 140,
};
const day = civilDate(2026, 10, 24);

describe(`heroView`, () => {
  it(`dates the main story`, () => {
    const view = heroView(game, 7, day);
    assert.equal(view.date, `3 DÉC.`);
    assert.equal(view.dateLong, `3 décembre`);
    assert.equal(view.year, null);
    assert.equal(view.pace, `environ 6 semaines`);
  });

  it(`ends the main story on the flag, whatever its length`, () => {
    for (const main of [1, 3, 26, 40, 584])
      for (const pace of [3, 7, 15, 30]) {
        const [target] = heroView({ ...game, main }, pace, day).goals;
        assert.ok(Math.abs(target.length - FINISH_AT * 100) < 1e-9);
      }
  });

  it(`runs the longer goals past the ruler`, () => {
    const [, plus, full] = heroView(game, 7, day).goals;
    assert.ok(plus.length > 100 && full.length > plus.length);
    assert.equal(plus.endLabel, `12 janv. 2027`);
  });

  it(`gives the year of a date in another year`, () => {
    const view = heroView(game, 3, day);
    assert.equal(view.date, `26 JANV.`);
    assert.equal(view.year, 2027);
  });

  it(`falls back on the first known goal`, () => {
    const view = heroView({ ...game, main: 0, plus: 0 }, 7, day);
    assert.equal(view.goals.length, 1);
    assert.equal(view.target.key, `full`);
  });
});

describe(`calendarTicks`, () => {
  it(`names the month starts and the new year`, () => {
    const labels = calendarTicks(day, 120)
      .map((tick) => tick.label)
      .filter(Boolean);
    assert.deepEqual(labels, [`nov.`, `déc.`, `janv. 2027`, `févr.`]);
  });

  it(`keeps only the month starts past half a year, every other one named`, () => {
    const ticks = calendarTicks(day, 400);
    // November 2026 to November 2027
    assert.equal(ticks.length, 13);
    assert.equal(ticks.filter((tick) => tick.label).length, 7);
  });
});

describe(`paceHint`, () => {
  it(`writes the time per day`, () => {
    assert.equal(paceHint(3), `25 min par jour`);
    assert.equal(paceHint(7), `1 h par jour`);
    assert.equal(paceHint(15), `2 h 10 par jour`);
    assert.equal(paceHint(30), `4 h 15 par jour`);
  });
});
