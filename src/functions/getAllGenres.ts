import sanity from '@/lib/sanity/sanityClient';
import { SanityGenre } from '@/types/sanity/SanityGenre';

let genresPromise: Promise<SanityGenre[]> | undefined;

export function getAllGenres() {
  if (!genresPromise) {
    genresPromise = sanity.instance.fetch<SanityGenre[]>(
      `*[_type == "genre"]{ _id, name, slug } | order(name asc)`,
    );
  }

  return genresPromise;
}
