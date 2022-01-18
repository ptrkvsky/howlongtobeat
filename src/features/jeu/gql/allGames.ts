import { gql } from '@apollo/client';

export const ALL_GAMES = gql`
  query GetAllGames {
    allGame(where: { isTranslated: { eq: true } }) {
      _id
      name
      slug {
        current
      }
      descriptionRaw
      rating
      cover
      timeMainStory
      timeMainExtras
      timeCompletionists
    }
  }
`;
