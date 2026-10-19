/**
 * Fills the external source tables (src/db/schema.ts) for the published
 * games. Each command only takes the games whose data is missing or older
 * than --max-age days, and writes each batch as it goes: stop it any time,
 * the next run resumes.
 *
 *   pnpm tsx scripts/sync.ts ids     [--max-age 90]  Wikidata + IGDB ids
 *   pnpm tsx scripts/sync.ts igdb    [--max-age 30]  identity (F1)
 *   pnpm tsx scripts/sync.ts steam   [--max-age 7]   reviews, achievements
 *   pnpm tsx scripts/sync.ts summary                 coverage
 *
 * Options: --limit n, --hltb <id,id…> (only these games), --dry-run (print
 * instead of writing).
 *
 * Rows fixed by hand are kept: game_external_id.status = manual,
 * steam_stats.completion_status = validated / rejected.
 *
 * Env (.env.local): DATABASE_URL, IGDB_CLIENT_ID + IGDB_CLIENT_SECRET (Twitch
 * app), STEAM_API_KEY (achievement names, needed for automatic completion
 * rates)
 */
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import {
  and,
  eq,
  inArray,
  isNotNull,
  isNull,
  lt,
  ne,
  or,
  sql,
} from 'drizzle-orm';
import { platformLabels } from '../src/config/platforms';
import { closeDb, getDb } from '../src/db/client';
import { game, gameExternalId, igdbInfo, steamStats } from '../src/db/schema';
import { errorMessage, requestCounts } from './enrich/http';
import { resolveIds } from './enrich/ids';
import {
  findIgdbGame,
  getIgdbDetails,
  getIgdbIdsBySlug,
  hasIgdbCredentials,
  type IgdbResult,
} from './enrich/igdb';
import { getSteamAchievements, getSteamReviews } from './enrich/steam';
import { getWikidataIds } from './enrich/wikidata';

