import type { Game, GameSummary } from '@/types/Game';
import { getGames, toGameSummary } from './getGames';

const COUNT = 12;

// 0 for the same main story time, 1 for twice (or half) as long
const timeDistance = (a: Game, b: Game) =>
  a.timeMainStory > 0 && b.timeMainStory > 0
    ? Math.abs(Math.log2(a.timeMainStory / b.timeMainStory))
    : Infinity;

/**
 * Well rated games (>= 80) sharing the most genres with the given one, then
 * with the closest main story time. Completed, if needed, by the following
 * HLTB ids (the former rule)
 */
export async function getRelatedGames(game: Game): Promise<GameSummary[]> {
  const games = await getGames();
  const candidates = games.filter(
    (relatedGame) =>
      relatedGame.id !== game.id && (relatedGame.rating ?? 0) >= 80,
  );
  const sharedGenres = (relatedGame: Game) =>
    relatedGame.genreIds.filter((id) => game.genreIds.includes(id)).length;

  const similar = candidates
    .map((relatedGame) => ({
      relatedGame,
      shared: sharedGenres(relatedGame),
      distance: timeDistance(game, relatedGame),
    }))
    .filter(({ shared }) => shared > 0)
    .sort((a, b) => b.shared - a.shared || a.distance - b.distance)
    .slice(0, COUNT)
    .map(({ relatedGame }) => relatedGame);

  const fallback = candidates
    .filter(
      (relatedGame) =>
        relatedGame.hltbId >= game.hltbId + 20 &&
        !similar.includes(relatedGame),
    )
    .sort((a, b) => a.hltbId - b.hltbId);

  return [...similar, ...fallback].slice(0, COUNT).map(toGameSummary);
}
