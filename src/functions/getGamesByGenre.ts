import { getGames, toGameSummary } from '@/features/jeu/api';
import { SanityGameSummary } from '@/types/sanity/SanityGame';

export async function getGamesByGenre(
  genreId: string,
): Promise<SanityGameSummary[]> {
  const games = await getGames();

  return games
    .filter((game) =>
      game.genres?.some((genre: { _ref: string }) => genre._ref === genreId),
    )
    .map(toGameSummary);
}
