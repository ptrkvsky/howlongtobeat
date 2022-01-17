import apolloClient from '@/lib/apollo/apolloClient';
import sanity from '@/lib/sanity/sanityClient';
import { SanityGenre } from '@/types/sanity/SanityGenre';
import { gql } from '@apollo/client';

export async function getGenre(slug: string, debug = false) {
  const {
    data: { allGenre },
  } = await apolloClient.instance.query({
    query: gql`
      query GenreBySlug($genreSlug: String!) {
        allGenre(where: { slug: { current: { eq: $genreSlug } } }) {
          _id
          name
          slug {
            current
          }
        }
      }
    `,
    variables: {
      genreSlug: slug,
    },
  });

  return allGenre[0] as SanityGenre;
}
