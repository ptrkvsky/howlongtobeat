import sanity from '@/lib/sanity/sanityClient';
import { SanityGame } from '@/types/sanity/SanityGame';

/**
 * Return 20 games relative to the id
 * @param gameId
 * @returns
 */
export async function getRelatedGames(gameId: number, debug = false) {
  // Load genres from Sanity
  const query = `*[_type == "game" && isTranslated == true  && rating >= 80 && idHltb >= ${
    gameId + 20
  }] | order(rating desc) [0..9] [0...99]`;
  const params = {};

  // Get games from Sanity
  const relatedGames: SanityGame[] = await sanity.instance.fetch(query, params);

  if (debug) {
    console.log(relatedGames, query);
  }

  return relatedGames;
}
