import apolloClient from '@/lib/apollo/apolloClient';
import { SanityGame } from '@/types/sanity/SanityGame';
import { RELATED_GAMES } from '../gql';

export async function getRelatedGames(idHltb: number) {
  try {
    const {
      data: { allGame },
    } = await apolloClient.instance.query({
      query: RELATED_GAMES,
      variables: {
        idHltb: idHltb,
      },
    });

    const games: SanityGame[] = allGame;
    return games;
  } catch (error) {
    console.error(error);
  }
}
