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
  real,
  text,
  timestamp,
  vector,
} from 'drizzle-orm/pg-core';
import { AUTHOR_SLUGS } from '../config/authors';
import { NEWS_CATEGORIES, type NewsImage } from '../config/news';

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
  // Set by scripts/import-games.ts --publish, null for the legacy games
  publishedAt: timestamp(`published_at`, { withTimezone: true }),
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
  // Gameplay fields, for the recommendations (src/features/jeu/recommendations).
  // Null until the next IGDB sync fetches them
  genres: text(`genres`).array(),
  themes: text(`themes`).array(),
  keywords: text(`keywords`).array(),
  gameModes: text(`game_modes`).array(),
  perspectives: text(`perspectives`).array(),
  // IGDB ids, to leave out the editions and cap a series
  franchiseIds: integer(`franchise_ids`).array(),
  collectionIds: integer(`collection_ids`).array(),
  parentIgdbId: integer(`parent_igdb_id`),
  similarIgdbIds: integer(`similar_igdb_ids`).array(),
  fetchedAt: fetchedAt(),
});

// SteamSpy user tags, by number of votes ("Colony Sim": 4108)
export const steamTags = pgTable(`steam_tags`, {
  gameId: gameId(),
  appId: integer(`app_id`).notNull(),
  tags: jsonb(`tags`).$type<{ name: string; votes: number }[]>().notNull(),
  fetchedAt: fetchedAt(),
});

// ── Recommendations (scripts/embed-games.ts, scripts/recommend.ts) ─────────

export const EMBEDDING_DIMENSIONS = 512;

// Embedding of the gameplay profile; recomputed when its hash changes
export const gameEmbedding = pgTable(`game_embedding`, {
  gameId: gameId(),
  model: text(`model`).notNull(),
  // Hash of the profile, the model and the dimensions
  docHash: text(`doc_hash`).notNull(),
  // The embedded profile, kept to inspect a recommendation
  document: text(`document`).notNull(),
  embedding: vector(`embedding`, {
    dimensions: EMBEDDING_DIMENSIONS,
  }).notNull(),
  updatedAt: timestamp(`updated_at`, { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// "D'autres jeux à terminer", computed offline: the build only reads it
export const gameRecommendation = pgTable(
  `game_recommendation`,
  {
    gameId: integer(`game_id`)
      .notNull()
      .references(() => game.id, { onDelete: `cascade` }),
    rank: integer(`rank`).notNull(),
    relatedGameId: integer(`related_game_id`)
      .notNull()
      .references(() => game.id, { onDelete: `cascade` }),
    score: real(`score`).notNull(),
    // Score of each signal, to explain and evaluate a recommendation
    components: jsonb(`components`).$type<Record<string, number>>().notNull(),
    algoVersion: text(`algo_version`).notNull(),
    computedAt: timestamp(`computed_at`, { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (table) => [primaryKey({ columns: [table.gameId, table.rank] })],
);

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

// IsThereAnyDeal prices in France (F7), looked up from the Steam app id
export const itadPrice = pgTable(`itad_price`, {
  gameId: gameId(),
  appId: integer(`app_id`).notNull(),
  current: doublePrecision(`current`).notNull(),
  shop: text(`shop`).notNull(),
  url: text(`url`),
  lowest: doublePrecision(`lowest`),
  lowestShop: text(`lowest_shop`),
  currency: text(`currency`).notNull(),
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

// ── News: written every hour by scripts/publish-news.ts ────────────────────

export const newsCategory = pgEnum(`news_category`, NEWS_CATEGORIES);
export const newsAuthor = pgEnum(`news_author`, AUTHOR_SLUGS);

export const newsArticle = pgTable(`news_article`, {
  id: serial(`id`).primaryKey(),
  slug: text(`slug`).notNull().unique(),
  // Short hash of the source URL: a source is written once
  sourceKey: text(`source_key`).notNull().unique(),
  // For traceability only, never shown nor linked
  sourceUrl: text(`source_url`).notNull(),
  title: text(`title`).notNull(),
  excerpt: text(`excerpt`).notNull(),
  // Rendered by the script, without raw HTML from the model
  contentHtml: text(`content_html`).notNull(),
  category: newsCategory(`category`).notNull(),
  // Signed by the author of the category (src/config/authors.ts)
  author: newsAuthor(`author`).notNull(),
  image: jsonb(`image`).$type<NewsImage>().notNull(),
  gameId: integer(`game_id`).references(() => game.id, {
    onDelete: `set null`,
  }),
  // Unpublished by hand: left out of the next build
  isPublished: boolean(`is_published`).notNull().default(true),
  publishedAt: timestamp(`published_at`, { withTimezone: true }).notNull(),
  ...timestamps,
});
