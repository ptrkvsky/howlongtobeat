import { gql } from '@apollo/client';

export const GAME_BY_SLUG = gql`
  query GameBySlug($gameSlug: String!) {
    allGame(where: { slug: { current: { eq: $gameSlug } } }) {
      _id
      name
      slug {
        current
      }
      idHltb
      descriptionRaw
      rating
      cover
      timeMainStory
      timeMainExtras
      timeCompletionists
    }
  }
`;
