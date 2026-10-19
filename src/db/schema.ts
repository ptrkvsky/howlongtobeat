/**
 * Database schema (Postgres, see infra/postgres). Migrations are generated
 * from this file: pnpm db:generate, then applied with pnpm db:migrate.
 */
import {
  boolean,
  date,
  doublePrecision,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  primaryKey,
  serial,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';

const timestamps = {
  createdAt: timestamp(`created_at`, { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp(`updated_at`, { withTimezone: true })
    .notNull()
    .defaultNow(),
};

export const genre = pgTable(`genre`, {
  id: serial(`id`).primaryKey(),
  // Id of the document in the former Sanity dataset, for traceability
  sanityId: text(`sanity_id`).unique(),
  name: text(`name`).notNull(),
  slug: text(`slug`).notNull().unique(),
  description: text(`description`),
  ...timestamps,
});

// `legacy`: 2021 scraping (via Sanity), `import`: scripts/import-games.ts
export const gameSource = pgEnum(`game_source`, [`legacy`, `import`]);

export const game = pgTable(`game`, {
  id: serial(`id`).primaryKey(),
  sanityId: text(`sanity_id`).unique(),
  hltbId: integer(`hltb_id`).notNull().unique(),
  name: text(`name`).notNull(),
  slug: text(`slug`).notNull().unique(),
  // IGDB image URL without the protocol ("//images.igdb.com/...")
  cover: text(`cover`),
  rating: integer(`rating`),
  // Hours
  timeMainStory: integer(`time_main_story`).notNull().default(0),
  timeMainExtras: integer(`time_main_extras`).notNull().default(0),
  timeCompletionists: integer(`time_completionists`).notNull().default(0),
  // Markdown, in English until translated (isTranslated)
  descriptionMd: text(`description_md`).notNull().default(``),
  // The description is in French (former Sanity `isTranslated`)
  isTranslated: boolean(`is_translated`).notNull().default(false),
  // Only published games get a page
  isPublished: boolean(`is_published`).notNull().default(false),
  firstReleaseDate: date(`first_release_date`),
  source: gameSource(`source`).notNull().default(`legacy`),
  ...timestamps,
});

export const gameGenre = pgTable(
  `game_genre`,
  {
    gameId: integer(`game_id`)
      .notNull()
      .references(() => game.id, { onDelete: `cascade` }),
    genreId: integer(`genre_id`)
      .notNull()
      .references(() => genre.id, { onDelete: `cascade` }),
  },
  (table) => [primaryKey({ columns: [table.gameId, table.genreId] })],
);

// Manual corrections: imports write to `game`, reads apply these on top, so
// a correction survives the next import
export const gameOverride = pgTable(
  `game_override`,
  {
    gameId: integer(`game_id`)
      .notNull()
      .references(() => game.id, { onDelete: `cascade` }),
    // Name of the `game` column (camelCase, as in this schema)
    field: text(`field`).notNull(),
    value: jsonb(`value`).notNull(),
    note: text(`note`),
    updatedAt: timestamp(`updated_at`, { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.gameId, table.field] })],
);

// ── External sources: one row per game and source, dated by fetched_at ─────

const gameId = () =>
  integer(`game_id`)
    .primaryKey()
    .references(() => game.id, { onDelete: `cascade` });
const fetchedAt = () =>
  timestamp(`fetched_at`, { withTimezone: true }).notNull().defaultNow();

// `manual`: fixed by hand, never rewritten by scripts/sync.ts
export const matchStatus = pgEnum(`match_status`, [
  `matched`,
  `conflict`,
  `ambiguous`,
  `no_steam`,
  `not_found`,
  `manual`,
]);
export const matchSource = pgEnum(`match_source`, [`both`, `wikidata`, `igdb`]);

// Ids of the game in the other sources. Only `matched` and `manual` rows are
// trusted enough to publish data
export const gameExternalId = pgTable(`game_external_id`, {
  gameId: gameId(),
  status: matchStatus(`status`).notNull(),
  wikidataQid: text(`wikidata_qid`),
  igdbId: integer(`igdb_id`),
  igdbSlug: text(`igdb_slug`),
  igdbFrom: matchSource(`igdb_from`),
  steamAppId: integer(`steam_app_id`),
  steamFrom: matchSource(`steam_from`),
  fetchedAt: fetchedAt(),
});

// Game identity (F1)
export const igdbInfo = pgTable(`igdb_info`, {
  gameId: gameId(),
  firstReleaseDate: date(`first_release_date`),
  developers: text(`developers`).array().notNull().default([]),
  publishers: text(`publishers`).array().notNull().default([]),
  // Labels from src/config/platforms.ts, unknown platforms are left out
  platforms: text(`platforms`).array().notNull().default([]),
  // PEGI 18, ESRB M or AO
  isMature: boolean(`is_mature`).notNull().default(false),
  summaryEn: text(`summary_en`),
  // IGDB cover image id: the URL is built with the size each use needs
  coverImageId: text(`cover_image_id`),
  fetchedAt: fetchedAt(),
});

// `validated` and `rejected` are set by hand and never rewritten; only `auto`
// and `validated` completion rates are published
export const completionStatus = pgEnum(`completion_status`, [
  `auto`,
  `pending`,
  `validated`,
  `rejected`,
]);

// Steam reviews (F2) and achievements (F3, F4)
export const steamStats = pgTable(`steam_stats`, {
  gameId: gameId(),
  appId: integer(`app_id`).notNull(),
  reviewPositive: integer(`review_positive`),
  reviewTotal: integer(`review_total`),
  reviewPercent: integer(`review_percent`),
  // Steam label in English ("Overwhelmingly Positive"), translated on display
  reviewDesc: text(`review_desc`),
  achievementCount: integer(`achievement_count`),
  rarestName: text(`rarest_name`),
  rarestPercent: doublePrecision(`rarest_percent`),
  // End of game achievement: { name, displayName, percent, rule }
  completion: jsonb(`completion`).$type<{
    name: string;
    displayName?: string;
    percent: number;
    rule: string;
  }>(),
  completionStatus: completionStatus(`completion_status`),
  fetchedAt: fetchedAt(),
});

// HowLongToBeat page data (filled by scripts/import-games.ts), times in seconds
export const hltbStats = pgTable(`hltb_stats`, {
  gameId: gameId(),
  type: text(`type`).notNull(),
  countTotal: integer(`count_total`).notNull(),
  countComp: integer(`count_comp`).notNull(),
  countBacklog: integer(`count_backlog`).notNull(),
  countPlaying: integer(`count_playing`).notNull(),
  countReview: integer(`count_review`).notNull(),
  reviewScore: integer(`review_score`).notNull(),
  compMainCount: integer(`comp_main_count`).notNull(),
  compPlusCount: integer(`comp_plus_count`).notNull(),
  comp100Count: integer(`comp_100_count`).notNull(),
  compAllCount: integer(`comp_all_count`).notNull(),
  compMain: integer(`comp_main`).notNull(),
  compMainMed: integer(`comp_main_med`).notNull(),
  compPlus: integer(`comp_plus`).notNull(),
  comp100: integer(`comp_100`).notNull(),
  steamAppId: integer(`steam_app_id`),
  platforms: text(`platforms`),
  developer: text(`developer`),
  publisher: text(`publisher`),
  releaseWorld: text(`release_world`),
  fetchedAt: fetchedAt(),
});
