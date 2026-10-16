import sanity from '@/lib/sanity/sanityClient';
import { SanityGame, SanityGameSummary } from '@/types/sanity/SanityGame';

const query = `*[_type == "game" && isTranslated == true]{
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

// Every page is generated at build time: fetch the whole catalog once
// per build worker instead of one Sanity request per page.
let gamesPromise: Promise<SanityGame[]> | undefined;

export function getGames() {
  if (!gamesPromise) {
    gamesPromise = sanity.instance.fetch<SanityGame[]>(query);
  }

  return gamesPromise;
}

// Fields needed to list a game (props must be JSON serializable: no undefined)
export function toGameSummary({
  _id,
  name,
  cover,
  slug,
}: SanityGame): SanityGameSummary {
  return { _id, name, cover: cover ?? null, slug: { current: slug.current } };
}
