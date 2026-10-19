import type { Game, GameSummary } from '@/types/Game';
import { getGames, toGameSummary } from './getGames';

/**
 * Well rated games (>= 80) whose HLTB id is above the given one
 */
export async function getRelatedGames(game: Game): Promise<GameSummary[]> {
  const games = await getGames();
  const minIdHltb = game.hltbId + 20;

  return games
    .filter(
      (relatedGame) =>
        (relatedGame.rating ?? 0) >= 80 && relatedGame.hltbId >= minIdHltb,
    )
    .sort((a, b) => a.hltbId - b.hltbId)
    .slice(0, 12)
    .map(toGameSummary);
}
