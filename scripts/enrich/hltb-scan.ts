/**
 * Incremental walk over the HLTB game pages above a cursor: HLTB numbers its
 * games in creation order, so the pages of games added since the last run are
 * the ids above the last one read. Reads /game/<id> only (see hltb.ts), at the
 * pace of http.ts. Every page is kept in a JSONL file: a run resumes where the
 * previous one stopped.
 *
 * It finds the games created recently, not the old HLTB entries of a game
 * that was released recently: those have a low id and go through the review
 * file of scripts/import-recent.ts (--hltb-id).
 */
import { appendFileSync, existsSync, readFileSync } from 'node:fs';
import { errorMessage } from './http';
import { getHltbGame, HltbStructureError, type HltbGame } from './hltb';

// Above the highest id of .import/pages.jsonl (the ids with a Wikidata item)
export const SCAN_START = 172_959;
// The numbering stops at the newest game: this many missing ids in a row
// end the walk (a few isolated ids are deleted or merged games)
export const END_AFTER_MISSING = 30;
const MAX_ERRORS_IN_A_ROW = 3;

export interface ScanRecord {
  id: number;
  status: `ok` | `not_found` | `empty`;
  game: HltbGame | null;
  fetchedAt: string;
}

export function readScan(file: string) {
  const records = new Map<number, ScanRecord>();
  if (!existsSync(file)) return records;
  for (const line of readFileSync(file, `utf8`).split(`\n`)) {
    if (!line) continue;
    const record = JSON.parse(line) as ScanRecord;
    records.set(record.id, record);
  }
  return records;
}

// The walk restarts after the last existing page: the missing ids that ended
// the previous run may have been given to a new game since
export function nextScanId(records: ReadonlyMap<number, ScanRecord>) {
  let lastExisting = SCAN_START - 1;
  for (const record of records.values()) {
    if (record.status === `ok` && record.id > lastExisting) {
      lastExisting = record.id;
    }
  }
  return lastExisting + 1;
}

export interface ScanResult {
  read: number;
  nextId: number;
  // The newest game was reached: nothing above it yet
  reachedEnd: boolean;
}

export async function scanHltbIds({
  file,
  limit = Infinity,
}: {
  file: string;
  // Pages to read in this run
  limit?: number;
}): Promise<ScanResult> {
  const records = readScan(file);
  let id = nextScanId(records);
  let read = 0;
  let missingInARow = 0;
  let errorsInARow = 0;
  let reachedEnd = false;

  while (read < limit) {
    let result;
    try {
      result = await getHltbGame(id);
      errorsInARow = 0;
    } catch (error) {
      if (error instanceof HltbStructureError) throw error;
      console.warn(`⚠ scan ${id}: ${errorMessage(error)}`);
      // HLTB or the network is down: the next run resumes from here
      if (++errorsInARow >= MAX_ERRORS_IN_A_ROW) break;
      continue;
    }
    read += 1;
    const record: ScanRecord = {
      id,
      status: result.status,
      game: result.status === `ok` ? result.game : null,
      fetchedAt: new Date().toISOString(),
    };
    appendFileSync(file, `${JSON.stringify(record)}\n`);
    id += 1;
    missingInARow = result.status === `ok` ? 0 : missingInARow + 1;
    if (missingInARow >= END_AFTER_MISSING) {
      reachedEnd = true;
      break;
    }
    if (read % 100 === 0) console.info(`… scan ${read} pages, at id ${id}`);
  }
  return { read, nextId: id, reachedEnd };
}
