/**
 * Grows the catalog with the games that pass the popularity threshold
 * (scripts/enrich/threshold.ts, docs/enrichissement-fiches-jeux.md §11).
 *
 * 1. Read the HLTB page of every Wikidata item with an HLTB id that is not in
 *    the catalog yet, best known first, and insert those that pass, as
 *    unpublished games (source = import) with their hltb_stats:
 *      pnpm tsx scripts/import-games.ts [--limit 200] [--dry-run]
 * 2. Ids, identity and genres: pnpm tsx scripts/sync.ts ids|igdb|steam
 *    --unpublished, then translation: scripts/translate-games.ts
 * 3. Publish the imported games that are ready (French description, times,
 *    confirmed IGDB cover):
 *      pnpm tsx scripts/import-games.ts --publish [--dry-run]
 * Weekly refresh of hltb_stats for the whole catalog (times of the imported
 * games too):
 *      pnpm tsx scripts/import-games.ts --refresh [--max-age 30]
 * Catch-up of the published games with a time at 0 (the other times stay):
 *      pnpm tsx scripts/import-games.ts --refresh --missing-times [--limit 200]
 *
 * Every HLTB page read is kept in .import/pages.jsonl: a run resumes where
 * the previous one stopped, and a --dry-run pass is not read again. --dry-run
 * writes .import/selected.csv instead of the database.
 *
 * Env (.env.local / .env): DATABASE_URL
 */
import {
  appendFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { join } from 'node:path';
import { parseArgs } from 'node:util';
import { and, eq, gt, inArray, isNull, lt, or, sql } from 'drizzle-orm';
import type { AnyPgColumn } from 'drizzle-orm/pg-core';
import { closeDb, getDb } from '../src/db/client';
import { game, gameExternalId, hltbStats, igdbInfo } from '../src/db/schema';
import { slugify } from '../src/utils/slugify';
import {
  checkHltb,
  getHltbGame,
  HltbStructureError,
  type HltbGame,
} from './enrich/hltb';
import { errorMessage, requestCounts } from './enrich/http';
import { getSteamReviews } from './enrich/steam';
import { passes, passesWithoutSteam } from './enrich/threshold';
import { getAllHltbItems } from './enrich/wikidata';

for (const file of [`.env.local`, `.env`]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const { values: args } = parseArgs({
  options: {
    limit: { type: `string` },
    'dry-run': { type: `boolean`, default: false },
    publish: { type: `boolean`, default: false },
    refresh: { type: `boolean`, default: false },
    'missing-times': { type: `boolean`, default: false },
    'max-age': { type: `string`, default: `30` },
  },
});

const limit = args.limit ? Number(args.limit) : Infinity;
const dryRun = args[`dry-run`];
const maxAgeMs = Number(args[`max-age`]) * 86_400_000;

const OUTPUT_DIR = join(process.cwd(), `.import`);
const PAGES_FILE = join(OUTPUT_DIR, `pages.jsonl`);
const SELECTED_FILE = join(OUTPUT_DIR, `selected.csv`);

// IGDB data is trusted without a Steam id (console games), see getGames.ts
const IGDB_TRUSTED = [`matched`, `no_steam`, `manual`] as const;
// HLTB user score, shown as the game rating once enough players rated it
const MIN_REVIEWS_FOR_RATING = 10;

interface Page {
  // Id read from Wikidata: HLTB may answer with another one (merged games)
  requested: number;
  status: `ok` | `not_found` | `empty`;
  game: HltbGame | null;
  sitelinks: number | null;
  // Only fetched when the HLTB and Wikipedia signals are not enough
  steamReviews: number | null;
  passes: boolean;
  fetchedAt: string;
}

const readPages = () => {
  const pages = new Map<number, Page>();
  if (!existsSync(PAGES_FILE)) return pages;
  for (const line of readFileSync(PAGES_FILE, `utf8`).split(`\n`)) {
    if (!line) continue;
    const page = JSON.parse(line) as Page;
    pages.set(page.requested, page);
  }
  return pages;
};

const isFresh = (page: Page) =>
  Date.now() - new Date(page.fetchedAt).getTime() < maxAgeMs;

// Seconds → hours, as the legacy catalog stored them. At least 1 h when HLTB
// has a time: 0 means "no time" on the site
const hours = (seconds: number) =>
  seconds > 0 ? Math.max(1, Math.round(seconds / 3600)) : 0;

const ratingOf = (hltb: HltbGame) =>
  hltb.countReview >= MIN_REVIEWS_FOR_RATING ? hltb.reviewScore : null;

const releaseDate = (hltb: HltbGame) =>
  /^\d{4}-\d{2}-\d{2}$/.test(hltb.releaseWorld) &&
  !hltb.releaseWorld.endsWith(`-00`)
    ? hltb.releaseWorld
    : null;

const statsValues = (gameId: number, hltb: HltbGame) => ({
  gameId,
  type: hltb.type,
  countTotal: hltb.countTotal,
  countComp: hltb.countComp,
  countBacklog: hltb.countBacklog,
  countPlaying: hltb.countPlaying,
  countReview: hltb.countReview,
  reviewScore: hltb.reviewScore,
  compMainCount: hltb.compMainCount,
  compPlusCount: hltb.compPlusCount,
  comp100Count: hltb.comp100Count,
  compAllCount: hltb.compAllCount,
  compMain: hltb.compMain,
  compMainMed: hltb.compMainMed,
  compPlus: hltb.compPlus,
  comp100: hltb.comp100,
  steamAppId: hltb.steam || null,
  platforms: hltb.platforms || null,
  developer: hltb.developer || null,
  publisher: hltb.publisher || null,
  releaseWorld: hltb.releaseWorld || null,
  fetchedAt: new Date(),
});

const upsertStats = (gameId: number, hltb: HltbGame) => {
  const { gameId: id, ...set } = statsValues(gameId, hltb);
  return getDb()
    .db.insert(hltbStats)
    .values({ gameId: id, ...set })
    .onConflictDoUpdate({ target: hltbStats.gameId, set });
};

const csvCell = (value: unknown) => {
  const text = String(value ?? ``);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, `""`)}"` : text;
};

