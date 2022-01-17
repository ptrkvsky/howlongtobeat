import { gql } from '@apollo/client';
import apolloClient from '@/lib/apollo/apolloClient';
import { SanityGenre } from '@/types/sanity/SanityGenre';

export async function getAllGenres() {
  const {
    data: { allGenre },
  } = await apolloClient.instance.query({
    query: gql`
      query GetAllGenres {
        allGenre {
          _id
          name
          slug {
            current
          }
        }
      }
    `,
  });

  return allGenre as SanityGenre[];
}
