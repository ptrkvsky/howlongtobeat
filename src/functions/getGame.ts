import sanity from '@/lib/sanity/sanityClient';
import { SanityGame } from '@/types/sanity/SanityGame';

export async function getGame(slug: string, debug = false) {
  // Load genres from Sanity
  const query = `*[_type == "game" && isTranslated == true &&  slug.current == "${slug}"][0]{
    ...,
    description[]{
      ...,
      markDefs[]{
        ...,
        _type == "internalLink" => {
          ...,
          "slug": @.reference->slug,
        }
      }
    }
  }`;
  const params = {};

  // Get games from Sanity
  const game: SanityGame = await sanity.instance.fetch(query, params);

  if (debug) {
    console.log(game, query);
  }

  return game;
}
