import { getGames, toGameSummary } from '@/features/jeu/api';
import type { GameSummary } from '@/types/Game';

export async function getGamesByGenre(genreId: number): Promise<GameSummary[]> {
  const games = await getGames();

  return games
    .filter((game) => game.genreIds.includes(genreId))
    .map(toGameSummary);
}
