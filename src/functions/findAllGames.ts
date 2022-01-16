import sanity from '@/lib/sanity/sanityClient';
import { SanityGame } from '@/types/sanity/SanityGame';

export async function findAllGames() {
  // Load genres from Sanity
  const query = `*[_type == "game" && isTranslated == true]`;
  const params = {};

  // Get games from Sanity
  const games: SanityGame[] = await sanity.instance.fetch(query, params);

  return games;
}