for (const file of [`.env.local`, `.env`]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const COMMANDS = [`ids`, `igdb`, `steam`, `summary`] as const;
type Command = (typeof COMMANDS)[number];
const DEFAULT_MAX_AGE: Record<Command, number> = {
  ids: 90,
  igdb: 30,
  steam: 7,
  summary: 0,
};

const { values: args, positionals } = parseArgs({
  allowPositionals: true,
  options: {
    limit: { type: `string` },
    'max-age': { type: `string` },
    hltb: { type: `string` },
    'dry-run': { type: `boolean`, default: false },
  },
});

const command = positionals[0] as Command;
if (!COMMANDS.includes(command)) {
  console.error(`Usage: scripts/sync.ts ${COMMANDS.join(` | `)} [options]`);
  process.exit(1);
}
const maxAgeDays = Number(args[`max-age`] ?? DEFAULT_MAX_AGE[command]);
const limit = args.limit ? Number(args.limit) : undefined;
const dryRun = args[`dry-run`];
const hltbIds = args.hltb?.split(`,`).map(Number);

const { db } = getDb();
const staleBefore = new Date(Date.now() - maxAgeDays * 86_400_000);

// Published games, optionally limited to some HLTB ids
const gameFilter = () =>
  and(
    eq(game.isPublished, true),
    hltbIds ? inArray(game.hltbId, hltbIds) : undefined,
  );

const write = async (label: string, run: () => Promise<unknown>) => {
  if (dryRun) {
    console.info(`[dry-run] ${label}`);
    return;
  }
  await run();
};

// ── ids ────────────────────────────────────────────────────────────────────

async function syncIds() {
  if (!hasIgdbCredentials()) {
    throw new Error(`IGDB_CLIENT_ID / IGDB_CLIENT_SECRET are needed`);
  }
  const games = await db
    .select({ id: game.id, name: game.name, hltbId: game.hltbId })
    .from(game)
    .leftJoin(gameExternalId, eq(gameExternalId.gameId, game.id))
    .where(
      and(
        gameFilter(),
        or(
          isNull(gameExternalId.gameId),
          and(
            ne(gameExternalId.status, `manual`),
            lt(gameExternalId.fetchedAt, staleBefore),
          ),
        ),
      ),
    )
    .orderBy(sql`${game.rating} desc nulls last`, game.id)
    .limit(limit ?? 1_000_000);
  console.info(`ids: ${games.length} games to match`);

  for (let i = 0; i < games.length; i += 100) {
    const chunk = games.slice(i, i + 100);
    const wikidata = await getWikidataIds(chunk.map((g) => g.hltbId));
    const resolved = [];
    for (const row of chunk) {
      let igdb: IgdbResult;
      try {
        igdb = await findIgdbGame(row.name);
      } catch (error) {
        // Not written: retried by the next run
        console.warn(`⚠ ${row.name}: ${errorMessage(error)}`);
        continue;
      }
      const wd = wikidata.get(row.hltbId);
      resolved.push({ row, wd, ids: resolveIds(wd, igdb) });
    }

    // Wikidata alone: the IGDB id from its slug
    const slugs = resolved.flatMap(({ ids }) =>
      ids.igdbFrom === `wikidata` && ids.igdbSlug ? [ids.igdbSlug] : [],
    );
    const idsBySlug = slugs.length
      ? await getIgdbIdsBySlug(slugs)
      : new Map<string, number>();

    const values = resolved.map(({ row, wd, ids }) => {
      let { igdbId, igdbSlug, igdbFrom } = ids;
      if (igdbFrom === `wikidata`) {
        igdbId = idsBySlug.get(igdbSlug!) ?? null;
        if (!igdbId) igdbSlug = igdbFrom = null;
      }
      return {
        gameId: row.id,
        status: ids.status,
        wikidataQid: wd?.qid ?? null,
        igdbId,
        igdbSlug,
        igdbFrom,
        steamAppId: ids.steamAppId,
        steamFrom: ids.steamFrom,
        fetchedAt: new Date(),
      };
    });
    for (const value of values) {
      const row = chunk.find((g) => g.id === value.gameId)!;
      console.info(
        `${value.status === `matched` ? `✔` : `·`} ${row.name} → ${value.status}${value.steamAppId ? ` steam ${value.steamAppId}` : ``}${value.igdbId ? ` igdb ${value.igdbId} (${value.igdbFrom})` : ``}`,
      );
    }
    if (values.length) {
      await write(`${values.length} game_external_id rows`, () =>
        db
          .insert(gameExternalId)
          .values(values)
          .onConflictDoUpdate({
            target: gameExternalId.gameId,
            set: {
              status: sql`excluded.status`,
              wikidataQid: sql`excluded.wikidata_qid`,
              igdbId: sql`excluded.igdb_id`,
              igdbSlug: sql`excluded.igdb_slug`,
              igdbFrom: sql`excluded.igdb_from`,
              steamAppId: sql`excluded.steam_app_id`,
              steamFrom: sql`excluded.steam_from`,
              fetchedAt: sql`excluded.fetched_at`,
            },
            // A manual fix is never overwritten
            setWhere: ne(gameExternalId.status, `manual`),
          }),
      );
    }
    console.info(`… ${Math.min(i + 100, games.length)}/${games.length}`);
  }
}

// ── igdb ───────────────────────────────────────────────────────────────────

// IGDB data can be published without a Steam id (console games)
const IGDB_TRUSTED = [`matched`, `no_steam`, `manual`] as const;
const STEAM_TRUSTED = [`matched`, `manual`] as const;

async function syncIgdb() {
  if (!hasIgdbCredentials()) {
    throw new Error(`IGDB_CLIENT_ID / IGDB_CLIENT_SECRET are needed`);
  }
  const games = await db
    .select({ id: game.id, name: game.name, igdbId: gameExternalId.igdbId })
    .from(game)
    .innerJoin(gameExternalId, eq(gameExternalId.gameId, game.id))
    .leftJoin(igdbInfo, eq(igdbInfo.gameId, game.id))
    .where(
      and(
        gameFilter(),
        inArray(gameExternalId.status, [...IGDB_TRUSTED]),
        isNotNull(gameExternalId.igdbId),
        or(isNull(igdbInfo.gameId), lt(igdbInfo.fetchedAt, staleBefore)),
      ),
    )
    .limit(limit ?? 1_000_000);
  console.info(`igdb: ${games.length} games to fetch`);

  const unknownPlatforms = new Map<string, number>();
  for (let i = 0; i < games.length; i += 500) {
    const chunk = games.slice(i, i + 500);
    const details = await getIgdbDetails(chunk.map((g) => g.igdbId!));
    const values = chunk.flatMap((row) => {
      const detail = details.get(row.igdbId!);
      if (!detail) return [];
      const platforms = platformLabels(detail.platformSlugs);
      for (const slug of platforms.unknown) {
        unknownPlatforms.set(slug, (unknownPlatforms.get(slug) ?? 0) + 1);
      }
      return [
        {
          gameId: row.id,
          firstReleaseDate: detail.firstReleaseDate,
          developers: detail.developers,
          publishers: detail.publishers,
          platforms: platforms.labels,
          isMature: detail.isMature,
          summaryEn: detail.summary,
          fetchedAt: new Date(),
        },
      ];
    });
    if (dryRun) {
      for (const value of values.slice(0, 5)) console.info(value);
    }
    if (values.length) {
      await write(`${values.length} igdb_info rows`, () =>
        db
          .insert(igdbInfo)
          .values(values)
          .onConflictDoUpdate({
            target: igdbInfo.gameId,
            set: {
              firstReleaseDate: sql`excluded.first_release_date`,
              developers: sql`excluded.developers`,
              publishers: sql`excluded.publishers`,
              platforms: sql`excluded.platforms`,
              isMature: sql`excluded.is_mature`,
              summaryEn: sql`excluded.summary_en`,
              fetchedAt: sql`excluded.fetched_at`,
            },
          }),
      );
    }
    console.info(
      `… ${Math.min(i + 500, games.length)}/${games.length} (${values.length} found)`,
    );
  }
  if (unknownPlatforms.size) {
    console.info(
      `Platforms not in src/config/platforms.ts:`,
      Object.fromEntries(
        [...unknownPlatforms].sort((a, b) => b[1] - a[1]).slice(0, 20),
      ),
    );
  }
}

// ── steam ──────────────────────────────────────────────────────────────────

// Safe automatic rule for the completion rate (F3): a keyword match on the
// displayed achievement names, with a plausible rate
const isSafeCompletion = (
  completion: { rule?: string; percent: number } | null,
  withSchema: boolean,
) =>
  Boolean(
    completion &&
    completion.rule === `keyword` &&
    withSchema &&
    completion.percent >= 1 &&
    completion.percent <= 99,
  );

async function syncSteam() {
  if (!process.env.STEAM_API_KEY) {
    console.warn(
      `⚠ STEAM_API_KEY not set: no achievement names, every completion rate stays pending`,
    );
  }
  const games = await db
    .select({
      id: game.id,
      name: game.name,
      appId: gameExternalId.steamAppId,
      previousAppId: steamStats.appId,
      completionStatus: steamStats.completionStatus,
      completion: steamStats.completion,
    })
    .from(game)
    .innerJoin(gameExternalId, eq(gameExternalId.gameId, game.id))
    .leftJoin(steamStats, eq(steamStats.gameId, game.id))
    .where(
      and(
        gameFilter(),
        inArray(gameExternalId.status, [...STEAM_TRUSTED]),
        isNotNull(gameExternalId.steamAppId),
        or(
          isNull(steamStats.gameId),
          lt(steamStats.fetchedAt, staleBefore),
          ne(steamStats.appId, gameExternalId.steamAppId),
        ),
      ),
    )
    .orderBy(sql`${steamStats.fetchedAt} asc nulls first`, game.id)
    .limit(limit ?? 1_000_000);
  console.info(`steam: ${games.length} games to fetch`);

  let done = 0;
  let next = 0;
  const worker = async () => {
    while (next < games.length) {
      const row = games[next++];
      const appId = row.appId!;
      const [reviews, achievements] = await Promise.allSettled([
        getSteamReviews(appId),
        getSteamAchievements(appId),
      ]);
      if (reviews.status === `rejected` || achievements.status === `rejected`) {
        const reason =
          reviews.status === `rejected`
            ? reviews.reason
            : (achievements as PromiseRejectedResult).reason;
        // Not written: retried by the next run
        console.warn(`⚠ ${row.name}: ${errorMessage(reason)}`);
        continue;
      }
      const review = reviews.value;
      const ach = achievements.value;
      const completion = ach?.completion
        ? {
            name: ach.completion.name,
            displayName: ach.completion.displayName,
            percent: ach.completion.percent,
            rule: ach.completion.rule ?? `keyword`,
          }
        : null;

      // A rate validated or rejected by hand is kept while the achievement
      // is the same; its percent is still refreshed
      const handled =
        (row.completionStatus === `validated` ||
          row.completionStatus === `rejected`) &&
        row.previousAppId === appId &&
        row.completion?.name === completion?.name;
      const completionStatus = handled
        ? row.completionStatus
        : completion
          ? isSafeCompletion(completion, Boolean(ach?.withSchema))
            ? (`auto` as const)
            : (`pending` as const)
          : null;

      const value = {
        gameId: row.id,
        appId,
        reviewPositive: review?.positive ?? null,
        reviewTotal: review?.total ?? null,
        reviewPercent: review?.percent ?? null,
        reviewDesc: review?.desc ?? null,
        achievementCount: ach?.count ?? null,
        rarestName: ach ? (ach.rarest.displayName ?? ach.rarest.name) : null,
        rarestPercent: ach?.rarest.percent ?? null,
        completion,
        completionStatus,
        fetchedAt: new Date(),
      };
      await write(`steam_stats ${row.name}`, () =>
        db
          .insert(steamStats)
          .values(value)
          .onConflictDoUpdate({
            target: steamStats.gameId,
            set: Object.fromEntries(
              Object.entries(value).filter(([key]) => key !== `gameId`),
            ),
          }),
      );
      done++;
      console.info(
        `✔ [${done}/${games.length}] ${row.name}: ${review ? `${review.percent} % of ${review.total}` : `no reviews`}${completion ? `, completion ${completion.percent} % (${completionStatus})` : ``}`,
      );
    }
  };
  // Reviews (store) and achievements (api) are on two throttled hosts
  await Promise.all([worker(), worker()]);
}

// ── summary ────────────────────────────────────────────────────────────────

async function summary() {
  const [published] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(game)
    .where(eq(game.isPublished, true));
  const statuses = await db
    .select({
      status: gameExternalId.status,
      count: sql<number>`count(*)::int`,
    })
    .from(gameExternalId)
    .innerJoin(game, eq(game.id, gameExternalId.gameId))
    .where(eq(game.isPublished, true))
    .groupBy(gameExternalId.status);
  const count = async (
    table: typeof igdbInfo | typeof steamStats,
    where?: ReturnType<typeof and>,
  ) => {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(table)
      .innerJoin(game, eq(game.id, table.gameId))
      .where(and(eq(game.isPublished, true), where));
    return row.count;
  };
  const pct = (value: number) =>
    `${value} (${Math.round((value / published.count) * 100)} %)`;
  console.info(`Published games: ${published.count}`);
  console.info(
    `Ids:`,
    Object.fromEntries(statuses.map((row) => [row.status, row.count])),
  );
  console.info(`Identity (IGDB): ${pct(await count(igdbInfo))}`);
  console.info(
    `  with platforms: ${pct(await count(igdbInfo, and(sql`cardinality(${igdbInfo.platforms}) > 0`)))}`,
  );
  console.info(
    `Steam reviews: ${pct(await count(steamStats, and(isNotNull(steamStats.reviewTotal))))}`,
  );
  console.info(
    `Completion rate published (auto / validated): ${pct(await count(steamStats, and(inArray(steamStats.completionStatus, [`auto`, `validated`]))))}, pending: ${await count(steamStats, and(eq(steamStats.completionStatus, `pending`)))}`,
  );
}

const startedAt = Date.now();
({ ids: syncIds, igdb: syncIgdb, steam: syncSteam, summary })
  [command]()
  .then(() => {
    if (command !== `summary`) {
      console.info(
        `Run: ${Math.round((Date.now() - startedAt) / 1000)} s ·`,
        Object.fromEntries(requestCounts),
      );
    }
  })
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
