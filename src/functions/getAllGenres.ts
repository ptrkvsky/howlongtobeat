import { asc, sql } from 'drizzle-orm';
import { getDb } from '@/db/client';
import { genre } from '@/db/schema';
import type { Genre } from '@/types/Genre';

let genresPromise: Promise<Genre[]> | undefined;

export function getAllGenres() {
  genresPromise ??= getDb()
    .db.select({ id: genre.id, name: genre.name, slug: genre.slug })
    .from(genre)
    .orderBy(
      asc(genre.name),
      // Same order as Sanity for genres with the same name
      sql`${genre.sanityId} collate "C"`,
    );

  return genresPromise;
}
