/**
 * POC: cross the published games with Wikidata, IGDB, Steam and
 * IsThereAnyDeal to measure match rates and data coverage. Nothing is written
 * to the database: the output is a JSONL file to review and a summary.
 *
 * Enrich the most popular published games:
 *   pnpm tsx scripts/enrich-games.ts --limit 50 [--offset 0] [--out <file>]
 * Only some sources:
 *   pnpm tsx scripts/enrich-games.ts --sources wikidata,steam
 * Print the summary of an existing file:
 *   pnpm tsx scripts/enrich-games.ts --summary <file>
 *
 * Passing an existing `--out` file resumes a run: games already in it are
 * skipped, unless they had errors.
 *
 * Steps: ids (Wikidata exact match on idHltb + IGDB name match, compared)
 * then, for games with a Steam app id: reviews, achievements, prices.
 *
 * Games are taken by rating (the former HLTB popularity, totalPoll, was stale).
 *
 * Env (.env.local / .env): DATABASE_URL,
 * IGDB_CLIENT_ID + IGDB_CLIENT_SECRET (Twitch app, falls back to CLIENT_ID /
 * CLIENT_SECRET), ITAD_API_KEY, STEAM_API_KEY (optional: achievement names)
 */
import { appendFileSync, existsSync, mkdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { desc, eq, sql } from 'drizzle-orm';
import { closeDb, getDb } from '../src/db/client';
import { game as gameTable } from '../src/db/schema';
import { errorMessage, requestCounts } from './enrich/http';
import { resolveIds, type Status } from './enrich/ids';
import {
  findIgdbGame,
  hasIgdbCredentials,
  type IgdbMatch,
  type IgdbResult,
} from './enrich/igdb';
import { getPrices, type Price } from './enrich/itad';
import {
  getSteamAchievements,
  getSteamReviews,
  type SteamAchievements,
  type SteamReviews,
} from './enrich/steam';
import {
  checkWikidata,
  getWikidataIds,
  type WikidataIds,
} from './enrich/wikidata';

for (const file of [`.env.local`, `.env`]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const SOURCES = [`wikidata`, `igdb`, `steam`, `itad`] as const;
type Source = (typeof SOURCES)[number];

const { values: args } = parseArgs({
  options: {
    limit: { type: `string`, default: `50` },
    offset: { type: `string`, default: `0` },
    sources: { type: `string`, default: SOURCES.join(`,`) },
    'chunk-size': { type: `string`, default: `20` },
    out: { type: `string` },
    summary: { type: `string` },
  },
});

const OUTPUT_DIR = join(process.cwd(), `.enrichment`);

interface Game {
  // game.id as a string, the key of the JSONL entries
  _id: string;
  name: string;
  idHltb: number;
  timeMainStory: number;
  timeMainExtras: number;
  timeCompletionists: number;
}

interface Ids {
  status: Status;
  steamAppId: number | null;
  // Which source(s) gave the Steam app id
  steamFrom: `both` | `wikidata` | `igdb` | null;
  // Wikidata IGDB slug === IGDB match slug (null when one is missing)
  igdbAgreement: boolean | null;
  wikidata: WikidataIds | null;
  // The match, or the closest search result when nothing matched exactly
  igdb: IgdbMatch | { closest?: string } | null;
}

interface Entry extends Game {
  ids: Ids;
  steam: {
    reviews: SteamReviews | null;
    achievements: SteamAchievements | null;
  } | null;
  price: Price | null;
  derived: {
    completionRate: number | null;
    pricePerHour: number | null;
    lowestPricePerHour: number | null;
  };
  errors: string[];
}

function readEntries(file: string) {
  const entries = new Map<string, Entry>();
  const content = readFileSync(file, `utf8`).trim();
  // Last line wins: retries are appended after the first attempt
  for (const line of content ? content.split(`\n`) : []) {
    const entry = JSON.parse(line) as Entry;
    entries.set(entry._id, entry);
  }
  return entries;
}

function enabledSources() {
  const sources = new Set(
    args.sources!.split(`,`).map((source) => source.trim()) as Source[],
  );
  for (const source of sources) {
    if (!SOURCES.includes(source)) throw new Error(`Unknown source ${source}`);
  }
  if (sources.has(`igdb`) && !hasIgdbCredentials()) {
    console.warn(`⚠ igdb skipped: IGDB_CLIENT_ID / IGDB_CLIENT_SECRET not set`);
    sources.delete(`igdb`);
  }
  if (sources.has(`itad`) && !process.env.ITAD_API_KEY) {
    console.warn(`⚠ itad skipped: ITAD_API_KEY not set`);
    sources.delete(`itad`);
  }
  if (sources.has(`steam`) && !process.env.STEAM_API_KEY) {
    console.warn(
      `⚠ STEAM_API_KEY not set: achievements without display names, the end of game detection only sees API names`,
    );
  }
  return sources;
}

const round2 = (value: number) => Math.round(value * 100) / 100;

async function enrichGame(
  game: Game,
  sources: Set<Source>,
  wikidataIds: Map<number, WikidataIds>,
): Promise<Entry> {
  const errors: string[] = [];
  const wikidata = wikidataIds.get(game.idHltb);

  let igdb: IgdbResult | undefined;
  if (sources.has(`igdb`)) {
    try {
      igdb = await findIgdbGame(game.name);
    } catch (error) {
      errors.push(`igdb: ${errorMessage(error)}`);
    }
  }

  const ids: Ids = {
    ...(({ status, steamAppId, steamFrom, igdbAgreement }) => ({
      status,
      steamAppId,
      steamFrom,
      igdbAgreement,
    }))(resolveIds(wikidata, igdb)),
    wikidata: wikidata ?? null,
    igdb: igdb ? (igdb.match ?? { closest: igdb.closest }) : null,
  };

  let steam: Entry[`steam`] = null;
  if (sources.has(`steam`) && ids.steamAppId) {
    const [reviews, achievements] = await Promise.allSettled([
      getSteamReviews(ids.steamAppId),
      getSteamAchievements(ids.steamAppId),
    ]);
    if (reviews.status === `rejected`) {
      errors.push(`steam reviews: ${errorMessage(reviews.reason)}`);
    }
    if (achievements.status === `rejected`) {
      errors.push(`steam achievements: ${errorMessage(achievements.reason)}`);
    }
    steam = {
      reviews: reviews.status === `fulfilled` ? reviews.value : null,
      achievements:
        achievements.status === `fulfilled` ? achievements.value : null,
    };
  }

  return {
    ...game,
    ids,
    steam,
    price: null,
    derived: {
      completionRate: steam?.achievements?.completion?.percent ?? null,
      pricePerHour: null,
      lowestPricePerHour: null,
    },
    errors,
  };
}

async function addPrices(entries: Entry[]) {
  const appIds = entries.flatMap((entry) =>
    entry.ids.steamAppId ? [entry.ids.steamAppId] : [],
  );
  try {
    const prices = await getPrices(appIds);
    for (const entry of entries) {
      const price = entry.ids.steamAppId && prices.get(entry.ids.steamAppId);
      if (!price) continue;
      entry.price = price;
      // Free (often a free first episode): no meaningful price per hour
      if (entry.timeMainStory > 0 && price.current > 0) {
        entry.derived.pricePerHour = round2(
          price.current / entry.timeMainStory,
        );
        if (price.lowest !== null) {
          entry.derived.lowestPricePerHour = round2(
            price.lowest / entry.timeMainStory,
          );
        }
      }
    }
  } catch (error) {
    for (const entry of entries) {
      if (entry.ids.steamAppId)
        entry.errors.push(`itad: ${errorMessage(error)}`);
    }
  }
}

function igdbSteam(entry: Entry) {
  return entry.ids.igdb && `steam` in entry.ids.igdb
    ? entry.ids.igdb.steam
    : [];
}

function printSummary(file: string, startedAt?: number) {
  const entries = [...readEntries(file).values()];
  const total = entries.length;
  const pct = (count: number, of = total) =>
    `${count}/${of} (${of ? Math.round((count / of) * 100) : 0} %)`;
  const count = (predicate: (entry: Entry) => unknown) =>
    entries.filter(predicate).length;

  const statuses = Object.fromEntries(
    [`matched`, `conflict`, `ambiguous`, `no_steam`, `not_found`].map(
      (status) => [status, count((entry) => entry.ids.status === status)],
    ),
  );
  const bothSteam = count(
    (entry) => entry.ids.wikidata?.steam.length && igdbSteam(entry).length,
  );
  const withIgdbSlugs = count((entry) => entry.ids.igdbAgreement !== null);
  const matched = statuses.matched;

  console.info(`\n── Summary: ${file}`);
  console.info(`Games: ${total}`);
  console.info(`Ids:`, statuses);
  console.info(
    `  Wikidata found ${pct(count((entry) => entry.ids.wikidata))}, with Steam ${pct(count((entry) => entry.ids.wikidata?.steam.length))}`,
  );
  console.info(
    `  IGDB exact name ${pct(count((entry) => entry.ids.igdb && `id` in entry.ids.igdb))}, with Steam ${pct(count((entry) => igdbSteam(entry).length))}`,
  );
  console.info(
    `  Steam id agreement (both sources): ${pct(
      count((entry) => entry.ids.steamFrom === `both`),
      bothSteam,
    )}`,
  );
  console.info(
    `  IGDB slug agreement: ${pct(
      count((entry) => entry.ids.igdbAgreement),
      withIgdbSlugs,
    )}`,
  );
  console.info(`Data (out of ${matched} matched):`);
  console.info(
    `  reviews       ${pct(
      count((e) => e.steam?.reviews),
      matched,
    )}`,
  );
  console.info(
    `  achievements  ${pct(
      count((e) => e.steam?.achievements),
      matched,
    )}`,
  );
  console.info(
    `  end of game   ${pct(
      count((e) => e.derived.completionRate !== null),
      matched,
    )}`,
  );
  console.info(
    `  price         ${pct(
      count((e) => e.price),
      matched,
    )}`,
  );
  console.info(`Errors: ${count((entry) => entry.errors.length)} games`);

  const review = entries.filter((entry) =>
    [`conflict`, `ambiguous`].includes(entry.ids.status),
  );
  for (const entry of review) {
    console.info(
      `  ${entry.ids.status.padEnd(9)} ${entry.name} (hltb ${entry.idHltb}) wikidata=${entry.ids.wikidata?.steam.join(`|`) || `-`} igdb=${igdbSteam(entry).join(`|`) || `-`}`,
    );
  }
  if (startedAt) {
    console.info(
      `Run: ${Math.round((Date.now() - startedAt) / 1000)} s ·`,
      Object.fromEntries(requestCounts),
    );
  }
}

async function run() {
  const startedAt = Date.now();
  const sources = enabledSources();
  const limit = Number(args.limit);
  const offset = Number(args.offset);
  const chunkSize = Number(args[`chunk-size`]);

  mkdirSync(OUTPUT_DIR, { recursive: true });
  const file =
    args.out ||
    join(
      OUTPUT_DIR,
      `${new Date().toISOString().replace(/[:.]/g, `-`)}-enrich.jsonl`,
    );
  const done = existsSync(file) ? readEntries(file) : new Map<string, Entry>();

  const games: Game[] = await getDb()
    .db.select({
      _id: sql<string>`${gameTable.id}::text`,
      name: gameTable.name,
      idHltb: gameTable.hltbId,
      timeMainStory: gameTable.timeMainStory,
      timeMainExtras: gameTable.timeMainExtras,
      timeCompletionists: gameTable.timeCompletionists,
    })
    .from(gameTable)
    .where(eq(gameTable.isPublished, true))
    .orderBy(sql`${gameTable.rating} desc nulls last`, desc(gameTable.id))
    .offset(offset)
    .limit(limit);
  const pending = games.filter(
    (game) => !done.get(game._id) || done.get(game._id)!.errors.length,
  );
  console.info(
    `${games.length} games, ${games.length - pending.length} already done, ${pending.length} to enrich with ${[...sources].join(`, `)} → ${file}`,
  );

  let wikidataIds = new Map<number, WikidataIds>();
  if (sources.has(`wikidata`) && pending.length) {
    await checkWikidata();
    wikidataIds = await getWikidataIds(pending.map((game) => game.idHltb));
    console.info(`Wikidata: ${wikidataIds.size}/${pending.length} found`);
  }

  for (let i = 0; i < pending.length; i += chunkSize) {
    const entries: Entry[] = [];
    for (const game of pending.slice(i, i + chunkSize)) {
      const entry = await enrichGame(game, sources, wikidataIds);
      entries.push(entry);
      console.info(
        `${entry.ids.status === `matched` ? `✔` : `·`} ${game.name} → ${entry.ids.status}${entry.ids.steamAppId ? ` (steam ${entry.ids.steamAppId})` : ``}${entry.errors.length ? ` ⚠ ${entry.errors.length} error(s)` : ``}`,
      );
    }
    if (sources.has(`itad`)) await addPrices(entries);
    for (const entry of entries) {
      appendFileSync(file, `${JSON.stringify(entry)}\n`);
    }
    console.info(
      `… ${Math.min(i + chunkSize, pending.length)}/${pending.length}`,
    );
  }

  if (existsSync(file)) printSummary(file, startedAt);
}

(args.summary ? Promise.resolve(printSummary(args.summary)) : run())
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
