import { Game } from '@prisma/client';

export function getGenresFromGames(games: Game[]) {
  const genres: number[] = [];
  games.forEach((game) => game.genres.forEach((genre) => genres.push(genre)));
  const genreSansDoublon = [...new Set(genres)];
  return genreSansDoublon;
}
