import { gql } from '@apollo/client';

export const GENRE_BY_SLUG = gql`
  query GenreBySlug($genreSlug: String!) {
    allGenre(where: { slug: { current: { eq: $genreSlug } } }) {
      _id
      name
      slug {
        current
      }
    }
  }
`;
