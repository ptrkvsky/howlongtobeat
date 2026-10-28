/**
 * The rule of "D'autres jeux à terminer" before the recommendations (commit
 * 624fe1e), kept as is to evaluate the new one against it
 * (scripts/evaluate-recommendations.ts). Not used by the site.
 */
import type { Game } from '../../src/types/Game';
import { getGames } from '../../src/features/jeu/api/getGames';

const COUNT = 12;

// 0 for the same main story time, 1 for twice (or half) as long
const timeDistance = (a: Game, b: Game) =>
  a.timeMainStory > 0 && b.timeMainStory > 0
    ? Math.abs(Math.log2(a.timeMainStory / b.timeMainStory))
    : Infinity;

interface Index {
  byGenre: Map<number, Game[]>;
  // Sorted by HLTB id, for the fallback
  byHltbId: Game[];
  // Position in the catalog order, to break ties as the former full sort did
  position: Map<Game, number>;
}

// Built once per build worker: every game page reads it
let indexPromise: Promise<Index> | undefined;

function getIndex() {
  indexPromise ??= getGames().then((games) => {
    const candidates = games.filter((game) => (game.rating ?? 0) >= 80);
    const byGenre = new Map<number, Game[]>();
    for (const game of candidates) {
      for (const genreId of game.genreIds) {
        const list = byGenre.get(genreId);
        if (list) list.push(game);
        else byGenre.set(genreId, [game]);
      }
    }
    const byHltbId = [...candidates].sort((a, b) => a.hltbId - b.hltbId);
    const position = new Map(candidates.map((game, i) => [game, i]));
    return { byGenre, byHltbId, position };
  });
  return indexPromise;
}

// Index of the first game whose HLTB id is >= hltbId
function lowerBound(games: Game[], hltbId: number) {
  let low = 0;
  let high = games.length;
  while (low < high) {
    const middle = (low + high) >> 1;
    if (games[middle].hltbId < hltbId) low = middle + 1;
    else high = middle;
  }
  return low;
}

/**
 * Well rated games (>= 80) sharing the most genres with the given one, then
 * with the closest main story time. Completed, if needed, by the following
 * HLTB ids (the former rule)
 */
export async function legacyRelatedGames(game: Game): Promise<Game[]> {
  const { byGenre, byHltbId, position } = await getIndex();

  const shared = new Map<Game, number>();
  for (const genreId of new Set(game.genreIds)) {
    for (const relatedGame of byGenre.get(genreId) ?? []) {
      if (relatedGame.id === game.id) continue;
      shared.set(relatedGame, (shared.get(relatedGame) ?? 0) + 1);
    }
  }

  const similar = [...shared]
    .map(([relatedGame, count]) => ({
      relatedGame,
      shared: count,
      distance: timeDistance(game, relatedGame),
    }))
    .sort(
      (a, b) =>
        b.shared - a.shared ||
        a.distance - b.distance ||
        position.get(a.relatedGame)! - position.get(b.relatedGame)!,
    )
    .slice(0, COUNT)
    .map(({ relatedGame }) => relatedGame);

  const related = [...similar];
  for (
    let i = lowerBound(byHltbId, game.hltbId + 20);
    i < byHltbId.length && related.length < COUNT;
    i++
  ) {
    const relatedGame = byHltbId[i];
    if (relatedGame.id !== game.id && !similar.includes(relatedGame)) {
      related.push(relatedGame);
    }
  }

  return related;
}
