import sanity from '@/lib/sanity/sanityClient';
import type { SanityGame, SanityGameSummary } from '@/types/sanity/SanityGame';

// Only the fields rendered by the site: the whole catalog is held in memory
// during the build.
const query = `*[_type == "game" && isTranslated == true]{
  _id,
  name,
  slug,
  cover,
  rating,
  idHltb,
  timeMainStory,
  timeMainExtras,
  timeCompletionists,
  "genreIds": genres[]._ref,
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

// Fields needed to list a game
export function toGameSummary({
  _id,
  name,
  cover,
  slug,
}: SanityGame): SanityGameSummary {
  return { _id, name, cover: cover ?? null, slug: { current: slug.current } };
}
