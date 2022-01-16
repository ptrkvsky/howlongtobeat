import sanity from '@/lib/sanity/sanityClient';
import { SanityGenre } from '@/types/sanity/SanityGenre';

export async function getGenre(slug: string, debug = false) {
  // Load genres from Sanity
  const query = `*[_type == "genre" && slug.current == "${slug}"][0]`;
  const params = {};

  // Get genres from Sanity
  const genre: SanityGenre = await sanity.instance.fetch(query, params);

  if (debug) {
    console.log(genre, query);
  }

  return genre;
}
