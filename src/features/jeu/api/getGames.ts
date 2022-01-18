import apolloClient from '@/lib/apollo/apolloClient';
import { SanityGame } from '@/types/sanity/SanityGame';
import { ALL_GAMES } from '../gql';

export async function getGames() {
  try {
    const {
      data: { allGame },
    } = await apolloClient.instance.query({
      query: ALL_GAMES,
    });

    // Get games from Sanity
    const games: SanityGame[] = allGame;
    return games;
  } catch (error) {
    console.error(error);
  }
}