// ── import ─────────────────────────────────────────────────────────────────

async function importGames() {
  const { db } = getDb();
  mkdirSync(OUTPUT_DIR, { recursive: true });
  await checkHltb();

  const existing = await db
    .select({ hltbId: game.hltbId, slug: game.slug, name: game.name })
    .from(game);
  const knownHltb = new Set(existing.map((row) => row.hltbId));
  const slugs = new Set(existing.map((row) => row.slug));
  const names = new Set(existing.map((row) => row.name.toLowerCase()));

  // A remake or a renamed sequel may share its name with a game of the
  // catalog (Resident Evil 4, Overwatch): the release year tells them apart
  const naming = (hltb: HltbGame) => {
    let name = hltb.name;
    const homonym = names.has(name.toLowerCase());
    const year = hltb.releaseWorld.slice(0, 4);
    if (homonym && /^\d{4}$/.test(year) && year !== `0000`) {
      name = `${name} (${year})`;
    }
    let slug = slugify(name);
    if (!slug || slugs.has(slug)) slug = `${slug || `game`}-${hltb.id}`;
    names.add(name.toLowerCase());
    names.add(hltb.name.toLowerCase());
    slugs.add(slug);
    return { name, slug, homonym };
  };

  const items = await getAllHltbItems();
  // Best known first: a partial run reads the games most likely to pass
  const candidates = [...items.values()]
    .filter((item) => !knownHltb.has(item.hltb))
    .sort((a, b) => b.sitelinks - a.sitelinks);
  const pages = readPages();
  console.info(
    `${items.size} Wikidata items with an HLTB id, ${candidates.length} not in the catalog, ${[...pages.values()].filter(isFresh).length} pages already read`,
  );

  const selected: {
    page: Page;
    name: string;
    slug: string;
    homonym: boolean;
  }[] = [];
  let fetched = 0;
  let inserted = 0;
  const startedAt = Date.now();

  for (const item of candidates) {
    let page = pages.get(item.hltb);
    if (!page || !isFresh(page)) {
      // --limit counts the pages read, the ones already read are reused
      if (fetched >= limit) continue;
      fetched += 1;
      let result;
      try {
        result = await getHltbGame(item.hltb);
      } catch (error) {
        if (error instanceof HltbStructureError) throw error;
        console.warn(`⚠ ${item.hltb} ${item.label}: ${errorMessage(error)}`);
        continue;
      }
      const hltb = result.status === `ok` ? result.game : null;
      const signals = hltb && {
        type: hltb.type,
        compMainCount: hltb.compMainCount,
        countTotal: hltb.countTotal,
        sitelinks: item.sitelinks,
      };
      let steamReviews: number | null = null;
      const steamId = hltb?.steam || item.steam;
      if (signals && passesWithoutSteam(signals) === undefined && steamId) {
        try {
          steamReviews = (await getSteamReviews(steamId))?.total ?? null;
        } catch (error) {
          console.warn(`⚠ steam ${steamId}: ${errorMessage(error)}`);
        }
      }
      page = {
        requested: item.hltb,
        status: result.status,
        game: hltb,
        sitelinks: item.sitelinks,
        steamReviews,
        passes: Boolean(signals && passes({ ...signals, steamReviews })),
        fetchedAt: new Date().toISOString(),
      };
      pages.set(item.hltb, page);
      appendFileSync(PAGES_FILE, `${JSON.stringify(page)}\n`);
      if (fetched % 50 === 0) {
        const perPage = (Date.now() - startedAt) / fetched / 1000;
        console.info(
          `… ${fetched} pages read (${perPage.toFixed(1)} s/page), ${selected.length} pass`,
        );
      }
    }
    if (!page.passes || !page.game) continue;
    // A merged HLTB id may point to a game the catalog already has
    if (knownHltb.has(page.game.id)) continue;
    knownHltb.add(page.game.id);
    const hltb = page.game;
    const { name, slug, homonym } = naming(hltb);
    selected.push({ page, name, slug, homonym });
    if (dryRun) continue;

    await db.transaction(async (tx) => {
      const [row] = await tx
        .insert(game)
        .values({
          hltbId: hltb.id,
          name,
          slug,
          rating: ratingOf(hltb),
          timeMainStory: hours(hltb.compMain),
          timeMainExtras: hours(hltb.compPlus),
          timeCompletionists: hours(hltb.comp100),
          descriptionMd: hltb.summary,
          firstReleaseDate: releaseDate(hltb),
          source: `import`,
        })
        .returning({ id: game.id });
      const values = statsValues(row.id, hltb);
      await tx.insert(hltbStats).values(values);
    });
    inserted += 1;
    console.info(
      `+ ${name} (${hltb.id}) → ${slug}${homonym ? ` ⚠ homonym` : ``}`,
    );
  }

  writeFileSync(
    SELECTED_FILE,
    [
      `hltb,name,slug,homonym,type,players,main_count,sitelinks,steam_reviews,main_h,plus_h,100_h,release,summary`,
      ...selected.map(({ page, name, slug, homonym }) =>
        [
          page.game!.id,
          name,
          slug,
          homonym ? `yes` : ``,
          page.game!.type,
          page.game!.countTotal,
          page.game!.compMainCount,
          page.sitelinks,
          page.steamReviews,
          hours(page.game!.compMain),
          hours(page.game!.compPlus),
          hours(page.game!.comp100),
          page.game!.releaseWorld,
          page.game!.summary ? `yes` : `no`,
        ]
          .map(csvCell)
          .join(`,`),
      ),
    ].join(`\n`),
  );
  console.info(
    `${fetched} pages read, ${selected.length} games pass, ${dryRun ? `nothing written (dry run)` : `${inserted} inserted`} → ${SELECTED_FILE}`,
    Object.fromEntries(requestCounts),
  );
}

