import sanity from '@/lib/sanity/sanityClient';
import { SanityGame } from '@/types/sanity/SanityGame';
import { SanityGenre } from '@/types/sanity/SanityGenre';

export async function getGamesByGenre(genre: SanityGenre) {
  const genreId = `genre-${genre.idIgdb}-${genre.slug.current}`;

  const query = `*[_type == 'game' && references('${genreId}') && isTranslated == true]`;
  const params = {};

  // Get games from Sanity
  const games: SanityGame[] = await sanity.instance.fetch(query, params);

  return games;
}
