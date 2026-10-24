// pnpm test: node's test runner, through tsx
import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  addDays,
  civilDate,
  daysBetween,
  finishDate,
  formatDay,
  formatIsoDay,
  nextMilestone,
  today,
} from './finishDate';

const iso = (date: Date | null) => date && formatIsoDay(date);

describe(`finishDate`, () => {
  it(`counts the days of play from the pace`, () => {
    // 40 h at 7 h a week: 40 days
    assert.equal(iso(finishDate(40, 7, civilDate(2026, 10, 24))), `2026-12-03`);
    // 40 h at 3 h a week: 94 days (93.3 rounded up)
    assert.equal(iso(finishDate(40, 3, civilDate(2026, 10, 24))), `2027-01-26`);
  });

  it(`takes at least one day`, () => {
    assert.equal(iso(finishDate(1, 30, civilDate(2026, 10, 24))), `2026-10-25`);
  });

  it(`has no date without a time or a pace`, () => {
    const from = civilDate(2026, 10, 24);
    assert.equal(finishDate(0, 7, from), null);
    assert.equal(finishDate(Number.NaN, 7, from), null);
    assert.equal(finishDate(-5, 7, from), null);
    assert.equal(finishDate(40, 0, from), null);
  });

  it(`crosses the end of the year`, () => {
    assert.equal(iso(finishDate(10, 7, civilDate(2026, 12, 28))), `2027-01-07`);
  });

  it(`counts February 29 in a leap year`, () => {
    assert.equal(iso(addDays(civilDate(2028, 2, 28), 1)), `2028-02-29`);
    assert.equal(iso(addDays(civilDate(2027, 2, 28), 1)), `2027-03-01`);
  });

  it(`ignores the time changes`, () => {
    // Paris goes back to winter time on October 25, 2026
    assert.equal(iso(addDays(civilDate(2026, 10, 24), 2)), `2026-10-26`);
    assert.equal(
      daysBetween(civilDate(2026, 3, 28), civilDate(2026, 3, 30)),
      2,
    );
  });

  it(`handles games of several years`, () => {
    // 584 h at 3 h a week: 1,363 days
    assert.equal(
      iso(finishDate(584, 3, civilDate(2026, 10, 24))),
      `2030-07-18`,
    );
  });
});

describe(`today`, () => {
  it(`is the day of the time zone`, () => {
    // 23:30 UTC on December 31 is already January 1 in Paris
    const now = new Date(`2026-12-31T23:30:00Z`);
    assert.equal(iso(today(`Europe/Paris`, now)), `2027-01-01`);
    assert.equal(iso(today(`UTC`, now)), `2026-12-31`);
    assert.equal(iso(today(`America/New_York`, now)), `2026-12-31`);
  });
});

describe(`formatDay`, () => {
  const from = civilDate(2026, 10, 24);

  it(`leaves the year out within the same year`, () => {
    assert.equal(formatDay(civilDate(2026, 12, 3), from), `3 décembre`);
    assert.equal(formatDay(civilDate(2026, 12, 3), from, `short`), `3 déc.`);
  });

  it(`adds the year of a later year`, () => {
    assert.equal(formatDay(civilDate(2027, 1, 12), from), `12 janvier 2027`);
    assert.equal(
      formatDay(civilDate(2027, 1, 12), from, `short`),
      `12 janv. 2027`,
    );
  });

  it(`writes the day whatever the time zone of the machine`, () => {
    assert.equal(formatDay(civilDate(2026, 11, 1), from), `1 novembre`);
  });
});

describe(`nextMilestone`, () => {
  it(`is Christmas in late October`, () => {
    const milestone = nextMilestone(civilDate(2026, 10, 24));
    assert.equal(milestone.label, `Noël`);
    assert.equal(iso(milestone.date), `2026-12-25`);
    assert.equal(milestone.days, 62);
  });

  it(`skips a milestone less than three weeks away`, () => {
    const milestone = nextMilestone(civilDate(2026, 12, 10));
    assert.equal(milestone.label, `le printemps`);
    assert.equal(iso(milestone.date), `2027-03-20`);
  });

  it(`keeps a milestone exactly three weeks away`, () => {
    assert.equal(nextMilestone(civilDate(2026, 12, 4)).label, `Noël`);
  });

  it(`goes to the next year after Christmas`, () => {
    const milestone = nextMilestone(civilDate(2026, 12, 31));
    assert.equal(iso(milestone.date), `2027-03-20`);
    assert.equal(milestone.days, 79);
  });

  it(`moves on the day of a milestone`, () => {
    assert.equal(nextMilestone(civilDate(2027, 6, 21)).label, `la rentrée`);
  });
});