// ── publish ────────────────────────────────────────────────────────────────

async function publish() {
  const { db } = getDb();
  const ready = await db
    .select({ id: game.id, name: game.name, slug: game.slug })
    .from(game)
    .innerJoin(gameExternalId, eq(gameExternalId.gameId, game.id))
    .innerJoin(igdbInfo, eq(igdbInfo.gameId, game.id))
    .where(
      and(
        eq(game.source, `import`),
        eq(game.isPublished, false),
        eq(game.isTranslated, true),
        gt(game.timeMainStory, 0),
        inArray(gameExternalId.status, [...IGDB_TRUSTED]),
        sql`${igdbInfo.coverImageId} is not null`,
      ),
    );
  const [{ waiting }] = await db
    .select({ waiting: sql<number>`count(*)::int` })
    .from(game)
    .where(and(eq(game.source, `import`), eq(game.isPublished, false)));
  for (const row of ready.slice(0, 20))
    console.info(`  ${row.name} → /jeu/${row.slug}`);
  if (!dryRun && ready.length) {
    const now = new Date();
    await db
      .update(game)
      .set({ isPublished: true, publishedAt: now, updatedAt: now })
      .where(
        inArray(
          game.id,
          ready.map((row) => row.id),
        ),
      );
  }
  console.info(
    `${ready.length} of ${waiting} unpublished imported games ${dryRun ? `are ready (dry run)` : `published`}`,
  );
}

