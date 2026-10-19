import { getGames, toGameSummary } from '@/features/jeu/api';
import type { GameSummary } from '@/types/Game';

// Most popular first, by name for a stable order between builds
export async function getGamesByGenre(genreId: number): Promise<GameSummary[]> {
  const games = await getGames();

  return games
    .filter((game) => game.genreIds.includes(genreId))
    .sort(
      (a, b) =>
        b.popularity - a.popularity || a.name.localeCompare(b.name, `fr`),
    )
    .map(toGameSummary);
}
