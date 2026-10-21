/**
 * News written by scripts/publish-news.ts, read at build time by the /actus
 * pages.
 */
import { desc, eq } from 'drizzle-orm';
import type { AuthorSlug } from '@/config/authors';
import type { NewsArticle } from '@/config/news';
import { getDb } from '@/db/client';
import { newsArticle } from '@/db/schema';
import { getGames } from '@/features/jeu/api';

async function fetchNewsArticles(): Promise<NewsArticle[]> {
  const { db } = getDb();
  const [rows, games] = await Promise.all([
    db
      .select()
      .from(newsArticle)
      .where(eq(newsArticle.isPublished, true))
      .orderBy(desc(newsArticle.publishedAt), desc(newsArticle.id)),
    getGames(),
  ]);
  // Only published games have a page to link to
  const byId = new Map(games.map((game) => [game.id, game]));

  return rows.map((row) => {
    const game = row.gameId ? byId.get(row.gameId) : undefined;
    return {
      slug: row.slug,
      date: row.publishedAt.toISOString(),
      updatedAt: row.updatedAt.toISOString(),
      category: row.category,
      author: row.author,
      image: row.image,
      title: row.title,
      excerpt: row.excerpt,
      game: game ? { name: game.name, slug: game.slug } : null,
      content: row.contentHtml,
    };
  });
}

// Published articles, latest first: fetched once per build worker
let newsPromise: Promise<NewsArticle[]> | undefined;

export function getNewsArticles() {
  newsPromise ??= fetchNewsArticles();
  return newsPromise;
}

// Articles of an author page, from the same build cache
export async function getNewsArticlesByAuthor(slug: AuthorSlug) {
  return (await getNewsArticles()).filter((article) => article.author === slug);
}
