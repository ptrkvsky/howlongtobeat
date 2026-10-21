/**
 * One-off migration: copies the news articles published on Vercel Blob (store
 * game-over-news, before docs/actus.md) to the news_article table. Safe to
 * rerun: an article already in the table is left as is.
 *
 *   pnpm tsx scripts/import-news-from-blob.ts --dry-run   count, no insert
 *   pnpm tsx scripts/import-news-from-blob.ts
 *
 * Only the rewritten articles are kept (slug ending with the source key):
 * the earlier translations of the feed are left out. The source URL was not
 * stored in the files: it is left empty.
 *
 * Env (.env.local): BLOB_READ_WRITE_TOKEN, DATABASE_URL
 */
import { existsSync } from 'node:fs';
import { parseArgs } from 'node:util';
import { list } from '@vercel/blob';
import { inArray } from 'drizzle-orm';
import {
  NEWS_CATEGORIES,
  type NewsCategory,
  type NewsImage,
} from '../src/config/news';
import { closeDb, getDb } from '../src/db/client';
import { game, newsArticle } from '../src/db/schema';

for (const file of [`.env.local`, `.env`]) {
  if (existsSync(file)) process.loadEnvFile(file);
}

const PREFIX = `news/articles/`;

// Article file, as written by the former scripts/publish-news.ts
interface BlobArticle {
  slug: string;
  date: string;
  category: NewsCategory;
  image: NewsImage;
  title: string;
  excerpt?: string;
  game: { name: string; slug: string } | null;
  content: string;
}

async function main() {
  const { values } = parseArgs({
    options: { 'dry-run': { type: `boolean`, default: false } },
  });
  if (!process.env.BLOB_READ_WRITE_TOKEN) {
    throw new Error(`Missing BLOB_READ_WRITE_TOKEN`);
  }

  // Several files for a key (rewritten title): the latest one
  const blobs = new Map<string, { url: string; uploadedAt: Date }>();
  let cursor: string | undefined;
  let total = 0;
  do {
    const page = await list({ prefix: PREFIX, cursor });
    for (const blob of page.blobs) {
      total++;
      const key = blob.pathname.match(/-([0-9a-f]{8})\.json$/)?.[1];
      if (!key) continue;
      const previous = blobs.get(key);
      if (!previous || previous.uploadedAt < blob.uploadedAt) {
        blobs.set(key, blob);
      }
    }
    cursor = page.cursor;
  } while (cursor);

  const articles = (
    await Promise.all(
      [...blobs].map(async ([key, blob]) => {
        const response = await fetch(blob.url);
        if (!response.ok)
          throw new Error(`HTTP ${response.status} on ${blob.url}`);
        return { key, article: (await response.json()) as BlobArticle };
      }),
    )
  ).filter(
    ({ article }) =>
      article.excerpt && NEWS_CATEGORIES.includes(article.category),
  );

  const { db } = getDb();
  const gameSlugs = articles.flatMap(({ article }) =>
    article.game ? [article.game.slug] : [],
  );
  const games = gameSlugs.length
    ? await db
        .select({ id: game.id, slug: game.slug })
        .from(game)
        .where(inArray(game.slug, gameSlugs))
    : [];
  const gameIds = new Map(games.map((row) => [row.slug, row.id]));

  const rows = articles.map(({ key, article }) => ({
    slug: article.slug,
    sourceKey: key,
    sourceUrl: ``,
    title: article.title,
    excerpt: article.excerpt!,
    contentHtml: article.content,
    category: article.category,
    image: article.image,
    gameId: article.game ? (gameIds.get(article.game.slug) ?? null) : null,
    publishedAt: new Date(article.date),
  }));
  console.log(
    `${total} files, ${rows.length} rewritten articles to import, ${rows.filter((row) => row.gameId).length} linked to a game`,
  );
  for (const row of rows.toSorted(
    (a, b) => b.publishedAt.getTime() - a.publishedAt.getTime(),
  )) {
    console.log(`  ${row.publishedAt.toISOString()} ${row.slug}`);
  }
  if (values[`dry-run`] || rows.length === 0) return;

  const inserted = await db
    .insert(newsArticle)
    .values(rows)
    .onConflictDoNothing()
    .returning({ id: newsArticle.id });
  console.log(`${inserted.length} articles inserted`);
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(closeDb);
