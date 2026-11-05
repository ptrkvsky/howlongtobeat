/**
 * Recent games that have no HowLongToBeat id on Wikidata yet (editors add
 * P2816 weeks after a release): they never reach scripts/import-games.ts.
 * Run every two days by scripts/recent.sh.
 *
 * 1. Walk the HLTB game pages above the last id read (enrich/hltb-scan.ts).
 * 2. Wikidata: games released in the last --days with at least --min-sitelinks
 *    Wikipedia pages and no P2816.
 * 3. Match them with the pages read (lib/match-recent.ts): same Steam id, or
 *    same name and release month. Anything less sure goes to the review file.
 * 4. The popularity threshold of enrich/threshold.ts, unchanged, then insert
 *    the games that pass as unpublished imports (source = import): the usual
 *    steps (scripts/update-catalog.sh) enrich, translate and publish them.
 *
 *   pnpm tsx scripts/import-recent.ts [--dry-run] [--scan-limit 3000]
 *   pnpm tsx scripts/import-recent.ts --hltb-id 181987 [--force]
 *
 * --dry-run     writes the CSV files, nothing in the database
 * --scan-limit  pages read by the walk in this run (default 3000, ~100 min;
 *               the first catch-up above 172,959 is ~19,000 pages: repeat it,
 *               or pass a larger limit once)
 * --no-scan     skip the walk
 * --hltb-id     add a game by hand (repeatable): same threshold, --force
 *               skips it (GTA VI has no completion before its release)
 *
 * Files in .import/: scan.jsonl (pages read), selected-recent.csv (games that
 * pass), review-recent.csv (games to match by hand).
 *
 * Env (.env.local / .env): DATABASE_URL
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { closeDb, getDb } from '../src/db/client';
import { game } from '../src/db/schema';
import { checkHltb, getHltbGame, type HltbGame } from './enrich/hltb';
import { scanHltbIds, readScan } from './enrich/hltb-scan';
import { errorMessage, requestCounts } from './enrich/http';
import { getSteamReviews } from './enrich/steam';
import { passes, passesWithoutSteam } from './enrich/threshold';
import {
  getRecentGamesWithoutHltb,
  type WikidataRecentGame,
} from './enrich/wikidata';
import { createNamer, csvCell, insertImportedGame } from './lib/hltb-import';
import { matchRecent } from './lib/match-recent';

for (const file of [`.env.local`, `.env`]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const { values: args } = parseArgs({
  options: {
    'dry-run': { type: `boolean`, default: false },
    'no-scan': { type: `boolean`, default: false },
    'scan-limit': { type: `string`, default: `3000` },
    days: { type: `string`, default: `120` },
    'min-sitelinks': { type: `string`, default: `5` },
    'hltb-id': { type: `string`, multiple: true, default: [] },
    force: { type: `boolean`, default: false },
    // A page read this long ago is read again before the threshold decides
    'max-age': { type: `string`, default: `7` },
  },
});

const dryRun = args[`dry-run`];
const maxAgeMs = Number(args[`max-age`]) * 86_400_000;
const OUTPUT_DIR = join(process.cwd(), `.import`);
const SCAN_FILE = join(OUTPUT_DIR, `scan.jsonl`);
const SELECTED_FILE = join(OUTPUT_DIR, `selected-recent.csv`);
const REVIEW_FILE = join(OUTPUT_DIR, `review-recent.csv`);

interface Selected {
  hltb: HltbGame;
  wikidata: WikidataRecentGame | null;
  reason: string;
  sitelinks: number | null;
  steamReviews: number | null;
}

interface Review {
  wikidata: WikidataRecentGame | null;
  reason: string;
  hltb: HltbGame[];
}

// The page of a game, read again when the walk read it a while ago: players
// join fast in the first weeks and decide the threshold
async function freshPage(hltb: HltbGame, readAt: string) {
  if (Date.now() - new Date(readAt).getTime() < maxAgeMs) return hltb;
  const result = await getHltbGame(hltb.id);
  return result.status === `ok` ? result.game : hltb;
}

async function decide(
  hltb: HltbGame,
  sitelinks: number | null,
): Promise<{ passes: boolean; steamReviews: number | null }> {
  const signals = {
    type: hltb.type,
    compMainCount: hltb.compMainCount,
    countTotal: hltb.countTotal,
    sitelinks,
  };
  let steamReviews: number | null = null;
  // Steam only when the HLTB and Wikipedia signals are not enough
  if (passesWithoutSteam(signals) === undefined && hltb.steam) {
    try {
      steamReviews = (await getSteamReviews(hltb.steam))?.total ?? null;
    } catch (error) {
      console.warn(`⚠ steam ${hltb.steam}: ${errorMessage(error)}`);
    }
  }
  return { passes: passes({ ...signals, steamReviews }), steamReviews };
}

async function importRecent() {
  const { db } = getDb();
  mkdirSync(OUTPUT_DIR, { recursive: true });
  await checkHltb();

  const existing = await db
    .select({ hltbId: game.hltbId, slug: game.slug, name: game.name })
    .from(game);
  const knownHltb = new Set(existing.map((row) => row.hltbId));
  const naming = createNamer(existing);

  if (!args[`no-scan`] && args[`hltb-id`].length === 0) {
    const scan = await scanHltbIds({
      file: SCAN_FILE,
      limit: Number(args[`scan-limit`]),
    });
    console.info(
      `scan: ${scan.read} pages read, next id ${scan.nextId}${scan.reachedEnd ? ` (newest game reached)` : ` (more to read)`}`,
    );
  }

  const records = [...readScan(SCAN_FILE).values()].filter(
    (record): record is typeof record & { game: HltbGame } =>
      record.status === `ok` && record.game !== null,
  );
  const readAt = new Map(
    records.map((record) => [record.id, record.fetchedAt]),
  );
  const scanned = records.map((record) => record.game);

  const candidates = await getRecentGamesWithoutHltb({
    days: Number(args.days),
    minSitelinks: Number(args[`min-sitelinks`]),
  });
  console.info(
    `${candidates.length} recent Wikidata games without an HLTB id, ${scanned.length} HLTB pages read by the walk`,
  );

  const selected: Selected[] = [];
  const review: Review[] = [];
  const claimed = new Set<number>();

  for (const wikidata of candidates) {
    const match = matchRecent(wikidata, scanned);
    if (match.kind === `none`) {
      review.push({
        wikidata,
        reason: `no HLTB page found in the pages read`,
        hltb: [],
      });
      continue;
    }
    if (match.kind === `uncertain`) {
      review.push({ wikidata, reason: match.reason, hltb: match.hltb });
      continue;
    }
    if (knownHltb.has(match.hltb.id) || claimed.has(match.hltb.id)) continue;
    let hltb: HltbGame;
    try {
      hltb = await freshPage(match.hltb, readAt.get(match.hltb.id) ?? ``);
    } catch (error) {
      console.warn(`⚠ ${match.hltb.id}: ${errorMessage(error)}`);
      continue;
    }
    const verdict = await decide(hltb, wikidata.sitelinks);
    if (!verdict.passes) continue;
    claimed.add(hltb.id);
    selected.push({
      hltb,
      wikidata,
      reason: match.reason,
      sitelinks: wikidata.sitelinks,
      steamReviews: verdict.steamReviews,
    });
  }

  // Pages the walk read that pass on HLTB signals alone, with no Wikidata item
  // to confirm them: not inserted, listed for a look
  const matchedIds = new Set(selected.map((row) => row.hltb.id));
  for (const hltb of scanned) {
    if (knownHltb.has(hltb.id) || matchedIds.has(hltb.id)) continue;
    const wikidataMatch = candidates.some(
      (wikidata) => matchRecent(wikidata, [hltb]).kind !== `none`,
    );
    if (
      !wikidataMatch &&
      passesWithoutSteam({
        type: hltb.type,
        compMainCount: hltb.compMainCount,
        countTotal: hltb.countTotal,
        sitelinks: null,
      }) === true
    ) {
      review.push({
        wikidata: null,
        reason: `passes on HLTB signals, no recent Wikidata item`,
        hltb: [hltb],
      });
    }
  }

  // By hand: same threshold, unless --force
  for (const raw of args[`hltb-id`]) {
    const id = Number(raw);
    if (!Number.isInteger(id) || id <= 0) {
      console.warn(`⚠ --hltb-id ${raw}: not an id`);
      continue;
    }
    if (knownHltb.has(id) || claimed.has(id)) {
      console.warn(`⚠ ${id}: already in the catalog`);
      continue;
    }
    const result = await getHltbGame(id);
    if (result.status !== `ok`) {
      console.warn(`⚠ ${id}: ${result.status} on HLTB`);
      continue;
    }
    const hltb = result.game;
    // Wikipedia pages from the matching Wikidata item, when it is in the list
    const wikidata =
      candidates.find(
        (candidate) => matchRecent(candidate, [hltb]).kind === `sure`,
      ) ?? null;
    const verdict = await decide(hltb, wikidata?.sitelinks ?? null);
    if (!verdict.passes && !args.force) {
      console.warn(
        `⚠ ${id} ${hltb.name}: below the threshold (main ${hltb.compMainCount}, players ${hltb.countTotal}), --force to add it anyway`,
      );
      continue;
    }
    claimed.add(id);
    selected.push({
      hltb,
      wikidata,
      reason: verdict.passes ? `by hand` : `by hand, forced`,
      sitelinks: wikidata?.sitelinks ?? null,
      steamReviews: verdict.steamReviews,
    });
  }

  let inserted = 0;
  const rows: unknown[][] = [];
  for (const row of selected) {
    const { name, slug, homonym } = naming(row.hltb);
    rows.push([
      row.hltb.id,
      name,
      slug,
      homonym ? `yes` : ``,
      row.reason,
      row.wikidata?.qid,
      row.sitelinks,
      row.hltb.type,
      row.hltb.countTotal,
      row.hltb.compMainCount,
      row.steamReviews,
      Math.round(row.hltb.compMain / 3600),
      row.hltb.releaseWorld,
    ]);
    if (dryRun) continue;
    await insertImportedGame(row.hltb, name, slug);
    inserted += 1;
    console.info(
      `+ ${name} (${row.hltb.id}) → ${slug}${homonym ? ` ⚠ homonym` : ``} [${row.reason}]`,
    );
  }

  writeFileSync(
    SELECTED_FILE,
    [
      `hltb,name,slug,homonym,match,qid,sitelinks,type,players,main_count,steam_reviews,main_h,release`,
      ...rows.map((row) => row.map(csvCell).join(`,`)),
    ].join(`\n`),
  );
  writeFileSync(
    REVIEW_FILE,
    [
      `qid,wikidata_name,wikidata_date,sitelinks,steam,reason,hltb_candidates`,
      ...review.map((row) =>
        [
          row.wikidata?.qid,
          row.wikidata?.label,
          row.wikidata?.date,
          row.wikidata?.sitelinks,
          row.wikidata?.steam,
          row.reason,
          row.hltb
            .map(
              (hltb) =>
                `${hltb.id} ${hltb.name} (${hltb.releaseWorld}, steam ${hltb.steam || `-`})`,
            )
            .join(` | `),
        ]
          .map(csvCell)
          .join(`,`),
      ),
    ].join(`\n`),
  );
  console.info(
    `${selected.length} games pass, ${dryRun ? `nothing written (dry run)` : `${inserted} inserted`}, ${review.length} to review → ${SELECTED_FILE}, ${REVIEW_FILE}`,
    Object.fromEntries(requestCounts),
  );
}

importRecent()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
