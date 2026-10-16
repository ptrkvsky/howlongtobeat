import { getGames } from './getGames';

export async function getGame(slug: string) {
  const games = await getGames();

  return games.find((game) => game.slug.current === slug);
}
