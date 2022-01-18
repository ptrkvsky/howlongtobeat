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

// GraphQL Version
//import apolloClient from '@/lib/apollo/apolloClient';
// import { SanityGame } from '@/types/sanity/SanityGame';
// import { GAME_BY_SLUG } from '../gql';

// export async function getGame(slug: string, debug = false) {
//   const {
//     data: { allGame },
//   } = await apolloClient.instance.query({
//     query: GAME_BY_SLUG,
//     variables: {
//       gameSlug: slug,
//     },
//   });

//   const game: SanityGame = allGame[0];

//   if (debug) {
//     console.log(game);
//   }

//   return game;
// }
