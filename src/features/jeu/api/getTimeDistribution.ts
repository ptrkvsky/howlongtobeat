import { timeBins } from '@/features/jeu/utils/timeDistribution';
import { getGames } from './getGames';

// Main story times of the whole catalog, binned once per build worker: every
// game page shows where it sits
let distributionPromise: ReturnType<typeof fetchDistribution> | undefined;

async function fetchDistribution() {
  const games = await getGames();
  return timeBins(games.map((game) => game.timeMainStory));
}

export function getTimeDistribution() {
  distributionPromise ??= fetchDistribution();
  return distributionPromise;
}
