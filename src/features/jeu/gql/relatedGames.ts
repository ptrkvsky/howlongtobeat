import { gql } from '@apollo/client';

export const RELATED_GAMES = gql`
  query RelatedGames($idHltb: Float!) {
    allGame(
      where: {
        isTranslated: { eq: true }
        rating: { gte: 80 }
        idHltb: { gte: $idHltb }
      }
      limit: 99
    ) {
      _id
      name
      cover
      slug {
        current
      }
    }
  }
`;