// ── refresh ────────────────────────────────────────────────────────────────

async function refresh() {
  const { db } = getDb();
  await checkHltb();
  const staleBefore = new Date(Date.now() - maxAgeMs);
  const games = await db
    .select({
      id: game.id,
      hltbId: game.hltbId,
      name: game.name,
      source: game.source,
    })
    .from(game)
    .leftJoin(hltbStats, eq(hltbStats.gameId, game.id))
    .where(
      args[`missing-times`]
        ? and(
            eq(game.isPublished, true),
            or(eq(game.timeMainStory, 0), eq(game.timeCompletionists, 0)),
            or(isNull(hltbStats.gameId), lt(hltbStats.fetchedAt, staleBefore)),
          )
        : or(isNull(hltbStats.gameId), lt(hltbStats.fetchedAt, staleBefore)),
    )
    // Never read first, then the oldest
    .orderBy(sql`${hltbStats.fetchedAt} asc nulls first`)
    .limit(Number.isFinite(limit) ? limit : 1_000_000);
  console.info(`refresh: ${games.length} games to read`);

  let done = 0;
  for (const row of games) {
    let result;
    try {
      result = await getHltbGame(row.hltbId);
    } catch (error) {
      if (error instanceof HltbStructureError) throw error;
      console.warn(`⚠ ${row.hltbId} ${row.name}: ${errorMessage(error)}`);
      continue;
    }
    done += 1;
    if (result.status !== `ok`) {
      console.warn(`⚠ ${row.hltbId} ${row.name}: ${result.status} on HLTB`);
      continue;
    }
    const hltb = result.game;
    if (dryRun) {
      if (done <= 5) console.info(statsValues(row.id, hltb));
      continue;
    }
    await upsertStats(row.id, hltb);
    // The legacy times stay as they are, the imported ones follow HLTB
    if (row.source === `import` && hltb.compMain > 0) {
      await db
        .update(game)
        .set({
          rating: ratingOf(hltb),
          timeMainStory: hours(hltb.compMain),
          timeMainExtras: hours(hltb.compPlus),
          timeCompletionists: hours(hltb.comp100),
          updatedAt: new Date(),
        })
        .where(eq(game.id, row.id));
    } else if (args[`missing-times`]) {
      // Only the times at 0: the others were checked by hand or by a former import
      const fill = (column: AnyPgColumn, seconds: number) =>
        sql`case when ${column} = 0 then ${hours(seconds)} else ${column} end`;
      await db
        .update(game)
        .set({
          timeMainStory: fill(game.timeMainStory, hltb.compMain),
          timeMainExtras: fill(game.timeMainExtras, hltb.compPlus),
          timeCompletionists: fill(game.timeCompletionists, hltb.comp100),
          updatedAt: new Date(),
        })
        .where(eq(game.id, row.id));
    }
    if (done % 100 === 0) console.info(`… ${done}/${games.length}`);
  }
  console.info(`${done} games read`, Object.fromEntries(requestCounts));
}

(args.publish ? publish : args.refresh ? refresh : importGames)()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
