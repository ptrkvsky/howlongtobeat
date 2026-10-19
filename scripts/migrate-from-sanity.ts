/**
 * One-off migration: copies the Sanity dataset (games, genres) to Postgres.
 * Safe to rerun: rows are upserted on their Sanity id.
 *
 *   pnpm tsx scripts/migrate-from-sanity.ts
 *
 * First saves the whole dataset to .migration/sanity-export-<date>.json.
 * Descriptions go from Portable Text to Markdown; an unknown block or mark
 * stops the run instead of losing content.
 *
 * Env (.env.local): SANITY_ID, SANITY_DATASET, DATABASE_URL
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { createClient } from '@sanity/client';
import { sql as rawSql } from 'drizzle-orm';
import { closeDb, getDb } from '../src/db/client';
import { game, gameGenre, genre } from '../src/db/schema';
import { escapeMarkdown } from './lib/markdown';

for (const file of [`.env.local`, `.env`]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const OUTPUT_DIR = join(process.cwd(), `.migration`);

// Value proposed for the column by the conflicting insert
const excluded = (column: { name: string }) =>
  rawSql.raw(`excluded."${column.name}"`);

interface Span {
  _type: string;
  text?: string;
  marks?: string[];
}

interface Block {
  _type: string;
  style?: string;
  listItem?: string;
  level?: number;
  children?: Span[];
  markDefs?: { _key: string; _type: string; slug?: { current: string } }[];
}

interface SanityGame {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  name: string;
  slug: { current: string };
  idHltb: number;
  cover?: string | null;
  rating?: number | null;
  timeMainStory?: number | null;
  timeMainExtras?: number | null;
  timeCompletionists?: number | null;
  isTranslated?: boolean;
  firstReleaseDate?: string | null;
  genreIds?: string[] | null;
  description?: Block[] | null;
}

interface SanityGenre {
  _id: string;
  _createdAt: string;
  _updatedAt: string;
  name: string;
  slug: { current: string };
  description?: string | null;
}

const sanity = createClient({
  projectId: process.env.SANITY_ID,
  dataset: process.env.SANITY_DATASET,
  apiVersion: `2024-01-01`,
  useCdn: false,
});

// Same filter as the former site query (src/features/jeu/api/getGames.ts),
// whose order decides which game kept a duplicated slug
const GAMES_QUERY = `*[_type == "game" && !(_id in path("drafts.**"))]{
  _id, _createdAt, _updatedAt, name, slug, idHltb, cover, rating,
  timeMainStory, timeMainExtras, timeCompletionists, isTranslated,
  firstReleaseDate,
  "genreIds": genres[]._ref,
  description[]{
    ...,
    markDefs[]{
      ...,
      _type == "internalLink" => { ..., "slug": @.reference->slug }
    }
  }
}`;

const HEADINGS: Record<string, string> = { h2: `##`, h3: `###`, h4: `####` };
const DECORATORS: Record<string, string> = { strong: `**`, em: `_` };
const LISTS: Record<string, string> = { bullet: `-`, number: `1.` };

function blockToMarkdown(block: Block, gameId: string) {
  if (block._type !== `block`) {
    throw new Error(`${gameId}: unsupported block type ${block._type}`);
  }
  const style = block.style ?? `normal`;
  if (style !== `normal` && !HEADINGS[style]) {
    throw new Error(`${gameId}: unsupported block style ${style}`);
  }
  const markDefs = new Map(
    (block.markDefs ?? []).map((def) => [def._key, def]),
  );
  const inline = (block.children ?? [])
    .map((span) => {
      if (span._type !== `span`) {
        throw new Error(`${gameId}: unsupported inline type ${span._type}`);
      }
      // Keep the spaces outside of the emphasis: "** bold**" is not bold
      const [, before, core, after] = /^(\s*)([\s\S]*?)(\s*)$/.exec(
        span.text ?? ``,
      )!;
      if (!core) return span.text ?? ``;
      let text = escapeMarkdown(core).replace(/\n/g, `  \n`);
      for (const mark of span.marks ?? []) {
        const def = markDefs.get(mark);
        if (def?._type === `internalLink`) {
          if (!def.slug?.current) {
            throw new Error(`${gameId}: internal link without a target`);
          }
          text = `[${text}](/jeu/${def.slug.current})`;
        } else if (DECORATORS[mark]) {
          text = `${DECORATORS[mark]}${text}${DECORATORS[mark]}`;
        } else {
          throw new Error(`${gameId}: unsupported mark ${def?._type ?? mark}`);
        }
      }
      return `${before}${text}${after}`;
    })
    .join(``)
    .trim();
  if (block.listItem) {
    if (!LISTS[block.listItem] || (block.level ?? 1) !== 1) {
      throw new Error(
        `${gameId}: unsupported list ${block.listItem} level ${block.level}`,
      );
    }
    return `${LISTS[block.listItem]} ${inline}`;
  }
  return style === `normal` ? inline : `${HEADINGS[style]} ${inline}`;
}

// Items of the same list are on consecutive lines, blocks are paragraphs
export const blocksToMarkdown = (blocks: Block[], gameId: string) =>
  blocks
    .map((block) => ({ block, markdown: blockToMarkdown(block, gameId) }))
    .filter(({ markdown }) => markdown)
    .map(({ block, markdown }, i, all) =>
      i === 0
        ? markdown
        : `${block.listItem && block.listItem === all[i - 1].block.listItem ? `\n` : `\n\n`}${markdown}`,
    )
    .join(``);

async function run() {
  const { db } = getDb();
  console.info(`Exporting the Sanity dataset…`);
  const [everything, games, genres] = await Promise.all([
    sanity.fetch<unknown[]>(`*`),
    sanity.fetch<SanityGame[]>(GAMES_QUERY),
    sanity.fetch<SanityGenre[]>(
      `*[_type == "genre" && !(_id in path("drafts.**"))]`,
    ),
  ]);
  mkdirSync(OUTPUT_DIR, { recursive: true });
  const exportFile = join(
    OUTPUT_DIR,
    `sanity-export-${new Date().toISOString().slice(0, 10)}.json`,
  );
  writeFileSync(exportFile, JSON.stringify(everything));
  console.info(`${everything.length} documents saved → ${exportFile}`);

  // Duplicated slugs: the site served the first published game in the query
  // order, the others are unpublished with a unique slug
  const owners = new Map<string, string>();
  for (const doc of games.filter((g) => g.isTranslated)) {
    if (!owners.has(doc.slug.current)) owners.set(doc.slug.current, doc._id);
  }
  const renamed: string[] = [];
  const gameRows = games.map((doc) => {
    const owner = owners.get(doc.slug.current);
    const duplicate = owner !== undefined && owner !== doc._id;
    if (duplicate) {
      renamed.push(
        `${doc.name} (${doc._id}) → ${doc.slug.current}-${doc.idHltb}, unpublished`,
      );
    }
    return {
      sanityId: doc._id,
      hltbId: doc.idHltb,
      name: doc.name,
      slug: duplicate ? `${doc.slug.current}-${doc.idHltb}` : doc.slug.current,
      cover: doc.cover ?? null,
      rating: doc.rating ?? null,
      timeMainStory: doc.timeMainStory ?? 0,
      timeMainExtras: doc.timeMainExtras ?? 0,
      timeCompletionists: doc.timeCompletionists ?? 0,
      descriptionMd: blocksToMarkdown(doc.description ?? [], doc._id),
      isTranslated: Boolean(doc.isTranslated),
      isPublished: Boolean(doc.isTranslated) && !duplicate,
      firstReleaseDate: doc.firstReleaseDate ?? null,
      createdAt: new Date(doc._createdAt),
      updatedAt: new Date(doc._updatedAt),
    };
  });

  await db.transaction(async (tx) => {
    const genreIds = new Map<string, number>();
    for (const doc of genres) {
      const values = {
        sanityId: doc._id,
        name: doc.name,
        slug: doc.slug.current,
        description: doc.description ?? null,
        createdAt: new Date(doc._createdAt),
        updatedAt: new Date(doc._updatedAt),
      };
      const [row] = await tx
        .insert(genre)
        .values(values)
        .onConflictDoUpdate({ target: genre.sanityId, set: values })
        .returning({ id: genre.id });
      genreIds.set(doc._id, row.id);
    }

    // Free the slugs first: a rerun may swap two of them
    await tx.update(game).set({ slug: rawSql`'tmp-' || ${game.id}` });
    const gameIds = new Map<string, number>();
    for (let i = 0; i < gameRows.length; i += 500) {
      const rows = await tx
        .insert(game)
        .values(gameRows.slice(i, i + 500))
        .onConflictDoUpdate({
          target: game.sanityId,
          set: {
            hltbId: excluded(game.hltbId),
            name: excluded(game.name),
            slug: excluded(game.slug),
            cover: excluded(game.cover),
            rating: excluded(game.rating),
            timeMainStory: excluded(game.timeMainStory),
            timeMainExtras: excluded(game.timeMainExtras),
            timeCompletionists: excluded(game.timeCompletionists),
            descriptionMd: excluded(game.descriptionMd),
            isTranslated: excluded(game.isTranslated),
            isPublished: excluded(game.isPublished),
            firstReleaseDate: excluded(game.firstReleaseDate),
            createdAt: excluded(game.createdAt),
            updatedAt: excluded(game.updatedAt),
          },
        })
        .returning({ id: game.id, sanityId: game.sanityId });
      for (const row of rows) gameIds.set(row.sanityId!, row.id);
    }

    await tx.delete(gameGenre);
    const links = games.flatMap((doc) =>
      [...new Set(doc.genreIds ?? [])].flatMap((ref) =>
        genreIds.has(ref)
          ? [{ gameId: gameIds.get(doc._id)!, genreId: genreIds.get(ref)! }]
          : [],
      ),
    );
    for (let i = 0; i < links.length; i += 1000) {
      await tx.insert(gameGenre).values(links.slice(i, i + 1000));
    }
    console.info(
      `Postgres: ${genres.length} genres, ${gameRows.length} games (${gameRows.filter((r) => r.isPublished).length} published), ${links.length} genre links`,
    );
  });
  for (const line of renamed) console.info(`  slug: ${line}`);
}

run()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
