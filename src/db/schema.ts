/**
 * Database schema (Postgres, see infra/postgres). Migrations are generated
 * from this file: pnpm db:generate, then applied with pnpm db:migrate.
 */
import {
  boolean,
  date,
  integer,
  jsonb,
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
