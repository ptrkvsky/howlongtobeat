import apolloClient from '@/lib/apollo/apolloClient';
import { SanityGenre } from '@/types/sanity/SanityGenre';
import { gql } from '@apollo/client';

export async function getGamesByGenre(genreId: string, debug = true) {
  const {
    data: { allGame },
  } = await apolloClient.instance.query({
    query: gql`
      query AllGamesByGenre($genreId: ID!) {
        allGame(
          where: { isTranslated: { eq: true }, _: { references: $genreId } }
        ) {
          _id
          name
          isTranslated
          slug {
            current
          }
        }
      }
    `,
    variables: {
      genreId: genreId,
    },
  });

  return allGame as SanityGenre[];
}
