import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { nextScanId, SCAN_START, type ScanRecord } from './hltb-scan';

const record = (id: number, status: ScanRecord[`status`]): ScanRecord => ({
  id,
  status,
  game: null,
  fetchedAt: `2026-11-05T00:00:00.000Z`,
});

describe(`nextScanId`, () => {
  it(`starts above the ids of the Wikidata pages with an empty cache`, () => {
    assert.equal(nextScanId(new Map()), SCAN_START);
  });

  it(`resumes after the last existing page`, () => {
    const records = new Map(
      [record(SCAN_START, `ok`), record(SCAN_START + 1, `ok`)].map((r) => [
        r.id,
        r,
      ]),
    );
    assert.equal(nextScanId(records), SCAN_START + 2);
  });

  it(`reads again the missing ids that ended the previous run`, () => {
    // A new game may have been given one of them since
    const records = new Map(
      [
        record(SCAN_START, `ok`),
        record(SCAN_START + 1, `not_found`),
        record(SCAN_START + 2, `empty`),
      ].map((r) => [r.id, r]),
    );
    assert.equal(nextScanId(records), SCAN_START + 1);
  });
});
