import type { SanityGame, SanityGameSummary } from '@/types/sanity/SanityGame';
import { getGames, toGameSummary } from './getGames';

/**
 * Well rated games (>= 80) whose HLTB id is above the given one
 */
export async function getRelatedGames(
  game: SanityGame,
): Promise<SanityGameSummary[]> {
  const games = await getGames();
  const minIdHltb = game.idHltb + 20;

  return games
    .filter(
      (relatedGame) =>
        relatedGame.rating >= 80 && relatedGame.idHltb >= minIdHltb,
    )
    .sort((a, b) => a.idHltb - b.idHltb)
    .slice(0, 12)
    .map(toGameSummary);
}
